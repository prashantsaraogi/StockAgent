# Legal Overhang — Speculative Position Sizing

Use with `legal-threat-analysis/SKILL.md`, `legal-proceedings-checklist.md`,
`pccl-analysis/SKILL.md`, and `portfolio-analysis/SKILL.md`.

Implements `stock-agent.mdc` section 21 (Legal Threat) sizing overlay.

---

## Purpose

Some stocks have **good operations** but **unresolved legal/tax/licence
overhang** (Delta Corp pattern: casinos run, GST demand open).

This template answers:

> **Can the business survive? Should I buy? How much?**

Separate three layers — never merge them:

| Layer | Question |
|-------|----------|
| **Solvency** | Can the company pay worst-case liability without equity wipeout? |
| **Operations** | Is the core business still earning cash ex-provisions? |
| **Investment** | Is price vs PCCL attractive **after** legal discount? |

**Good operations do not justify full-size buy while law is unresolved.**

---

## Mandatory workflow (every legal-overhang name)

1. Build **proceeding register** — one row per case (`legal-proceedings-checklist.md`)
2. Run **tax demand stress test** (net cash vs worst-case)
3. Classify: **dispute** vs **existential** (licence ban / demand > net worth)
4. Model **best / base / worst** liability → **three-scenario PCCL**
5. Assign **catalyst probability** per outcome
6. Set **max position size** from table below — **never** standard premium-add rules
7. Define **pre-event action plan** (favourable / adverse / mixed)
8. **Search latest** news + Reg 30 on analysis date

---

## Solvency stress test (copy per stock)

```
Net cash + liquid investments (consolidated)  = ₹___ cr   [FACT]
Net worth (consolidated)                        = ₹___ cr   [FACT]
Booked provision (latest quarter)               = ₹___ cr   [FACT]
Disclosed contingent / show-cause (worst)       = ₹___ cr   [FACT / AR note]
Annual operating cash flow (normalized)         = ₹___ cr   [ASSUMPTION]

Ratio A = Worst-case demand / Net cash          = ___×
Ratio B = Worst-case demand / Net worth         = ___×
Ratio C = Booked provision / Net cash           = ___×
Years to pay provision from OCF alone           = ___ yrs
```

| Ratio A (worst / net cash) | Solvency read |
|---------------------------:|---------------|
| **< 0.3×** + stay in place | **Survivable** — monitor |
| **0.3–1.0×** | **Strained** — may survive via OCF + assets over time |
| **1.0–3.0×** | **High risk** — equity dilution / asset sale likely |
| **> 3.0×** | **Existential** — avoid fresh capital; exit if held |

| Ratio B (worst / net worth) | Framework |
|----------------------------:|-----------|
| **< 0.25×** | Legal is **dispute**, not core-problem (if ops OK) |
| **0.25–1.0×** | **Core-problem candidate** — PCCL haircut; spec size only |
| **> 1.0×** | **Existential** — do not buy; trim if held |

**Provision booked ≠ problem over** — appeals and other proceedings continue.

---

## Three-scenario legal + PCCL bridge

For each scenario: **final liability** → **impact on sustainable PAT** → **EPS** → **P/E** → **value**.

| Scenario | Liability (indicative) | Sustainable PAT | EPS | P/E | Value |
|----------|------------------------|----------------:|----:|----:|------:|
| **Best (optimistic IV)** | | | | | |
| **Base (normal IV)** | | | | | |
| **Worst (PCCL)** | | | | | |

**PCCL** always uses **worst-scenario sustainable EPS** × **legal-discount multiple**
(typically **lower** than clean-comps P/E).

---

## Position size caps (legal-overhang names)

**Overrides** `premium-add-sizing.md` and standard portfolio caps.

| Classification | Max single-name weight | Max fresh capital tranche | Averaging |
|----------------|----------------------:|--------------------------:|-----------|
| **Existential** (Ratio B > 1×) | **0%** fresh | **None** | **Never** |
| **High risk** (Ratio B 0.25–1×) | **≤ 2%** of portfolio | **Token** — one tranche | **No** until order quantifies |
| **Dispute** (Ratio B < 0.25×, stay active) | **≤ 3–5%** | **Small staged** | Only **below PCCL** with catalyst |
| **Resolved** (favourable order + quantified) | Normal rules resume | Reassess PCCL ↑ | Size cap lifted after 1 quarter proof |

**Never:**

- Lump buy because “business still makes money”
- Average down on legal hope without **written order** reducing liability
- Treat **one provision** as full resolution of **all** proceedings
- Exceed **2%** portfolio on names with **unadjudicated** demand **> net worth**

---

## Entry ladder (speculative only)

Build **bottom-up from PCCL**, not from CMP momentum.

| Tier | Typical zone | Role |
|------|--------------|------|
| **Watch** | Above normal IV | **No buy** — legal tail unresolved |
| **C** | PCCL upper band | **Token** — ≤0.5–1% portfolio |
| **B** | PCCL mid | **Small** — total ≤2% if dispute class |
| **A** | PCCL lower + favourable catalyst | **Max spec** — still ≤2% if high-risk class |

**Reserve 100%** of intended spec capital until **binary event** passes or
liability is **quantified in writing** (order / adjudication, not management claim).

---

## Pre-event action matrix (mandatory before hearing / order)

| Outcome | Framework action |
|---------|------------------|
| **Favourable** (stay extended, remand, chip-basis upheld) | Reassess PCCL **up**; **small** add only if still ≤2% weight |
| **Mixed** (sent back to adjudication) | **HOLD** token; **no add** — volatility |
| **Adverse** (demand upheld near worst case) | **No add**; **trim** toward 0%; lower PCCL sharply |
| **Existential** (licence lost, ban) | **EXIT** review — core-problem fail |

---

## Output block (paste in every legal-overhang report)

```markdown
### Legal overhang — solvency & sizing

| Test | Result |
|------|--------|
| Worst demand / net cash | ___× |
| Worst demand / net worth | ___× |
| Classification | Dispute / High risk / Existential |
| Ops ex-exceptional (latest Q) | PBT ₹___ cr — profitable? Y/N |
| PCCL (worst scenario) | ₹___ |
| Normal IV (base legal) | ₹___ |
| CMP premium to PCCL | ___% |
| Max portfolio weight | ≤___% |
| Fresh capital | Avoid / Token @ PCCL / Wait for order |
| Never | Average on legal hope |
```

---

## Reference implementation

Full worked example: **Delta Corp** in
[legal-proceedings-checklist.md](legal-proceedings-checklist.md) — Delta Corp section (Aug 2026).

Cross-ref: `stock-analysis/SKILL.md` Step 0c, `portfolio-analysis/SKILL.md` Step 5d.
