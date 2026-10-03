# My-agent — Web MVP

Next.js app for the India Stock Investment Agent. Runs **in parallel** with Cursor — same framework files, per-user tenant data.

## Quick start

```bash
cd web
npm install
npm run verify-paths
npm run dev
```

Open http://localhost:3000 — sign in with email → **My Agent** dashboard.

### Supabase (recommended)

1. Follow [docs/SUPABASE-SETUP.md](../docs/SUPABASE-SETUP.md)
2. Copy `.env.example` → `.env.local` and add Supabase URL + anon key
3. Run SQL migration: `supabase/migrations/001_initial_schema.sql`
4. Login uses **magic link** email; each user → `data/users/{uuid}/`

Without Supabase env vars, app falls back to **cookie dev mode** (`data/users/dev/`).

## UI flow

```
/login → /home (My Agent shell)
  Home | Industry Analysis | News | StockBook | Wisdom | Glossary | Ask Agent
```

StockBook stock pages: `/stockbook/[sector]/[stock]/[tab]` — Summary, FAQ, Approach, Detail, Parameters, Broker, CAGR, Risks, **Report (HTML)**.

See [docs/UI-DESIGN.md](../docs/UI-DESIGN.md).

## Architecture

| Layer | Path |
|-------|------|
| Shared framework (read-only) | `../.cursor/rules`, `../.cursor/skills`, `../investor-wisdom`, `../StockBook/` |
| Your Cursor data (protected) | `../.cursor/portfolio/holdings.md` — web must not write |
| Per-user tenant (web writes) | `../data/users/{tenantId}/` |
| Postgres metadata | Supabase — profiles, chat_messages, analysis_jobs, holdings_snapshots |

See [docs/PARALLEL-DEVELOPMENT.md](../docs/PARALLEL-DEVELOPMENT.md) · [docs/SUPABASE-SETUP.md](../docs/SUPABASE-SETUP.md).

## API (MVP)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Framework + tenant path status |
| `/api/auth/login` | POST | Cookie dev login (when Supabase not configured) |
| `/api/auth/logout` | POST | Sign out |
| `/auth/callback` | GET | Supabase magic-link callback |
| `/api/chat` | POST | Framework query + Postgres chat log + tenant StockBook write |
| `/api/analyze` | POST | Analyze stub → user stockbook |

## Key files

| File | Role |
|------|------|
| `lib/framework-paths.ts` | Shared framework paths |
| `lib/tenant.ts` | `getUserPaths()`, `ensureUserDataDir()` |
| `lib/auth.ts` | Supabase session + cookie dev fallback |
| `lib/supabase/` | Server/client/middleware Supabase clients |
| `lib/db/records.ts` | chat_messages, analysis_jobs helpers |
| `lib/stockbook.ts` | Safe write guards |
| `supabase/migrations/001_initial_schema.sql` | Postgres schema |

## Environment

Copy `.env.example` → `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```
