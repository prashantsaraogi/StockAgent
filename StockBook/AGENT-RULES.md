# StockBook — Agent Rules



**Purpose:** Persist stock-specific analysis so information is **not lost** between chat sessions.  

The agent must **read before analyzing** and **update after** material discussions.



---



## When to read `StockBook/`



**Before any stock analysis** (buy/hold/add/PCCL/FAQ refresh):



1. Read **`News/YYYY-MM/YYYY-MM-DD/summary.md`** (latest ≤ today) + [`News/TICKER-INDEX.md`](../News/TICKER-INDEX.md) for the ticker  
2. If `StockBook/[Sector]/[Stock Name]/` exists — read files below



```

StockBook/[Sector]/[Stock Name]/

```



**Sectors:** `Banking and Finance` · `Healthcare` · `Pharma` · `Infrastructure` · `Auto` · `IT` · `FMCG` · `Telecom` · `Oil and Gas` · `Hotels and Leisure` · `Consumer`



Read in this order:



| Order | File | Use |

|------:|------|-----|

| 1 | `summary-analysis.md` | Verdict, PCCL, position, last action |

| 2 | `faq.md` | Prior Q&A — user convictions, blended-cap rules |

| 3 | `suggested-approach.md` | DCA plan, triggers, blended avg caps |

| 4 | `detail-analysis.md` | Full thesis, risks, valuation history |

| 5 | `external-negative-risk.md` | Macro · geo · sector risks + **L1/L2/L3 growth impact** |

| 6 | `internal-negative-risk.md` | Governance · execution · AI · legal + **L1/L2/L3 growth impact** |

| 7 | `*-report.html` | Optional — same content for human reading |

| 8 | `CAGR_[TICKER].md` | Holding CAGR per lot · buy date → latest NSE CMP — see `StockBook/CAGR-FRAMEWORK.md` |

| 9 | `PARAMETERS_[TICKER].md` | **Part 1:** 10Y rear-view · **Part 2:** 5Y forward @ average earnings — see `StockBook/PARAMETERS-FRAMEWORK.md` |
| 10 | **`PE-EVALUATION-FRAMEWORK.md`** | **Stock Valuation Scorecard** — purchase P/E vs today · 8-point quarterly scorecard — see repo root `StockBook/PE-EVALUATION-FRAMEWORK.md` |
| 11 | `BROKER_[TICKER].md` | Street broker targets (~12M) — one row per broker; see `StockBook/BROKER-TARGET-FRAMEWORK.md` |
| — | **`ANALYSIS-LENSES-FRAMEWORK.md`** | **Lens registry** — how news, parameters, broker, quotes, CAGR sync into summary + approach |
| — | **`STOCK-QUESTION-FRAMEWORK.md`** | **Stock-scoped Q&A** — P/E vs results sync, post-results, PCCL; web StockBook Ask sidebar + faq write-back |
| — | **`investor-wisdom/sector-news-orientation-lens.md`** | **Module E** — sector news breadth + business orientation **before** forward P/E buy |
| — | **`investor-wisdom/thematic-comparative-analysis.md`** | **Thematic runs** — update **all in-scope** StockBook folders when user asks theme/value-chain analysis |
| — | **`StockBook/SECTOR-OUTLOOK-FRAMEWORK.md`** | **3–5Y sector research** — fair P/E bands; **weekly refresh** — see `[sector]-sector-outlook.md` |

See **`RISK-FILE-RULES.md`** for negative-risk file doctrine.



**Do not contradict** prior report conclusions without **new evidence** (quarterly results, price move, user trade).  

State what changed and **update the report files**.



**Template vs deep reports:** 37 holdings have starter templates (position + verdict + PCCL anchor). 12 have full framework write-ups. Treat template reports as planning anchors — run full analysis when user asks or on quarterly refresh.



---



## When to create or update `StockBook/` (mandatory)



**Default rule:** Any chat that discusses a specific stock's **add / hold / pause**, **PCCL**,
**sizing**, **YoC gate**, **FAQ**, **trade**, or **thesis** → **update StockBook in the same
session** before ending the turn. Do **not** rely on chat memory alone.



Create or refresh files when **any** of these occur:



- User asks buy / hold / add / pause / wait on a stock
- PCCL, IV, MoS, premium-to-PCCL, or blended cap recalculated or debated
- User question answered about the stock (append **`faq.md`**)
- Verdict or salary surplus rank changed
- Quarterly results, material news, or price move changes the view
- User confirms or proposes a **trade**
- User completes a **full framework analysis**
- User asks to **save StockBook** or **generate StockBook folder**
- User asks **thematic / comparative / value-chain** analysis (data-centre, policy sector, etc.) → **all stocks in scope** — see **`investor-wisdom/thematic-comparative-analysis.md`**



Skip only if user explicitly says **"don't save"** or **"chat only."**



### Update tiers



| Tier | When | Minimum files to touch |

|------|------|------------------------|

| **Light** | Quick clarification, single FAQ, no verdict change | `faq.md` · verdict/date in `summary-analysis.md` · lens snapshot (`_sync-analysis-lenses.ps1`) · regenerate HTML |

| **Standard** | Verdict, PCCL, DCA plan, sizing caps, or approach changed | All 4 markdown · HTML · refresh `PARAMETERS_[TICKER].md` Block A if CMP moved >10% · **run lens sync** |

| **Full** | Complete framework analysis or major thesis rewrite | Standard + expand `detail-analysis.md` + full `PARAMETERS` (Blocks A/B/C) + agent fills lens snapshots |



**Always append** — never delete prior FAQ answers unless user retracts; mark superseded with date.



### Cross-file sync (when relevant)



| Also update | When |

|-------------|------|

| `holdings.md` framework notes row | One-line verdict change for that ticker |

| `quadrant-map.md` | Surplus rank or sector % allocation changed |

| `StockBook/README.md` | New stock folder created or last-updated date materially changed |



### Required files per stock



| File | Content |

|------|---------|

| `summary-analysis.md` | Executive summary + FAQ highlights |

| `detail-analysis.md` | Full framework analysis |

| `suggested-approach.md` | Action plan, DCA, caps, triggers |

| `faq.md` | Q&A from user discussions — **store Conviction_PCCL** when user states personal stress limit |

**PCCL dual anchor (Aug 2026):** Always show **Rational_PCCL** (model) + optional **Conviction_PCCL** (from `faq.md`) → **Base = min(both)** → **Applied_PCCL** (loss floor on top). All tier/premium math uses **Applied**. See `.cursor/skills/pccl-analysis/pccl-dual-anchor.md`.

| `[ticker]-report.html` | All four sections in one readable HTML page |



### Folder naming



Place under sector folder. Use company name as user knows it:



```

StockBook/Healthcare/Max Healthcare/

StockBook/Banking and Finance/HDFC Bank/

StockBook/Pharma/Cipla/

StockBook/IT/Tata Consultancy Services/

```



Sector guide:



| Sector folder | Examples |

|---------------|----------|

| **Banking and Finance** | Banks, NBFC, AMC, insurance |

| **Healthcare** | Hospitals, diagnostics |

| **Pharma** | Pharma / biotech |

| **Infrastructure** | EPC, infra, capital goods, graphite |

| **Auto** | OEMs, auto components |

| **IT** | IT services |

| **FMCG** | Consumer staples |

| **Telecom** | Telecom operators |

| **Oil and Gas** | OMC, E&P, city gas |

| **Hotels and Leisure** | Hotels, gaming, leisure |

| **Consumer** | Durables, beverages |



---



## FAQ file rules



- Capture **questions the user actually asked** — not generic FAQ boilerplate

- Include **user-specific rules** (e.g. blended avg cap ₹1,600, Fortis-style logic)

- Append new Q&A when user asks follow-ups — **do not drop old answers**

- Date-stamp major updates in file header



---



## StockBook action vocabulary (wealth mandate)



Reports for this user use **only** these actions for existing holdings:



| Action | Meaning |

|--------|---------|

| **HOLD** | Keep all shares $MID default for legacy positions |

| **ADD** | Deploy **new/salary capital** with size caps (PCCL, blended avg, YoC gate) |

| **PAUSE ADDS** | Stop new buys; **still HOLD** legacy (expensive, overweight, or thesis watch) |



**Do not use in StockBook action tables or suggested-approach:**

- TRIM, SELL, REDUCE, ROTATE, profit-booking, rebalancing



**Do not frame FAQ as** "Should I sell or trim?" $MID use **"What if expensive or overweight?"**
→ answer: HOLD legacy; PAUSE ADDS; rank **fresh ₹** elsewhere.



**EXIT** may appear **only** as a footnote for Tier-1 existential events (accounting fraud,
licence loss, moat permanently destroyed) $MID not as a routine option.



Cross-ref: `portfolio-analysis/long-term-investor-mandate.md` · `investor-wisdom/buy-decision-workflow.md`.



---



## Buy / add discussions — quotes lens (mandatory)



When user asks **buy today**, **add**, or **is it worth buying**:



1. Run **`investor-wisdom/buy-decision-workflow.md`** (all 10 steps)  
2. Append or update **`faq.md`** with a **Quotes lens** Q&A — table: Quote | Investor | What it means for you today  
3. Record **staged starter vs lump sum** verdict in `summary-analysis.md` and `suggested-approach.md`



Minimum **3 quotes** from `investor-wisdom/quotes.md` — never invent quotes.



Exemplar: `StockBook/Pharma/Dr Reddys Laboratories/faq.md` Q2.



---



## `suggested-approach.md` template (continuous SIP)



Every quality holding should follow **`Muthoot Finance/suggested-approach.md`**
structure (aligned axes) or **`Indraprastha Gas/suggested-approach.md`** (divergent axes)
and `pccl-analysis/continuous-sip-valuation-tiers.md`:



1. **Philosophy** — Q×T×quality; continuous SIP; PCCL = protection not wait target  
2. **Dual-axis @ CMP** — **Axis A: SIP tier 1–5** vs **Axis B: Current value** — state if **divergent**  
3. **Axis A table** — PCCL, IV, Premium to PCCL, MoS, tier, baseline pace  
4. **Axis B table** — Normalized EPS, **P/E vs sector/peers**, Q trend, industry KPI, macro, forward prob → **Low/Fair/Expensive/Very expensive**  
5. **Conflict resolution** — final pace + surplus when A ≠ B  
6. **Default action** — HOLD + final pace  
7. **Blended avg protection** — ceiling + monthly pace tables  
8. **Price zones & actions**  
9. **New-tranche risk @ PCCL**  
10. **Salary surplus priority**  
11. **Triggers** — upgrade/downgrade **pace**  
12. **Decision card** — **both axes** on one line  

Template snippet: `StockBook/_templates/dual-axis-suggested-approach.md`



**Actions in approach files:** HOLD · ADD (tier-paced SIP) · downgrade to minimal token ·
rare **zero new ₹** only for core-problem / existential — **not** “wait for crash.”



---



## Integration with portfolio files



| File | Relationship |

|------|--------------|

| `.cursor/portfolio/holdings.md` | Qty, avg cost — **master positions** |

| `.cursor/portfolio/quadrant-map.md` | Surplus deployment rank |

| `StockBook/[Sector]/[Stock]/` | **Thesis, PCCL, FAQ, approach** — deeper than holdings notes |



Holdings = **what you own**. Report = **why and what to do**.



---



## Refresh checklist



On each material update:



- [ ] **News** updated for material headlines (`News/YYYY-MM/DD/summary.md`, `TICKER-INDEX.md`)

- [ ] **Lens sync** — `StockBook/_sync-analysis-lenses.ps1` after parameters/broker/CAGR batch or verdict change

- [ ] CMP verified on analysis date

- [ ] PCCL / IV / blended cap recalculated if inputs changed

- [ ] **Surplus rank / sector %** updated if ground reality or news shifted (`dynamic-capital-allocation.md`)

- [ ] **Sector outlook (L11)** — any `[sector]-sector-outlook.md` with **Last refreshed > 7 days** → weekly update per `SECTOR-OUTLOOK-FRAMEWORK.md` · log in `SECTOR-OUTLOOK-INDEX.md`

- [ ] FAQ updated with new user questions

- [ ] HTML regenerated to match markdown files

- [ ] `StockBook/README.md` stock index table updated



---



## Current stocks (49 holdings — full coverage)



See [`README.md`](README.md) for the complete index with links.



### Banking and Finance (12)



ICICI Bank · HDFC Bank · Kotak Mahindra Bank · PNB · SBI · Bank of India · Ujjivan SFB · Muthoot Finance · Bajaj Finserv · HDFC AMC · HDFC Life · GICRE



### Healthcare (3)



Max Healthcare · Fortis Healthcare · Medanta



### Pharma (4)



Cipla · Lupin · Sun Pharmaceutical · Glenmark Pharma



### Infrastructure (3)



Larsen and Toubro · Raajmarg Infra Investment · HEG



### Auto (8)



Hero MotoCorp · TMPV · Maruti Suzuki · Tata Motors CV · Samvardhana Motherson · Balkrishna Industries · Eicher Motors · Ashok Leyland



### IT (5)



TCS · Infosys · HCL Technologies · Wipro · Tech Mahindra



### FMCG (4)



ITC · Hindustan Unilever · Tata Consumer Products · Kwality Walls India



### Telecom (1)



Bharti Airtel



### Oil and Gas (3)



Indian Oil Corporation · Indraprastha Gas · ONGC



### Hotels and Leisure (4)



Delta Corp · Indian Hotels · ITC Hotels · Wonderla Holidays



### Consumer (2)



Havells India · United Breweries



Cross-ref: `stock-analysis/SKILL.md`, `.cursor/portfolio/README.md`, `SETUP.md`.

---

## Daily morning framework

End-to-end run (news → portfolio numbers → surplus rank → write-back):

- **Copy-paste prompt:** [`.cursor/prompts/MORNING-RUN-PROMPT.md`](../.cursor/prompts/MORNING-RUN-PROMPT.md)
- **Sequence & registry:** [`.cursor/prompts/MORNING-FRAMEWORK-SEQUENCE.md`](../.cursor/prompts/MORNING-FRAMEWORK-SEQUENCE.md)

When adding new Report workflows or batch scripts, update both prompt files per maintenance rule in the sequence doc.

