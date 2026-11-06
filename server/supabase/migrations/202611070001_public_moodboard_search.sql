create extension if not exists pg_trgm with schema extensions;

create index if not exists moodboards_public_title_trgm_idx
    on public.moodboards using gin (
        lower(regexp_replace(title, '[^[:alnum:]]+', ' ', 'g')) extensions.gin_trgm_ops
    )
    where is_public = true;

create or replace function public.search_public_moodboards(search_query text)
returns table (
    id uuid,
    user_id uuid,
    title text,
    created_at timestamptz,
    media jsonb,
    media_count integer,
    handle text,
    relevance double precision
)
language plpgsql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
declare
    normalized_query text := lower(regexp_replace(coalesce(search_query, ''), '[^[:alnum:]]+', ' ', 'g'));
begin
    if char_length(normalized_query) not between 2 and 60 then
        return;
    end if;

    return query
    with query_input as (
        select normalized_query as normalized
    ),
    query_tokens as (
        select
            normalized,
            coalesce(
                array_agg(token) filter (
                    where char_length(token) >= 2
                            and token not in (
                                'and', 'for', 'the', 'with', 'from', 'into', 'your', 'you',
                                'in', 'on', 'at', 'to', 'of', 'by', 'or', 'a', 'an'
                            )
                ),
                array[]::text[]
            ) as tokens
        from query_input
        cross join lateral unnest(regexp_split_to_array(normalized, '\s+')) as token_list(token)
        group by normalized
    ),
    board_text as (
        select
            board.id,
            board.user_id,
            board.title,
            board.created_at,
            board.media,
            profile.handle,
            lower(regexp_replace(
                board.title || ' ' || coalesce(media_text.text, ''),
                '[^[:alnum:]]+',
                ' ',
                'g'
            )) as searchable,
            lower(regexp_replace(board.title, '[^[:alnum:]]+', ' ', 'g')) as normalized_title
        from public.moodboards as board
        join public.public_profiles as profile on profile.user_id = board.user_id
        left join lateral (
            select string_agg(
                media_item.item->>'alt',
                ' '
            ) as text
            from jsonb_array_elements(board.media) as media_item(item)
        ) as media_text on true
        where board.is_public = true
    ),
    scored_boards as (
        select
            board_text.*,
            (
                similarity(board_text.normalized_title, query_tokens.normalized) * 4
                + case
                    when position(query_tokens.normalized in board_text.searchable) > 0 then 1
                    else 0
                end
                + (
                    select count(*) * 2.0
                    from unnest(query_tokens.tokens) as title_token(token)
                    where token = any(regexp_split_to_array(board_text.normalized_title, '\s+'))
                )
                + (
                    select count(*) * 0.6
                    from unnest(query_tokens.tokens) as body_token(token)
                    where token = any(regexp_split_to_array(board_text.searchable, '\s+'))
                        and not (token = any(regexp_split_to_array(board_text.normalized_title, '\s+')))
                )
            )::double precision as score,
            query_tokens.normalized as normalized_query,
            query_tokens.tokens
        from board_text
        cross join query_tokens
    )
    select
        scored_boards.id,
        scored_boards.user_id,
        scored_boards.title,
        scored_boards.created_at,
        coalesce((
            select jsonb_agg(preview.item order by preview.ordinality)
            from (
                select media_item.item, media_item.ordinality
                from jsonb_array_elements(scored_boards.media) with ordinality as media_item(item, ordinality)
                order by ordinality
                limit 3
            ) as preview
        ), '[]'::jsonb) as media,
        jsonb_array_length(scored_boards.media)::integer as media_count,
        scored_boards.handle,
        scored_boards.score as relevance
    from scored_boards
    where char_length(scored_boards.normalized_query) between 2 and 60
        and cardinality(scored_boards.tokens) > 0
        and (
            select count(*)
            from unnest(scored_boards.tokens) as query_token(token)
            where token = any(regexp_split_to_array(scored_boards.searchable, '\s+'))
        ) >= case
            when cardinality(scored_boards.tokens) = 1 then 1
            else greatest(2, ceil(cardinality(scored_boards.tokens) * 0.5)::integer)
        end
        and exists (
            select 1
            from unnest(scored_boards.tokens) as query_token(token)
            where token = any(regexp_split_to_array(scored_boards.normalized_title, '\s+'))
        )
    order by scored_boards.score desc, scored_boards.created_at desc
    limit 12;
end;
$$;

revoke all on function public.search_public_moodboards(text) from public, anon, authenticated;
grant execute on function public.search_public_moodboards(text) to anon, authenticated, service_role;
