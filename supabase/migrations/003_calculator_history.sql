-- Stock Calculator history — per-user what-if runs (standalone from portfolio)
-- Run after 002_analysis_history.sql

create type public.pe_basis as enum ('ttm', 'forward');

create table if not exists public.calculator_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  ticker text not null,
  stock_name text not null,
  sector text not null default 'General',
  pe_basis public.pe_basis not null,
  expected_cagr_pct numeric not null,
  years integer not null,
  cmp numeric not null,
  anchor_pe numeric not null,
  manual_pe_override numeric,
  investment_amount_inr numeric,
  implied_verdict text not null,
  report text not null,
  snapshot jsonb not null default '{}'::jsonb,
  scenarios jsonb not null default '[]'::jsonb,
  projected_eps numeric,
  anchor_eps numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists calculator_history_user_created_idx
  on public.calculator_history (user_id, created_at desc);

create index if not exists calculator_history_user_ticker_idx
  on public.calculator_history (user_id, ticker, created_at desc);

alter table public.calculator_history enable row level security;

create policy "Users read own calculator history"
  on public.calculator_history for select
  using (auth.uid() = user_id);

create policy "Users insert own calculator history"
  on public.calculator_history for insert
  with check (auth.uid() = user_id);

create policy "Users delete own calculator history"
  on public.calculator_history for delete
  using (auth.uid() = user_id);

comment on table public.calculator_history is
  'Stock Calculator what-if runs per user — not linked to portfolio holdings';
