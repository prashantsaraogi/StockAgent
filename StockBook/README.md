# StockBook

Per-stock persistent analysis — thesis, FAQ, PCCL, parameters, and approach for each holding.

> **Agent:** Read [`AGENT-RULES.md`](AGENT-RULES.md) before any stock analysis.  
> **User:** Open `[stock]-report.html` in browser for full readable report.  
> **Terms:** Abbreviations + **dual-axis (SIP tier vs Current value)** → [`../GLOSSARY.md`](../GLOSSARY.md) · Template → [`_templates/dual-axis-suggested-approach.md`](_templates/dual-axis-suggested-approach.md)

## Structure

```
StockBook/
  ├── AGENT-RULES.md              — Agent must read/update (persistence rules)
  ├── ANALYSIS-LENSES-FRAMEWORK.md — Lens registry + sync rules
  ├── BROKER-TARGET-FRAMEWORK.md
  ├── PARAMETERS-FRAMEWORK.md
  ├── CAGR-FRAMEWORK.md
  └── [Sector]/[Stock Name]/
        ├── summary-analysis.md   — Verdict, PCCL, **integrated lens table**
        ├── detail-analysis.md    — Full framework breakdown
        ├── suggested-approach.md — DCA plan + **lens-driven plan**
        ├── faq.md                — Q&A + Quotes lens
        ├── PARAMETERS_[TICKER].md
        ├── BROKER_[TICKER].md
        ├── CAGR_[TICKER].md
        └── [stock]-report.html
```

## Coverage

**49 / 49 portfolio holdings** have StockBook folders (as of 2026-08-23).

| Depth | Count | Notes |
|-------|------:|-------|
| Full framework analysis | 12 | Deep `detail-analysis.md` — HDFC, PNB, SBI, BOI, Muthoot, Max, Fortis, Cipla, Lupin, LT, Hero, TMPV |
| Continuous SIP plan | **49** | All holdings: tier @ CMP + pace + blended cap in `summary-analysis.md` + `suggested-approach.md` |

## News (dynamic context)

| Path | Purpose |
|------|---------|
| [`News/README.md`](../News/README.md) | Dated macro + portfolio impact summaries |
| [`News/2026-08/2026-08-23/`](../News/2026-08/2026-08-23/summary.md) | Latest digest — RBI MPC, **Delhi EV → IGL** |

---

## All stocks by sector

### Banking and Finance (12)

| Folder | Ticker | Last updated |
|--------|--------|--------------|
| [ICICI Bank](Banking%20and%20Finance/ICICI%20Bank/) | ICICIBANK | 2026-08-23 |
| [HDFC Bank](Banking%20and%20Finance/HDFC%20Bank/) | HDFCBANK | 2026-08-23 |
| [Kotak Mahindra Bank](Banking%20and%20Finance/Kotak%20Mahindra%20Bank/) | KOTAKBANK | 2026-08-23 |
| [PNB](Banking%20and%20Finance/PNB/) | PNB | 2026-08-23 |
| [State Bank of India](Banking%20and%20Finance/State%20Bank%20of%20India/) | SBIN | 2026-08-23 |
| [Bank of India](Banking%20and%20Finance/Bank%20of%20India/) | BANKINDIA | 2026-08-23 |
| [Ujjivan Small Finance Bank](Banking%20and%20Finance/Ujjivan%20Small%20Finance%20Bank/) | UJJIVANSFB | 2026-08-23 |
| [Muthoot Finance](Banking%20and%20Finance/Muthoot%20Finance/) | MUTHOOTFIN | 2026-08-23 |
| [Bajaj Finserv](Banking%20and%20Finance/Bajaj%20Finserv/) | BAJAJFINSV | 2026-08-23 |
| [HDFC Asset Management](Banking%20and%20Finance/HDFC%20Asset%20Management/) | HDFCAMC | 2026-08-23 |
| [HDFC Life Insurance](Banking%20and%20Finance/HDFC%20Life%20Insurance/) | HDFCLIFE | 2026-08-23 |
| [General Insurance Corporation](Banking%20and%20Finance/General%20Insurance%20Corporation/) | GICRE | 2026-08-23 |

### Healthcare (3)

| Folder | Ticker | Last updated |
|--------|--------|--------------|
| [Max Healthcare](Healthcare/Max%20Healthcare/) | MAXHEALTH | 2026-08-23 |
| [Fortis Healthcare](Healthcare/Fortis%20Healthcare/) | FORTIS | 2026-08-23 |
| [Medanta](Healthcare/Medanta/) | MEDANTA | 2026-08-23 |

### Pharma (4)

| Folder | Ticker | Last updated |
|--------|--------|--------------|
| [Cipla](Pharma/Cipla/) | CIPLA | 2026-08-23 |
| [Lupin](Pharma/Lupin/) | LUPIN | 2026-08-23 |
| [Sun Pharmaceutical](Pharma/Sun%20Pharmaceutical/) | SUNPHARMA | 2026-08-23 |
| [Glenmark Pharma](Pharma/Glenmark%20Pharma/) | GLENMARK | 2026-08-23 |

### Infrastructure (3)

| Folder | Ticker | Last updated |
|--------|--------|--------------|
| [Larsen and Toubro](Infrastructure/Larsen%20and%20Toubro/) | LT | 2026-08-23 |
| [Raajmarg Infra Investment](Infrastructure/Raajmarg%20Infra%20Investment/) | RAAJINFRA | 2026-08-23 |
| [HEG](Infrastructure/HEG/) | HEG | 2026-08-23 |

### Auto (8)

| Folder | Ticker | Last updated |
|--------|--------|--------------|
| [Hero MotoCorp](Auto/Hero%20MotoCorp/) | HEROMOTOCO | 2026-08-23 |
| [TMPV](Auto/TMPV/) | TMPV | 2026-08-23 |
| [Maruti Suzuki](Auto/Maruti%20Suzuki/) | MARUTI | 2026-08-23 |
| [Tata Motors CV](Auto/Tata%20Motors%20CV/) | TATAMOTORS | 2026-08-23 |
| [Samvardhana Motherson](Auto/Samvardhana%20Motherson/) | MOTHERSON | 2026-08-23 |
| [Balkrishna Industries](Auto/Balkrishna%20Industries/) | BALKRISIND | 2026-08-23 |
| [Eicher Motors](Auto/Eicher%20Motors/) | EICHERMOT | 2026-08-23 |
| [Ashok Leyland](Auto/Ashok%20Leyland/) | ASHOKLEY | 2026-08-23 |

### IT (5)

| Folder | Ticker | Last updated |
|--------|--------|--------------|
| [Tata Consultancy Services](IT/Tata%20Consultancy%20Services/) | TCS | 2026-08-23 |
| [Infosys](IT/Infosys/) | INFY | 2026-08-23 |
| [HCL Technologies](IT/HCL%20Technologies/) | HCLTECH | 2026-08-23 |
| [Wipro](IT/Wipro/) | WIPRO | 2026-08-23 |
| [Tech Mahindra](IT/Tech%20Mahindra/) | TECHM | 2026-08-23 |

### FMCG (4)

| Folder | Ticker | Last updated |
|--------|--------|--------------|
| [ITC](FMCG/ITC/) | ITC | 2026-08-23 |
| [Hindustan Unilever](FMCG/Hindustan%20Unilever/) | HINDUNILVR | 2026-08-23 |
| [Tata Consumer Products](FMCG/Tata%20Consumer%20Products/) | TATACONSUM | 2026-08-23 |
| [Kwality Walls India](FMCG/Kwality%20Walls%20India/) | KWIL | 2026-08-23 |

### Telecom (1)

| Folder | Ticker | Last updated |
|--------|--------|--------------|
| [Bharti Airtel](Telecom/Bharti%20Airtel/) | BHARTIARTL | 2026-08-23 |

### Oil and Gas (3)

| Folder | Ticker | Last updated |
|--------|--------|--------------|
| [Indian Oil Corporation](Oil%20and%20Gas/Indian%20Oil%20Corporation/) | IOC | 2026-08-23 |
| [Indraprastha Gas](Oil%20and%20Gas/Indraprastha%20Gas/) | IGL | 2026-08-23 |
| [Oil and Natural Gas Corp](Oil%20and%20Gas/Oil%20and%20Natural%20Gas%20Corp/) | ONGC | 2026-08-23 |

### Hotels and Leisure (4)

| Folder | Ticker | Last updated |
|--------|--------|--------------|
| [Delta Corp](Hotels%20and%20Leisure/Delta%20Corp/) | DELTACORP | 2026-08-23 |
| [Indian Hotels](Hotels%20and%20Leisure/Indian%20Hotels/) | INDHOTEL | 2026-08-23 |
| [ITC Hotels](Hotels%20and%20Leisure/ITC%20Hotels/) | ITCHOTELS | 2026-08-23 |
| [Wonderla Holidays](Hotels%20and%20Leisure/Wonderla%20Holidays/) | WONDERLA | 2026-08-23 |

### Consumer (2)

| Folder | Ticker | Last updated |
|--------|--------|--------------|
| [Havells India](Consumer/Havells%20India/) | HAVELLS | 2026-08-23 |
| [United Breweries](Consumer/United%20Breweries/) | UBL | 2026-08-23 |

---

## Priority salary adds (from quadrant-map)

| Rank | Ticker | Report verdict |
|------|--------|----------------|
| 1 | MAXHEALTH | ADD 15 sh/mo |
| 2 | ICICIBANK | ADD 5–8 sh/mo |
| 3 | LT | ADD 18–25 sh @ CMP |
| 4 | MUTHOOTFIN | Small DCA |
| 5 | IOC | ADD (YoC overlay) |

**Pause adds:** TCS, INFY, WIPRO, TECHM, DELTACORP, TMPV · **0% fresh:** PNB, BOI, PSU banks

---

## Agent workflow (mandatory)

### Before analyzing a stock

1. Check if `StockBook/[Sector]/[Stock Name]/` exists
2. If yes → read **summary → faq → suggested-approach → detail** (in that order)
3. Also read `.cursor/portfolio/holdings.md` for qty/avg cost
4. Incorporate prior PCCL, blended caps, and FAQ answers — **do not re-debate settled points** unless new data

### After analysis or material discussion (mandatory)

1. **write back to StockBook** — same session; use tiers in [`AGENT-RULES.md`](AGENT-RULES.md)
2. Append new questions to `faq.md` (never drop old answers)
3. Refresh verdict / PCCL / approach in summary + suggested-approach
4. Regenerate HTML to match markdown
5. Sync `holdings.md` framework note if verdict changed
6. Update this index if new folder or material date change

**Purpose:** User should not lose information. Chat is ephemeral; **Report is memory.**
