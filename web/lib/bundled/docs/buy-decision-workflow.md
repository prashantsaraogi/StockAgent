# Buy Decision Workflow — Personal Discipline + Quotes Lens

**Project:** My-agent · **Created:** 28 Aug 2026  
**Purpose:** Mandatory process when user asks **buy / add / accumulate / buy today** on any Indian stock. Combines framework analysis with **personal discipline** and **investor quotes** for confidence and impulse control.

**Exemplar:** Dr. Reddy's fresh entry (28 Aug 2026) — `StockBook/Pharma/Dr Reddys Laboratories/`

Cross-ref: `personal-discipline.md` · `quotes.md` · `stock-analysis/SKILL.md` · `stock-agent.mdc` §13

---

## When to run (mandatory)

Run **full workflow** when user:

- Plans to **buy today** or asks "is it worth buying?"
- Asks to **add** to an existing position
- Compares two+ names for fresh capital
- Proposes a **lump sum** or "deploy all surplus"

**Skip quotes table only for:** pure HOLD questions with no capital deployment, or factual data requests.

---

## Workflow — 10 steps (order fixed)

```
Step 1  Personal discipline pre-flight
Step 2  Exclusion guards + fraud/legal screens
Step 3  Structural-threat & pause registry
Step 4  Sector comparative rank + opportunity cost
Step 4.5 Sector news + business-orientation synthesis (Module E) — mandatory before Axis B
Step 5  PCCL dual anchor + tiers (Axis A) + conviction fair + forward (Axis B, subordinate)
Step 6  Core-problem test + catalyst probability → size band
Step 7  Fresh vs existing holder lens
Step 8  Quotes lens (mandatory table)
Step 9  Verdict: staged starter vs lump sum vs wait vs pause
Step 10 StockBook write-back + holdings update if trade confirmed
```

---

## Step 1 — Personal discipline pre-flight

Read **`personal-discipline.md`** + **`holdings.md`**.

| Check | If fail → |
|-------|-----------|
| Ticker in **pause registry** (TCS, HDFCLIFE, ITC, IGL) | **PAUSE ADDS** — HOLD legacy · 0% surplus |
| Ticker in **Bucket A/B/C** (IT cluster, HDFCBANK, ITC tax) | **No ADD** per bucket rules |
| User motive = "fix avg cost" on underwater name | **Reject add** — cite `quotes.md` §2 |
| User motive = "must deploy cash today" | **Flag impulse** — cite `quotes.md` §1 / §8 |
| Fresh name vs loss-averaging trap | Fresh OK only if **zero position** + not structural pause |

---

## Step 2 — Exclusion guards + fraud/legal

Run `stock-analysis/exclusion-guards.md`, fraud screen (banks), legal overhang if applicable.

**HARD EXCLUDE** → no buy ladder; HIGH ALERT banner.

---

## Step 3 — Structural threat & pause registry

Run `structural-threat-analysis` when AI, disruption, regulation, or governance material.

| Verdict | ADD rule |
|---------|----------|
| **Permanent structural** (moat destroyed) | **0% surplus** · existential exit review if held |
| **Transitional / L2** (e.g. pharma US pricing, semaglutide) | **Staged only** · catalyst prob required |
| **Temporary / cyclical** | Normal PCCL + tier rules |

---

## Step 4 — Sector comparative rank + opportunity cost

Read sector `*-comparative-rank.md` if exists (Healthcare, Pharma, FMCG, Banking, …).

| Output | Rule |
|--------|------|
| **Fresh-entry rank** (#1, #2, …) | State explicitly |
| **Higher-ranked peer** | Name it — "Lupin #1 vs Dr Reddy #2" |
| **Surplus slice %** | From comparative rank, not generic template |
| **Better company ≠ better buy** | Always state when quality rank ≠ fresh-capital rank |

---

## Step 4.5 — Sector news + business-orientation synthesis (mandatory)

Read **`sector-news-orientation-lens.md`** and run **`dynamic-context-analysis` Module E** before Step 5.

| Deliverable | Rule |
|-------------|------|
| **News depth** | `TICKER-INDEX` + latest **3** `News/` summaries + live search + peer rows |
| **Orientation brief** | Future direction + sector challenges table (temp vs structural) |
| **Earnings proof** | PAT/cash vs EBITDA story — partial/no → haircut forward |
| **Forward haircut** | Apply if L2 policy/competition active (document pp or %) |

**Do not** call Axis B **Fair** or rank **#1 surplus** until Step 4.5 is complete.

Detail: `investor-wisdom/sector-news-orientation-lens.md`

---

## Step 5 — PCCL + dual axis @ CMP

| Field | Source |
|-------|--------|
| Rational_PCCL | Model |
| Conviction_PCCL | `faq.md` if user stated |
| Applied_PCCL | `pccl-dual-anchor.md` + loss floor |
| Premium to Applied | Tier 1–5 (Axis A) |
| **Primary fair** | Normalized **trailing** EPS × conviction P/E (if user stated) |
| **Axis B** | Forward P/E + sector — **subordinate**; confirmatory only after Step 4.5 |

**Valuation hierarchy:** Applied PCCL → conviction fair → **L10 news/orientation** → Part 1 trailing → Part 2 forward.

**Divergence rules:**

| Pattern | Verdict |
|---------|---------|
| Axis A expensive + Axis B fair | **Small staged add only** — not lump sum |
| Axis B fair + L10 L2 policy/challenge unresolved | **News wins** — token or **PAUSE**; forward P/E **cannot** justify #1 rank |
| Trailing P/E > conviction cap | **PAUSE/token** on fresh ₹ regardless of forward |
| Step 4.5 not run | **Do not** state Fair or surplus rank |

---

## Step 6 — Core-problem + catalyst → size band

Ask: **"Why is this cheap / why buy now?"**

| Catalyst prob | Fresh capital rule |
|---------------|-------------------|
| **<50%** | **WAIT** |
| **50–65%** | **Small / staged only** (starter 3–5 sh or monthly SIP cap) |
| **65–75%** | Staged buying |
| **>75%** | Stronger opportunity if MoS + downside quantified |

Q1 miss with **one-off provision** → temporary **if** evidence supports; still cap size at 50–65% band until confirmed.

---

## Step 7 — Fresh vs existing holder

| Context | Default sizing |
|---------|----------------|
| **Fresh (zero shares)** | **Starter 3–5 sh** if Tier 2+ · max **≤2%** book until proof |
| **Existing gain, above PCCL** | Premium size cap (`premium-add-sizing.md`) |
| **Existing loss** | **No add to fix avg** if on pause registry; else Applied PCCL floor only |
| **Lump sum request** | **Downgrade** to staged unless Tier 4–5 + core-problem pass |

---

## Step 8 — Quotes lens (mandatory output)

Include a **Quotes lens** table in chat **and** append to `faq.md` as **"Quotes lens"** Q when user asks to buy.

**Minimum 3 quotes** from `quotes.md` covering:

| Theme | When required |
|-------|---------------|
| §1 or §8 Patience / cash | Always if user tends to deploy same day |
| §2 or §3 Don't average / expensive price | If underwater peer or Tier 2+ premium |
| §5 or §9 Core-problem / cheap reason | If stock down or Q1 miss |
| §6 Quality vs price | Always on fresh buy |
| §4 Structural | If sector threat (IT, tax, governance) |

**Format:**

| Quote | Investor | What it means for **you today** |
|-------|----------|----------------------------------|

Plus **one closing quote** in the verdict line.

---

## Step 9 — Verdict templates

| Verdict | When | Typical action |
|---------|------|----------------|
| **STAGED STARTER OK** | Fresh · rank #2+ · Tier 2 · catalyst 50–65% | **3–5 sh today** · not lump sum |
| **ACCUMULATE (SIP)** | Tier 3–4 · no structural pause · rank #1 | **Monthly pace** per comparative rank |
| **WAIT** | Catalyst <50% · Tier 1–2 · better peer ranked | **Hold cash** · cite Munger/Buffett |
| **PAUSE ADDS** | Pause registry · structural bucket | **0% surplus** · HOLD legacy |
| **AVOID fresh** | Hard exclude · existential legal | No new capital |

**Always state:** vs **#1 peer in sector** · **surplus slice %** · **lump sum yes/no**.

---

## Step 10 — StockBook write-back

| Item | File |
|------|------|
| Verdict one-liner | `summary-analysis.md` |
| Quotes lens Q&A | `faq.md` |
| Staged ladder / today rule | `suggested-approach.md` |
| Trade after fill | `holdings.md` + change log |

**Create** `StockBook/[Sector]/[Stock Name]/` on first meaningful buy discussion.

---

## Agent checklist (copy before answering "buy today?")

- [ ] `personal-discipline.md` — not on pause / structural bucket
- [ ] Exclusion guards pass
- [ ] Sector comparative rank + #1 peer named
- [ ] **Step 4.5** orientation brief (news depth + challenges)
- [ ] Applied PCCL + tier + conviction fair + Axis B (subordinate)
- [ ] Catalyst prob → size band
- [ ] Fresh starter vs lump sum explicit
- [ ] **Quotes lens table** (≥3 rows) + closing quote
- [ ] Report updated same session

---

## Change log

| Date | Change |
|------|--------|
| 2026-08-28 | Initial workflow — Dr Reddy's exemplar; quotes lens mandatory on buy |
| 2026-09-03 | Step 4.5 sector news + orientation lens; forward P/E subordinate; Max exemplar |
| 2026-09-04 | Step 0e thematic comparative — update all in-scope StockBooks; user rule mandatory |
