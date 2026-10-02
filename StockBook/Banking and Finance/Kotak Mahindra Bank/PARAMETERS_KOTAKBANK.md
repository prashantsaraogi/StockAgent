# Kotak Mahindra Bank - Stock Parameters

**Ticker:** KOTAKBANK | **CMP:** Rs 419 (2026-09-14)
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
| **Owner Earnings Yield** | EPS / price (Buffett) | **Higher = cheaper** | **3.6%** | 3.6% | **5%** | +39% | **Cheap** on yield |
| **P/E** | Price / EPS | **Higher = pays more per Rs profit** | **28x** | 28x | **20.7x** | -29% | **Cheap** vs 10Y |
| **Intrinsic Value (@15x EPS)** | Normal fair value anchor | Price below IV = margin | **-** | - | **Rs 304** | - | Premium to IV **+33%** |
| **Premium to IV (%)** | (Price - IV) / IV | **Negative = below fair value** | *Pending full pull* | *Pending* | **+33%** | - | From TTM EPS x 15 |
| **Graham Number** | sqrt(22.5 x EPS x BVPS) | Max Graham fair price | *Pending* | *Pending* | *Pending* | - | Needs BVPS from AR |
| **Premium to Graham (%)** | vs Graham max | **Negative = Graham zone** | *Pending* | *Pending* | *Pending* | - | Refresh from AR |

### B - Business quality

| Parameter | What it measures | Link to stock price | 10Y avg (normal) | 10Y avg (incl. COVID) | **Today @ CMP** | **vs normal avg** | **Read** |
|-----------|------------------|---------------------|------------------|----------------------|-----------------|-------------------|----------|
| **ROE (DuPont result)** | Return on equity | Higher ROE supports higher P/B | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |
| **ROA (DuPont engine)** | Profit / assets | Core earning power | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |
| **Equity multiplier** | Assets / equity | Leverage amplifier | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |
| **Buffett ROE gate (>=15%)** | Pass = compounder | P/B premium justified | *Pending* | *Pending* | **UNVERIFIED** | - | See annual report |

### C - Safety

| Parameter | What it measures | Link to stock price | 10Y avg (normal) | 10Y avg (incl. COVID) | **Today @ CMP** | **vs normal avg** | **Read** |
|-----------|------------------|---------------------|------------------|----------------------|-----------------|-------------------|----------|
| **GNPA (%)** | Bad loans | Rising GNPA compresses P/B | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |
| **CAR (%)** | Capital buffer | Higher = safer | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |
| **Bank health (CAR/GNPA)** | Safety score | Higher = safer | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |
| **Altman Z (bank-adapted)** | Distress proxy | Low Z = tail risk | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |

---

## One-page verdict (Part 1) @ Rs 403

| Question | Answer |
|----------|--------|
| **Cheap or expensive vs own 10Y?** | P/E **19.9x** vs avg **28x** - **Cheap** vs 10Y |
| **Owner yield vs history?** | **5%** vs avg **3.6%** |
| **Full quality/safety rows?** | **Pending** - refresh Block B/C from annual report |


# Part 2 - Forward vision (next 5 years)

**Horizon:** FY2027-FY2031 | **Base:** normalized EPS = TTM run-rate (average); EPS CAGR **12%**; forward fair P/E **15x** (sector table - may differ from 10Y avg **28x**)

> Batch skeleton - override EPS/CAGR/fair P/E from `detail-analysis.md` after results. See `PARAMETERS-FRAMEWORK.md` Part 2.

## Assumptions

| Input | Pessimistic | **Base (average)** | Optimistic | Type |
|-------|------------:|-------------------:|-----------:|------|
| Normalized EPS (Year 0) | Rs 19.6 | **Rs 20.3** | Rs 20.9 | ASSUMPTION (= TTM proxy) |
| EPS CAGR (5Y) | 7% | **12%** | 17% | ASSUMPTION |
| Forward fair P/E | 13x | **15x** | 16x | ASSUMPTION |
| EPS FY31 | Rs 28.4 | **Rs 35.7** | Rs 44.4 | Calculated |
| 5Y fair price | Rs 369 | **Rs 536** | Rs 710 | Calculated |

## Forward @ CMP - Block A

| Parameter | Link to future price | **Base** | Pessimistic | Optimistic | **5Y fair (base)** | **Implied 5Y CAGR** | **Read** |
|-----------|---------------------|----------|-------------|------------|--------------------|---------------------|----------|
| Normalized EPS (Year 0) | Anchor | **Rs 20.3** | - | - | - | - | TTM proxy |
| Forward Owner Earnings Yield | Higher = cheaper | **5%** | - | - | - | - | At average EPS |
| Forward P/E | CMP / norm EPS | **19.9x** | - | - | - | - | vs forward fair 15x |
| Premium to forward IV | vs norm EPS x fair P/E | **+33%** | - | - | - | - | From base case |
| 5Y fair price (base) | EPS FY31 x fair P/E | - | Rs 369 | Rs 710 | **Rs 536** | **+5.9%** | See implied CAGR |
| Implied 5Y price CAGR | CMP to base fair | - | +-1.7% | +12% | - | **+5.9%** | Compare to ~12% hurdle |
| **Historical multiple trap** | 10Y avg >> forward fair | - | - | - | - | - | **YES** - 10Y avg P/E > forward fair |

## Forward - Blocks B/C

| Block | Status |
|-------|--------|
| B - Quality trajectory | *Pending* - ROE/moat path from annual report |
| C - Safety trajectory | *Pending* - leverage/regulatory from annual report |

## Past-vs-forward snapshot

| Question | Part 1 (10Y) | Part 2 (5Y) |
|----------|--------------|-------------|
| Cheap vs expensive? | **Cheap** vs 10Y | Implied 5Y CAGR **+5.9%** (base) |
| History misleads? | Compare 10Y avg 28x vs forward fair 15x | Trap flag: **YES** - 10Y avg P/E > forward fair |

---

## Data sources

| Input | Source | Type |
|-------|--------|------|
| CMP, TTM P/E, 10Y avg P/E | `upward/downward-averaging-pe-analysis.md` (25 Aug 2026) | FACT / ASSUMPTION |
| IV @ fair P/E | `PARAMETERS-FRAMEWORK.md` sector table | ASSUMPTION |
| Block B/C | Annual report pull pending | UNVERIFIED |

**Framework:** [`PARAMETERS-FRAMEWORK.md`](../../PARAMETERS-FRAMEWORK.md) | PCCL in `summary-analysis.md`

*Generated: 2026-08-29 | `_generate-all-parameters.ps1`*