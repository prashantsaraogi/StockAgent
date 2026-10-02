# Samvardhana Motherson - Stock Parameters

**Ticker:** MOTHERSON | **CMP:** Rs 164.45 (2026-09-14)
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
| **Owner Earnings Yield** | EPS / price (Buffett) | **Higher = cheaper** | **5%** | 5% | **2.6%** | -48% | **Expensive** on yield |
| **P/E** | Price / EPS | **Higher = pays more per Rs profit** | **20x** | 20x | **40.8x** | +92% | **Expensive** vs 10Y |
| **Intrinsic Value (@20x EPS)** | Normal fair value anchor | Price below IV = margin | **-** | - | **Rs 81** | - | Premium to IV **+91%** |
| **Premium to IV (%)** | (Price - IV) / IV | **Negative = below fair value** | *Pending full pull* | *Pending* | **+91%** | - | From TTM EPS x 20 |
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

## One-page verdict (Part 1) @ Rs 155

| Question | Answer |
|----------|--------|
| **Cheap or expensive vs own 10Y?** | P/E **38.4x** vs avg **20x** - **Expensive** vs 10Y |
| **Owner yield vs history?** | **2.6%** vs avg **5%** |
| **Full quality/safety rows?** | **Pending** - refresh Block B/C from annual report |


# Part 2 - Forward vision (next 5 years)

**Horizon:** FY2027-FY2031 | **Base:** normalized EPS = TTM run-rate (average); EPS CAGR **10%**; forward fair P/E **20x** (sector table - may differ from 10Y avg **20x**)

> Batch skeleton - override EPS/CAGR/fair P/E from `detail-analysis.md` after results. See `PARAMETERS-FRAMEWORK.md` Part 2.

## Assumptions

| Input | Pessimistic | **Base (average)** | Optimistic | Type |
|-------|------------:|-------------------:|-----------:|------|
| Normalized EPS (Year 0) | Rs 3.9 | **Rs 4** | Rs 4.2 | ASSUMPTION (= TTM proxy) |
| EPS CAGR (5Y) | 6% | **10%** | 14% | ASSUMPTION |
| Forward fair P/E | 17x | **20x** | 22x | ASSUMPTION |
| EPS FY31 | Rs 5.4 | **Rs 6.5** | Rs 7.8 | Calculated |
| 5Y fair price | Rs 92 | **Rs 130** | Rs 172 | Calculated |

## Forward @ CMP - Block A

| Parameter | Link to future price | **Base** | Pessimistic | Optimistic | **5Y fair (base)** | **Implied 5Y CAGR** | **Read** |
|-----------|---------------------|----------|-------------|------------|--------------------|---------------------|----------|
| Normalized EPS (Year 0) | Anchor | **Rs 4** | - | - | - | - | TTM proxy |
| Forward Owner Earnings Yield | Higher = cheaper | **2.6%** | - | - | - | - | At average EPS |
| Forward P/E | CMP / norm EPS | **38.4x** | - | - | - | - | vs forward fair 20x |
| Premium to forward IV | vs norm EPS x fair P/E | **+91%** | - | - | - | - | From base case |
| 5Y fair price (base) | EPS FY31 x fair P/E | - | Rs 92 | Rs 172 | **Rs 130** | **+-3.5%** | See implied CAGR |
| Implied 5Y price CAGR | CMP to base fair | - | +-9.9% | +2.1% | - | **+-3.5%** | Compare to ~12% hurdle |
| **Historical multiple trap** | 10Y avg >> forward fair | - | - | - | - | - | No |

## Forward - Blocks B/C

| Block | Status |
|-------|--------|
| B - Quality trajectory | *Pending* - ROE/moat path from annual report |
| C - Safety trajectory | *Pending* - leverage/regulatory from annual report |

## Past-vs-forward snapshot

| Question | Part 1 (10Y) | Part 2 (5Y) |
|----------|--------------|-------------|
| Cheap vs expensive? | **Expensive** vs 10Y | Implied 5Y CAGR **+-3.5%** (base) |
| History misleads? | Compare 10Y avg 20x vs forward fair 20x | Trap flag: No |

---

## Data sources

| Input | Source | Type |
|-------|--------|------|
| CMP, TTM P/E, 10Y avg P/E | `upward/downward-averaging-pe-analysis.md` (25 Aug 2026) | FACT / ASSUMPTION |
| IV @ fair P/E | `PARAMETERS-FRAMEWORK.md` sector table | ASSUMPTION |
| Block B/C | Annual report pull pending | UNVERIFIED |

**Framework:** [`PARAMETERS-FRAMEWORK.md`](../../PARAMETERS-FRAMEWORK.md) | PCCL in `summary-analysis.md`

*Generated: 2026-08-29 | `_generate-all-parameters.ps1`*