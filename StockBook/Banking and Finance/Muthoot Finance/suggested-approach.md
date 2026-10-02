# Muthoot Finance — Suggested Approach

**Analysis date:** 24 Aug 2026  
**For:** 125 shares @ ₹1289.74  
**Investor mandate:** Continuous salary SIP in quality names · **PCCL protects** pace + blended book

---

## Philosophy

```
Wealth = Quantity x Time x Business quality
Nobody knows timing — SIP through sideways markets
PCCL = protection (pace + book floor), NOT wait-for-crash entry
```

Cross-ref: `pccl-analysis/continuous-sip-valuation-tiers.md` · `StockBook/_templates/dual-axis-suggested-approach.md`

---

<!-- LENSES-APPROACH:START -->
## Lens-driven plan

How standalone lenses constrain **pace** and **surplus** (source files updated independently).

| Lens | Read @ CMP | Effect on pace / surplus |
|------|------------|---------------------------|
| **News** | No row in TICKER-INDEX | Thesis-led pace |
| **Parameters (Part 2 forward)** | See PARAMETERS file | Sets **Axis B** current value |
| **Broker street** | Consensus only - refresh fetch | **Does not override** PCCL or pause buckets |
| **Holding CAGR** | Book CAGR 86.11% | Blended cap discipline on legacy winners |
| **Quotes** | Not run (no buy/add logged) | Staged starter vs lump sum on buy days |
| **PCCL / Axis A** | Tier in tables below | Baseline sh/mo |
| **Surplus rank** | `quadrant-map.md` | % of monthly investable |

## Lens conflict resolution

| If... | Then... |
|-------|---------|
| Street upside high but PCCL tier 1-2 | **PCCL wins** - token SIP only |
| Parameters forward cheap, Axis A expensive | **Dual-axis** - slow SIP; see Axis A/B tables |
| News overhang, thesis intact | **HOLD**; slow or pause **new** buys |
| Personal pause bucket (IT / HDFC Bank / ITC) | **0% surplus** - no lens overrides |
| YoC < 8% (dividend names) | **Pause adds** until YoC path clear |

*Registry:* [`ANALYSIS-LENSES-FRAMEWORK.md`](../../../ANALYSIS-LENSES-FRAMEWORK.md) Â· Sync: 2026-08-30
<!-- LENSES-APPROACH:END -->

## Dual-axis @ CMP (₹2972) — **axes align**

| | **Axis A — SIP tier** | **Axis B — Current value** |
|--|------------------------|----------------------------|
| **Question** | Price vs PCCL/IV? | Good buy **today** (forward)? |
| **Reading** | Tier **1** (+70% vs PCCL) | **Expensive** |
| **Divergence?** | **No** — both say token/minimal SIP | |

---

## Valuation tier @ CMP (₹2972) — Axis A

| Metric | Value | Tier |
|--------|------:|:----:|
| PCCL anchor | ₹1750-1800 | |
| Premium to PCCL | 70% | |
| **Label** | **Very expensive** | **1** |
| **Current value @ CMP** | **Expensive** | |
| **SIP stance** | Minimal token — 1 tranche/mo max + blended cap | |
| **Monthly pace** | **1-2 sh/mo** | |
| **Blended ceiling** | **₹1508** | |

---

## Current value @ CMP — Axis B (P/E + industry + macro)

| Metric | Muthoot | Sector / peer | Read |
|--------|-------:|--------------:|------|
| Normalized EPS (₹) | ~₹165-212 | — | ASSUMPTION (refresh Q2) |
| P/E @ CMP (normalized) | **~14-18×** | Banks / NBFC ~14-18× | **In line to premium** |
| Legacy return on your cost | +130.4% | — | Past run partly in price |
| Industry / KPI | Gold loan AUM; PAT growth | — | See detail-analysis |

| Factor | Read |
|--------|------|
| Sector band | Banks **High** (private) / Medium (PSU) |
| India macro | GDP 6.7%; RBI 5.25% (News 24 Aug) |
| Forward probability | **~55%** |
| **Current value (B)** | **Expensive** |


**Conflict resolution:** A=1, B=Expensive — **aligned** — **1-2 sh/mo**, surplus 0-5%.

---

## Current value @ CMP (summary)

| Item | Assessment |
|------|------------|
| **Current value** | **Expensive** |
| **Past performance** | Legacy return **+130.4%** on your book |
| **Forward probability** | **~55%** |
| **Price vs PCCL** | **70%** vs pessimistic anchor |
| **Framework read** | +65% vs PCCL; Forward ~55% · token 1-2/mo. |
| **SIP implication** | **1-2 sh/mo** — surplus **0-5%** |

---

## Default action

| | |
|--|--|
| **HOLD** | All 125 shares |
| **Tier @ CMP** | **1** — Very expensive |
| **Current value @ CMP** | **Expensive** |
| **Continuous SIP** | **1-2 sh/mo** |
| **Surplus slice** | **0-5%** |
| **Surplus action** | **HOLD** |

---

## Blended average protection

| Item | Value |
|------|------:|
| Your avg cost | ₹1289.74 |
| Blended ceiling | ₹1508 |
| 12-mo adds (base) | +12 to +24 shares |
| End qty (approx.) | 137 to 149 |

**Rule:** Slow pace upgrade if blended avg approaches **₹1508**. Do not stop SIP entirely unless core-problem / existential trigger.

---

## Price zones & actions

| Zone | vs PCCL | Tier | Action |
|------|---------|:----:|--------|
| At/below PCCL low | Stress | **5** | Core-problem check — **accelerate** |
| PCCL to +15% | Fair | **4** | **Steady SIP** |
| +15% to +30% | Little premium | **3** | **Slow SIP** |
| +30% to +50% | Expensive | **2** | **Token SIP** + blended cap |
| Above +50% | Very expensive | **1** | **Minimal token** (1/mo max) |

@ CMP: **tier 1** — **1-2 sh/mo**

---

## New-tranche risk @ PCCL

| Buy @ CMP | PCCL low | Loss on new ₹ if revisits PCCL |
|----------:|---------:|----------------------------------:|
| ₹2972 | ₹1750 | ~-41% on fresh tranche |

Legacy @ ₹1289.74 may still be above PCCL — size caps protect book.

---

## Triggers — upgrade or downgrade **pace**

### Upgrade (next tier pace)
- [ ] CMP moves down one tier band without thesis break
- [ ] Quarterly EPS supports normalized growth
- [ ] Core-problem test passes (if applicable)

### Downgrade (slower token)
- [ ] Blended avg within 3% of ceiling **₹1508**
- [ ] Material negative news / governance flag
- [ ] Axis B downgrades (Fair to Expensive)

---

## One-page decision card

```
HOLD 125 @ ₹1289.74
Axis A — SIP tier 1 vs PCCL (+70% vs PCCL)
Axis B — Current value: Expensive @ P/E ~14-18× vs sector ~16×
DIVERGENCE: No — 1-2 sh/mo
Surplus: 0-5%
Blended cap: ₹1508
```

**Next refresh:** Q2 FY27 results · normalized P/E vs sector.