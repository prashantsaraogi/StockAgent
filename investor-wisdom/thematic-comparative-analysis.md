# Thematic Comparative Analysis — Mandatory Workflow

**Project:** My-agent · **Created:** 4 Sep 2026  
**Purpose:** When the user asks a **theme / sector / value-chain** question (e.g. data-centre/AI infra, hospital policy, OMC cycle), run the **full investment framework on every stock in scope** and **update all StockBook files** in the same session.

Cross-ref: `buy-decision-workflow.md` · `sector-news-orientation-lens.md` · `stock-analysis/SKILL.md` · `StockBook/AGENT-RULES.md`

---

## User rule (mandatory — Sep 2026)

> **Whenever the user asks for thematic analysis, run the framework and update reports for all stocks in scope — not chat-only.**

**In scope** = every ticker **named by the user** or **in the theme shortlist** for that request.  
**Not** all 51 portfolio holdings unless the user explicitly says **“whole portfolio”**.

---

## When to trigger

| User asks… | Action |
|------------|--------|
| “Which stocks benefit from X?” | Build shortlist → **full run on each name in shortlist** |
| “Analyze [theme] like Havells” | Same + **L10 sector lens** + **Havells-style** orientation brief |
| “Rank A vs B vs C for 2-year invest” | Comparative doc + **per-stock Report update** |
| “Run framework on top 5…” | All 5 folders created/updated |

**Skip StockBook write-back only if:** user says **“chat only”** or **“don’t save.”**

---

## Workflow (order fixed)

```
Step 1  Define theme + value chain + in-scope ticker list
Step 2  Live search — capacity/policy/orders (Module A/B + L10)
Step 3  Per stock: exclusion guards → business model → DC/theme exposure %
Step 4  Per stock: FY27/FY28 revenue, EBITDA, PAT, EPS (FACT vs ASSUMPTION)
Step 5  Per stock: trailing P/E, forward FY27/FY28 P/E, PCCL/tier
Step 6  Comparative rank table (exposure × growth × valuation × balance sheet)
Step 7  2Y bull / base / bear @ FY28 EPS × reasonable P/E (per name)
Step 8  Fresh-capital rank + portfolio names vs watchlist names
Step 9  Write sector comparative markdown (StockBook/[Sector]/[theme]-comparative.md)
Step 10 Update EVERY in-scope stock StockBook/ folder (Standard tier minimum)
Step 11 News/TICKER-INDEX + daily summary if material
Step 12 Quotes lens if user asked buy/add
```

---

## Per-stock Report update checklist (Standard tier)

For **each** ticker in scope, touch at minimum:

| File | Content to add/update |
|------|------------------------|
| `summary-analysis.md` | Verdict + theme exposure one-liner + comparative rank |
| `detail-analysis.md` | Theme module (exposure %, products, orders, FY27/28 table) |
| `faq.md` | Q: theme exposure + rank vs peers |
| `suggested-approach.md` | Entry zone vs theme rank; staged starter if not held |
| `external-negative-risk.md` | Theme-specific headwind row |
| `PARAMETERS_[TICKER].md` | Forward FY27/28 row if missing |
| `BROKER_[TICKER].md` | If broker theme note exists |

**Create full folder** if missing — do not leave theme names report-less.

---

## Theme module template (paste into `detail-analysis.md`)

```markdown
## [Theme] exposure — [date]

| Row | Content |
|-----|---------|
| **Direct exposure rating** | ⭐1–5 |
| **Products supplied** | … |
| **Est. revenue from theme** | X–Y% (ASSUMPTION — cite source) |
| **Confirmed orders / capacity** | … (FACT / UNVERIFIED) |
| **FY27E / FY28E EPS growth** | … |
| **Trailing / FY27 / FY28 P/E** | … |
| **2Y bull / base / bear (FY28 EPS × P/E)** | ₹ … / … / … |
| **Comparative rank (theme)** | #N of M |
| **Portfolio action** | HOLD / starter / watchlist / 0% surplus |
```

---

## Comparative master file

Path pattern:

```
StockBook/[Sector]/[theme-slug]-comparative-rank.md
```

Example: `StockBook/Infrastructure/data-centre-beneficiaries-comparative-rank.md`

Must include: executive rank table · side-by-side valuation · fresh ₹ rank · triggers · evidence dates.

---

## Integration with existing lenses

| Lens | Theme analysis use |
|------|-------------------|
| **L10** | Policy + ground reality (e.g. DC capacity GW, room-rent irrelevant) |
| **PCCL** | Still governs sizing — theme tailwind ≠ ignore tier |
| **IPO forensic** | If theme name recently listed |
| **Personal discipline** | IT cluster 0% surplus even if “AI theme” |

**Rule:** Theme rank ≠ override pause registry or PCCL tier 1–2 lump sum.

---

## Agent checklist (copy before ending thematic turn)

- [ ] All in-scope tickers identified explicitly
- [ ] Live search date stated
- [ ] Comparative rank file written
- [ ] **Every** in-scope ticker has Report updated (Standard tier)
- [ ] Portfolio holdings flagged separately from watchlist
- [ ] No “sell A to buy B” on legacy holdings
- [ ] TICKER-INDEX updated for held names

---

## Change log

| Date | Change |
|------|--------|
| 2026-09-04 | Initial rule — user: run framework + update all reports whenever thematic analysis requested |
