-- My Agent — initial Supabase schema
-- Run in Supabase Dashboard → SQL Editor (or: supabase db push)

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users → disk tenant id)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  tenant_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.profiles.tenant_id is
  'Folder name under data/users/{tenant_id}/ on app server';

create index if not exists profiles_email_idx on public.profiles (email);

-- ---------------------------------------------------------------------------
-- Holdings snapshots (optional import / history)
-- ---------------------------------------------------------------------------
create table if not exists public.holdings_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null default 'manual',
  holdings_md text,
  holdings_json jsonb,
  source_path text,
  created_at timestamptz not null default now()
);

create index if not exists holdings_snapshots_user_id_idx
  on public.holdings_snapshots (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Analysis jobs (async framework runs)
-- ---------------------------------------------------------------------------
create type public.analysis_job_status as enum (
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled'
);

create table if not exists public.analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.analysis_job_status not null default 'pending',
  ticker text,
  sector text,
  stock_name text,
  query text not null,
  result_path text,
  error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists analysis_jobs_user_status_idx
  on public.analysis_jobs (user_id, status, created_at desc);

-- ---------------------------------------------------------------------------
-- Chat messages (Ask Agent history)
-- ---------------------------------------------------------------------------
create type public.chat_role as enum ('user', 'agent', 'system');

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_id uuid not null default gen_random_uuid(),
  role public.chat_role not null,
  content text not null,
  ticker text,
  sector text,
  stock_name text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_user_session_idx
  on public.chat_messages (user_id, session_id, created_at);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists analysis_jobs_updated_at on public.analysis_jobs;
create trigger analysis_jobs_updated_at
  before update on public.analysis_jobs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create profile on signup (tenant_id = user uuid)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, tenant_id)
  values (
    new.id,
    coalesce(new.email, ''),
    new.id::text
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.holdings_snapshots enable row level security;
alter table public.analysis_jobs enable row level security;
alter table public.chat_messages enable row level security;

-- profiles
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- holdings_snapshots
create policy "Users read own holdings snapshots"
  on public.holdings_snapshots for select
  using (auth.uid() = user_id);

create policy "Users insert own holdings snapshots"
  on public.holdings_snapshots for insert
  with check (auth.uid() = user_id);

-- analysis_jobs
create policy "Users read own analysis jobs"
  on public.analysis_jobs for select
  using (auth.uid() = user_id);

create policy "Users insert own analysis jobs"
  on public.analysis_jobs for insert
  with check (auth.uid() = user_id);

create policy "Users update own analysis jobs"
  on public.analysis_jobs for update
  using (auth.uid() = user_id);

-- chat_messages
create policy "Users read own chat messages"
  on public.chat_messages for select
  using (auth.uid() = user_id);

create policy "Users insert own chat messages"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);
