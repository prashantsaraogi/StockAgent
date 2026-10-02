# Sector Cap-Tier Universe — Framework

**Created:** 6 Sep 2026  
**Purpose:** Under each **sector outlook**, list representative stocks by **cap tier** and **selection lens**.  
**Agent fills** — not end-user. Refresh with sector outlook (weekly).

Cross-ref: `SECTOR-OUTLOOK-FRAMEWORK.md` · `*-sector-outlook.md` · Industry Growth web tab

---

## Two-level structure (web)

```
Industry Growth
│
├── Sector list (6-parameter score /100)     ← existing
│
└── Sector detail
    ├── Sector score panel (output)
    └── Cap tier tabs
        ├── Large cap   (10 = 5 growth + 5 mcap)
        ├── Mid cap     (10 = 5 growth + 5 mcap)
        └── Small cap   (10 = 5 growth + 5 mcap)
```

Each cap tab shows **two lenses** (side by side on web):

| Lens | Question |
|------|----------|
| **Growth perspective** | Who has the best **3–5Y EPS / revenue growth** in this cap band? |
| **Market cap perspective** | Who are the **largest franchises / liquidity anchors** in this cap band? |

**No overlap rule:** Prefer **different tickers** across lenses within a tier. If unavoidable (e.g. telecom), note in Reading.

---

## Stock counts (fixed)

**Each lens lists 5 stocks** — tier total = **10** (5 Growth + 5 Market cap). Counts are **not** split from a single pool of 5.

| Cap tier | Growth perspective | Market cap perspective | **Tier total** |
|----------|-------------------:|-----------------------:|---------------:|
| **Large cap** | **5** | **5** | **10** |
| **Mid cap** | **5** | **5** | **10** |
| **Small cap** | **5** | **5** | **10** |

**Overlap:** Prefer **different tickers** across lenses within a tier. If unavoidable (e.g. thin sector), note in Reading — both lenses still show 5 names each.

---

## Cap band definitions (India — ASSUMPTION)

| Tier | Typical mcap band | Index proxy |
|------|-------------------|-------------|
| **Large cap** | **> ₹50,000 cr** | Nifty 50 / 100 leaders in sector |
| **Mid cap** | **₹5,000 – 50,000 cr** | Nifty Midcap 150 in sector |
| **Small cap** | **< ₹5,000 cr** | Sector specialists · liquidity filter |

*Exact ₹ cr refreshed weekly; bands are framework anchors not hard filters.*

---

## Markdown template (in each `*-sector-outlook.md`)

Insert after `## Sector score — 6 parameters` block:

```markdown
## Cap tier universe

### Large cap

#### Growth perspective

| # | Company | Ticker | Mcap ₹ cr | 3Y EPS CAGR est | Reading | Type |
|---|---------|--------|----------:|-----------------|---------|------|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |

#### Market cap perspective

| # | Company | Ticker | Mcap ₹ cr | Mcap rank | Reading | Type |
|---|---------|--------|----------:|----------:|---------|------|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |

### Mid cap

#### Growth perspective

| # | Company | Ticker | Mcap ₹ cr | 3Y EPS CAGR est | Reading | Type |
|---|---------|--------|----------:|-----------------|---------|------|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |

#### Market cap perspective

| # | Company | Ticker | Mcap ₹ cr | Mcap rank | Reading | Type |
|---|---------|--------|----------:|----------:|---------|------|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |

### Small cap

#### Growth perspective

| # | Company | Ticker | Mcap ₹ cr | 3Y EPS CAGR est | Reading | Type |
|---|---------|--------|----------:|-----------------|---------|------|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |

#### Market cap perspective

| # | Company | Ticker | Mcap ₹ cr | Mcap rank | Reading | Type |
|---|---------|--------|----------:|----------:|---------|------|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |
```

---

## Agent selection rules

1. **Sector-first** — only names that earn revenue primarily in this sector.
2. **Growth lens** — rank by forward **EPS CAGR** (3–5Y base case), not past price momentum.
3. **Market cap lens** — rank by **free-float mcap** within tier; prefer index / FII liquidity.
4. **Hard exclude** — CMP **< ₹20**, persistent loss-makers, fraud/governance flags (§16 guards).
5. **Portfolio note** — mark `(held)` in Reading when in user book; does not change selection.
6. **Three-layer check** — good sector ≠ good stock; cap-tier list is **research universe**, not buy list.

---

## Web display (output only)

- **Horizontal** cap-tier tabs: Large cap · Mid cap · Small cap (each shows **X/10** total + G/M breakdown)
- Two colour-coded columns: **Growth** (green) | **Market cap** (blue) — **5 stocks each**
- Per stock: rank, name, ticker, mcap, key metric, one-line Reading
- Link to StockBook if folder exists

Process / questionnaire stays in this file and `SECTOR-OUTLOOK-FRAMEWORK.md`.

---

## Weekly mcap refresh (auto job)

**Mcap ₹ cr** in cap-tier tables is **live data** — refreshed weekly, not manual entry.

| Method | Command / endpoint |
|--------|-------------------|
| **Local script** | `cd web && npm run refresh-sector-mcap` |
| **API cron** | `GET /api/cron/refresh-sector-mcap` with `Authorization: Bearer $CRON_SECRET` |
| **Windows Task Scheduler** | Weekly Sunday 06:00 — run npm script above |

Source: Yahoo Finance NSE (`.NS`) via `web/lib/market-cap.ts` — same stack as Analysis Log cap buckets.

Each sector file gets: `**Mcap last refreshed:** YYYY-MM-DD (Yahoo NSE · weekly auto job)` under `## Cap tier universe`.

---

## Files

| File | Role |
|------|------|
| `SECTOR-CAP-TIER-FRAMEWORK.md` | This doc — structure + counts + rules |
| `[Sector]/[sector]-sector-outlook.md` | `## Cap tier universe` section body |
| Web `/industry-analysis/[sectorSlug]` | Sector score + cap tier tabs |
