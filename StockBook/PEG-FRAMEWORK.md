# PEG Evaluation Framework — Stock Calculator

**Analysis lens L15** · Stock Calculator tab · Cross-ref [`PE-EVALUATION-FRAMEWORK.md`](PE-EVALUATION-FRAMEWORK.md) · [`PARAMETERS-FRAMEWORK.md`](PARAMETERS-FRAMEWORK.md) · [`yield-on-cost-overlay.md`](../.cursor/skills/pccl-analysis/yield-on-cost-overlay.md)

---

## Core idea — five questions (never PEG alone)

| Metric | Question it answers |
|--------|---------------------|
| **P/E** | How expensive is the stock? |
| **PEG** | Is that price justified by growth? |
| **ROCE** | How efficiently does the business use capital? |
| **Debt** | Is the balance sheet safe? |
| **FCF** | Does profit turn into cash? |

**Rule:** Combine metrics — a **60× P/E** with **30% ROCE + 25% growth** differs from **60× P/E + 12% ROCE + 18% growth**.

---

## Analysis sequence (mandatory order)

1. **Business** — moat, franchise (`BUSINESS-QUALITY-MOAT-FRAMEWORK.md`)
2. **Growth** — revenue / EBITDA / EPS-PAT CAGR
3. **ROCE** — capital efficiency
4. **Debt** — cycle survival
5. **FCF** — cash conversion (multi-year, not one quarter)
6. **P/E** — market premium today
7. **PEG** — growth justification
8. **Entry price** — max P/E at target PEG bands

---

## Zone tables (default — adjust by industry)

### P/E

| Zone | Range |
|------|-------|
| 🟢 | < 20× |
| 🟡 | 20–30× |
| 🟠 | 30–50× |
| 🔴 | > 50× |

### PEG (= P/E ÷ EPS growth %)

| Zone | Range |
|------|-------|
| 🟢 | < 1 |
| 🟡 | 1–1.5 |
| 🟠 | 1.5–2.5 |
| 🔴 | > 2.5 |

### ROCE (or ROE proxy — label separately)

| Zone | Range |
|------|-------|
| 🟢 | > 20% |
| 🟡 | 15–20% |
| 🟠 | 10–15% |
| 🔴 | < 10% |

### Debt / equity

| Zone | Range |
|------|-------|
| 🟢 | < 0.3× or net cash |
| 🟡 | 0.3–0.7× |
| 🟠 | 0.7–1.5× |
| 🔴 | > 1.5× |

### Revenue / PAT growth (FY or 5Y CAGR)

| Zone | Range |
|------|-------|
| 🟢 | > 15% |
| 🟡 | 10–15% |
| 🟠 | 5–10% |
| 🔴 | < 5% |

### FCF (qualitative + trend)

| Zone | Read |
|------|------|
| 🟢 | Strong / rising / high conversion |
| 🟡 | Positive but uneven or WC-driven spike |
| 🟠 | Weak vs PAT |
| 🔴 | Negative / volatile (infra: use **industry-adjusted** lens) |

**Industry exception:** EPC / infra (L&T) — **do not** apply consumer FCF standards; label `fcfIndustryMode: infra`.

---

## Combination verdicts

| Pattern | Label |
|---------|--------|
| High ROCE + PEG < 2 + P/E < 25 + net cash + strong FCF | 🟢 **Growth + value** (Hero-style) |
| High quality + low debt + strong FCF + PEG > 2.5 | 🟡 **Good company, expensive stock** — wait |
| Low ROCE + low growth + high debt + weak FCF + high P/E | 🔴 **Avoid** (unless forensic turnaround) |

**Preferred combo (screen):** ROCE > 20% · PEG < 2 · P/E < 25 · net cash · strong FCF.

---

## Max P/E at target PEG

Given sustainable EPS growth **G%**:

| Target PEG | Max P/E = G × PEG |
|------------|-------------------|
| 1.0 | G × 1 |
| 1.5 | G × 1.5 |
| 2.0 | G × 2 |
| 2.5 | G × 2.5 |

Example: **18% growth**, PEG 2 → max P/E **36×** (not 60×).

---

## 100-point scorecard (web tab)

| Block | Points |
|-------|--------|
| P/E | 15 |
| PEG | 15 |
| ROCE | 15 |
| FCF | 20 |
| Debt | 10 |
| Growth | 15 |
| Dividend | 5 |
| Business quality (from PARAMETERS / BQ file) | 5 |
| **Total** | **100** |

Scores are **comparative screening** — not a substitute for PCCL, catalyst probability, or portfolio mandate.

---

## StockBook data contract

Optional per stock: `PEG_[TICKER].md`

```markdown
## FY26 overrides
| Field | Value | Evidence |
| ttmPe | 19.2 | FACT |
| epsGrowthPct | 14.3 | FACT |
| revenueGrowthPct | 14.9 | FACT |
| patGrowthPct | 14.3 | FACT |
| rocePct | 28 | FACT |
| debtEquity | 0.05 | FACT |
| netCashCr | 12163 | FACT |
| fcfCr | 7215 | FACT |
| fcfMarginPct | 15.2 | FACT |
| dividendYieldPct | 1.2 | FACT |
| fcfIndustryMode | consumer | ASSUMPTION |
| fcfSustainabilityNote | FY26 WC benefit — monitor | OUR ASSUMPTION |
```

If missing, tab reads **`PARAMETERS_[TICKER].md`** + **`detail-analysis.md`** + earnings quality growth rows.

---

## Case references (Sep 2026 chat)

| Stock | P/E | PEG | Takeaway |
|-------|-----|-----|----------|
| **TATACONSUM** | ~60× | ~3+ | 🟢 business · 🔴 valuation |
| **HEROMOTOCO** | ~19× | ~1.55 | 🟢 quality + value balance |
| **ITC** | ~16× | ~2.5–3 | 🟢 value + dividend · 🟡 growth |
| **LT** | ~32× | ~1.2 | 🟢 growth/orders · 🟠 FCF · infra lens |

---

## Agent / web sync

- **Web:** `/stock-calculator/peg` — scorecard + sensitivity + 100-pt breakdown
- **Prompt:** Refresh `PEG_[TICKER].md` after annual results
- **Not PCCL:** PEG score does not override pessimistic buy limits
