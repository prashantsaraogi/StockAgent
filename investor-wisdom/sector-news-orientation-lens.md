# Sector News & Business-Orientation Lens

**Project:** My-agent · **Created:** 3 Sep 2026  
**Purpose:** Mandate that **future business direction and sector challenges** are synthesised from **breadth of news and live context** **before** forward P/E or Axis B “Fair” can justify ADD/surplus rank.

**Exemplar:** Max Healthcare — room-rent cap debate (Aug 2026); user conviction **35× P/E** vs trailing ~62×.

Cross-ref: `buy-decision-workflow.md` Step 4.5 · `dynamic-context-analysis/SKILL.md` Module E · `StockBook/ANALYSIS-LENSES-FRAMEWORK.md` L10 · `PARAMETERS-FRAMEWORK.md` · `stock-agent.mdc` §20

---

## Core rule

> **Forward P/E is not a buy trigger by itself.**  
> It is valid only **after** sector news + business-orientation synthesis confirms the earnings path is **probable**, challenges are **classified**, and **trailing/conviction valuation** permits size.

```
News breadth (sector + peers + policy)
        ↓
Business orientation (where growth comes from)
        ↓
Challenges (policy, competition, margin, execution)
        ↓
Haircut forward EPS / catalyst prob if L2+
        ↓
Trailing normalized EPS × conviction cap (primary fair)
        ↓
Forward P/E / Axis B (secondary — confirmatory only)
        ↓
Verdict: WAIT | TOKEN SIP | ACCUMULATE
```

---

## When this lens is mandatory

Run **before** recommending ADD, ACCUMULATE, surplus #1 rank, or calling Axis B **Fair**:

| Trigger | Examples |
|---------|----------|
| User challenges valuation (P/E, “too expensive”) | Max @ 62× vs 35× conviction |
| Sector has **active policy / regulatory debate** | Hospital room-rent cap; pharma US pricing; OMC margin |
| **Structural-threat** or **legal-overhang** material | IT/AI; GST dispute; bank governance |
| Forward “Fair” but **trailing expensive** vs history + conviction | PARAMETERS Part 1 expensive + Part 2 fair |
| **Fresh capital rank** in regulated / policy-sensitive sectors | Healthcare, banks, OMC, PSU, telecom |

**Skip deep Module E only for:** pure factual price queries, legacy HOLD with no surplus deployment, or sectors with no material news change since last report refresh.

---

## Minimum news depth (agent must actually read/search)

Do **not** infer sector outlook from one headline or forward P/E alone.

| Step | Source | Minimum |
|------|--------|---------|
| 1 | `News/TICKER-INDEX.md` | Ticker + **sector peers** rows |
| 2 | `News/YYYY-MM/YYYY-MM-DD/summary.md` | **Latest 3 dates** ≤ analysis day (or all dates in month if fewer) |
| 3 | Stock `external-negative-risk.md` + sector `*-comparative-rank.md` | Active L1/L2/L3 flags |
| 4 | **Live search** | Sector + company: policy, results, brokerage, management commentary |
| 5 | **Peer results / KPIs** | Same quarter for 2+ sector names when comparing rank |

Label every item **FACT / MANAGEMENT CLAIM / HYPOTHESIS / OUR ASSUMPTION / UNVERIFIED**.  
State **date checked** on every synthesis.

Follow `News/SEARCH-WORKFLOW.md` when creating daily News; when **analysing**, the breadth above is the floor.

---

## Sector Orientation Brief (mandatory output table)

Include in chat and persist to `detail-analysis.md` §Industry (or `faq.md` for light updates) when verdict or surplus rank changes.

| Row | Content |
|-----|---------|
| **Future business orientation** | Where management is taking capacity, geography, mix, capital allocation (beds, ARPOB, acquisitions, digital) — **evidence from filings + news** |
| **Sector tailwinds** | Demand, penetration, policy support — with date |
| **Sector headwinds / challenges** | Regulation, competition, cost inflation, payer mix — each **classified** temp vs structural |
| **Company-specific transmission** | How headwinds hit **this** name vs peers |
| **Earnings proof status** | Does **PAT/cash** confirm the growth story yet? (Yes / Partial / No) |
| **Policy / legal catalyst prob** | Favourable outcome band if material |
| **Forward EPS haircut** | pp or % reduction to base case if L2 external risk active |
| **Primary fair (trailing × conviction)** | Normalized EPS × user conviction P/E or conservative multiple |
| **Axis B (forward) — subordinate read** | Fair / Expensive **only after** rows above |
| **Surplus rank implication** | Upgrade / hold / downgrade vs prior rank |

---

## Valuation hierarchy (overrides Axis B alone)

| Priority | Lens | Role |
|:--------:|------|------|
| **1** | **Applied PCCL + tier (Axis A)** | Stress floor, pace, premium caps |
| **2** | **Conviction fair P/E × normalized trailing EPS** | User personal fair — **wins over forward** when stated |
| **3** | **Sector orientation + challenges (L10 / Module E)** | Haircut forward assumptions; pause or token if L2+ unresolved |
| **4** | **Trailing vs 10Y history (PARAMETERS Part 1)** | “Expensive vs own past” — blocks “cheap” narrative |
| **5** | **Forward P/E / Axis B (PARAMETERS Part 2)** | **Confirmatory** — never sole reason for #1 surplus |
| **6** | **Broker consensus** | Sentiment only — never overrides 1–3 |

### When forward P/E must **not** drive ADD

| Condition | Action |
|-----------|--------|
| Trailing P/E **>** user conviction cap P/E at CMP | **PAUSE or token SIP** — cite conviction anchor |
| Active **L2 policy** risk (e.g. hospital price caps) | Haircut forward EPS 5–15%; cap catalyst prob ≤65%; **no lump sum** |
| PAT growth **< ½** EBITDA growth for **2+ quarters** (capacity story) | Forward EPS unproven — **wait for proof** |
| Axis A tier **1–2** + Module E structural headwind | **Dual-axis: news wins** — slow/pause despite Axis B Fair |
| News synthesis **not done** (minimum depth missing) | **Do not state Fair or #1 rank** — complete Module E first |

---

## Integration with buy-decision workflow

| Step | Change |
|------|--------|
| **4.5** (new) | **Sector orientation & news synthesis** — run this doc + Module E |
| **5** | PCCL + Axis A first; Axis B only if Step 4.5 complete |
| **6** | Catalyst prob uses **post-haircut** forward path |
| **9** | Verdict must cite orientation brief one-liner |

---

## Sector-specific orientation checklists

### Healthcare (hospitals)

| Read in news | Maps to |
|--------------|---------|
| Room rent / package rate / Clinical Establishments Act | ARPOB, metro realisation |
| CGHS / insurance / GST on health cover | Volume vs margin |
| Peer Q1/Q2: occupancy, ARPOB, EBITDA/bed | Execution proof |
| M&A (Kalinga, Sahyadri, greenfield) | PAT lag vs EBITDA |
| State inquiries (patient care, billing) | Governance / reputation |

### Banks

| Read | Maps to |
|------|---------|
| RBI MPC, credit growth, NIM | Earnings path |
| Governance / fraud headlines | Fresh-capital gate |
| GNPA trend, unsecured mix | Asset quality |

### IT

| Read | Maps to |
|------|---------|
| AI displacement vs validation demand | Structural threat |
| Client spend, deal wins | Near-term EPS |
| Headcount / fresher hiring | Pyramid model |

### OMC / CGD

| Read | Maps to |
|------|---------|
| Crude / marketing margin | Cyclical EPS |
| EV / CNG policy | Structural volume |

*(Extend per sector in `business-model-analysis/industry-templates.md`.)*

---

## Conflict resolution (L10 vs L2 Parameters)

| Conflict | Resolution |
|----------|------------|
| PARAMETERS Part 2 “fair” forward return, Part 1 expensive | **Part 1 + L10 win** — token SIP unless tier 4–5 |
| L10 structural policy risk, management says “expansion continues” | **Label MGMT CLAIM**; size per **policy catalyst prob**, not narrative |
| L10 tailwind, conviction cap far below CMP | **WAIT on fresh ₹** — quality ≠ price |
| Peer news better (Jefferies prefers Fortis) | Re-rank **fresh capital**; **no sell-to-rotate** |

---

## StockBook write-back

| Item | File |
|------|------|
| Orientation brief table | `detail-analysis.md` §3 or §Industry |
| Conviction P/E / fair | `faq.md` |
| Verdict + surplus downgrade | `summary-analysis.md`, `suggested-approach.md` |
| Policy risk level | `external-negative-risk.md` |
| Sector rank shift | `*-comparative-rank.md`, `quadrant-map.md` |
| Material new headline | `News/`, `TICKER-INDEX.md` |

---

## Change log

| Date | Change |
|------|--------|
| 2026-09-03 | Initial lens — Max Healthcare exemplar; forward P/E subordinate to news + orientation |
