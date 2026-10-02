# Price Decline — Driver Templates

Use with `price-decline-analysis/SKILL.md`.

---

## Standard table (copy per stock)

```markdown
## Why the stock fell ~[X]% from ₹[peak] ([Mon YYYY])

| Driver | Type |
|--------|------|
| | FACT / MANAGEMENT CLAIM / HYPOTHESIS / UNVERIFIED |

**Core-problem test:** ...

**PCCL / action implication:** ...
```

---

## Worked example — Muthoot Finance (Aug 2026 pattern)

**Peak:** ₹4,150 (29 Jan 2026) → **CMP:** ~₹2,890 → **Fall:** ~30%

| Driver | Type |
|--------|------|
| NIM fell ~300 bps QoQ to ~10.4% (Q1 FY27) | FACT |
| Gold loan yields dropped to ~17.9% from ~20%+ FY26 | FACT |
| FY26 had one-off high recoveries — unlikely to repeat | MANAGEMENT CLAIM |
| Pricing war — banks & NBFCs cutting gold loan rates | HYPOTHESIS (industry reports) |
| Broker FY27 PAT growth cut to ~4–5% | HYPOTHESIS (broker estimates) |
| Stock de-rated after exceptional FY26 earnings peak | OUR ASSUMPTION |

**Core-problem test:** Not broken — leader with ROE ~31%; **margin normalization**
after exceptional year, not balance-sheet distress. **Mixed** — competition on
yields may be structural; AUM growth continues.

**PCCL / action:** Near PCCL ~₹2,650–2,800; **no lump-sum add** at ₹2,890;
hold winners; staged add only ₹2,650–2,750 if NIM stabilizes.

---

## Worked example — ITC (Aug 2026 pattern)

**Peak:** ~₹427 (52W) → **CMP:** ~₹268 → **Fall:** ~33% YTD

| Driver | Type |
|--------|------|
| Cigarette GST 28%→40% + excise hike from 1 Feb 2026 | FACT |
| Q1 FY27 cigarette PBIT −31.5% YoY (first full tax quarter) | FACT |
| FII/MF holding decreased QoQ | FACT |
| Illicit trade risk post tax hike | MANAGEMENT CLAIM / HYPOTHESIS |
| Hotels demerger — Q4 headline PAT confusion (one-off prior year) | FACT (distortion) |

**Core-problem test:** **Policy structural** on cigarettes but ITC survived past
tax cycles — **mixed**; near-term earnings hit is **FACT**, not rumor.

**PCCL / action:** Above PCCL; **hold**, do not average at CMP.

---

## Worked example — TCS (Aug 2026 pattern)

**Peak:** ~₹3,350 (52W) → **CMP:** ~₹2,313 → **Fall:** ~31%

| Driver | Type |
|--------|------|
| CC revenue −3.1% YoY Q1 FY26 | FACT |
| AI-led pricing pressure / client pass-through of productivity | HYPOTHESIS (industry) |
| FII holding down; IT index weak | FACT |
| P/E compressed from ~25× toward ~16× | FACT |
| HSBC "worst year" AI impact narrative FY27 | HYPOTHESIS |

**Core-problem test:** **Transitional→structural** on pricing; moat not destroyed.

**PCCL / action:** Fair value zone; **hold**, no average at CMP.

---

## Worked example — HDFC Bank (Aug 2026 pattern)

**Peak:** ₹1,020.50 (52W high) → **CMP:** ~₹719 → **Fall:** ~30%

Run **`management-governance-analysis`** in parallel — governance is a **major**
driver here, not only NIM.

| Driver | Type |
|--------|------|
| NIM compressed to **3.26%** Q1 FY27 (−12 bps QoQ) | FACT |
| Post-merger **CASA ↓** (32.3%), higher-cost term deposits | FACT |
| Loan growth not matching NII growth (+11% vs +6.7%) | FACT |
| **Chairman Chakraborty resigns** — ethics / values statement | FACT |
| **MSRDC vigilance probe** — ₹45 cr interest via marketing route | FACT |
| **CEO/CFO warning letters + ₹1 lakh penalty** (business overreach) | FACT |
| **RBI supervisory review** on MSRDC — pending | FACT (ongoing) |
| **CEO term ends Oct 2026** — succession overhang | FACT |
| External lawyers: no evidence for chairman claims | FACT (bank filing) |
| Market **governance discount** on D-SIB (P/E ~14×, 52W low) | OUR ASSUMPTION |
| Stock underperformed Nifty ~−27% YTD vs ~−8% | FACT |

**Core-problem test:** **Two stacked problems** — (1) **NIM/funding** post-merger =
mixed, may normalize; (2) **Governance/trust** = unresolved until **RBI + CEO
succession**. Not broken bank (GNPA ~1.17%) but **not clean enough to average**
at 52W low without catalysts.

**Management rating (separate):** **Weak–Mixed** | **Business rating:** **Strong**

**PCCL / action:** Governance overlay lowers PCCL to **~₹600–650**; **HOLD**;
**no add at ₹719** until RBI outcome + NIM/Q2 confirmation; optional staged add
only after clarity.

See `management-governance-analysis/bank-governance-checklist.md` and
`legal-threat-analysis/legal-proceedings-checklist.md` (HDFC regulatory register).

---

## Driver checklist by sector

### NBFC / gold loan

- [ ] NIM / yield / spread QoQ
- [ ] AUM growth vs profit growth divergence
- [ ] Stage-2 / GNPA post RBI norm change
- [ ] Competition rate cuts
- [ ] Gold price impact on AUM
- [ ] Cost of funds / borrowing

### FMCG / tobacco

- [ ] Tax / excise / regulatory
- [ ] Volume vs price/mix
- [ ] Input cost / margin
- [ ] One-off in prior-year base

### IT services

- [ ] CC growth / guidance
- [ ] AI deflation narrative
- [ ] Client discretionary spend
- [ ] USD/INR
- [ ] Multiple compression vs EPS

### Auto

- [ ] Monthly SIAM vs expectations
- [ ] Rural demand / financing rates
- [ ] EV mix / discounting

### Legal-heavy (Delta Corp etc.)

- [ ] Court order / provision
- [ ] Stay vs demand upheld
- [ ] Licence risk

Run `legal-threat-analysis` in parallel.

### Banks / D-SIB (HDFC Bank etc.)

- [ ] NIM / CASA / LDR post-merger
- [ ] **Chairman / CEO changes** — ethics resignation?
- [ ] **RBI penalty / embargo / supervisory review** — pending?
- [ ] Internal vigilance / whistleblower / MSRDC-type conduct
- [ ] **CEO reappointment date** and board stability
- [ ] Governance discount vs peers (P/B, P/E)

Run **`management-governance-analysis`** + `bank-governance-checklist.md`
+ `legal-threat-analysis` (regulatory register) in parallel.

---

## Decomposition formula

When possible, split fall into:

```
Price change ≈ EPS change effect + P/E change effect + dividend yield
```

If stock −30% but EPS −5%, most fall is **multiple compression** (rerating).
If EPS −25%, fall is **earnings-driven** — PCCL must fall more.

Label each as FACT (reported EPS, calculable P/E) or ASSUMPTION.

---

## Search queries (run on analysis date)

```
[Company] chairman CEO resignation governance
[Company] RBI penalty supervisory review
[Ticker] 52 week high low
```

Plus exchange filings for results date and Reg 30 news.

For banks: also `management-governance-analysis/bank-governance-checklist.md`.
