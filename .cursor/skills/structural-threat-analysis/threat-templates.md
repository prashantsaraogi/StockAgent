# Structural Threat Templates

Use with `structural-threat-analysis/SKILL.md`.
Mark all data FACT or UNVERIFIED.

---

## Universal AI Threat Framework

Apply to any company when user asks about AI impact:

### Step A — What does the company sell?

| Output type | AI structural risk |
|-------------|-------------------|
| Commodity information / content | **High** — easy to automate |
| Routine cognitive labour (L1 support, basic coding, data entry) | **High** |
| Regulated judgement (medicine, law, audit sign-off) | **Moderate** — slower but tools compress margins |
| Physical + trust + distribution (pharma sales, branches) | **Lower near-term** |
| Proprietary data + workflow embedding | **Lower** if AI enhances lock-in |
| Capital-intensive manufacturing | **Lower** for production; watch R&D/design |

### Step B — AI role classification

| Role | Threat level |
|------|--------------|
| **Tool** — same output, lower cost | Tailwind if incumbent adopts first |
| **Substitute** — customer buys AI instead of service | **Structural** |
| **Commoditiser** — erases differentiation | **Structural** |
| **Enabler for new entrant** — startup at fraction of cost | **Structural** |

### Step C — Evidence checklist

- [ ] Revenue mix exposed to automatable tasks (%)
- [ ] Peer margin trends vs company
- [ ] Client contract duration / switching costs
- [ ] Management AI capex or partnerships (FACT)
- [ ] Disclosed AI-related revenue (not just claims)
- [ ] Headcount trend in exposed functions
- [ ] Pricing trend in exposed service lines

### Step D — Permanence call

**Permanent (structural)** if substitute exists today at acceptable
quality and cost, and customer switching is practical.

**Transitional** if technology improving fast but adoption low.

**Temporary** if AI mainly improves incumbent productivity.

---

## IT Services / BPO

| Threat | Structural? | KPIs to watch |
|--------|-------------|---------------|
| GenAI coding assistants | Transitional → Structural for L1/L2 body-shopping | Revenue/employee, pyramid mix, AI-ready contracts |
| Client in-sourcing with AI | Structural for commoditised work | Top-client concentration, deal wins/losses |
| Offshore cost arbitrage erosion | Structural long-term | Blended rates, margin per FTE |
| New global captives | Moderate | Net hiring by clients |

**Moat most durable:** domain expertise, embedded workflows, regulated
industries, outcome-based pricing with proven delivery.

---

## Asset Management (AMC)

| Threat | Structural? | KPIs to watch |
|--------|-------------|---------------|
| Passive / ETF shift | **Structural** — lower fee bps | Active vs passive share, fee yield |
| Direct / robo platforms | **Structural** for distributor economics | Direct AUM %, commission cost |
| AI-driven retail investing apps | Transitional | SIP market share, young investor penetration |
| SEBI fee (TER/BER) cuts | **Structural** regulatory | Fee yield bps post-reform |

---

## Pharma

| Threat | Structural? | KPIs to watch |
|--------|-------------|---------------|
| US price erosion / channel consolidation | Often **structural** in US generics | US revenue, US margin, ANDA pricing |
| New low-cost Indian/API competitors | Moderate–Structural by segment | Market share in key molecules |
| AI in drug discovery (for innovators) | Transitional for most Indian cos | R&D productivity — limited near-term |
| Biosimilars / complex generics competition | Segment-dependent | Pipeline approvals vs peers |

---

## Banks / NBFCs

| Threat | Structural? | KPIs to watch |
|--------|-------------|---------------|
| Fintech / neobank payment rails | Structural for fee income | Fee income mix, UPI/digital share |
| AI credit underwriting | Transitional | GNPA vs peers, cost/income |
| Deposit flight to higher-yield alternatives | Cyclical–Structural | CASA ratio, deposit beta |

---

## Consumer / Retail / Media

| Threat | Structural? | KPIs to watch |
|--------|-------------|---------------|
| E-commerce / quick commerce | **Structural** for traditional retail | Same-store sales, channel mix |
| AI-generated content | **Structural** for ad-supported media | Traffic, CPM, subscription conversion |
| D2C brands bypassing distributors | Structural | Wholesale vs retail mix |

---

## New-Age / Platform (Paytm, Eternal, etc.)

| Threat | Structural? | KPIs to watch |
|--------|-------------|---------------|
| Regulator caps economics | **Structural** | Take rate, compliance cost |
| Well-funded competitor subsidy war | Transitional–Structural | Burn, market share, unit economics |
| Platform disintermediation | **Structural** | Order volume, restaurant/store retention |

Cross-reference `ipo-forensic-analysis` — threats often appear post-IPO.

---

## Threat → PCCL Adjustment Guide

| Permanence | Severity | PCCL adjustment |
|------------|----------|-----------------|
| Temporary | Any | No change if core-problem test passes |
| Transitional | Moderate | Hold PCCL; reduce position size |
| Transitional | High | Lower PCCL 10–15% |
| Permanent | Moderate | Lower PCCL 15–25% |
| Permanent | High/Critical | Lower PCCL 25–40%+ or AVOID |

Adjustments are **OUR ASSUMPTION** — state reasoning explicitly.

---

## Sample Output Snippet

**Company:** XYZ IT Services  
**Threat:** GenAI reduces client need for L2 application maintenance  
**Verdict:** Transitional → potentially **Permanent** for 30–40% of revenue  
**Evidence (FACT):** Blended rate down 4% YoY; management cites "efficiency deals" on concall  
**Moat impact:** Distribution moat intact; labour-arbitrage moat eroding  
**PCCL impact:** Hold current PCCL; lower if two more quarters of rate decline  
**Monitor:** Deal pipeline, offshore headcount, AI-attributed revenue disclosure
