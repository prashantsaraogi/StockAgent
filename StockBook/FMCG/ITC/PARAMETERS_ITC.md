# ITC - Stock Parameters

**Ticker:** ITC | **CMP:** Rs 263.9 (2026-10-07)
**Part 1:** FY2016-FY2025 (10Y rear-view) | **Part 2:** FY2027-FY2031 (5Y forward)

> **Batch-generated** - Part 1 from 10Y P/E; Part 2 skeleton from sector EPS CAGR + fair P/E. Deep-fill Blocks B/C + forward thesis from annual report. Hand-built: HDFCBANK, MAXHEALTH, HINDUNILVR.

---

## How to read this (30 seconds)

| Lens | Question |
|------|----------|
| **Part 1 - 10Y** | Cheap or expensive vs **own history**? |
| **Part 2 - 5Y forward** | At CMP, if **average** earnings grow, is 5Y return OK? |
| **Rule** | History does not have to repeat - read **both** before ADD |

---

# Part 1 - Rear-view (10Y history)

## Master table - Today vs 10Y average

### A - Price vs value

| Parameter | What it measures | Link to stock price | 10Y avg (normal) | 10Y avg (incl. COVID) | **Today @ CMP** | **vs normal avg** | **Read** |
|-----------|------------------|---------------------|------------------|----------------------|-----------------|-------------------|----------|
| **Owner Earnings Yield** | EPS / price (Buffett) | **Higher = cheaper** | **3.8%** | 3.8% | **5.9%** | +55% | **Cheap** on yield |
| **P/E** | Price / EPS | **Higher = pays more per Rs profit** | **26x** | 26x | **16.7x** | -35% | **Cheap** vs 10Y |
| **Intrinsic Value (@22x EPS)** | Normal fair value anchor | Price below IV = margin | **-** | - | **Rs 348** | - | Premium to IV **-23%** |
| **Premium to IV (%)** | (Price - IV) / IV | **Negative = below fair value** | *Pending full pull* | *Pending* | **-23%** | - | From TTM EPS x 22 |
| **Graham Number** | sqrt(22.5 x EPS x BVPS) | Max Graham fair price | *Pending* | *Pending* | *Pending* | - | Needs BVPS from AR |
| **Premium to Graham (%)** | vs Graham max | **Negative = Graham zone** | *Pending* | *Pending* | *Pending* | - | Refresh from AR |

### B - Business quality

| Parameter | What it measures | Link to stock price | 10Y avg (normal) | 10Y avg (incl. COVID) | **Today @ CMP** | **vs normal avg** | **Read** |
|-----------|------------------|---------------------|------------------|----------------------|-----------------|-------------------|----------|
| **ROE** | Return on equity | Higher ROE supports higher P/E | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |
| **DuPont margin / turnover** | ROE decomposition | Explains ROE quality | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |
| **Buffett ROE gate (>=15%)** | Pass = compounder | Justifies premium | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |

### C - Safety

| Parameter | What it measures | Link to stock price | 10Y avg (normal) | 10Y avg (incl. COVID) | **Today @ CMP** | **vs normal avg** | **Read** |
|-----------|------------------|---------------------|------------------|----------------------|-----------------|-------------------|----------|
| **Altman Z / Z-double-prime** | Distress score | Below 1.8 = watch (non-bank) | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |
| **Net debt / EBITDA** | Leverage (if applicable) | High = risk | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |

---

## One-page verdict (Part 1) @ Rs 269

| Question | Answer |
|----------|--------|
| **Cheap or expensive vs own 10Y?** | P/E **17x** vs avg **26x** - **Cheap** vs 10Y |
| **Owner yield vs history?** | **5.9%** vs avg **3.8%** |
| **Full quality/safety rows?** | **Pending** - refresh Block B/C from annual report |


# Part 2 - Forward vision (next 5 years)

**Horizon:** FY2027-FY2031 | **Base:** normalized EPS = TTM run-rate (average); EPS CAGR **7%**; forward fair P/E **22x** (sector table - may differ from 10Y avg **26x**)

> Batch skeleton - override EPS/CAGR/fair P/E from `detail-analysis.md` after results. See `PARAMETERS-FRAMEWORK.md` Part 2.

## Assumptions

| Input | Pessimistic | **Base (average)** | Optimistic | Type |
|-------|------------:|-------------------:|-----------:|------|
| Normalized EPS (Year 0) | Rs 15.3 | **Rs 15.8** | Rs 16.3 | ASSUMPTION (= TTM proxy) |
| EPS CAGR (5Y) | 4% | **7%** | 10% | ASSUMPTION |
| Forward fair P/E | 19x | **22x** | 24x | ASSUMPTION |
| EPS FY31 | Rs 19.3 | **Rs 22.2** | Rs 25.5 | Calculated |
| 5Y fair price | Rs 367 | **Rs 488** | Rs 612 | Calculated |

## Forward @ CMP - Block A

| Parameter | Link to future price | **Base** | Pessimistic | Optimistic | **5Y fair (base)** | **Implied 5Y CAGR** | **Read** |
|-----------|---------------------|----------|-------------|------------|--------------------|---------------------|----------|
| Normalized EPS (Year 0) | Anchor | **Rs 15.8** | - | - | - | - | TTM proxy |
| Forward Owner Earnings Yield | Higher = cheaper | **5.9%** | - | - | - | - | At average EPS |
| Forward P/E | CMP / norm EPS | **17x** | - | - | - | - | vs forward fair 22x |
| Premium to forward IV | vs norm EPS x fair P/E | **-23%** | - | - | - | - | From base case |
| 5Y fair price (base) | EPS FY31 x fair P/E | - | Rs 367 | Rs 612 | **Rs 488** | **+12.7%** | See implied CAGR |
| Implied 5Y price CAGR | CMP to base fair | - | +6.4% | +17.9% | - | **+12.7%** | Compare to ~12% hurdle |
| **Historical multiple trap** | 10Y avg >> forward fair | - | - | - | - | - | **YES** - 10Y avg P/E > forward fair |

## Forward - Blocks B/C

| Block | Status |
|-------|--------|
| B - Quality trajectory | *Pending* - ROE/moat path from annual report |
| C - Safety trajectory | *Pending* - leverage/regulatory from annual report |

## Past-vs-forward snapshot

| Question | Part 1 (10Y) | Part 2 (5Y) |
|----------|--------------|-------------|
| Cheap vs expensive? | **Cheap** vs 10Y | Implied 5Y CAGR **+12.7%** (base) |
| History misleads? | Compare 10Y avg 26x vs forward fair 22x | Trap flag: **YES** - 10Y avg P/E > forward fair |

---

## Data sources

| Input | Source | Type |
|-------|--------|------|
| CMP, TTM P/E, 10Y avg P/E | `upward/downward-averaging-pe-analysis.md` (25 Aug 2026) | FACT / ASSUMPTION |
| IV @ fair P/E | `PARAMETERS-FRAMEWORK.md` sector table | ASSUMPTION |
| Block B/C | Annual report pull pending | UNVERIFIED |

**Framework:** [`PARAMETERS-FRAMEWORK.md`](../../PARAMETERS-FRAMEWORK.md) | PCCL in `summary-analysis.md`

*Generated: 2026-08-29 | `_generate-all-parameters.ps1`*