---
name: valuation-analysis
description: >-
  Evaluate whether an Indian stock's price is attractive, reasonable,
  or expensive using normalized earnings, scenario valuation, margin
  of safety, premium to PCCL, turnaround catalyst assessment, and PCCL.
  Use for fair value, recovery thesis, or buy/sell decisions on NSE/BSE stocks.
---

# Valuation Analysis Skill

## Category

**VALUATION** — fair value scenarios, MoS vs IV, catalyst probability.
**Not PCCL** — defer buy limit to `pccl-analysis`.

See [SKILL-CATEGORIES.md](../SKILL-CATEGORIES.md).

## Purpose

Evaluate whether the current market price is **attractive, reasonable,
or excessive** relative to sustainable earnings, business quality, risk,
and conservative intrinsic value.

Implements `stock-agent.mdc` sections 4 (Growth Reality), 11 (Margin of
Safety), and valuation portions of section 16 (Decision Matrix).

---

## Framework Alignment

Classify as: **FACT**, **MANAGEMENT CLAIM**, **HYPOTHESIS**,
**OUR ASSUMPTION**, **UNVERIFIED**.

Never invent valuation metrics or normalized earnings.

State **date checked** for all price and multiple data.

---

## When to Use

- Is the stock cheap or expensive?
- Fair value / intrinsic value estimate
- Scenario valuation (pessimistic / base / bull)
- Margin of safety calculation
- Input to PCCL and buying decision

---

## Integration with Other Skills

| Skill | Link |
|-------|------|
| `pccl-analysis` | Pessimistic case → PCCL |
| `fundamental-analysis` | Reported vs normalized EPS |
| `business-model-analysis` | Multiple selection by business quality |
| `ipo-forensic-analysis` | IPO-era valuation vs today |
| `risk-analysis` | Downside % for catalyst rule |

---

## Step 1 — Current Valuation Reality

Latest: price, market cap, EV (if relevant), shares (basic + diluted),
TTM EPS, normalized EPS, key multiples (P/E, P/B, P/S, EV/EBITDA, FCF yield).

---

## Step 2 — Earnings Normalization

Adjust for: one-offs, exceptional items, cyclical peaks/troughs,
unusual margins.

Distinguish: reported / normalized / estimated earnings.

Never use peak earnings without labeling.

---

## Step 3 — Valuation Methods

Select by business type — do not force all methods:

| Business type | Primary methods |
|---------------|-----------------|
| Profitable compounder | P/E, FCF yield |
| Asset-heavy | P/B, EV/EBITDA |
| High-growth, low profit | P/S, EV/Sales (with caution) |
| Financials | P/B, ROE-adjusted |
| AMC / asset-light | P/E, EV/EBITDA |

---

## Step 4 — Scenario Valuation

### Standard (3 scenarios)

| Scenario | Use |
|----------|-----|
| **Pessimistic** | Conservative growth, margins, **lower multiple** |
| **Normal** | Normalized earnings, fair multiple — **Conservative IV** |
| **Optimistic** | Stronger but plausible — not for primary buy thesis |

### Turnaround (4 scenarios)

Use when earnings are **temporarily depressed** but business quality
remains high (e.g. US pricing cycle, cyclical trough, one weak quarter):

| Scenario | Use |
|----------|-----|
| **Pessimistic** | Weakness persists; lower EPS and multiple |
| **Normal** | Mid-cycle normalised EPS |
| **Recovery** | Earnings recover toward historical range |
| **Strong recovery** | Full normalisation — upside illustration only |

Do not extrapolate the latest quarter as permanent run-rate.

---

## Step 5 — Conservative Valuation

Reflect: business quality, earnings quality, growth sustainability,
balance sheet, governance, regulatory/cyclical risk, core-problem risk.

Apply **conservative multiple** for conservative IV.

---

## Step 6 — Historical Valuation

Compare current P/E, EV/EBITDA vs 3–5 year history.

Ask: Has business quality changed? Don't assume mean reversion.

---

## Step 7 — Growth vs Valuation

What growth rate does current price **require**?

Test if that growth is realistic (FACT vs CLAIM).

**Halved-growth stress test:** If growth is half the implied rate,
what is fair value?

**Future priced-in test:** Ask *"How much of the future is already
reflected in the current price?"* — especially for high-quality
compounders trading near highs.

---

## Step 8 — Valuation Gap Metrics

Use **both** metrics — label clearly:

```
MoS % = (Conservative IV − Price) / Conservative IV × 100
Premium to PCCL % = (Price − PCCL) / PCCL × 100
```

See `pccl-analysis` for ladder tables at multiple price levels.

**Reasonable P/E ≠ attractive entry price.**

---

## Step 9 — PCCL Integration

Feed pessimistic scenario to `pccl-analysis`.

Compare: Current Price vs PCCL → below / near / above.

If user **holds** and CMP is above PCCL: also report MoS vs Conservative IV
and defer add sizing to `pccl-analysis/premium-add-sizing.md` (dual lens).

## Step 10 — Valuation Risk

Flag when price requires:

- Aggressive growth
- Margin expansion
- Turnaround success
- Regulatory/catalyst outcome
- Distant cash flows (high P/S, negative earnings)

List assumptions that **must** hold for current price to work.

---

## Step 11 — Catalyst-Dependent Valuation

If thesis needs future event → apply Catalyst Probability Rule:

```
Probability × Upside × Downside × Position Size
```

| Probability | Action |
|-------------|--------|
| \<50% | WAIT |
| 50–65% | Small/speculative if valuation compelling |
| 65–75% | Staged buying |
| \>75% | Stronger opportunity if downside quantified |
| \>85% | High conviction — still check valuation |

---

## Step 12 — Turnaround Catalyst Block

Use when **current earnings are weak** but thesis is recovery
(e.g. Dr. Reddy-style US pricing / cyclical trough).

### Classify the weakness

| Type | Examples | PCCL action |
|------|----------|-------------|
| **Temporary / Cyclical** | One bad quarter, product-specific, launch cycle, provision | Hold PCCL; raise if next quarter confirms |
| **Structural / Core** | Permanent pricing erosion, lost products, sustained margin collapse | **Lower PCCL** — do not average |

### Required for turnaround names

1. **Core-problem test** — temporary vs structural (with evidence)
2. **Catalyst probability** — assign % for recovery within 2–4 quarters
3. **Halved-recovery test** — value if recovery is only half as strong
4. **Dynamic PCCL rule** — state what quarterly KPIs would **raise**
   PCCL (e.g. margin normalisation, US growth, PAT beat)

Do **not** average aggressively after only one bad quarter.

Do **not** raise PCCL without numerical confirmation in results.

### Turnaround catalyst examples

| Catalyst | KPI to watch |
|----------|--------------|
| US pricing normalisation | US revenue growth, gross margin |
| New product launch cycle | Launch contribution, market share |
| Regulatory clearance | Order status, revenue from affected segment |
| Margin recovery | OPM vs 3Y average |

---

## Final Valuation Classification

| Class | Meaning |
|-------|---------|
| **Attractive** | Adequate MoS vs conservative value |
| **Reasonable** | Fair; limited MoS |
| **Expensive** | Needs optimistic assumptions |
| **Extremely Expensive** | Aggressive assumptions hard to justify |
| **Unclear** | Insufficient data |

---

## Required Output

### Current Price & Date

### Valuation Metrics

### Earnings Used (reported vs normalized)

### Pessimistic / Normal / Optimistic (or Recovery) Cases

### Conservative Intrinsic Value

### PCCL (or cross-ref to `pccl-analysis`)

### Valuation Gap Metrics
MoS vs Conservative IV and Premium to PCCL at CMP.

### Turnaround Assessment (if applicable)
Temporary vs structural; catalyst probability; dynamic PCCL triggers.

### Valuation Risks & Required Assumptions

### Catalyst Assessment (if applicable)

### Final Valuation View

### Evidence & Assumptions

### Limitations

---

## Important Rules

Never call cheap on one metric or because price fell.

Great company can be terrible investment at wrong price.

Low valuation with broken business is not MoS.

Never increase PCCL/IV to justify existing position.

Valuation + Business Quality + PCCL + MoS + Downside Risk together.
