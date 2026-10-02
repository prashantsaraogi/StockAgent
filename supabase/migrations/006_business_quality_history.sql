-- Business Quality & Moat history — per-user runs (Stock Calculator Tab 4)
-- Run after 005_earnings_quality_history.sql

create table if not exists public.business_quality_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  ticker text not null,
  stock_name text not null,
  sector text not null default 'General',
  cmp numeric,
  business_quality_score_10 numeric not null,
  verdict text not null,
  report text not null,
  analysis jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists business_quality_history_user_created_idx
  on public.business_quality_history (user_id, created_at desc);

create index if not exists business_quality_history_user_ticker_idx
  on public.business_quality_history (user_id, ticker, created_at desc);

alter table public.business_quality_history enable row level security;

create policy "Users read own business quality history"
  on public.business_quality_history for select
  using (auth.uid() = user_id);

create policy "Users insert own business quality history"
  on public.business_quality_history for insert
  with check (auth.uid() = user_id);

create policy "Users delete own business quality history"
  on public.business_quality_history for delete
  using (auth.uid() = user_id);

comment on table public.business_quality_history is
  'Business Quality & Moat scorecard runs per user — 7-pillar franchise analysis';
