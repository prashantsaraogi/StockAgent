# Ashok Leyland - Stock Parameters

**Ticker:** ASHOKLEY | **CMP:** Rs 163.75 (2026-09-14)
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
| **Owner Earnings Yield** | EPS / price (Buffett) | **Higher = cheaper** | **5.6%** | 5.6% | **3.7%** | -34% | **Expensive** on yield |
| **P/E** | Price / EPS | **Higher = pays more per Rs profit** | **18x** | 18x | **25.5x** | +50% | **Expensive** vs 10Y |
| **Intrinsic Value (@18x EPS)** | Normal fair value anchor | Price below IV = margin | **-** | - | **Rs 115** | - | Premium to IV **+50%** |
| **Premium to IV (%)** | (Price - IV) / IV | **Negative = below fair value** | *Pending full pull* | *Pending* | **+50%** | - | From TTM EPS x 18 |
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

## One-page verdict (Part 1) @ Rs 173

| Question | Answer |
|----------|--------|
| **Cheap or expensive vs own 10Y?** | P/E **27x** vs avg **18x** - **Expensive** vs 10Y |
| **Owner yield vs history?** | **3.7%** vs avg **5.6%** |
| **Full quality/safety rows?** | **Pending** - refresh Block B/C from annual report |


# Part 2 - Forward vision (next 5 years)

**Horizon:** FY2027-FY2031 | **Base:** normalized EPS = TTM run-rate (average); EPS CAGR **10%**; forward fair P/E **18x** (sector table - may differ from 10Y avg **18x**)

> Batch skeleton - override EPS/CAGR/fair P/E from `detail-analysis.md` after results. See `PARAMETERS-FRAMEWORK.md` Part 2.

## Assumptions

| Input | Pessimistic | **Base (average)** | Optimistic | Type |
|-------|------------:|-------------------:|-----------:|------|
| Normalized EPS (Year 0) | Rs 6.2 | **Rs 6.4** | Rs 6.6 | ASSUMPTION (= TTM proxy) |
| EPS CAGR (5Y) | 6% | **10%** | 14% | ASSUMPTION |
| Forward fair P/E | 15x | **18x** | 20x | ASSUMPTION |
| EPS FY31 | Rs 8.6 | **Rs 10.3** | Rs 12.3 | Calculated |
| 5Y fair price | Rs 129 | **Rs 185** | Rs 246 | Calculated |

## Forward @ CMP - Block A

| Parameter | Link to future price | **Base** | Pessimistic | Optimistic | **5Y fair (base)** | **Implied 5Y CAGR** | **Read** |
|-----------|---------------------|----------|-------------|------------|--------------------|---------------------|----------|
| Normalized EPS (Year 0) | Anchor | **Rs 6.4** | - | - | - | - | TTM proxy |
| Forward Owner Earnings Yield | Higher = cheaper | **3.7%** | - | - | - | - | At average EPS |
| Forward P/E | CMP / norm EPS | **27x** | - | - | - | - | vs forward fair 18x |
| Premium to forward IV | vs norm EPS x fair P/E | **+50%** | - | - | - | - | From base case |
| 5Y fair price (base) | EPS FY31 x fair P/E | - | Rs 129 | Rs 246 | **Rs 185** | **+1.4%** | See implied CAGR |
| Implied 5Y price CAGR | CMP to base fair | - | +-5.7% | +7.3% | - | **+1.4%** | Compare to ~12% hurdle |
| **Historical multiple trap** | 10Y avg >> forward fair | - | - | - | - | - | No |

## Forward - Blocks B/C

| Block | Status |
|-------|--------|
| B - Quality trajectory | *Pending* - ROE/moat path from annual report |
| C - Safety trajectory | *Pending* - leverage/regulatory from annual report |

## Past-vs-forward snapshot

| Question | Part 1 (10Y) | Part 2 (5Y) |
|----------|--------------|-------------|
| Cheap vs expensive? | **Expensive** vs 10Y | Implied 5Y CAGR **+1.4%** (base) |
| History misleads? | Compare 10Y avg 18x vs forward fair 18x | Trap flag: No |

---

## Data sources

| Input | Source | Type |
|-------|--------|------|
| CMP, TTM P/E, 10Y avg P/E | `upward/downward-averaging-pe-analysis.md` (25 Aug 2026) | FACT / ASSUMPTION |
| IV @ fair P/E | `PARAMETERS-FRAMEWORK.md` sector table | ASSUMPTION |
| Block B/C | Annual report pull pending | UNVERIFIED |

**Framework:** [`PARAMETERS-FRAMEWORK.md`](../../PARAMETERS-FRAMEWORK.md) | PCCL in `summary-analysis.md`

*Generated: 2026-08-29 | `_generate-all-parameters.ps1`*