---
name: dynamic-context-analysis
description: >-
  Dynamic ground-reality, policy/index, and geopolitical context for
  Indian stocks — monthly industry KPIs (e.g. auto SIAM sales), RBI/MSCI/
  Nifty 50 events, and geopolitical risk with latest news. Use when the
  user asks for ground reality, monthly sales, industry pulse, RBI policy,
  index rebalancing, MSCI, or geopolitical impact on markets.
---

# Dynamic Context Analysis Skill

## Category

**RISK ANALYSIS** — live context: monthly ground reality, RBI/MSCI/Nifty, geopolitical.

See [SKILL-CATEGORIES.md](../SKILL-CATEGORIES.md).

## Purpose

Connect **latest real-world signals** to investment decisions — not
only quarterly filings.

Implements `stock-agent.mdc` section 20 (Dynamic Context & Ground Reality).

This skill answers:

> **What is happening on the ground and in the world *right now*,
> and how does it change risk/reward today vs tomorrow?**

Quarterly results lag reality. Monthly industry data, policy
announcements, index events, and geopolitical shifts can move stocks
**before** the next earnings print.

---

## Core Philosophy

**Context is dynamic — update when news changes.**

| Yesterday | Today | Framework response |
|-----------|-------|-------------------|
| Geopolitical tension high | Deal / ceasefire announced | Re-rate risk down; don't freeze thesis |
| Weak monthly sales trend | Two strong months in a row | Early recovery signal — verify vs seasonality |
| RBI hawkish | RBI cuts / liquidity injection | Reassess rate-sensitive names |
| MSCI exclusion feared | Final index unchanged | Relief rally — was headline risk |

Do not:

- Treat one monthly print as permanent trend
- Freeze geopolitical risk at today's headline
- Ignore policy/index events because "market already knows"

Do:

- State **date checked** and **source** for every live data point
- Connect dots: ground reality → sector → company → PCCL/thesis
- Define **what news would change** the current assessment

---

## Three Modules

| Module | What it tracks | Update frequency |
|--------|----------------|------------------|
| **A. Ground Reality** | Monthly industry & company KPIs | Monthly (or weekly for high-vol sectors) |
| **B. Policy & Index Events** | RBI, SEBI, MSCI, Nifty 50, budget | Event-driven |
| **C. Geopolitical Risk** | Wars, sanctions, oil, trade, FX | Daily when active; reassess on headlines |
| **D. News archive** | Dated macro + **portfolio-only** impact summaries | Daily when material; read `News/` first |
| **E. Sector orientation & challenges** | Future business direction + headwinds from **breadth of news** | Before ADD / Axis B / surplus rank |

Run **Module A** for sector/stock deep-dives (e.g. Hero MotoCorp + auto).
Run **B** when user mentions RBI, rates, MSCI, index rebalancing, FII flows.
Run **C** when user mentions Iran, US, China, oil, war, sanctions, or
global risk-off.
Run **D** — read **`News/YYYY-MM/YYYY-MM-DD/summary.md`** (latest ≤ analysis date)
and [`News/TICKER-INDEX.md`](../../News/TICKER-INDEX.md) before stock analysis;
**write back** to News when live search finds material headlines.
Run **E** — **mandatory before ADD, surplus #1, or Axis B "Fair"** when sector
has policy debate, user challenges P/E, or forward vs trailing diverge.
Read **`investor-wisdom/sector-news-orientation-lens.md`** — minimum news depth:
TICKER-INDEX + latest 3 News summaries + live search + peer results.
Output **Sector Orientation Brief** table; haircut forward EPS if L2+ risk.
When **creating/updating** daily News, follow **[`News/SEARCH-WORKFLOW.md`](../../News/SEARCH-WORKFLOW.md)** — full **IST calendar day** (00:01–23:59), **post-close** bucket, and **stock-wise loop** (search **each holding by company name** on all four outlets; gap-check vs macro pass — sector “green/red” is **not** a stock row).

For full stock analysis, run all applicable modules and **connect dots**
in the final synthesis. **Module E before** declaring forward valuation Fair
or ranking surplus #1.

---

## Module E — Sector Orientation & Challenges

Implements `investor-wisdom/sector-news-orientation-lens.md`.

### Purpose

Forward P/E and Axis B **cannot** be the primary buy lens until the agent
synthesises **where the business is going** and **what can block it** from
**breadth of sector news** — not one headline, not management guidance alone.

### Workflow

1. **Read news depth minimum** — TICKER-INDEX, latest 3 `News/` summaries,
   sector comparative rank, external-negative-risk
2. **Live search** — policy, peer results, brokerage, regulatory filings
3. **Build orientation brief** — tailwinds, headwinds, company transmission
4. **Classify each challenge** — temporary / partial structural / structural
5. **Earnings proof check** — does PAT/cash confirm EBITDA growth story?
6. **Haircut forward EPS** if L2 external risk (document %)
7. **Primary fair** — normalized trailing EPS × conviction P/E (if stated)
8. **Subordinate Axis B** — forward fair only after steps 1–7

### Required output (Sector Orientation Brief)

| Row | Content |
|-----|---------|
| Future business orientation | Capacity, geography, mix, capex — FACT vs MGMT CLAIM |
| Sector tailwinds | Dated evidence |
| Sector headwinds | Policy, competition, cost — temp vs structural |
| Company transmission | This name vs peers |
| Earnings proof | Yes / Partial / No |
| Policy catalyst prob | If material |
| Forward EPS haircut | If L2+ |
| Primary fair (trailing × conviction) | ₹ |
| Axis B (subordinate) | Fair / Expensive |
| Surplus rank implication | Upgrade / hold / downgrade |

### When forward P/E is invalid as primary trigger

- Trailing P/E above user conviction cap at CMP
- Active L2 policy risk unresolved (e.g. hospital room-rent cap)
- PAT lag vs EBITDA unproven 2+ quarters
- Step 4.5 / Module E not completed

Persist brief to `detail-analysis.md` when verdict or rank changes.

## Framework Alignment

Classify every item:

- **FACT** — published SIAM data, RBI press release, MSCI announcement
- **MANAGEMENT CLAIM** — company commentary on monthly trends
- **HYPOTHESIS** — inferred impact path
- **OUR ASSUMPTION** — probability or timeline estimate
- **UNVERIFIED** — unconfirmed news, social media, rumour

**Always search for latest news** on the analysis date. State:

- Date checked
- Source (primary preferred)
- Whether situation is **escalating / stable / de-escalating**

Never invent monthly sales figures, RBI decisions, MSCI weights, or
geopolitical outcomes.

---

## When to Use

- User asks for **ground reality** or **industry pulse**
- Auto, two-wheeler, FMCG, cement, steel, aviation — monthly volume matters
- **Hero MotoCorp**, Maruti, Tata Motors — monthly sales vs quarterly lag
- **RBI** policy, rate cycle, liquidity, CRR/SLR, FX intervention
- **MSCI** inclusion/exclusion, index rebalancing, passive flow impact
- **Nifty 50 / Sensex** restructuring, Adhoc index changes
- **Geopolitical** — Iran-US, Middle East, Russia-Ukraine, China-Taiwan,
  oil spike, shipping routes, sanctions
- User says "connect the dots" or "what's the latest news impact"
- Before ADD/TRIM when macro/sector context may have shifted since last review

---

## Integration with Other Skills

| Skill | Link |
|-------|------|
| `business-model-analysis` | Ground reality validates revenue engine |
| `fundamental-analysis` | Monthly trends lead quarterly earnings |
| `valuation-analysis` | Policy/geo can change earnings multiple assumptions |
| `pccl-analysis` | Sustained ground weakness → lower PCCL; relief events → reassess |
| `structural-threat-analysis` | Permanent vs temporary — geo often temporary; policy can be structural |
| `risk-analysis` | Geo/policy as non-price risk overlay |
| `stock-analysis` | Synthesis section — connect all modules to decision |

---

## Module A — Ground Reality Analysis

### Why monthly (not only quarterly)

Quarterly results aggregate 3 months and are reported **weeks after
quarter-end**. Monthly data shows:

- Demand inflection early (auto, FMCG, housing)
- Inventory/channel stress before it hits margins
- Seasonality vs structural slowdown
- Market share shifts between peers

### Workflow

1. **Identify sector KPIs** — see [sector-monthly-kpis.md](sector-monthly-kpis.md)
2. **Fetch latest month** + prior 3–6 months for trend
3. **Compare YoY and MoM** — adjust for seasonality (festive, monsoon)
4. **Peer comparison** — company vs industry (e.g. Hero vs industry 2W)
5. **Connect to company** — volume → revenue → margin → thesis
6. **Flag divergence** — company outperforming/underperforming industry

### Example: Auto / Two-Wheeler (Hero MotoCorp)

| Check | Source (typical) |
|-------|------------------|
| Industry 2W sales (monthly) | SIAM press release |
| Hero domestic dispatches (monthly) | Company / exchange release |
| Hero export trend | Company release |
| EV vs ICE mix (if disclosed) | Company / industry |
| Dealer inventory commentary | Concall / channel checks — label claim |
| Festive / monsoon seasonality | Historical pattern |

**Ground reality verdict:** Improving / Stable / Weakening — with evidence.

### Red flags (ground reality)

- 3+ consecutive months industry decline YoY without one-off explanation
- Company losing share 3+ months while claiming "strong brand"
- Monthly improvement but inventory build (channel stuffing risk)
- Price cuts industry-wide — margin pressure ahead

### Green flags

- Industry + company both accelerating 2–3 months
- Company gaining share in weak industry (share gain FACT)
- Premium/mix improving in monthly dispatch commentary

---

## Module B — Policy & Index Event Analysis

### Categories

| Category | Examples | Typical impact |
|----------|----------|----------------|
| **Monetary policy** | RBI repo, stance, liquidity, FX | Banks, NBFCs, rate-sensitive consumption |
| **Fiscal / budget** | Capex, customs duty, PLI | Infra, auto, electronics, defence |
| **Regulator (SEBI/RBI/IRDAI)** | Margin rules, disclosure, product norms | Sector-specific |
| **Index events** | MSCI EM rebalancing, FTSE, Nifty 50 inclusion/exclusion | Passive flows, FII, liquidity |
| **Government sector policy** | EV subsidies, ethanol blending, mining auctions | Thematic winners/losers |

### Workflow

1. **Identify relevant policy/index event** for the stock or sector
2. **Search latest official source** — RBI press release, MSCI notice,
   NSE index methodology, gazette notification
3. **Classify timing:** Announced / Effective date / Already priced in?
4. **Map transmission:** Policy → sector KPI → company earnings → valuation
5. **Flow impact (index):** Estimated passive buy/sell, free-float change
6. **Dynamic update:** What future announcement would change the view?

See [policy-index-events.md](policy-index-events.md) for checklists.

### RBI quick framework

| RBI action | Who benefits | Who hurts |
|------------|--------------|-----------|
| Rate cut / dovish | Banks (NIM lag), autos, real estate, consumption | None immediate — watch inflation |
| Rate hike / hawkish | None broad — defensive | Leveraged consumers, NBFCs, capex |
| Liquidity injection | Banks, bond-sensitive | — |
| FX defence (USD sell) | Importers short-term | IT exporters (INR strength) |

Label rate path as FACT only after MPC statement.

### Index rebalancing (MSCI / Nifty 50)

| Question | Why it matters |
|----------|----------------|
| Inclusion or exclusion? | Passive flow direction |
| Effective date | Front-running vs post-event |
| Free-float / weight change | Magnitude of flow |
| FII ownership already high? | Less incremental impact |
| Stock in multiple indices? | Combined flow effect |

**Do not assume** inclusion = buy forever. Often partially priced pre-event.

---

## Module C — Geopolitical Risk Analysis

### Core rule

**Geopolitical risk is the most dynamic module.** Today's high risk can
fall tomorrow if talks progress — and reverse equally fast.

Always report:

1. **Current status** (FACT from credible news/agency)
2. **Direction** — Escalating / Stable / De-escalating
3. **India transmission channels** — oil, INR, FII flows, defence, imports
4. **Scenario tree** — not single forecast

### Transmission channels to Indian equities

| Channel | Sectors most exposed |
|---------|---------------------|
| **Crude oil spike** | OMCs, airlines, paints, tyres, logistics — margin squeeze |
| **INR depreciation** | Importers hurt; IT/pharma exporters benefit (lagged) |
| **FII risk-off** | High-beta, small/mid, new-age — sell first |
| **Defence / geopolitical premium** | Defence, shipbuilding — thematic bid |
| **Supply chain disruption** | Auto components, electronics, specialty chemicals |
| **Safe haven** | Gold, sometimes FMCG defensives |

### Scenario template (e.g. Iran–US tension)

| Scenario | Probability band | Market impact | Duration |
|----------|------------------|---------------|----------|
| Escalation (strike, closure of strait) | Assign if evidence | Oil spike, risk-off, INR weak | Days–weeks |
| Status quo (rhetoric, no action) | | Elevated volatility, mean reversion | Ongoing |
| De-escalation (deal, talks, ceasefire) | | Risk premium compresses, oil eases | Quick re-rating |

Use catalyst probability bands from `stock-agent.mdc` section 12 where
investment action depends on outcome — but **update probabilities when
headlines change**.

### Dynamic update triggers

Re-run Module C when:

- New official statement (US, Iran, UN, OPEC+)
- Oil moves >5% in a session on geo headlines
- INR moves sharply with no domestic catalyst
- VIX India spikes with global correlation

State explicitly: **"As of [date], assessment is X; would change if Y."**

---

## Step — Connect the Dots (Synthesis)

Mandatory final section for any dynamic context report:

```
Ground reality (A)     →  [trend verdict]
Policy / index (B)     →  [event + impact]
Geopolitical (C)       →  [status + direction]
         ↓
Sector impact          →  [which KPIs affected]
         ↓
Company impact         →  [specific to ticker if given]
         ↓
Thesis / PCCL impact   →  [hold / wait / lower PCCL / opportunistic]
         ↓
What would change view →  [explicit triggers + next dates]
```

Example chain (illustrative structure only — use live data):

> SIAM 2W sales weak 3 months (A) + RBI hold with hawkish tone (B) +
> Middle East tension escalating (C) → auto consumption headwind +
> financing cost sticky + oil/inflation fear → Hero: wait for monthly
> inflection before adding; PCCL unchanged until volume stabilises.
> **View changes if:** 2W industry positive 2 consecutive months OR
> geo de-escalation + oil −10% OR festive dispatch beat.

---

## Required Output

### Context Snapshot (as of date)

One-line market/sector mood.

### Module A — Ground Reality (if applicable)

Latest monthly KPIs, trend, peer comparison, verdict.

### Module B — Policy & Index (if applicable)

Event, source, effective date, sector/company impact, flow impact.

### Module C — Geopolitical (if applicable)

Status, direction, scenarios, India transmission, oil/INR/FII note.

### Connect-the-Dots Synthesis

Sector → company → thesis/PCCL implication.

### Dynamic Triggers

What news or data in the **next 1–4 weeks** would upgrade or downgrade view.

### Capital Allocation Implication

WAIT / HOLD / STAGED ADD / TRIM — tied to context, not price alone.

**Surplus re-rank:** If context changes sector or peer potential, output
updated **monthly surplus %** per `portfolio-analysis/dynamic-capital-allocation.md`
(old rank → new rank → evidence). Applies to **new ₹ only**.

### Key Observations

### Evidence & Assumptions

### Limitations

What could not be verified; lag in data.

---

## Important Rules

Never:

- Use quarterly data alone when monthly sector data exists and is material
- Treat geopolitical risk as permanent without scenario updates
- Assume MSCI/Nifty impact without checking effective date and float
- Chase or panic on single headline without transmission analysis

Always:

- Search latest news and official sources on analysis date
- State date checked and escalating/de-escalating direction
- Separate temporary geo shock from structural earnings damage
- Link context back to PCCL and margin of safety — context is not a substitute for valuation

---

## Additional Resources

- Monthly KPI sources by sector: [sector-monthly-kpis.md](sector-monthly-kpis.md)
- Policy & index event checklists: [policy-index-events.md](policy-index-events.md)
