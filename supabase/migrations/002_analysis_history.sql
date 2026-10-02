-- Analysis Log — user-specific Ask Agent history (per user, not shared)
-- Run after 001_initial_schema.sql

create type public.market_cap_bucket as enum (
  'large',
  'mid',
  'small',
  'micro',
  'unknown'
);

create table if not exists public.analysis_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_id uuid,
  query text not null,
  answer text not null,
  ticker text,
  stock_name text,
  sector text not null default 'General',
  market_cap_bucket public.market_cap_bucket not null default 'unknown',
  market_cap_cr numeric,
  verdict text,
  agent_mode text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analysis_history_user_created_idx
  on public.analysis_history (user_id, created_at desc);

create index if not exists analysis_history_user_sector_idx
  on public.analysis_history (user_id, sector, created_at desc);

create index if not exists analysis_history_user_ticker_idx
  on public.analysis_history (user_id, ticker, created_at desc);

alter table public.analysis_history enable row level security;

create policy "Users read own analysis history"
  on public.analysis_history for select
  using (auth.uid() = user_id);

create policy "Users insert own analysis history"
  on public.analysis_history for insert
  with check (auth.uid() = user_id);

create policy "Users delete own analysis history"
  on public.analysis_history for delete
  using (auth.uid() = user_id);

comment on table public.analysis_history is
  'Ask Agent Q&A captured per user — Analysis Log tab (Sector → cap bucket → history)';
