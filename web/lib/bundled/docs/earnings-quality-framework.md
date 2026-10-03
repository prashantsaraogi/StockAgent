# Earnings Quality Framework

**Analysis lens L13** · Stock Calculator Tab 3 · Cross-ref [`PARAMETERS-FRAMEWORK.md`](PARAMETERS-FRAMEWORK.md) §3 Earnings Quality

---

## Core question

> **Are the company's sales, profits, cash flow and returns improving in a healthy way?**

P/E tells you price relative to earnings. It does **not** tell you whether those earnings are **good** earnings — backed by cash, margin discipline, and volume leverage.

---

## Two primary parts (Stock Calculator UI)

### Part A — Five-year rear-view (historical earnings quality)

**Purpose:** Did EPS compound cleanly over the last five fiscal years?

| Column | Why |
|--------|-----|
| Revenue / PAT (₹ cr) | Scale and bottom-line path |
| **EPS (₹)** | Primary owner-earnings metric |
| **EPS YoY %** | Year-on-year quality — negative years flag |
| Rev YoY % | Top-line vs EPS divergence |
| CFO/PAT | Accrual cross-check when available |
| Quality signal | 🟢 / 🟡 / 🔴 per year |

**Summary row:** EPS CAGR (5Y), PAT CAGR, Revenue CAGR, cash-quality note.

If the Part A table is missing, the engine **back-calculates** five EPS points from latest EPS + PARAMETERS EPS CAGR (labelled OUR ASSUMPTION).

### Part B — Five-year forward (risk-adjusted EPS path)

**Purpose:** Where can EPS go if base growth meets internal + external risk haircuts?

| Input | Source |
|-------|--------|
| Base EPS CAGR | `PARAMETERS_[TICKER].md` |
| Internal haircut (pp) | `internal-negative-risk.md` — execution, mix, capex |
| External haircut (pp) | `external-negative-risk.md` — oil, RBI, policy, competition |
| Per-year context | Gemini (if configured) or rule-based from risk + `News/TICKER-INDEX.md` |

**Rules:**

- Current year carries **full** external haircut (e.g. oil L1/L2 elevated in FY27)
- Temporary external risks **taper** in outer years (85% → 45%)
- L3 structural risks **do not taper**
- Adjusted growth = `max(−5%, base CAGR − max(internal, external haircut))`
- Projected EPS chains forward year-on-year

**Also show:** internal/external risk level chips, current-year highlight, projected EPS table.

---

## Supplementary sections (A–D in StockBook file)

### A. Growth

| Metric | Why it matters |
|--------|----------------|
| Revenue CAGR (3Y) | Short-cycle demand momentum |
| Revenue CAGR (5Y) | Structural scale trajectory |
| EBITDA CAGR | Operating leverage before interest/tax |
| PAT CAGR | Bottom-line compounding |
| EPS CAGR | Per-share owner earnings path |
| Volume growth | Real demand vs price-mix inflation |

### B. Profitability

| Metric | Why it matters |
|--------|----------------|
| Gross margin | Pricing power vs input costs |
| EBITDA margin | Core operating efficiency |
| EBIT margin | After D&A operating quality |
| Net margin | Full P&L conversion |
| ROE | Return on shareholder capital |
| ROCE | Return on total deployed capital |

### C. Cash quality

| Metric | Why it matters |
|--------|----------------|
| CFO | Cash from operations |
| FCF | Owner cash after capex |
| CFO / PAT | Accrual-to-cash conversion |
| FCF / PAT | Free cash backing of reported profit |
| Working capital | Balance-sheet drag or release |
| Receivables days | Revenue quality / collection |
| Inventory days | Demand vs overstocking |

**Rule:** CFO/PAT **< 0.8** sustained → earnings quality flag until explained.

### D. Quarterly trend (last 8 quarters)

| Metric | Q-7 | Q-6 | Q-5 | Q-4 | Q-3 | Q-2 | Q-1 | Latest |
|--------|-----|-----|-----|-----|-----|-----|-----|--------|
| Revenue | | | | | | | | |
| EBITDA | | | | | | | | |
| Margin | | | | | | | | |
| PAT | | | | | | | | |
| EPS | | | | | | | | |
| CFO | | | | | | | | |

**Auto trend per row:**

| Signal | Meaning |
|--------|---------|
| ↑ Improving | Latest trajectory better vs prior 4Q baseline |
| → Stable | Within ±3% band |
| ↓ Deteriorating | Material worsening |

**Cross-check warnings (automatic):**

1. **Revenue ↑↑ but Profit ↓** — growth not translating to profit (Maruti Q1 FY27 pattern)
2. **Margin compression with volume up** — cost pass-through failure
3. **PAT up but CFO down** — accrual-heavy earnings
4. **Receivable days rising with revenue** — collection stretch

---

## Maruti sample (why quarterly matters)

**FY26 annual picture:** Net sales ₹1,74,370 cr (+20.2%), volume 24.23 lakh units — Revenue 🟢 · Volume 🟢 · Profit 🟢 · Scale 🟢

**Q1 FY27 quarterly engine:**

- Net sales ₹49,959 cr (+36% YoY) — strong top line
- Net profit ₹3,352 cr vs prior-year Q1 ₹3,758 cr — **profit fell** despite revenue surge

**Flag:** ⚠️ *Earnings quality warning — growth is currently not translating into profit growth.*

That is more actionable than *Maruti P/E = 28×* alone.

---

## StockBook data contract

Per stock, optional file: `EARNINGS_QUALITY_[TICKER].md`

```
StockBook/[Sector]/[Stock Name]/EARNINGS_QUALITY_MARUTI.md
```

Sections **Part A**, **Part B**, and **A–D** as markdown tables. Engine also reads `PARAMETERS_[TICKER].md`, `internal-negative-risk.md`, and `external-negative-risk.md`.

### Part A table template

```markdown
## Part A — Five-year rear-view

| FY | Revenue (₹ cr) | PAT (₹ cr) | EPS (₹) | EPS YoY % | Rev YoY % | CFO/PAT | Quality | Note | Evidence |
|----|---------------:|-----------:|--------:|----------:|----------:|--------:|---------|------|----------|
| FY21 | | | | | | | 🟢 | | FACT |
| FY22 | | | | | | | 🟢 | | FACT |
| FY23 | | | | | | | 🟢 | | FACT |
| FY24 | | | | | | | 🟡 | | FACT |
| FY25 | | | | | | | 🟢 | | FACT |
```

**Evidence labels:** FACT · MANAGEMENT CLAIM · HYPOTHESIS · OUR ASSUMPTION · UNVERIFIED

---

## Verdict bands

| Overall | Criteria |
|---------|----------|
| 🟢 **Healthy** | Growth + profitability + cash aligned; no cross-check warnings |
| 🟡 **Mixed** | One section weak or single-quarter noise |
| 🔴 **Warning** | Cross-check triggered or 2+ deteriorating quarterly rows |

---

## Agent write-back

After earnings-quality discussion:

1. Update `EARNINGS_QUALITY_[TICKER].md` quarterly table when new results publish
2. Capture Q&A in `faq.md`
3. Refresh `summary-analysis.md` if verdict changes ADD/HOLD pace

---

*Framework v1.1 · Sep 2026 · Stock Calculator Tab 3 — Part A/B primary, A–D supplementary*
