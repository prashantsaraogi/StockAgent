# PCCL Dual Anchor — Rational + Conviction → Applied

Use with `SKILL.md`, `pccl-loss-position-floor.md`, `continuous-sip-valuation-tiers.md`,
comparative rank scorecards, and every stock `StockBook/`.

Implements user rule (**Aug 2026**): two PCCL types; **always use the lower
anchor for calculations** (then apply loss-position floor).

---

## Three PCCL layers

| Layer | Short name | Source | When set |
|-------|------------|--------|----------|
| **1** | **Rational_PCCL** | Model / data | **Always** — pessimistic normalized EPS × conservative multiple |
| **2** | **Conviction_PCCL** | User | **Optional** — when user states personal stress limit |
| **3** | **Applied_PCCL** | Framework output | **Always** — used for tiers, premium, sizing, rank **A** |

**Alias:** Rational_PCCL = former **Stress PCCL** (same calculation; rename for clarity).

---

## Calculation order (mandatory)

### Step A — Rational_PCCL (always)

```
Rational_PCCL = Pessimistic normalized EPS × Conservative P/E
```

- Always calculate from filings / normalized earnings.
- If reported as a range (e.g. ₹900–1,000), use the **low end** for `min()` logic unless a single point is explicitly chosen in the report.

### Step B — Base_PCCL (lower wins)

```
If Conviction_PCCL is stated:
    Base_PCCL = min(Rational_PCCL, Conviction_PCCL)
Else:
    Base_PCCL = Rational_PCCL
```

**Rule:** When both exist, **the lower number governs** — stricter capital protection.

| Rational | Conviction | Base (used) |
|----------|------------|-------------|
| ₹900 | ₹800 | **₹800** |
| ₹800 | ₹900 | **₹800** |
| ₹900 | *(none)* | **₹900** |

Record Conviction_PCCL in `faq.md` when user states it (e.g. Tata Consumer ₹800).

### Step C — Applied_PCCL (loss floor on top of Base)

```
If existing holder AND CMP < avg cost (unrealized loss):
    Applied_PCCL = CMP          ← PCCL cannot be below CMP
Else:
    Applied_PCCL = Base_PCCL
```

See `pccl-loss-position-floor.md` for why loss book uses CMP.

### Full formula (one block)

```
Rational_PCCL   = model (always)
Conviction_PCCL = user (optional)
Base_PCCL       = min(Rational, Conviction) if Conviction stated else Rational
Applied_PCCL    = CMP if holder at loss else Base_PCCL
```

---

## Metrics — always Applied_PCCL

```
Premium to PCCL % = (CMP − Applied_PCCL) / Applied_PCCL × 100
```

SIP tiers (Axis A), size caps, comparative rank **A**, and premium-add tables
**must use Applied_PCCL** — never Rational alone when Conviction is stricter.

---

## Reporting table (when layers differ)

Show all relevant columns:

| Field | Report when |
|-------|-------------|
| **Rational_PCCL** | Always |
| **Conviction_PCCL** | When user stated |
| **Base_PCCL** | When Conviction stated (shows min result) |
| **Applied_PCCL** | Always — **bold** as the working anchor |

Example — Tata Consumer @ gain, CMP ₹1,038:

| Rational | Conviction | Base | Applied | Premium |
|----------|------------|------|---------|--------:|
| ₹900 | ₹800 | **₹800** | **₹800** | +30% |

Example — ITC @ loss, CMP ₹269:

| Rational | Conviction | Base | Applied | Premium |
|----------|------------|------|---------|--------:|
| ₹300 | — | ₹300 | **₹269** (CMP) | 0% |

---

## What does NOT change

- **Conservative IV / MoS** — normal-case scenario only
- **Axis B** — forward P/E, sector, macro
- **Continuous SIP** — pace from **Applied_PCCL**
- **Rational_PCCL** — still updated when earnings/risk change (thesis anchor)

---

## Agent checklist

- [ ] Calculate **Rational_PCCL** every analysis
- [ ] Read `faq.md` for **Conviction_PCCL** before premium/tier math
- [ ] **Base = min(Rational, Conviction)** when Conviction exists
- [ ] **Applied** = loss floor(Base) per `pccl-loss-position-floor.md`
- [ ] Never use Rational alone for tiers when Conviction is lower
- [ ] Persist new Conviction_PCCL to `faq.md` in same session

---

## Cross-references

- PCCL skill: `SKILL.md` Steps 2, 2b, 2c
- Loss floor: `pccl-loss-position-floor.md`
- Framework: `stock-agent.mdc` §10
- Glossary: `GLOSSARY.md` — Rational_PCCL, Conviction_PCCL, Applied_PCCL
