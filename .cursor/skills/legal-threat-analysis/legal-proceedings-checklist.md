# Legal Proceedings Checklist

Use with `legal-threat-analysis/SKILL.md`.

**Always search latest news + BSE/NSE filings on analysis date.**
Mark FACT | MANAGEMENT CLAIM | UNVERIFIED.

---

## Universal Proceeding Register (copy per stock)

| # | Authority | Case / matter | Issue | Amount (₹ cr) | Status | Next date | Source | Verified? |
|---|-----------|---------------|-------|--------------:|--------|-----------|--------|-----------|
| 1 | | | | | | | | |
| 2 | | | | | | | | |

---

## Search Checklist (run every time)

- [ ] `[Company name] Supreme Court` — last 30 days
- [ ] `[Company name] High Court` — last 30 days
- [ ] `[Company name] SEBI` / `SAT` / `enforcement`
- [ ] `[Company name] GST` / `tax demand` / `DGGI` / `income tax`
- [ ] `[Company name] ED` / `CBI` / `PMLA` (if promoter risk)
- [ ] `[Company name] NCLT` / `insolvency` (if credit stress)
- [ ] BSE/NSE: filter **Reg 30** / **legal** / **litigation** disclosures
- [ ] Annual report: **contingent liabilities** note
- [ ] Latest quarterly: **exceptional items** / provisions

If user gives a date (e.g. 19 August):

- [ ] Exchange filing mentioning that date
- [ ] Cause list (HC/SC) — if publicly searchable
- [ ] Credible legal news citing that date
- If not found → label date **UNVERIFIED**; state searches performed

---

## Proceeding Type Guide

| Type | Key questions | PCCL impact |
|------|---------------|-------------|
| **GST / indirect tax** | Retrospective? Interest + penalty? Stay? | High — quantify per demand |
| **Direct tax / transfer pricing** | Adjustment years; penalty rate | Medium–high |
| **Licence / gambling / sector** | Can business operate without licence? | Often existential |
| **SEBI** | Fine vs trading ban vs delisting | Usually moderate |
| **Environmental / forest** | Plant closure order? | High for asset-heavy |
| **Mining / MMDR** | Lease cancelled? | Existential for miner |
| **Arbitration** | Award amount; enforcement stage | Bounded if quantified |
| **Promoter ED/PMLA** | Asset attachment; key person | Governance — size down |

---

## Delta Corp — Reference Template (refresh every analysis)

Use as pattern for **good operations + painful legal overhang**.
Sizing: [legal-overhang-speculative-sizing.md](legal-overhang-speculative-sizing.md).

**Last framework refresh:** 21 Aug 2026

### Company context

| Item | Detail | Label |
|------|--------|-------|
| Ticker | DELTACORP (NSE/BSE) | FACT |
| CMP (ref) | ~₹60–61 | Aug 2026 |
| Mcap (ref) | ~₹1,610 cr | ASSUMPTION @ ₹60 |
| Business | Goa casinos (3/6 offshore licences), hospitality; Sikkim closed; online impaired | FACT |
| Shares outstanding | ~26.8 cr | FACT (Mar 26) |
| Book value / share | ~₹84 | FACT |
| Why legal hurts | Retrospective GST; gross-bet vs chip-sale valuation; licence/vessel disputes | FACT |

### Proceeding register (verify latest on each analysis)

| # | Authority | Matter | Exposure (₹ cr) | Status (Aug 2026) | Next catalyst | Label |
|---|-----------|--------|----------------:|-------------------|---------------|-------|
| 1 | SC / GST adjudication | GST Jul 2017 – Sep 2023 (Rule 31C / chip basis) | **Provision 307** (GST 144 + int 148 + pen 14) | SC judgment **27 May 2026**; adjudication ongoing | Adjudication order | FACT |
| 2 | GST intelligence | Show-cause / contingent (gross-bet basis) | **~24,960** disclosed FY26 | Contested; not fully adjudicated | SC/adj orders | FACT (disclosure) |
| 3 | SC (Goa) | GST demand Delta + Highstreet Cruises | **1,752** (1,350 + 402) | **Interim stay** on proceedings (May 2026) | Stay continuation / final SLP | FACT |
| 4 | GST | Mixed supply (F&B, liquor) | Unquantified | **No provision** — company disputes | Assessment order | UNVERIFIED |
| 5 | SC SLP | Deltin Hotel slot licence (Daman) | Operational | SLP **22 Jul 2026** vs HC dismiss **29 Apr 2026** | SC listing | FACT |
| 6 | Bombay HC (PIL) | New Mandovi casino vessel | Capacity / revenue | Court permission required; King Casino vacated Q1 | HC permission | FACT |
| 7 | Central law | Online Gaming Act 2025 | Online revenue = 0 | **Permanent** structural | — | FACT |
| 8 | NCLT | Demerger gaming vs hospitality | Corporate | Application filed; pending | NCLT approval | FACT |

### Solvency stress test (Mar 31, 2026 — refresh each quarter)

| Item | ₹ cr | Label |
|------|-----:|-------|
| Cash & equivalents | **76** | FACT |
| Cash + short-term investments | **~290** | FACT |
| Net worth | **~2,252** | FACT |
| FY26 operating cash flow | **135** | FACT |
| Q1 FY27 PBT (ex-exceptional) | **27.7** | FACT |

| Ratio | Value | Read |
|-------|------:|------|
| Provision 307 / net cash | **1.06×** | One-shot **liquidity squeeze** — survivable over time |
| Worst contingent ~25,000 / net worth | **~11×** | **Existential** if upheld |
| Goa 1,752 / net worth | **0.78×** | **High risk** if stay vacated |

**Classification (Aug 2026):** **High risk** — ops OK, legal tail can impair most of equity.

### Three-scenario legal + PCCL (Aug 2026 framework ref)

| Scenario | Final liability (indicative) | Norm PAT | EPS | P/E | **Value/sh** |
|----------|------------------------------|---------:|----:|----:|-------------:|
| **Best** | ~250–350 cr near provision | 120–150 cr | 4.5–5.6 | 18–22× | **₹110–130** |
| **Base** | 600–1,500 cr over 5–8 yrs | 60–90 cr | 2.2–3.4 | 16–18× | **₹65–85** |
| **Worst (PCCL)** | >2,000 cr enforced | 30–50 cr | 1.1–1.9 | 12–15× | **₹35–55** |

**Framework PCCL zone:** **₹35–55** | **Normal IV:** **₹65–85** | **Optimistic:** **₹110–130**

### Catalyst probability (OUR ASSUMPTION — refresh with new orders)

| Outcome | Prob. | Action |
|---------|------:|--------|
| Final liability ≈ provision class (~300 cr) | 25–30% | Reassess PCCL ↑; token add only ≤2% weight |
| Base settlement 600–1,500 cr | 45–50% | Range-bound; no add above PCCL |
| Goa + gross-bet worst enforced | 20–25% | Trim / avoid; PCCL → ₹15–35 zone |

### Framework action (no position / speculative only)

| Action | Rule |
|--------|------|
| **Fresh lump BUY @ CMP ~₹60** | **No** — premium to PCCL; high-risk class |
| **Max portfolio weight** | **≤ 2%** |
| **Token entry zone** | **₹45–50** (PCCL upper) |
| **Small staged entry** | **₹38–42** |
| **Strong add** | Only after **written** favourable adjudication + ≤2% weight |
| **Never** | Average on “casinos still open” |

### Monitoring triggers

| KPI | Green | Red |
|-----|-------|-----|
| Ex-exceptional PBT / qtr | >₹25 cr | <₹15 cr × 2 qtrs |
| New GST provision | None | Second large hit |
| Goa stay | Continues | Vacated + deposit |
| Cash + STI | >₹200 cr | <₹100 cr post-payment |
| Vessel / King Casino | Operational | Permanent block |

### Pre-hearing / pre-order action template

| Outcome | Likely impact | Framework action |
|---------|---------------|------------------|
| Favourable stay / chip basis upheld | Relief rally | Reassess PCCL; token only ≤2% |
| Adverse — demand upheld near worst | Stock pressure | **No add**; trim |
| Mixed — remanded to adjudication | Volatility | **HOLD** token; wait |
| Licence denied / existential | Structural | **EXIT** review |

**Never assume a user-supplied hearing date without verification** — search Reg 30 + cause list + credible legal news; label **UNVERIFIED** if not found.

---

## HDFC Bank — Regulatory & Governance Register (Aug 2026 pattern)

Use for **RBI / board / vigilance** matters — not always court litigation.
Refresh on every analysis. Cross-ref `management-governance-analysis/bank-governance-checklist.md`.

### Why this matters legally vs governance

| Layer | Skill |
|-------|--------|
| Formal enforcement, penalties, stays | `legal-threat-analysis` |
| Board conduct, CEO succession, trust deficit | `management-governance-analysis` |
| Stock fall attribution | `price-decline-analysis` |

### Proceeding / matter register (verify latest)

| # | Authority | Matter | Issue | Amount / exposure | Status | Next catalyst | Source |
|---|-----------|--------|-------|------------------:|--------|---------------|--------|
| 1 | Internal ACB | Vigilance probe | MSRDC ~₹45 cr interest via marketing route FY24–25 | ~₹45 cr | Board closed Jul 2026 — **RBI review separate** | RBI outcome | FACT |
| 2 | Board / IDC | Disciplinary action | CEO, CFO, Group Head Retail — **business overreach** | ₹1 lakh penalty each | Warning letters issued Jul 2026 | CEO term Oct 2026 | FACT |
| 3 | External lawyers | Chakraborty resignation review | Ethics / values claims | N/A | **No evidence found** Jun 2026; ex-chairman did not participate | SEBI board minutes review? | FACT |
| 4 | RBI | Supervisory review | MSRDC deposit conduct vs directions | UNVERIFIED | **Pending** Aug 2026 | Reappointment decision | HYPOTHESIS |
| 5 | SEBI / exchange | Governance disclosure | Chairman exit Reg 30 | N/A | Filed | — | FACT |

### HDFC legal-threat questions

1. Does **RBI** outcome differ from board’s “overreach not mala fide” finding?
2. Could **CEO reappointment** be delayed or denied?
3. Any **SEBI** formal proceedings (vs media review of minutes)?
4. **Financial liability** material? (₹45 cr immaterial vs balance sheet — **FACT** scale)
5. **Contagion** to deposit franchise or FCNR flows? — monitor

### Pre-outcome action (RBI / succession)

| Outcome | Framework action |
|---------|------------------|
| RBI mild / closed with board | Governance overhang eases; reassess PCCL + small add |
| RBI formal penalty on individuals | **No add**; hold; trim if overweight |
| CEO not reappointed / delayed | **Wait** — key-person uncertainty |
| New material probe | **Investigate** — lower PCCL |

---

## SEBI / Corporate Governance Matters

| Check | Source |
|-------|--------|
| SCN / settlement | SEBI orders website |
| Related-party / disclosure | Exchange filings |
| Auditor qualification | Annual report |
| Promoter encumbrance / pledge | Shareholding pattern |

---

## Tax Demand Stress Test

```
Net cash (consolidated)     = ₹___ cr  [FACT]
Total legal worst-case      = ₹___ cr  [ASSUMPTION]
Ratio worst / net cash      = ___×

If ratio > 1.0× → legal is core-problem candidate until resolved
If ratio 0.5–1.0× → severe PCCL haircut; no large adds
If ratio < 0.3× and stay in place → monitor; may HOLD
```

---

## Catalyst Calendar (maintain per stock)

| Date | Event | Verified source | Action plan |
|------|-------|-----------------|-------------|
| | SC/HC hearing | | |
| | Adjudication order | | |
| | Q-results (provision update) | | |

---

## Evidence Priority

1. Supreme Court / HC orders (official or verified legal databases)
2. BSE/NSE Reg 30 disclosures
3. Company annual report contingent liabilities
4. Reputable legal/tax commentary citing orders
5. General news — confirm against 1–2 above
6. Social media — UNVERIFIED
