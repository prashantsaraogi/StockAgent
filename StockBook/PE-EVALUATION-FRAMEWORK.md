# PE Evaluation Framework — Stock Valuation Scorecard

**Created:** 7 Sep 2026  
**Purpose:** Stock-agnostic lens separating **“Was my purchase good?”** from **“Is the stock attractive today?”**  
**Web:** Stock Calculator → **PE Evaluation Framework** tab  
**Persistence:** Each run saved per user — disk `data/users/{tenant}/stock-calculator/pe-evaluation/` + Supabase `pe_evaluation_history` (migration `004_pe_evaluation_history.sql`)  
**Cross-ref:** `PARAMETERS-FRAMEWORK.md` (Part 1 rear-view · Part 2 forward) · `pccl-analysis` · `long-term-investor-mandate.md`

---

## Core principle

> **Stock attractiveness = Business quality × Earnings growth × Reasonable valuation**  
> Not: **Stock attractiveness = Low P/E alone**

Never decide from P/E alone. The powerful combination:

| Pattern | Read |
|---------|------|
| EPS ↑ + Revenue ↑ + ROCE healthy + P/E ↓/stable | 🟢 Very attractive |
| EPS ↓ + Revenue ↓ + P/E ↑ | 🔴 Dangerous |
| EPS ↑ + P/E ↓ | 🟢 Market de-rating while business improves — expensive entry can heal |

---

## Required inputs (web + agent)

| Input | Rule |
|-------|------|
| **Stock name / ticker** | Resolve via StockBook |
| **Purchase price** | Your actual cost per share (₹) |
| **Purchase date** | ISO date — for years held & backward EPS estimate |

Optional (improves accuracy): purchase-time TTM EPS from filings — if user states it, use **FACT**; else engine back-calculates from PARAMETERS base EPS CAGR (**ASSUMPTION**).

---

## Part A — Was my purchase good?

### Step 1: Purchase P/E

```
Purchase P/E = Purchase price ÷ TTM EPS at/around purchase date
```

| Purchase P/E | Initial valuation |
|-------------:|-------------------|
| <15× | 🟢 Cheap |
| 15–20× | 🟢 Attractive |
| 20–25× | 🟡 Reasonable |
| 25–30× | 🟠 Premium |
| 30–40× | 🔴 Expensive |
| >40× | 🔴 Very expensive |

**Do not stop at P/E alone.** A 35× P/E name growing EPS 30% can beat a 15× stagnant name.

---

## Part B — What happened after I bought?

### EPS growth since purchase

```
EPS growth % = (EPS today ÷ EPS at purchase − 1) × 100
```

| EPS growth since purchase | Assessment |
|--------------------------:|------------|
| >50% | 🟢 Excellent |
| 25–50% | 🟢 Good |
| 10–25% | 🟡 Moderate |
| 0–10% | 🟠 Weak |
| <0% | 🔴 Bad |

### P/E compression rule

Compare **Purchase P/E → Current P/E**.

| P/E trend | EPS trend | Verdict |
|-----------|-----------|---------|
| ↓ | ↑ | 🟢 Usually healthy — business improved, market less euphoric |
| ↓ | ↓ | 🔴 Warning |
| ↑ | ↑ | 🟡 Growth priced in — check forward P/E |
| ↑ | ↓ | 🔴 Dangerous |

---

## Part D — Gordon fair P/E anchor (confirmatory)

**Web:** Stock Calculator → PE Evaluation → **Gordon fair P/E** panel (interactive)

Simplified earnings-yield rule — **not** a buy signal alone:

```
Fair P/E = 1 / (Required Return − Long-term Earnings Growth)
```

| Input | Rule |
|-------|------|
| **Required return** | Your **nominal** equity hurdle (e.g. **12%**) — if you want 12%, use 12; do not add inflation on top unless you define it that way |
| **Earnings growth** | **Sustainable long-term** EPS CAGR — conservative **7–8%** for Nifty-style macro; stock default from PARAMETERS Part 2 base EPS CAGR |
| **Invalid case** | If growth ≥ required return → formula undefined (negative denominator) — assumptions inconsistent |

### Forward — fair P/E from growth

```
Fair P/E = 1 / (Required Return − Earnings Growth)
```

### Inverse — implied growth from current P/E

```
Implied G = Required Return − 1/PE     (percent: G = R% − 100/PE)
```

Example @ 12% required, PE 35× → G = 12% − 2.86% = **9.14%** (not 5%).

Compare **implied G** to **PARAMETERS base EPS CAGR** — if expected growth ≥ implied, P/E may be justified at that hurdle.

### Example @ 12% required return

| Long-term EPS growth | Fair P/E |
|---------------------:|---------:|
| 6% | 16.7× |
| 7% | 20× |
| 8% | 25× |
| 9% | 33.3× |
| 10% | 50× |

### Inverse table @ 12% required

| P/E | Earnings yield | Implied G needed |
|----:|---------------:|-----------------:|
| 20× | 5.0% | 7.0% |
| 35× | 2.86% | 9.14% |
| 60× | 1.67% | 10.33% |
| 100× | 1.0% | 11.0% |

PE 60 vs 35 needs only ~**1.2 pp** more growth — relationship is **not linear**; high P/E approaches required return asymptotically.

### vs other framework lenses

| Lens | Role |
|------|------|
| **Gordon fair P/E** | Macro / hurdle sanity check — sensitive when g ≈ r |
| **PARAMETERS 10Y avg P/E** | Cheap vs **own history** |
| **PARAMETERS forward fair P/E** | Thesis-based sector multiple — may ≠ Gordon |
| **PCCL** | Pessimistic stress buy limit |
| **8-point scorecard** | Purchase quality + today attractiveness |

**Nifty context (Sep 2026):** trailing P/E ~20 with conservative 7–8% long-term growth and 12% hurdle → Gordon fair ~20–25× → roughly **fair to mildly attractive** at index level — individual stocks still need full framework.

Label: **ASSUMPTION** for r and g inputs · **FACT** for current trailing P/E from live CMP.

---

## Part C — Is the stock attractive TODAY?

**Ignore your purchase price.** Ask:

> **Would I buy this stock today at today's CMP with fresh cash?**

Prevents anchoring: *“I bought at ₹12,000 so I must wait for ₹12,000.”*

### Five holder discipline questions

1. Would I buy it **today at CMP**?
2. Is the business **better or worse** than at purchase?
3. Are **earnings higher or lower** than at purchase?
4. Is **today's P/E justified** by today's/future earnings?
5. Is there a **better stock at similar valuation** for **fresh surplus**? (Not sell-to-rotate.)

---

## 8-point current scorecard (quarterly)

Score each **+1 Good · 0 Neutral · −1 Bad**:

| # | Metric | Bucket (weight) |
|---|--------|-----------------|
| 1 | Current P/E vs 10Y history | Valuation **40%** |
| 2 | Forward P/E vs forward fair P/E | Valuation |
| 3 | EPS growth (since purchase or forward base) | Business **40%** |
| 4 | Revenue / volume growth | Business |
| 5 | Operating margin (EBITDA) | Business |
| 6 | ROCE / ROE | Business |
| 7 | Debt / balance sheet | Risk **20%** |
| 8 | Latest 2–3 quarters trend | Risk |

**Raw sum:** −8 to +8  
**Bucket scores:** each bucket mapped to **__/10** then blended:

```
Overall = Valuation×0.40 + Business×0.40 + Risk×0.20
```

### Decision bands (fresh capital)

| Raw / weighted | Fresh surplus | Existing holder (long-term mandate) |
|----------------|---------------|-------------------------------------|
| +6 to +8 | 🟢 BUY / ADD | HOLD · selective add if PCCL/tier allows |
| +4 to +5 | 🟢 HOLD / selective ADD | HOLD · token SIP |
| +2 to +3 | 🟡 HOLD | HOLD · pause new adds if expensive |
| 0 to +1 | 🟠 WAIT / no fresh ₹ | HOLD legacy · 0% surplus |
| <0 | 🔴 AVOID fresh entry | HOLD legacy unless Tier-1 exit · **no TRIM for valuation alone** |

---

## Data sources (agent + web)

1. Live **CMP** — NSE / Yahoo (`nse-cmp.ts`)
2. **PARAMETERS_[TICKER].md** — Part 1 P/E, 10Y avg, ROE, EBITDA, forward P/E, EPS CAGR base
3. **summary-analysis.md** — recent quarter tone
4. **internal-negative-risk.md** / **external-negative-risk.md** — risk bucket
5. Purchase EPS at date — user stated **FACT**; else backward from base EPS CAGR **ASSUMPTION**

Label every field: **FACT · ASSUMPTION · HYPOTHESIS · UNVERIFIED**.

---

## Quarterly checklist template

```text
Stock: ___________
Current price: ₹____
Purchase price: ₹____
Purchase date: ____

1. Purchase P/E              ___×
2. Current P/E               ___×
3. Forward P/E               ___×
4. EPS growth since buy      ___%
5. Revenue / volume growth   ___%
6. Operating margin          ___%
7. ROCE / ROE                ___%
8. Debt                      ___

P/E trend                    ↑ / ↓
EPS trend                    ↑ / ↓
Business trend               ↑ / ↓
Recent quarter               ↑ / → / ↓

VALUATION SCORE              __/10
BUSINESS SCORE               __/10
RISK SCORE                   __/10

OVERALL (fresh surplus)      BUY / HOLD / WAIT / AVOID
OVERALL (legacy holder)      HOLD / PAUSE ADDS / (Tier-1 exit only)
```

---

## Agent workflow

When user provides stock + purchase price + purchase date:

1. Read this file + `PARAMETERS_[TICKER].md` + latest News for ticker
2. Run Part A → B → C in order
3. Output driver table with evidence type
4. Separate **purchase quality** vs **today attractiveness**
5. Apply **long-term-investor-mandate** for legacy — no TRIM/SELL for score alone
6. Write material updates to `faq.md` if user confirms position context

---

## Related frameworks

| File | Role |
|------|------|
| `PARAMETERS-FRAMEWORK.md` | 10Y rear-view + 5Y forward PARAMETERS tables |
| `investor-wisdom/buy-decision-workflow.md` | ADD gate for fresh capital |
| `pccl-analysis/` | Pessimistic buy limit — separate from scorecard |
| `portfolio-analysis/long-term-investor-mandate.md` | Legacy HOLD vs fresh surplus rank |

*Framework version 1.1 — Sep 2026 (Part D Gordon fair P/E)*
