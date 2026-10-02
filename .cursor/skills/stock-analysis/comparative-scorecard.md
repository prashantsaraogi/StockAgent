# Comparative Scorecard Template

Use when comparing **two or more** Indian stocks for fresh capital
allocation. Follow `stock-agent.mdc` section 17.

State **date checked** and **CMP** for each name.

**Before comparing:** run [exclusion-guards.md](exclusion-guards.md) on each name.
**Exclude** hard-trigger names from fresh-entry rank (mark **Excluded — AVOID**).

## Step 1 — Key Difference (One Paragraph Each)

For each stock, explain in plain language:

- Business quality today
- Earnings trajectory (strong / weak / recovering)
- What the market is already pricing in
- Why risk/reward may differ **at current prices**

Separate: **better company** vs **better investment today**.

---

## Step 2 — Scenario Valuation (Per Stock)

### Standard (3 scenarios)

| Scenario | Normalised EPS | Multiple | Value |
|----------|---------------:|---------:|------:|
| Pessimistic | | | |
| Normal | | | |
| Optimistic | | | |

### Turnaround (4 scenarios — when earnings temporarily depressed)

| Scenario | Normalised EPS | Multiple | Value |
|----------|---------------:|---------:|------:|
| Pessimistic | | | |
| Normal | | | |
| Recovery | | | |
| Strong recovery | | | |

PCCL = pessimistic case (may be **below** normal fair value if
weakness may not be fully temporary).

State **central PCCL** and **PCCL range**.

---

## Step 3 — Valuation at Current Price (Per Stock)

| Metric | Formula |
|--------|---------|
| **MoS vs Conservative IV** | `(Conservative IV − Price) / Conservative IV` |
| **Premium to PCCL** | `(Price − PCCL) / PCCL` |

Conservative IV = normal-case value at conservative multiple.

---

## Step 4 — Premium / MoS at Ladder Prices

For each stock, table at key ladder levels:

| Price | Premium to PCCL | MoS vs Conservative IV | Action |
|------:|----------------:|-----------------------:|--------|
| CMP | | | |
| Tier 1 | | | |
| Tier 2 | | | |
| Tier 3 (PCCL zone) | | | |
| Deep PCCL | | | |

---

## Step 5 — Buying Ladder (Per Stock)

| Price zone | Action |
|------------|--------|
| Above Tier 1 | Wait / don't chase |
| Tier 1 | Small starter only |
| Tier 2 | Start accumulating |
| Tier 3 (PCCL zone) | Good zone — core-problem test first |
| Deep PCCL | Very attractive if thesis intact |
| Below deep PCCL | Investigate why — core-problem test |

Note **preferred initial entry zone** for each name.

---

## Step 6 — Core Problem / Turnaround (If Applicable)

For depressed-earnings names:

| Question | Temporary | Structural |
|----------|-----------|------------|
| Cause of weakness | | |
| Evidence | | |
| Impact on PCCL | Raise if recovery confirms | Lower PCCL |

Do **not** average aggressively after only one bad quarter.

Assign **catalyst probability** for recovery (see `valuation-analysis`).

For AI, disruption, or new competition, run `structural-threat-analysis`
and compare **crisis vs permanent structural change** — not every
headline is a forever threat.

For **live macro and ground context** (RBI, MSCI/Nifty, geopolitical,
monthly industry data), run `dynamic-context-analysis` and connect dots
to each name before ranking fresh entry.

For **legal / court / tax overhang**, run `legal-threat-analysis` —
search latest news and exchange filings; verify hearing dates.

---

## Step 7 — Final Scorecard

| | Stock A | Stock B | Stock C |
|--|---------|---------|---------|
| Business quality (/10) | | | |
| Growth (/10) | | | |
| Balance sheet (/10) | | | |
| Management (/10) | | | |
| Current earnings | 🟢/🟡/🔴 | | |
| Valuation opportunity | 🟢/🟡/🔴 | | |
| Central PCCL | | | |
| Current price | | | |
| Premium to PCCL | | | |
| MoS vs Conservative IV | | | |
| Core-problem status | Pass/Investigate/Fail | | |
| Structural threat | Crisis/Transitional/Permanent | | |
| Legal overhang | 🟢/🟡/🔴/⛔ (Low → Existential) | | |
| Dynamic context | 🟢/🟡/🔴 (ground + policy + geo) | | |
| **Fresh-entry preference** | 🥇/🥈/🥉/Wait | | |

---

## Step 8 — Fresh-Entry Decision

State explicitly:

1. **Which stock gets new capital today** (if any) — and why
2. **Which is the better company** — and why that may not matter at CMP
3. **Within-sector ratio** if peers compared (e.g. ICICI 70% / HDFC 30% of bank slice)
4. **Cross-sector surplus %** if portfolio deployment asked — per `portfolio-analysis/dynamic-capital-allocation.md`
5. **Potential band** per name: High / Medium / Low / Pause — and **what news would flip it**
6. **Not a sell recommendation** for lower-ranked existing holdings
7. **Watchlist prices** for each name
8. **Dynamic PCCL triggers** — what quarterly evidence would raise/lower PCCL

---

## Rating Guide

| Valuation opportunity | Meaning |
|--------------------|---------|
| 🟢 | Meaningful MoS or near/below PCCL; favourable risk/reward |
| 🟡 | Fair value; small starter at best |
| 🔴 | Above PCCL; don't chase with fresh capital |

| Current earnings | Meaning |
|------------------|---------|
| 🟢 | Strong and growing |
| 🟡 | Stable / mixed |
| 🔴 | Weak or deteriorating — turnaround thesis required |

| Dynamic context | Meaning |
|-----------------|---------|
| 🟢 | Ground reality improving; policy/geo tailwind or stable |
| 🟡 | Mixed monthly data; macro headwind manageable |
| 🔴 | Weak ground reality + adverse policy/geo — wait for clarity |

| Legal overhang | Meaning |
|----------------|---------|
| 🟢 | No material proceedings / resolved favourably |
| 🟡 | Pending dispute; quantifiable; stays in place |
| 🔴 | Large demand vs cash; binary court ahead |
| ⛔ | Existential — ban, licence loss, unpayable liability |
