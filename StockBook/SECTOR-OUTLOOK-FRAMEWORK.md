# Sector Outlook Framework — 3–5 Year Forward Research

**Created:** 5 Sep 2026  
**Purpose:** Forward-looking sector research (3–5 years) — **not** surplus rank alone, **not** broker consensus.  
**Cadence:** **Weekly refresh mandatory** (every **7 days** max gap, or after material sector news / results).

Cross-ref: `*-sector-outlook.md` per sector · `*-comparative-rank.md` (surplus rank) · `investor-wisdom/sector-news-orientation-lens.md` · `ANALYSIS-LENSES-FRAMEWORK.md` (L11)

---

## How this differs from comparative-rank files

| File type | Question | Horizon | Updates |
|-----------|----------|---------|---------|
| **`*-sector-outlook.md`** | What P/E *should* each leader trade at? What must happen for re-rating? | **3–5 years** | **Weekly** |
| **`*-comparative-rank.md`** | Where does **fresh ₹** go today? (PCCL, reverse allocation) | **Now – 12 months** | On trade / results / tier move |

**Both are required.** Outlook informs fair P/E and thesis; comparative-rank sets SIP pace and surplus %.

---

## Weekly refresh rule (mandatory)

```
Every Sunday (or within 7 days of last "Analysis date" in file):
  1. Read latest News/ summaries for sector + SIAM/RBI/AMFI/sector KPIs where relevant
  2. Re-score ## Sector score — 6 parameters (§6-Parameter Evaluation Playbook) if any driver changed
  3. Update factor table + P/E bands if any row changed
  4. Update ranking narrative + base-case P/E anchors
  5. Log change in "Weekly change log" at bottom
  6. If rank or P/E band shifts → touch affected stock summary-analysis.md (Light tier)
  7. Update SECTOR-OUTLOOK-INDEX.md "Last refreshed" row
```

**Skip weekly only if:** user says "pause sector refresh" or no material news and user confirms skip.

---

## Scope — one file per Report sector folder

| Sector folder | Outlook file | Index tickers (portfolio-first) |
|---------------|--------------|--------------------------------|
| `FMCG/` | `fmcg-sector-outlook.md` | HUL · Tata Consumer · ITC (+ Nestlé watch) |
| `Auto/` | `auto-sector-outlook.md` | Maruti · Hero · TMPV · Eicher · Motherson |
| `Banking and Finance/` | `banking-sector-outlook.md` | HDFC · ICICI · Kotak · SBI · PNB |
| `Healthcare/` | `healthcare-sector-outlook.md` | Max · Medanta · Fortis · Manipal |
| `Pharma/` | `pharma-sector-outlook.md` | Sun · Lupin · Dr Reddy · Cipla |
| `IT/` | `it-sector-outlook.md` | TCS · Infosys · HCL · Wipro |
| `Infrastructure/` | `infrastructure-sector-outlook.md` | L&T · Raajmarg |
| `Oil and Gas/` | `oil-gas-sector-outlook.md` | IOC · ONGC · IGL |
| `Telecom/` | `telecom-sector-outlook.md` | Bharti Airtel |
| `Hotels and Leisure/` | `hotels-leisure-sector-outlook.md` | Indian Hotels · ITC Hotels · Delta · Wonderla |
| `Consumer/` | `consumer-sector-outlook.md` | Havells · UBL · Cupid |
| **`Precision Engineering/`** | **`precision-engineering-sector-outlook.md`** | Bharat Forge · TI India · Sona Comstar · Motherson · Kaynes · MTAR · precision auto-tier-2 · defence/aerospace machining |
| **`AI Data Centre Infrastructure/`** | **`ai-data-centre-infrastructure-sector-outlook.md`** | Cooling · power · DC real estate · networking · picks-and-shovels (not hyperscaler P/E alone) |
| **`Semiconductor and Electronics/`** | **`semiconductor-electronics-sector-outlook.md`** | OSAT · EMS · components · Dixon/Kaynes chain |
| **`Specialty Pharma CDMO/`** | **`specialty-pharma-cdmo-sector-outlook.md`** | Divi's · Syngene · CDMO pure-plays — **not** Sun/Lupin formulation rank |
| **`Aerospace and Space/`** | **`aerospace-space-sector-outlook.md`** | HAL · MTAR · Azad · Data Patterns · space supply chain |
| **`HV Grid Equipment/`** | **`hv-grid-equipment-sector-outlook.md`** | GVT&D · Hitachi Energy · transformers · HVDC · GIS |

**Precision Engineering vs Auto vs Infrastructure:** OEM volume and SIAM → **Auto**. EPC/order book/L&T → **Infrastructure**. **Forgings, bearings, gears, high-tolerance components, export BOM, defence machining** → **Precision Engineering** (this file).

**India 2030 thematic cluster (optional bundle refresh):** AI DC → power/grid → semicon/electronics → precision machining; CDMO (China+1) and aerospace run on parallel tracks. Chain map: `India Strategic Manufacturing/india-strategic-manufacturing-thesis.md`. Legacy `data-centre-beneficiaries-comparative-rank.md` — cross-ref AI DC outlook on refresh; do not duplicate primary lens.

---

## Standard template (copy per sector)

```markdown
# [Sector] — Sector outlook (3–5 years)

**Analysis date:** YYYY-MM-DD  
**Next weekly refresh due:** YYYY-MM-DD (+7 days)  
**Horizon:** 3–5 years  
**Disclaimer:** Analytical estimates — not broker consensus or price targets.

## Sector score — 6 parameters

| # | Parameter | Score (1–10) | Weight | Reading | Type |
|---|-----------|-------------:|-------:|---------|------|
| 1 | 📈 Sector Growth & TAM | | 20% | Industry CAGR, TAM, penetration, 5Y opportunity | |
| 2 | 💰 Profitability & Pricing Power | | 20% | Margin trend, ROCE/ROE, pricing power, leverage | |
| 3 | 🚀 India Structural Growth | | 15% | Capex, urbanisation, formalisation, income, PLI | |
| 4 | 🏭 Capacity & Demand Cycle | | 15% | Utilisation, demand, capex/inventory cycle | |
| 5 | 🏦 Capital & Balance-Sheet Quality | | 15% | D/E, coverage, FCF, working capital | |
| 6 | ⚠️ Risk, Valuation & Competition | | 15% | Regulation, input risk, competition, cyclicality | |
| | **Weighted total** | | 100% | Σ(score × weight) — display as /100 on web | |

*Score 1–10 per row. Weighted total (0–10) × 10 = sector score (0–100). Evaluation questions: §6-Parameter Evaluation Playbook.*

## FY[xx] starting points (FACT vs ASSUMPTION)

## Factor comparison — forward 3–5 years (stock-level)

| Factor | [Name A] | [Name B] | [Name C] |
|--------|----------|----------|----------|
| Future EPS growth outlook | | | |
| Volume growth outlook | | | |
| Market share outlook | | | |
| ROCE outlook | | | |
| Main earnings trigger | | | |
| Main risk | | | |
| **Sustainable P/E range** | | | |
| Bull-case P/E | | | |
| Bear-case P/E | | | |
| **Quality / Growth score** | | | |

## P/E re-rating matrix

| Stock | P/E goes UP if… | P/E falls if… |

## Ranking (3–5Y business trajectory)

## Base-case P/E anchors (3–5Y)

## Strongest conclusion

## Weekly change log
```

### 6-parameter score — summary (web shows output only)

| # | Parameter | What to evaluate | Weight |
|---|-----------|------------------|-------:|
| 1 | **Sector Growth & TAM** | Industry CAGR, GDP/GVA growth, market size, penetration, 5-year opportunity | 20% |
| 2 | **Profitability & Pricing Power** | Margin trend, ROCE/ROE, pricing power, operating leverage | 20% |
| 3 | **India Structural Growth** | Government capex, urbanisation, formalisation, digitalisation, rising income, import substitution, manufacturing shift | 15% |
| 4 | **Capacity & Demand Cycle** | Capacity utilisation, demand growth, capex cycle, inventory cycle, supply-demand balance | 15% |
| 5 | **Capital & Balance-Sheet Quality** | Debt/equity, interest coverage, cash flow, working capital, asset turns | 15% |
| 6 | **Risk, Valuation & Competition** | Regulation, commodity/input risk, competition, cyclicality, valuation vs growth | 15% |

Web **Industry Growth** tab parses `## Sector score — 6 parameters` and displays **scores + sector view only**.  
Cap-tier stock universe: `## Cap tier universe` — see `SECTOR-CAP-TIER-FRAMEWORK.md`.  
All questions, rubrics, and evaluation process live in **§6-Parameter Evaluation Playbook** below (agent / analyst use).

---

## 6-Parameter Evaluation Playbook (process — not shown on web)

**Objective:** Build a **Stock Investment Playbook for India** that connects **sector growth → business earnings → stock potential**.

India's current growth is supported by services, manufacturing, investment and consumption. This framework captures both the **macro opportunity** and whether companies can **convert it into earnings**.

**Do not stop at sector score alone.** Use the three-layer model (§Three-layer model) before any stock ADD rank.

---

### Scoring formula (100-point sector score)

Score each parameter **1–10**. Weighted total on **0–10** scale; display as **0–100** (×10) on web.

```text
Sector Score (100 points)
│
├── Growth & TAM                 20
├── Profitability & Pricing      20
├── India Structural Growth      15
├── Demand/Capacity Cycle        15
├── Capital Efficiency           15
└── Risk + Valuation + Competition 15
                               ─────
                                100
```

**Formula:** `Weighted total (0–10) = Σ (parameter score ÷ 10 × weight%)`  
**Display:** `Sector score (0–100) = Weighted total × 10`

### Sector view classification

| Score (0–100) | Sector view |
|--------------:|-------------|
| **80–100** | 🟢 Strong structural opportunity |
| **70–79** | 🟢 Attractive |
| **60–69** | 🟡 Selective |
| **50–59** | 🟠 Neutral |
| **<50** | 🔴 Avoid / structurally weak |

---

### Parameter 1 — Sector Growth & TAM (20%)

**Purpose:** Is the industry expanding faster than the economy, with a long runway?

**Ask:**

- Is the sector growing **faster than India's GDP**?
- What is expected **5-year CAGR**?
- Is the **addressable market expanding**?
- Is **penetration still low** (room to grow)?
- Is growth **cyclical or structural**?

**Data starting points:** Sector GVA (MoSPI), industry association data (SIAM, AMFI, etc.), company volume disclosures, Economic Survey sector chapters.

**Score 1–10 rubric:**

| Score | Meaning |
|------:|---------|
| **10** | High growth + large TAM + long runway |
| **5** | Moderate / normal growth |
| **1** | Declining or structurally challenged |

**Reading field (in outlook table):** One-line conclusion — e.g. "Industry UVG ~5%, premium niche 10%+; large TAM, moderate penetration upside."

---

### Parameter 2 — Profitability & Pricing Power (20%)

**Purpose:** Does sector growth **translate into sustainable corporate earnings**?

**Evaluate:**

- Revenue growth trend
- EBITDA margin / EBIT margin
- ROCE / ROE (sector median or leaders)
- Pricing power (pass-through vs margin sacrifice)
- Margin expansion potential
- Operating leverage

**Key question:**

> **"Does sector growth translate into sustainable corporate earnings growth?"**

A sector can grow 15%, but if competition destroys margins, shareholders may not benefit.

**Score 1–10 rubric:**

| Score | Meaning |
|------:|---------|
| **10** | Strong margins + pricing power + ROCE expansion |
| **5** | Stable margins; growth ≈ earnings |
| **1** | Margin destruction; growth without profit |

---

### Parameter 3 — India Structural Growth (15%)

**Purpose:** Is **India itself** creating a long-term tailwind for this industry?

**Look at:**

- Government policy & PLI / incentives
- Infrastructure spending
- Urbanisation & rising middle class
- Per-capita income trajectory
- Formalisation of economy
- Digitalisation
- Manufacturing shift / import substitution
- Export opportunity & GVC integration
- Financialisation of savings (where relevant)

**Key question:**

> **"Is India itself creating a long-term tailwind for this industry?"**

**Score 1–10 rubric:**

| Score | Meaning |
|------:|---------|
| **10** | Multiple structural tailwinds aligned (policy + demographics + capex) |
| **5** | Some tailwinds; partially offset by headwinds |
| **1** | Structural headwind (regulatory destruction, substitution) |

---

### Parameter 4 — Capacity & Demand Cycle (15%)

**Purpose:** Distinguish a **good industry** from a **good point in the industry cycle**.

**Especially important for cyclical sectors:** Cement, steel, chemicals, capital goods, auto, power, construction.

**Demand — evaluate:**

- Volume growth trend
- New demand drivers
- Consumption / end-user trend

**Supply — evaluate:**

- New capacity additions
- Capacity utilisation
- Competitor capacity pipeline
- Oversupply risk

**Capex — evaluate:**

- Industry capex cycle (expansion vs consolidation)
- Private capex intent
- Government capex linkage

**Score 1–10 rubric:**

| Score | Meaning |
|------:|---------|
| **10** | Strong demand + tight supply + favourable cycle point |
| **5** | Balanced supply-demand; mid-cycle |
| **1** | Oversupply / demand collapse / peak capex hangover |

---

### Parameter 5 — Capital & Balance-Sheet Quality (15%)

**Purpose:** Does the sector **convert growth into shareholder cash** without excessive capital?

**At sector level, evaluate typical company economics:**

- Debt/Equity
- ROCE / ROIC
- Interest coverage
- Free cash flow generation
- Working-capital intensity
- Asset turnover
- Incremental ROCE on new capex

**Compare:**

> Sector A grows 15% but requires ₹100 of new capital for every ₹20 of additional profit.

versus:

> Sector B grows 12% while requiring very little incremental capital.

For long-term shareholders, Sector B can be much more attractive.

**Score 1–10 rubric:**

| Score | Meaning |
|------:|---------|
| **10** | Asset-light, high FCF, low incremental capital need |
| **5** | Moderate capital intensity; acceptable returns |
| **1** | Heavy leverage / chronic cash burn / low ROCE |

---

### Parameter 6 — Risk + Valuation + Competition (15%)

**Purpose:** A great sector can still be a **bad investment** if risk is high or valuation full.

**Risk — evaluate:**

- Regulatory / government policy
- Commodity & input prices
- Interest rates & currency
- Geopolitical exposure
- Technology disruption (link `structural-threat-analysis`)

**Competition — evaluate:**

- Number of players & concentration
- Entry barriers & moat at sector level
- Pricing wars
- Substitution risk

**Valuation — evaluate:**

- Sector P/E, EV/EBITDA, P/B, FCF yield
- Historical valuation band
- Relative valuation vs Nifty / peers
- Expected earnings growth vs price

**Score 1–10 rubric:**

| Score | Meaning |
|------:|---------|
| **10** | Low risk + reasonable valuation + stable competition |
| **5** | Manageable risks; fair valuation |
| **1** | Existential risk / bubble valuation / brutal competition |

---

### Three-layer model (mandatory before stock ADD)

**Layer 1 — India / Macro**

> GDP → consumption → capex → interest rates → inflation → government policy

⬇️

**Layer 2 — Sector** (this 6-parameter score)

> Growth → TAM → competition → capacity → margins → regulation

⬇️

**Layer 3 — Company**

> Revenue → EBITDA → EPS → ROCE → FCF → debt → management → valuation

**Prevents the common mistake:**

> **"Good sector = good stock."**

A fantastic sector can contain an expensive stock, a poorly managed company, or a company losing market share. Sector score informs **surplus sector allocation**; company analysis (StockBook, PCCL, comparative-rank) decides **which name**.

Cross-ref: `*-comparative-rank.md` (fresh ₹ today) · `investor-wisdom/sector-news-orientation-lens.md` · L11 in `ANALYSIS-LENSES-FRAMEWORK.md`

---

### Agent workflow — scoring a sector

1. Read latest `News/` + sector KPIs (SIAM, RBI credit, AMFI, etc.)
2. Answer each parameter's questions above; assign **1–10** with evidence labels (FACT / ASSUMPTION / HYPOTHESIS)
3. Write scores + one-line **Reading** per row in `## Sector score — 6 parameters`
4. Compute weighted total; verify sector view band
5. Complete stock-level factor table + P/E bands (template below)
6. Log in weekly change log; update `SECTOR-OUTLOOK-INDEX.md`

**Agent responsibility:** The AI agent **researches and fills all six parameter scores** for every sector — this is **not** an end-user data-entry task. Use StockBook comparative-ranks, quarterly results, News summaries, and live search on refresh.

**Web displays:** sector score (/100), sector view label, six parameter scores, Reading text only.

---

## P/E band rules (all sectors)

1. **Do not use one P/E formula for all names in a sector** — mix (cigarettes vs pure FMCG, PSU bank vs private, IT services vs product) differs.
2. Label every number: **FACT** · **MANAGEMENT CLAIM** · **HYPOTHESIS** · **OUR ASSUMPTION**.
3. **Sustainable P/E** = through-cycle fair multiple on **normalised** EPS, not peak quarter.
4. **Bull / Bear** = scenario bands, not targets.
5. Cross-check with `PARAMETERS_[TICKER].md` forward fair P/E — reconcile or explain gap in outlook file.

---

## Agent workflow (sector outlook refresh)

**Before** sector ADD rank, Axis B "Fair", or P/E debate on any name in sector:

1. Read **`StockBook/[Sector]/[sector]-sector-outlook.md`**
2. Read **`StockBook/[Sector]/[sector]-comparative-rank.md`** (if exists)
3. Read latest **`News/`** for sector tickers
4. After user provides sector research (like FMCG paste) → **write full outlook file** same session
5. **Weekly:** refresh all sectors with `Last refreshed` > 7 days in `SECTOR-OUTLOOK-INDEX.md`

---

## Files

| File | Role |
|------|------|
| `SECTOR-OUTLOOK-FRAMEWORK.md` | This doc — template + weekly rules |
| `SECTOR-OUTLOOK-INDEX.md` | Master schedule + status |
| `[Sector]/[sector]-sector-outlook.md` | Sector research body |
