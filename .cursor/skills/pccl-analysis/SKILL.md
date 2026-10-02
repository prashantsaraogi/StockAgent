---
name: pccl-analysis
description: >-
  Calculate PCCL, four-scenario turnaround valuation, margin of safety,
  premium to PCCL, buying ladder, and ladder price metrics for Indian stocks.
  Use when deciding buy price, whether to average down, premium-tier scale-in
  for existing holders, or if current price offers adequate downside protection.
---

# PCCL Analysis Skill

## Category

**PCCL & ENTRY** — *separate discipline* from valuation.
PCCL, premium to PCCL, buying ladder, core-problem at PCCL.

See [SKILL-CATEGORIES.md](../SKILL-CATEGORIES.md).

## Purpose

Calculate and evaluate **PCCL** — the maximum price at which an
investment remains acceptable under a conservative/pessimistic but
realistic earnings scenario.

Implements `stock-agent.mdc` sections 9 (Core-Problem Test), 10 (PCCL),
and 11 (Margin of Safety).

---

## Definition

**PCCL** = Pessimistic Conservative Calculated Limit

The price where the stock is attractive **even under pessimistic**
assumptions. It is **not** a prediction of the exact bottom.

If price reaches PCCL → run **Core-Problem Test** before buying.

**PCCL is protection, not expected entry:** on Strong compounders, price
stays above PCCL in normal markets; long-term holders build wealth via
**scale-in above PCCL** with size caps. See `pccl-as-protection-not-target.md`.

If stock is down **≥15% from recent peak**, run **`price-decline-analysis`**
first — document why it fell before averaging (section 22).

---

## Framework Alignment

Classify inputs as FACT, OUR ASSUMPTION, or UNVERIFIED.

Never increase PCCL to justify an existing position or higher market price.

PCCL is **dynamic** — update when sustainable earnings or risk changes.

---

## When to Use

- Every buy/hold/add decision
- User asks "at what price should I buy?"
- User has **existing position** and asks to add at CMP above PCCL
- Averaging-down decision (only if thesis intact + price improves return)
- Full framework report (with `valuation-analysis`)

---

## Integration with Other Skills

| Skill | Link |
|-------|------|
| `valuation-analysis` | Shared pessimistic/normal/optimistic scenarios |
| `fundamental-analysis` | Normalized EPS input |
| `business-model-analysis` | Business quality adjusts multiple |
| `ipo-forensic-analysis` | Post-IPO stocks need lower PCCL until proven |
| `technical-analysis` | PCCL zone vs support levels |
| `portfolio-analysis` | PCCL column per holding |
| `price-decline-analysis` | Required before average after drawdown |

---

## Step 1 — Scenario Tables

Build when sufficient data exists.

### Standard (default — 3 scenarios)

| Scenario | Use |
|----------|-----|
| **Pessimistic** | Conservative growth, compressed margins, lower multiple — **PCCL input** |
| **Normal** | Normalized earnings, reasonable growth, fair multiple — **Conservative IV** |
| **Optimistic** | Stronger but plausible — not for primary buy decision |

### Turnaround (4 scenarios — earnings temporarily weak)

Use when latest results are depressed but business quality remains
high (e.g. pharma US pricing cycle, one bad quarter, cyclical trough):

| Scenario | Use |
|----------|-----|
| **Pessimistic** | Weakness persists longer; lower EPS and multiple |
| **Normal** | Normalised mid-cycle EPS |
| **Recovery** | Earnings recover toward historical range |
| **Strong recovery** | Full normalisation — illustrative upside only |

For turnaround names:

- PCCL may be set **below** normal fair value until recovery is evidenced
- Do **not** average aggressively after only one bad quarter
- **Raise PCCL dynamically** if next quarter confirms recovery

For each scenario: normalized EPS × appropriate P/E (or P/FCF).

---

## Step 2 — PCCL Calculation

```
PCCL = Pessimistic Normalized EPS × Conservative P/E (or sector-appropriate multiple)
```

Adjust multiple **down** for:

- High debt, weak governance, regulatory risk
- Cyclical peak earnings
- Post-IPO unproven earnings
- Core-problem uncertainty
- **Unresolved legal overhang** — use three-scenario liability bridge;
  see `legal-threat-analysis/legal-overhang-speculative-sizing.md`

Adjust multiple **up** ( modestly) for:

- Proven compounder, debt-free, high ROE
- Durable moat with numerical evidence

Do **not** use peak earnings to justify higher PCCL.

---

## Step 2b — Dual anchor: Rational + Conviction → Base (lower wins)

Two PCCL inputs; **use the lower for calculations** before loss floor.

| Name | Source |
|------|--------|
| **Rational_PCCL** | Model — Step 2 (pessimistic EPS × conservative multiple). *Alias: Stress PCCL.* |
| **Conviction_PCCL** | User — optional personal stress limit (read `faq.md`) |

```
Base_PCCL = min(Rational_PCCL, Conviction_PCCL)   if Conviction stated
          = Rational_PCCL                          otherwise
```

If Rational is a range, use the **low end** for `min()` unless report fixes a single point.

Detail: [pccl-dual-anchor.md](pccl-dual-anchor.md)

---

## Step 2c — Applied PCCL (loss-position floor)

**PCCL protects deployed capital.** Apply **after** Base_PCCL from Step 2b.

```
Applied_PCCL = CMP                    if existing holder AND CMP < avg cost
             = Base_PCCL              otherwise (fresh, flat, or gain on book)
```

Use **Applied PCCL** for:

- Premium to PCCL % and SIP tiers (Axis A)
- Size caps and comparative-rank parameter **A**
- "At / above / below PCCL" classification

Report **Rational**, **Conviction** (if any), **Base**, and **Applied** when they differ.

Detail: [pccl-loss-position-floor.md](pccl-loss-position-floor.md)

---

## Step 3 — Core-Problem Test (at or near PCCL)

Ask: **"Why is this stock cheap?"**

| Type | Examples |
|------|----------|
| **Temporary/Cyclical** | Market correction, sector rotation |
| **Structural/Core** | Governance failure, permanent moat loss, regulatory destruction, persistent cash deterioration |

**Do not buy at PCCL if a core problem remains unresolved.**

---

## Step 4 — Valuation Gap Metrics (Use Both — Do Not Mix)

### Margin of Safety (vs Conservative IV)

```
MoS % = (Conservative IV − Current Price) / Conservative IV × 100
```

Conservative IV = **normal-case** intrinsic value at a conservative
multiple (typically the Normal scenario value at conservative P/E).

Positive MoS = price below conservative fair value.

### Premium to PCCL (vs pessimistic buy limit)

Use **Applied PCCL** (Step 2b), not Stress PCCL alone:

```
Premium to PCCL % = (Current Price − Applied_PCCL) / Applied_PCCL × 100
```

Positive = price **above** Applied PCCL.

| Context | When Premium > 0 |
|---------|------------------|
| **No position / fresh capital** | Default: **wait** — compare vs other names' PCCL gaps |
| **Existing holder scaling winner** | **Size-capped add may be OK** if MoS vs IV ≥ 0%, quality Strong, catalyst ≥65% — see Step 5b |

Negative = price **below** PCCL → run core-problem test before buying.

**Reasonable P/E and attractive entry price are different things.**

Report both metrics at:

- Current market price
- Each buying-ladder price level (see Step 6)

Example ladder table:

| Price | Premium to PCCL | MoS vs Conservative IV | Action |
|------:|----------------:|-----------------------:|--------|
| CMP | | | |
| Tier 1 | | | |
| Tier 2 | | | |
| PCCL | 0% | | Core-problem test |

---

## Step 5 — Price vs PCCL Classification

| vs PCCL | Fresh capital | Existing holder (quality intact) |
|---------|---------------|----------------------------------|
| Comfortably below | Strong buy zone | Strong add zone |
| Near PCCL | Starter / accumulate | Normal add |
| Above PCCL | **Wait** — rank opportunity cost | **Tier A scale-in** — size cap per Step 5b; **cyclical/dividend:** Step 5c IoC overlay |
| Far above PCCL (>40%) | Wait | Token add, **or IoC-gated add** (Step 5c) for dividend cyclicals |

---

## Step 5c — Yield on Cost / Income on Capital (Cyclical & Dividend Names)

Use **before** PCCL blocks all adds when:

- User holds **far below CMP** (high legacy YoC)
- Stock is **cyclical** (OMC, PSU, utilities) or **mature dividend** payer
- User wants **quantity and total dividend ₹** to grow

See [yield-on-cost-overlay.md](yield-on-cost-overlay.md).

**Order of analysis:**

1. **Normalized YoC** on current avg cost (not yield on CMP)
2. **Blended YoC** after proposed add — must meet hurdle (default **≥ 8%** normalized)
3. **Total dividend income ₹** — absolute income change
4. **PCCL** — downside + **size cap**, not sole veto
5. Trailing peak dividend — report separately; **never size on peak alone**

**Rule:** PCCL protects **how much** to add above pessimistic floor; YoC decides
**whether** a limited add above PCCL is rational for income + cyclical recovery.

---

## Step 5b — Premium-Tier Scale-In (Existing Holder)

Use when user **has a position** (especially low-cost), CMP is **above PCCL**,
but near **Conservative IV** (MoS vs IV ≥ 0%).

See [premium-add-sizing.md](premium-add-sizing.md) for full template and
Bharti Airtel worked example.

**Requirements (all):**

1. Business quality **Strong** (or Moderate+ with clear moat)
2. **No** unresolved core problem
3. Catalyst probability **≥ 65%** if thesis depends on future event
4. MoS vs Conservative IV **≥ 0%** (not above normal fair value)
5. Apply **premium-to-PCCL size cap** on recommended add qty
6. Report **blended avg cost** and **new-tranche loss @ PCCL**

**Size cap (default):**

| Premium to PCCL | Max add vs existing shares |
|----------------:|---------------------------|
| 0–15% | +50–75% of qty |
| 15–25% | +25–35% |
| 25–40% | **+10–15%** |
| 40–55% | +5% or token |
| >55% | No add **unless Step 5c IoC overlay passes** (cyclical dividend only) |

For **Step 5c** cyclical dividend names with blended normalized YoC ≥ 8%,
use caps in `yield-on-cost-overlay.md` (allows +5–10% even when premium >45%).

**Not the same as averaging down** — user adds on **strength at fair value**,
not because price fell below their cost.

---

## Step 6 — Buying Ladder

### Fresh entry (no position)

Build bottom-up from PCCL. Preferred zone usually near/below PCCL or Tier 2.

| Zone | Typical action |
|------|----------------|
| Above Tier 1 | 🔴 Wait — don't chase |
| Tier 1 | 🟡 Small starter only if thesis intact |
| Tier 2 | 🟢 Start accumulating |
| Tier 3 (PCCL zone) | 🟢🟢 Good / strong entry — core-problem test |
| Deep PCCL | 🟢🟢🟢 Very attractive if thesis intact |

### Existing holder (scale winner)

Build **top-down from CMP** when premium to PCCL is high but MoS vs IV ≥ 0%:

| Tier | Zone | Action |
|------|------|--------|
| **Tier A** | CMP ± ~3% | 🟡 Size-capped add (Step 5b) |
| **Tier B** | −5% to −10% | 🟢 Add on confirmation |
| **Tier C** | 52W low / support | 🟢 Larger tranche |
| **PCCL zone** | At PCCL | 🟢🟢 Max add if core-problem pass |

State **preferred entry zone** for the user's situation (fresh vs existing).

Align with `technical-analysis` support levels when available.

---

## Step 7 — Averaging-Down vs Scale-In (Do Not Confuse)

### Averaging-down

Average **only** when:

1. Thesis remains intact, AND
2. Lower price **materially improves** expected return (MoS expanded)

Never average merely because price \< purchase price or stock fell.

If business structurally deteriorated → reassess/exit, don't average.

Run `price-decline-analysis` first if down ≥15% from peak.

### Scale-in (existing holder, above PCCL)

Adding at CMP **above PCCL** but at **fair value** when scaling a winner —
**not** averaging down. Requires Step 5b size caps and blended-cost disclosure.

---

## Dynamic PCCL — When to Revise

**Raise PCCL:** Sustainable earnings power proven higher, moat strengthened,
core risk reduced (with evidence).

**Lower PCCL:** Earnings downgrade, governance issue, regulatory hit,
moat erosion, debt increase.

---

## Required Output

### Current Price
Date checked.

### Scenario Table
Standard (3) or Turnaround (4) — EPS, multiple, implied value per scenario.

### PCCL
Central PCCL, PCCL range, formula, why PCCL may be below normal IV.

### Conservative Intrinsic Value
Normal-case value for MoS calculation.

### Valuation Gap Metrics
MoS vs Conservative IV **and** Premium to PCCL at CMP.

### Ladder Metrics Table
Premium to PCCL and MoS at each buying-ladder price.

### Core-Problem Test
Pass / Fail / Investigate — temporary vs structural for turnarounds.

### Price vs PCCL
Comfortably below / Near / Above.

### Buying Ladder
Price zones, actions, preferred entry zone.

### Dynamic PCCL Triggers
What quarterly evidence would raise or lower PCCL.

### Averaging-Down Guidance
If user has position at higher cost.

### Premium-Tier Scale-In (if existing holder + above PCCL)
Size cap, blended avg, new-tranche loss @ PCCL, reserve dry powder.

### Evidence & Assumptions

### Limitations

---

## Important Rules

Never increase PCCL because the market price rose.

A low price with a core problem is **not** a bargain.

Separate wonderful business from wonderful **price**.

When user holds at low cost and asks to add at premium: apply **dual lens**
(fresh vs existing) — see `premium-add-sizing.md`.

---

## Additional Resources

- PCCL as protection (not buy target): [pccl-as-protection-not-target.md](pccl-as-protection-not-target.md)
- Continuous SIP tiers: [continuous-sip-valuation-tiers.md](continuous-sip-valuation-tiers.md)
- Premium scale-in sizing and Bharti Airtel example: [premium-add-sizing.md](premium-add-sizing.md)
- Yield on cost / IoC overlay (OMC, PSU, cyclical dividend): [yield-on-cost-overlay.md](yield-on-cost-overlay.md)
- Loss-position floor: [pccl-loss-position-floor.md](pccl-loss-position-floor.md)
- Dual anchor (Rational + Conviction): [pccl-dual-anchor.md](pccl-dual-anchor.md)
