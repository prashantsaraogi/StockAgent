---
name: legal-threat-analysis
description: >-
  Analyse legal, litigation, tax, and regulatory court risk for Indian
  stocks — proceedings, hearing dates, orders, liability quantification,
  and PCCL impact. Always search latest news and exchange filings when
  asked. Use for Delta Corp-style GST/casino cases, SEBI actions, court
  dates, writ petitions, or when business is good but legal overhang hurts.
---

# Legal Threat Analysis Skill

## Category

**RISK ANALYSIS** — court, tax, SEBI, licence; always search latest news.

See [SKILL-CATEGORIES.md](../SKILL-CATEGORIES.md).

## Purpose

Evaluate **legal and litigation risk** that can destroy or delay
investment returns — even when the underlying business looks good.

Implements `stock-agent.mdc` section 21 (Legal Threat & Litigation).

This skill answers:

> **Is the legal problem temporary noise, a quantifiable liability,
> or a core problem that breaks the thesis?**

A strong business with an **unresolved adverse legal overhang** is not
the same as a strong business with clean legal status. The framework
treats them very differently for PCCL, position size, and averaging.

---

## Core Philosophy

**Good company ≠ safe investment when legal risk is unresolved.**

| Type | Nature | Framework response |
|------|--------|-------------------|
| **Pending / uncertain** | Outcome unknown; hearing dates active | Reduce size; catalyst probability; no averaging until clarity |
| **Adverse but quantifiable** | Loss likely; amount estimable | Lower PCCL by liability; stress-test balance sheet |
| **Adverse and existential** | Licence revoked, business banned, criminal | Core-problem fail — avoid / exit |
| **Favourable / resolved** | Order in company's favour, stay granted | Reassess PCCL upward with evidence |
| **Management downplaying** | “We will win” without order support | Treat as MANAGEMENT CLAIM — verify |

**Legal risk is dynamic.** A hearing on 19 August can change the thesis
on 20 August. Always **search latest news and exchange filings** on
the analysis date.

Do not confuse:

- Stock price falling on legal fear (market reaction)
- One-time provision booked (accounting)
- **Structural destruction of business economics** (regulatory ban, unpayable demand)

---

## Mandatory: Search Latest News

Whenever this skill is invoked — **always**:

1. **Web search** for company name + case keywords + current month/year
2. Check **BSE/NSE corporate announcements** (Reg 30/31 disclosures)
3. Check **cause list / order** only from verified sources — never guess dates
4. State **date checked** and **direction** (escalating / stable / de-escalating)

If user provides a hearing date (e.g. “19 August court date”):

- Verify on cause list or exchange filing or credible legal news
- If **UNVERIFIED**, label it and state what was searched
- Never invent outcomes or next hearing dates

---

## Framework Alignment

Classify every item:

- **FACT** — published order, exchange filing, court cause list, quantified demand
- **MANAGEMENT CLAIM** — “strong grounds to contest”, “confident of favourable outcome”
- **HYPOTHESIS** — inferred probability of win/loss
- **OUR ASSUMPTION** — liability estimate, timeline
- **UNVERIFIED** — social media, rumour, unconfirmed hearing date

Never invent: case numbers, hearing dates, demand amounts, judge names,
or court orders.

---

## When to Use

- User mentions **court date**, hearing, judgment, SLP, writ petition
- **Delta Corp**, gaming, casino, GST, tax demand, retrospective levy
- SEBI show-cause, SAT appeal, NCLT insolvency, ED/CBI matters
- “Business is good but legal is painful”
- Stock cheap — ask **why** — legal overhang candidate
- Before averaging down on legal-hit names
- Regulatory ban / licence cancellation risk
- Class-action or shareholder litigation (rare in India but check)

Always combine with:

- `fundamental-analysis` — can balance sheet absorb liability?
- `pccl-analysis` — legal stress → lower PCCL
- `structural-threat-analysis` — permanent ban vs temporary dispute
- `dynamic-context-analysis` — latest news synthesis

---

## Integration with Other Skills

| Skill | Link |
|-------|------|
| `business-model-analysis` | Does legal issue break the revenue engine? |
| `fundamental-analysis` | Provisions, contingent liabilities, net cash |
| `pccl-analysis` | Legal overhang → lower PCCL; resolution → reassess |
| `valuation-analysis` | Catalyst probability for legal outcomes |
| `structural-threat-analysis` | Ban/substitute = structural; tax dispute may be quantifiable |
| `risk-analysis` | Legal ≠ price volatility |
| `ipo-forensic-analysis` | Post-IPO regulatory surprises |

---

## Step 1 — Identify Every Active Proceeding

List **each** matter separately — do not merge unrelated cases.

| Field | Required |
|-------|----------|
| Case name / authority | e.g. SC, HC, SEBI, GST adjudication |
| Case / SLP / WP number | From filing — or UNVERIFIED |
| Statute / issue | e.g. CGST Act, Gambling Act, SEBI LODR |
| Relief sought | Stay, quash, licence, penalty waiver |
| Amount at stake | Demand, provision, max exposure |
| Status | Pending / Stay granted / Decided / Appeal |
| Next date | Only if verified |
| Company disclosure date | Exchange filing reference |

See [legal-proceedings-checklist.md](legal-proceedings-checklist.md) —
**Delta Corp** (court/tax) and **HDFC Bank** (RBI/governance regulatory register).
Cross-ref banks: `management-governance-analysis/bank-governance-checklist.md`.

---

## Step 2 — Legal vs Business Quality Test

| Question | If YES → legal may be core problem |
|----------|-------------------------------------|
| Can company operate core business if adverse order stands? | |
| Is demand > 2× net cash (consolidated)? | |
| Is licence / approval essential and at risk? | |
| Retrospective levy on past revenue? | |
| Criminal / director disqualification risk? | |
| Repeated adverse orders (pattern)? | |

Separate:

- **Business quality** (operations, brand, cash generation today)
- **Legal overhang** (what could wipe or freeze value)

---

## Step 3 — Classify Legal Threat Type

| Category | Examples | Typical permanence |
|----------|----------|-------------------|
| **Tax / GST** | Retrospective 28% on stakes, transfer pricing | Quantifiable if demand known |
| **Licence / regulatory** | Casino licence, mining lease, telecom spectrum | Often existential |
| **SEBI / market conduct** | Insider trading, disclosure failure | Fine + reputation; rarely existential |
| **Contract / commercial** | Arbitration, client dispute | Usually bounded |
| **Environmental / land** | Mining, infra, plant closure | Can be structural |
| **Promoter / criminal** | ED, CBI, PMLA | High governance risk |
| **Class / shareholder** | Oppression, merger challenge | Case-specific |

---

## Step 4 — Liability Quantification

Build **three liability scenarios** when amount is uncertain:

| Scenario | Assumption |
|----------|------------|
| **Best** | Full win / quash / stay continues / minimal payout |
| **Base** | Partial liability per provision or mgmt estimate |
| **Worst** | Full demand + interest + penalty per authority |

Cross-check:

- Provision already booked (P&L hit may be done)
- Contingent liability note in annual report
- Net cash vs worst-case demand
- Debt covenant / going concern

**Per-share impact:**

```
Liability per share = Total liability (worst) / Diluted shares
Adjusted book / cash per share after stress
```

---

## Step 5 — Catalyst Probability (Legal Outcomes)

Use `stock-agent.mdc` section 12 bands:

| Probability | Typical action |
|-------------|----------------|
| <50% favourable | WAIT — no add on legal hope |
| 50–65% | Small/speculative only if valuation extreme |
| 65–75% | Staged buy if PCCL gap and quantified downside |
| >75% | Stronger only if downside still quantified |

For **binary** court dates (judgment day):

- Define **bull / base / bear** price reaction scenarios
- Predefine action **before** the date — not after panic

---

## Step 6 — Structural vs Dispute Test

| | Temporary dispute | Structural legal destruction |
|--|-------------------|------------------------------|
| Core activity legal post-order? | Yes | No / banned |
| One-time cash hit? | Possibly | N/A — ongoing |
| Moat after resolution? | Intact | Gone |
| PCCL | Lower until clarity; restore if win | Permanently lower / avoid |

Link to `structural-threat-analysis` when law **permanently** changes
industry economics (e.g. online RMG ban, not just one GST notice).

---

## Step 7 — PCCL & Position Sizing

| Situation | Action |
|-----------|--------|
| Unverified hearing / rumour | No action; search filings |
| Stay granted, business operating | Hold; small PCCL haircut for stress |
| Adverse judgment, quantifiable hit | Lower PCCL by per-share liability |
| Existential ban / licence loss | EXIT / avoid — core-problem fail |
| Favourable judgment | Reassess PCCL up — with order text as FACT |
| **Legal overhang** (ops OK, proceedings open) | Three-scenario PCCL; apply `legal-overhang-speculative-sizing.md` — **≤2%** if high-risk |
| **Existential demand** (> net worth worst case) | **AVOID** fresh; **TRIM** if held |

**Never average down** because:

- Legal stock fell sharply
- User believes “business is good”
- Hearing is “tomorrow” without quantified downside
- **One provision booked** while other demands remain open

For **good operations + unresolved law** (Delta Corp pattern): always run
[legal-overhang-speculative-sizing.md](legal-overhang-speculative-sizing.md).

---

## Step 8 — Dynamic Monitoring Triggers

Re-run full legal search when:

- User-provided or verified **hearing date** arrives
- New **exchange Reg 30** legal disclosure
- **Order uploaded** on court / tribunal site
- Material **news** on case outcome
- **Provision revision** in quarterly results

Output must include:

```
View as of [date]: [summary]
Would upgrade if: [e.g. SC stay extended, demand cut 50%]
Would downgrade if: [e.g. adverse order, licence cancelled]
Next verified date/event: [or UNVERIFIED]
```

---

## Required Output

### Legal Snapshot (as of date checked)
Active matters count; net direction (escalating / stable / improving).

### Proceeding Register
Table: case, authority, amount, status, next date, source.

### Business vs Legal Separation
What works operationally vs what legal could break.

### Liability Scenarios
Best / base / worst; per-share impact; vs net cash.

### Catalyst Probability
Favourable outcome band with evidence.

### Structural vs Dispute Verdict

### PCCL / Thesis Impact
Raise, hold, lower; ADD/HOLD/TRIM/AVOID/WAIT.

### Pre-Event Action Plan (if hearing date)
Actions for favourable / adverse / mixed outcomes **before** the event.

### Key Observations

### Evidence & Assumptions

### Limitations
Unverified dates, undisclosed matters, incomplete order text.

---

## Important Rules

Never:

- Invent hearing dates or case outcomes
- Assume win because management is confident
- Treat provision booking as “legal problem over” (appeals may continue)
- Ignore separate proceedings (GST + licence + SEBI are different)
- Buy before binary court event without defined downside and size limit

Always:

- Search latest news and exchange filings on analysis date
- Quote order / filing date when citing status
- Separate good business from unresolved legal overhang
- Lower PCCL or WAIT when worst-case liability impairs balance sheet
- Connect legal outcome to sustainable earnings — not just one-day price move

---

## Additional Resources

- Proceeding types, **Delta Corp register (Aug 2026)**, HDFC regulatory register: [legal-proceedings-checklist.md](legal-proceedings-checklist.md)
- **Legal overhang position sizing (Delta pattern):** [legal-overhang-speculative-sizing.md](legal-overhang-speculative-sizing.md)
- Bank governance (HDFC pattern): `management-governance-analysis/bank-governance-checklist.md`
- **Fraud / mis-selling / ED (HDFC Dubai, Kotak):** `fraud-detection-analysis/fraud-register-template.md`
