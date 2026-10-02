# CMP Source Rules — Web Dashboard & Portfolio

**Created:** 6 Sep 2026  
**Applies to:** `web/` Dashboard, Portfolio, gain %, CAGR  
**Cross-ref:** `StockBook/CAGR-FRAMEWORK.md` · `web/lib/nse-cmp.ts` · `web/lib/cmp.ts`

---

## Framework rule

**CMP for web gain and CAGR must always be the latest NSE last traded price (LTP)** — fetched on every Dashboard / Portfolio page load, not from static StockBook files.

StockBook `PARAMETERS_*.md` CMP is **stale fallback only** when live NSE fetch fails.

---

## Fetch priority (strict order)

| Step | Source | Module |
|------|--------|--------|
| 1 | **NSE India** `nseindia.com/api/quote-equity` | `web/lib/nse-cmp.ts` |
| 2 | **Yahoo Finance** `{NSE_SYMBOL}.NS` (NSE LTP mirror when NSE API blocks server IP) | `web/lib/nse-cmp.ts` |
| 3 | **StockBook** PARAMETERS / summary (dated — fallback) | `web/lib/cmp.ts` |
| 4 | Unavailable — gain/CAGR show `—` | — |

---

## Cache

- In-memory cache **5 minutes** per ticker (`CMP_CACHE_TTL_MS` in `.env.local`)
- Each user page load refreshes expired tickers automatically

---

## NSE symbol aliases

When portfolio ticker ≠ NSE symbol, map in `web/lib/nse-cmp.ts`:

| Portfolio ticker | NSE symbol |
|------------------|------------|
| TATAMOTORS | TMCV |

Add new aliases when demergers / renames occur.

---

## UI disclosure

Dashboard and Portfolio must show:

- CMP source label (`NSE India (live)` or `NSE LTP (Yahoo .NS mirror)`)
- Quote timestamp where available

---

## Cursor agent alignment

When updating `CAGR_[TICKER].md` in StockBook, still use **live NSE CMP** on analysis date — same rule as web. Web app implements this automatically via `nse-cmp.ts`.
