---
name: business-model-analysis
description: >-
  Analyze how an Indian company makes money — revenue engine, cost
  structure, industry KPIs, and moat evidence. Use for business model,
  unit economics, AMC/bank/pharma sector analysis, or operating moat
  questions on NSE/BSE stocks.
---

# Business Model Analysis Skill

## Category

**FUNDAMENTAL & BUSINESS** — moat, revenue engine, industry KPIs, **competitors/peers**.

See [SKILL-CATEGORIES.md](../SKILL-CATEGORIES.md).

## Purpose

Analyze **how a company makes money** — not just whether profits
are growing. Explain the operating engine, revenue drivers, cost
structure, competitive dynamics, and industry-specific KPIs.

This skill complements:

- `fundamental-analysis` — financial statements
- `valuation-analysis` — price vs value
- `structural-threat-analysis` — AI, disruption, new competition vs cyclical crisis
- `dynamic-context-analysis` — monthly ground reality, RBI/MSCI/Nifty, geopolitical
- `legal-threat-analysis` — court, tax, SEBI, licence disputes; search latest news
- `stock-agent.mdc` — Business Quality & Moat (section 2)

Use this skill when the user asks about:

- Business model
- How the company earns money
- Industry economics (AMC, bank, pharma, IT, etc.)
- Moat from an operating perspective
- Unit economics or revenue drivers
- Sector-specific KPIs (AUM, ARPU, NIM, etc.)
- AI threat, disruption, or new competition impact on the model

---

## Framework Alignment

Follow `.cursor/rules/stock-agent.mdc`.

Classify every conclusion as:

- **FACT**
- **MANAGEMENT CLAIM**
- **HYPOTHESIS**
- **OUR ASSUMPTION**
- **UNVERIFIED**

Never invent operating metrics. If AUM, market share, or fee yield
is unavailable, state it is unavailable.

---

## Step 1 — Identify the Business Type

Before analyzing, classify the company:

| Type | Examples |
|------|----------|
| Asset manager (AMC) | HDFC AMC, Nippon AMC, ICICI Pru AMC |
| Bank / NBFC | HDFC Bank, Bajaj Finance |
| Pharma | Caplin Point, Dr. Reddy's |
| IT / SaaS | TCS, Persistent |
| Consumer | HUL, Titan |
| Platform / marketplace | Zomato, Paytm |
| Manufacturing | — |
| Other | Use generic framework below |

If a sector template exists in [industry-templates.md](industry-templates.md),
read and apply it.

---

## Step 2 — Revenue Engine

Answer these questions with evidence:

1. **Who pays?** (customer type: retail, institutional, B2B, government)
2. **For what?** (product / service)
3. **How is price set?** (regulated, negotiated, market-based, subscription)
4. **What drives volume?** (AUM, units sold, users, loans, prescriptions)
5. **What drives price/yield?** (fee rate, ASP, NIM, realization)
6. **Recurring vs one-time?** (SIP book, subscription, project revenue)
7. **Geography and concentration** (% by region, top customer risk)

Formula mindset:

```
Revenue ≈ Volume × Yield/Price × Mix
```

Show the formula for the specific business when possible.

---

## Step 3 — Cost Structure & Operating Leverage

Analyze:

- Fixed vs variable costs
- People cost intensity
- Distribution / commission costs
- Technology and compliance costs
- Capital intensity (capex, working capital)
- Operating leverage (do margins expand as scale grows?)

Ask: **What must go right for margins to hold or expand?**

---

## Step 4 — Moat from Operations (Not Narrative)

Test moat with **measurable evidence**:

| Moat source | Evidence to look for |
|-------------|---------------------|
| Scale | Market share, cost per unit declining |
| Brand / trust | Premium pricing, retention, NPS |
| Distribution | Partner network, reach, penetration |
| Switching costs | Retention rate, lock-in, multi-product usage |
| Network effects | User growth accelerating value |
| Regulation / licence | Barriers, approvals, compliance track record |
| Cost advantage | Sustained margin lead vs peers |

Ask: **"Why can't a well-funded competitor replicate this in 3–5 years?"**

Separate **real moat** from **management narrative**.

---

## Step 5 — Industry-Specific KPIs

Do not rely only on P/E and revenue growth.

Pull sector KPIs from [industry-templates.md](industry-templates.md)
when available. Examples:

- **AMC:** QAAUM, market share, fee yield (bps), SIP book, unique
  investors, equity vs debt mix, direct vs regular, active vs passive
- **Bank:** NIM, CASA, GNPA, NNPA, credit growth, ROA
- **Pharma:** geography mix, ANDA pipeline, US vs India revenue
- **IT:** CC growth, margin, attrition, deal wins

Compare company KPIs vs:

- Own history
- Top 2–3 peers
- Industry averages

---

## Step 6 — Business Model Risks

Identify risks **intrinsic to the model**, not just stock price:

- Regulatory changes affecting fees or licences
- Disintermediation (direct plans, passive investing, generics)
- Customer concentration
- Cyclicality (AUM linked to markets, capex cycles)
- Technology disruption
- Key-person or key-partner dependency

Link each risk to **what metric would deteriorate first**.

---

## Step 7 — Business Quality Rating

Rate **business model quality** (not valuation):

| Score | Meaning |
|-------|---------|
| 9–10 | Exceptional economics, durable moat, proven through cycles |
| 7–8 | Strong model, minor vulnerabilities |
| 5–6 | Adequate but competitive or cyclical |
| 3–4 | Weak or eroding economics |
| 1–2 | Broken or structurally impaired |

Explain the score with evidence.

---

## Required Output

Return:

### Business Type

Sector and sub-sector.

### How the Company Makes Money

Plain-language explanation of the revenue engine.

### Revenue Drivers

Volume, yield/price, mix — with latest available numbers.

### Cost Structure

Key costs and operating leverage.

### Industry KPIs

Sector-specific metrics vs peers/history.

### Competitive Position

Market share, differentiation, moat evidence.

### Business Model Risks

Structural risks and early warning metrics.

### Business Quality Score

Score out of 10 with justification.

### Key Observations

3–5 most important findings.

### Evidence & Assumptions

Separate facts from claims and assumptions.

### Limitations

Missing data and what could not be verified.

---

## Important Rules

Never:

- Confuse business quality with investment attractiveness at current price
- Accept management moat claims without numerical support
- Use peak-cycle metrics as permanent run-rate
- Invent industry KPIs

Always:

- Use the latest available data and state the date checked
- Compare with peers when data exists
- Link business model findings to earnings quality and valuation skills

---

## Additional Resources

- Sector deep-dives and KPI checklists: [industry-templates.md](industry-templates.md)
