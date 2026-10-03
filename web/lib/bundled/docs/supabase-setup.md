# Supabase setup — My Agent web app

**Phase:** MVP step 4 · **Date:** 2026-09-05

This guide connects **Supabase Auth + Postgres** to the Next.js app. Each user gets:

- **Auth:** magic-link email sign-in
- **Postgres:** profile, chat history, analysis jobs, holdings snapshots
- **Disk:** `data/users/{user-uuid}/` for markdown StockBook write-back

---

## 1. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Choose region (e.g. Mumbai / Singapore for India)
3. Save the **Database password** (for SQL access only)

---

## 2. Run the database migration

1. In Supabase → **SQL Editor** → **New query**
2. Paste the full contents of:

   `supabase/migrations/001_initial_schema.sql`

3. Click **Run**

4. **Also run** (Analysis Log):

   `supabase/migrations/002_analysis_history.sql`

5. **Also run** (Stock Calculator history):

   `supabase/migrations/003_calculator_history.sql`

6. **Also run** (PE Evaluation scorecard history):

   `supabase/migrations/004_pe_evaluation_history.sql`

7. **Also run** (Earnings Quality history):

   `supabase/migrations/005_earnings_quality_history.sql`

8. **Also run** (Business Quality & Moat history):

   `supabase/migrations/006_business_quality_history.sql`

9. **Also run** (Risk & Decision history):

   `supabase/migrations/007_risk_decision_history.sql`

This creates:

| Table | Purpose |
|-------|---------|
| `profiles` | User email + `tenant_id` (disk folder name) |
| `holdings_snapshots` | Optional holdings import/history |
| `analysis_jobs` | Framework run status |
| `chat_messages` | Ask Agent history |
| `analysis_history` | Analysis Log (Ask Agent Q&A) |
| `calculator_history` | Stock Calculator CAGR what-if runs |
| `pe_evaluation_history` | PE Evaluation Scorecard runs per user |
| `earnings_quality_history` | Earnings Quality analysis runs per user |
| `business_quality_history` | Business Quality & Moat scorecard runs per user |
| `risk_decision_history` | Risk & Decision final engine runs per user |

Row Level Security (RLS) ensures each user only sees their own rows.

---

## 3. Enable Email auth (magic link)

1. Supabase → **Authentication** → **Providers** → **Email**
2. Enable **Email provider**
3. For local dev, either:
   - Use **Supabase built-in email** (limited rate), or
   - Configure **Custom SMTP** (recommended for production)

4. **Authentication** → **URL configuration**:
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** add `http://localhost:3000/auth/callback`

For production, add your deployed URL too.

---

## 4. Configure environment variables

Copy and fill in:

```bash
cd web
copy .env.example .env.local
```

Required for Supabase mode:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Find URL and anon key in Supabase → **Project Settings** → **API**.

Optional (server-only, for admin scripts later):

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Never** expose the service role key to the browser.

---

## 5. Start the app

```bash
cd web
npm run dev
```

1. Open http://localhost:3000
2. Login page shows **Supabase Auth** badge when env is set
3. Enter email → **Send magic link**
4. Click link in email → lands on `/home`
5. First login creates `data/users/{your-uuid}/` with seeded holdings

---

## 6. Dev mode without Supabase

If `NEXT_PUBLIC_SUPABASE_*` is **not** set:

- Cookie email login still works
- Tenant stays `data/users/dev/`
- No Postgres persistence

Useful for UI work without a cloud project.

---

## Architecture

```
Login (magic link)
    ↓
Supabase Auth session (HTTP-only cookies)
    ↓
profiles.tenant_id = auth.users.id
    ↓
data/users/{tenant_id}/
    ├── portfolio/holdings.md
    ├── stockbook/          ← web writes only here
    └── news/ticker-index.md

Postgres (metadata)
    ├── chat_messages
    ├── analysis_jobs
    ├── analysis_history      ← Ask Agent / Analysis Log (write-only today)
    ├── calculator_history    ← Stock Calculator (write + optional read-back)
    └── holdings_snapshots
```

Root `StockBook/` and `.cursor/portfolio/` remain **read-only** for the web app.

---

## Verify

After sign-in, check:

1. **Home** footer shows your tenant path (UUID, not `dev`)
2. **Ask Agent** chat → rows in Supabase **Table Editor** → `chat_messages`
3. On-disk folder exists: `data/users/{uuid}/`

---

## Next steps (roadmap)

| Step | Task |
|------|------|
| 5 | LLM agent + skill RAG |
| 6 | Holdings upload → `holdings_snapshots` |
| 7 | Async `analysis_jobs` worker |
| 8 | S3/R2 for markdown at scale (optional) |

See [PARALLEL-DEVELOPMENT.md](PARALLEL-DEVELOPMENT.md) · [web/README.md](../web/README.md)

---

## Post-POC — deferred (storage & logs)

**POC today:** dual-write where configured — **disk is always written**; Supabase gets inserts when `authMode === 'supabase'`. The UI reads **Analysis Log** and **Calculator** from `data/users/{tenant_id}/` on disk (Calculator can hydrate from DB if disk is empty).

**Do after POC:**

| Item | Current POC | Post-POC target |
|------|-------------|-----------------|
| **Analysis Log** | Inserts `analysis_history`; UI reads disk only | Read from Postgres as source of truth; sync disk as cache/export |
| **Ask Agent chat** | `chat_messages` + disk inbox | Session restore from DB; optional chat UI history |
| **Stock Calculator** | Disk + `calculator_history` | Full DB read/write parity |
| **News runs** | `News/` repo files only | Optional `news_runs` table or object storage |
| **Portfolio** | Disk `holdings.md` / lots | Optional `holdings_snapshots` on every edit |
| **Dev mode** | Disk-only under `data/users/dev/` | Same Supabase path or explicit POC flag |

**Principle:** one canonical store per log type (Postgres for queryable history; disk for Cursor cross-ref and markdown export) — implement unified sync after POC sign-off.

*Added: Sep 2026 — follow-up from dual-storage review.*
