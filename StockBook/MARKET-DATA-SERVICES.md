# Market Data Services — Web & Agent

**Created:** 8 Sep 2026  
**Purpose:** Catalog **daily-changing market inputs** and **derived** StockBook artifacts — with matching Services tab jobs.

Cross-ref: `web/lib/market-data-deps.ts` · `web/lib/services-catalog.ts` · Services page `/services`

---

## Dependency chain

```
CMP (NSE live, daily)
  → PARAMETERS Today @ CMP · trailing P/E
  → CAGR lot returns · market value
  → BROKER upside %
  → summary-analysis CMP line

Quarterly results (event)
  → EARNINGS_QUALITY · summary · faq
  → PARAMETERS TTM EPS / margins
  → PCCL · suggested-approach

Broker calls (daily / weekly)
  → BROKER_[TICKER].md
  → broker-target-prices.md portfolio summary
```

**Rule:** Refresh **upstream** before downstream. After new results, run quarter refresh **then** CMP (or CMP first if only price moved).

---

## Web Services (one-click)

| Service | Action | Cadence |
|---------|--------|---------|
| Run daily market pack | `run-daily-market-pack` | Daily |
| **Scheduled 8 AM IST** | `npm run daily-market-pack` or `/api/cron/daily-market-pack` | Daily |
| Run all automated | `run-all-automated` | On demand |
| Update CMP — all holdings | `refresh-portfolio-cmp` | Daily |
| Scan quarter results | `scan-quarter-results` | Daily in results season |
| Sector mcap | `refresh-sector-mcap` | Weekly |
| News today | `news-today` | Daily |

**Daily pack order:** CMP → quarter scan → news.

---

## AI / Cursor prompts (event-driven)

| Trigger | Prompt service | Writes |
|---------|----------------|--------|
| New quarter results | `refresh-quarter-results` | summary, EARNINGS_QUALITY, PARAMETERS, PCCL |
| New broker call (e.g. ICICI on HUL) | `refresh-broker-single` | BROKER_[TICKER].md |
| Weekly broker sweep | `refresh-broker-portfolio` | All BROKER files + portfolio summary |

Replace `{TICKER}` with NSE symbol before Ask Agent.

---

## Files touched by CMP refresh

- `StockBook/_cmp-cache.json` — last refresh stamp + quotes
- `PARAMETERS_[TICKER].md` — header CMP + trailing P/E (when derivable)
- `CAGR_[TICKER].md` — CMP + lot returns
- `BROKER_[TICKER].md` — CMP + upside %
- `summary-analysis.md` — CMP line if present

---

## Agent rule

Before surplus rank or ADD at CMP on analysis date:

1. Check `_cmp-cache.json` date ≤ 1 day — else run **Update CMP**
2. During results season — run **scan-quarter-results**; refresh flagged names
3. Material broker call in news — run **refresh-broker-single** for that ticker

Never use stale PARAMETERS CMP for valuation conclusions.

---

## Scheduled morning run (8 AM IST)

### One-time setup (Windows)

```powershell
cd web
.\scripts\register-morning-cron.ps1
```

Requires `CRON_TENANT_ID` in `web/.env.local` (Supabase user uuid with portfolio).

### Manual test

```powershell
cd web
npm run daily-market-pack
```

### HTTP cron (server always on)

```http
POST /api/cron/daily-market-pack
Authorization: Bearer $CRON_SECRET
```

Log: `data/cron/last-runs.json` · visible on Services status strip.

---

## Change log

| Date | Change |
|------|--------|
| 2026-09-08 | Initial — Services tab market-data category + dependency map |
