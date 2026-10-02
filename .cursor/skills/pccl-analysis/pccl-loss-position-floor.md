# PCCL Loss-Position Floor — Applied PCCL @ CMP

Use with `SKILL.md`, `pccl-dual-anchor.md`, `continuous-sip-valuation-tiers.md`,
`pccl-as-protection-not-target.md`, and comparative rank scorecards.

Implements user rule (**Aug 2026**): **PCCL protects deployed capital;
PCCL cannot be below CMP when the holder is at an unrealized loss.**

**Order:** Calculate **Rational_PCCL** → **Base_PCCL** (min with Conviction if stated)
→ **Applied_PCCL** (this file).

---

## Core rule

**Rational_PCCL** = model pessimistic limit — always calculated (see `pccl-dual-anchor.md`).

**Base_PCCL** = `min(Rational, Conviction)` when user stated Conviction; else Rational.

**Applied PCCL** (used for tiers, premium, sizing, comparative rank **A**) =

```
If existing holder AND CMP < avg cost (unrealized loss):
    Applied_PCCL = CMP
Else (fresh entry, flat, or gain on book):
    Applied_PCCL = Base_PCCL
```

**PCCL is never reported below CMP on a loss position.**

---

## Why

| Wrong (old) | Right (new) |
|-------------|-------------|
| ITC CMP ₹269, Rational ₹300 → "−10% below PCCL" → artificial MoS | At **−25% vs cost**, protection floor = **₹269 (CMP)** → premium **0%** |
| Implies margin of safety **below** current price while book is **underwater** | PCCL anchors to **capital at risk today**, not a model price above CMP |

You cannot claim pessimistic **capital protection** below the price at which
your deployed capital is already marked down.

---

## Metrics (always use Applied PCCL)

```
Premium to PCCL % = (CMP − Applied_PCCL) / Applied_PCCL × 100
```

| Situation | Rational | Conviction | Base | Applied | Premium @ CMP |
|-----------|----------|------------|------|---------|--------------:|
| Loss, Rational ₹300, CMP ₹269 | ₹300 | — | ₹300 | **₹269** | **0%** |
| Loss, Rational ₹1,800, CMP ₹2,040 | ₹1,800 | — | ₹1,800 | **₹2,040** | **0%** |
| Gain, Rational ₹900, Conviction ₹800, CMP ₹1,038 | ₹900 | ₹800 | **₹800** | **₹800** | +30% |
| Gain, Rational ₹900, CMP ₹1,045 | ₹900 | — | ₹900 | ₹900 | +16% |
| Fresh, Rational ₹1,380, CMP ₹1,477 | ₹1,380 | — | ₹1,380 | ₹1,380 | +7% |

**Report all layers** when they differ:

| Field | Purpose |
|-------|---------|
| **Rational_PCCL** | Data/model pessimistic limit — dynamic thesis anchor |
| **Conviction_PCCL** | User personal stress limit (optional) |
| **Base_PCCL** | `min(Rational, Conviction)` — lower wins |
| **Applied_PCCL** | **Tiers, premium, size caps, rank score A** |

---

## What does NOT change

- **Conservative IV / MoS** — still from normal-case scenario
- **Axis B (Current value @ CMP)** — forward P/E, sector, macro
- **Continuous SIP** — still add in quality names; tier pace uses **Applied PCCL**
- **Rational_PCCL** — still updated when earnings/risk change

---

## Comparative rank (parameter A)

In weighted scorecards:

```
Score_A = clamp(10 − Premium_to_Applied_PCCL ÷ 10, 0, 10)
```

Use **Applied PCCL**, not Rational alone, when Conviction is stricter or holder is at loss.

---

## Agent checklist

- [ ] Complete **dual anchor** first (`pccl-dual-anchor.md`)
- [ ] Check **CMP vs avg cost** before final Applied
- [ ] If loss → **Applied PCCL = CMP**; never show negative premium from Rational alone
- [ ] Show Rational / Conviction / Base separately when they differ
- [ ] Do **not** describe loss positions as "below PCCL" unless CMP literally below Applied

---

## Cross-references

- Dual anchor: `pccl-dual-anchor.md`
- PCCL skill: `SKILL.md` Steps 2b, 2c
- Framework: `stock-agent.mdc` section 10
- Glossary: `GLOSSARY.md`
