# Negative risk files — Agent rules

**Created:** 25 Aug 2026  
**Purpose:** Persist **external** and **internal** downside risks per stock with **three-level growth impact**.

---

## Two files per stock (mandatory for full StockBook folder)

| File | Contents | Examples |
|------|----------|----------|
| **`external-negative-risk.md`** | Macro, geopolitical, oil/FX, RBI, sector cycle, policy | L&T: Middle East tension, oil → inflation, ME project delay |
| **`internal-negative-risk.md`** | Governance, execution, AI/disruption, legal, balance sheet | HDFC Bank: post-merger integration; TCS/INFY: AI; Delta: GST/legal |

**Not the same as** `detail-analysis.md` § risks — these registers are **living**, **dated**, and **quantified** (growth haircut L1/L2/L3).

---

## Three-level impact (growth rate)

Apply to **each risk row** and **combined stress scenarios**:

| Level | Growth haircut | Meaning |
|:-----:|----------------|---------|
| **L1** | 0–2 pp off base EPS CAGR | Noise / temporary — monitor |
| **L2** | 3–7 pp | Material — slow SIP, cut surplus |
| **L3** | ≥8 pp or existential | Structural — PCCL cut, pause adds, EXIT review |

Always state **base-case sustainable EPS growth** at top of file (ASSUMPTION until quarterly refresh).

Label evidence: **FACT** · **MANAGEMENT CLAIM** · **HYPOTHESIS** · **OUR ASSUMPTION** · **UNVERIFIED**.

---

## When to read

Before **add/hold/PCCL/sizing** on a stock — after `summary-analysis.md`, alongside latest `News/`.

```
summary-analysis.md → external-negative-risk.md → internal-negative-risk.md → faq.md → suggested-approach.md
```

---

## When to update

| Trigger | Action |
|---------|--------|
| Material news (geo, policy, sector) | Update **external** register + `News/TICKER-INDEX.md` |
| Results, governance, legal, AI KPI | Update **internal** register |
| Level upgrade L1→L2 or L2→L3 | Refresh `suggested-approach.md` pace + `summary-analysis.md` verdict |
| User asks risk question | Append row + date; do not delete old rows — mark superseded |

**Exemplar (full depth):** `Infrastructure/Larsen and Toubro/external-negative-risk.md` · `internal-negative-risk.md`

**Batch starter:** `StockBook/_apply-negative-risk-all-stocks.ps1` — sector stubs; deepen on quarterly refresh.

---

## Combined read rule

**Worst of external + internal level** sets **stress growth** for PCCL sensitivity — do not ignore L3 internal because external looks fine (e.g. IT AI internal L2–L3 while macro L1).
