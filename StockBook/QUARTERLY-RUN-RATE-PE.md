# Quarterly PAT → Earnings run-rate P/E

**Created:** 22 Oct 2026  
**Purpose:** Compute **earnings run-rate P/E** from **verified consolidated PAT** (last *N* reported quarters), annualised, vs **conventional trailing P/E (TTM)** on quote sites.  
**Web:** Stock Calculator → Full analysis → **Overview** → **Quarterly run-rate P/E** panel  
**Cross-ref:** `PARAMETERS-FRAMEWORK.md` · `PE-EVALUATION-FRAMEWORK.md` · `EARNINGS-QUALITY-FRAMEWORK.md` · `web/lib/pe-quarterly-run-rate.ts`

---

## Which stock and how many quarters?

| Input | Rule |
|-------|------|
| **Stock / ticker** | Any name under analysis — use **NSE** symbol (e.g. `MARUTI`, `MAXHEALTH`). Prefer **consolidated** PAT from BSE/NSE results or annual report. |
| **Exchange** | Indian portfolio default **NSE** (`.NS` for Yahoo cross-check only). Use the listing where you verify PAT. |
| **Number of quarters (N)** | See table below. **Default: 4** (same window as TTM if quarters are contiguous and PAT basis matches). |

| N | Label | When to use | Caveat |
|---|--------|-------------|--------|
| **4** | TTM window | **Default** — rear-view check vs Moneycontrol/VRO TTM P/E | Must be **latest four reported quarters** in order; replace Yahoo proxy with **FACT** PAT from filings |
| **2** | H1 annualised | Just after **H1** results; early read on FY run-rate | **High uncertainty** — seasonality (Q3/Q4 heavy names) · label **OUR ASSUMPTION** |
| **3** | 9M annualised | Rare — between Q3 results and Q4 | One quarter extrapolated · use only with explicit seasonality note |
| **6** | Smoothed / transition | PAT mix changed (M&A, one-offs) or you want **two half-year windows** | **Not** the same as exchange TTM · compare trend vs N=4 |

**Agent rule:** Never rank surplus #1 on run-rate P/E alone. Use with **Module E**, Applied PCCL, and normalized trailing fair value (`buy-decision-workflow.md` Step 4.5–5).

---

## Formulas (consolidated PAT, ₹ crore)

Let **Q₁…Qₙ** = consolidated PAT (₹ cr) for the **latest N reported quarters**, oldest → newest.

```
SumPat(N)     = Q₁ + … + Qₙ
AnnualisedPat = SumPat(N) × (4 ÷ N)
Run-rate EPS  = AnnualisedPat ÷ DilutedShares(cr)     [₹ per share]
Run-rate P/E  = CMP ÷ Run-rate EPS
```

**Alternate (when quarterly EPS is verified per share):**

```
SumEps(N)        = EPS₁ + … + EPSₙ
Run-rate EPS     = SumEps(N) × (4 ÷ N)    [when N < 4 this annualises]
TTM EPS (N = 4)  = SumEps(4)              [no extra annualisation factor]
```

**Market cap check (optional):**

```
Implied P/E from PAT = MarketCap ÷ (AnnualisedPat × 10⁷)   [PAT in ₹ absolute]
```

Use **diluted** share count as of the same result date when possible.

---

## Run-rate P/E vs conventional TTM P/E

| Lens | Numerator | Denominator | Typical source |
|------|-----------|-------------|----------------|
| **Earnings run-rate P/E (this doc)** | CMP (or MCap) | **Annualised PAT** from your **chosen N** quarters × share count you verify | Filings / EQ tab — **FACT** |
| **Conventional TTM P/E** | CMP | **Trailing twelve months EPS** (often sum of last 4Q EPS or provider TTM field) | Moneycontrol, VRO, Yahoo — may lag one quarter or mix standalone |

**When N = 4 and PAT/EPS match the provider’s four quarters**, run-rate P/E ≈ TTM P/E. Differences usually come from:

- Standalone vs **consolidated**
- One-offs not normalised
- Share count (basic vs diluted)
- **Stale** quote TTM after a new result

Always report **both** when refreshing `PARAMETERS_[TICKER].md` Part 1 P/E row, with **date checked**.

---

## Evidence labels

| Field | Label |
|-------|--------|
| PAT per quarter from BSE/NSE/AR | **FACT** |
| PAT from Yahoo / EQ auto-fill | **UNVERIFIED** until replaced |
| N = 2 or 3 annualisation | **OUR ASSUMPTION** (seasonality) |
| Diluted shares from AR | **FACT** |
| Shares inferred from CMP ÷ TTM EPS | **ASSUMPTION** |

---

## StockBook write-back (light)

When run-rate P/E materially differs from PARAMETERS TTM P/E (>10%):

1. Add one line under Part 1 **P/E** row: `Run-rate P/E (N=Q, date): X× vs TTM Y× — reason`
2. Optional FAQ in `faq.md` if user asked for buy timing off latest quarter.

---

## Agent prompt (copy-paste)

```
{TICKER} (NSE) — quarterly run-rate P/E per StockBook/QUARTERLY-RUN-RATE-PE.md.

Use consolidated PAT for the latest {N} reported quarters (default N=4).
Annualise: SumPat × (4/N). Run-rate EPS = AnnualisedPat ÷ diluted shares (cr).
Run-rate P/E = CMP ÷ run-rate EPS.

Compare to conventional TTM P/E (PARAMETERS / Moneycontrol) — explain any gap.
Label each PAT quarter FACT vs UNVERIFIED. State CMP date.
Do not use run-rate P/E as sole buy trigger; cross-ref PCCL and Module E.
```
