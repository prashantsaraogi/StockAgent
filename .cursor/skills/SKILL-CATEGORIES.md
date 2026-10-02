# Skill Categories — India Stock Investment Agent

All skills live in flat folders under `.cursor/skills/` (paths unchanged).
This file is the **logical taxonomy** — how skills group for analysis.

Framework: `.cursor/rules/stock-agent.mdc` (22 sections).

---

## Category map (quick reference)

```
ORCHESTRATION          → stock-analysis
FUNDAMENTAL            → business-model, fundamental, technical
MANAGEMENT             → management-governance, fraud-detection
RISK                   → risk, structural-threat, legal-threat, dynamic-context, price-decline
VALUATION              → valuation-analysis
PCCL & ENTRY           → pccl-analysis          ← separate discipline
FORENSIC & IPO         → ipo-forensic-analysis
PORTFOLIO              → portfolio-analysis
TOOLS                  → backtesting
```

---

## 0. Orchestration

| Skill | Role |
|-------|------|
| **stock-analysis** | Master entry — runs all categories → final decision |

---

## 1. Fundamental & Business

*Understand how the company makes money and how numbers look.*

| Skill | Covers | Framework § |
|-------|--------|---------------|
| **business-model-analysis** | Revenue engine, moat, industry KPIs, **competitors/peers** | 2 |
| **fundamental-analysis** | Earnings quality, growth, balance sheet, cash flow, shareholding data | 3, 4 |
| **technical-analysis** | Price, volume, trend, indicators, entry **timing** | — (timing overlay) |

**When to use category:** Every full stock analysis. Start here before valuation.

**Competitor analysis:** Run inside `business-model-analysis` (peer KPIs, share, pricing).

---

## 2. Management & Governance

*Rate people and behaviour separately from the business.*

| Skill | Covers | Framework § |
|-------|--------|---------------|
| **management-governance-analysis** | Capital allocation, integrity, RPT, auditor, remuneration, **promoter pledge**, distress-sale test | 5, 6 |
| **fraud-detection-analysis** | **Live** fraud, mis-selling, embezzlement, ED/PMLA, integrity failures | 5, 21 |

**When to use category:** Always for full analysis; extra depth when governance red flags or high promoter activity.

**Rule:** Do not equate reputation with integrity — validate through numbers and actions.

---

## 3. Risk Analysis

*Everything that can break the thesis — quantitative, structural, legal, live context.*

| Skill | Covers | Framework § |
|-------|--------|---------------|
| **risk-analysis** | Volatility, drawdown, beta, VaR, **concentration** | 13–14 (risk overlay) |
| **structural-threat-analysis** | **AI**, disruption, new competition, substitutes — crisis vs permanent | 19 |
| **legal-threat-analysis** | Court, tax, SEBI, licence — **search latest news** | 8, 21 |
| **dynamic-context-analysis** | Monthly ground reality, RBI/MSCI/Nifty, **geopolitical** | 1, 20 |
| **price-decline-analysis** | **Why stock fell X% from peak** — driver table, average rule | 9, 22 |

**When to use category:**

| Trigger | Sub-skill |
|---------|-----------|
| AI / disruption question | structural-threat-analysis |
| Court date / Delta Corp / GST | legal-threat-analysis |
| Latest news / macro / SIAM monthly | dynamic-context-analysis |
| Post-results crash / 52W low | price-decline-analysis |
| Portfolio sizing / volatility | risk-analysis |

---

## 4. Valuation

*What is the business worth under scenarios — not the buy limit.*

| Skill | Covers | Framework § |
|-------|--------|---------------|
| **valuation-analysis** | Normal/pessimistic/optimistic scenarios, MoS vs IV, turnaround catalyst probability | 4, 11, 12 |

**When to use category:** Always before buy/hold/sell. Feeds PCCL but does **not** replace it.

---

## 5. PCCL & Entry Discipline

*Separate category — conservative buy limit and ladder.*

| Skill | Covers | Framework § |
|-------|--------|---------------|
| **pccl-analysis** | PCCL, 3/4 scenarios, **premium to PCCL**, buying ladder, core-problem at PCCL | 9, 10, 11 |

**When to use category:** Every investment decision. **Never mix** MoS (vs IV) with Premium to PCCL.

**Rule:** PCCL is dynamic — lower on structural/legal risk; raise only with evidence.

---

## 6. Forensic & Special Situations

*Post-IPO and structural risk-transfer cases.*

| Skill | Covers | Framework § |
|-------|--------|---------------|
| **ipo-forensic-analysis** | Primary vs secondary, lock-in, insider selling, post-IPO earnings vs narrative | 7 |

**When to use category:** Listed via IPO in last ~10 years; “was this IPO fair?” questions.

---

## 7. Portfolio & Capital Allocation

*Holdings, P&L, ADD/TRIM, allocation vs opportunity cost.*

| Skill | Covers | Framework § |
|-------|--------|---------------|
| **portfolio-analysis** | Cost basis, allocation, PCCL gap per holding, HOLD/ADD/TRIM/EXIT, **dynamic potential-weighted surplus rank** |

**Holdings file:** `.cursor/portfolio/holdings.md` — persistent qty/cost record; update on confirmed trades.

**When to use category:** User provides qty and avg cost; portfolio review; rebalancing.

---

## 8. Tools

| Skill | Covers |
|-------|--------|
| **backtesting** | Historical strategy testing (on request only) |

---

## 9. Investor wisdom & buy discipline (user-specific)

*Not a skill folder — docs under `investor-wisdom/` at project root.*

| Doc | Covers | When |
|-----|--------|------|
| **personal-discipline.md** | Pause registry, structural buckets, cash/avg-down traps | Every ADD recommendation |
| **buy-decision-workflow.md** | 10-step buy process, quotes lens, staged vs lump sum | User asks buy / add / buy today |
| **quotes.md** | Buffett, Lynch, Munger, Marks, Indian investors | PAUSE, WAIT, BUY verdicts |

**Framework §13** — run before capital allocation output.

---

## Recommended analysis order

```
1. ORCHESTRATION     stock-analysis (gather inputs, date check)
2. FUNDAMENTAL       business-model → fundamental → technical (if OHLCV)
3. MANAGEMENT        management-governance
4. RISK              dynamic-context → price-decline (if down ≥15%) → structural-threat → legal-threat → risk-analysis
5. FORENSIC          ipo-forensic (if applicable)
6. VALUATION         valuation-analysis
7. PCCL              pccl-analysis → core-problem test
8. INVESTOR WISDOM   personal-discipline → buy-decision-workflow (if buy/add) → quotes lens
9. PORTFOLIO         portfolio-analysis (if position provided)
10. DECISION          stock-analysis final matrix + comparative scorecard (if 2+ names)
```

---

## Framework section → category routing

| § | Topic | Category | Skill |
|---|-------|----------|-------|
| 1 | Current-date reality | RISK | dynamic-context + stock-analysis |
| 2 | Business & moat | FUNDAMENTAL | business-model-analysis |
| 3 | Earnings quality | FUNDAMENTAL | fundamental-analysis |
| 4 | Growth | FUNDAMENTAL + VALUATION | fundamental + valuation |
| 5 | Management | MANAGEMENT | management-governance-analysis |
| 6 | Promoter pledge | MANAGEMENT | management-governance-analysis |
| 7 | IPO forensic | FORENSIC | ipo-forensic-analysis |
| 8 | Regulatory/legal | RISK | legal-threat + business-model |
| 9 | Core-problem | PCCL | pccl + structural + legal + **price-decline** |
| 10 | PCCL | PCCL | pccl-analysis |
| 11 | Margin of safety | VALUATION + PCCL | valuation + pccl |
| 12 | Catalyst probability | VALUATION | valuation-analysis |
| 13–15 | Portfolio | PORTFOLIO | portfolio-analysis |
| 16 | Decision matrix | ORCHESTRATION | stock-analysis |
| 17 | Comparative | ORCHESTRATION | stock-analysis + scorecard |
| 18 | Evidence | ALL | all skills |
| 19 | Structural threat | RISK | structural-threat-analysis |
| 20 | Dynamic context | RISK | dynamic-context-analysis |
| 21 | Legal threat | RISK | legal-threat-analysis |
| 22 | Price decline | RISK | price-decline-analysis |

---

## Supporting templates (by category)

| Category | File |
|----------|------|
| FUNDAMENTAL | `business-model-analysis/industry-templates.md` |
| MANAGEMENT | `management-governance-analysis/bank-governance-checklist.md` | HDFC-style bank governance |
| MANAGEMENT | `fraud-detection-analysis/fraud-register-template.md` | HDFC Dubai, Kotak — fraud register |
| RISK | `structural-threat-analysis/threat-templates.md` |
| RISK | `legal-threat-analysis/legal-proceedings-checklist.md` | Delta legal register + HDFC regulatory |
| RISK | `legal-threat-analysis/legal-overhang-speculative-sizing.md` | Good ops + unresolved law — max 2% spec |
| RISK | `dynamic-context-analysis/sector-monthly-kpis.md` |
| RISK | `dynamic-context-analysis/policy-index-events.md` |
| RISK | `price-decline-analysis/decline-drivers-template.md` | Muthoot/ITC/TCS/HDFC fall patterns |
| FORENSIC | `ipo-forensic-analysis/reconstruction-checklist.md` |
| ORCHESTRATION | `stock-analysis/comparative-scorecard.md` |
| ORCHESTRATION | `stock-analysis/exclusion-guards.md` | Penny / heavy debt / loss — no fresh buy |
| PCCL | `pccl-analysis/premium-add-sizing.md` | Existing-holder scale-in above PCCL |
| PCCL | `pccl-analysis/yield-on-cost-overlay.md` | YoC / IoC for cyclical dividend names |
| PORTFOLIO | `portfolio-analysis/dynamic-capital-allocation.md` | Potential-weighted surplus; within/cross-sector rank |
| PORTFOLIO | `portfolio-analysis/salary-systematic-accumulation.md` | Monthly DCA pace |
