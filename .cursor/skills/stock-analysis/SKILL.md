---
name: stock-analysis
description: >-
  Orchestrate a complete Indian stock analysis using the project's
  investment framework and sub-skills. Use when the user asks for
  stock analysis, investment thesis, buy/hold/sell view, compares
  two or more stocks, or fresh capital allocation between candidates.
  Always run exclusion-guards first — never suggest fresh BUY on penny
  stocks, heavy debt, or persistent loss-makers.
---

# Stock Analysis Skill (Master Orchestrator)

## Category

**ORCHESTRATION** — entry point; delegates to all categories.

See [SKILL-CATEGORIES.md](../SKILL-CATEGORIES.md).

## Purpose

Run a **complete** stock analysis by combining all project skills
under the India Stock Investment Framework (`.cursor/rules/stock-agent.mdc`).

This is the **entry skill**. Delegate to sub-skills by **category**
(see [SKILL-CATEGORIES.md](../SKILL-CATEGORIES.md)).

---

## Framework Checklist (All 22 Sections)

Every complete analysis must address:

| # | Section | Primary skill |
|---|---------|---------------|
| 1 | Current-Date Reality Check | This skill + `dynamic-context-analysis` |
| 2 | Business Quality & Moat | `business-model-analysis` |
| 3 | Earnings Quality | `fundamental-analysis` |
| 4 | Growth Reality Check | `fundamental-analysis` + `valuation-analysis` |
| 5 | Management, Governance & Integrity | `management-governance-analysis` (+ `bank-governance-checklist.md` for banks) + **`fraud-detection-analysis`** for banks/governance flags |
| 6 | Promoter Pledge & Distress-Sale Test | `management-governance-analysis` |
| 7 | IPO Forensic Analysis (if applicable) | `ipo-forensic-analysis` |
| 8 | Regulatory, Legal & Policy Risk | `business-model-analysis` + `risk-analysis` + `legal-threat-analysis` |
| 9 | Core-Problem Test | `pccl-analysis` + `structural-threat-analysis` + `price-decline-analysis` |
| 10 | PCCL | `pccl-analysis` |
| 11 | Margin of Safety | `valuation-analysis` + `pccl-analysis` |
| 12 | Catalyst Probability (if applicable) | `valuation-analysis` |
| 13 | Capital Allocation & Position Sizing | `portfolio-analysis` |
| 14 | Portfolio Reality Check (if user has position) | `portfolio-analysis` |
| 15 | Monitoring After Entry | Output triggers |
| 16 | Final Decision Matrix | This skill |
| 17 | Comparative Analysis (2+ stocks) | This skill + `comparative-scorecard.md` |
| 18 | Evidence Standard | All skills |
| 19 | Structural Threat & Disruption | `structural-threat-analysis` |
| 20 | Dynamic Context & Ground Reality | `dynamic-context-analysis` |
| 21 | Legal Threat & Litigation | `legal-threat-analysis` |
| 22 | Price Decline Attribution | `price-decline-analysis` |

---

## When to Use

- User asks to analyze a stock (any depth)
- User provides ticker + optional position (qty, avg cost)
- User asks buy / hold / sell / accumulate / wait
- User wants a framework-aligned investment report
- User compares **two or more stocks** for fresh capital (e.g. Dr. Reddy vs Caplin)

---

## Comparative Analysis (2+ Stocks)

When the user compares stocks or asks which to buy **today**:

1. Run full analysis on **each** name (sub-skills per stock)
2. Apply [comparative-scorecard.md](comparative-scorecard.md)
3. Rank **fresh-entry preference** by risk/reward — not quality alone
4. State explicitly: **better company ≠ better buy at current price**
5. For portfolio surplus: apply **`portfolio-analysis/dynamic-capital-allocation.md`**
   — within-sector ratios, cross-sector %, potential bands; re-rank on latest news

Output must include:

- Side-by-side PCCL and scenario tables
- Premium to PCCL + MoS at CMP and ladder prices
- Final scorecard table
- Fresh-entry rank (🥇/🥈/Wait)
- **Surplus % split** if deployment question (dynamic — state what would flip ranks)
- Preferred entry zone per name

---

## Workflow

### Step 0d — Buy decision workflow (personal discipline + quotes)

**When user asks buy / add / accumulate / buy today:**

Run **[`investor-wisdom/buy-decision-workflow.md`](../../investor-wisdom/buy-decision-workflow.md)** in full:

1. Read `personal-discipline.md` + `holdings.md` — pause registry & structural buckets
2. Sector `*-comparative-rank.md` — fresh rank + opportunity cost vs #1 peer
3. **Step 4.5:** `sector-news-orientation-lens.md` + dynamic-context **Module E** — orientation brief before Axis B
4. PCCL dual anchor + conviction fair + Axis A/B — **forward P/E subordinate** to L10
5. Catalyst probability → 50–65% = **staged starter only**
6. **Quotes lens table** (≥3 quotes from `quotes.md`) — mandatory in output + `faq.md`
7. Verdict: **staged starter (3–5 sh)** vs **lump sum** vs **wait** vs **pause**

Fresh entry at Tier 2+ premium → **starter only**, not full monthly surplus in one trade.

### Step 0e — Thematic / comparative analysis (mandatory when user asks)

When user asks **theme, value-chain, or multi-stock comparative** analysis (e.g. data-centre beneficiaries):

Run **`investor-wisdom/thematic-comparative-analysis.md`** end-to-end:

1. Define **in-scope ticker list** (named stocks — not whole portfolio unless requested)
2. Live search theme KPIs (capacity, policy, orders)
3. Per-stock framework + theme exposure module
4. Write **`StockBook/[Sector]/[theme]-comparative-rank.md`**
5. **Update or create StockBook folder for every in-scope ticker** (Standard tier) — same session

**User rule (Sep 2026):** Do not answer thematic questions chat-only unless user says **"don't save."**

### Step 0 — Exclusion guards (mandatory first)

Run [exclusion-guards.md](exclusion-guards.md) before buy recommendations:

| Guard | Trigger (summary) |
|-------|-------------------|
| Penny / micro-cap | CMP **< ₹20**; deep penny **< ₹10**; mcap **< ₹500 cr** |
| Heavy debt | Net debt/EBITDA **> 3×**; D/E **> 2×**; interest cover **< 2×** |
| Persistent loss | PAT negative **3+ of last 4 quarters**; TTM loss |

If **HARD EXCLUDE** → top **HIGH ALERT** banner; **AVOID** fresh capital; no buy ladder.
Cyclical **one-Q loss** (OMC etc.) ≠ persistent — document exception if claimed.

### Step 0b — Fraud & integrity screen (banks + governance names)

Run `fraud-detection-analysis` — **live search** on analysis date:

- Employee/branch fraud (e.g. Kotak Panchkula ED case)
- Mis-selling / overseas regulator ban (e.g. HDFC Dubai DIFC AT1)
- ED/PMLA, accounting fraud, whistleblower

If **accounting fraud** or **systemic integrity fail** → HIGH ALERT + AVOID/EXIT review.
See [fraud-register-template.md](../fraud-detection-analysis/fraud-register-template.md).
For this user: **EXIT** only if fraud proven — not TRIM for valuation (`long-term-investor-mandate.md`).

### Step 0c — Legal overhang screen (tax / court / licence)

Run when **any** of: tax demand, court case, licence dispute, material
contingent liability in AR, or user asks “can they survive?”

1. Read **`legal-threat-analysis/SKILL.md`** — live search mandatory
2. Build proceeding register — [legal-proceedings-checklist.md](../legal-threat-analysis/legal-proceedings-checklist.md)
3. Run solvency stress test + **best/base/worst** liability → three-scenario PCCL
4. Apply **[legal-overhang-speculative-sizing.md](../legal-threat-analysis/legal-overhang-speculative-sizing.md)** — **max 2%** portfolio for high-risk class
5. **Never** fresh BUY at full size; **never** average on legal hope
6. Good ops **≠** investable until liability quantified or stay + bounded ratio

If worst-case demand **> net worth** → **existential** — **AVOID** fresh capital.

### Step 1 — Gather inputs

User may provide: ticker, exchange, date range, OHLCV, fundamentals,
portfolio (qty, avg cost).

**If portfolio question:** read [`.cursor/portfolio/holdings.md`](../../portfolio/holdings.md)
first; merge with any new figures user gives in chat.

**Read `News/` first (analysis date):** latest [`News/YYYY-MM/YYYY-MM-DD/summary.md`](../../News/AGENT-RULES.md) +
[`News/TICKER-INDEX.md`](../../News/TICKER-INDEX.md) — material headlines before thesis/SIP refresh.

**If `StockBook/[Sector]/[Stock Name]/` exists:** read prior analysis **before** starting —
see [`StockBook/AGENT-RULES.md`](../../StockBook/AGENT-RULES.md). Order: `summary-analysis.md`
→ `faq.md` → `suggested-approach.md` → `PARAMETERS_[TICKER].md` (if exists) → `detail-analysis.md`. Do not lose prior
PCCL, blended-cap rules, or FAQ conclusions unless new evidence requires update.

**After the discussion (mandatory):** persist to Report before finishing — see
**Step 6** below and `StockBook/AGENT-RULES.md`. Chat output alone is **not** sufficient
storage; the Report is the durable record.

Validate data quality before proceeding (missing prices, stale data,
currency, duplicates).

### Step 2 — Current-date reality check

Use **today's** data. State the date checked.

Verify: latest results, shareholding, pledge, debt, cash flow,
valuation, material news.

### Step 3 — Invoke sub-skills (by category)

Read and apply as needed. Full map: [SKILL-CATEGORIES.md](../SKILL-CATEGORIES.md).

#### 1. Fundamental & Business

| Skill | When |
|-------|------|
| `business-model-analysis` | Always — revenue engine, moat, **competitors/peers** |
| `fundamental-analysis` | Always — financial health, earnings quality |
| `technical-analysis` | When OHLCV data available — timing overlay |

#### 2. Management

| Skill | When |
|-------|------|
| `management-governance-analysis` | Always — mgmt quality, governance, **promoter pledge** (separate from business rating) |

#### 3. Risk Analysis

| Skill | When |
|-------|------|
| `dynamic-context-analysis` | Always — latest news, monthly KPIs, RBI/MSCI/Nifty, geopolitical |
| `price-decline-analysis` | If down ≥15% from peak, 52W low, or user asks why it fell / to average |
| `structural-threat-analysis` | AI, disruption, new competition — IT/BPO/media and exposed sectors |
| `legal-threat-analysis` | Court, tax, SEBI, licence, hearing dates — **search latest news** |
| `risk-analysis` | Always — volatility, drawdown, concentration |

#### 4. Valuation

| Skill | When |
|-------|------|
| `valuation-analysis` | Always — scenarios, MoS vs IV, catalyst probability |

#### 5. PCCL & Entry *(separate discipline)*

| Skill | When |
|-------|------|
| `pccl-analysis` | Always — PCCL, premium to PCCL, buying ladder, core-problem |

#### 6. Forensic & IPO

| Skill | When |
|-------|------|
| `ipo-forensic-analysis` | If listed via IPO in last ~10 years |

#### 7. Portfolio

| Skill | When |
|-------|------|
| `portfolio-analysis` | If user provides holdings |

#### 8. Tools

| Skill | When |
|-------|------|
| `backtesting` | Only if user requests strategy backtest |

### Step 4 — Final decision matrix

**If buy/add requested:** confirm Step 0d (buy-decision-workflow) completed — quotes lens
and staged vs lump sum stated before matrix classification.

Classify using `stock-agent.mdc` section 16:

| Condition | Action |
|-----------|--------|
| Excellent business + attractive valuation + no core problem | BUY / ACCUMULATE |
| Excellent business + expensive valuation | WATCHLIST / HOLD (if owned) |
| Weak business + cheap valuation | Usually AVOID |
| Core problem + falling price | INVESTIGATE — do not auto-average |
| Strong catalyst + >75% prob + MoS + quantified downside | STAGED OPPORTUNITY |
| Unverified narrative without numbers | Not high-conviction |
| **Exclusion guard fires** (penny / heavy debt / persistent loss) | **AVOID** fresh capital — HIGH ALERT; no buying ladder for new money |
| **Legal overhang** (unresolved; worst demand > 0.25× net worth) | **WATCHLIST / token spec only** — max **≤2%** weight; see `legal-overhang-speculative-sizing.md` |
| **Legal existential** (worst demand > net worth) | **AVOID** fresh capital; **EXIT review** if held (existential only) |

### Step 5 — Portfolio action (if position provided)

Read **`portfolio-analysis/long-term-investor-mandate.md`** first.

Include: cost basis, P&L, return %, PCCL gap, MoS vs IV, HOLD/ADD/PAUSE ADDS/EXIT,
buying ladder, quarterly triggers.

**If user asks to add above PCCL:** run dual lens — fresh capital vs existing
holder — per `pccl-analysis/premium-add-sizing.md`:

- Premium-to-PCCL size cap
- Blended avg after add
- New-tranche loss @ PCCL
- Dry powder for lower tiers

Do not default to "wait for PCCL" without this analysis when user holds
at favourable cost and MoS vs Conservative IV ≥ 0%.

### Step 6 — Persist to Report (mandatory)

**Whenever this skill produces or updates analysis for a named stock**, write to
`StockBook/[Sector]/[Stock Name]/` **in the same session** — not only on "full reports."

| Trigger (any one) | Action |
|-------------------|--------|
| ADD / HOLD / PAUSE / ladder / DCA discussed | Update `suggested-approach.md` + `summary-analysis.md` |
| PCCL, IV, MoS, premium-to-PCCL, YoC gate | Update valuation sections in `summary` + `detail` |
| User asked a stock-specific question | Append to `faq.md` with date — include **Quotes lens** Q when buy/add discussed |
| Verdict or surplus rank changed | Update `summary-analysis.md`; sync `quadrant-map.md` if rank moved |
| Trade confirmed | Update `holdings.md` + position block in Report |
| Full framework run | Refresh all four markdown files + HTML |

**Update tiers** (detail in `StockBook/AGENT-RULES.md`):

- **Light** — FAQ + one-line verdict in summary + HTML
- **Standard** — all markdown + HTML (most add/hold sessions)
- **Full** — standard + expanded `detail-analysis.md`

If folder missing → create all five files under correct sector on first meaningful discussion.

---

## Required Output (Full Report)

### 1. Stock Information
Ticker, exchange, CMP, date checked, data sources.

### 1a. Exclusion guard screen
From [exclusion-guards.md](exclusion-guards.md) — HIGH ALERT banner if triggered;
penny / debt / loss flags with FACT thresholds.

### 1b. Fraud & integrity screen (if bank / NBFC / governance flag)
From `fraud-detection-analysis` — live search date, register summary, systemic verdict,
impact on mgmt rating and PCCL.

### 2. Data Quality
Missing or suspicious data.

### 2a. Dynamic Context (as of date checked)
From `dynamic-context-analysis`: ground reality (monthly KPIs if applicable),
policy/index events, geopolitical status and direction, connect-the-dots synthesis.

### 2b. Why the stock fell (if down ≥15% from peak or user asks to average)
From `price-decline-analysis` — **mandatory heading and driver table**:
`Why the stock fell ~X% from ₹[peak] ([date])` | Driver | Type | + core-problem + PCCL/average implication.

### 3. Business Model Summary
From `business-model-analysis` (brief or full).

### 4. Fundamental Analysis Summary
From `fundamental-analysis`.

### 5. Management & Governance
From `management-governance-analysis` — **rated separately** from business quality.
For banks/D-SIB: also `bank-governance-checklist.md` (chairman exit, RBI, CEO succession).

### 6. Valuation
From `valuation-analysis`: scenarios, MoS vs conservative IV, catalyst probability.

### 7. PCCL & Entry
From `pccl-analysis`: PCCL, premium to PCCL, buying ladder *(separate from valuation)*.

### 8. IPO Forensic (if applicable)
From `ipo-forensic-analysis`.

### 9. Technical Analysis (if data available)
From `technical-analysis`.

### 10. Risk Analysis (all risk sub-skills as applicable)
From `risk-analysis`, `structural-threat-analysis`, `legal-threat-analysis`,
`dynamic-context-analysis`.

### 11. Portfolio Impact (if applicable)
From `portfolio-analysis`.

### 12. Final Decision
BUY / HOLD / WATCH / AVOID / STAGED BUY — with buying ladder.

### 12a. Comparative Analysis (if 2+ stocks)
From [comparative-scorecard.md](comparative-scorecard.md):
scorecard, fresh-entry rank, key difference summary.

### 13. Quarterly Monitoring Triggers
What would cause ADD, HOLD, REDUCE, EXIT.

### 14. Key Observations

### 15. Limitations

### 16. Evidence & Assumptions
FACT | MANAGEMENT CLAIM | HYPOTHESIS | OUR ASSUMPTION | UNVERIFIED

---

## Important Rules

Never:

- Guarantee future returns
- Invent prices, metrics, or company facts
- Average down because price fell or is below cost
- Skip PCCL and margin of safety
- **Suggest fresh BUY on penny, heavy-debt, or persistent loss names** (exclusion guards)
- Treat a great company as automatically a great investment

Always:

- Separate business quality from current price
- Use latest available data with date stated
- Prefer primary sources (filings, exchange data)
- **Persist stock discussions to `StockBook/`** — read before analyze, write after (Step 6)
- **StockBook vocabulary:** **HOLD · ADD · PAUSE ADDS** only — no TRIM/SELL rows (`StockBook/AGENT-RULES.md`)

---

## Sub-Skill Index (by category)

See [SKILL-CATEGORIES.md](../SKILL-CATEGORIES.md) for full routing.

**Fundamental:** `business-model-analysis/`, `fundamental-analysis/`, `technical-analysis/`

**Management:** `management-governance-analysis/`, `fraud-detection-analysis/` (banks — live search)

**Risk:** `risk-analysis/`, `structural-threat-analysis/`, `legal-threat-analysis/`, `dynamic-context-analysis/`, `price-decline-analysis/`

**Valuation:** `valuation-analysis/`

**PCCL:** `pccl-analysis/` *(separate discipline)*

**Forensic:** `ipo-forensic-analysis/`

**Portfolio:** `portfolio-analysis/`

**Orchestration templates:** `exclusion-guards.md`, `comparative-scorecard.md`

**Tools:** `backtesting/`
