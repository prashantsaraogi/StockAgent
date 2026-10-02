# Pharma — Five-way comparative rank (+ Dr. Reddy's fresh entry)

**Analysis date:** 27 Aug 2026 (rev. 2 — weighted scorecard)  
**Scope:** Sun Pharma · Lupin · Cipla · Glenmark (held) · **Dr. Reddy's (fresh entry)**  
**Purpose:** Fresh/salary capital priority using **weighted parameters** — PCCL (pessimistic MoS), **reverse allocation**, growth, management, FII, internal/external risk  
**Mandate:** **HOLD** all legacy pharma holdings — no trim for valuation. Rank applies to **surplus capital only**.

Cross-ref: `StockBook/Pharma/*/summary-analysis.md` · `StockBook/Healthcare/healthcare-comparative-rank.md` · `comparative-scorecard.md` · `holdings.md`

---

## Executive summary — fresh capital rank (weighted)

| Rank | Name | Ticker | **Weighted score /10** | Verdict for **new ₹** | Monthly SIP | Surplus slice |
|:----:|------|--------|:----------------------:|----------------------|-------------|---------------|
| **1** | **Lupin** | LUPIN | **8.14** | Best **PCCL + forward P/E**; Q1 momentum | **2–3 sh/mo** | **25–30%** |
| **2** | **Dr. Reddy's** | DRREDDY | **7.58** | **Zero book weight + strong FII** — catalyst staged entry | **3–5 sh/mo** (new) | **15–20%** |
| **3** | **Sun Pharmaceutical** | SUNPHARMA | **7.14** | **Best franchise** — but **63% of pharma book** → allocation penalty | **3–4 sh/mo** (capped) | **15–20%** |
| **4** | **Cipla** | CIPLA | **6.27** | PCCL weak (+63%); Very expensive Axis B | **1 sh/mo** max | **≤5%** |
| — | **Glenmark** | GLENMARK | — | Legacy speck · **0% surplus** | 1 sh/mo optional | **0%** |

**One line:** **Lupin #1** on math. **Sun is best business** but **#3 for fresh ₹** because **63% of your pharma cost** is already Sun — same reverse-allocation rule as **Max in hospitals**. **Dr Reddy's #2** as **fresh build** (zero weight, **32% FII**) with **catalyst caps**.

---

## Weighted scoring methodology

Same **7-parameter framework** as `healthcare-comparative-rank.md` (v2). Fresh-capital rank = weighted sum (**0–10** per parameter, higher = better for **new money**).

| # | Parameter | Weight | What it measures |
|---|-----------|-------:|------------------|
| **A** | **PCCL / pessimistic margin of safety** | **25%** | Capital protection vs **stress PCCL only** — not normal IV |
| **B** | **Reverse portfolio allocation** | **25%** | **Higher existing pharma weight → lower score** |
| **C** | **Potential growth** (3-yr base) | **12%** | Revenue CAGR, pipeline, operating leverage |
| **D** | **Management quality** | **10%** | Governance, capital allocation, execution |
| **E** | **FII / institutional backing** | **10%** | Strong FII/DII = downside cushion + liquidity |
| **F** | **Internal risk** (inverse) | **9%** | FDA, execution, balance sheet — high risk → low score |
| **G** | **External risk** (inverse) | **9%** | US pricing, FX, API supply — high risk → low score |
| | **Total** | **100%** | |

### A — PCCL = pessimistic margin of safety only

```
Premium to PCCL (%) = (CMP − PCCL_low) / PCCL_low × 100
Score_A             = clamp(10 − Premium_to_PCCL_low ÷ 10, 0, 10)
```

| Name | PCCL_low | CMP | Premium | **Score A** |
|------|----------|----:|--------:|:-----------:|
| **Lupin** | ₹1,800 | ₹2,100 | **+17%** | **8.3** |
| **Sun** | ₹580 | ₹698 | **+20%** | **8.0** |
| **Dr Reddy's** | ₹850 | ₹1,175 | **+38%** | **6.2** |
| **Cipla** | ₹880 | ₹1,432 | **+63%** | **3.7** |

### B — Reverse allocation (pharma book + total portfolio)

```
Blended_weight = 0.70 × (Pharma_cost_share) + 0.30 × (Total_portfolio_cost_share)
Score_B        = 10 × (1 − Blended_weight)
```

| Name | Pharma cost % | Total portfolio % | Blended weight | **Score B** |
|------|-------------:|------------------:|---------------:|:-----------:|
| **Sun** | **63%** | **0.76%** | **44.3%** | **5.6** |
| Cipla | 20% | 0.24% | 14.1% | **8.6** |
| Lupin | 16% | 0.20% | 11.5% | **8.9** |
| **Dr Reddy's** | 0% | 0% | 0% | **10.0** |
| Glenmark | 1% | ~0% | ~0.7% | **9.9** |

*Sun penalty: **largest pharma line** (180 shares, ₹96K cost) — same logic as Max overweight in hospitals.*

### C–G — Proportional scores (Aug 2026)

| Parameter | Lupin | Sun | Dr Reddy's | Cipla | Notes |
|-----------|:-----:|:---:|:----------:|:-----:|-------|
| **C Growth** | **9.0** | 7.5 | 7.0 | 6.0 | Lupin Q1 +33%; Dr Reddy recovery optionality |
| **D Management** | 8.0 | **9.0** | 8.0 | 7.0 | Sun widest franchise |
| **E FII backing** | 8.0 | 6.0 | **9.0** | 7.0 | See FII table below |
| **F Internal risk** | 6.0 | **8.0** | 5.0 | 6.0 | Lupin OAI; Dr Reddy semaglutide L2 |
| **G External risk** | 7.0 | 7.0 | 6.0 | 6.0 | US IRA/pricing L1–L2 sector-wide |

**FII detail (Jun 2026 quarter — FACT):**

| Name | FII % | DII / MF % | Trend QoQ | **Score E** | Protective read |
|------|------:|-----------:|-----------|:-----------:|-----------------|
| **Dr Reddy's** | **32.07%** | ~22% est. | **−1.0 pp** | **9.0** | **Strongest FII** in peer set |
| **Lupin** | **22.42%** | ~24.7% DII | **+0.7 pp** | **8.0** | FII adding; institutional total ~47% |
| **Cipla** | **20.20%** | ~25% MF est. | −2.4 pp | **7.0** | Solid domestic MF base |
| **Sun** | **14.53%** | **22.18%** DII | **−1.4 pp** | **6.0** | **Lowest FII** vs peers; promoter 54% |

**Internal risk scoring (worst-of register):**

| Name | Key internal flag | Level | **Score F** |
|------|-------------------|-------|:-----------:|
| Sun | Clean balance sheet; US ops stress only | L1–L2 | **8.0** |
| Lupin | **Pithampur Unit II OAI** — remediation | **L2** | **6.0** |
| Cipla | US margin collapse Q1; net cash strong | L2 | **6.0** |
| Dr Reddy's | **Semaglutide provision**; lenalidomide cliff | **L2** | **5.0** |

---

## Master weighted scorecard

| Parameter | Weight | Lupin | Sun | Dr Reddy's | Cipla |
|-----------|-------:|------:|----:|-----------:|------:|
| A PCCL / pessimistic MoS | 25% | **8.3** | 8.0 | 6.2 | 3.7 |
| B Reverse allocation | 25% | **8.9** | **5.6** | **10.0** | 8.6 |
| C Growth potential | 12% | **9.0** | 7.5 | 7.0 | 6.0 |
| D Management | 10% | 8.0 | **9.0** | 8.0 | 7.0 |
| E FII backing | 10% | 8.0 | 6.0 | **9.0** | 7.0 |
| F Internal risk (inverse) | 9% | 6.0 | **8.0** | 5.0 | 6.0 |
| G External risk (inverse) | 9% | 7.0 | 7.0 | 6.0 | 6.0 |
| **Weighted total** | **100%** | **8.14** | **7.14** | **7.58** | **6.27** |
| **Fresh-capital rank** | | **#1** | **#3** | **#2** | **#4** |

```
Lupin     = 0.25×8.3 + 0.25×8.9 + 0.12×9 + 0.10×8 + 0.10×8 + 0.09×6 + 0.09×7 = 8.14
Dr Reddy  = 0.25×6.2 + 0.25×10  + 0.12×7 + 0.10×8 + 0.10×9 + 0.09×5 + 0.09×6 = 7.58
Sun       = 0.25×8.0 + 0.25×5.6 + 0.12×7.5+ 0.10×9 + 0.10×6 + 0.09×8 + 0.09×7 = 7.14
Cipla     = 0.25×3.7 + 0.25×8.6 + 0.12×6 + 0.10×7 + 0.10×7 + 0.09×6 + 0.09×6 = 6.27
```

**Interpretation:** **Lupin** wins **A + C + B**. **Dr Reddy's** jumps to **#2** on **B (10.0) + E (9.0)** despite weak **F (5.0)** and Q1 miss. **Sun** drops to **#3** — wins **D + F** but **loses B (5.6)** on concentration. **Cipla** fails **A (3.7)**.

---

## Your current pharma allocation

| Ticker | Qty | Avg cost | Cost basis | CMP (approx.) | Market value | Legacy return | Share of **pharma-only** book (cost) |
|--------|----:|---------:|-----------:|--------------:|-------------:|--------------:|-------------------------------------:|
| **SUNPHARMA** | 180 | ₹533 | **₹95,893** | ₹698 | ~₹1,25,640 | +31% | **63%** |
| **CIPLA** | 25 | ₹1,220 | ₹30,507 | ₹1,432 | ~₹35,800 | +17% | 20% |
| **LUPIN** | 32 | ₹775 | ₹24,804 | ₹2,100 | ~₹67,200 | +171% | 16% |
| **GLENMARK** | 5 | ₹197 | ₹983 | ₹2,150 | ~₹10,750 | +993% | 1% |
| **DRREDDY** | — | — | — | ₹1,175 | — | Fresh | — |
| **Total (4 held)** | | | **₹1,52,187** | | **~₹2,39,390** | | 100% |

**Portfolio context:** Pharma **~₹1.5L** vs hospitals **~₹19.4L** — pharma **underweight**; build Lupin + Dr Reddy first per weighted rank. **Do not sell** legacy to fund new names.

---

## Sector competition — India + US generics

| Battleground | Impact (Aug 2026) |
|--------------|-------------------|
| **India branded chronic** | Volume +10–14% sector; stable pricing |
| **US generics / inhalers** | **Intense** — IRA pricing, channel consolidation (L2) |
| **Complex injectables / biosimilars** | Dr Reddy's semaglutide/abatacept; Lupin inhalers; Sun specialty |
| **GLP-1 / peptide API** | Dr Reddy Q1 **₹240 Cr provision** |

---

## Q1 FY27 results — side by side (quarter ended Jun 2026)

| Metric | **Sun** | **Lupin** | **Cipla** | **Dr Reddy's** |
|--------|--------:|----------:|----------:|---------------:|
| **Revenue** | ₹15,184 Cr (+10%) | ₹8,217 Cr (+33%) | India +12%; US −21% | ₹8,071 Cr (**−5.6%**) |
| **EBITDA margin** | **28.9%** | **31.4%** | **16.7%** | **12.5%** (15.4% ex-prov.) |
| **Reported PAT** | ₹2,895 Cr (+27%) | ₹1,417 Cr (+16%) | **−39% YoY** | ₹444 Cr (**−69%**) |
| **US business** | US $427M (**−10%**) | US +43% | Albuterol −21% | Weak + semaglutide |
| **India business** | India +16% | India +14% | India +12% | Branded healthy (mgmt) |

---

## Valuation & PCCL @ CMP (pessimistic anchor only)

| Metric | **Lupin** | **Sun** | **Dr Reddy's** | **Cipla** |
|--------|----------:|--------:|---------------:|----------:|
| **CMP** | ₹2,100 | ₹698 | ₹1,175 | ₹1,432 |
| **PCCL_low** | ₹1,800 | ₹580 | ₹850 | ₹880 |
| **Premium to PCCL** | +17% | +20% | +38% | +63% |
| **Forward P/E FY27E** | **~13×** | **~21×** | ~26–32× | ~28× |
| **Axis B** | Fair | Fair | Fair (turnaround) | Very expensive |

### Dr. Reddy's catalyst register

| Catalyst | Date / prob |
|----------|-------------|
| Semaglutide API restart | **Nov 2026** · ~65% |
| Biosimilar abatacept | **Dec 2026** · ~60% |
| Combined forward prob | **~55%** → staged buy only |

---

## Growth potential — 3-year view

| Driver | Lupin | Sun | Dr Reddy's | Cipla |
|--------|-------|-----|------------|-------|
| **Revenue CAGR (base)** | **20–25%** | 10–14% | 8–12% (recovery) | 10–12% |
| **Moat** | US inhalers/complex | **Widest** | US injectables + India | India chronic |
| **Key risk** | Pithampur OAI | US pricing | Semaglutide cliff | US Ventolin |

**Growth winner (parameter C only):** Lupin → Dr Reddy's → Sun → Cipla.

---

## Rank #1 — Lupin (LUPIN) · score **8.14**

**Why #1 on weighted score**

- **Best combined A + C:** PCCL +17% (8.3) · forward P/E **~13×** · Q1 sales +33%, EBITDA +43%.
- **Strong B (8.9):** Only 32 shares — **16%** of pharma book despite +171% legacy gain.
- **Trade-off:** **OAI Pithampur (F: 6.0)** — monitor; not size-up if import alert.

**Action:** **HOLD** 32 · **2–3 sh/mo** · **25–30%** pharma surplus · blended cap **₹969**.

---

## Rank #2 — Dr. Reddy's (DRREDDY) · score **7.58**

**Why #2 — fresh entry beats Sun on allocation + FII**

- **Perfect allocation (B: 10.0)** — zero position; full room to build.
- **Strongest FII 32.07% (E: 9.0)** — most institutional cushion in peer set.
- **Dragged by:** Q1 PAT −69% · semaglutide **F: 5.0** · PCCL +38% **(A: 6.2)**.
- **Catalyst ~55%** — **staged SIP only**.

| Item | Guidance |
|------|----------|
| **Starter** | **3–5 sh/mo** · review post **Nov 2026** |
| **Surplus slice** | **15–20%** |
| **Max weight** | **≤2%** portfolio cost until margin recovery |
| **Upgrade to #1** | Semaglutide verified + Sep-Q EBITDA ≥20% |

**Hard exclusion:** **Pass**.

---

## Rank #3 — Sun Pharmaceutical (SUNPHARMA) · score **7.14**

**Why #3 — best franchise, penalised on concentration**

- **Wins management (9.0) + internal risk (8.0)** — India #1; specialty 22%.
- **Loses allocation (B: 5.6)** — **63% of pharma cost**, 180 shares.
- **Lowest FII in peer set (E: 6.0)** — 14.53% vs Dr Reddy 32%.
- **Still core HOLD** — continuous SIP at **capped pace**.

**Action:** **HOLD** 180 · **3–4 sh/mo** · **15–20%** surplus · blended cap **₹570**.

**Promote to #2:** US stabilises 2Q **and** Sun pharma book share **<50%**.

---

## Rank #4 — Cipla (CIPLA) · score **6.27**

**Why #4 — PCCL score 3.7**

- **+63% above PCCL_low ₹880** — tier 1 very expensive.
- **HOLD** 25 legacy · **1 sh/mo** · **≤5%** surplus.

---

## Glenmark (GLENMARK) — outside top 4

| Item | Note |
|------|------|
| Position | 5 shares · **+993%** legacy · ~₹10K MV |
| Surplus | **0%** |
| **Action** | **HOLD** · optional 1 sh/mo |

---

## Recommended surplus split (weighted-rank aligned)

| Name | **Weighted split (v2)** | Pace |
|------|------------------------:|------|
| **Lupin** | **25–30%** | 2–3 sh/mo |
| **Dr. Reddy's** | **15–20%** | 3–5 sh/mo |
| **Sun** | **15–20%** | 3–4 sh/mo |
| **Cipla** | **≤5%** | 1 sh/mo |
| **Glenmark** | **0%** | — |

### When to re-run weighted score

| Trigger | Action |
|---------|--------|
| Any **confirmed trade** | Recalculate **B** |
| CMP moves **≥1 tier** vs PCCL | Recalculate **A** |
| FII ±2 pp | Recalculate **E** |
| FDA / semaglutide / OAI headline | Recalculate **F / G** |
| Q2 FY27 results | Recalculate **C** |

**Combined Healthcare + Pharma:**

| Theme | Weighted top picks |
|-------|-------------------|
| **Hospital** | Medanta **7.52** · Manipal **6.92** · Max **6.96** |
| **Pharma** | Lupin **8.14** · Dr Reddy **7.58** · Sun **7.14** |
| **One slot each** | **Medanta + Lupin** |

---

## Pharma vs hospital — where does next ₹ go?

| If you have… | Prefer |
|--------------|--------|
| **One pharma + one hospital slot** | **Medanta (7.52) + Lupin (8.14)** |
| **Pharma-only month** | **Lupin > Dr Reddy's starter > Sun** |
| **Quality over weighted rank** | **Sun HOLD** · lower surplus % until book diversifies |
| **Catalyst punt (small)** | **Dr Reddy's 3–5 sh/mo** — not Cipla |

---

## Triggers — re-rank table

| Event | Rank change |
|-------|-------------|
| Lupin resolves Pithampur OAI | **Strengthen #1** (F ↑) |
| Dr Reddy semaglutide ships Nov 2026 | **Strengthen #2** · may challenge #1 |
| Dr Reddy semaglutide delayed | **Pause** fresh · drop below Sun |
| Sun US positive 2Q | Sun **C/D ↑** — still **#3** unless **B improves** |
| Sun pharma book share **<50%** | Sun **B ↑** → may retake **#2** |
| Cipla CMP ≤ ₹1,050 | Cipla **A ↑** — still likely **#4** |
| Sector FDA import alert | Cut all US-heavy pace one tier |

---

## Evidence & dates

| Item | Date checked |
|------|--------------|
| Sun / Lupin / Cipla / Dr Reddy Q1 FY27 | Jul–Aug 2026 |
| FII shareholding Jun 2026 | Sun 14.53% · Lupin 22.42% · Cipla 20.20% · Dr Reddy ~32.07% |
| CMP anchors | 23–27 Aug 2026 ASSUMPTION |
| Holdings | 26 Aug 2026 `holdings.md` |
| Weighted scorecard v2 | 27 Aug 2026 — mirrors `healthcare-comparative-rank.md` |

**Next refresh:** Q2 FY27 · **Dr Reddy semaglutide Nov 2026** · Lupin OAI · Sun US trend.

---

## Files

| Stock | StockBook folder |
|-------|---------------|
| Sun Pharmaceutical | `StockBook/Pharma/Sun Pharmaceutical/` |
| Lupin | `StockBook/Pharma/Lupin/` |
| Cipla | `StockBook/Pharma/Cipla/` |
| Glenmark Pharma | `StockBook/Pharma/Glenmark Pharma/` |
| Dr. Reddy's (after first trade) | *Create folder on first starter SIP* |
