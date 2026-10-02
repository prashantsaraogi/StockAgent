# CAGR Framework — Per-Stock Holding Returns

**Created:** 28 Aug 2026  
**Purpose:** Track **CAGR from each purchase date** to **latest NSE CMP** for every held stock. One file per ticker under `StockBook/[Sector]/[Stock Name]/`.

Cross-ref: `.cursor/portfolio/holdings.md` · `StockBook/AGENT-RULES.md` · `StockBook/_calc-cagr.ps1`

---

## File naming & location

| Item | Rule |
|------|------|
| **File name** | `CAGR_[TICKER].md` — e.g. `CAGR_HDFCBANK.md`, `CAGR_HDFCAMC.md`, `CAGR_ITC.md` |
| **Folder** | Same folder as `summary-analysis.md` for that stock |
| **One file per stock** | Never combine tickers in one CAGR file |

---

## What CAGR measures here

**Not** company revenue/EPS CAGR. This is **your holding return**, annualized from **each buy date** to **today's NSE CMP**.

```
Simple return (%) = (CMP − Buy price) / Buy price × 100

Holding period (years) = (CMP date − Buy date) in days ÷ 365.25

CAGR (%) = (CMP / Buy price)^(1 / years) − 1) × 100
```

| Input | Source |
|-------|--------|
| **Buy date** | User-confirmed trade date; see lot rules below |
| **Buy price** | Actual fill price per lot (₹) |
| **Qty** | Shares in that lot |
| **CMP** | **Latest NSE last traded price** — fetch on every refresh |
| **CMP date** | Date/time of NSE quote (market close or live) |

**Web app (Dashboard / Portfolio):** live NSE fetch implemented in `web/lib/nse-cmp.ts` + `web/lib/CMP-SOURCE-RULES.md` — NSE API first, Yahoo `.NS` mirror fallback, StockBook stale fallback only.

---

## Lot rules — purchase dates

### Legacy holdings (until user provides history)

All **existing 49 positions** (as of Aug 2026 upload) use **one synthetic lot each**:

| Field | Default |
|-------|---------|
| **Buy date** | **1 April 2025** |
| **Qty** | Full position from `holdings.md` |
| **Buy price** | Avg cost from `holdings.md` |
| **Lot note** | `LEGACY — assumed 2025-04-01 until user supplies actual dates` |

When user gives **actual purchase dates/prices**, **replace** synthetic lots with real line items — do not delete history; move superseded rows to **Archive lots** section.

### New trades (from 28 Aug 2026 onward)

After every confirmed buy/sell, user or agent adds a **new lot row**:

```
| Lot | Qty | Buy date | Buy price (₹) | Source |
|-----|-----|----------|---------------|--------|
| L2 | 65 | 2026-08-26 | 1926.00 | User trade — BHARTIARTL |
```

Update:
1. `holdings.md` summary (qty, blended avg)
2. `CAGR_[TICKER].md` — append lot + recalc
3. Stock `summary-analysis.md` if material

**Partial sells:** reduce qty on specific lot (FIFO or user-specified lot); document in change log.

---

## CMP — NSE fetch (mandatory)

1. **Primary:** NSE India quote API or equity quote page for NSE symbol  
   - URL pattern: `https://www.nseindia.com/get-quotes/equity?symbol=[TICKER]`
2. **Record:** `CMP`, `CMP date`, `Source: NSE` (or `NSE close via [mirror]` if API blocked)
3. **Never** use stale CMP from old reports without re-fetching
4. If NSE unreachable → label **UNVERIFIED** + date of last successful NSE read

**Agent refresh trigger:** User asks CAGR · monthly review · any Report update after market hours.

---

## Per-stock CAGR file template

Each `CAGR_[TICKER].md` must contain:

```markdown
# [Company] — Holding CAGR

**Ticker:** [TICKER] (NSE)
**CMP:** ₹[x] · **CMP date:** [YYYY-MM-DD] · **Source:** NSE
**Last calculated:** [YYYY-MM-DD]

## Lots (live)

| Lot | Qty | Buy date | Buy price (₹) | Days held | CMP (₹) | Simple return % | CAGR % | Notes |
|-----|-----|----------|---------------|----------:|--------:|----------------:|-------:|-------|

## Portfolio summary (this ticker)

| Metric | Value |
|--------|------:|
| Total qty | |
| Total cost (₹) | |
| Market value @ CMP (₹) | |
| Blended simple return % | |
| Cost-weighted CAGR % | |

## Change log

| Date | Change |
|------|--------|
```

### Cost-weighted CAGR (multi-lot)

When lots have **different buy dates**:

```
Cost-weighted CAGR = Σ (lot_cost × lot_CAGR) / Σ lot_cost
```

where `lot_cost = qty × buy_price` and `lot_CAGR` is annualized for that lot.

Also report **blended simple return** on total cost — `(total MV − total cost) / total cost`.

---

## Agent workflow

```
1. Read holdings.md for qty / avg cost
2. Read CAGR_[TICKER].md for lot dates
3. Fetch latest NSE CMP
4. Run StockBook/_calc-cagr.ps1 (or manual formula)
5. Write CAGR_[TICKER].md + update Last calculated
6. On new trade → add lot row + holdings.md + change log
```

### When to create CAGR file

| Trigger | Action |
|---------|--------|
| First time stock discussed at depth | Create `CAGR_[TICKER].md` with legacy lot |
| User requests CAGR | Create if missing; refresh if exists |
| Confirmed trade | Update lots + recalc same session |

### Rollout status

| Status | Count |
|--------|------:|
| Framework + script | Done 28 Aug 2026 |
| **`_generate-all-cagr.ps1`** | Batch refresh all holdings |
| **All 49 tickers** | **Done 28 Aug 2026** — `CAGR_[TICKER].md` in each StockBook folder |
| CMP source | Yahoo Finance `.NS` (NSE proxy); overrides: **TMCV.NS** (TATAMOTORS CV), **RIIT.BO** (RAAJINFRA INVIT) |

Re-run: `.\StockBook\_generate-all-cagr.ps1` after market close for fresh NSE CMP (auto-rebuilds **portfolio dashboard**).

### Portfolio dashboard

| File | Purpose |
|------|---------|
| [`.cursor/portfolio/portfolio-cagr.md`](../.cursor/portfolio/portfolio-cagr.md) | **Combined "where am I"** — totals, rank, sector, top/bottom 5 |
| `StockBook/_generate-portfolio-cagr.ps1` | Rebuild dashboard from all `CAGR_[TICKER].md` files |

---

## Holdings.md integration

Summary table stays **one row per ticker** (qty + blended avg).  
**Lot detail** lives only in `CAGR_[TICKER].md` (not 49 rows in holdings.md).

Add to trade update template:

> Update portfolio: bought [TICKER] [qty] @ [price] on [YYYY-MM-DD]

---

## Related metrics (do not confuse)

| Metric | File |
|--------|------|
| Holding CAGR (this framework) | `CAGR_[TICKER].md` |
| PCCL / valuation | `summary-analysis.md` |
| Company revenue/EPS CAGR | `detail-analysis.md` |

---

## Change log

| Date | Change |
|------|--------|
| 2026-08-28 | Initial framework · legacy lot date 2025-04-01 · samples HDFCBANK + HDFCAMC |
