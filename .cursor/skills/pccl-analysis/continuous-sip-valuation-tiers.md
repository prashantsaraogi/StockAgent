# Continuous SIP — Valuation Tiers & PCCL Protection

Use with `pccl-as-protection-not-target.md`, `premium-add-sizing.md`,
`salary-systematic-accumulation.md`, and every `StockBook/[Stock]/suggested-approach.md`.

Implements user doctrine (**Aug 2026**): **continuous salary SIP in all good
shares** — even at premium — because **nobody knows timing**. PCCL **protects**
(size + blended book); it is **not** a price to wait for in normal markets.

---

## Core doctrine

```
Wealth = Quantity × Time × Business quality

Nobody knows when the market moves.
Sideways years + rising earnings → move up can come anytime (e.g. geo de-escalation).
→ Continuous SIP in quality names is the primary wealth path.

PCCL (stock)        = pessimistic stress floor — caps pace, quantifies new-tranche risk
Blended avg cap     = pessimistic stress floor for YOUR book on that name
Conservative IV     = fair-value anchor for tier placement
```

**Wrong mindset:** Wait for crash or PCCL before every add.  
**Right mindset:** **Always add something** in thesis-intact quality names —
**pace and ₹ size** follow the valuation tier. **Reserve dry powder** for lower tiers.

Cross-ref exemplar report: `StockBook/Banking and Finance/Muthoot Finance/suggested-approach.md` (tiers **align** — both Expensive).  
Divergence exemplar: `StockBook/Oil and Gas/Indraprastha Gas/suggested-approach.md` (Tier **5** mechanical vs **Fair** current value → **downgraded pace**).

---

## Two-axis framework (mandatory — do not collapse into one label)

Reports must show **two separate judgments** @ CMP. They often **diverge** — especially for **old legacy holdings** where PCCL moved up with earnings but CMP rerated faster.

```
                    AXIS A — SIP TIER (1–5)              AXIS B — CURRENT VALUE @ CMP
                    ─────────────────────                ─────────────────────────────
What it measures    Price vs PCCL + MoS vs IV            Is CMP a **good buy today** for a
                    (mechanical / backward anchor)      **new ₹ tranche** given forward earnings,
                                                        industry, and macro?

Primary inputs      Premium to PCCL, Conservative IV      Normalized P/E @ CMP vs own history
                                                        vs **sector P/E** vs **peers**
                                                        Latest quarter / TTM trend (not peak extrapolation)
                                                        Industry KPIs (SIAM, AMFI, bed growth, etc.)
                                                        India macro / sector band (News, RBI, policy)
                                                        Forward probability + core-problem test

Drives              Monthly **pace** (sh/mo)              **Surplus rank %** + honest label
                    Premium-to-PCCL **size cap**          "good to add / fair / expensive **today**"
                    Blended ceiling discipline

Does NOT alone      Whether thesis is intact → both axes  Whether legacy is profitable → past perf
decide              HOLD (default either way)
```

### Axis A — SIP tier @ CMP (mechanical vs PCCL)

Classify using **Premium to Applied PCCL** and **MoS vs Conservative IV** — use the **more conservative** (slower) tier.

**Loss-position floor:** if holder at **unrealized loss** (CMP \< avg cost),
**Applied PCCL = CMP** — PCCL cannot be below CMP. See `pccl-loss-position-floor.md`.

**Dual anchor:** **Rational_PCCL** (model) + optional **Conviction_PCCL** (user) →
**Base_PCCL = min(both)** → Applied. See `pccl-dual-anchor.md`.

| Tier | Label | Typical Premium to PCCL | MoS vs Conservative IV |
|:----:|-------|------------------------:|------------------------:|
| **5** | Best cost vs PCCL | ≤ 0% | Any if core-problem passes |
| **4** | Fair vs PCCL | 0–15% | ≥ 0% |
| **3** | Little premium vs PCCL | 15–30% | ≥ 0% |
| **2** | Expensive vs PCCL | 30–50% | 0% to −8% vs IV |
| **1** | Very expensive vs PCCL | > 50% | < −8% vs IV |

**Legacy holder note:** Your **avg cost** does **not** set SIP tier — **CMP vs PCCL/IV** does. A 10-year winner can show **Tier 1 vs PCCL** (+80% premium) while **Current value @ CMP** is still **Fair** for new adds.

### Axis B — Current value @ CMP (forward / holistic)

**Question:** *Ignoring my old cost, is today's CMP attractive for this business **going forward**?*

| Label | When to use |
|-------|-------------|
| **Low** | Normalized **P/E at or below** sector/peers; strong moat; macro/sector **High** band; forward prob **≥65%**; no unresolved core problem |
| **Fair** | P/E **in line** with sector; growth visible; macro neutral-to-supportive; forward prob **~50–65%**; may be below PCCL (IGL) or above PCCL (quality compounder) |
| **Expensive** | P/E **above** sector/history on **normalized** EPS; legacy multibagger; forward prob OK but **size-capped** adds only |
| **Very expensive** | P/E stretched vs normal + weak forward prob / structural threat / cyclical peak earnings in price |

**Required rows in every `suggested-approach.md` (Current value block):**

| Row | Example |
|-----|---------|
| Normalized EPS (₹) | ₹11 · label FACT or ASSUMPTION |
| P/E @ CMP (normalized) | 13.7× |
| Sector / peer P/E | Gas distribution ~23×; peer MGL ~18× |
| Premium/discount vs sector | −40% vs sector (cheap on earnings) |
| Latest result trend | Q1 vol +6%, PAT −44% — margin not normal |
| Industry / KPI read | CGD vol OK; Delhi EV structural watch |
| India macro / sector band | Oil & Gas **Medium**; RBI GDP 6.7% |
| **Current value label** | **Fair (structural watch)** |

### When Axis A and Axis B diverge (common cases)

| SIP tier (A) | Current value (B) | Meaning | Pace | Surplus rank |
|:------------:|:------------------:|---------|------|--------------|
| **5** | **Low** | Cheapest vs PCCL **and** good forward buy | **Accelerate** (full tier-5) | **High** |
| **5** | **Fair** | Cheap vs PCCL but news/margin/structural watch | **Moderate** (downgrade from mechanical max) | **Medium** |
| **5** | **Expensive** | Below PCCL on price but **broken thesis** or peak earnings | **Token or pause** | **Low** |
| **1–2** | **Fair** | Legacy rerated; **still OK to add** for quality compounder | **Token–steady** + premium size cap | **Medium** (dual lens) |
| **1–2** | **Very expensive** | Bubble / cyclical peak / weak forward | **Minimal token** | **Low** |
| **3–4** | **Low** | Rare — verify not value trap (core-problem test) | **Steady–accelerate** | **High** |

**Rule when they conflict:**

1. **Pace (sh/mo)** → set by **more conservative of A and B**, then apply **news/structural downgrade** if any (IGL pattern).  
2. **Surplus rank %** → set mainly by **Axis B** + comparative scorecard vs MAX/ICICI/LT.  
3. **Never** call Tier 5 mechanical "Low" without Axis B — IGL is Tier 5 price but **Fair** current value.  
4. **Never** block all adds on Tier 1 vs PCCL if Axis B is **Fair** and quality **Strong** — use **token SIP + size cap** (Muthoot-style).

### Worked example — IGL @ ₹151 (Aug 2026)

| Axis | Reading |
|------|---------|
| **A — SIP tier** | **5** (Premium to PCCL **−16%**, MoS vs IV +25%) |
| **B — Current value** | **Fair** (P/E ~14× normalized vs sector ~23×; but Delhi EV + Q1 margin stress) |
| **Conflict resolution** | Price says accelerate 72+ sh/mo → **downgrade to 10–20 sh/mo** |
| **Why still add?** | Below PCCL; franchise intact; **not** Very expensive forward |
| **Why not full accelerate?** | Axis B not **Low**; structural CNG watch |

### Worked example — legacy compounder (conceptual)

| Axis | Reading |
|------|---------|
| **A — SIP tier** | **1** (Premium to PCCL **+70%** — PCCL ₹1,800, CMP ₹2,972) |
| **B — Current value** | **Fair** (Normalized P/E 28× vs sector 30×; forward PAT growth 8%; macro OK) |
| **Conflict resolution** | **Not** "don't buy" — **1–2 sh/mo token** + blended cap; surplus **5%** not 25% |
| **User question answered** | "Tier 1 vs PCCL but CMP still good?" → **Yes, token add OK** if Axis B ≥ Fair |

---

## Current value @ CMP (framework view — mandatory in reports)

Separate from **SIP tier (1–5)** which sets **pace**, report a holistic label:

| Label | Meaning |
|-------|---------|
| **Low** | Attractive vs **normalized earnings + PCCL/IV**; strong forward thesis probability |
| **Fair** | Reasonable for **business quality + visible growth path**; adds at steady pace OK |
| **Expensive** | Premium largely reflects **past run or peak/cyclical earnings**; forward prob still OK but **size-capped SIP** |
| **Very expensive** | Stretched vs **pessimistic + normal case**; weak forward prob or core-problem; **minimal token** only |

**Inputs (always cite in one line):**

1. **Past performance** — legacy return %, multiyear rerating, peak vs normalized EPS  
2. **Forward probability** — catalyst / sector / moat (framework §4, §12) — band e.g. 55–65%  
3. **Price vs PCCL & Conservative IV** — mechanical check → **Axis A**  
4. **P/E @ CMP** on **normalized EPS** vs **sector / peer** + latest quarter trend → **Axis B**  
5. **Industry KPI + India macro** — sector band from News / dynamic context  
6. **Business quality** — Strong / Moderate / Weak — caps how much premium is tolerable  

**SIP tier vs current value:** Axis A sets **baseline pace**; Axis B sets **surplus rank** and may **downgrade pace** when Tier 5 mechanical but Fair/Expensive forward (IGL). When Tier 1 vs PCCL but Fair forward, **token add still OK** (dual lens).

Example — Ashok Leyland @ ₹173: legacy **+330%**, +24% vs PCCL, CV cycle **~55–65%** recovery prob → **Expensive** (token SIP; not salary priority).

---

## Five valuation tiers (every stock @ CMP)

Classify on **analysis date** using **Premium to PCCL** and **MoS vs Conservative IV**.
Use the **more conservative** (slower pace) if the two disagree.

| Tier | Label | Typical Premium to PCCL | MoS vs Conservative IV | SIP stance |
|:----:|-------|------------------------:|------------------------:|------------|
| **5** | **Best cost to add** | ≤ 0% (at/below PCCL) | Any if core-problem passes | **Accelerate** — largest monthly tranche |
| **4** | **Fair value** | 0–15% | ≥ 0% | **Steady** — full salary pace |
| **3** | **Little premium** | 15–30% | ≥ 0% | **Slow** — reduced tranche |
| **2** | **Expensive** | 30–50% | 0% to −8% vs IV | **Token** — small fixed tranche + blended cap |
| **1** | **Very expensive** | > 50% | < −8% vs IV | **Minimal token** — never zero on Strong quality; **lowest** surplus % |

**Continuous SIP rule:** Tiers **1–2** still allow **token adds** (e.g. 1–2 shares/month
or 5–10% of monthly surplus ₹) when business quality is **Strong** and thesis intact —
protected by **premium-to-PCCL size cap** and **blended average ceiling**.

**True pause** (HOLD legacy, **zero** new ₹) only when:
- Unresolved **core problem** or Tier-1 existential risk
- **Weak** management with open regulatory overhang (bank pattern)
- User **concentration cap** breached (>15–20% weight)
- **Not** merely “expensive” on a quality compounder

---

## Monthly pace (shares or ₹ — use smaller after concentration check)

| Tier | Monthly tranche (vs existing qty) | Monthly surplus ₹ (typical) |
|:----:|----------------------------------:|----------------------------:|
| 5 Best cost | +3–5% | 20–30% of name’s surplus slice |
| 4 Fair value | +2–4% | 15–25% |
| 3 Little premium | +1–2% | 10–15% |
| 2 Expensive | +0.5–1% or fixed token | 5–10% |
| 1 Very expensive | Fixed token (e.g. 1 sh/mo) | 0–5% |

**Reserve dry powder:** When tier ≤ 3, keep **40–60%** of intended 12-month add budget
for tier 5–4 zones (dip, results scare, sector panic).

---

## Blended average protection (existing holders)

PCCL protects **your book**, not market timing.

```
Blended avg after adds = (Legacy cost + New tranches) / Total qty
Set blended ceiling     = typically PCCL + 10–20% buffer (name-specific)
Stop increasing pace   = when blended avg approaches ceiling (not “stop all SIP” unless tier-1)
```

Report in every `suggested-approach.md`:
- Blended ceiling table (max adds @ CMP → total shares)
- Monthly pace table (1 / 2 / 3 shares → blended after 12 mo)
- New-tranche loss @ PCCL (honest risk on **fresh** ₹)

---

## Price zones block (required in Report)

Build **top-down from CMP** — same structure as Muthoot:

| Zone | Action |
|------|--------|
| Worst stress (at/below worst PCCL) | Core-problem re-check → **accelerate** |
| Base PCCL band | **Strong add** |
| Attractive DCA band | **Steady add** |
| Fair value band | **Normal SIP** |
| CMP zone | **Tier-appropriate token/steady** |
| Above stretch ceiling | **Minimal token only** — not full pause unless core problem |

---

## Dynamic context (Aug 2026 user view — refresh on news)

| Factor | Read | SIP implication |
|--------|------|-----------------|
| Market sideways ~2 years | FACT (user observation) | **Don’t wait for crash** — SIP through range |
| Earnings rising (portfolio names) | Verify per stock | Supports **quantity build** at tier pace |
| USA–Iran / Middle East | Escalating or cooling — **search latest** | Cooling → sentiment tailwind; **don’t time lump sum** |
| Nobody knows bottom/top | OUR ASSUMPTION | **Salary SIP > timing** |

Reassess tier when: quarterly results, CMP move ±15%, material news, geo shift.

---

## Required `suggested-approach.md` sections

Every Report stock (quality names in portfolio) should include:

1. **Philosophy** — Wealth = Q×T×quality; PCCL = protection  
2. **Dual-axis @ CMP** — **SIP tier (A)** + **Current value (B)** — explicit if they **diverge**  
3. **Valuation tier @ CMP** — tier 1–5 + Premium to PCCL + MoS vs IV  
4. **Current value @ CMP** — Low/Fair/Expensive/Very expensive + **P/E table** (normalized vs sector) + macro/sector band  
5. **Conflict resolution** — when A≠B, state **final pace** and **surplus rank**  
6. **Default action** — HOLD + tier pace  
7. **Blended avg protection** — ceiling + tables  
8. **Price zones & actions**  
9. **New-tranche risk @ PCCL**  
10. **Salary / surplus priority**  
11. **Triggers** — upgrade/downgrade **pace**  
12. **One-page decision card** — must show **both** axes  

Snippet: `StockBook/_templates/dual-axis-suggested-approach.md`

Template reports may start minimal — **expand to this structure** on next discussion.

---

## Agent language

| Avoid | Prefer |
|-------|--------|
| “Wait for PCCL before adding” | “PCCL ₹X is protection; **SIP at tier-N pace** @ CMP” |
| “Too expensive — no add” | “**Very expensive** tier — **minimal token** SIP; rank surplus to tier-4 names” |
| “Market will crash — stay in cash” | “Sideways market → **continuous SIP**; reserve 50% dry powder for dips” |
| “Fresh buyer should wait” (existing holder) | Dual lens: **existing holder SIPs with cap**; fresh **rank** sets surplus % |

---

## Cross-references

- Size caps: `premium-add-sizing.md`
- PCCL doctrine: `pccl-as-protection-not-target.md`
- Monthly surplus rank: `portfolio-analysis/dynamic-capital-allocation.md`
- Report persistence: `StockBook/AGENT-RULES.md`
- Exemplar: `StockBook/Banking and Finance/Muthoot Finance/suggested-approach.md`
