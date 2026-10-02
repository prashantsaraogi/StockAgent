# Web Application Planning Documents

| File | Description |
|------|-------------|
| **PARALLEL-DEVELOPMENT.md** | **Cursor + web MVP in parallel** — dual-track design |
| **UI-DESIGN.md** | Login → My Agent tabs, StockBook sub-tabs, routes & data sources |
| **SUPABASE-SETUP.md** | Supabase Auth + Postgres migration + env setup |
| **India-Stock-Agent-Web-Application-Roadmap.doc** | MVP + Phase 2 + Phase 3 roadmap (v1.1 — StockBook) |
| `_generate-web-app-roadmap-doc.ps1` | Optional Word doc regenerator |

## Web MVP quick start

```bash
cd web
npm install
npm run verify-paths
npm run dev
```

Open http://localhost:3000 — see [PARALLEL-DEVELOPMENT.md](PARALLEL-DEVELOPMENT.md).

## Phases (summary)
| Phase | Weeks | Deliverable |
|-------|-------|-------------|
| **MVP** | 1–8 | Email login, holdings, chat analysis, StockBook write-back |
| **V1** | 9–14 | StockBook browser, thematic runs, sector outlook, PCCL dashboard |
| **V2** | 15–22 | Morning run, broker batch, CAGR dashboard, automation |

See full document for architecture, costs (INR), risks, and next actions.

## Post-POC reminder

Unified **database-backed logs** (Analysis Log read from Postgres, chat session restore, full sync) — **deferred until after POC**. Detail: [SUPABASE-SETUP.md § Post-POC](SUPABASE-SETUP.md#post-poc--deferred-storage--logs).
