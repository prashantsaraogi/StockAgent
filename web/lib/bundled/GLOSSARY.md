# Glossary — Abbreviations & Framework Terms

**Project:** My-agent (India Stock Investment Agent)  
**Updated:** 28 Aug 2026 (investor wisdom + personal discipline)  
**Purpose:** Quick reference for short names, full names, and **how we use them** in reports, News, and portfolio analysis.

> **Note:** Some terms use the same number for different things — e.g. **Tier 1–5** (valuation / SIP pace) vs **Tier-1 exit** (sell criteria). Context column clarifies which.

---

## 1. Core framework — valuation & buying

| Short | Full name | Business / framework context |
|-------|-----------|------------------------------|
| **PCCL** | Pessimistic Case Conviction Limit | Umbrella term for pessimistic stress limits. **Calculations use Applied_PCCL** only. |
| **Rational_PCCL** | Data-supported PCCL | Pessimistic EPS × conservative multiple — **model / filing anchor**. Always calculated. *Alias: Stress PCCL.* |
| **Conviction_PCCL** | User conviction PCCL | Optional **personal** stress limit when user states it (e.g. stricter than model). Stored in `faq.md`. |
| **Base_PCCL** | Lower-anchor PCCL | `min(Rational_PCCL, Conviction_PCCL)` when Conviction stated; else Rational. **Lower wins.** |
| **Applied_PCCL** | Working PCCL | **Used for all tier, premium, sizing, rank A math.** Loss book: **CMP** if underwater; else **Base_PCCL**. |
| **Stress PCCL** | *(deprecated alias)* | Same as **Rational_PCCL** — use Rational in new reports. |
| **IV** | Intrinsic Value | Estimated true economic value of the business (often scenario-based: pessimistic / normal / optimistic). |
| **Conservative IV** | Conservative intrinsic value | **Normal-case** fair value at a **conservative** multiple — used for **MoS** and **Tier 4** placement. Typically higher than PCCL. |
| **MoS** | Margin of Safety | `(Conservative IV − Current Price) / Conservative IV × 100`. Positive = price below normal fair value. **Separate from Premium to PCCL.** |
| **PARAMETERS file** | `PARAMETERS_[TICKER].md` | Per-stock **Part 1: Today vs 10Y** + **Part 2: 5Y forward @ average earnings**. See `StockBook/PARAMETERS-FRAMEWORK.md`. |
| **Premium to PCCL** | Premium (or discount) to PCCL | `(Current Price − Applied_PCCL) / Applied_PCCL × 100`. Uses **Applied_PCCL** (dual anchor + loss floor). **Positive** = above Applied. Drives **size caps** and SIP tiers. |
| **CMP** | Current Market Price | Live or latest traded price on NSE/BSE — always state **date checked**. |
| **Normalized EPS** | Normalized earnings per share | EPS adjusted for one-offs, peak/cycle, or unsustainable quarters — **preferred for PCCL**, not raw last-quarter extrapolation. |
| **Core-problem test** | — | When a stock is cheap or at PCCL, ask: **"Why is this cheap?"** — temporary/cyclical vs **structural** (moat broken, fraud, legal existential). Cheap + unresolved core problem → **pause adds**, investigate. |
| **Forward prob.** | Forward probability | Subjective **0–100%** band that thesis/catalyst plays out (e.g. recovery, margin normalisation). Used with **Current value @ CMP** label — not alone for buy/sell. |

---

## 2. Two-axis framework — SIP tier (A) vs Current value @ CMP (B)

**Do not collapse into one label.** Your **old avg cost** does not set tier — **CMP vs PCCL** does (Axis A). **"Is CMP good to buy today?"** is Axis B (P/E, industry, macro).

| | **Axis A — SIP tier (1–5)** | **Axis B — Current value @ CMP** |
|--|----------------------------|----------------------------------|
| **Measures** | Price vs **PCCL / Conservative IV** | Forward attractiveness of **today's CMP** |
| **Key inputs** | Premium to PCCL, MoS vs IV | **Normalized P/E** vs sector/peers, latest Q, industry KPI, **India macro**, forward prob |
| **Drives** | Baseline **pace** (sh/mo), PCCL size cap | **Surplus rank %** — Low / Fair / Expensive / Very expensive |
| **Legacy holding** | Can be **Tier 1** (+70% vs PCCL) on old PCCL anchor | Can still be **Fair** — "CMP good to buy" at **token** pace |

### When axes diverge

| Axis A | Axis B | Final pace | Surplus |
|:------:|:------:|------------|---------|
| **5** (below PCCL) | **Low** | Full accelerate | High |
| **5** | **Fair** | Moderate (downgrade max mechanical) | Medium |
| **1–2** (above PCCL) | **Fair** | Token–steady + size cap | Medium |
| **1–2** | **Very expensive** | Minimal token | Low |

**Examples:** IGL — Tier **5** but **Fair** → 10–20 sh/mo not 72+. Muthoot — Tier **2** and **Expensive** → aligned, 1–2 sh/mo.

**Template:** `StockBook/_templates/dual-axis-suggested-approach.md`

### Axis A — SIP tier detail (mechanical vs PCCL)

| Tier | Label | Typical premium to PCCL | SIP stance |
|:----:|-------|------------------------:|------------|
| **5** | Best cost vs PCCL | ≤ 0% | Accelerate |
| **4** | Fair vs PCCL | 0–15% | Steady |
| **3** | Little premium | 15–30% | Slow |
| **2** | Expensive vs PCCL | 30–50% | Token |
| **1** | Very expensive vs PCCL | > 50% | Minimal token |

### Axis B — Current value labels

| Label | When |
|-------|------|
| **Low** | Normalized P/E below sector; strong thesis; macro supportive — **best add now** |
| **Fair** | P/E in line with industry; forward OK — **steady/token add OK** |
| **Expensive** | P/E above normalized sector or legacy multibagger — **token only** |
| **Very expensive** | Stretched vs forward earnings / weak thesis — **minimal token** |

| Short | Meaning |
|-------|---------|
| **Mechanical accelerate** | Tier-5 pace from PCCL alone — downgrade if Axis B is Fair+watch (IGL) |
| **Dual lens** | Existing holder may add above PCCL if Axis B ≥ Fair + size cap |

**Doc:** `.cursor/skills/pccl-analysis/continuous-sip-valuation-tiers.md`

---

## 3. Buying methods — DCA, SIP, ladder

| Short | Full name | Business / framework context |
|-------|-----------|------------------------------|
| **SIP** | Systematic Investment Plan | **Monthly salary adds** in a stock at tier-based **pace** — core wealth path for this portfolio. Continuous even when expensive (token at tier 1–2). |
| **DCA** | Dollar-Cost Averaging | Same idea as SIP — spreading buys over time to smooth entry price. Reports use **salary DCA** or **continuous SIP** interchangeably. |
| **Upward scale-in** | — | Existing holder adds **above PCCL** near fair value with **premium-to-PCCL size caps** — not the same as averaging down or FOMO lump sum. |
| **Dual lens** | Fresh capital vs existing holder | **Fresh capital:** rank by Premium to PCCL vs peers. **Existing holder:** may add above PCCL with caps if MoS vs IV ≥ 0% and quality Strong. |
| **Tier A / B / C (ladder)** | Buy ladder tiers | Price **bands** in `suggested-approach.md` (e.g. Tier A = CMP zone, Tier B = near PCCL). **Not** the same as valuation Tier 1–5. |
| **Dry powder** | — | Cash or reserved % of monthly surplus **not deployed** at expensive tiers — kept for tier 5–4 dips or panic. |
| **Ladder (top-down)** | — | Build buy levels from **CMP downward**, not only from PCCL upward. |

---

## 4. Portfolio actions (mandatory vocabulary)

| Short | Meaning | When used |
|-------|---------|-----------|
| **HOLD** | Keep all legacy shares | **Default** for long-term mandate — no sell for valuation, overweight, or profit-booking. |
| **ADD** | Deploy **fresh/salary** capital | Ranked candidates for monthly surplus (e.g. MAXHEALTH, ICICI). |
| **PAUSE ADDS** | Stop **new** buys temporarily | Concentration, expensive, structural watch, sector **Low/Pause** — **not** sell/trim. |
| **Minimal / token** | Smallest practical SIP | 0–1–2 sh/mo or 5–10% surplus slice. |
| **0% surplus** | No fresh capital this month | Sector or name ranked behind others — legacy still **HOLD**. |

**Not used in reports (unless user asks or Tier-1 exit):** TRIM, SELL, ROTATE, REPLACE, profit-booking.

**Doc:** `.cursor/skills/portfolio-analysis/long-term-investor-mandate.md`

---

## 5. Exit tiers — Tier-1 & Tier-2 (SELL criteria only)

**Different from valuation Tier 1–5 above.**

| Short | Full name | Business context |
|-------|-----------|------------------|
| **Tier-1 exit** | Mandatory exit review | **SELL/EXIT allowed** only for: accounting fraud, systemic integrity failure, existential legal/regulatory loss, permanent moat destruction, persistent loss + broken model. |
| **Tier-2 exit** | Deep investigate before sell | Structural AI/disruption with no adaptation, existential legal overhang, governance pattern + deteriorating numbers, debt distress — sell **only if structural verdict**. |

**Not sufficient for sell:** high P/E, premium to PCCL, overweight, one bad quarter, broker downgrade, opportunity cost vs another stock.

---

## 6. Dividend & cyclical names — YoC overlay

| Short | Full name | Business context |
|-------|-----------|------------------|
| **YoC** | Yield on Cost | `Normalized dividend per share / Your avg cost × 100`. Dividend measured on **deployed capital**, never on CMP alone. |
| **IoC** | Income on Capital | Same lens as YoC — total dividend ₹ on **cost basis** vs market value. |
| **8% YoC gate** | — | For OMC, PSU banks, utilities: **ADD** only when **blended normalized YoC ≥ 8%** is probable after proposed buy. |
| **Normalized dividend** | — | Sustainable dividend — not peak-cycle windfall unless labeled trailing peak. |
| **Blended YoC** | — | YoC after merging legacy qty @ old cost + new tranche @ proposed price. |

**Doc:** `.cursor/skills/pccl-analysis/yield-on-cost-overlay.md`

---

## 7. Evidence labels (every conclusion)

| Label | Meaning |
|-------|---------|
| **FACT** | Verified from filings, results, exchange data, dated news with source |
| **MANAGEMENT CLAIM** | Stated by company; not independently verified |
| **HYPOTHESIS** | Reasoned inference — may be wrong |
| **OUR ASSUMPTION** | Framework judgment (e.g. forward prob 55%) |
| **UNVERIFIED** | Could not confirm on analysis date — do not treat as fact |

---

## 8. Financial & market terms (reports)

| Short | Full name | Business context |
|-------|-----------|------------------|
| **PAT** | Profit After Tax | Net profit attributable to shareholders — bottom line. |
| **PBT** | Profit Before Tax | — |
| **EPS** | Earnings Per Share | PAT / shares; basis for P/E and PCCL. |
| **EBITDA** | Earnings Before Interest, Tax, Depreciation, Amortisation | Operating cash-earnings proxy; margins in % (e.g. IGL Q1 6% vs 13%). |
| **P/E** | Price-to-Earnings ratio | CMP / EPS — valuation multiple. |
| **P/B** | Price-to-Book | CMP / book value per share. |
| **ROE** | Return on Equity | Profitability vs shareholder equity. |
| **ROCE** | Return on Capital Employed | Profitability vs total capital used. |
| **D/E** | Debt to Equity | Leverage; exclusion guard if **> 2×** (non-financial). |
| **NIM** | Net Interest Margin | Banks — spread on lending vs cost of funds. |
| **TTM** | Trailing Twelve Months | Last four quarters summed. |
| **FY** | Financial Year | India: Apr–Mar (e.g. FY27 = Apr 2026–Mar 2027). |
| **Q1–Q4** | Quarter 1–4 | Q1 = Apr–Jun, Q2 = Jul–Sep, Q3 = Oct–Dec, Q4 = Jan–Mar. |
| **CC growth** | Constant currency growth | Revenue growth adjusted for FX — key IT metric. |
| **YoY** | Year on Year | vs same quarter prior year. |
| **QoQ** | Quarter on Quarter | vs previous quarter. |
| **Guide / guidance** | Management outlook | Forward revenue/EPS band — **MANAGEMENT CLAIM** until delivered. |
| **CMP date** | — | Always cite when quoting price, P/E, or tier. |

---

## 9. Macro, policy & flows (News / dynamic context)

| Short | Full name | Business context |
|-------|-----------|------------------|
| **RBI** | Reserve Bank of India | Rate, liquidity, inflation forecasts — affects banks, INR, flows. |
| **MPC** | Monetary Policy Committee | Sets **repo rate** (e.g. 5.25% Aug 2026). |
| **Repo rate** | Policy repo rate | Benchmark policy interest rate. |
| **CPI** | Consumer Price Index | Headline inflation (e.g. FY27 forecast 5.0%, Q3 peak 5.9%). |
| **GDP** | Gross Domestic Product | Real growth forecast (e.g. FY27 6.7%). |
| **FPI / FII** | Foreign Portfolio Investor / Foreign Institutional Investor | Foreign money in Indian equities — flow sentiment. |
| **DII** | Domestic Institutional Investor | Mutual funds, insurers, local institutions — often counter FII sells. |
| **INR / USDINR** | Indian Rupee vs US Dollar | FX — oil import bill, IT exports, FPI risk. |
| **G-Sec** | Government Securities | Indian sovereign bonds; yield (e.g. 10Y ~6.85%) vs equity. |
| **MSCI** | Morgan Stanley Capital International | Index inclusion/weight — passive flow events. |
| **SIAM** | Society of Indian Automobile Manufacturers | Monthly auto sales KPIs. |
| **AMFI** | Association of Mutual Funds in India | Monthly MF/SIP flow data. |
| **PPAC** | Petroleum Planning & Analysis Cell | Indian crude basket price (e.g. $91/bbl). |
| **Nifty 50 / Sensex** | — | Broad Indian equity indices. |

---

## 10. Sector & company shorthand (your portfolio)

| Short | Full name | Business context |
|-------|-----------|------------------|
| **OMC** | Oil Marketing Company | IOC — refining + fuel retail; cyclical margins, YoC overlay. |
| **CGD** | City Gas Distribution | IGL — CNG + PNG in authorised cities. |
| **CNG** | Compressed Natural Gas | Transport fuel at IGL stations. |
| **PNG** | Piped Natural Gas | Homes / industry gas — separate from CNG narrative. |
| **NCR** | National Capital Region | Delhi + adjoining (Noida, Gurgaon, etc.) — IGL core market. |
| **EV** | Electric Vehicle | Policy headwind for **new** CNG 3W registrations in Delhi from 2027. |
| **NBFC** | Non-Banking Financial Company | Muthoot Fin — gold loans, etc. |
| **SFB** | Small Finance Bank | Ujjivan SFB. |
| **PSU** | Public Sector Undertaking | Govt-owned (SBI, PNB, IOC, ONGC). |
| **ARPOB** | Average Revenue Per Occupied Bed | Hospital KPI. |
| **GCC** | Global Capability Centre | MNC captives in India — hiring shift from traditional IT services. |
| **T&M** | Time & Materials | IT billing by hours/headcount — pressured by AI productivity. |
| **AMC** | Asset Management Company | HDFC AMC — mutual fund fees. |

---

## 11. IT & QA (career + sector research)

| Short | Full name | Business context |
|-------|-----------|------------------|
| **GenAI** | Generative AI | LLM/code/content generation — structural theme for Indian IT. |
| **SDLC** | Software Development Life Cycle | Design → dev → test → deploy — where AI tools sit. |
| **QA** | Quality Assurance | Testing function; shifting to **quality engineering** with AI. |
| **QE** | Quality Engineer | Hybrid test design + automation + risk focus. |
| **SDET** | Software Development Engineer in Test | Automation-heavy QA role. |
| **RFP** | Request for Proposal | Client tender — often now demands AI productivity pass-through. |
| **Agentic AI** | — | AI agents that execute multi-step tasks in delivery — Infosys Topaz, etc. |

**Doc:** `StockBook/IT/indian-it-ai-outlook-2026.md`

---

## 12. Portfolio & file structure

| Short | Full name | Business context |
|-------|-----------|------------------|
| **StockBook/** | Stock StockBook folder | Per-stock memory: summary, detail, approach, FAQ, HTML. |
| **News/** | Dated news digest | `News/YYYY-MM/DD/summary.md` — macro + portfolio impact. |
| **holdings.md** | Portfolio quantities | `.cursor/portfolio/holdings.md` — qty, avg cost — read first for portfolio questions. |
| **quadrant-map.md** | Weight vs return map | Where to add **surplus** — not for sell/trim. |
| **TICKER-INDEX** | News ticker index | `News/TICKER-INDEX.md` — ticker → dated news links. |
| **§22** | Framework section 22 | **Price decline attribution** — mandatory when stock down ≥15% from peak. |
| **Exclusion guards** | Hard BUY screen | No fresh BUY: penny (<₹20 CMP), heavy debt, persistent loss-maker — see `exclusion-guards.md`. |

---

## 13. Quadrant map (weight vs gain)

| Label | Meaning |
|-------|---------|
| **Q1** | Low weight + high gain → priority **ADD** with salary |
| **Q2** | High weight + high gain → **HOLD**; size-cap new adds |
| **Q3** | High weight + low gain → **HOLD**; pause adds on weak names |
| **Q4** | Low weight + low gain → **HOLD**; no new capital |
| **MID** | Between thresholds — see master table in `quadrant-map.md` |

**Thresholds (approx.):** Low weight <2.5%; High weight ≥4%; High gain ≥+50% return vs your cost.

---

## 14. Sector surplus bands (dynamic capital)

| Band | Meaning for **fresh salary** |
|------|------------------------------|
| **High** | Priority sector for surplus % (e.g. healthcare, private banks, infra) |
| **Medium** | Selective names only |
| **Low / Pause** | **0%** sector surplus — legacy HOLD (e.g. IT Aug 2026) |

**Doc:** `.cursor/skills/portfolio-analysis/dynamic-capital-allocation.md`

---

## 15. Quick formula reference

```
Premium to PCCL % = (CMP − Applied_PCCL) / Applied_PCCL × 100
(Applied_PCCL = CMP when holder at unrealized loss — see pccl-loss-position-floor.md)

MoS vs Conservative IV % = (Conservative IV − CMP) / Conservative IV × 100

YoC % = Normalized dividend per share / Your avg cost × 100

Blended avg cost = (Qty₁×Cost₁ + Qty₂×Cost₂) / (Qty₁ + Qty₂)

Portfolio weight % ≈ Position market value / Total portfolio market value
```

---

## 16. Where to read more

| Topic | Path |
|-------|------|
| Master investment rules | `.cursor/rules/stock-agent.mdc` |
| SIP tiers & current value | `.cursor/skills/pccl-analysis/continuous-sip-valuation-tiers.md` |
| PCCL skill | `.cursor/skills/pccl-analysis/SKILL.md` |
| Long-term HOLD mandate | `.cursor/skills/portfolio-analysis/long-term-investor-mandate.md` |
| Personal discipline (pause adds, structural buckets) | `investor-wisdom/personal-discipline.md` |
| Buy decision workflow (quotes lens, staged vs lump sum) | `investor-wisdom/buy-decision-workflow.md` |
| Investor quotes library | `investor-wisdom/quotes.md` |
| StockBook update rules | `StockBook/AGENT-RULES.md` |
| News update rules | `News/AGENT-RULES.md` |
| Skill categories | `.cursor/skills/SKILL-CATEGORIES.md` |

---

*Add new rows when the framework introduces terms. Keep **Tier 1–5** (valuation) and **Tier-1 exit** (sell) distinct in all new docs.*
