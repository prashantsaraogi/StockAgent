# News — Search workflow (mandatory)

**Purpose:** Fix weak news pickup. Every daily run must cover the **full IST calendar day**, not only **market close (15:30)** headlines.

**Read with:** [`AGENT-RULES.md`](AGENT-RULES.md) · [`.cursor/portfolio/holdings.md`](../.cursor/portfolio/holdings.md)

---

## 1. IST calendar day — the search window

All news for summary **`News/YYYY-MM/DD/summary.md`** uses **date D in IST**:

```
Window = D 00:00:01 IST  →  D 23:59:59 IST
```

| Run time (example) | Window to search | Note |
|--------------------|------------------|------|
| **Sat 29 Aug 09:16 IST** | **29 Aug 00:01 – 09:16 IST** (partial) | Include **~9 hr** since midnight; **refresh again** before EOD |
| **Sat 29 Aug 20:00 IST** | **29 Aug 00:01 – 20:00 IST** | Still partial until **23:59** |
| **End of day refresh** | **29 Aug 00:01 – 23:59 IST** | Full calendar day |

**Critical rule:** A headline at **29 Aug 00:12 IST** (e.g. IGL CNG hike announced “late Friday evening”) belongs to **29 Aug** summary — **not** “no news” because markets were closed.

**Do NOT** treat “markets closed” as “no news day.” Corporate announcements, tariffs, CNG/LPG revisions, block-deal reports, and exchange filings publish **15:30–02:00 IST**.

---

## 2. Three time buckets (search each separately)

| Bucket | IST time | What gets missed if skipped |
|--------|----------|----------------------------|
| **A — Pre-market** | 00:01 – 09:14 | Late-night corp announcements (CNG, tariffs), global wraps, block-deal leaks |
| **B — Session** | 09:15 – 15:30 | Live market, results, sector moves, closing bell |
| **C — Post-close** | 15:31 – 23:59 | **Highest miss rate** — price hikes, board outcomes, “stocks to watch Monday”, US/global spillover |

**Previous failure mode:** Only bucket **B** (Fri close) was searched → **IGL CNG 00:12 IST** and similar **post-close** items missed.

---

## 3. Mandatory search algorithm (run in order)

When user asks **“run news for today”** or agent refreshes summary for date **D**:

### Step 0 — Setup

1. Set **D** = calendar date requested (usually today IST).
2. Set **T_now** = current IST time (or **23:59** if end-of-day backfill).
3. Read [`.cursor/portfolio/holdings.md`](../.cursor/portfolio/holdings.md) — all **50 tickers** + sectors.
4. Read prior **`News/YYYY-MM/(D-1)/summary.md`** for carry-forward only — **do not** skip fresh search on D.

Record in summary header:

```markdown
**Search window:** D YYYY-MM-DD **00:01 – HH:MM IST** (partial | full)
**Buckets scanned:** A Pre-market · B Session · C Post-close
```

### Step 1 — Macro + post-close (orientation pass only)

Run **once** across primary four — **not sufficient alone**:

| Pass | Query pattern (substitute D) | Target |
|------|------------------------------|--------|
| **Macro** | `site:<outlet> India market Nifty <Month> <day> 2026` | Index close, FII/DII, sector day |
| **Post-close** | `site:moneycontrol.com after market OR "effective from" OR "from 6 am" <Month> <day> 2026` | Late announcements (CNG, tariffs) |
| **Sector pulse** | `pharma OR banks OR IT OR CNG <Month> <day> 2026 site:moneycontrol.com` | Sector index moves only |

**Purpose:** Build first draft of summary + macro rows. **Do not stop here.**

**Previous failure mode:** Sector line *“Pharma green Fri”* → **missed Cipla USFDA + Maharashtra FDA** because **Cipla was never searched by name**.

---

### Step 2 — Stock-wise loop (mandatory — all 50 holdings)

**Core rule:** Search **each holding by company name**, one stock at a time. Macro/sector pass catches **some** news; stock-wise pass catches **company-specific** news (FDA, block deal, results, broker note, licence cancel).

```
FOR each row in holdings.md (50 tickers):
  1. SEARCH  — company name + ticker on all four outlets (date D ± 7 days for carry-forward)
  2. COLLECT — all headlines with IST timestamp ≤ min(T_now, D 23:59)
  3. COMPARE — vs summary row already written from Step 1 (macro/sector)
  4. GAP?    — if stock-wise found headline NOT in row → MERGE + log gap
  5. MARK    — coverage log: Searched ✓ | Gap filled / No gap / No D-dated hit
  NEXT stock
```

#### Per-stock query (run for **every** holding)

Substitute `<Company>`, `<TICKER>`, date **D**:

```
site:cnbctv18.com "<Company>" OR <TICKER> <Month> 2026
site:moneycontrol.com "<Company>" OR <TICKER> <Month> 2026
site:economictimes.indiatimes.com "<Company>" OR <TICKER> <Month> 2026
site:ndtvprofit.com "<Company>" OR <TICKER> <Month> 2026
```

**Minimum 4 queries per stock** (one per outlet). Batch only **after** each name in batch was individually gap-checked.

#### Gap-check question (mandatory after each stock)

> **“What did I miss for `<Company>` that macro/sector pass did not capture?”**

| Outcome | Action |
|---------|--------|
| **Gap found** | Update primary table row; add detail section if material; log in stock-wise coverage |
| **No gap** | Row stands; log **“Searched — no gap vs macro”** or **“No D-dated material headline”** |
| **Carry-forward only** | Headline dated **D−1…D−7** still unresolved (FDA, legal, block pending) → include with date + **carry-forward** tag |

#### Example — why stock-wise matters (29 Aug 2026)

| Stock | Macro/sector pass said | Stock-wise search found (missed) |
|-------|------------------------|----------------------------------|
| **Bharti Airtel** | Telecom weak / index drag | **Singtel comments**, **~2.3% block** report, Raymond James note |
| **Cipla** | *“Pharma sector green Fri”* | **USFDA 7 observations** Pithampur (**25 Aug**); **Maharashtra FDA cancels Pune C&F licence** (**27 Aug**) |
| **IGL** | Oil & gas stable | **CNG +Rs 3.89/kg** (**29 Aug 00:12**) — post-close bucket |

#### Order when time-constrained

| Priority | Order | Rule |
|----------|-------|------|
| **1** | Surplus top 10 + loss-registry + fresh trades | Never skip |
| **2** | Remaining 40 — **alphabetical by company name** | Complete full book before closing |
| **3** | Never substitute “sector green” for a stock row | Sector ≠ stock |

If truly time-limited: state **“Stock-wise: N/50 complete — resume before EOD”** in summary header.

### Step 3 — Secondary cross-check

| Source | When |
|--------|------|
| **BSE/NSE** bulk-block deals | Any block-deal headline (Bharti, promoter sales) |
| **BSE filings** | Results, board, tariff orders |
| **RBI / PIB** | Rate, CPI, policy |
| **Reuters / IANS** | Geopolitical only if primary four thin |

### Step 4 — Timestamp filter (strict)

Include a headline in **D** summary only if published timestamp is:

```
D 00:00:01 IST  ≤  published  ≤  min(T_now, D 23:59:59 IST)
```

- If article says **“August 29, 2026 / 00:12 IST”** → **include** on 29 Aug.
- If article is **28 Aug 16:10** market close → include on **28 Aug** summary (or carry-forward note on 29 Aug if material and missed).

**Always store:** outlet name + **published time IST** in News column or detail section.

### Step 5 — Write summary + index

1. Primary table — **Stock name · News · Impact · …**
2. Dedicated sections for material names (IGL, Bharti-style)
3. [`TICKER-INDEX.md`](TICKER-INDEX.md) — one row per material hit
4. Affected `StockBook/` files — light update minimum `summary-analysis.md`

### Step 6 — Stock-wise coverage log (write to summary)

After Step 2, append a table — **one row per holding**:

```markdown
## Stock-wise coverage log (D — 00:01–HH:MM IST)

| # | Company | Stock-wise searched? | Gap vs macro? | Headline / result |
|---|---------|:--------------------:|:-------------:|-------------------|
| 5 | Bharti Airtel | ✓ 4/4 outlets | **Yes** | Singtel comments + block overhang |
| 6 | Cipla | ✓ 4/4 outlets | **Yes** | USFDA 7 obs (25 Aug); MH FDA Pune licence (27 Aug) |
| … | … | … | … | … |
| 50 | Dr Reddy's | ✓ 4/4 outlets | No | Pharma green Fri only |
```

**Gap = Yes** when stock-wise search adds **any** fact not already in that row from macro/sector pass.

### Step 7 — Coverage self-check (before finishing)

Answer **yes** to all:

- [ ] All **four** primary outlets searched with **date D** (macro pass)?
- [ ] **Bucket C (post-close)** explicitly searched?
- [ ] **Stock-wise loop: 50/50** holdings searched by company name (or partial count stated)?
- [ ] **Gap-check** run for each stock searched?
- [ ] Any holding with **user-mentioned** headline included?
- [ ] **Search window** line in summary header?
- [ ] **Neutral** rows say **“Searched stock-wise — no D-dated hit”** (not sector proxy)?

If any **no** → run missing stock-wise passes before closing.

---

## 4. Example — 29 Aug 2026 @ 09:16 IST (partial day)

| Time (IST) | Event | Bucket | Outlet |
|------------|-------|--------|--------|
| 00:12 | IGL CNG +Rs 3.89/kg → Rs 86.98 | A | Moneycontrol |
| 08:23 | IGL CNG hike (city-wise rates) | A | ET |
| *(Fri 28 session)* | Nifty 24,176; IT +3.5% | B | CNBC-TV18, Moneycontrol |
| *(Fri 27)* | Bharti −1% Singtel comments | B | CNBC-TV18 |

**29 Aug summary must include IGL** even though run is morning and markets closed.

---

## 5. Refresh cadence

| When | Action |
|------|--------|
| **Morning (08:00–10:00 IST)** | Partial window **00:01 – T_now** — catch overnight/post-close |
| **After close (16:00–18:00 IST)** | Add bucket **B + C** for session |
| **Late evening (21:00–23:00 IST)** | Final pass bucket **C** |
| **User asks anytime** | Search **00:01 – T_now**; state partial vs full |

Same file **`summary.md`** for date D — **merge/update**, do not create duplicate dates.

---

## 6. Search query cheat sheet (portfolio sectors)

Copy and adapt for date **D**:

```
site:moneycontrol.com Indraprastha Gas CNG <Month> <day> 2026
site:cnbctv18.com Bharti Airtel Singtel block <Month> 2026
site:economictimes.indiatimes.com HDFC Bank <Month> <day> 2026
site:ndtvprofit.com Nifty market <Month> <day> 2026
site:moneycontrol.com "effective from" OR "6 am" CNG LPG tariff <Month> <day> 2026
site:cnbctv18.com "stocks to watch" <Month> <day> 2026
```

---

## 7. What “Neutral / no headline” means

**Allowed only after** **stock-wise** search (company name, 4 outlets) on date D returned nothing.

**Not allowed:**

- “Pharma sector green” as proxy for **Cipla / Lupin / Sun** individually
- “No fresh headline” because only market close was read
- Assuming weekend = no corporate news
- Skipping a name because sector was “stable” on Fri

Use: **“Searched stock-wise (4/4) — no D-dated material headline”** if truly empty.

---

## 8. Anti-patterns (do not repeat)

| Bad | Good |
|-----|------|
| One macro pass → 50 rows from sector tags | Macro pass → **50 stock-wise passes** → gap merge |
| “Pharma +ve Fri” for all 6 pharma names | **Cipla**, **Lupin**, **Dr Reddy's** … each searched |
| T1 only (10 names), rest assumed neutral | **50/50** or explicit **N/50 partial** |
| User flags miss → add one row | Rerun **stock-wise loop** for full book |

---

*Last updated: 29 Aug 2026 — stock-wise loop + Cipla gap example*
