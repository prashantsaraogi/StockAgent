---
name: management-governance-analysis
description: >-
  Rate Indian company management, governance, integrity, capital allocation,
  and promoter pledge independently from business quality. Use for
  management quality, related-party transactions, auditor changes, pledge,
  or distress-sale risk on NSE/BSE stocks.
---

# Management & Governance Analysis Skill

## Category

**MANAGEMENT** — separate from Fundamental & Business.

See [SKILL-CATEGORIES.md](../SKILL-CATEGORIES.md).

---

## Purpose

Rate **management and governance** independently from business quality
and financial results.

Implements `stock-agent.mdc` sections 5 (Management, Governance &
Integrity) and 6 (Promoter Pledge & Distress-Sale Test).

This skill answers:

> **Do management actions align with minority shareholders?**

A great business with weak or risky management is a different investment
than a great business with proven capital allocators.

---

## Framework Alignment

Classify every conclusion as:

- **FACT** — filing, exchange disclosure, audited RPT, pledge data
- **MANAGEMENT CLAIM** — integrity narrative, “aligned with shareholders”
- **HYPOTHESIS** — inferred intent
- **OUR ASSUMPTION**
- **UNVERIFIED**

Never invent pledge %, RPT amounts, or ownership data.

State **shareholding pattern date** checked.

---

## When to Use

- Management quality or integrity question
- Promoter pledge / distress-sale risk
- Related-party transaction review
- Auditor change, remuneration spike, acquisition track record
- Before high conviction or large position size
- Governance red flags in annual report

Combine with `fundamental-analysis` (numbers) and `business-model-analysis`
(operating context). **Do not** merge management rating with business rating.

---

## Integration with Other Skills

| Skill | Link |
|-------|------|
| `fundamental-analysis` | Financial outcomes of capital allocation |
| `business-model-analysis` | Whether mgmt executes stated strategy |
| `ipo-forensic-analysis` | Post-IPO insider selling, lock-in |
| `legal-threat-analysis` | ED/PMLA, promoter criminal proceedings |
| `fraud-detection-analysis` | **Live** fraud, mis-selling, embezzlement, integrity — banks always |
| `pccl-analysis` | Governance failure → lower PCCL |
| `risk-analysis` | Key-person / governance concentration |

---

## Step 1 — Ownership & Alignment

| Check | Source |
|-------|--------|
| Promoter / founder holding % | Shareholding pattern |
| Change QoQ / YoY | Increasing / stable / decreasing |
| FII / DII / MF trends | Pattern |
| ESOP / SBC dilution | Annual report |
| Buyback / dividend vs growth capex | Capital return discipline |

---

## Step 2 — Capital Allocation Track Record

| Action | Assess |
|--------|--------|
| Dividends | Sustainable vs desperate payout |
| Buybacks | Accretive vs price-insensitive |
| Acquisitions | ROIC post-deal; goodwill write-offs |
| Capex | Growth vs maintenance; overbuilding |
| Related-party loans / guarantees | Size, trend, terms |
| Cash hoard vs deployment | Opportunity cost |

Rate: **Disciplined / Mixed / Poor** — with examples (FACT).

---

## Step 3 — Governance & Integrity Signals

| Red flag | Why it matters |
|----------|----------------|
| Frequent auditor changes | Independence risk |
| Qualified audit opinion | Reliability |
| Rising RPT without business rationale | Minority extraction |
| Remuneration vs performance mismatch | Alignment |
| Missing / delayed disclosures | Transparency |
| Promoter entities winning contracts | Conflict |
| Celebrity board without operating contribution | Narrative vs substance |

**Do not equate** brand, reputation, or celebrity clients with integrity.

Validate through **numbers, disclosures, actions, history**.

---

## Step 4 — Promoter Pledge & Distress-Sale Test

| Pledge level | Interpretation |
|--------------|----------------|
| 0% | Positive — not a guarantee of safety |
| Low (<10%) | Monitor |
| Moderate (10–30%) | Elevated — check reason |
| High (>30%) | High downside risk — distress-sale possible |

Distinguish:

- **Ordinary financing pledge** — disclosed purpose, stable % 
- **Distress pledge** — rising %, margin call news, lender pressure

Investigate: changes in pledged shares, debt servicing, promoter selling.

---

## Step 5 — Management Quality Rating

| Rating | Criteria |
|--------|----------|
| **Strong** | Proven allocation, low pledge, clean RPT, transparent, minority-aligned actions |
| **Adequate** | No major red flags; mixed allocation record |
| **Weak** | RPT concerns, pledge stress, poor acquisitions, disclosure gaps |
| **High risk** | Pattern of minority unfriendly actions; distress signals |

Separate from **business quality** rating (business-model skill).

---

## Required Output

### Ownership Snapshot
Promoter, FII, pledge — date checked.

### Capital Allocation Review
Dividends, buybacks, M&A, capex — track record.

### Governance & Integrity
Red flags and green flags with evidence.

### Promoter Pledge Assessment
Level, trend, distress vs ordinary.

### Management Quality Rating
Strong / Adequate / Weak / High risk.

### PCCL / Thesis Implication
Raise, hold, or lower conviction / PCCL.

### Key Observations

### Evidence & Assumptions

### Limitations

---

## Important Rules

Never:

- Rate management on reputation alone
- Ignore pledge because business is strong
- Confuse founder-led passion with minority alignment

Always:

- Rate management **separately** from business quality
- Use latest shareholding pattern
- Link governance findings to position size and PCCL
- For **banks / D-SIB**: use [bank-governance-checklist.md](bank-governance-checklist.md)
- For **fraud / mis-selling / ED**: use `fraud-detection-analysis/` — **always live search**

---

## Additional Resources

- Banks & HDFC governance template: [bank-governance-checklist.md](bank-governance-checklist.md)
- Fraud / mis-selling / ED register: `fraud-detection-analysis/fraud-register-template.md`
- Regulatory register (HDFC): `legal-threat-analysis/legal-proceedings-checklist.md`
- Price fall with governance rows: `price-decline-analysis/decline-drivers-template.md`
