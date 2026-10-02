# Stock Parameters Framework

**Created:** 29 Aug 2026 · **Updated:** 29 Aug 2026 (forward 5Y lens)  
**Purpose:** One **readable master table per stock** with **two lenses**:

1. **Rear-view (10Y)** — how the market **priced** this business in the past  
2. **Forward vision (5Y)** — what parameters look like if **average/normalized earnings** grow — **history does not have to repeat**

Cross-ref: `StockBook/AGENT-RULES.md` · `StockBook/PE-EVALUATION-FRAMEWORK.md` (purchase vs today scorecard) · `pccl-analysis` · `valuation-analysis`

---

## Core idea — past ≠ future

| Lens | Question | Example (HUL) |
|------|----------|---------------|
| **10Y rear-view** | Was the stock **cheap or expensive vs its own history**? | P/E **43×** vs 10Y avg **55×** → looks **cheap** |
| **5Y forward** | At **today's CMP**, if earnings grow at **average** rate and the market pays a **fair** (not historical) multiple — is return acceptable? | Fair forward P/E **~42×** (not 55×) · slow EPS growth → **modest** 5Y return · **−17%** on book because bought when it was a **darling** |

**Rule:** Never conclude “cheap” from 10Y alone. Always read **Part 2** before ADD.

**Subordinate rule (Sep 2026):** Part 2 forward P/E is **confirmatory only** — never the
sole reason for surplus #1 or Axis B **Fair**. Run **`sector-news-orientation-lens.md`**
(Module E) first; apply forward EPS **haircut** if L2 policy/competition active.
Primary fair for buy decisions = **normalized trailing EPS × conviction P/E** (if user
stated) or Applied PCCL — see `buy-decision-workflow.md` Step 4.5–5.

---

## File naming & sections

| Item | Rule |
|------|------|
| **File** | `PARAMETERS_[TICKER].md` in same folder as `summary-analysis.md` |
| **Part 1** | Rear-view — Today vs 10Y average (Blocks A/B/C) |
| **Part 2** | Forward vision — next 5Y @ average earnings (Blocks A/B/C) |
| **Extras** | How to read · verdict · COVID check · **past-vs-forward trap** · appendix |

---

## Part 1 — Rear-view (10Y history)

### Design — average first, years in appendix

**Problem:** 10 year-columns + 15 rows = unreadable.  
**Fix:** Master table has **only averages + today**. Year-by-year → **appendix**.

### Master table columns (Part 1)

| Column | Content |
|--------|---------|
| **Parameter** | Short name |
| **What it measures** | One line — plain English |
| **Link to stock price** | How this number moves the share price |
| **10Y avg (normal)** | Mean FY2016–FY2025 **excluding FY2020 & FY2021** |
| **10Y avg (incl. COVID)** | Mean all 10 years |
| **Today @ CMP** | Current value |
| **vs normal avg** | `(Today − normal avg) / normal avg` |
| **Read** | Cheap / Fair / Expensive / Strong / Weak |

**Blocks:** A — Price vs value · B — Business quality · C — Safety

### 10-year window

| Label | Calculation |
|-------|-------------|
| **10Y avg (normal)** | FY2016–FY2025, **drop FY2020 & FY2021** (8 years) |
| **10Y avg (incl. COVID)** | All 10 years |
| **Today @ CMP** | Latest NSE CMP + TTM/normalized inputs · state date |

---

## Part 2 — Forward vision (next 5 years)

**Window:** FY2027–FY2031 (5 years from today)  
**Horizon label:** “Next 5Y @ CMP”

### Forward earnings rule — “average” base case

| Input | Base case definition | Label |
|-------|---------------------|-------|
| **Normalized EPS (Year 0)** | **Average sustainable EPS** — usually TTM adjusted for one-offs; cyclicals use mid-cycle normalized EPS from Report | **OUR ASSUMPTION** |
| **EPS CAGR (5Y)** | Normal case growth — **not** bull management guidance; use sector + thesis from `detail-analysis.md` | **OUR ASSUMPTION** |
| **Forward fair P/E** | Sector fair multiple **today** — may be **below** 10Y avg if structural de-rating (FMCG, IT) or **above** if quality upgrade | **OUR ASSUMPTION** |
| **Pessimistic / Optimistic** | EPS CAGR ±40% of base; fair P/E ±15% of forward fair | **HYPOTHESIS** |

**Do not** assume historical average P/E is the forward fair P/E unless thesis supports it.

### Master table columns (Part 2)

| Column | Content |
|--------|---------|
| **Parameter** | Same family as Part 1 where applicable |
| **Link to future price** | How this drives price over 5Y |
| **Base (avg earnings)** | Value @ today's CMP using normalized EPS |
| **Pessimistic** | Lower EPS CAGR + lower fair P/E |
| **Optimistic** | Higher EPS CAGR + higher fair P/E |
| **5Y fair price (base)** | Normalized EPS × (1+CAGR)⁵ × forward fair P/E |
| **Implied 5Y CAGR** | `(5Y fair price ÷ CMP)^(1/5) − 1` |
| **Read** | Attractive / Fair / Stretched / Value trap |

### Part 2 — Block A (mandatory rows)

| Parameter | Forward meaning |
|-----------|-----------------|
| **Normalized EPS (Year 0)** | Anchor for all forward math |
| **Forward Owner Earnings Yield** | Normalized EPS ÷ CMP — yield if earnings stay “average” |
| **Forward P/E** | CMP ÷ normalized EPS — **not** TTM spike/trough |
| **Forward fair P/E** | Multiple market *should* pay in normal case (may ≠ 10Y avg) |
| **Premium to forward IV** | (CMP − norm EPS × forward fair P/E) ÷ forward IV |
| **EPS FY31 (base)** | Normalized × (1 + CAGR)⁵ |
| **5Y fair price (base)** | EPS FY31 × forward fair P/E |
| **Implied 5Y price CAGR** | From CMP to 5Y fair price (base) |
| **Historical multiple trap** | Flag if 10Y avg P/E **>>** forward fair P/E — past “cheap” is misleading |

### Part 2 — Block B (quality trajectory)

| Parameter | Forward question |
|-----------|------------------|
| **ROE trajectory** | Maintaining / fading / recovering? |
| **Moat vs disruption** | Structural threat changes sustainable ROE? |
| **Buffett gate (forward)** | Will ROE stay ≥15% through FY31? |

### Part 2 — Block C (safety trajectory)

| Parameter | Forward question |
|-----------|------------------|
| **Balance sheet** | Debt/Altman/CAR path |
| **Regulatory / legal** | Unresolved overhang resolved or worsening? |

### Past-vs-forward verdict (mandatory)

Short table answering:

| Question | Part 1 (10Y) | Part 2 (5Y forward) |
|----------|--------------|---------------------|
| Cheap or expensive? | … | … |
| Can holder earn acceptable return? | N/A | Implied 5Y CAGR vs your hurdle (~12%?) |
| History misleads? | Darling trap Y/N | … |
| Relates to PCCL? | … | Forward base vs PCCL |

---

## Parameter set (Part 1 blocks — unchanged)

### All stocks — block A (price vs value)

Owner Earnings Yield · P/E · P/B (or P/S) · Premium to IV · Premium to Graham

### All stocks — block B (quality)

ROE · DuPont ROA · DuPont equity mult · Buffett ROE gate (≥15%)

### Banks — block C

GNPA · CAR · Bank health · Altman Z (bank-adapted)

### Non-banks — block C

Altman Z / Z'' · Net debt/EBITDA · FCF yield (sector)

---

## Sector defaults — forward fair P/E & EPS CAGR (base)

Use Report thesis to override. Batch script uses these when no override.

| Sector | Forward fair P/E | Base EPS CAGR (5Y) | Notes |
|--------|------------------:|-------------------:|-------|
| Private bank | 15× | 12% | GNPA cycle |
| Pharma | 20× | 12% | US exposure adjust per name |
| FMCG | 40× | 7% | **Forward fair < 10Y avg** common (HUL) |
| IT | 20× | 8% | Structural headwind — don't use old 24× |
| Healthcare/hospital | 42× | 15% | Bed ramp names higher |
| Auto | 22× | 10% | Cycle-normal EPS |
| OMC | 10× | 5% | Normalized mid-cycle EPS only |
| Telecom | 28× | 12% | ARPU + tariff |

**PCCL ≠ forward IV.** PCCL = pessimistic floor. Forward IV = normal case @ average earnings.

---

## Mandatory extras per file

1. **How to read (30 seconds)** — both lenses  
2. **One-page verdict** — rear-view + forward  
3. **Past-vs-forward trap** — especially darling / cost underwater  
4. **COVID check** (Part 1)  
5. **Appendix** — year-by-year history only  

---

## Agent workflow and batch script

1. **Before** valuation refresh → read `PARAMETERS_[TICKER].md` **Part 1 + Part 2**  
2. **After** annual results → refresh normalized EPS + forward CAGR from thesis  
3. **Batch all 50:** `StockBook/_generate-all-parameters.ps1` — Part 2 skeleton auto; deep-fill top names by hand  
4. **Portfolio index:** `.cursor/portfolio/portfolio-parameters.md` (10Y P/E); add forward column later  

```powershell
cd Report
.\_generate-all-parameters.ps1
```

---

## Samples

| File | Why |
|------|-----|
| [`HDFC Bank/PARAMETERS_HDFCBANK.md`](Banking%20and%20Finance/HDFC%20Bank/PARAMETERS_HDFCBANK.md) | Full Part 1 hand-built |
| [`Max Healthcare/PARAMETERS_MAXHEALTH.md`](Healthcare/Max%20Healthcare/PARAMETERS_MAXHEALTH.md) | Part 2 forward + **L10** — forward subordinate when room-rent L2 |
| [`Hindustan Unilever/PARAMETERS_HINDUNILVR.md`](FMCG/Hindustan%20Unilever/PARAMETERS_HINDUNILVR.md) | **Darling trap** — cheap vs 10Y but weak forward / underwater cost |
| [`Hero MotoCorp/PARAMETERS_HEROMOTOCO.md`](Auto/Hero%20MotoCorp/PARAMETERS_HEROMOTOCO.md) | Auto · SIAM volume · forward ~14% CAGR |
| [`Larsen and Toubro/PARAMETERS_LT.md`](Infrastructure/Larsen%20and%20Toubro/PARAMETERS_LT.md) | Infra ADD · order book · forward ~11% |
| [`Tata Consumer/PARAMETERS_TATACONSUM.md`](FMCG/Tata%20Consumer%20Products/PARAMETERS_TATACONSUM.md) | FMCG growth vs HUL trap |
| [`Bharti Airtel/PARAMETERS_BHARTIARTL.md`](Telecom/Bharti%20Airtel/PARAMETERS_BHARTIARTL.md) | Telecom · ARPU · forward modest |

---

*Last updated: 3 Sep 2026*
