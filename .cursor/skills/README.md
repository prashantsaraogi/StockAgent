# Skills Index — India Stock Investment Agent

All skills follow `.cursor/rules/stock-agent.mdc` (22 framework sections).

**Full category map:** [SKILL-CATEGORIES.md](SKILL-CATEGORIES.md)

---

## Category overview

| Category | Skills |
|----------|--------|
| **0. Orchestration** | stock-analysis |
| **1. Fundamental & Business** | business-model-analysis, fundamental-analysis, technical-analysis |
| **2. Management** | management-governance-analysis, **fraud-detection-analysis** (banks / integrity) |
| **3. Risk Analysis** | risk-analysis, structural-threat-analysis, legal-threat-analysis, dynamic-context-analysis, **price-decline-analysis** |
| **4. Valuation** | valuation-analysis |
| **5. PCCL & Entry** | pccl-analysis *(separate discipline)* |
| **6. Forensic & IPO** | ipo-forensic-analysis |
| **7. Portfolio** | portfolio-analysis |

**User mandate:** [long-term-investor-mandate.md](portfolio-analysis/long-term-investor-mandate.md) — wealth builder; no trim/sell except existential threat.

**User holdings record:** [`.cursor/portfolio/holdings.md`](../portfolio/holdings.md) — read/update on portfolio questions.

**Stock reports (persistent):** [`StockBook/`](../../StockBook/) — summary, detail, approach, FAQ, HTML per stock.  
**News (dated):** [`News/`](../../News/) — macro + portfolio impact; read before analysis — [`News/AGENT-RULES.md`](../../News/AGENT-RULES.md).
| **8. Tools** | backtesting |

---

## 0. Orchestration

| Skill | Use when |
|-------|----------|
| **stock-analysis** | Full report — orchestrates all categories → decision |

**Exclusion guards (run first):** [exclusion-guards.md](stock-analysis/exclusion-guards.md) —
penny stock, heavy debt, persistent loss → **never suggest fresh BUY**.

---

## 1. Fundamental & Business

| Skill | Use when |
|-------|----------|
| **business-model-analysis** | Revenue engine, moat, industry KPIs, **competitors/peers** |
| **fundamental-analysis** | Financials, earnings quality, balance sheet, cash flow |
| **technical-analysis** | Charts, indicators, trend, **entry timing** |

---

## 2. Management

| Skill | Use when |
|-------|----------|
| **management-governance-analysis** | Management quality, governance, capital allocation, **promoter pledge** |
| **fraud-detection-analysis** | **Live** fraud, mis-selling, ED/PMLA, integrity — banks always |

Template for **banks / HDFC-style governance:** `management-governance-analysis/bank-governance-checklist.md`

---

## 3. Risk Analysis

| Skill | Use when |
|-------|----------|
| **risk-analysis** | Volatility, drawdown, beta, concentration |
| **structural-threat-analysis** | **AI**, disruption, new competition — permanent vs crisis |
| **legal-threat-analysis** | Court, tax, SEBI, licence — **search latest news** |
| **dynamic-context-analysis** | Monthly ground reality, RBI/MSCI/Nifty, geopolitical |
| **price-decline-analysis** | Stock down ≥15% from peak — **why it fell** before averaging |

---

## 4. Valuation

| Skill | Use when |
|-------|----------|
| **valuation-analysis** | Fair value scenarios, MoS vs IV, turnaround catalyst |

---

## 5. PCCL & Entry *(separate)*

| Skill | Use when |
|-------|----------|
| **pccl-analysis** | PCCL, premium to PCCL, buying ladder, core-problem at PCCL |
| **pccl-as-protection-not-target.md** | PCCL = protection/size cap; scale-in above PCCL builds wealth |
| **premium-add-sizing.md** | Existing holder: add above PCCL with size caps, blended cost |
| **yield-on-cost-overlay.md** | Cyclical/dividend: YoC on cost, IoC before PCCL veto |

Do **not** mix MoS (vs IV) with Premium to PCCL.

**Dual lens:** Fresh capital → Premium to PCCL ranks opportunity cost.
Existing holder scaling winner → MoS vs IV + size cap may allow Tier A add.

---

## 6. Forensic & IPO

| Skill | Use when |
|-------|----------|
| **ipo-forensic-analysis** | Post-IPO risk transfer, A–L test |

---

## 7. Portfolio

| Skill | Use when |
|-------|----------|
| **portfolio-analysis** | Holdings, P&L, allocation, HOLD/ADD/EXIT |
| **long-term-investor-mandate.md** | Default user profile — no trim/replace; sell only existential |

---

## 8. Tools

| Skill | Use when |
|-------|----------|
| **backtesting** | Historical strategy testing (on request) |

---

## Supporting files

| Category | Path | Content |
|----------|------|---------|
| FUNDAMENTAL | `business-model-analysis/industry-templates.md` | AMC, bank, pharma, IT, auto KPIs |
| RISK | `structural-threat-analysis/threat-templates.md` | AI checklist, sector threats |
| MANAGEMENT | `management-governance-analysis/bank-governance-checklist.md` | Bank / HDFC governance |
| RISK | `legal-threat-analysis/legal-proceedings-checklist.md` | Proceeding register, Delta + HDFC regulatory |
| RISK | `dynamic-context-analysis/sector-monthly-kpis.md` | SIAM, AMFI, monthly KPIs |
| RISK | `dynamic-context-analysis/policy-index-events.md` | RBI, MSCI, Nifty 50 |
| FORENSIC | `ipo-forensic-analysis/reconstruction-checklist.md` | IPO timeline worksheet |
| RISK | `price-decline-analysis/decline-drivers-template.md` | Muthoot/ITC/TCS/HDFC fall patterns |
| PCCL | `pccl-analysis/premium-add-sizing.md` | Scale-in above PCCL (existing holder) |
| ORCHESTRATION | `stock-analysis/comparative-scorecard.md` | Multi-stock comparison |
| ORCHESTRATION | `stock-analysis/exclusion-guards.md` | Penny / debt / loss — AVOID fresh buy |
| MANAGEMENT | `fraud-detection-analysis/fraud-register-template.md` | Live fraud / mis-selling register |

---

## Typical workflow

```
Single stock:
  stock-analysis
    → Fundamental (business → financial → technical)
    → Management
    → Risk (context → structural → legal → quantitative)
    → Forensic (if IPO)
    → Valuation
    → PCCL + ladder
    → Portfolio (if position)
    → Decision

Compare 2+ stocks:
  stock-analysis (each name) → comparative-scorecard.md
  → fresh-entry rank
```

---

## Key metrics (do not mix)

| Metric | Formula | Category |
|--------|---------|----------|
| **MoS vs Conservative IV** | `(IV − Price) / IV` | Valuation |
| **Premium to PCCL** | `(Price − PCCL) / PCCL` | PCCL |

---

## Evidence standard (all skills)

Label: **FACT** | **MANAGEMENT CLAIM** | **HYPOTHESIS** | **OUR ASSUMPTION** | **UNVERIFIED**
