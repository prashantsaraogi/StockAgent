# Margin Framework — Stock Calculator

**Analysis lens L14** · Stock Calculator Tab · Cross-ref [`PARAMETERS-FRAMEWORK.md`](PARAMETERS-FRAMEWORK.md) §B Business quality · [`EARNINGS-QUALITY-FRAMEWORK.md`](EARNINGS-QUALITY-FRAMEWORK.md) quarterly margin rows

---

## Core question

> **Are operating margins structurally healthy, improving with scale, and defensible vs the company's own history — not merely cyclically inflated or compressed?**

P/E and revenue growth alone miss **margin quality**: a stock can grow sales 20% while margins collapse (Maruti Q1 FY27 pattern). Margin analysis answers whether growth **converts** to owner economics.

---

## Four parts (Stock Calculator UI)

### Part A — Five-year margin history

| Column | Why |
|--------|-----|
| **Gross %** | Input-cost pass-through vs pricing power |
| **EBITDA %** | Core operating efficiency before D&A |
| **EBIT %** | After depreciation — capital intensity |
| **Net %** | Full P&L conversion |
| YoY Δ (pp) | Year-on-year margin change |
| Signal | 🟢 expanding · 🟡 stable · 🔴 compressing |

**Summary:** 5Y average EBITDA margin · trend direction · worst/best year.

### Part B — Today vs history (PARAMETERS lens)

Reads `PARAMETERS_[TICKER].md` master table **Today @ CMP** vs **10Y avg (normal)**:

| Metric | Use |
|--------|-----|
| EBITDA margin | Primary operating lens |
| Gross / Net margin | When populated in PARAMETERS or MARGIN file |
| ROE (DuPont) | Margin × turnover × leverage cross-check |

**Verdict bands:**

| vs 10Y normal | Read |
|---------------|------|
| ≥ +1 pp | **Premium** — margin above historical norm |
| −1 to +1 pp | **In line** |
| −1 to −3 pp | **Compressed** — investigate drivers |
| ≤ −3 pp | **Material compression** — core-problem candidate if structural |

### Part C — Margin drivers & pass-through

From `MARGIN_[TICKER].md` — qualitative + quantitative:

| Driver | Examples |
|--------|----------|
| Input costs | Oil, RM, freight, power |
| Mix | SUV vs hatch, premium vs mass, B2B vs retail |
| Pricing | Discounting, ASP, pass-through lag |
| Operating leverage | Fixed cost absorption on volume |
| One-offs | Warranty, FX, inventory write-down |

**Pass-through test:** When input costs rise, did the company **maintain**, **expand**, or **lose** margin? Label FACT vs MANAGEMENT CLAIM.

### Part D — Quarterly margin trend (8 quarters)

From `EARNINGS_QUALITY_[TICKER].md` section D — margin % row.

**Auto warnings:**

1. **Volume ↑ margin ↓** — growth without operating leverage
2. **3+ consecutive quarter compression** — trend not noise
3. **Margin ↓ while revenue ↑↑** — pass-through failure (Maruti Q1 FY27)
4. **EBITDA margin today >3 pp below 10Y avg** — PARAMETERS + quarterly confirm

---

## StockBook data contract

Per stock, optional file: `MARGIN_[TICKER].md`

```
StockBook/[Sector]/[Stock Name]/MARGIN_MARUTI.md
```

Sections: **Part A** table · **Part C** drivers · link to EARNINGS_QUALITY quarterly.

Engine also reads:

- `PARAMETERS_[TICKER].md` — Today vs 10Y EBITDA margin
- `EARNINGS_QUALITY_[TICKER].md` — quarterly margin row
- `external-negative-risk.md` — commodity/oil overlay for forward margin risk

**Evidence labels:** FACT · MANAGEMENT CLAIM · HYPOTHESIS · OUR ASSUMPTION · UNVERIFIED

---

## Part A table template

```markdown
## Part A — Five-year margin history

| FY | Gross % | EBITDA % | EBIT % | Net % | EBITDA Δ pp | Signal | Note | Evidence |
|----|--------:|---------:|-------:|------:|--------------:|--------|------|----------|
| FY21 | | | | | | 🟢 | | FACT |
| FY22 | | | | | | 🟢 | | FACT |
| FY23 | | | | | | 🟢 | | FACT |
| FY24 | | | | | | 🟡 | | FACT |
| FY25 | | | | | | 🟢 | | FACT |
```

---

## Overall verdict bands

| Overall | Criteria |
|---------|----------|
| 🟢 **Healthy** | Margins at/above 10Y norm · stable or expanding 5Y trend · no quarterly warnings |
| 🟡 **Mixed** | Cyclical compression or one weak quarter · pass-through lag plausible |
| 🔴 **Warning** | Structural compression · 3Q trend down · volume up margin down sustained |

---

## Agent write-back

After margin discussion:

1. Update `MARGIN_[TICKER].md` when annual results or quarterly margins shift
2. Cross-update `EARNINGS_QUALITY` section D margin row
3. Capture Q&A in `faq.md` if margin thesis changes ADD/HOLD pace

---

*Framework v1 · Sep 2026 · Stock Calculator Margin tab*
