# Risk & Decision Framework

**Analysis lens L15** · Stock Calculator Tab 5 · **Final decision engine**

---

## Purpose

Combines all Stock Calculator tabs into one **Investment Decision System** — not merely a weighted formula, but:

1. **Quantitative Score** (0–100)
2. **Investment Verdict** (action label)
3. **Why?** — 3 positives · 3 concerns · next quarter to watch

> **Permanent Investment Thesis card** at top — updated each quarter, not rebuilt from zero.

---

## Section A — Risk (five buckets)

| Bucket | Track |
|--------|-------|
| **Business risk** | Market share loss · competition · tech disruption · industry slowdown |
| **Financial risk** | Debt · interest coverage · cash flow · working capital |
| **Valuation risk** | P/E · PEG · historical valuation · forward valuation |
| **Governance risk** | Promoter pledge · RPT · auditor · regulatory |
| **External risk** | Commodity · currency · rates · policy · geopolitical |

Each factor: assessment + level (L1/L2/L3) + signal 🟢🟡🔴

**Risk component score (0–10):** inverse of aggregate risk — lower risk = higher score.

---

## Section B — Catalysts

What can make the stock go **UP**? (not risks-only)

Examples (auto): volume growth · SUV mix · exports · margin recovery · new models · hybrid/EV · commodity normalization.

---

## Section C — Thesis breakers

> *What would make my investment thesis **wrong**?*

List explicit breakers with 🔴 severity — e.g. sustained share loss, EPS decline, ROCE collapse, EV competitiveness loss, margin non-recovery, cash deterioration.

---

## Combined score — five tabs

| Component | Weight | Source tab |
|-----------|-------:|------------|
| Valuation | 25% | PE Evaluation / PARAMETERS |
| Earnings Quality | 25% | Tab 3 |
| Business Quality | 25% | Tab 4 |
| Growth / CAGR | 15% | CAGR Evaluation / PARAMETERS forward |
| Risk | 10% | Section A + risk registers |

```
Score /100 = Σ (component₁₀ ÷ 10 × weight × 100)
```

### Verdict bands

| Score | Verdict |
|------:|---------|
| 80–100 | 🟢 STRONG BUY / ADD |
| 65–79 | 🟢 HOLD / SELECTIVE ADD |
| 50–64 | 🟡 HOLD / WAIT |
| 35–49 | 🟠 REDUCE |
| <35 | 🔴 SELL / AVOID |

**Important:** Verdict is **confirmed** by narrative (positives/concerns), not score alone.

---

## Investment Thesis card (persistent)

```
[TICKER] — Current Thesis
Status · Score · Valuation · Business · Earnings · Risk
Why own · Why not buy aggressively · What would change my mind · Next review
```

Stored in `RISK_DECISION_[TICKER].md` — agent refreshes after quarterly results.

---

## Sector overlays

Core framework identical; layer sector KPIs:

| Sector | Extra metrics |
|--------|---------------|
| Banks | NIM · GNPA/NNPA · CASA · credit cost |
| IT | Revenue growth · EBIT margin · deal wins · attrition · utilization |
| Auto | Volume · mix · EV transition |
| Pharma | USFDA · pipeline · API mix |

---

## Maruti reference (~72/100)

| Component | Score |
|-----------|------:|
| Valuation | 7 |
| Earnings Quality | 7 |
| Business Quality | 8 |
| Growth | 7 |
| Risk | 6 |
| **Overall** | **~72** |

**Verdict:** HOLD / SELECTIVE ADD — excellent business, not screaming buy; Q1 margin warning.

---

*Framework v1 · Sep 2026 · Stock Calculator Tab 5*
