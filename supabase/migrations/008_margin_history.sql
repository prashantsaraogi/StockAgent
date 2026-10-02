-- Margin Analysis history — per-user runs (Stock Calculator Margin tab)
-- Run after 007_risk_decision_history.sql

create table if not exists public.margin_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  ticker text not null,
  stock_name text not null,
  sector text not null default 'General',
  cmp numeric,
  ebitda_delta_pp numeric,
  warning_count integer not null default 0,
  verdict text not null,
  report text not null,
  analysis jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists margin_history_user_created_idx
  on public.margin_history (user_id, created_at desc);

create index if not exists margin_history_user_ticker_idx
  on public.margin_history (user_id, ticker, created_at desc);

alter table public.margin_history enable row level security;

create policy "Users read own margin history"
  on public.margin_history for select
  using (auth.uid() = user_id);

create policy "Users insert own margin history"
  on public.margin_history for insert
  with check (auth.uid() = user_id);

create policy "Users delete own margin history"
  on public.margin_history for delete
  using (auth.uid() = user_id);

comment on table public.margin_history is
  'Margin Analysis runs per user — 5Y history, vs 10Y, drivers, quarterly trend';
