---
name: structural-threat-analysis
description: >-
  Assess structural threats to an Indian company — AI disruption, new
  competitors, substitute products, permanent industry change — and
  distinguish permanent structural risk from temporary crisis. Use when
  the user asks about AI threat, disruption, competition, moat erosion,
  or whether a headwind is cyclical vs permanent.
---

# Structural Threat Analysis Skill

## Category

**RISK ANALYSIS** — AI, disruption, new competition; crisis vs permanent structural change.

See [SKILL-CATEGORIES.md](../SKILL-CATEGORIES.md).

## Purpose

Identify and evaluate **external threats** that can permanently alter
a company's economics — not just cause a temporary downturn.

Implements `stock-agent.mdc` section 19 (Structural Threat & Disruption).

This skill answers:

> **Is this a crisis that passes, or a structural change that stays?**

A great business facing a **permanent structural threat** is not the
same as one facing a **cyclical crisis**. The framework treats them
very differently for PCCL, holding period, and capital allocation.

---

## Core Philosophy

**Not every threat is a crisis. Not every crisis is structural.**

| Type | Nature | Framework response |
|------|--------|-------------------|
| **Cyclical crisis** | Temporary — reverts when cycle/policy/market normalises | Core-problem test; may hold/add at PCCL if moat intact |
| **Structural threat** | Permanent industry or competitive shift | Lower PCCL; reduce conviction; require adaptation evidence |
| **Transitional** | Unclear — may become structural | Monitor KPIs; staged exposure only |

**Structural change can remain forever.** AI substitution, platform
shifts, or new substitute products are not "one bad quarter" events.

Do not confuse:

- Stock price falling (market reaction)
- Earnings temporarily weak (cyclical)
- **Moat permanently impaired** (structural)

---

## Framework Alignment

Classify every conclusion as:

- **FACT** — verified market share loss, disclosed competitor, regulation enacted
- **MANAGEMENT CLAIM** — "we are AI-ready", "no impact expected"
- **HYPOTHESIS** — inferred threat path
- **OUR ASSUMPTION** — timeline or severity estimate
- **UNVERIFIED**

Never invent competitor data, AI impact statistics, or market-share figures.

---

## When to Use

- User asks about **AI threat** to a company or sector
- New competitor, product, or service entering the market
- "Is this disruption permanent or temporary?"
- Moat erosion from technology or business-model shift
- Before raising PCCL on a "quality" name facing industry change
- IT, BPO, pharma services, AMC, media, retail — any sector in flux

Always run alongside `business-model-analysis`. Threat analysis explains
**what could break the model**; business model explains **how it works today**.

---

## Integration with Other Skills

| Skill | Link |
|-------|------|
| `business-model-analysis` | Threat impact on revenue engine and KPIs |
| `pccl-analysis` | Structural threat → lower PCCL; crisis alone may not |
| `valuation-analysis` | Permanent threats reduce sustainable earnings assumptions |
| `fundamental-analysis` | Early evidence in margins, share, customer metrics |
| `risk-analysis` | Structural risk ≠ price volatility |
| `ipo-forensic-analysis` | New-age IPOs often assume threats won't materialise |
| `dynamic-context-analysis` | Geo/policy often temporary; distinguish from structural threat |

---

## Step 1 — Identify the Threat

Name the threat precisely:

| Threat type | Examples |
|-------------|----------|
| **AI / automation** | GenAI replaces coding, support, content, research, diagnosis assist |
| **New competitor** | Lower-cost entrant, well-funded startup, global player entering India |
| **Substitute product/service** | Direct plans vs distributors, passive vs active, generics vs branded |
| **Platform shift** | Mobile vs web, marketplace vs owned channel, cloud vs on-prem |
| **Customer behaviour** | Permanent channel shift, generational preference, price sensitivity |
| **Commoditisation** | Pricing race to bottom, feature parity, regulator-mandated fee cuts |
| **Technology obsolescence** | Product line replaced by new standard |
| **Regulatory structural** | Permanent rule change — not a one-time fine or notice |

See [threat-templates.md](threat-templates.md) for sector examples including AI.

---

## Step 2 — Structural vs Crisis Test

Ask these questions:

| Question | Crisis (temporary) | Structural (permanent) |
|----------|-------------------|------------------------|
| Will demand for core product **return** to prior levels? | Likely yes | Unlikely — new equilibrium |
| Is the **moat** intact after conditions normalise? | Yes | No — eroded or bypassed |
| Is a **substitute** gaining permanent share? | No — cyclical switching | Yes — habit/platform shift |
| Duration | Quarters | Multi-year / irreversible |
| Recovery pattern | V-shaped in earnings | L-shaped or step-down |
| Pricing power | Restored post-cycle | Permanently reduced |

**AI-specific test:**

| AI role | Usually cyclical/adoption | Usually structural |
|---------|---------------------------|------------------|
| Efficiency tool for same business | ✅ Productivity gain | |
| Replaces **core** human-delivered service | | ✅ Revenue at risk |
| Commoditises the company's main output | | ✅ Margin compression |
| Enables new entrant with 10× lower cost | | ✅ Share loss |

If **structural**, treat as core-problem candidate until management
**proves adaptation with numbers** — not slides.

---

## Step 3 — Threat Path Analysis

Map the transmission mechanism:

```
Threat emerges
    → Impact on volume / price / mix
    → Impact on margins
    → Impact on moat (distribution, brand, cost, switching)
    → Impact on sustainable EPS
    → Impact on PCCL
```

For each step, cite **evidence or mark UNVERIFIED**.

---

## Step 4 — Who Wins / Loses

| Stakeholder | Assessment |
|-------------|------------|
| Incumbent (company analysed) | Advantaged / Neutral / Disadvantaged |
| New entrant / substitute | Why they win |
| Customer | Why they switch or stay |
| Regulator | Helps or hurts structural shift |

---

## Step 5 — Evidence in Numbers

Look for early structural signals (FACT only when verified):

- Market share loss **≥2 consecutive periods** without cyclical explanation
- Margin decline while peers stable (suggesting company-specific erosion)
- Customer/user metric deterioration (churn, ARPU, volumes)
- Rising share of low-margin or commoditised revenue mix
- Capex/R&D rising just to **stand still** (running to stay in place)
- Management guidance repeatedly cut on "industry structural" grounds

**One bad quarter is not structural proof.**

---

## Step 6 — Management Response Credibility

| Response | Credibility check |
|----------|-------------------|
| "No impact" | Require disconfirming data review — often a red flag |
| "AI will help us" | Evidence: productivity, new products, margin improvement |
| Pivot / new product | Revenue contribution, not press release |
| Cost cut only | May protect margins short-term; doesn't restore moat |
| Acquisition | Integration track record; not desperation buying |

Rate management response: **Credible / Mixed / Not credible / Too early to tell**

---

## Step 7 — Threat Severity & Permanence Ratings

### Severity (impact if threat fully materialises)

| Level | Meaning |
|-------|---------|
| **Low** | Peripheral to revenue; efficiency tailwind possible |
| **Moderate** | Partial revenue/margin pressure; moat partially affected |
| **High** | Core earnings engine threatened |
| **Critical** | Business model may not survive in current form |

### Permanence

| Class | Meaning | PCCL implication |
|-------|---------|------------------|
| **Temporary (crisis)** | Cyclical, regulatory one-off, short-lived competition | PCCL unchanged if core-problem test passes |
| **Transitional** | Direction clear but pace uncertain | Hold PCCL; require monitoring triggers |
| **Permanent (structural)** | Industry rewrite, substitute wins | **Lower PCCL** unless adaptation evidenced |

---

## Step 8 — PCCL & Investment Implication

| Situation | Action |
|-----------|--------|
| Crisis only, moat intact | PCCL may hold; staged buy at PCCL if core-problem test passes |
| Transitional threat | Smaller position; watchlist; define KPI triggers |
| Permanent structural, no adaptation | **Lower PCCL**; avoid high conviction; reassess hold |
| Permanent threat, proven adaptation | PCCL can rise **only with numerical proof** |

Never raise PCCL because management says "AI is an opportunity" without
revenue, margin, or share evidence.

---

## Required Output

### Threat Summary
What is the threat, who originates it, why now.

### Structural vs Crisis Verdict
Temporary / Transitional / Permanent — with evidence.

### Threat Path
Volume → price → margin → moat → EPS impact chain.

### Winners & Losers

### Evidence in Numbers
Facts vs claims; early warning metrics.

### Management Response
Credibility rating.

### Severity & Permanence
Low/Moderate/High/Critical + Temporary/Transitional/Permanent.

### Moat Impact
Which moat sources are affected (scale, brand, switching, cost, etc.).

### PCCL / Thesis Impact
Raise, hold, or lower PCCL; HOLD/ADD/TRIM/AVOID implication.

### Monitoring Triggers
Quarterly KPIs that confirm or refute structural thesis.

### Key Observations

### Evidence & Assumptions

### Limitations

---

## Important Rules

Never:

- Call every new technology a permanent threat without analysis
- Dismiss structural threats as "already priced in" without evidence
- Treat AI narrative as FACT without company/industry data
- Confuse temporary earnings weakness with moat destruction
- Ignore threats because the stock was a long-term compounder

Always:

- Separate **crisis** from **structural change**
- Link threats to business model and sustainable earnings
- Lower PCCL when permanent impairment is plausible and unmitigated
- Require numbers to upgrade thesis after a structural threat emerges

---

## Additional Resources

- Sector threat patterns and AI checklist: [threat-templates.md](threat-templates.md)
