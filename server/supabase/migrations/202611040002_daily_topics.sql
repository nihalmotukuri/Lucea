create table if not exists public.daily_topics (
    id boolean primary key default true check (id),
    topics jsonb not null check (jsonb_typeof(topics) = 'array'),
    updated_at timestamptz not null default now()
);

alter table public.daily_topics enable row level security;

drop policy if exists "Daily topics are readable by everyone" on public.daily_topics;
create policy "Daily topics are readable by everyone"
    on public.daily_topics for select
    using (true);

grant select on public.daily_topics to anon, authenticated;

insert into public.daily_topics (id, topics)
values (
    true,
    '[
      {"slug":"minimalist","title":"Minimalist"},
      {"slug":"wallpapers","title":"Wallpapers"},
      {"slug":"3d-renders","title":"3D Renders"},
      {"slug":"travel","title":"Travel"},
      {"slug":"nature","title":"Nature"},
      {"slug":"street-photography","title":"Street Photography"},
      {"slug":"film","title":"Film"},
      {"slug":"architecture","title":"Architecture"},
      {"slug":"experimental","title":"Experimental"},
      {"slug":"animals","title":"Animals"}
    ]'::jsonb
)
on conflict (id) do nothing;

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select cron.unschedule(jobid)
from cron.job
where jobname = 'refresh-daily-topics';

select cron.schedule(
    'refresh-daily-topics',
    '0 0 * * *',
    $job$
    select net.http_post(
        url := (
            select rtrim(decrypted_secret, '/')
            from vault.decrypted_secrets
            where name = 'project_url'
        ) || '/functions/v1/refresh-daily-topics',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-cron-secret', (
                select decrypted_secret
                from vault.decrypted_secrets
                where name = 'daily_topics_cron_secret'
            )
        ),
        body := '{}'::jsonb
    );
    $job$
);
