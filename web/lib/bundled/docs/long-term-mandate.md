# Long-Term Investor Mandate

**User profile:** Multi-decade wealth builder — portfolio assembled over many years.
**Goal:** Compound **quantity × business quality × time** — not trading, rotation, or profit-booking.

Implements user preference in `stock-agent.mdc` and `portfolio-analysis/SKILL.md`.

Cross-ref: `salary-systematic-accumulation.md`, `premium-add-sizing.md`,
`pccl-analysis/pccl-as-protection-not-target.md`, `StockBook/AGENT-RULES.md` (report vocabulary),
`investor-wisdom/personal-discipline.md`, `investor-wisdom/quotes.md`,
`investor-wisdom/buy-decision-workflow.md`.

---

## Report vocabulary (when writing `StockBook/` files)

Use **HOLD · ADD · PAUSE ADDS** only. Never list TRIM/SELL as action rows.
If user asks about profit-booking or rotation → **HOLD** + deploy fresh capital elsewhere.

## Core principle

```
Wealth ≈ Quantity held × (Future value − Average cost)
```

The agent optimizes for **where to deploy new capital** and **at what pace**
(tier 1–5) — **not** for selling winners, rebalancing weights, or waiting for
crash before every add.

**Continuous SIP:** Thesis-intact quality names get **monthly adds forever**
at tier pace — token at very expensive, accelerate at best cost. PCCL + blended
avg cap protect the book.

See `pccl-analysis/continuous-sip-valuation-tiers.md`.

---

## Default actions (existing holdings)

| Situation | Default action | Not suggested |
|-----------|----------------|---------------|
| Thesis intact, any valuation | **HOLD** | TRIM, SELL, REPLACE |
| Thesis intact, fair/expensive CMP | **HOLD**; salary DCA if user wants scale | Sell to "free up" capital |
| Underweight quality winner | **ADD** (size-capped DCA) | — |
| Overweight vs index norms | **HOLD**; **slow tier-1 SIP** or pause **pace upgrade** only | TRIM because % weight high |
| Expensive + large unrealized gain | **HOLD**; **token tier SIP** if Strong quality | Book profits / trim |
| Better opportunity elsewhere | **Rank fresh capital** to new name | Sell existing to buy other |
| Cyclical weakness, moat intact | **HOLD**; optional add below PCCL | Sell on bad quarter |
| Stock down ≥15% | **Price-decline analysis** → add or hold | Average blindly; sell on fear |

**Never use:** "replace Max with Manipal", "trim to redeploy", "sell half to rebalance",
"take profits", "reduce allocation" — unless **existential sell criteria** below pass.

---

## When SELL / EXIT is allowed (only these)

Recommend **SELL or EXIT** only when evidence shows a **structural, permanent**
impairment — not temporary valuation, cyclical earnings, or portfolio housekeeping.

### Tier 1 — Mandatory exit review (strong sell case)

| Trigger | Examples |
|---------|----------|
| **Accounting fraud / proven misstatement** | Restated accounts, auditor qualification for fraud |
| **Systemic integrity failure** | Multi-year concealment; regulator finding vs management denial |
| **Existential legal/regulatory loss** | Licence ban, business model outlawed, existential GST/court loss **without** viable path |
| **Permanent moat destruction** | Competitor structurally wins; economics permanently impaired (not 2–3 bad quarters) |
| **Persistent loss + broken model** | Exclusion guard: PAT negative 3+ of 4Q, TTM loss, no credible recovery |

### Tier 2 — Investigate deeply; sell only if structural verdict

| Trigger | Requirement before sell |
|---------|-------------------------|
| Structural threat (AI, disruption) | Numerical evidence moat **does not** survive; management not adapting |
| Legal overhang | **Existential** class (>1× net worth worst case) or licence loss — see legal-overhang sizing |
| Governance (non-fraud) | Pattern of minority harm + deteriorating numbers — not single headline |
| Heavy debt distress | Default risk, covenant breach, forced asset sale |

### Not sufficient for sell (use HOLD + pause adds)

- High P/E, premium to PCCL, overweight position
- Broker downgrade, one weak quarter
- Sector rotation, "BofA underweight"
- Opportunity cost vs another stock
- Post-IPO OFS, insider selling alone
- Temporary cyclical (OMC, metals) unless model broken

---

## Fresh capital vs existing holdings (dual lens)

| Question | Lens |
|----------|------|
| "Should I sell X to buy Y?" | **Decline** — rank **Y for new money only**; X stays HOLD unless Tier 1 exit |
| "Which stock for monthly salary?" | Comparative scorecard on **surplus only** |
| "I'm overweight in X" | **Pause adds** on X; deploy surplus elsewhere — **do not trim X** |
| "Stock is up 400%" | **HOLD** — congratulate thesis; size-cap **future** adds only |

---

## Output language

**Use:** HOLD · ADD · PAUSE ADDS · WAIT (no position) · EXIT (existential only)

**Avoid for this user:** TRIM · REDUCE · ROTATE · REPLACE · TAKE PROFITS · REBALANCE (unless user explicitly asks for rebalancing math)

If concentration exceeds 20% in one name, say:

> "Position is large — **pause new adds** and deploy surplus to next-ranked name.
> **No sell suggested** unless structural exit criteria trigger."

---

## Overrides (still apply)

These **hard rules** override the no-trim mandate for **new capital** (not forced sell):

- **Exclusion guards** — never fresh BUY on penny / heavy debt / persistent loss
- **Legal lottery ticket** — no add on high-risk legal names; **hold** legacy unless existential
- **Fraud hard exclude** — EXIT review mandatory if accounting fraud confirmed

---

## User confirmation phrase

User may restate in chat:

> "Long-term investor — no trim/sell except existential business threat."

Agent must read this file when giving HOLD/ADD/SELL on **any existing holding**.
