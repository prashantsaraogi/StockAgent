# Stock question framework — Ask on StockBook page

**Created:** 15 Sep 2026  
**Purpose:** When the user opens a **stock in StockBook** and asks a question (web sidebar or Cursor), the agent must answer with **structured, evidence-labelled analysis** — not generic chat.

Cross-ref: `web/lib/agent/ASK-AGENT-RULES.md` · `web/lib/stock-question-types.ts` (web quick prompts) · `ANALYSIS-LENSES-FRAMEWORK.md` · `AGENT-RULES.md` (faq write-back)

---

## Where this runs

| Channel | Entry |
|---------|--------|
| **Web** | `/stockbook/[sector]/[stock]/[tab]` → **Ask about {stock}** sidebar + quick-question chips |
| **Cursor** | Same prompts from Prompt tab · or natural language on a named ticker |
| **Analysis Log** | Every web answer → `journal/analysis/[id]` |

---

## Mandatory pipeline (stock-scoped question)

1. **Read StockBook** (tenant + repo): `summary-analysis.md` → `faq.md` → `suggested-approach.md` → `PARAMETERS_[TICKER].md` → `EARNINGS_QUALITY_[TICKER].md` if present  
2. **Read portfolio row** for ticker (qty, avg cost, sector weight)  
3. **Classify question** → apply **archetype playbook** below (or buy-decision-workflow if buy/add)  
4. **Live-search** when question mentions *latest results*, *current P/E*, *news*, *why fell* — state **date checked**  
5. **Label** every material line: FACT · MANAGEMENT CLAIM · HYPOTHESIS · OUR ASSUMPTION · UNVERIFIED  
6. **Verdict** — closed vocabulary from ASK-AGENT-RULES  
7. **Write-back (Light tier):** append Q&A to `faq.md` with date; refresh `summary-analysis.md` only if verdict/tier changed  

---

## Question archetypes

### Q1 — P/E vs growth sync (post-results)

**Triggers:** “Is P/E justified?”, “growth and PE in sync?”, “recent results justify valuation?”

**Required analysis blocks:**

| Block | Content |
|-------|---------|
| **Results snapshot** | Latest quarter: revenue YoY, EBITDA/PAT YoY, margin delta — **FACT** from filing |
| **One-off / quality table** | Each non-recurring item (asset sale, insurance, tax credit) → adjust **normalized PAT** |
| **Sync table** | Row: metric (revenue / EBITDA / norm PAT) vs **trailing P/E** → “in sync?” Yes/No/Partial |
| **PEG sanity** | Trailing P/E ÷ **normalized** EPS growth % → interpret (not PEG=1 alone) |
| **Vs own history** | P/E vs 10Y avg from PARAMETERS — cheap vs history ≠ growth parity |
| **Holder lens** | Existing vs fresh: add gate, PCCL premium, mandate (HOLD default) |

**Forbidden:** Treating headline PAT growth as proof of sync when revenue is low single-digit and one-offs material.

---

### Q2 — Post-results “what changed?”

**Triggers:** “After Q2 results…”, “what changed in thesis?”

Output: **Before vs after** table (thesis, EPS normal, margin, segment mix, PCCL need refresh Y/N).

---

### Q3 — Add at CMP / buy today

**Triggers:** buy, add, accumulate → full **`buy-decision-workflow.md`** (not this archetype alone).

---

### Q4 — Why did it fall?

**Triggers:** down 15%+, “why falling”, average after drawdown → **`price-decline-analysis`** skill + §22 driver table.

---

### Q5 — PCCL / premium / SIP pace

**Triggers:** “above PCCL”, “still add?”, “SIP pace”

Output: Rational / Conviction / Base / **Applied** PCCL (loss-position floor), tier 1–5, suggested-approach excerpt.

---

### Q6 — Cheap vs own 10Y history

**Triggers:** “vs historical P/E”, “PARAMETERS read”

Output: Part 1 PARAMETERS table excerpt + **do not** equate cheap vs history with cheap vs forward earnings power.

---

## Web response structure (extends ASK-AGENT-RULES)

For **Q1 P/E sync**, insert after **Analysis**:

```markdown
### Results snapshot (date checked: YYYY-MM-DD)
### One-off & normalized earnings
| Item | ₹ cr | Type | PAT impact |
### Growth vs P/E sync
| Metric | YoY | In sync with ~XX× P/E? |
### PEG / forward note (confirmatory)
### Implication for your book (if held)
```

Then standard **Verdict** + **Quotes lens**.

---

## FAQ write-back template

Append to `faq.md`:

```markdown
### Q: {user question} ({YYYY-MM-DD})
**A:** One-line verdict. Key FACT: … Normalized PAT … P/E sync: No/Partial/Yes. See Analysis Log {id} if web.
```

---

*Archetype IDs in web: `pe-growth-sync`, `post-results`, `add-at-cmp`, `price-decline`, `pccl-sip`, `pe-vs-history`.*
