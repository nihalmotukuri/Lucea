create table if not exists public.public_profiles (
    user_id uuid primary key references auth.users (id) on delete cascade,
    handle text not null check (handle ~ '^[a-z0-9_]{3,30}$'),
    created_at timestamptz not null default now()
);

create unique index if not exists public_profiles_handle_idx
    on public.public_profiles (handle);

alter table public.public_profiles enable row level security;

create policy "Public profiles are readable by everyone"
    on public.public_profiles for select
    using (true);

create policy "Users can create their own public profile"
    on public.public_profiles for insert
    with check ((select auth.uid()) = user_id);

create policy "Users can update their own public profile"
    on public.public_profiles for update
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

alter table public.moodboards
    add column if not exists is_public boolean not null default false;

create index if not exists moodboards_public_created_at_idx
    on public.moodboards (created_at desc)
    where is_public = true;
