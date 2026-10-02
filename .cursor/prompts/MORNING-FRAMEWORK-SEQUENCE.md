# Morning Framework — Activity Sequence

**Created:** 29 Aug 2026  
**Purpose:** Single ordered checklist for all standalone framework pieces — news, portfolio numbers, parameters, surplus rank, reports.  
**Copy-paste prompt:** [`MORNING-RUN-PROMPT.html`](MORNING-RUN-PROMPT.html) (browser) · [`AUTOMATION.md`](AUTOMATION.md) (auto on login)

Cross-ref: `stock-agent.mdc` · `StockBook/AGENT-RULES.md` · `News/AGENT-RULES.md` · `holdings.md`

---

## Cadence overview

| Run | When (IST) | Prompt variant | Duration |
|-----|------------|----------------|----------|
| **Early morning** | **08:00–10:00** (daily) | `MORNING-RUN-PROMPT.md` → **Variant A** | ~15–25 min agent |
| **Post-close** | **21:00–23:00** (trading days) | **Variant B** | ~10–15 min |
| **Weekly deep** | **Saturday** or Sunday | **Variant C** | ~30–45 min |
| **Buy today** | Any time user deploys ₹ | **Variant D** (add-on) | Per stock |

---

## Master sequence (end-to-end)

Run in **this order**. Do not skip earlier phases — later steps depend on fresh news + CMP.

```
Phase 0  Context load (read-only)
Phase 1  News & ground reality
Phase 2  Portfolio numbers (CMP, CAGR, parameters)
Phase 3  Surplus rank & quadrant refresh
Phase 4  Write-back & index updates
Phase 5  (Optional) Buy / add workflow
Phase 6  (Weekly) Deep refresh
```

---

### Phase 0 — Context load (~2 min)

| Step | Action | Files read |
|------|--------|------------|
| 0.1 | Read master holdings | `.cursor/portfolio/holdings.md` |
| 0.2 | Read latest news (date ≤ today) | `News/YYYY-MM/YYYY-MM-DD/summary.md` |
| 0.3 | Scan ticker index for material hits | `News/TICKER-INDEX.md` |
| 0.4 | Read surplus rank snapshot | `.cursor/portfolio/quadrant-map.md` |
| 0.5 | Read personal discipline (if any ADD likely) | `investor-wisdom/personal-discipline.md` |

**Output:** Agent knows book, last news date, surplus bands — no writes yet.

---

### Phase 1 — News & dynamic context (~10–20 min)

**Mandatory workflow:** [`News/SEARCH-WORKFLOW.md`](../../News/SEARCH-WORKFLOW.md)

| Step | Action | Detail |
|------|--------|--------|
| 1.1 | Set window | **D 00:01 – T_now IST** (state partial vs full in header) |
| 1.2 | Three buckets | A pre-market · B session · **C post-close** |
| 1.3 | Primary four | CNBC-TV18 · Moneycontrol · ET · NDTV Profit |
| 1.4 | **Stock-wise loop** | All **50 holdings** — search company name; gap-check vs macro |
| 1.5 | Macro / geo | RBI · oil · MSCI · geopolitical — `dynamic-context-analysis` |
| 1.6 | Write summary | `News/YYYY-MM/YYYY-MM-DD/summary.md` |
| 1.7 | Index | `News/TICKER-INDEX.md` |
| 1.8 | Report light touch | Affected `StockBook/.../summary-analysis.md` if verdict/SIP shifts |
| 1.9 | Quadrant | Refresh `quadrant-map.md` **only if** surplus rank materially shifts |

**Early morning:** partial window OK — **re-run Phase 1 Variant B** after 21:00 same day.

---

### Phase 2 — Portfolio numbers (~5–10 min)

Run scripts **in order** (needs network for NSE/Yahoo CMP):

```powershell
cd d:\D-Drive\Personal\My-agent\Report
.\_generate-all-cagr.ps1              # 50 x CAGR_[TICKER].md
.\_generate-portfolio-cagr.ps1          # portfolio-cagr.md + .html
.\_generate-all-parameters.ps1 -SkipDetailed   # 49 PARAMETERS (keeps HDFCBANK full)
```

| Step | Output | Framework |
|------|--------|-----------|
| 2.1 | Per-stock holding CAGR | `StockBook/CAGR-FRAMEWORK.md` |
| 2.2 | Portfolio dashboard | `.cursor/portfolio/portfolio-cagr.md` |
| 2.3 | Today vs 10Y parameters | `StockBook/PARAMETERS-FRAMEWORK.md` |
| 2.4 | Portfolio parameters index | `.cursor/portfolio/portfolio-parameters.md` (agent refresh table) |
| 2.5 | Broker targets per stock | `StockBook/_generate-all-broker-targets.ps1` -> `BROKER_[TICKER].md` |
| 2.6 | **Lens sync** | `StockBook/_sync-analysis-lenses.ps1` -> summary + suggested-approach |

**Weekly only:** rebuild P/E vs history (Screener fetch):

```powershell
cd d:\D-Drive\Personal\My-agent\.cursor\portfolio
.\_build-pe-averaging-analysis.ps1
# Then re-run _generate-all-parameters.ps1
```

---

### Phase 3 — Surplus rank & monitoring (~5 min)

| Step | Action | When |
|------|--------|------|
| 3.1 | Refresh **quadrant-map.md** | CMP date stale OR weight/gain moved >2% |
| 3.2 | Sector comparative ranks | Only if news changed sector band (pharma, banks, IT, O&G) |
| 3.3 | Price decline check (§22) | Any holding down **≥15%** from recent peak — run before any ADD |
| 3.4 | Fraud/governance live search | Banks, flagged names (HDFC, Delta, etc.) |

**Do not** suggest TRIM/SELL — long-term mandate; rank applies to **surplus only**.

---

### Phase 4 — Write-back checklist

Before closing the run, confirm:

- [ ] `News/.../summary.md` — search window + stock-wise log + self-check
- [ ] `News/TICKER-INDEX.md` — material rows
- [ ] `portfolio-cagr.md` — refreshed if Phase 2 ran
- [ ] `portfolio-parameters.md` — P/E verdict column current
- [ ] `quadrant-map.md` — if surplus % changed
- [ ] Affected `StockBook/.../summary-analysis.md` — news context row or date
- [ ] **Lens sections** synced if Phase 2 ran (`_sync-analysis-lenses.ps1`)
- [ ] **No chat-only conclusions** — durable updates in files

---

### Phase 5 — Buy / add (on demand only)

When deploying **fresh/salary capital** today, run **after** Phases 0–4:

| Step | Workflow |
|------|----------|
| 5.1 | `investor-wisdom/buy-decision-workflow.md` (all 10 steps) |
| 5.2 | `investor-wisdom/personal-discipline.md` — pause registry |
| 5.3 | `stock-analysis` + `exclusion-guards` |
| 5.4 | PCCL / premium-add-sizing / YoC if dividend name |
| 5.5 | **Quotes lens** ≥3 from `investor-wisdom/quotes.md` |
| 5.6 | Write-back: Report + `holdings.md` if trade confirmed |

**Variant D** in prompt file — paste with stock name(s).

---

### Phase 6 — Weekly deep (Saturday)

| Step | Action |
|------|--------|
| 6.1 | Full **24h news** backfill for week (any missed post-close) |
| 6.2 | `_build-pe-averaging-analysis.ps1` → upward/downward PE files |
| 6.3 | `_generate-all-parameters.ps1` |
| 6.4 | Deep-fill **PARAMETERS Block B/C** for top 10 by book (optional queue) |
| 6.5 | Review stale `StockBook/` dates — flag Q results due |
| 6.6 | Sector ranks: `pharma-comparative-rank.md`, `healthcare-comparative-rank.md`, `oil-gas-comparative-rank.md`, `fmcg-comparative-rank.md` |

---

## Framework component registry

**Update this table + `MORNING-RUN-PROMPT.md` when adding new standalone pieces.**

| Component | Path | Phase | Cadence |
|-----------|------|-------|---------|
| News search | `News/SEARCH-WORKFLOW.md` | 1 | Daily (2x trading days) |
| News rules | `News/AGENT-RULES.md` | 1 | — |
| Dynamic context | `.cursor/skills/dynamic-context-analysis/` | 1 | Daily |
| Holdings master | `.cursor/portfolio/holdings.md` | 0, 4 | On trade |
| Quadrant / surplus | `.cursor/portfolio/quadrant-map.md` | 3, 4 | Daily if rank shifts |
| CAGR per stock | `StockBook/_generate-all-cagr.ps1` | 2 | Daily |
| Portfolio CAGR | `StockBook/_generate-portfolio-cagr.ps1` | 2 | Daily |
| Parameters batch | `StockBook/_generate-all-parameters.ps1` | 2 | Daily; deep weekly |
| Parameters framework | `StockBook/PARAMETERS-FRAMEWORK.md` | 2 | — |
| Portfolio parameters index | `.cursor/portfolio/portfolio-parameters.md` | 2, 4 | Daily |
| P/E vs 10Y | `.cursor/portfolio/_build-pe-averaging-analysis.ps1` | 6 | Weekly |
| Buy decision | `investor-wisdom/buy-decision-workflow.md` | 5 | On buy/add |
| Personal discipline | `investor-wisdom/personal-discipline.md` | 5 | On buy/add |
| Stock analysis | `.cursor/skills/stock-analysis/SKILL.md` | 5 | On request |
| PCCL | `.cursor/skills/pccl-analysis/` | 5 | On request |
| Price decline §22 | `.cursor/skills/price-decline-analysis/` | 3, 5 | On drawdown |
| Broker targets | `StockBook/BROKER-TARGET-FRAMEWORK.md` | 2 | Daily/weekly |
| Analysis lenses (integrated) | `StockBook/ANALYSIS-LENSES-FRAMEWORK.md` | 2, 4 | Daily after Phase 2 |
| Lens sync script | `StockBook/_sync-analysis-lenses.ps1` | 2, 4 | Daily after Phase 2 |
| StockBook write-back | `StockBook/AGENT-RULES.md` | 4 | Every stock touch |
| Long-term mandate | `portfolio-analysis/long-term-investor-mandate.md` | 3 | Always |

---

## Maintenance rule (for agents)

When user or agent **adds a new framework file, script, or daily workflow**:

1. Add row to **Framework component registry** above  
2. Assign **Phase** and **Cadence**  
3. Update [`MORNING-RUN-PROMPT.md`](MORNING-RUN-PROMPT.md) — relevant variant(s)  
4. Add one line to `.cursor/portfolio/holdings.md` header links if user-facing  
5. Bump **Last updated** date in both prompt files  

---

*Last updated: 30 Aug 2026*
