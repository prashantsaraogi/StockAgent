---
name: fundamental-analysis
description: >-
  Analyze an Indian company's financial health, earnings quality,
  growth, balance sheet, and cash flow from reported data. Use when
  reviewing quarterly/annual results, P/E, ROE, debt, margins, or
  earnings quality for any NSE/BSE stock.
---

# Fundamental Analysis Skill

## Purpose

Analyze financial health, **earnings quality**, profitability, growth,
and balance-sheet strength using available fundamental data.

Implements `stock-agent.mdc` sections 3 (Earnings Quality) and 4 (Growth
Reality Check). Shareholding **data** only — full governance rating in
`management-governance-analysis`.

## Category

**FUNDAMENTAL & BUSINESS** — see [SKILL-CATEGORIES.md](../SKILL-CATEGORIES.md).

---

## Framework Alignment

Classify every conclusion as:

- **FACT** — from filings, exchange data, audited results
- **MANAGEMENT CLAIM** — guidance, concall statements
- **HYPOTHESIS** — inferred but not verified
- **OUR ASSUMPTION** — scenario input
- **UNVERIFIED** — could not confirm

Never invent financial metrics.

State the **reporting period** and **date checked**.

---

## When to Use

- Quarterly or annual results review
- Earnings quality assessment
- Debt, cash flow, ROE/ROCE analysis
- Promoter pledge and shareholding check
- Comparing financial trends over 3–5 years
- Input for `valuation-analysis` and `pccl-analysis`

---

## Integration with Other Skills

| Skill | Link |
|-------|------|
| `business-model-analysis` | Revenue drivers explain *why* numbers move |
| `management-governance-analysis` | Governance, pledge — separate category |
| `valuation-analysis` | Fundamentals feed normalized EPS |
| `ipo-forensic-analysis` | Post-IPO earnings vs prospectus |
| `pccl-analysis` | Sustainable earnings for pessimistic case |
| `risk-analysis` | Balance-sheet and cyclical risk |

---

## Step 1 — Data Requirements

Before analysis:

- Company, ticker, exchange
- Reporting period (quarterly vs annual)
- Data source and currency
- Consolidated vs standalone
- Missing values and incomplete statements

---

## Step 2 — Revenue & Growth

Analyze: revenue, YoY/QoQ growth, segment mix, geography.

Look for: consistent growth, deceleration, one-off spikes.

**Growth reality check:** Never extrapolate one exceptional quarter.
Compare vs industry and management guidance (as CLAIM, not FACT).

---

## Step 3 — Earnings Quality

Analyze: gross/operating/PAT margins, EPS, EBITDA.

**Normalize:**

- One-off gains/losses
- Exceptional items
- Unusually high/low margins
- Cyclical peaks/troughs

**Cash vs accrual:**

- Operating cash flow vs PAT
- CFO/OP ratio
- Receivables and inventory trends
- Working capital days

Flag if profit growth is **not** supported by cash generation.

---

## Step 4 — Balance Sheet

Analyze: cash, debt, assets, liabilities, equity, D/E.

Check: leverage changes, CWIP, investments, related-party exposure.

---

## Step 5 — Cash Flow

Analyze: CFO, capex, FCF, FCF growth.

Compare FCF to reported earnings over 3+ years.

---

## Step 6 — Profitability & Returns

ROE, ROCE, ROA — trends over 5 years if available.

Ask: Are returns sustainable or driven by leverage?

---

## Step 7 — Shareholding Data (not full governance)

When available — defer **governance rating** to `management-governance-analysis`:

- Promoter holding and changes
- FII/DII trends
- ESOP dilution

Report pledge % as **FACT**; distress assessment in management skill.

---

## Step 8 — Valuation Context (Light)

Report current P/E, P/B, EV/EBITDA — defer buy/sell conclusion to
`valuation-analysis`. Do not call cheap/expensive on one metric alone.

---

## Fundamental Strength Rating

| Rating | Criteria |
|--------|----------|
| **Strong** | Growing revenue, expanding/stable margins, positive FCF, low debt, cash conversion |
| **Moderate** | Mixed trends, adequate but not exceptional |
| **Weak** | Declining revenue, margin compression, negative FCF, high leverage |
| **Mixed** | Strong in some areas, weak in others |

---

## Required Output

### Company Overview
Ticker, period, source, date checked.

### Revenue & Growth
Trends with FACT vs CLAIM separation.

### Earnings Quality
Margins, normalization adjustments, cash conversion.

### Balance Sheet
Debt, cash, leverage, WC trends.

### Cash Flow
CFO, FCF, CFO/OP.

### Shareholding & Pledge
Latest pattern; pledge status.

### Profitability & Returns
ROE, ROCE trends.

### Valuation Snapshot
Multiples only — no final verdict.

### Fundamental Strength
Strong / Moderate / Weak / Mixed with evidence.

### Key Risks
Debt, declining revenue, margins, negative FCF, dilution, cyclicality.

If debt or loss triggers `stock-analysis/exclusion-guards.md` → flag in report;
defer buy recommendation to orchestrator Step 0.

### Evidence & Assumptions

### Limitations

---

## Important Rules

Never fabricate financial data.

Do not use peak earnings as permanent run-rate.

Distinguish consolidated vs standalone.

Fundamental strength ≠ attractive investment at current price.
