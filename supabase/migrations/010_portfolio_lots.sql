-- Portfolio purchase lots (Vercel / read-only disk — source of truth in Postgres)

create table if not exists public.portfolio_lots (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  tenant_id text not null,
  lots jsonb not null default '{"version":1,"lots":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_lots_tenant_id_idx on public.portfolio_lots (tenant_id);

alter table public.portfolio_lots enable row level security;

create policy "Users read own portfolio lots"
  on public.portfolio_lots for select
  using (auth.uid() = user_id);

create policy "Users insert own portfolio lots"
  on public.portfolio_lots for insert
  with check (auth.uid() = user_id);

create policy "Users update own portfolio lots"
  on public.portfolio_lots for update
  using (auth.uid() = user_id);

comment on table public.portfolio_lots is
  'Web portfolio lots.json equivalent — used on serverless when disk is read-only';
