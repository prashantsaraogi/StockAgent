---
name: ipo-forensic-analysis
description: >-
  Forensic IPO analysis for Indian listings — primary vs secondary,
  lock-in, insider selling, post-IPO earnings vs narrative, and
  structural risk vs manipulation. Use for Paytm, Eternal, recent IPOs,
  or "was this IPO a set game" questions.
---

# IPO Forensic Analysis Skill

## Category

**FORENSIC & SPECIAL SITUATIONS** — post-IPO risk transfer, A–L test.

See [SKILL-CATEGORIES.md](../SKILL-CATEGORIES.md).

## Purpose

Forensically analyze companies that listed through an IPO to assess
whether public shareholders inherited excessive execution or valuation
risk — and whether post-IPO problems indicate structural transfer,
concealment, or misrepresentation.

This skill implements `.cursor/rules/stock-agent.mdc` section 7 and
extends it with a structured pre-investment and post-listing test.

Use when:

- Analyzing a recent or past IPO stock
- User asks whether an IPO was a "set game" or manipulation
- Reconstructing Paytm, Eternal/Zomato, or similar new-age listings
- Evaluating whether to buy/hold/avoid a post-IPO company
- Lock-in expiry, promoter selling, or post-IPO regulatory events appear

---

## Core Philosophy

Separate **structural incentives** from **deliberate manipulation**.

It is understandable why an IPO can look like a **"set game"**,
especially when several problems appear after listing. But do not
conflate structural risk transfer with proven fraud.

### Why risks often become visible after IPO

There are several mechanisms that naturally create this pattern:

1. **IPO happens near a high-growth narrative peak.**
   The company and its bankers have an incentive to present the strongest
   credible future-growth case. Public investors then value the company
   on future earnings rather than current cash generation.

2. **Early investors have a different time horizon.**
   Founders/VCs may have invested years earlier at much lower valuations.
   Once lock-ins expire, they can partially monetise. They don't
   necessarily need the stock to keep compounding for 10 years.

3. **Public shareholders inherit execution risk.**
   Before IPO, private investors can negotiate information rights, board
   representation and preferential terms. After IPO, ordinary shareholders
   have much less influence.

4. **The company now has to deliver the projections.**
   A 30–40% growth story becomes much harder when the company has to
   grow from a larger base, competition increases and profitability
   becomes important.

5. **Regulatory problems can surface later.**
   This doesn't necessarily mean they were hidden deliberately. A business
   can operate for years and then encounter a new regulation,
   interpretation, inspection or enforcement action.

6. **Valuation makes the downside asymmetric.**
   If a ₹1,000 company is valued assuming 30% growth, even a perfectly
   legitimate slowdown to 15% can destroy a large amount of market value.

### Stronger conclusion (not automatic fraud)

> **The IPO can transfer a large portion of future-execution and
> valuation risk from early investors to public shareholders.**

That is absolutely something we should protect against.

This fits the India Stock Investment Framework.

### 🚨 "Post-IPO problem" ≠ automatically "IPO game"

We need evidence that the problem was **known, concealed,
misrepresented, or structurally transferred to public investors**
before calling it manipulation.

This prevents becoming overly cynical **and** protects against naivety.

---

## When to Apply

| Situation | Apply skill? |
|-----------|--------------|
| Company listed within last 5 years | **Yes — full test** |
| Company listed 5–10 years ago, post-IPO issues active | **Yes — reconstruction** |
| Mature listing (10Y+), IPO history irrelevant to thesis | **Brief summary only** |
| OFS-only IPO (no primary capital) | **Yes — emphasize seller analysis** |
| User asks "was this IPO a scam/game?" | **Yes — evidence-based answer** |

Pay special attention to new-age companies whose valuations depend
heavily on future growth rather than proven cash earnings.

---

## Pre-Investment IPO Forensic Test (A–L)

Ask **before buying** any post-IPO stock. For existing holdings,
re-run when new post-IPO evidence emerges.

### A. What was the company's valuation at IPO?

- Issue price, implied market cap, P/E, P/S, EV/Sales
- Compare vs contemporaneous earnings and cash flow
- Compare vs listed peers at time of IPO

### B. What percentage of IPO proceeds went to the company vs existing shareholders?

- Primary (fresh issue) vs secondary (OFS)
- **High secondary %** = public buying out early investors

### C. Who is selling—founder, PE/VC, ESOP trust?

- Name each seller and shares/% sold
- Track whether sellers were also buyers pre-IPO

### D. What happens when lock-in expires?

- Lock-in dates for promoters, anchors, PE/VC
- Schedule of potential supply overhang
- Actual selling post lock-in (FACT from exchange filings)

### E. Were profits/cash flow already proven?

- PAT positive? Operating cash flow positive?
- How many years of profitable history before IPO?
- **Negative earnings + high valuation = extreme execution risk**

### F. Is the growth assumption realistic today?

- Compare IPO-era growth narrative vs actual results since listing
- Revenue, EPS, cash flow vs prospectus/implied assumptions

### G. What happens if growth is only half the projected rate?

- Scenario: halve growth → recalculate fair value
- Quantify downside if narrative breaks

### H. Are key employees leaving after IPO?

- CEO, CFO, CTO, founders, compliance heads
- Timing relative to lock-in and results

### I. Are related-party transactions increasing?

- RPT as % of revenue or expenses
- New RPT categories post-IPO
- Auditor/ board oversight changes

### J. Is SBC/dilution increasing?

- ESOP charge as % of revenue
- Fully diluted share count vs basic
- Repeated ESOP allotments post-IPO

### K. Are regulatory/legal problems emerging?

- SEBI, RBI, sector regulator actions
- Court cases, tax disputes, licence issues
- Distinguish new regulation vs pre-existing concealment

### L. Does management still have meaningful skin in the game?

- Promoter/founder ownership today vs at IPO
- Pledge status
- Insider buying vs selling pattern

---

## Post-Listing Reconstruction Timeline

For forensic review (e.g. Paytm, Eternal/Zomato), reconstruct:

```
IPO date & price
    ↓
Promoter/VC ownership at IPO → today
    ↓
Lock-in expiry dates
    ↓
Actual insider/VC selling (with dates & volumes)
    ↓
Management exits (with dates)
    ↓
Earnings trajectory vs IPO narrative
    ↓
Regulatory/legal events (with dates)
    ↓
SBC/dilution & RPT trends
    ↓
Verdict: structural risk vs evidence of manipulation
```

Use primary sources: prospectus/RHP, exchange filings, shareholding
pattern, insider trading disclosures, quarterly results.

See [reconstruction-checklist.md](reconstruction-checklist.md) for
the data table template.

---

## Manipulation vs Structural Risk

| Finding | Likely classification |
|---------|----------------------|
| Growth slowed from 35% to 15%; stock fell 50% | **Structural / valuation** — not fraud |
| Lock-in expired; VCs sold | **Structural incentive** — not fraud alone |
| New regulation hurt business model | **Policy risk** — investigate if disclosed |
| Revenue inflated; auditor resigned; restatement | **Possible misrepresentation** |
| Undisclosed regulatory notice in RHP period | **Possible concealment** |
| Related-party siphoning post-IPO | **Governance failure** |
| IPO projections knowingly unattainable | **Misrepresentation** (needs evidence) |

**Do not call manipulation without evidence.**

Look for evidence of:

- Misrepresentation
- Concealment
- Structural transfer of valuation risk

Post-IPO weakness is **NOT** automatically manipulation.

---

## Scoring & Verdict

After completing A–L, classify:

### IPO Risk Level

| Level | Meaning |
|-------|---------|
| **Low** | Proven earnings/cash flow; mostly primary issue; aligned insiders |
| **Moderate** | Mixed primary/secondary; growth partly proven; normal lock-in overhang |
| **High** | OFS-heavy; unproven profits; aggressive valuation; heavy SBC |
| **Severe** | Multiple red flags + evidence of concealment or governance failure |

### Forensic Verdict (choose one)

- **Clean** — structural risks normal; no concealment evidence
- **Caution** — high structural risk transfer; not necessarily fraud
- **Investigate further** — conflicting signals; missing disclosures
- **Avoid** — evidence supports misrepresentation or core governance failure
- **Unclear** — insufficient data

---

## Integration with Other Skills

| Skill | Link |
|-------|------|
| `valuation-analysis` | IPO price vs normalized earnings; G scenario halved growth |
| `pccl-analysis` | Post-IPO stocks often need lower PCCL until earnings proven |
| `business-model-analysis` | Was the model viable at IPO or narrative-only? |
| `fundamental-analysis` | Track post-IPO earnings quality vs prospectus |
| `stock-agent.mdc` | Sections 5 (management), 8 (regulatory), 11 (MoS) |

---

## Required Output

Return:

### IPO Summary

Date, issue price, market cap, primary vs secondary split.

### Pre-Investment Test (A–L)

Answer each letter with FACT / UNVERIFIED / N/A.

### Post-IPO Timeline

Key events since listing (ownership, selling, exits, regulation).

### Structural vs Manipulation Assessment

Evidence-based conclusion — not cynicism, not naivety.

### Growth Reality Check

IPO narrative vs actual delivery (revenue, EPS, cash flow).

### Halved-Growth Scenario (G)

What happens to valuation if growth is half the projected rate.

### IPO Risk Level & Forensic Verdict

Low / Moderate / High / Severe + Clean / Caution / Investigate / Avoid.

### Investment Implication

How IPO forensics affects BUY / HOLD / AVOID / PCCL / position size.

### Evidence & Assumptions

Separate facts, management claims, hypotheses, assumptions.

### Limitations

Missing prospectus data, unverified filings, incomplete insider history.

---

## Important Rules

Never:

- Label an IPO a "scam" or "game" without evidence
- Treat post-IPO stock falls as proof of manipulation
- Ignore legitimate structural explanations
- Invent lock-in dates, selling volumes, or prospectus figures
- Use IPO-era bullish narratives as current facts

Always:

- State the date data was checked
- Prefer RHP/prospectus and exchange filings
- Reconstruct timeline for new-age / recent IPOs
- Apply halved-growth stress test (G) for high-multiple listings
- Protect against valuation risk transfer even when fraud unproven
