# Web UI — Information Architecture

**Version:** 1.0 · **Date:** 2026-09-05

## Flow

```
/login (email)
    ↓
/home  ← My Agent shell (authenticated)
    ├── Home
    ├── Industry Analysis
    ├── News
    ├── StockBook  →  /stockbook/[sector]/[stock]/[tab]
    ├── Wisdom
    ├── Glossary
    └── Ask Agent (chat)
```

## Main tabs

| Tab | Route | Data source |
|-----|-------|-------------|
| Home | `/home` | Dev holdings, quick links |
| Industry Analysis | `/industry-analysis` | `StockBook/**/**-sector-outlook.md`, comparative ranks |
| News | `/news` | `News/YYYY-MM/DD/summary.md`, `News/TICKER-INDEX.md` |
| StockBook | `/stockbook` | Dev + root `StockBook/` (read-only browse) |
| Wisdom | `/wisdom` | `investor-wisdom/quotes.md` |
| Glossary | `/glossary` | `GLOSSARY.md` |
| Ask Agent | `/chat` | Framework RAG stub → `/api/chat` |

## StockBook sub-tabs

| Sub-tab | File |
|---------|------|
| Summary | `summary-analysis.md` |
| FAQ | `faq.md` |
| Approach | `suggested-approach.md` |
| Detail | `detail-analysis.md` |
| Parameters | `PARAMETERS_*.md` |
| Broker | `BROKER_*.md` |
| CAGR | `CAGR_*.md` |
| External Risk | `external-negative-risk.md` |
| Internal Risk | `internal-negative-risk.md` |
| Report | `*-report.html` (iframe) |

Each stock page includes an inline **Ask about [stock]** chat sidebar.

## Write rules

- **Reads:** root `StockBook/`, `News/`, framework files
- **Writes:** `data/users/dev/stockbook/` only (chat FAQ append)
- **Protected:** root `StockBook/`, `.cursor/portfolio/`

## Run locally

```bash
cd web
npm run dev
```

Open http://localhost:3000 → redirects to `/login`.
