# Morning Run — Copy-Paste Prompts

> **Open in browser (recommended):** [`MORNING-RUN-PROMPT.html`](MORNING-RUN-PROMPT.html) — double-click → tabs + one-click **Copy** buttons.  
> Markdown preview in Cursor often fails on this file; use the HTML version for daily use.

**Use in Cursor chat.** Pick **one variant** below. Agent follows [`MORNING-FRAMEWORK-SEQUENCE.md`](MORNING-FRAMEWORK-SEQUENCE.md).

**Last updated:** 29 Aug 2026

---

## Variant A — Early morning daily (08:00–10:00 IST)

**Copy everything in the box:**

```
Run my India Stock Investment Agent MORNING FRAMEWORK — Variant A (early morning).

Follow end-to-end: .cursor/prompts/MORNING-FRAMEWORK-SEQUENCE.md

PHASE 0 — Read: holdings.md · latest News/summary.md · TICKER-INDEX.md · quadrant-map.md

PHASE 1 — NEWS (mandatory):
- News/SEARCH-WORKFLOW.md — window = today 00:01 IST to NOW (state partial)
- Buckets A + B (+ C if overnight headlines exist)
- Stock-wise loop: all 50 holdings from holdings.md — gap-check each vs macro pass
- Primary four: CNBC-TV18 · Moneycontrol · ET · NDTV Profit
- Write/update News/YYYY-MM/YYYY-MM-DD/summary.md + TICKER-INDEX.md
- Light StockBook write-back for material holdings only

PHASE 2 — PORTFOLIO NUMBERS (run scripts):
cd d:\D-Drive\Personal\My-agent\Report
.\_generate-all-cagr.ps1
.\_generate-portfolio-cagr.ps1
.\_generate-all-parameters.ps1 -SkipDetailed
Refresh .cursor/portfolio/portfolio-parameters.md index table

PHASE 3 — SURPLUS:
- Refresh quadrant-map.md only if news/CMP shifts surplus rank
- Flag any holding down >=15% from peak (price-decline §22 watchlist)

PHASE 4 — Deliver short brief:
1) Macro + geo one paragraph
2) Top 5 material news for my holdings
3) Surplus rank changes (if any)
4) Portfolio CAGR snapshot (total return + cost-weighted CAGR)
5) Parameters: cheap vs expensive vs 10Y (count + top 3 cheap / top 3 expensive)
6) Any ADD/PAUSE flips from news
7) Next run: post-close ~21:00 IST for full day news

Do not suggest TRIM/SELL. Surplus deployment only. Persist all updates to files — not chat only.
```

---

## Variant B — Post-close (21:00–23:00 IST, trading days)

```
Run my India Stock Investment Agent MORNING FRAMEWORK — Variant B (post-close pass).

Follow: .cursor/prompts/MORNING-FRAMEWORK-SEQUENCE.md

Focus PHASE 1 only (full calendar day):
- News/SEARCH-WORKFLOW.md — window = today 00:01–23:59 IST (full day target)
- Bucket C post-close — highest priority (CNG, tariffs, block deals, global spillover)
- Stock-wise loop: all 50 holdings — complete any gap from morning partial run
- Merge/update same day summary.md (do not create duplicate date)
- TICKER-INDEX + affected Report summary-analysis.md
- Refresh quadrant-map.md if sector surplus band changed

Optional PHASE 2 if market moved >1%: re-run _generate-all-cagr.ps1 + _generate-portfolio-cagr.ps1

Deliver: what changed since morning pass · triggers for Monday open · FII/geo read.
```

---

## Variant C — Weekly deep (Saturday recommended)

```
Run my India Stock Investment Agent MORNING FRAMEWORK — Variant C (weekly deep).

Follow: .cursor/prompts/MORNING-FRAMEWORK-SEQUENCE.md — all phases 0–6.

PHASE 1: Full news for last 7 days — catch missed post-close · stock-wise 50/50
PHASE 2:
  .\_generate-all-cagr.ps1
  .\_generate-portfolio-cagr.ps1
  cd ..\.cursor\portfolio
  .\_build-pe-averaging-analysis.ps1
  cd ..\..\Report
  .\_generate-all-parameters.ps1 -SkipDetailed
  Refresh portfolio-parameters.md

PHASE 3: Full quadrant-map.md refresh with live CMP · sector comparative ranks if stale
PHASE 6: List top 10 holdings needing PARAMETERS Block B/C deep-fill (like HDFCBANK)

Deliver:
- Week in review (macro + portfolio holdings)
- Surplus deployment table for next month salary
- Stale reports list (summary-analysis date >30 days)
- One paragraph: what changed vs last week in framework ranks

No TRIM/SELL. Long-term mandate.
```

---

## Variant D — Buy / add today (add-on — use with A or C)

Replace `{TICKER}` and optional `{AMOUNT or QTY}`:

```
BUY DECISION today — run full framework for {TICKER}.

After completing latest News read (today summary + TICKER-INDEX):

1. investor-wisdom/buy-decision-workflow.md — all 10 steps
2. investor-wisdom/personal-discipline.md — pause registry
3. stock-analysis SKILL + exclusion-guards
4. Read StockBook/{sector}/{stock}/ — summary · faq · PARAMETERS · PCCL
5. Quotes lens — >=3 quotes from investor-wisdom/quotes.md
6. Verdict: STAGED STARTER OK | ACCUMULATE SIP | WAIT | PAUSE ADDS
7. Write-back: faq.md · summary-analysis.md · suggested-approach.md · News if material

Surplus rank vs quadrant-map.md. Do not suggest selling other holdings to fund this.
```

**Multi-name compare:**

```
Compare fresh surplus deployment: {TICKER1} vs {TICKER2} [vs {TICKER3}].

Run buy-decision-workflow for each · comparative scorecard · state #1 rank for salary ₹ today.
Read latest News + PARAMETERS + quadrant-map. Quotes lens on final verdict.
```

---

## Variant E — Quick numbers only (no news)

**Use when news already done today:**

```
Run PHASE 2 only — portfolio numbers refresh.

.\StockBook\_generate-all-cagr.ps1
.\StockBook\_generate-portfolio-cagr.ps1
.\StockBook\_generate-all-parameters.ps1 -SkipDetailed

Update portfolio-cagr.md summary + portfolio-parameters.md index.
Give: total book return · cost-weighted CAGR · 3 best / 3 worst holdings by CAGR.
```

---

## After manual trade (any time)

```
Update portfolio: bought/sold {TICKER} {QTY} @ Rs {PRICE} on {YYYY-MM-DD}.

Update holdings.md · CAGR_{TICKER}.md new lot · quadrant-map if needed · StockBook write-back.
```

---

## Prompt file maintenance

When framework changes, update **this file** + `MORNING-FRAMEWORK-SEQUENCE.md` registry table.

| Date | Change |
|------|--------|
| 2026-08-29 | Created — news stock-wise loop · PARAMETERS batch · CAGR scripts · 5 variants |

---

*Keep this file open in editor — copy variant into Cursor each morning.*
