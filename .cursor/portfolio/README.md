# Portfolio Record

Persistent holdings for the India Stock Investment Agent.

## Morning framework (daily)

Copy-paste into Cursor each morning:

| File | Use |
|------|-----|
| [**MORNING-RUN-PROMPT.html**](../prompts/MORNING-RUN-PROMPT.html) | **Daily prompts in browser** — tabs + Copy buttons (preferred) |
| [MORNING-RUN-PROMPT.md](../prompts/MORNING-RUN-PROMPT.md) | Markdown source — use HTML if preview fails |
| [MORNING-FRAMEWORK-SEQUENCE.md](../prompts/MORNING-FRAMEWORK-SEQUENCE.md) | Ordered phases 0–6 + component registry |

**Variant A (early morning):** news partial → CAGR + parameters scripts → surplus brief → file write-back.

## Files

| File | Purpose |
|------|---------|
| [holdings.md](holdings.md) | **Master record** — qty, avg cost, lots, last framework action, PCCL |
| [quadrant-map.md](quadrant-map.md) | **Capital vs gain quadrants** + **dynamic surplus % snapshot** — refresh after trades or news |
| [portfolio-cagr.md](portfolio-cagr.md) | Combined holding CAGR dashboard (refresh via morning Phase 2) |
| [portfolio-parameters.md](portfolio-parameters.md) | P/E vs 10Y index for all holdings |
| [portfolio-dividend-rank.md](portfolio-dividend-rank.md) | **YoC top 10 + absolute ₹ top 10** (low YoC) · [dividend-fy26.json](dividend-fy26.json) |
| [broker-target-prices.md](broker-target-prices.md) | **Broker 12M target prices** (ICICI, Motilal, Kotak, avg) |
| [BROKER-TARGET-FRAMEWORK.md](BROKER-TARGET-FRAMEWORK.md) | Methodology + refresh script |

## Dynamic allocation rule

Surplus ₹ is **not** split equally across holdings. It flows by **relative potential today**:

- **Within sector:** e.g. ICICI 70% / HDFC 30% of bank slice; PNB 0% fresh
- **Across sectors:** e.g. hospitals 25–30% when growth KPIs strong; IT 0% when paused

Ranks **change** when oil, tariffs, RBI, geo, monthly KPIs, or results shift.
Method: [`dynamic-capital-allocation.md`](../skills/portfolio-analysis/dynamic-capital-allocation.md)

## Agent rule

When the user asks about **holdings, add/hold/trim, portfolio review, or position sizing**:

1. **Read `holdings.md` first** — do not rely on chat memory alone
2. For **allocation / where to add** questions, also read **`quadrant-map.md`** and run **latest news scan** via `dynamic-context-analysis`
3. Apply **`dynamic-capital-allocation.md`** for sector % and peer ratios
4. Fetch **current CMP** on analysis date
5. Update `holdings.md` when user confirms a **new buy, sell, or cost correction**
6. **Update that stock's `StockBook/` files** after any add/hold/PCCL discussion (see `StockBook/AGENT-RULES.md`)
7. **Recalculate and update `quadrant-map.md`** when holdings, CMP, or **material context** changes
8. Never invent quantities — if missing, ask or label UNVERIFIED

## User rule

After any trade, tell the agent: *"Update portfolio: bought/sold [ticker] [qty] @ [price]"*

Or edit `holdings.md` directly. Then ask: *"Refresh quadrant map"* to update [quadrant-map.md](quadrant-map.md).

Cross-ref: `portfolio-analysis/SKILL.md`, `stock-agent.mdc` sections 13–15, [`StockBook/AGENT-RULES.md`](../../StockBook/AGENT-RULES.md).
