# Bajaj Finserv — Suggested Approach

**Analysis date:** 24 Aug 2026  
**For:** 60 shares @ ₹1699.73  
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
| **Holding CAGR** | Book CAGR 12.19% | Blended cap discipline on legacy winners |
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

## Dual-axis @ CMP (₹2033) — **axes align**

| | **Axis A — SIP tier** | **Axis B — Current value** |
|--|------------------------|----------------------------|
| **Question** | Price vs PCCL/IV? | Good buy **today** (forward)? |
| **Reading** | Tier **3** (+27% vs PCCL) | **Expensive** |
| **Divergence?** | **No** — both say steady/slow SIP | |

---

## Valuation tier @ CMP (₹2033) — Axis A

| Metric | Value | Tier |
|--------|------:|:----:|
| PCCL anchor | ₹1600-1750 | |
| Premium to PCCL | 27% | |
| **Label** | **Little premium** | **3** |
| **Current value @ CMP** | **Expensive** | |
| **SIP stance** | Slow — reduced tranche | |
| **Monthly pace** | **1 sh/mo** | |
| **Blended ceiling** | **₹1926** | |

---

## Current value @ CMP — Axis B (P/E + industry + macro)

| Metric | Bajaj | Sector / peer | Read |
|--------|-------:|--------------:|------|
| Normalized EPS (₹) | ~₹113-145 | — | ASSUMPTION (refresh Q2) |
| P/E @ CMP (normalized) | **~14-18×** | Banks / NBFC ~14-18× | **In line to premium** |
| Legacy return on your cost | +19.6% | — | Past run partly in price |
| Industry / KPI | See `detail-analysis.md` | — | See detail-analysis |

| Factor | Read |
|--------|------|
| Sector band | Banks **High** (private) / Medium (PSU) |
| India macro | GDP 6.7%; RBI 5.25% (News 24 Aug) |
| Forward probability | **~60%** |
| **Current value (B)** | **Expensive** |


**Conflict resolution:** A=3, B=Expensive — **aligned** — **1 sh/mo**, surplus 5%.

---

## Current value @ CMP (summary)

| Item | Assessment |
|------|------------|
| **Current value** | **Expensive** |
| **Past performance** | Legacy return **+19.6%** on your book |
| **Forward probability** | **~60%** |
| **Price vs PCCL** | **27%** vs pessimistic anchor |
| **Framework read** | Holding-co premium; +16-27% vs PCCL. Forward ~60% · token SIP. |
| **SIP implication** | **1 sh/mo** — surplus **5%** |

---

## Default action

| | |
|--|--|
| **HOLD** | All 60 shares |
| **Tier @ CMP** | **3** — Little premium |
| **Current value @ CMP** | **Expensive** |
| **Continuous SIP** | **1 sh/mo** |
| **Surplus slice** | **5%** |
| **Surplus action** | **HOLD** |

---

## Blended average protection

| Item | Value |
|------|------:|
| Your avg cost | ₹1699.73 |
| Blended ceiling | ₹1926 |
| 12-mo adds (base) | +12 to +12 shares |
| End qty (approx.) | 72 to 72 |

**Rule:** Slow pace upgrade if blended avg approaches **₹1926**. Do not stop SIP entirely unless core-problem / existential trigger.

---

## Price zones & actions

| Zone | vs PCCL | Tier | Action |
|------|---------|:----:|--------|
| At/below PCCL low | Stress | **5** | Core-problem check — **accelerate** |
| PCCL to +15% | Fair | **4** | **Steady SIP** |
| +15% to +30% | Little premium | **3** | **Slow SIP** |
| +30% to +50% | Expensive | **2** | **Token SIP** + blended cap |
| Above +50% | Very expensive | **1** | **Minimal token** (1/mo max) |

@ CMP: **tier 3** — **1 sh/mo**

---

## New-tranche risk @ PCCL

| Buy @ CMP | PCCL low | Loss on new ₹ if revisits PCCL |
|----------:|---------:|----------------------------------:|
| ₹2033 | ₹1600 | ~-21% on fresh tranche |

Legacy @ ₹1699.73 may still be above PCCL — size caps protect book.

---

## Triggers — upgrade or downgrade **pace**

### Upgrade (next tier pace)
- [ ] CMP moves down one tier band without thesis break
- [ ] Quarterly EPS supports normalized growth
- [ ] Core-problem test passes (if applicable)

### Downgrade (slower token)
- [ ] Blended avg within 3% of ceiling **₹1926**
- [ ] Material negative news / governance flag
- [ ] Axis B downgrades (Fair to Expensive)

---

## One-page decision card

```
HOLD 60 @ ₹1699.73
Axis A — SIP tier 3 vs PCCL (+27% vs PCCL)
Axis B — Current value: Expensive @ P/E ~14-18× vs sector ~16×
DIVERGENCE: No — 1 sh/mo
Surplus: 5%
Blended cap: ₹1926
```

**Next refresh:** Q2 FY27 results · normalized P/E vs sector.