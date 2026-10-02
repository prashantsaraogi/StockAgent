# FMCG — Four-way comparative rank (+ Nestlé India fresh entry)

**Analysis date:** 27 Aug 2026 (rev. 4 — dual anchor: Rational + Conviction → Applied)  
**Sector outlook (3–5Y):** [`fmcg-sector-outlook.md`](fmcg-sector-outlook.md) — **weekly refresh** · P/E bands HUL/Tata/ITC  
**Scope:** ITC · Hindustan Unilever · Tata Consumer Products (held) · **Nestlé India (fresh entry)** · Kwality Walls (legacy speck)  
**Purpose:** Fresh/salary capital priority using **weighted parameters** — PCCL (pessimistic MoS), **reverse allocation**, growth, management, FII, internal/external risk  
**Mandate:** **HOLD** all legacy FMCG holdings — no trim for valuation. Rank applies to **surplus capital only**.

Cross-ref: `StockBook/FMCG/*/summary-analysis.md` · `StockBook/Healthcare/healthcare-comparative-rank.md` · `StockBook/Pharma/pharma-comparative-rank.md` · `holdings.md`

---

## Executive summary — fresh capital rank (weighted)

| Rank | Name | Ticker | **Weighted score /10** | Verdict for **new ₹** | Monthly SIP | Surplus slice |
|:----:|------|--------|:----------------------:|----------------------|-------------|---------------|
| **1** | **Nestlé India** | NESTLEIND | **8.75** | **Zero book weight** + **ground-level velocity** + premium quality | **2–3 sh/mo** (new) | **25–30%** |
| **2** | **Hindustan Unilever** | HINDUNILVR | **8.08** | Applied PCCL @ CMP (loss) | **5–10 sh/mo** | **15–20%** |
| **3** | **Tata Consumer Products** | TATACONSUM | **7.63** | **Conviction ₹800** (Applied = min vs Rational ₹900) · +30% @ CMP | **8–12 sh/mo** | **25–30%** |
| **4** | **ITC** | ITC | **7.52** | **At applied PCCL (CMP loss floor)** — **50% FMCG book + #2 portfolio line** | **105–150 sh/mo** (legacy pace) | **10–15%** |
| — | **Kwality Walls** | KWIL | — | New listing speck · **0% surplus** | 2–5 sh/mo optional | **0%** |

**One line:** **Nestlé #1** fresh build. **HUL #2** (8.08) · **Tata #3** (7.63 — **Conviction_PCCL ₹800**, Applied = lower anchor, +30% @ CMP). **ITC #4** legacy floor.

Cross-ref: `pccl-dual-anchor.md` · `pccl-loss-position-floor.md`

---

## Weighted scoring methodology

Same **7-parameter framework** as `healthcare-comparative-rank.md` and `pharma-comparative-rank.md`. Fresh-capital rank = weighted sum (**0–10** per parameter, higher = better for **new money**).

| # | Parameter | Weight | What it measures |
|---|-----------|-------:|------------------|
| **A** | **PCCL / pessimistic margin of safety** | **25%** | Capital protection vs **Applied PCCL** (loss floor = CMP) — not normal IV |
| **B** | **Reverse portfolio allocation** | **25%** | **Higher existing FMCG weight → lower score** |
| **C** | **Potential growth** (3-yr base) | **12%** | Revenue CAGR, UVG, operating leverage, **ground reality** |
| **D** | **Management quality** | **10%** | Governance, capital allocation, execution, **product quality / brand** |
| **E** | **FII / institutional backing** | **10%** | Strong FII/DII = downside cushion + liquidity |
| **F** | **Internal risk** (inverse) | **9%** | Execution, integration, balance sheet — high risk → low score |
| **G** | **External risk** (inverse) | **9%** | Rural demand, commodity, regulation — high risk → low score |
| | **Total** | **100%** | |

### A — PCCL = pessimistic margin of safety (Applied PCCL)

**Dual anchor (Aug 2026):** **Rational_PCCL** (model) + optional **Conviction_PCCL** (user) →
**Base_PCCL = min(both)** → **Applied_PCCL** (loss book: CMP if underwater).

On **unrealized loss** (CMP \< avg cost), **Applied PCCL = CMP** — PCCL **cannot be below CMP**.
Use **Applied PCCL** for premium and score **A**. **Rational_PCCL** shown for reference.

```
Base_PCCL           = min(Rational, Conviction) if Conviction stated else Rational
Applied_PCCL        = CMP if loss else Base_PCCL
Premium to PCCL (%) = (CMP − Applied_PCCL) / Applied_PCCL × 100
Score_A             = clamp(10 − Premium_to_Applied_PCCL ÷ 10, 0, 10)
```

| Name | Rational_PCCL | Conviction | Base | **Applied** | CMP | P/L | Premium | **A** |
|------|-------------:|-----------:|-----:|------------:|----:|:---:|--------:|:-----:|
| **ITC** | ₹300 | — | ₹300 | **₹269** | ₹269 | Loss | **0%** | **10.0** |
| **HUL** | ₹1,800 | — | ₹1,800 | **₹2,040** | ₹2,040 | Loss | **0%** | **10.0** |
| **Nestlé** | ₹1,380 | — | ₹1,380 | **₹1,380** | ₹1,477 | Fresh | **+7%** | **9.3** |
| **Tata Consumer** | ₹900 | **₹800** | **₹800** | **₹800** | ₹1,038 | Gain | **+30%** | **7.0** |

*ITC/HUL: Applied = CMP on loss books. Tata: Conviction ₹800 < Rational ₹900 → Applied = ₹800.*

### B — Reverse allocation (FMCG book + total portfolio)

```
Blended_weight = 0.70 × (FMCG_cost_share) + 0.30 × (Total_portfolio_cost_share)
Score_B        = 10 × (1 − Blended_weight)
```

| Name | FMCG cost % | Total portfolio cost % | Blended weight | **Score B** |
|------|------------:|-----------------------:|---------------:|:-----------:|
| **ITC** | **50%** | **8.5%** | **37.3%** | **6.3** |
| HUL | 28% | 4.8% | 21.0% | **7.9** |
| Tata Consumer | 22% | 3.7% | 16.3% | **8.4** |
| **Nestlé** | 0% | 0% | 0% | **10.0** |
| Kwality Walls | 0.5% | ~0% | ~0.4% | **9.9** |

*ITC penalty: **largest FMCG line** — surplus rank drops despite **Applied PCCL @ CMP** (A = 10.0).*

### C–G — Proportional scores (Aug 2026)

| Parameter | Nestlé | Tata | HUL | ITC | Notes |
|-----------|:------:|:----:|:---:|:---:|-------|
| **C Growth** | **9.0** | **8.5** | 7.5 | 6.5 | Nestlé Q1 rev **+25%**, PAT **+48%**; **ground-level offtake strong** (user + mgmt) |
| **D Management** | **9.5** | 8.0 | **9.0** | 7.5 | Nestlé **premium product quality**, global parent; HUL gold-standard HPC |
| **E FII backing** | 7.0 | 7.0 | 5.0 | **7.5** | Nestlé FII **+0.55 pp** to 10.30%; ITC 34% but exiting |
| **F Internal risk** | **8.5** | 7.0 | 7.5 | 7.0 | Nestlé net cash, D/E ~0.09; Tata M&A L1–L2 |
| **G External risk** | 7.0 | 7.0 | 7.0 | **6.0** | ITC tobacco/GST L2; Nestlé coffee commodity L1 |

**Ground reality overlay (Nestlé — user input + Q1 FACT):**

| Signal | Read | Impact on score |
|--------|------|-----------------|
| **High product quality / brand trust** | Maggi, Nescafé, KitKat, infant nutrition — **premium tier** | **D → 9.5** |
| **Heavy ground-level selling** | User observation: strong retail offtake | **C → 9.0** (volume-led Q1 confirms) |
| Q1 domestic sales **+25%**, exports **+35.6%** | FACT Jul 2026 | Supports growth thesis |
| Confectionery **outperforming category**; Nescafé **double-digit volume** | FACT mgmt commentary | Not one-quarter extrapolation — **3-yr band 14–18%** |

**FII detail (Jun 2026 quarter — FACT):**

| Name | FII % | DII / MF % | Trend QoQ | **Score E** | Protective read |
|------|------:|-----------:|-----------|:-----------:|-----------------|
| **ITC** | **34.23%** | ~49% DII total | **−0.60 pp** (5Q −375 bps) | **7.5** | Highest FII level but **sustained exit** |
| **Tata Consumer** | **20.08%** | ~14% MF | **−0.71 pp** | **7.0** | Solid; MF adding |
| **Nestlé** | **10.30%** | ~4% MF · ~22% inst. | **+0.55 pp** | **7.0** | **FII adding** — only peer with FII uptick |
| **HUL** | **9.50%** | ~7% MF | **−0.60 pp** | **5.0** | **Lowest FII** in peer set; DII building |

**Internal risk scoring (worst-of register):**

| Name | Key internal flag | Level | **Score F** |
|------|-------------------|-------|:-----------:|
| Nestlé | Clean BS; D/E ~0.09; execution on premiumisation | L1 | **8.5** |
| HUL | Personal care volume −LSD; home care strong | L1–L2 | **7.5** |
| Tata Consumer | Capital Foods / Ching's integration | L1–L2 | **7.0** |
| ITC | Q1 revenue/margin pressure; hotels demerged | L1–L2 | **7.0** |

**External risk scoring:**

| Name | Key external flag | Level | **Score G** |
|------|-------------------|-------|:-----------:|
| HUL / Tata / Nestlé | Rural demand softness; coffee/palm commodity | L1–L2 | **7.0** |
| ITC | **Tobacco excise / GST / regulation** | **L2** | **6.0** |

---

## Master weighted scorecard

| Parameter | Weight | Nestlé | Tata | HUL | ITC |
|-----------|-------:|-------:|-----:|----:|----:|
| A PCCL / pessimistic MoS | 25% | **9.3** | **7.0** | **10.0** | **10.0** |
| B Reverse allocation | 25% | **10.0** | 8.4 | 7.9 | **6.3** |
| C Growth potential | 12% | **9.0** | **8.5** | 7.5 | 6.5 |
| D Management | 10% | **9.5** | 8.0 | **9.0** | 7.5 |
| E FII backing | 10% | 7.0 | 7.0 | 5.0 | **7.5** |
| F Internal risk (inverse) | 9% | **8.5** | 7.0 | **7.5** | 7.0 |
| G External risk (inverse) | 9% | 7.0 | 7.0 | 7.0 | 6.0 |
| **Weighted total** | **100%** | **8.75** | **7.63** | **8.08** | **7.52** |
| **Fresh-capital rank** | | **#1** | **#3** | **#2** | **#4** |

```
Nestlé = 0.25×9.3 + 0.25×10  + 0.12×9  + 0.10×9.5+ 0.10×7 + 0.09×8.5+ 0.09×7  = 8.75
Tata   = 0.25×7  + 0.25×8.4 + 0.12×8.5+ 0.10×8 + 0.10×7 + 0.09×7  + 0.09×7  = 7.63
HUL    = 0.25×10  + 0.25×7.9 + 0.12×7.5+ 0.10×9 + 0.10×5 + 0.09×7.5+ 0.09×7  = 8.08
ITC    = 0.25×10  + 0.25×6.3 + 0.12×6.5+ 0.10×7.5+ 0.10×7.5+ 0.09×7  + 0.09×6  = 7.52
```

**Interpretation:** **Conviction_PCCL ₹800** < Rational ₹900 on Tata → **Applied = ₹800** → **A = 7.0** (+30% @ ₹1,038) · **#3** vs **HUL #2**. Growth (C) still strong — **surplus slice 25–30%** unchanged; pace capped by tier **3**.

---

## Your current FMCG allocation

| Ticker | Qty | Avg cost | Cost basis | CMP (approx.) | Market value | Legacy return | Share of **FMCG-only** book (cost) |
|--------|----:|---------:|-----------:|--------------:|-------------:|--------------:|-----------------------------------:|
| **ITC** | 3,000 | ₹358 | **₹10,73,820** | ₹269 | ~₹8,07,000 | −25% | **50%** |
| **HINDUNILVR** | 250 | ₹2,422 | **₹6,05,600** | ₹2,040 | ~₹5,10,000 | −16% | 28% |
| **TATACONSUM** | 602 | ₹784 | **₹4,71,942** | ₹1,038 | ~₹6,24,876 | +32% | 22% |
| **KWIL** | 250 | ₹46 | ₹11,568 | ₹46 | ~₹11,500 | flat | 0.5% |
| **NESTLEIND** | — | — | — | ₹1,477 | — | Fresh | — |
| **Total (4 held)** | | | **₹21,62,930** | | **~₹19,57,576** | | 100% |

**Portfolio context:** Pure FMCG **~₹21.6L cost** (~17% of ₹126.9L book) — **ITC alone = #2 line portfolio-wide**. **Do not sell HUL/ITC to fund Nestlé** — deploy **salary surplus only**.

### ITC — YoC overlay (dividend name, separate from rank)

| Metric | Value |
|--------|------:|
| Normalized dividend (est.) | ~₹13–14/sh |
| YoC on ₹358 avg cost | **~3.6–3.9%** |
| 8% YoC gate dividend needed | ₹29/sh on cost |
| **Blended YoC after adds @ ₹269 (applied PCCL)** | Rises toward **4.5–5%** — still **below 8% gate** |

**Combined rule:** At **applied PCCL** (0% premium @ CMP) → **accelerate legacy SIP** (105–150 sh/mo). **Surplus rank #4** — marginal allocation vs other FMCG names only.

---

## Sector competition — India FMCG pulse (Aug 2026)

| Battleground | Impact |
|--------------|--------|
| **Rural vs urban demand** | Urban-led recovery; Nestlé **+25% domestic** (FACT Q1) vs rural **L1–L2** sector drag |
| **Quick commerce / e-com** | Nestlé confectionery + Nescafé RTD scaling; Tata + HUL investing channel |
| **Premiumisation vs mass** | **Nestlé leads** — Nescafé Gold, KitKat premium; HUL home care double-digit |
| **Commodity (palm, wheat, tea, coffee)** | Nestlé coffee **well supplied** (mgmt); margin +250 bps Q1 — **temporary** unless sustained |
| **Regulation (tobacco)** | **ITC-specific L2** — not sector-wide |
| **Diversification beyond core** | Tata **growth businesses 36%** of India rev (FACT Q1) |

**Framework read:** Sector growth **8–12%** for mass leaders; **Nestlé running ~25%** Q1 — **ground reality confirms premium velocity** (user observation). Favours **zero-weight quality compounder** for fresh ₹.

---

## Q1 FY27 results — side by side (quarter ended Jun 2026)

| Metric | **ITC** | **HUL** | **Tata Consumer** | **Nestlé** |
|--------|--------:|--------:|--------------------:|-----------:|
| **Revenue** | Decline YoY (FACT) | ₹17,341 Cr (+10%) | ₹5,349 Cr (+12%) | ₹6,378 Cr (**+25%**) |
| **Underlying volume** | Weak | **USG 10%** (13Q high) | **UVG 13%** India | **Volume-led** — Nescafé DDG, confectionery share gains |
| **EBITDA margin** | Pressure | **23.0%** (−40 bps) | Strong (+19% EBITDA) | **24.2%** (**+250 bps**) |
| **Reported PAT** | Under pressure | ₹2,673 Cr (**−3%**) | ₹427 Cr (**+29%**) | ₹975 Cr (**+48%**) |
| **Key narrative** | Margin headwind | Volume + price equal | Growth biz > tea/coffee | **Ground-level momentum**; premiumisation |

*Nestlé Q1: FACT Jul 22 2026 (ET / company filing). ITC: MarketsMojo Aug 2026. HUL PAT −3% partly one-off tax (Business Standard Jul 2026).*

---

## Valuation & PCCL @ CMP (dual anchor → Applied)

| Metric | **ITC** | **HUL** | **Tata Consumer** | **Nestlé** |
|--------|--------:|--------:|------------------:|-----------:|
| **CMP** | ₹269 | ₹2,040 | ₹1,038 | ₹1,477 |
| **Rational_PCCL** | ₹300 | ₹1,800 | **₹900** | ₹1,380 |
| **Conviction_PCCL** | — | — | **₹800** | — |
| **Base_PCCL** | ₹300 | ₹1,800 | **₹800** | ₹1,380 |
| **Applied_PCCL** | **₹269** | **₹2,040** | **₹800** | ₹1,380 |
| **Premium to Applied** | **0%** | **0%** | **+30%** | +7% |
| **Forward P/E FY27E** | **~17×** | ~42× | **~45×** | ~35–38× (norm EPS) |
| **TTM P/E @ CMP** | ~17× | ~42× | ~45× | **~74×** (distorted TTM EPS) |
| **10Y ex-COVID avg P/E** | ~25× | ~55× | **~58×** | ~65× |
| **Axis B @ CMP** | **Low / deep value** | Fair | **Fair** | **Fair** (on normalized EPS) |
| **SIP tier (Axis A)** | **5 — at floor** | **5 — at floor** | 3–4 Fair | 3–4 Fair |
| **Normalized EPS CAGR (base)** | 10–14% ex-hotels | 10–15% | 12–16% | **14–18%** |

### Nestlé fresh-entry note

| Item | Detail |
|------|--------|
| 52-week range | **₹1,145 – ₹1,553** (FACT Aug 2026) |
| vs 52W low | **+29%** — recovery from June lows; not ≥15% §22 from peak |
| Starter sizing | **2–3 sh/mo** (~₹3–4.5K/mo vs Britannia-style 1×₹5.6K) |
| Max initial weight | **≤2%** portfolio cost until 2 quarters held |
| **User thesis** | **High product quality** + **strong ground-level selling** → supports **C + D** scores |

**Hard exclusion:** **Pass** all four — no penny/debt/loss guard trigger.

---

## Growth potential — 3-year view

| Driver | Nestlé | Tata | HUL | ITC |
|--------|--------|------|-----|-----|
| **Revenue CAGR (base)** | **14–18%** | **14–18%** | 10–14% | 10–14% |
| **Moat** | **Premium foods + beverages** | Tata brand + salt/tea + foods M&A | **Widest HPC** | Cigarette cash + FMCG scale |
| **Key risk** | Coffee commodity; premium price elasticity | Integration + coffee US | Personal care volume | **Tobacco regulation** |
| **Ground reality** | **Strong retail offtake** (user) | UVG accelerating | USG recovering | Cigarette volume flat |

**Growth winner (parameter C only):** Nestlé ≈ Tata → HUL → ITC.

---

## Rank #1 — Nestlé India (NESTLEIND) · score **8.75**

**Why #1 — zero book weight + ground momentum + premium quality**

- **Perfect allocation (B: 10.0)** — not held; adds **quality diversifier** beyond ITC/HUL/Tata.
- **Best Q1 growth (C: 9.0)** — rev **+25%**, PAT **+48%**, EBITDA margin **+250 bps** (FACT).
- **Premium quality moat (D: 9.5)** — Maggi, Nescafé, KitKat, infant nutrition; **user confirms high product quality + heavy ground-level selling**.
- **Strong PCCL (A: 9.3)** — only **+7%** vs stress ₹1,380; **near 52W low recovery** — better pessimistic MoS than HUL/Tata.
- **Clean balance sheet (F: 8.5)** — D/E ~0.09.
- **Trade-off:** TTM P/E ~74× looks expensive until normalized EPS lens applied; MF holding low **4.15%**.

**Fresh entry plan**

| Item | Guidance |
|------|----------|
| **Starter** | **2–3 sh/mo** for 6 months → review Q2 FY27 |
| **Surplus slice** | **25–30%** of FMCG bucket |
| **Max initial weight** | **≤2%** portfolio cost |
| **Upgrade pace** | CMP ≤ ₹1,380 (at PCCL) → **3–4 sh/mo** |
| **Pause trigger** | Domestic UVG <8% two quarters · FII reverses −2 pp |

**Action:** Create `StockBook/FMCG/Nestle India/` on first confirmed trade.

---

## Rank #2 — Hindustan Unilever (HINDUNILVR) · score **8.08**

**Why #2 — best HPC franchise; Applied PCCL lifts A to 10.0**

- **Applied PCCL = CMP ₹2,040** (loss book **−16%**) — **0% premium** at capital-protection floor.
- **Wins management among held (9.0)** — gold-standard HPC; USG 10% best in 13 quarters.
- **Loses FII (E: 5.0)** — only **9.5% FII** vs ITC 34% / Tata 20%.
- **PAT −3%** headline — one-off tax (mgmt claim); monitor Q2.

**Action:** **HOLD** 250 · **5–10 sh/mo** · **15–20%** surplus · blended cap **₹2,544**.

---

## Rank #3 — Tata Consumer Products (TATACONSUM) · score **7.63**

**Why #3 — Conviction_PCCL ₹800 (Applied = min vs Rational ₹900)**

- **Conviction_PCCL ₹800** < Rational ₹900 → **Applied = ₹800** → **+30%** @ ₹1,038 → **A = 7.0**.
- **Growth still best among held (C: 8.5)** — UVG 13%, PAT +29%.
- **Axis B Fair** — SIP continues; **tier 3** pace + premium size cap.
- **Avg cost ₹784** — legacy tranche still **below your PCCL**; new adds @ ₹1,038 are above it.

**Action:** **HOLD** 602 · **8–12 sh/mo** · **25–30%** FMCG surplus · blended cap **₹858**.

**Promote to #2:** CMP ≤ **₹880** (tier 4) or UVG >15% two quarters + FII stabilises.

---

## Rank #4 — ITC (ITC) · score **7.52**

**Why #4 for surplus split — not a HOLD downgrade**

- **Applied PCCL = CMP ₹269** (loss **−25%**) — **0% premium** at floor; **not** "below stress PCCL ₹300" while underwater.
- **Loses allocation (B: 6.3)** — **50% FMCG book**, **#2 entire portfolio** (~₹10.7L cost).
- **Growth weakest (C: 6.5)** — Q1 revenue/margin pressure (FACT).
- **External tobacco (G: 6.0)** — regulatory overhang persistent.
- **Accelerate legacy SIP** at 105–150 sh/mo — **at applied PCCL floor** + Axis B Low.

**Action:** **HOLD** 3,000 · **105–150 sh/mo** on legacy · **10–15%** of FMCG surplus slice only · blended cap **₹376**.

**Promote in surplus rank:** FMCG book share **<35%** (build Nestlé/Tata) **and** Q2 FMCG segment recovery.

---

## Kwality Walls (KWIL) — outside top 4

| Item | Note |
|------|------|
| Position | 250 shares · ~₹11.5K cost · new Unilever demerger listing |
| PCCL | **UNVERIFIED** — watch only |
| Surplus | **0%** |
| **Action** | **HOLD** · optional 2–5 sh/mo · no comparative score until PCCL set |

---

## Recommended surplus split (weighted-rank aligned)

Assume **~15–20%** of monthly investable surplus to FMCG theme (alongside healthcare/pharma/banks):

| Name | **Weighted split (v2)** | Pace |
|------|------------------------:|------|
| **Nestlé** | **25–30%** | 2–3 sh/mo (new) |
| **Tata Consumer** | **25–30%** | 8–12 sh/mo |
| **HUL** | **15–20%** | 5–10 sh/mo |
| **ITC** | **10–15%** | 105–150 sh/mo (at applied PCCL floor) |
| **Kwality Walls** | **0%** | — |

*ITC/HUL: **Applied PCCL = CMP** on loss books — large share-count SIP at floor; **lower surplus %** vs Nestlé/Tata.*

### When to re-run weighted score

| Trigger | Action |
|---------|--------|
| Any **confirmed trade** | Recalculate **B** |
| CMP moves **≥1 tier** vs Applied PCCL | Recalculate **A** |
| **Avg cost vs CMP changes** (loss ↔ gain) | Recalculate **Applied PCCL** |
| FII ±2 pp | Recalculate **E** |
| Tobacco/GST headline (ITC) | Recalculate **G** |
| Q2 FY27 results | Recalculate **C** |
| Ground-level KPI change (user / channel checks) | Recalculate **C / D** for Nestlé |

---

## Cross-sector — where does next ₹ go?

| Theme | Weighted top picks |
|-------|-------------------|
| **Hospital** | Medanta **7.52** · Manipal **6.92** |
| **Pharma** | Lupin **8.14** · Dr Reddy **7.58** |
| **FMCG** | Nestlé **8.75** · HUL **8.08** · Tata **7.63** |
| **One slot each (3 themes)** | **Lupin + Medanta + Nestlé** |

| If you have… | Prefer |
|--------------|--------|
| **FMCG-only month** | **Nestlé starter > Tata > HUL**; ITC legacy accelerate separate |
| **Quality + ground momentum** | **Nestlé #1** — premium products, strong retail offtake |
| **Deep value + YoC** | **ITC @ applied PCCL** — max share-count SIP; surplus % capped |
| **Best growth @ fair P/E (held)** | **Tata Consumer #3** (Conviction_PCCL ₹800) |

---

## Triggers — re-rank table

| Event | Rank change |
|-------|-------------|
| Nestlé CMP ≤ ₹1,380 (PCCL) | **Strengthen #1** (A → 10) · pace 3–4 sh/mo |
| Nestlé domestic UVG <8% two quarters | **Pause** fresh · C ↓ |
| Tata UVG >15% two quarters | Tata → **#1 held** name |
| ITC FMCG book share <35% | ITC **B ↑** in surplus table |
| HUL FII >12% | HUL **E ↑** — may pass Tata |
| ITC adverse tobacco tax | ITC **G ↓** · pause surplus (legacy SIP at applied PCCL floor unchanged if thesis intact) |
| Nestlé FII reverses −2 pp | Review **E** · may drop below Tata |
| Rural recovery broad-based | All **C ↑** one notch |

---

## Evidence & dates

| Item | Date checked |
|------|--------------|
| Nestlé Q1 FY27 | 22 Jul 2026 (ET / company filing) |
| HUL Q1 FY27 | 28 Jul 2026 (Business Standard / Kotak Neo) |
| Tata Consumer Q1 FY27 | 24 Jul 2026 (company filing / ET) |
| ITC Q1 FY27 | Aug 2026 (MarketsMojo / Trendlyne) |
| FII shareholding Jun 2026 | Trendlyne / Craytheon · Nestlé **10.30% (+0.55 pp)** · ITC 34.23% · HUL 9.50% · Tata 20.08% |
| Nestlé CMP ~₹1,477 · 52W ₹1,145–1,553 | 21–27 Aug 2026 |
| User ground-reality input | 27 Aug 2026 — high product quality, strong ground-level selling |
| Holdings | 26 Aug 2026 `holdings.md` |
| Weighted scorecard v4 | 27 Aug 2026 — **dual anchor** Rational + Conviction → Applied (`pccl-dual-anchor.md`) |
| Weighted scorecard v3 | 27 Aug 2026 — Applied PCCL loss floor (`pccl-loss-position-floor.md`) |

**Next refresh:** Q2 FY27 (Oct–Nov 2026) · ITC YoC post dividend · Nestlé after first trade.

---

## Files

| Stock | StockBook folder |
|-------|---------------|
| ITC | `StockBook/FMCG/ITC/` |
| Hindustan Unilever | `StockBook/FMCG/Hindustan Unilever/` |
| Tata Consumer Products | `StockBook/FMCG/Tata Consumer Products/` |
| Kwality Walls India | `StockBook/FMCG/Kwality Walls India/` |
| Nestlé India (after first trade) | *Create folder on first starter SIP* |
