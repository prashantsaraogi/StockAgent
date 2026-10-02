# Policy & Index Event Checklists

Use with `dynamic-context-analysis/SKILL.md`.
Verify from **official sources** on analysis date.

---

## RBI / Monetary Policy

### Before every MPC meeting

- [ ] Current repo rate and stance (FACT — last MPC resolution)
- [ ] CPI / inflation print since last meeting
- [ ] USD/INR trend and RBI FX intervention news
- [ ] System liquidity (deficit/surplus)
- [ ] Credit growth (fortnight)
- [ ] Market expectation vs dot plot / consensus (HYPOTHESIS)

### After MPC

- [ ] Rate decision and vote split
- [ ] Stance change (withdrawal of accommodation, neutral, accommodative)
- [ ] Liquidity measures (HTM, OMO, CRR if any)
- [ ] Governor commentary on growth vs inflation
- [ ] Transmission to banks: MCLR/EBLR pass-through timeline

### Sector map

| Sector | Rate cut | Rate hike |
|--------|----------|-----------|
| Banks / NBFCs | NIM pressure lag; credit demand up | Credit cost up; asset quality watch |
| Auto / housing | EMI down — demand tailwind | Demand headwind |
| IT | Neutral | Neutral |
| Debt-heavy infra | Positive | Negative |

---

## MSCI Index Events

### Checklist

- [ ] Review date and announcement date (MSCI index review calendar)
- [ ] Inclusion / exclusion / weight change — which stocks
- [ ] Market classification change (e.g. EM status — rare but high impact)
- [ ] Free-float adjustment factor change
- [ ] Estimated passive flow (HYPOTHESIS — cite broker estimate source)
- [ ] ADR/GDR / FPI limit constraints for included names
- [ ] Effective date — when index funds rebalance
- [ ] Already priced? Compare stock move vs announcement date

### Common mistakes

- Assuming full float market cap flows on announcement day
- Ignoring simultaneous FTSE / Nifty changes
- Treating exclusion as permanent thesis break (often flow, not fundamental)

---

## Nifty 50 / Sensex Restructuring

### Checklist

- [ ] NSE/BSE announcement date and effective date
- [ ] Stocks added vs removed
- [ ] Reason: market cap, liquidity, F&O eligibility, corporate action
- [ ] Passive AUM tracking Nifty 50 (order of magnitude — cite source)
- [ ] Stock-specific: inclusion → buy pressure; exclusion → sell pressure
- [ ] Free-float and investability weight
- [ ] Intersection with MSCI EM index (combined flow)

### NSE methodology triggers (typical)

- Semi-annual review (March / September)
- Adhoc replacement (merger, delisting, suspension)
- Corporate action driven changes

---

## Union Budget / Fiscal

- [ ] Capex allocation (infra, defence, railways)
- [ ] Custom duty changes (auto components, electronics, gold)
- [ ] Tax slab / surcharge changes (consumption impact)
- [ ] PLI scheme extensions or new sectors
- [ ] Disinvestment / privatisation list
- [ ] Fiscal deficit target (bond market → rates → equities)

---

## SEBI / Sector Regulators

| Regulator | Watch for |
|-----------|-----------|
| SEBI | MF regulations, margin rules, IPO norms, FPI rules |
| IRDAI | Insurance product norms, solvency |
| TRAI | Telecom tariffs |
| MoPNG / MNRE | Fuel pricing, renewable policy |

Label **structural** (permanent rule change) vs **one-off** enforcement.

Link to `structural-threat-analysis` if rule permanently changes economics.

---

## Event Calendar Discipline

Maintain mental calendar for analysis:

| Event | Typical timing |
|-------|----------------|
| RBI MPC | Bi-monthly (Feb, Apr, Jun, Aug, Oct, Dec) |
| Union Budget | February |
| MSCI index review | Feb, May, Aug, Nov (announcements) |
| Nifty 50 rebalance | March, September |
| SIAM auto sales | ~1st week of month (prior month) |
| AMFI AUM | Mid-month (prior month) |
| GST collections | Monthly (~1st) |

State **next known date** in output when relevant.

---

## Dynamic Update Template

```
Event: [e.g. MSCI Nov 2025 review]
Status as of [date]: [Announced / Pending / Effective]
Impact on [ticker]: [Inclusion / No change / Exclusion]
Flow estimate: [₹ / UNVERIFIED]
Priced in? [Yes / Partial / No — evidence]
View changes if: [effective date flows differ / stock already moved X%]
```
