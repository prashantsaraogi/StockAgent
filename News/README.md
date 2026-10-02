# News — Dynamic context for stock analysis

**Purpose:** Persist **date-stamped** macro and stock-specific news that can change thesis, PCCL, SIP pace, or surplus rank — so analysis is not stale.

> **Agent:** Read [`AGENT-RULES.md`](AGENT-RULES.md) before any stock analysis.  
> **User:** Browse by month → date for what changed on a given day.

## Folder structure

```
News/
├── AGENT-RULES.md          — Read/update rules (mandatory for agent)
├── README.md               — This file
├── TICKER-INDEX.md         — Quick lookup: ticker → news dates
└── YYYY-MM/                — Month (e.g. 2026-08)
    └── YYYY-MM-DD/         — Calendar date checked
        └── summary.md      — Daily digest (macro + portfolio impacts)
```

Optional later: `sources.md` per date for URLs; sector sub-files if volume grows.

## What goes in `summary.md`

One file per **analysis date**, structured:

1. **Macro & policy** — GDP, inflation, RBI, oil, INR, FII (if material)
2. **Geopolitical** — Middle East, tariffs, sanctions (status + direction)
3. **Portfolio impact table** — only names **you hold** where news moves thesis
4. **Sector bands** — High / Medium / Low / Pause (links to `dynamic-capital-allocation.md`)
5. **Triggers** — what headline would upgrade/downgrade the view

## Integration

| File | Role |
|------|------|
| `News/` | **What changed in the world** (dated) |
| `StockBook/[Stock]/` | **What it means for this stock** (thesis, SIP, PCCL) |
| `quadrant-map.md` | Surplus rank after material news |
| `dynamic-context-analysis` skill | Workflow for live search + News folder |

**Rule:** Material news → update **News summary** + affected **Report** files + **TICKER-INDEX** in same session.

## Current coverage

| Month | Dates |
|-------|-------|
| [2026-08](2026-08/) | [2026-08-24](2026-08/2026-08-24/summary.md) · [2026-08-23](2026-08/2026-08-23/summary.md) |
