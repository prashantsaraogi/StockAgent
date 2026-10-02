# Analysis Lenses Framework — Integrated Stock View

**Created:** 30 Aug 2026  
**Purpose:** Register every **standalone analysis lens**, define how each feeds **`summary-analysis.md`** and **`suggested-approach.md`**, and how to extend the system when new lenses are added.

Cross-ref: `StockBook/AGENT-RULES.md` · `.cursor/prompts/MORNING-FRAMEWORK-SEQUENCE.md` · `GLOSSARY.md`

---

## Core idea

Each stock is viewed through **multiple lenses** (news, parameters, broker targets, quotes, PCCL, CAGR, risks).  
**No single lens overrides another.** Summary + suggested-approach **integrate** them into one verdict and one SIP plan.

```
Lens files (source of truth per topic)
        |
        v
  summary-analysis.md  ----->  Verdict + lens snapshot table
        |
        v
  suggested-approach.md ----->  Lens-driven pace + conflict rules
```

---

## Lens registry (current)

| ID | Lens | Per-stock file | Portfolio index | Primary question | Feeds summary | Feeds approach |
|----|------|----------------|-----------------|------------------|---------------|----------------|
| L1 | **News / dynamic context** | `News/TICKER-INDEX.md` + daily `News/YYYY-MM/DD/summary.md` | Latest digest link in holdings header | What changed in the world for this name? | Header news line + lens row | Event triggers; no lump sum on overhang |
| L2 | **Parameters (10Y + 5Y)** | `PARAMETERS_[TICKER].md` | `portfolio-parameters.md` | Cheap vs own history? Forward return @ avg earnings? | P/E vs 10Y + forward read | Axis B / current value; ADD gate |
| L3 | **Broker targets (~12M)** | `BROKER_[TICKER].md` | `broker-target-prices.md` | What does the Street think? | Consensus upside (secondary) | **Never** overrides PCCL; sentiment check |
| L4 | **Holding CAGR** | `CAGR_[TICKER].md` | `portfolio-cagr.md` | How has *my* book performed? | Legacy gain / CAGR | Blended cap context; pause expensive adds |
| L5 | **PCCL / dual-axis valuation** | `summary-analysis.md` + `suggested-approach.md` | — | Stress limit + SIP tier? | Tier, premium, verdict | Axis A pace, zones, caps |
| L6 | **Quotes (buy discipline)** | `faq.md` (Quotes lens Q) | `investor-wisdom/quotes.md` | What would Munger/Graham say today? | On buy/add only | Staged starter vs lump sum |
| L7 | **External / internal risk** | `external-negative-risk.md`, `internal-negative-risk.md` | — | L1/L2/L3 growth impact? | Risk flag in summary | Downgrade pace on material flag |
| L8 | **YoC / dividend overlay** | `faq.md` + approach | — | Income on deployed capital? | OMC/PSU/bank names | 8% blended YoC gate |
| L9 | **Surplus rank** | `quadrant-map.md` | Same | Where does fresh Rs go? | Surplus slice % | Salary surplus priority table |
| L10 | **Sector orientation & challenges** | `detail-analysis.md` §Industry + `investor-wisdom/sector-news-orientation-lens.md` | Sector `*-comparative-rank.md` | Where is the business going; what blocks it? | Primary fair; forward haircut | **Blocks** Axis B #1 rank until complete |
| L11 | **Sector outlook (3–5Y)** | `[sector]-sector-outlook.md` | `SECTOR-OUTLOOK-INDEX.md` | What **fair P/E band** and growth path for 3–5Y? | Base P/E anchor; rank narrative | **Weekly refresh**; informs P/E debate |
| L12 | **PE Evaluation scorecard** | `StockBook/PE-EVALUATION-FRAMEWORK.md` + web Stock Calculator PE tab | — | Was purchase good? Attractive **today** (ignore anchor)? | Purchase P/E band + 8-pt score | Fresh vs legacy verdict; quarterly refresh |

**Read order before stock analysis:** News (L1) -> **L11 sector outlook (if P/E / 3–5Y thesis)** -> **L10 orientation (if ADD/rank/P/E debate)** -> Summary -> FAQ -> Approach -> Parameters (L2) -> **L12 PE scorecard (if user gives purchase price + date)** -> Broker (L3) -> CAGR (L4) -> Risks (L7).

---

## Mandatory sections (every stock)

### In `summary-analysis.md`

1. **Header** — optional `**News context (date):**` one-liner when material (L1)  
2. **Verdict (one line)** — integrates PCCL tier + current value + news  
3. **`## Analysis lenses (integrated)`** — table (auto-sync via script; agent fills snapshot on material change)  
4. **`## StockBook files & lenses`** — links to all lens files  

Markers for script: `<!-- LENSES-SUMMARY:START -->` ... `<!-- LENSES-SUMMARY:END -->`

### In `suggested-approach.md`

1. **Philosophy** (unchanged)  
2. **`## Lens-driven plan`** — how each lens sets or constrains pace  
3. **`## Lens conflict resolution`** — when lenses disagree (e.g. Axis A expensive, Axis B fair; Street bullish, PCCL pause)  
4. Dual-axis tables (unchanged)  

Markers: `<!-- LENSES-APPROACH:START -->` ... `<!-- LENSES-APPROACH:END -->`

---

## Snapshot table (summary) — column rules

| Column | Source | Agent rule |
|--------|--------|------------|
| **Lens** | Registry name | Fixed label |
| **File** | Link to lens file | Relative link |
| **Updated** | File mtime or stated date in file | Refresh when lens file changes |
| **Snapshot** | One line — FACT from lens file | No invention; UNVERIFIED if stale |
| **Verdict tie-in** | How lens affects HOLD/ADD/PAUSE | Must align with verdict line |

**Example (BHARTIARTL):**

| Lens | Snapshot | Verdict tie-in |
|------|----------|----------------|
| News | Singtel block overhang; week -3% | Slow SIP; no lump sum |
| Parameters | P/E fair vs 10Y; forward modest | Token SIP; not cheap on forward IV |
| Broker | Consensus +24%; Jefferies Rs 2400 | Secondary; do not chase |
| CAGR | +36% CAGR on book | Legacy winner; cap blended avg |

---

## Lens-driven plan (approach) — row rules

| Lens | Read @ CMP | Effect on pace / surplus |
|------|------------|---------------------------|
| News | [from L1] | Triggers only — not auto-buy |
| Parameters Part 2 | [from L2 Together row] | Axis B current value |
| Broker street | [consensus upside] | **No override** of PCCL / pause buckets |
| Quotes | [if faq has Quotes lens] | Staged size cap on buy day |
| PCCL / Axis A | tier N | Baseline sh/mo |
| Surplus rank | quadrant-map | % of monthly investable |

---

## When to update lenses vs summary/approach

| Event | Update lens file first | Then sync summary + approach |
|-------|------------------------|------------------------------|
| Daily news run | `News/.../summary.md`, `TICKER-INDEX.md` | Light — news row + header line |
| Phase 2 morning (CAGR/parameters) | `CAGR_*`, `PARAMETERS_*` | Run `_sync-analysis-lenses.ps1` |
| Broker refresh | `BROKER_*`, portfolio broker table | Sync + broker row |
| User buy/add question | `faq.md` Quotes lens | Standard tier — quotes row + approach |
| PCCL / verdict change | summary + approach body | Full standard tier |
| New lens added to registry | New lens file + this doc | See **Adding a new lens** below |

---

## Update tiers (revised)

| Tier | When | Files |
|------|------|-------|
| **Light** | FAQ, single news hit | `faq.md` · news line in summary · lens snapshot rows · HTML |
| **Standard** | Verdict, PCCL, DCA, sizing | All 4 core md + **lens sync** + PARAMETERS Block A if CMP moved >10% |
| **Full** | Major thesis rewrite | Standard + detail-analysis + full PARAMETERS + risks |

**Always run** after batch lens refresh:

```powershell
.\StockBook\_sync-analysis-lenses.ps1
```

---

## Adding a new lens (maintenance checklist)

When user or agent adds a **new analysis type** (e.g. ESG score, technical levels, MSCI flow):

1. **Create** `StockBook/[NAME]-FRAMEWORK.md` (methodology)  
2. **Add row** to **Lens registry** in this file (new ID L10+)  
3. **Add row** to `.cursor/prompts/MORNING-FRAMEWORK-SEQUENCE.md` **Framework component registry**  
4. **Extend** `_sync-analysis-lenses.ps1` — parse new file pattern + snapshot column  
5. **Extend** `_templates/lens-summary-block.md` and `lens-approach-block.md`  
6. **Update** `StockBook/AGENT-RULES.md` read order + update tiers  
7. **Run** `_sync-analysis-lenses.ps1` across all holdings  
8. **Bump** Last updated dates in prompt files  

**Rule:** New lenses must declare **feeds summary** and **feeds approach** columns — or explicitly "read-only / faq only".

---

## Conflict resolution (default rules)

| Conflict | Resolution |
|----------|------------|
| Street target >> CMP but PCCL tier 1-2 | **PCCL wins** — token SIP only; broker = sentiment |
| Parameters forward cheap, Axis A expensive | **Dual-axis** — slow SIP; **L10 must explain** forward path |
| Forward Fair but L10 L2 policy/challenge | **L10 wins** — token/pause; forward P/E cannot justify #1 |
| Trailing P/E > user conviction cap | **Conviction fair wins** — PAUSE/token regardless of Axis B |
| News negative, thesis intact | **HOLD** legacy; **pause or slow** adds |
| Quotes say wait, user wants buy today | **Staged starter** max; document in faq |
| IT / HDFC Bank / ITC pause buckets | **0% surplus** — lenses do not override personal discipline |
| YoC < 8% on dividend name | **Pause adds** until YoC path clear |

---

## Scripts

| Script | Purpose |
|--------|---------|
| `_sync-analysis-lenses.ps1` | Inject/update lens sections in all `summary-analysis.md` + `suggested-approach.md` |
| `_generate-all-parameters.ps1` | Parameters lens batch |
| `_generate-all-broker-targets.ps1` | Broker lens batch |
| `_generate-all-cagr.ps1` | CAGR lens batch |

---

## Templates

| File | Use |
|------|-----|
| `_templates/lens-summary-block.md` | Copy for manual stock create |
| `_templates/lens-approach-block.md` | Copy for manual stock create |
| `_templates/dual-axis-suggested-approach.md` | Full approach skeleton |

---

*Last updated: 3 Sep 2026*
