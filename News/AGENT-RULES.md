# News — Agent Rules

**Purpose:** Persist **dated** macro and stock-specific news for the India Stock Investment Agent.  
Analysis must use **latest News** + **Report** + **holdings** — not chat memory alone.

**Daily run:** Phase 1 of [`.cursor/prompts/MORNING-FRAMEWORK-SEQUENCE.md`](../.cursor/prompts/MORNING-FRAMEWORK-SEQUENCE.md) · copy-paste [`.cursor/prompts/MORNING-RUN-PROMPT.md`](../.cursor/prompts/MORNING-RUN-PROMPT.md) Variant A or B.

---

## When to read `News/`

**Before any stock analysis** on analysis date `D`:

1. Read `News/YYYY-MM/YYYY-MM-DD/summary.md` for **today** (or latest available date ≤ D)
2. Scan [`TICKER-INDEX.md`](TICKER-INDEX.md) for the ticker — follow linked dates
3. If stock-specific news exists, read that date's summary **before** re-stating thesis or SIP pace
4. Run **live search** if user asks for "latest" or date is >3 days old — then **update News**

---

## When to create or update `News/`

Create or append **`News/YYYY-MM/YYYY-MM-DD/summary.md`** when:

- User mentions a headline (e.g. Delhi CNG/EV policy → IGL)
- User asks **“run news for today”** — follow **[`SEARCH-WORKFLOW.md`](SEARCH-WORKFLOW.md)** end-to-end
- Macro event: RBI MPC, CPI, GDP, budget, MSCI, Nifty rebalancing
- Geopolitical shift: oil, Middle East, tariffs
- Sector KPI: SIAM sales, AMFI flows, RBI credit (material move)
- Quarterly result **or** policy that changes **add vs pause** for a holding

**Daily search window (mandatory — user Aug 2026):**

- Use **IST calendar day D**: **00:01 – 23:59 IST** (full day target).
- If run at **09:16 IST**, search **00:01 – 09:16 IST** (partial) and **state hours covered** in summary header.
- Scan **three buckets:** pre-market · session (09:15–15:30) · **post-close (15:31–23:59)** — post-close is where CNG/tariff/block-deal misses happen.
- **Markets closed ≠ no news** — late Fri / midnight Sat announcements belong to **calendar date D**.

Detail: **[`SEARCH-WORKFLOW.md`](SEARCH-WORKFLOW.md)**.

**Do not** dump generic market noise. Include only news that **could change**:

- Current value @ CMP (Low / Fair / Expensive / Very expensive)
- SIP tier pace
- PCCL / core-problem test
- Surplus rank (`quadrant-map.md`)

---

## Daily summary format (mandatory sections)

```markdown
# News summary — YYYY-MM-DD

**Date checked:** …  
**Search window:** YYYY-MM-DD **00:01 – HH:MM IST** (partial | full) · buckets A/B/C scanned: yes/no  
**Sources:** CNBC-TV18 · Moneycontrol · ET · NDTV Profit (primary); BSE/NSE filings · RBI · Reuters (secondary as needed)

## Portfolio impact — holdings (primary table)

| Stock name | News | Impact | Type | Structural vs temporary | Action implication |
|------------|------|:------:|------|-------------------------|-------------------|
| **TICKER / Company** | One-line headline | **+ve** / **-ve** / **Mixed** / **Neutral** | FACT / … | … | HOLD / ADD / PAUSE … |

*First table always uses columns: **Stock name · News · Impact (+ve/−ve) ·** then Type, Structural vs temporary, Action implication.*

## Macro & policy
| Item | Reading | Type |
|------|---------|------|

## Geopolitical
| Situation | Status | Direction | India transmission |

## Sector surplus band (optional refresh)
| Sector | Band | What changed |

## Triggers — what would change the view
- …
```

**Type column:** FACT | MANAGEMENT CLAIM | HYPOTHESIS | OUR ASSUMPTION | UNVERIFIED

---

## Link to Report workflow

After writing News:

1. Update affected `StockBook/[Sector]/[Stock]/summary-analysis.md` — add **News context** row or refresh verdict
2. Update `suggested-approach.md` if SIP pace / current value changes
3. Append `faq.md` if user asked
4. Add row to [`TICKER-INDEX.md`](TICKER-INDEX.md)
5. Refresh `quadrant-map.md` if surplus rank shifts

---

## Evidence standard

### Preferred news sources (mandatory — user Aug 2026)

When running the **daily news framework** or live-searching headlines, **prioritize these four** in order:

| Priority | Source | Use for |
|:--------:|--------|---------|
| **1** | **[CNBC-TV18](https://www.cnbctv18.com/)** | Block deals, stocks to watch, broker calls, market-moving corporate news |
| **2** | **[Moneycontrol](https://www.moneycontrol.com/)** | Market wrap, sector moves, block/bulk deals, results |
| **3** | **[Economic Times (ET)](https://economictimes.indiatimes.com/)** | Macro, policy, liveblogs, corporate filings coverage |
| **4** | **[NDTV Profit](https://www.ndtvprofit.com/)** | Cross-check macro, policy, and market headlines |

**Rules:**
- Always list **which of the four** was used in the daily summary **`Sources:`** line.
- **Cite the outlet by name** in the **News** column when a row is driven by a headline (e.g. *"CNBC-TV18: Singtel …"*).
- Cross-check with **BSE/NSE bulk-block deals** or **exchange filings** when block deals, results, or regulatory orders are material.
- TOI, Business Standard, Reuters, RBI, etc. remain valid **secondary** sources — use when the big four lack coverage.

- State **date checked** and **source** (outlet + filing where applicable)
- Never invent hearing dates, policy dates, or penalty amounts
- Distinguish **announced policy** vs **implementation risk** vs **legal challenge**
- Separate **structural** (multi-year) from **temporary** (headline fade)
- **Reported deal ≠ executed deal:** CNBC-TV18 / Moneycontrol **report** = FACT (headline exists); NSE bulk/block window confirmation = separate FACT row when available

### Daily search workflow (mandatory)

Before writing **`summary.md`** for date **D**, run **[`SEARCH-WORKFLOW.md`](SEARCH-WORKFLOW.md)**:

1. Window **D 00:01 – min(T_now, D 23:59) IST**
2. **Macro pass** (orientation) + **post-close bucket**
3. **Stock-wise loop — all 50 holdings:** search **company name** on each of four outlets; **gap-check** vs macro row after each stock
4. Timestamp-filter every headline to IST date **D** (or carry-forward D−7 if unresolved)
5. Write **stock-wise coverage log** (50 rows or partial N/50)
6. Complete **coverage self-check** (7 items) before finishing
7. **Neutral** only if **stock-wise searched (4/4)** and nothing material found — **never** sector proxy

Cross-ref: `dynamic-context-analysis/SKILL.md`, `stock-agent.mdc` §20, `StockBook/AGENT-RULES.md`.
