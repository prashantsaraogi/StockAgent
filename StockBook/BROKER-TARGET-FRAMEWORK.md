# Broker Target Framework — Per-Stock Street Price Targets

**Created:** 29 Aug 2026  
**Purpose:** One **`BROKER_[TICKER].md`** per holding — lists **every broker that has published a target**, not a fixed matrix with misleading blanks.

Cross-ref: `.cursor/portfolio/holdings.md` · `StockBook/CAGR-FRAMEWORK.md` · `.cursor/portfolio/BROKER-TARGET-FRAMEWORK.md`

---

## Why per-stock files (not one wide table)

| Problem with portfolio matrix | Per-stock fix |
|------------------------------|---------------|
| Blank cell looked like "no target" | Only listed brokers appear — no false negatives |
| Fixed columns (ICICI, Morgan…) miss Axis, Geojit, BOB, Jefferies | All brokers from Trendlyne + live search |
| Jefferies often absent on Trendlyne free tier | Supplement via news search when material |

---

## File naming & location

| Item | Rule |
|------|------|
| **File name** | `BROKER_[TICKER].md` — e.g. `BROKER_BHARTIARTL.md` |
| **Folder** | Same folder as `summary-analysis.md` / `CAGR_[TICKER].md` |
| **One file per stock** | Never combine tickers |

---

## Data sources (priority order)

1. **Trendlyne** research-reports page — primary; latest report per broker house  
2. **Live web search** — Jefferies, Morgan Stanley, etc. when missing on Trendlyne (label source + date)  
3. **Consensus** — Trendlyne headline avg; shown separately, not mixed into broker avg without label

**Horizon:** Broker targets are typically **~12-month** forward — directional, not PCCL.

---

## File structure (mandatory sections)

```markdown
# [Company] — Broker Target Prices

**Ticker:** TICKER | **CMP:** ₹X | **CMP date:** YYYY-MM-DD
**Trendlyne consensus:** ₹X (upside Y%) | N analysts
**As of:** YYYY-MM-DD | **Horizon:** ~12 months

## Latest target by broker (one row per house — most recent report)

| Broker | Date | Reco | Target (₹) | Upside % | Source |
|--------|------|------|-----------:|---------:|--------|
| ... only brokers with a numeric target ... |

**Street avg (listed brokers):** ₹X | **Upside vs CMP:** Y% | **Brokers counted:** N

## Not on Trendlyne (checked)

- Jefferies — if found via search, move to table above

## Agent use

- Read before "what does the Street think?" — **secondary** to PCCL and personal discipline.
- Blank in old portfolio matrix ≠ no coverage — **this file** is authoritative for broker list.

## Change log

| Date | Change |
|------|--------|
| YYYY-MM-DD | Initial |
```

---

## Broker normalization

| Display name | Match patterns in Trendlyne Author |
|--------------|-----------------------------------|
| ICICI Securities | ICICI Securities, ICICI Direct |
| Motilal Oswal | Motilal Oswal |
| Axis Direct | Axis Direct, Axis Capital |
| Kotak Securities | Kotak |
| HDFC Securities | HDFC Securities |
| Jefferies | Jefferies |
| Morgan Stanley | Morgan Stanley |
| HSBC | HSBC |
| BOB Capital | BOB Capital |
| Geojit | Geojit |
| Deven Choksey | Deven Choksey |
| *Other* | Full author name as on Trendlyne |

**Selection rule:** For each normalized broker, keep **most recent report date** with numeric target > 0.

Skip rows: `Consensus Share Price Target`, empty target, `Target met` with no new target number.

---

## Refresh workflow

```powershell
# 1. Agent or script saves Trendlyne WebFetch text to StockBook/_broker-fetch/[TICKER].md
# 2. Generate all per-stock files:
.\StockBook\_generate-all-broker-targets.ps1

# 3. Portfolio summary (optional):
.\.cursor\portfolio\_fetch-broker-targets.ps1
```

**When to refresh:** After quarterly results season, or when user asks. Re-search Jefferies/Morgan for Nifty 50 names if Trendlyne table lacks them.

---

## Portfolio index

**`.cursor/portfolio/broker-target-prices.md`** — summary only (CMP, street avg, upside).  
**Full broker list** → always `StockBook/.../BROKER_[TICKER].md`.

---

## Agent rules

1. **Read** `BROKER_[TICKER].md` when user asks about street targets for that name.  
2. **Do not** infer "no broker coverage" from portfolio matrix blanks.  
3. **Do not** buy on street upside alone — PCCL, pause buckets, long-term mandate apply.  
4. **Update** per-stock file after material broker report or search finding.
