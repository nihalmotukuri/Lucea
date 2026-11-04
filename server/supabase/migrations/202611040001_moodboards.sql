create table if not exists public.moodboards (
    id uuid not null,
    user_id uuid not null references auth.users (id) on delete cascade,
    title text not null check (char_length(title) between 1 and 60),
    created_at timestamptz not null default now(),
    media jsonb not null default '[]'::jsonb check (jsonb_typeof(media) = 'array'),
    primary key (user_id, id)
);

create index if not exists moodboards_user_created_at_idx
    on public.moodboards (user_id, created_at desc);

alter table public.moodboards enable row level security;

create policy "Users can read their own moodboards"
    on public.moodboards for select
    using ((select auth.uid()) = user_id);

create policy "Users can create their own moodboards"
    on public.moodboards for insert
    with check ((select auth.uid()) = user_id);

create policy "Users can update their own moodboards"
    on public.moodboards for update
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Users can delete their own moodboards"
    on public.moodboards for delete
    using ((select auth.uid()) = user_id);
