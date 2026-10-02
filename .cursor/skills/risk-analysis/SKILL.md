---
name: risk-analysis
description: >-
  Measure volatility, drawdown, Sharpe ratio, VaR, beta, and portfolio
  concentration for Indian stocks and portfolios. Use when assessing
  downside risk, position sizing, or correlation across holdings.
---

# Risk Analysis Skill

## Category

**RISK ANALYSIS** — quantitative: volatility, drawdown, beta, concentration.

Sub-skills in same category: `structural-threat-analysis`, `legal-threat-analysis`, `dynamic-context-analysis`.

See [SKILL-CATEGORIES.md](../SKILL-CATEGORIES.md).

## Purpose

Quantify **historical and structural risk** for a stock or portfolio:
volatility, drawdown, risk-adjusted returns, concentration, and
correlation.

Implements risk dimensions of `stock-agent.mdc` sections 8, 11, and 13.

Risk analysis describes what **can** go wrong — not whether to buy.

---

## Framework Alignment

Classify as FACT (calculated), OUR ASSUMPTION (risk-free rate, benchmark),
or UNVERIFIED (missing data).

Never invent prices or risk metrics.

State analysis period, currency, and date checked.

---

## When to Use

- Volatility and max drawdown for a stock
- Portfolio concentration and correlation
- Risk-adjusted performance (Sharpe)
- Downside quantification for catalyst rule
- Position sizing input alongside PCCL

---

## Integration with Other Skills

| Skill | Link |
|-------|------|
| `pccl-analysis` | Downside % to PCCL for catalyst probability rule |
| `valuation-analysis` | Valuation risk ≠ price volatility |
| `portfolio-analysis` | Portfolio-level concentration |
| `technical-analysis` | Shares same price series |
| `business-model-analysis` | Structural risks (regulatory, cyclical) |

---

## Step 1 — Data Requirements

- Security or portfolio, period, frequency
- Missing/duplicate prices, adjusted vs unadjusted
- Currency and benchmark (for beta)

---

## Step 2 — Volatility

Daily and annualized volatility when sufficient history.

State annualization: σ_daily × √252.

Higher vol = larger historical swings; not a return forecast.

---

## Step 3 — Drawdown

Running max, drawdown series, **maximum drawdown**.

Note: when it occurred, magnitude, recovery if data allows.

Critical for Indian mid/small caps (can exceed 40–50%).

---

## Step 4 — Sharpe Ratio

State: return frequency, **risk-free rate assumption** (default 6% India),
annualization method.

Not a guarantee of future risk-adjusted performance.

---

## Step 5 — Value at Risk (VaR)

Historical or parametric VaR when sufficient data.

State: confidence level (e.g. 95%), horizon (daily).

VaR is **not** maximum possible loss.

---

## Step 6 — Beta

Only with appropriate benchmark (Nifty 50, Nifty 500, sector index).

State benchmark and period.

---

## Step 7 — Correlation (Portfolios)

Identify highly correlated holdings — hidden concentration risk.

---

## Step 8 — Concentration & Structural Risk

**Quantitative:** largest position %, sector/geography if data exists.

**Structural** (qualitative from other skills):

- Regulatory destruction
- Governance failure
- Cyclical exposure
- Customer/geography concentration
- Liquidity (avg daily volume vs position size)

---

## Risk Classification

| Level | Typical profile |
|-------|-----------------|
| **Low** | Large cap, low beta, low vol, diversified |
| **Moderate** | Mid cap, normal vol, some concentration |
| **High** | Small cap, high vol, large drawdowns, single-country |
| **Mixed** | Low vol stock but structural regulatory risk |

Explain factors — no fixed thresholds unless user defines them.

---

## Required Output

### Risk Summary
Overall classification and drivers.

### Volatility
Daily and annualized with assumptions.

### Drawdown
Max drawdown, timing, recovery.

### Risk-Adjusted Performance
Sharpe and assumptions.

### Market Risk
Beta and benchmark if calculated.

### Correlation
Portfolio correlations if applicable.

### Concentration
Position, sector, geography.

### Structural Risks
Non-price risks from business/regulatory context. For AI, disruption,
new competition, or permanent industry change, use `structural-threat-analysis`
(crisis vs permanent structural change).

For **dynamic macro context** — RBI, MSCI/Nifty rebalancing, geopolitical
oil/INR/FII impact — use `dynamic-context-analysis`.

For **company-specific litigation** — tax demand, court date, SEBI,
licence dispute — use `legal-threat-analysis` (search latest news).

### Key Risks
Top 3–5 risks.

### Data Limitations

---

## Important Rules

Risk metrics are backward-looking.

Diversification reduces but does not eliminate risk.

Combine with PCCL and core-problem test for investment decisions.

Never fabricate risk metrics.
