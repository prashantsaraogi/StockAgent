# Healthcare — Four-way comparative rank (hospital chains)

**Analysis date:** 27 Aug 2026 (rev. 3 — L10 sector lens, 3 Sep 2026)  
**Scope:** Max Healthcare · Medanta · Fortis Healthcare · Manipal Health (fresh entry)  
**Purpose:** Fresh/salary capital priority using **weighted parameters** — PCCL (pessimistic MoS), **reverse allocation**, growth, management, FII, internal/external risk  
**Mandate:** **HOLD** all legacy hospital holdings — no trim for valuation. Rank applies to **surplus capital only**.

**L10 rule (Sep 2026):** Before surplus rank or Axis B "Fair", run **`investor-wisdom/sector-news-orientation-lens.md`** — breadth of hospital news (room-rent cap, peer Q1, policy). **Forward P/E cannot override** L2 policy + user conviction cap. **Max surplus #1 revoked** @ ~₹1,000 vs 35× conviction fair — see Max `faq.md`.

Cross-ref: `StockBook/Healthcare/*/summary-analysis.md` · `comparative-scorecard.md` · `holdings.md` · `pccl-analysis/SKILL.md`

---

## Executive summary — fresh capital rank (weighted)

| Rank | Name | Ticker | **Weighted score /10** | Verdict for **new ₹** | Monthly SIP | Surplus slice |
|:----:|------|--------|:----------------------:|----------------------|-------------|---------------|
| **1** | **Medanta** | MEDANTA | **7.52** | Best **pessimistic MoS** + lowest existing weight | **4–6 sh/mo** | **25–30%** |
| **2** | **Manipal Health** | MANIPALHOS | **6.92** | Zero book weight; growth #1 — IPO/risk caps pace | **5–8 sh/mo** (new) | **15–20%** |
| **3** | **Max Healthcare** | MAXHEALTH | **6.96** | **Best business + FII** — but **#1 portfolio line** → **reverse allocation penalty** | **8–12 sh/mo** (capped) | **10–15%** |
| **4** | **Fortis Healthcare** | FORTIS | **5.71** | PCCL fail (+104%); token legacy only | **1 sh/mo** max | **≤5%** |

**One line:** **Max is the best hospital franchise** but scores **#3 for fresh ₹** because **68% of your hospital book + 10.3% of total portfolio** is already Max — surplus should **fill Medanta/Manipal first**. PCCL uses **pessimistic stress only** (margin of safety for capital protection).

---

## Weighted scoring methodology

Fresh-capital rank = **weighted sum of 7 parameters** (each scored **0–10**, higher = better for **new money today**).

| # | Parameter | Weight | What it measures | How scored |
|---|-----------|-------:|------------------|------------|
| **A** | **PCCL / pessimistic margin of safety** | **25%** | Capital protection vs **stress floor only** — not normal IV | `Score = clamp(10 − Premium_to_PCCL_low ÷ 10, 0, 10)` |
| **B** | **Reverse portfolio allocation** | **25%** | **Higher existing weight → lower score** (marginal benefit of next ₹) | `Score = 10 × (1 − Blended_weight)` — see below |
| **C** | **Potential growth** (3-yr base) | **12%** | Bed pipeline, revenue CAGR, operating leverage | Proportional 1–10 vs peers |
| **D** | **Management quality** | **10%** | Governance, capital allocation, execution track record | Report + detail-analysis rating |
| **E** | **FII / institutional backing** | **10%** | **Strong FII/DII = downside cushion** + liquidity | Level + trend (Jun 2026 qtr) |
| **F** | **Internal risk** (inverse) | **9%** | Execution, balance sheet, integration, governance — **high risk → low score** | Worst-of `internal-negative-risk.md` |
| **G** | **External risk** (inverse) | **9%** | Policy, payer-mix, sector shock — **high risk → low score** | Worst-of `external-negative-risk.md` |
| | **Total** | **100%** | | |

### A — PCCL = pessimistic margin of safety only

**PCCL is not fair value.** It is the maximum price acceptable under **pessimistic but realistic** EPS × conservative multiple — your **stress floor** for sizing and protection.

```
Premium to PCCL (%) = (CMP − PCCL_low) / PCCL_low × 100
MoS vs PCCL        = (PCCL_low − CMP) / PCCL_low × 100   ← positive only below PCCL
```

We score **only** premium to **PCCL_low** (pessimistic anchor). Normal/optimistic IV is **ignored** in this rank — that is Axis B / forward lens, not capital protection.

| Name | PCCL_low | CMP | Premium | **Score A** |
|------|----------|----:|--------:|:-----------:|
| Fortis | ₹450 | ₹917 | **+104%** | **0.0** |
| Manipal | ₹480 | ₹720 | **+50%** | **5.0** |
| Max | ₹750 | ₹1,000 | **+33%** | **6.7** |
| Medanta | ₹950 | ₹1,200 | **+26%** | **7.4** |

### B — Reverse allocation (your rule)

**Already-heavy names get a lower fresh-capital score** even if business quality is highest.

```
Blended_weight = 0.70 × (Hospital_cost_share) + 0.30 × (Total_portfolio_cost_share)
Score_B        = 10 × (1 − Blended_weight)
```

| Name | Hospital cost % | Total portfolio cost % | Blended weight | **Score B** |
|------|----------------:|-------------------------:|---------------:|:-----------:|
| **Max** | **68%** | **10.3%** | **50.7%** | **4.9** |
| Fortis | 21% | 3.1% | 15.6% | **8.4** |
| Medanta | 12% | 0.18% | 8.5% | **9.2** |
| Manipal | 0% | 0% | 0% | **10.0** |

*Max penalty: largest hospital line **and** #1 name in entire portfolio by cost → surplus rank drops despite quality.*

### C–G — Subjective proportional scores (Aug 2026)

| Parameter | Max | Medanta | Fortis | Manipal | Notes |
|-----------|:---:|:-------:|:------:|:-------:|-------|
| **C Growth** | 7.5 | 8.0 | 7.0 | **9.0** | Manipal Q1 rev +38%; Medanta pipeline |
| **D Management** | **9.0** | 8.0 | 8.0 | 7.0 | Max Good–Strong; Manipal unproven listed |
| **E FII backing** | **8.0** | 5.0 | 7.0 | 4.0 | Max FII **41.78%** (FACT Jun 2026) but −3.6 pp QoQ |
| **F Internal risk** | **8.0** | 6.0 | 7.0 | 5.0 | Manipal NCD/Sahyadri; Medanta Noida L2 |
| **G External risk** | **8.0** | 7.0 | 7.0 | 6.0 | Manipal Karnataka conc.; sector L1–L2 all |

**FII detail (Jun 2026 quarter — FACT / UNVERIFIED trend):**

| Name | FII % | DII / MF % | Total inst. ~ | Trend | Protective read |
|------|------:|-----------:|:-------------:|-------|-----------------|
| Max | **41.78%** | ~18.7% MF | ~72% | FII **−3.6 pp** QoQ | **Strongest FII cushion** — supports **HOLD**, not fresh overweight |
| Fortis | 25.20% | **25.81%** MF | ~57% | Stable | IHH + domestic MF heavy |
| Medanta | **9.46%** | 16.89% | ~26% | FII drifting down | **Low FII** — less passive cushion |
| Manipal | **~3.65%** | Low (new list) | ~15% est. | Post-IPO | **Weakest** — float building |

**Internal + external risk scoring rule:**

| Worst active level | Score F or G |
|--------------------|:------------:|
| Mostly **L1** | 8–9 |
| **L1–L2** (worst L2) | 6–7 |
| **L2** dominant | 5–6 |
| **L2–L3** or governance flag | ≤4 |

---

## Master weighted scorecard

| Parameter | Weight | Max | Medanta | Fortis | Manipal |
|-----------|-------:|----:|--------:|-------:|--------:|
| A PCCL / pessimistic MoS | 25% | 6.7 | **7.4** | 0.0 | 5.0 |
| B Reverse allocation | 25% | **4.9** | **9.2** | 8.4 | **10.0** |
| C Growth potential | 12% | 7.5 | 8.0 | 7.0 | **9.0** |
| D Management | 10% | **9.0** | 8.0 | 8.0 | 7.0 |
| E FII backing | 10% | **8.0** | 5.0 | 7.0 | 4.0 |
| F Internal risk (inverse) | 9% | **8.0** | 6.0 | 7.0 | 5.0 |
| G External risk (inverse) | 9% | **8.0** | 7.0 | 7.0 | 6.0 |
| **Weighted total** | **100%** | **6.96** | **7.52** | **5.71** | **6.92** |
| **Fresh-capital rank** | | **#3** | **#1** | **#4** | **#2** |

```
Medanta  = 0.25×7.4 + 0.25×9.2 + 0.12×8 + 0.10×8 + 0.10×5 + 0.09×6 + 0.09×7 = 7.52
Manipal  = 0.25×5   + 0.25×10  + 0.12×9 + 0.10×7 + 0.10×4 + 0.09×5 + 0.09×6 = 6.92
Max      = 0.25×6.7 + 0.25×4.9 + 0.12×7.5+ 0.10×9 + 0.10×8 + 0.09×8 + 0.09×8 = 6.96
Fortis   = 0.25×0   + 0.25×8.4 + 0.12×7 + 0.10×8 + 0.10×7 + 0.09×7 + 0.09×7 = 5.71
```

**Interpretation:** Max **wins management + FII** but **loses on allocation (25%) and PCCL vs Medanta**. Fortis fails **parameter A** (+104% vs PCCL). Manipal **wins allocation + growth** but **loses on risk + FII + PCCL**.

---

## Your current hospital allocation

| Ticker | Qty | Avg cost | Cost basis | CMP (approx.) | Market value | Legacy return | Share of hospital book (cost) |
|--------|----:|---------:|-----------:|--------------:|-------------:|--------------:|------------------------------:|
| **MAXHEALTH** | 2,000 | ₹656 | **₹13,11,680** | ₹1,000 | ~₹20,00,000 | +52% | **68%** |
| **FORTIS** | 1,200 | ₹332 | ₹3,98,484 | ₹917 | ~₹11,00,000 | +176% | 21% |
| **MEDANTA** | 212 | ₹1,062 | ₹2,25,063 | ₹1,200 | ~₹2,54,400 | +13% | 12% |
| **MANIPALHOS** | — | — | — | ₹720 | — | Fresh | — |
| **Total (3 held)** | | | **₹19,35,227** | | **~₹33,54,400** | | 100% |

**Portfolio context:** Hospital names = **~15% of total cost basis** (₹19.4L / ₹126.9L). Max alone = **#1 position** in the entire portfolio by cost. **Do not sell Fortis/Max to fund Medanta/Manipal** — deploy **salary surplus only**.

**Concentration note:** Max at ~₹20L market value is **overweight vs ideal single-name cap** for new adds — supports ranking Medanta **#1 for incremental ₹** even though Max remains the **core compounder**.

---

## Sector competition — why this matters for all four

Indian listed hospitals are in a **capacity arms race**. CRISIL expects **~14–15% sector revenue growth FY27**; **10,000+ beds** added industry-wide FY26–27 (FACT, sector reports Aug 2026).

| Competitive pressure | Who it hits most | Impact |
|---------------------|------------------|--------|
| **Bed additions in same city** (NCR, Bengaluru, Mumbai) | Max vs Fortis vs Medanta (Noida/Gurugram) vs Manipal (pan-India) | Occupancy share fight — **L1–L2** on growth |
| **ARPOB / payer-mix** (CGHS, insurance, govt schemes) | All — Fortis slightly more diversified via Agilus | Margin compression risk if mix shifts |
| **Doctor & nurse talent** | All tertiary chains | Cost inflation — **L1** |
| **Acquisition integration** (Sahyadri, Kalinga, Punjab clusters) | **Manipal**, Max, Fortis | PAT lags EBITDA 2–4 quarters — **temporary** |
| **IPO / rerating cycle** | Manipal (new list Aug 2026) | Volatility; limited listed track record |

**Framework read:** Competition is **real** but **not moat destruction** Aug 2026 — duopoly/oligopoly clusters (NCR, Bengaluru) still have **scarcity + brand**. It **caps multiple expansion** and raises the bar for **execution** — favour names with **best PCCL gap + proven listed execution**.

---

## Q1 FY27 results — side by side (quarter ended Jun 2026)

| Metric | **Max** | **Medanta** | **Fortis** | **Manipal** |
|--------|--------:|------------:|-----------:|------------:|
| **Revenue / income** | ₹2,982 Cr (+16% YoY) | ₹1,326 Cr (+26% YoY) | ₹2,545 Cr (+17.5%) | ₹3,091 Cr (+38%) |
| **EBITDA** | ₹704 Cr (+15%) | ₹315 Cr (+24%) | ₹568 Cr (+16%) | ₹737 Cr (+26%) |
| **EBITDA margin** | **24.8%** | **23.8%** | 22.3% | 24.2% |
| **Reported PAT** | ₹323 Cr (+5%) | ₹157 Cr (−1%*) | ₹273 Cr (+2%) | ₹232 Cr (−7.5%) |
| **Network / adj PAT** | ₹357 Cr (+3%) | Ex-exceptional stronger | Stable like-for-like | **Adj +31% YoY** ex NCD interest |
| **Occupancy** | Above sector avg | **62.6%** | **~69%** | **65%** (+290 bps) |
| **ARPOB trend** | EBITDA/bed ₹71.2L | **₹70,244** (+5.5%) | ₹2.71 Cr p.a. | **₹71,500/day** |
| **Key narrative** | PAT lags on new beds | Record income; Noida ramp | Hospital + diagnostics | First qtr listed; Sahyadri integration |

\*Medanta Q1 FY26 had **₹19.6 Cr exceptional income** — underlying ops stronger than headline PAT (FACT).

**Earnings quality (all four):** Revenue and EBITDA **strong**; **PAT lag** from depreciation, finance cost, acquisitions — classified **temporary–partial**, not core-problem (OUR ASSUMPTION).

---

## Valuation & PCCL comparison @ CMP

| Metric | **Max** | **Medanta** | **Fortis** | **Manipal** |
|--------|--------:|------------:|-----------:|------------:|
| **CMP (approx.)** | ₹1,000 | ₹1,200 | ₹917 | ₹720 |
| **PCCL (pessimistic)** | **₹750** | **₹950–1,050** | **₹450** | **₹480–580** |
| **Premium to PCCL** | **+33%** | **+14–26%** | **+104%** | **+24–50%** |
| **Conservative IV (normal)** | ~₹980 | ~₹1,150–1,250 | ~₹920 | ~₹650–720 |
| **SIP tier (Axis A)** | **2** Expensive | **3** Little premium | **1** Very expensive | **3–4** (ASSUMPTION) |
| **Current value (Axis B)** | **Fair** | **Fair** | **Very expensive** | **Fair–Expensive** |
| **TTM P/E @ CMP** | ~64× | ~40× | ~64× | ~178× (distorted post-IPO) |
| **10Y ex-COVID avg P/E** | ~45× | ~38× | ~40× | N/A (new list) |
| **Forward P/E (FY27E)** | **~50×** | **~31×** | **~56×** | **~58–72×** |
| **Forward P/E vs own history** | +12% vs avg | **−19% vs avg** | +40% vs avg | N/A |
| **Normalized EPS FY27E** | ₹15.5–16 (ASSUMPTION) | ₹27–34 (ASSUMPTION) | ₹14–14.5 (ASSUMPTION) | ₹8–12 (ASSUMPTION) |
| **Forward probability** | **~70%** | **~65%** | **~55%** | **~60%** |
| **Base EPS growth CAGR** | 18–22% | 15–20% | 15–17% | 20–25% (rev-led) |

### PCCL build logic (ASSUMPTION)

| Name | Pessimistic EPS × multiple → PCCL |
|------|-----------------------------------|
| Max | ₹12.5–13 × 55–58× → **₹690–750** |
| Medanta | ₹17–19 × 52–55× → **₹950–1,050** |
| Fortis | ₹7.5–8 × 52–58× → **₹390–450** |
| Manipal | ₹8–9 × 55–60× → **₹480–540** (+ integration/NCD stress) |

---

## Growth potential — 3-year view

| Driver | Max | Medanta | Fortis | Manipal |
|--------|-----|---------|--------|---------|
| **Bed pipeline** | Vaishali, Pune greenfield, Kalinga | **2,950-bed pipeline**; Noida breakeven path | ~800 beds 4–5 yr | Pan-India + **Sahyadri** |
| **Revenue CAGR (base)** | 14–16% | 15–18% | 15–17% | **18–22%** |
| **Margin path** | Stable 24–25% | Noida drag fading → 25%+ ex-Noida | Target 25% EBITDA FY28 (mgmt) | Integration + scale |
| **Moat / brand** | **Strongest** (Max brand, CONGO) | **Strong** (Medanta clinical) | Good (IHH, diagnostics) | **Strong** (South + national) |
| **Key risk to growth** | Capex execution | Noida + competition NCR | PAT lag, premium valuation | **Debt/NCD**, Karnataka **46–60%** rev concentration |
| **Competition sensitivity** | Medium | **High** (NCR overlap) | Medium | Medium–high |

**Potential winner on growth rate (parameter C only):** Manipal → Medanta → Max → Fortis — but **full rank applies all seven weights**.

---

## Rank #1 — Medanta (MEDANTA) · score **7.52**

**Why #1 on weighted score**

- **Best pessimistic MoS (A):** +26% vs PCCL_low ₹950 — only held name with **tier 3** PCCL gap + **Fair** Axis B.
- **Best reverse allocation (B):** **9.2/10** — 212 shares, **12%** of hospital book; room to build.
- **Trade-off:** **Low FII 9.46% (E: 5.0)** — less institutional cushion than Max; **Noida L2 internal risk (F: 6.0)**.

**Action:** **HOLD** 212 · **4–6 sh/mo** · **25–30%** healthcare surplus · blended cap **₹1,150**.

**What would demote:** Noida fails to breakeven 2 more quarters · premium to PCCL >35% · FII exodus.

---

## Rank #2 — Manipal Health (MANIPALHOS) · score **6.92**

**Why #2 — zero book weight offsets IPO risk**

- **Perfect allocation score (B: 10.0)** — fresh entry; no concentration penalty.
- **Highest growth score (C: 9.0)** — Q1 rev +38%; pan-India + Sahyadri.
- **Dragged by:** PCCL +50% (A: 5.0) · FII ~3.65% (E: 4.0) · integration/NCD internal (F: 5.0).

**Fresh entry plan**

| Item | Guidance |
|------|----------|
| **Starter** | **5–8 sh/mo** for 6 months → review Q2 FY27 |
| **Surplus slice** | **15–20%** of healthcare bucket |
| **Max initial weight** | **≤2–3%** of portfolio cost until 2 listed quarters |
| **Upgrade to #1** | FII builds · CMP ≤ ₹580 (near PCCL) · Sahyadri debt trend down |

**Hard exclusion:** **Pass** — refresh debt schedule quarterly.

---

## Rank #3 — Max Healthcare (MAXHEALTH) · score **6.96**

**Why #3 — best business, worst marginal slot for new ₹**

- **Wins management (9.0) + FII (8.0)** — **41.78% FII** = strongest passive cushion (FACT Jun 2026).
- **Loses allocation (B: 4.9)** — **68% hospital book**, **#1 entire portfolio** (~₹13.1L cost, ~₹20L MV).
- **PCCL (A: 6.7)** — +33% vs ₹750 stress; tier 2 → **size-capped SIP only**.
- **Still HOLD all 2,000 shares** — long-term mandate; **not** a quality downgrade.

**Action:** **HOLD** 2,000 · **8–12 sh/mo** (down from 12–15) · **10–15%** surplus only · blended cap **₹698** · **pause pace upgrade** if total portfolio weight >15% MV.

**What would promote to #2:** Pullback to **₹850–900** (tier 3–4) **or** Medanta/Manipal reach blended caps.

---

## Rank #4 — Fortis Healthcare (FORTIS) · score **5.71**

**Why #4 — PCCL score zero**

- **Parameter A = 0.0** — +104% above PCCL_low ₹450; **no pessimistic margin of safety** at CMP.
- Allocation score (8.4) and FII/MF (7.0) **cannot offset** PCCL failure.
- **Operations fine** — **HOLD** 1,200 legacy; **1 sh/mo token** · **≤5%** surplus.

---

## Recommended surplus split (weighted-rank aligned)

Assume **~40–50%** of monthly investable surplus goes to healthcare/pharma theme:

| Name | Old split (v1) | **Weighted split (v2)** | Pace | Driver |
|------|---------------:|------------------------:|------|--------|
| **Medanta** | 15–20% | **25–30%** | 4–6 sh/mo | **#1 score 7.52** |
| **Manipal** | 10–15% | **15–20%** | 5–8 sh/mo | **#2 score 6.92** · zero weight |
| **Max** | 20–25% | **10–15%** | 8–12 sh/mo | **#3** · allocation penalty |
| **Fortis** | ≤5% | **≤5%** | 1 sh/mo | **#4** · PCCL fail |
| *Pharma within sector* | balance | balance | per `pharma-comparative-rank.md` | |

**Do not exceed ~18–20%** total portfolio in hospital equities without explicit approval.

### When to re-run weighted score

| Trigger | Action |
|---------|--------|
| Any **confirmed trade** (qty/avg change) | Recalculate **parameter B** |
| CMP moves **≥1 tier band** vs PCCL | Recalculate **parameter A** |
| Shareholding pattern (FII ±2 pp) | Recalculate **parameter E** |
| New **L2/L3** risk in register | Recalculate **F / G** |
| Q2 FY27 results | Recalculate **C** (growth) |

---

## Triggers — re-rank table

| Event | Rank change |
|-------|-------------|
| Medanta Noida EBITDA positive | **Strengthen #1** (F ↑) |
| Max CMP ≤ ₹900 | **A ↑** — may tie Manipal but **B still penalises** |
| Manipal FII >15% + 2 clean quarters | Manipal → **#1** candidate |
| Max hospital book share falls <55% (Medanta/Manipal build) | Max **B ↑** — surplus share can rise |
| Fortis CMP ≤ ₹600 | Fortis **A ↑** — still likely **#4** until <+30% PCCL |
| Any accounting/governance flag | **Exit review** — F/G → 0 for that name |

---

## Evidence & dates

| Item | Date checked |
|------|--------------|
| Max / Fortis / Medanta Q1 FY27 | Jul–Aug 2026 (company / ET / CNBC) |
| Manipal Q1 FY27 + listing | 20–22 Aug 2026 |
| CMP Max ₹1,000 · Medanta ₹1,200 · Fortis ₹917 · Manipal ₹720 | 23–27 Aug 2026 ASSUMPTION |
| Holdings 415 Bharti unrelated — hospital qty | 26 Aug 2026 `holdings.md` |
| Sector CRISIL 14–15% FY27 | Feb 2026 carry-forward |
| FII shareholding Jun 2026 | Trendlyne / ET Money · Max 41.78% · Fortis 25.2% · Medanta 9.46% · Manipal ~3.65% |
| Weighted scorecard v2 | 27 Aug 2026 — user request: reverse allocation + PCCL pessimistic only |

**Next refresh:** Q2 FY27 results (Nov 2026) · Manipal post-listing quarter 2 · occupancy/ARPOB KPI · re-rank surplus table.

---

## Files

| Stock | StockBook folder |
|-------|---------------|
| Max Healthcare | `StockBook/Healthcare/Max Healthcare/` |
| Medanta | `StockBook/Healthcare/Medanta/` |
| Fortis Healthcare | `StockBook/Healthcare/Fortis Healthcare/` |
| Manipal (monitor — create full StockBook folder if starter SIP begins) | *No folder yet — refresh after 2 quarters or first trade* |
