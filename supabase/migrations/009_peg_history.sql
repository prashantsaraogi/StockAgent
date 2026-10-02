-- PEG Evaluation history — per-user runs (Stock Calculator PEG tab)
-- Run after 008_margin_history.sql

create table if not exists public.peg_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  ticker text not null,
  stock_name text not null,
  sector text not null default 'General',
  cmp numeric,
  peg_ratio numeric,
  total_score_100 integer not null default 0,
  warning_count integer not null default 0,
  verdict text not null,
  report text not null,
  analysis jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists peg_history_user_created_idx
  on public.peg_history (user_id, created_at desc);

create index if not exists peg_history_user_ticker_idx
  on public.peg_history (user_id, ticker, created_at desc);

alter table public.peg_history enable row level security;

create policy "Users read own peg history"
  on public.peg_history for select
  using (auth.uid() = user_id);

create policy "Users insert own peg history"
  on public.peg_history for insert
  with check (auth.uid() = user_id);

create policy "Users delete own peg history"
  on public.peg_history for delete
  using (auth.uid() = user_id);

comment on table public.peg_history is
  'PEG Evaluation runs per user — P/E, PEG, ROCE, debt, FCF scorecard + 100-pt model';
