---
name: portfolio-analysis
description: >-
  Analyze Indian stock portfolio holdings — P&L, allocation, cost basis,
  PCCL gap, and framework-aligned HOLD/ADD/EXIT actions. Use when the
  user provides quantities and average costs for one or more positions.
  Always read .cursor/portfolio/holdings.md first when analyzing the user's
  portfolio; update that file when trades or cost corrections are confirmed.
---

# Portfolio Analysis Skill

## Category

**PORTFOLIO & CAPITAL ALLOCATION** — holdings, P&L, HOLD/ADD/EXIT (long-term mandate).

See [SKILL-CATEGORIES.md](../SKILL-CATEGORIES.md).

## Purpose

Analyze holdings: position-level P&L, allocation, concentration,
and **framework-aligned actions** (HOLD / ADD / PAUSE ADDS / EXIT).
See **`long-term-investor-mandate.md`** — no trim/sell except existential threat.

Implements `stock-agent.mdc` sections 13 (Capital Allocation), 14
(Portfolio Reality Check), and 15 (Monitoring).

Never defend a holding because of purchase price alone.

---

## Step 0 — Read portfolio record

Before any portfolio analysis:

1. Read **[`.cursor/portfolio/holdings.md`](../../portfolio/holdings.md)** (master holdings)
2. If **`StockBook/[Sector]/[Stock Name]/`** exists for the ticker — read per **[`StockBook/AGENT-RULES.md`](../../StockBook/AGENT-RULES.md)** including **`PARAMETERS_[TICKER].md`** when present
3. Read **`long-term-investor-mandate.md`** — default: **no TRIM/SELL/REPLACE** unless existential threat
4. Read **`investor-wisdom/personal-discipline.md`** + run **`investor-wisdom/buy-decision-workflow.md`** when user asks buy/add
5. For allocation / surplus deployment, read **[`quadrant-map.md`](../../portfolio/quadrant-map.md)**; refresh when user trades or asks
6. Use recorded qty, lots, and blended avg — **never invent**
7. Fetch **live CMP** on analysis date
8. After user **confirms** a buy/sell/correction → update `holdings.md` + change log
9. **After any stock-specific add/hold/PCCL discussion** → update that stock's **Report** files
   (minimum: `faq.md` + verdict in `summary-analysis.md` + HTML). See `StockBook/AGENT-RULES.md`.

For **dividend / cyclical / income** holdings: report **YoC on avg cost (deployed
capital)** — **never primary dividend yield on CMP**. Mandatory **8% blended YoC
add gate** — see `pccl-analysis/yield-on-cost-overlay.md`. Report dividend ₹ on
cost basis and probability of ≥ 8% YoC.

If `holdings.md` conflicts with user message → **user message wins**; update file.

---

## Framework Alignment

Use user-provided qty and avg cost — **never invent** portfolio data.

Classify recommendations as based on FACT (prices, qty) and ASSUMPTION
(PCCL, IV from other skills).

State date checked for current prices.

---

## When to Use

- User provides holdings (ticker, qty, avg cost)
- Portfolio review or rebalancing question
- "Should I hold or sell my X shares?"
- Allocation and concentration check

For full thesis per stock, combine with `stock-analysis` and sub-skills.

---

## Integration with Other Skills

| Skill | Link |
|-------|------|
| `pccl-analysis` | PCCL and buying ladder per holding |
| `valuation-analysis` | MoS and fair value per holding |
| `risk-analysis` | Portfolio concentration and correlation |
| `stock-analysis` | Full per-stock report when needed |

---

## Step 1 — Required Data Per Position

| Field | Required |
|-------|----------|
| Ticker | Yes |
| Quantity | Yes |
| Average cost | Yes |
| Current price | Fetch or user-provided |
| Purchase date | Optional |
| PCCL / IV | From `pccl-analysis` if analyzed |

Validate: missing tickers, invalid qty/prices, duplicates, currency.

---

## Step 2 — Position Calculations

```
Cost Basis     = Quantity × Avg Cost
Current Value  = Quantity × Current Price
Unrealized P&L = Current Value − Cost Basis
Return %       = (P&L / Cost Basis) × 100
Allocation %   = Position Value / Total Portfolio Value × 100
```

---

## Step 3 — Portfolio Totals

- Total cost basis
- Total value
- Total unrealized P&L
- Portfolio return %
- Largest / smallest positions

Sector/geography allocation only when reliable data exists.

---

## Step 4 — Portfolio Reality Check (Per Large Holding)

Ask for each significant position:

| Question | Source |
|----------|--------|
| Is capital productive? | Return % vs opportunity cost |
| Is EPS growing? | `fundamental-analysis` |
| ROCE/ROE healthy? | `fundamental-analysis` |
| Cash flow converting? | `fundamental-analysis` |
| Thesis still valid? | `business-model-analysis` |
| Price vs PCCL? | `pccl-analysis` |
| Margin of safety? | `valuation-analysis` |

**Purchase price is not a reason to hold.**

---

## Step 5 — Position Action Framework

**Long-term investor default:** HOLD legacy positions; rank **fresh/salary capital** only.
Read **`long-term-investor-mandate.md`** before any TRIM/SELL suggestion.

| Action | When |
|--------|------|
| **HOLD** | Thesis intact — **default** for existing holdings |
| **ADD (PCCL zone)** | Thesis intact + price near/below PCCL or deep ladder tier |
| **ADD (premium tier)** | Existing holder + Strong quality + MoS vs IV ≥ 0% + size cap per `pccl-analysis/premium-add-sizing.md` |
| **PAUSE ADDS** | Overweight or expensive — slow/stop **new** tranches; **not sell** |
| **EXIT** | **Existential only:** structural moat loss, accounting fraud, permanent legal destruction, persistent broken model — see mandate |
| **WAIT** | No position; price above PCCL and better alternatives exist |

**Do not suggest TRIM / REDUCE / REPLACE / ROTATE** for valuation, profit-booking,
rebalancing, or "prefer stock B over A" unless user **explicitly asks** for rebalancing
or Tier-1 exit criteria in `long-term-investor-mandate.md` are met.

Never **ADD** merely to lower average cost.

**Exclusion guards:** if holding triggers penny / heavy debt / persistent loss
screen → **EXIT review** (if structural) — **never ADD**; see `stock-analysis/exclusion-guards.md`.
Do **not** auto-suggest trim on legacy positions that still pass business-quality test.

Never say **"wait for PCCL forever"** to an existing low-cost holder without
running the **dual lens** (Step 5b) and premium size-cap table.

---

## Step 5a — Comparative Capital Allocation (Fresh Capital)

When user asks which stock to buy **today** among candidates:

1. Use `stock-analysis/comparative-scorecard.md`
2. Rank by **Premium to PCCL**, **MoS**, and **risk/reward** — not quality alone
3. Prefer candidate with larger gap between pessimism and reasonable recovery
4. State: **better company ≠ better fresh entry at current price**

Deploy new capital to the best **risk-adjusted opportunity**, not the
largest existing position or the highest-quality name at full valuation.

**Never recommend selling holding A to buy holding B** — rank B for surplus only.

**Dynamic allocation:** Surplus ₹ flows by **relative potential today** — within sector
(HDFC > PNB) and across sectors (hospitals vs banks). Re-rank when news/ground
reality shifts. Read **`dynamic-capital-allocation.md`** and run latest news scan
via `dynamic-context-analysis` before confirming monthly surplus split.

---

## Step 5e — Dynamic potential-weighted allocation (surplus)

When user asks **where to deploy salary/surplus**, **sector priority**, or
**peer comparison for capital** (e.g. HDFC vs PNB, hospitals vs banks):

1. Read **`dynamic-capital-allocation.md`**
2. Run **`dynamic-context-analysis`** — latest news (oil, tariffs, RBI, geo) + sector KPIs
3. Assign **sector potential band** (High / Medium / Low / Pause)
4. Rank **within sector** then **cross-sector surplus %**
5. Output **what would flip the rank** in next 30 days
6. Update **`quadrant-map.md`** surplus table if bands changed materially

**Not frozen:** last month's 25% to Max may become 15% if hospital KPIs weaken —
state old vs new % and evidence.

---

When user **has qty + avg cost** and asks to add at CMP **above PCCL**:

1. Run **dual lens** from `pccl-analysis/premium-add-sizing.md`
2. Calculate **blended average** after proposed add
3. Quantify **new-tranche loss @ PCCL** (not only legacy P&L cushion)
4. Recommend **max add qty** from premium-to-PCCL size cap table
5. State **dry powder %** reserved for lower ladder tiers
6. Compare **opportunity cost** if user has cash limited to one name

```
Blended Avg = (Qty × Avg + Qty_add × Price_add) / (Qty + Qty_add)
New-tranche loss @ PCCL = (PCCL − Price_add) / Price_add × (Qty_add × Price_add)
```

Distinguish explicitly:

| Type | Trigger | Rule |
|------|---------|------|
| **Scale-in** | Add at fair value on winner | Size cap; MoS vs IV ≥ 0% |
| **Average-down** | Add after price fall | MoS must expand; price-decline if ≥15% |
| **Systematic accumulation** | Salary / monthly surplus | Pace by PCCL + IV; **not** momentum upward averaging — see Step 5c |

---

## Step 5c — Salary / Systematic Accumulation (Building Quantity)

When user says they **cannot bulk buy**, capital comes from **salary**,
or asks about **upward averaging** on a performing stock:

1. Read **`salary-systematic-accumulation.md`**
2. Separate **systematic DCA** from **premium-tier lump add** and from **momentum chasing**
3. Output a **12–24 month conditional plan**: monthly share/₹ tranche, pause ceiling, accelerate floor, target qty
4. Run **governance era split** if user cites long past management problems
5. Check **concentration** on projected qty, not only today's weight

**Wealth rule:** quantity at acceptable average over time — not one expensive lump because the chart is green.

---

## Step 5d — Legal overhang holdings (good ops + unresolved law)

When proceeding register shows **material unresolved** tax/court/licence risk:

1. Read **`legal-threat-analysis/legal-overhang-speculative-sizing.md`**
2. Run solvency stress test (worst demand / net cash and / net worth)
3. **Override** premium-add and salary-DCA tables — cap at **≤2%** (high-risk) or **0%** (existential)
4. Report three-scenario PCCL + max weight + pre-order action plan
5. **Never** recommend averaging because operations still profitable

Template register: `legal-threat-analysis/legal-proceedings-checklist.md` (Delta Corp example).

---

## Step 6 — Concentration Flags

Flag when single stock or sector is unusually large.

Default threshold: flag if **>15–20%** in one stock unless user
defines otherwise.

**For long-term investor:** flag → **pause new adds** on that name;
**do not suggest TRIM/SELL** unless existential exit criteria apply.

Correlated holdings = hidden concentration (`risk-analysis`).

---

## Step 7 — Portfolio Template Row

For each holding output:

| Stock | Qty | Avg Cost | CMP | PCCL | Weight | MoS | Action |
|-------|-----|----------|-----|------|--------|-----|--------|

Plus: next buying level, quarterly trigger.

---

## Required Output

### Portfolio Summary
Total value, cost, P&L, return %.

### Position Table
Ticker | Qty | Avg | CMP | Value | P&L | Return % | Weight %

### Per-Position Framework View
PCCL gap, MoS, thesis status, recommended action.
If add recommended: **premium tier** vs **PCCL zone**; blended avg; new-tranche risk @ PCCL.

### Allocation & Concentration
Largest exposures; sector if known.

### Best / Worst Performers

### Risk Observations
Concentration, correlation.

### Capital Allocation Notes
Where new capital should go per framework ranking.

### Key Observations

### Data Limitations

---

## Important Rules

Informational only — no guaranteed returns.

Never fabricate prices, quantities, or weights.

Unrealized gain is not a reason to hold if valuation is extreme and
thesis weakening.

Compare opportunity cost vs best available candidates.

When user challenges "wait for PCCL" on a held winner: apply Step 5b and
`pccl-analysis/premium-add-sizing.md` before answering.

---

## Additional Resources

- Premium scale-in for existing holders: `pccl-analysis/premium-add-sizing.md`
- Salary / monthly accumulation: `portfolio-analysis/salary-systematic-accumulation.md`
- **Dynamic potential-weighted allocation:** `portfolio-analysis/dynamic-capital-allocation.md`
- Legal overhang speculative sizing: `legal-threat-analysis/legal-overhang-speculative-sizing.md`
