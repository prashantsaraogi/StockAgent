---
name: price-decline-analysis
description: >-
  Explain why an Indian stock fell from its recent high — peak price, date,
  % decline, driver table (FACT vs narrative), structural vs temporary,
  and PCCL implication. Use when a stock is down 15%+ from highs, user asks
  why it fell, or before averaging after a drawdown.
---

# Price Decline Analysis Skill

## Category

**RISK ANALYSIS** — attributes drawdowns to verified drivers before buy/hold/add.

See [SKILL-CATEGORIES.md](../SKILL-CATEGORIES.md).

Implements `stock-agent.mdc` section 22 (Price Decline Attribution).

Companion to section 9 (Core-Problem Test): **"Why is it cheap?"** becomes
**"Why did it fall X% from ₹Y on [date]?"** with evidence.

---

## Purpose

When a stock has fallen materially from a recent peak, **name every major
driver** — do not hand-wave "market sentiment."

This skill answers:

> **Why did the stock fall ~X% from ₹[peak] ([date]) — and is that reason
> temporary, structural, or already priced in?**

Required before:

- Recommending **ADD / average** after a drawdown
- Calling a fall a **"bargain"**
- **Raising or lowering PCCL** after a crash

A 30% fall is NOT one reason. It is usually **several drivers** stacked.

---

## When to Run (mandatory triggers)

Run whenever **any** of:

- Stock down **≥15%** from 52-week or 6-month high
- User asks **"why did it fall?"** or **"should I average?"**
- Stock at **52-week low** or multi-year low
- Post-results **gap down** >5%
- Approaching **PCCL** after prior high valuation

**Always search latest news** on analysis date for result-day and
post-result commentary.

State:

- Peak price and **date** (FACT from price history)
- Current price and **% decline**
- Period of decline (weeks / months)

---

## Required output format (use this heading)

```markdown
## Why the stock fell ~X% from ₹[peak] ([month year])

| Driver | Type |
|--------|------|
| [Specific driver 1] | FACT / MANAGEMENT CLAIM / HYPOTHESIS / UNVERIFIED |
| [Specific driver 2] | ... |

**Core-problem test:** [One paragraph — broken vs adjusting vs priced in]
**PCCL / action implication:** [Hold / wait / lower PCCL / staged add zone]
```

See [decline-drivers-template.md](decline-drivers-template.md) for sector
examples including Muthoot Finance pattern.

---

## Step 1 — Measure the decline

| Field | Required |
|-------|----------|
| Peak price | ₹ — with date |
| Current price | ₹ — date checked |
| Absolute fall | ₹ |
| Percentage fall | % |
| 52-week high / low | For context |
| vs 3-month / 6-month high | If different from 52W |

**Separate:**

- Fall from **user's cost** (portfolio emotion — not a thesis driver)
- Fall from **recent peak** (market repricing — this skill)

---

## Step 2 — Build the driver table

List **3–8 drivers**, most important first. Each row = one distinct cause.

### Driver categories (search all)

| Category | Examples |
|----------|----------|
| **Earnings / guidance** | Miss, margin compression, one-off gain reversal |
| **Valuation / rerating** | Prior P/E unsustainable; de-rating after peak |
| **Policy / tax / regulatory** | ITC cigarette tax; RBI NBFC norms |
| **Competition** | Pricing war; share loss |
| **Legal / litigation** | Court order, tax demand |
| **Structural / disruption** | AI, substitute, permanent mix shift |
| **Macro / geo / flows** | FII sell, oil, INR, rate cycle |
| **Sector rotation** | IT pack derating; defensives out of favour |
| **Corporate action** | Demerger distortion, bonus, index exclusion |
| **Technical / liquidity** | Low float squeeze reversal, block sale |

### Type column (mandatory)

| Label | Use when |
|-------|----------|
| **FACT** | Reported number, filed order, verified price/date |
| **MANAGEMENT CLAIM** | Concall explanation without full verification |
| **HYPOTHESIS** | Analyst inference, plausible but not confirmed |
| **OUR ASSUMPTION** | Scenario we apply for valuation |
| **UNVERIFIED** | Rumour; needs search |

**Never** put "market correction" alone as a row — decompose it.

---

## Step 3 — Structural vs temporary (per driver)

For each **major** driver:

| Driver | Temporary / cyclical | Structural / permanent |
|--------|---------------------|------------------------|
| | | |

Then overall verdict:

| Verdict | Meaning |
|---------|---------|
| **Mostly temporary** | Earnings/normalization; moat intact → may add at PCCL |
| **Mixed** | Some permanent margin/regulatory shift → lower PCCL |
| **Mostly structural** | Core economics impaired → avoid averaging; investigate exit |
| **Already priced in** | Fall matches known bad news → need **new** info to rerate |

Link to `structural-threat-analysis` and `legal-threat-analysis` when relevant.

---

## Step 4 — Separate narrative from numbers

Common traps:

| Trap | Fix |
|------|-----|
| Headline PAT % looks catastrophic | Check one-offs (ITC hotel demerger gain) |
| Stock fell but AUM/revenue grew | Explain margin/yield/multiple compression |
| "Cheap vs peak" | Compare to **forward** normalized EPS, not peak EPS |
| User cost >> CMP | User loss is not why **market** sold |

Cross-check fall with:

- Did **forward EPS estimates** get cut? By how much?
- Did **P/E** compress, **EPS** fall, or **both**?
- Peer same-sector move — idiosyncratic or sector-wide?

---

## Step 5 — Connect to PCCL and averaging rule

After driver table, state explicitly:

```
Fall attributed to: [top 2 drivers]
Already in stock price? [Yes / Partial / No — evidence]
Core-problem status: [Pass / Investigate / Fail]
Average at CMP? [Yes / No / Staged only at ₹X — framework reason]
```

**Never recommend averaging** solely because:

- Stock fell 20–40% from peak
- User is underwater vs cost
- P/E looks low vs historical peak earnings

**Staged add** only when:

- Drivers are **mostly temporary** OR **fully priced in**
- CMP at or **below PCCL**
- Quantified downside if bear driver worsens

---

## Step 6 — Dynamic update

Decline attribution **changes** when:

- New quarterly results confirm/refute driver
- Policy/legal order
- Management guidance revision
- Peer results (sector vs stock-specific)

Re-run table after each material event. State:

**"View as of [date]; would change if [driver] [evidence]."**

---

## Integration with other skills

| Skill | Link |
|-------|------|
| `pccl-analysis` | Fall may lower or justify PCCL |
| `valuation-analysis` | Peak P/E vs current; normalized EPS |
| `fundamental-analysis` | Which line items drove miss |
| `dynamic-context-analysis` | Macro/geo/flow drivers |
| `structural-threat-analysis` | Permanent drivers |
| `legal-threat-analysis` | Litigation drivers |
| `portfolio-analysis` | User cost vs market fall |

---

## Important rules

Never:

- Skip this section when stock is down big from highs
- Use vague drivers ("weak sentiment", "profit booking")
- Invent peak dates or % fall
- Treat all declines as buying opportunities

Always:

- Use the **standard heading** and **driver table**
- Classify each driver by evidence type
- End with **core-problem test** + **PCCL/average implication**
- Search latest news on analysis date

---

## Additional resources

- Sector patterns and worked examples (Muthoot, ITC, TCS, **HDFC Bank**): [decline-drivers-template.md](decline-drivers-template.md)
- Bank governance overlay: `management-governance-analysis/bank-governance-checklist.md`
