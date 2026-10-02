# Parallel Development — Cursor + Web MVP

**Created:** 5 Sep 2026  
**Purpose:** Use the investment framework in **Cursor exactly as today**, while building the **web MVP** in the same repo without conflicts.

Cross-ref: [Web Application Roadmap](India-Stock-Agent-Web-Application-Roadmap.doc) · [web/README.md](../web/README.md)

---

## Dual-track model

```
SHARED (edit once — both Cursor and web read)
├── .cursor/rules/          stock-agent.mdc
├── .cursor/skills/         analysis skills
├── investor-wisdom/        buy workflow, discipline, quotes
├── StockBook/*-FRAMEWORK.md AGENT-RULES, PARAMETERS-FRAMEWORK, lenses
└── News/                   sector/news digests

TRACK A — You in Cursor (unchanged)
├── .cursor/portfolio/holdings.md     YOUR 51 holdings
└── StockBook/[Sector]/[Stock]/     YOUR live StockBook write-back

TRACK B — Web MVP (new)
├── web/                              Next.js app + agent API
└── data/users/dev/                   Test tenant ONLY (not your StockBook/)
    ├── portfolio/holdings.md
    └── stockbook/                    Web writes here during dev
```

**Golden rule:** During MVP development, the web app **must not write** to root `StockBook/` or `.cursor/portfolio/holdings.md`.

---

## Directory map

| Path | Owner | Web MVP | Cursor |
|------|-------|---------|--------|
| `.cursor/rules`, `.cursor/skills` | Shared | Read | Read |
| `investor-wisdom/` | Shared | Read | Read |
| `StockBook/AGENT-RULES.md` etc. | Shared templates | Read | Read |
| `StockBook/Auto/Maruti Suzuki/` | **You** | Do not write | Read/write |
| `.cursor/portfolio/holdings.md` | **You** | Do not write | Read/write |
| `data/users/dev/stockbook/` | Web test user | Read/write | Ignore |
| `data/users/dev/portfolio/holdings.md` | Web test user | Read/write | Ignore |
| `web/` | Web code | Read/write | Optional browse |

---

## Daily workflow

### Cursor (unchanged)

1. Ask agent to analyze a stock → reads `StockBook/`, `holdings.md`, framework.
2. Agent writes back to `StockBook/[Sector]/[Stock]/`.
3. Run morning run, scripts, sector outlook — all as today.

### Web (parallel)

1. `cd web && npm run dev` → http://localhost:3000
2. MVP uses **dev tenant** paths from `web/lib/framework-paths.ts`.
3. Test analysis writes to `data/users/dev/stockbook/` only.
4. Framework updates in shared paths appear in both tracks automatically.

---

## Framework path config

Single source: [`web/lib/framework-paths.ts`](../web/lib/framework-paths.ts)

- `getSharedFrameworkPaths()` → rules, skills, investor-wisdom, framework markdown
- `getDevUserPaths()` → `data/users/dev/portfolio`, `data/users/dev/stockbook`

When multi-user ships: replace dev paths with `data/users/{userId}/` or S3/R2 — shared paths unchanged.

---

## MVP build order (suggested)

| Step | Task | Touches Cursor? |
|------|------|-----------------|
| 1 | ✅ Scaffold `web/` + `data/users/dev/` | No |
| 2 | Health API + framework path verify page | No |
| 3 | Stub `POST /api/analyze` → write `faq.md` to dev stockbook | No |
| 4 | ✅ Supabase auth + Postgres schema + user → `data/users/{id}/` | No |
| 5 | LLM agent reading shared skills (RAG) | No |
| 6 | Optional: “single-user mode” symlink dev → your StockBook | **Your choice** |

---

## Safety checks

Before any web write operation in code:

```typescript
import { assertSafeWritePath } from '@/lib/stockbook';
assertSafeWritePath(targetPath); // throws if path escapes dev tenant
```

Blocked paths (hard-coded):

- `StockBook/` (repo root — your live data)
- `.cursor/portfolio/`

---

## Git ignore

| Ignored | Committed |
|---------|-----------|
| `web/node_modules/`, `web/.next/`, `web/.env.local` | `web/` source, `data/users/dev/` template |
| Future: `data/users/*/stockbook/**` (real users) | Empty dev stockbook + sample holdings |

---

## FAQ

**Q: If I update PCCL rules in Cursor, does web see it?**  
Yes — both read `.cursor/rules/stock-agent.mdc` and `investor-wisdom/`.

**Q: Can I copy one stock folder from my StockBook to dev for testing?**  
Yes — copy e.g. `StockBook/Auto/Maruti Suzuki/` → `data/users/dev/stockbook/Auto/Maruti Suzuki/` manually. Do not symlink in git.

**Q: When does web replace Cursor?**  
Never required. Cursor remains your power-user IDE; web is for login, mobile, multi-user, scheduled runs.

---

## Related files

| File | Role |
|------|------|
| [web/README.md](../web/README.md) | Run instructions |
| [data/users/dev/README.md](../data/users/dev/README.md) | Dev tenant layout |
| [India-Stock-Agent-Web-Application-Roadmap.doc](India-Stock-Agent-Web-Application-Roadmap.doc) | Full phased plan |
