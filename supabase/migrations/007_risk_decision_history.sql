-- Risk & Decision history — final decision engine runs (Stock Calculator Tab 5)
-- Run after 006_business_quality_history.sql

create table if not exists public.risk_decision_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  ticker text not null,
  stock_name text not null,
  sector text not null default 'General',
  cmp numeric,
  quantitative_score_100 numeric not null,
  investment_verdict text not null,
  thesis_status text not null,
  report text not null,
  analysis jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists risk_decision_history_user_created_idx
  on public.risk_decision_history (user_id, created_at desc);

alter table public.risk_decision_history enable row level security;

create policy "Users read own risk decision history"
  on public.risk_decision_history for select using (auth.uid() = user_id);

create policy "Users insert own risk decision history"
  on public.risk_decision_history for insert with check (auth.uid() = user_id);

create policy "Users delete own risk decision history"
  on public.risk_decision_history for delete using (auth.uid() = user_id);

comment on table public.risk_decision_history is
  'Risk & Decision final scorecard — combines all calculator tabs';
