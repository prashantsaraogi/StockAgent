-- Full Stock Calculator history — all six modules in one run
-- Run after 008_margin_history.sql

create table if not exists public.stock_calculator_full_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  ticker text not null,
  stock_name text not null,
  sector text not null default 'General',
  cmp numeric,
  expected_cagr_pct numeric not null,
  years integer not null,
  overview_verdict text not null,
  child_ids jsonb not null default '{}'::jsonb,
  report text not null,
  analysis jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists stock_calculator_full_history_user_created_idx
  on public.stock_calculator_full_history (user_id, created_at desc);

alter table public.stock_calculator_full_history enable row level security;

create policy "Users read own full calculator history"
  on public.stock_calculator_full_history for select
  using (auth.uid() = user_id);

create policy "Users insert own full calculator history"
  on public.stock_calculator_full_history for insert
  with check (auth.uid() = user_id);

create policy "Users delete own full calculator history"
  on public.stock_calculator_full_history for delete
  using (auth.uid() = user_id);

comment on table public.stock_calculator_full_history is
  'Full Stock Calculator runs — CAGR + PE + EQ + Margin + BQ + Risk in one pass';
