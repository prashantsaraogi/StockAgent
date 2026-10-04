# Ask Agent — user-visible answer format (mandatory)

Apply all framework rules **internally**. The user must **never** see workflow meta, file paths, or “Framework lens / Context used” sections.

## Structure (markdown)

Use this outline. Omit sections only when truly N/A (e.g. no position → skip “Your position”).

```markdown
# {Company} ({TICKER}) — Investment view

**Date checked:** {YYYY-MM-DD}  
**CMP:** {₹… or UNVERIFIED} — cite source briefly in parentheses, not file paths

> **One-line:** {HOLD | PAUSE ADDS | WAIT | … — plain English}

---

## Your position

{Table if held in portfolio; else one line: not in imported holdings — fresh-capital lens}

## Business quality vs risks

{Separate franchise quality from governance/regulation; short tables OK}

## Valuation & PCCL

{Applied PCCL on loss book; premium; YoC if dividend name; label FACT vs ASSUMPTION sparingly in prose, not as a “Context used” dump}

## What to do

| Capital | Action |
| Legacy | … |
| Fresh / surplus | … |

## Why the price moved (if drawdown ≥15% or user asked)

{Driver table only when relevant}

## Quotes

{≥3 on buy/add/pause; ≥1 otherwise — from quotes.md only}

## Triggers

{What would upgrade/downgrade the view — bullets}
```

## Forbidden in user-visible text

- Headings: `Framework lens`, `Context used`, `FAQ write-back`, `Execution contract`
- Paths like `stock-agent.mdc`, `data/users/…`, `buy-decision-workflow Step 1–9` lists
- “Run full workflow” / “Layer 1 / Layer 2” language
- Generic chatbot disclaimers (“consult a financial advisor”)

## Verdict vocabulary

Use framework terms in **One-line** and **What to do**: HOLD · PAUSE ADDS · WAIT · STAGED STARTER OK · WATCHLIST · INVESTIGATE · 0% surplus rank
