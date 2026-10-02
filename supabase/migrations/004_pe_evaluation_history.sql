-- PE Evaluation Scorecard history — per-user scorecard runs (standalone from portfolio)
-- Run after 003_calculator_history.sql

create table if not exists public.pe_evaluation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  ticker text not null,
  stock_name text not null,
  sector text not null default 'General',
  purchase_price numeric not null,
  purchase_date date not null,
  cmp numeric,
  purchase_pe numeric,
  raw_score integer not null,
  weighted_overall_10 numeric not null,
  fresh_verdict text not null,
  legacy_verdict text not null,
  report text not null,
  scorecard jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists pe_evaluation_history_user_created_idx
  on public.pe_evaluation_history (user_id, created_at desc);

create index if not exists pe_evaluation_history_user_ticker_idx
  on public.pe_evaluation_history (user_id, ticker, created_at desc);

alter table public.pe_evaluation_history enable row level security;

create policy "Users read own pe evaluation history"
  on public.pe_evaluation_history for select
  using (auth.uid() = user_id);

create policy "Users insert own pe evaluation history"
  on public.pe_evaluation_history for insert
  with check (auth.uid() = user_id);

create policy "Users delete own pe evaluation history"
  on public.pe_evaluation_history for delete
  using (auth.uid() = user_id);

comment on table public.pe_evaluation_history is
  'PE Evaluation Scorecard runs per user — purchase P/E vs today; not linked to portfolio';
