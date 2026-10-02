-- Earnings Quality analysis history — per-user runs (Stock Calculator Tab 3)
-- Run after 004_pe_evaluation_history.sql

create table if not exists public.earnings_quality_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  ticker text not null,
  stock_name text not null,
  sector text not null default 'General',
  cmp numeric,
  overall_verdict text not null,
  warning_count integer not null default 0,
  report text not null,
  analysis jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists earnings_quality_history_user_created_idx
  on public.earnings_quality_history (user_id, created_at desc);

create index if not exists earnings_quality_history_user_ticker_idx
  on public.earnings_quality_history (user_id, ticker, created_at desc);

alter table public.earnings_quality_history enable row level security;

create policy "Users read own earnings quality history"
  on public.earnings_quality_history for select
  using (auth.uid() = user_id);

create policy "Users insert own earnings quality history"
  on public.earnings_quality_history for insert
  with check (auth.uid() = user_id);

create policy "Users delete own earnings quality history"
  on public.earnings_quality_history for delete
  using (auth.uid() = user_id);

comment on table public.earnings_quality_history is
  'Earnings Quality analysis runs per user — growth, profitability, cash, quarterly trends';
