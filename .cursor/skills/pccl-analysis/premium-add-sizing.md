# Premium Add Sizing — Existing Holder Scale-In

Use with `pccl-analysis/SKILL.md` and `portfolio-analysis/SKILL.md`.

When the user **already holds** a stock (especially at low cost) and asks
to add at CMP **above PCCL**, use this template — not the fresh-entry-only
"wait for PCCL" rule alone.

---

## Dual decision lens (mandatory)

| Lens | Primary metric | Question |
|------|----------------|----------|
| **Fresh capital (no position)** | Premium to PCCL | Is this the best **risk/reward** vs other candidates today? |
| **Scale winner (existing holder)** | MoS vs **Conservative IV** + size cap | Is price **fair** for quality, and is add **size-limited**? |

**Do not tell an existing low-cost holder to "never add" solely because
Premium to PCCL is positive.** Quality compounders may rarely revisit PCCL
for years — PCCL touch usually needs crash or company crisis, not normal
drift. See `pccl-as-protection-not-target.md`.

**Do not tell a fresh buyer to chase** solely because MoS vs IV is ~0%.

---

## When premium-tier add is allowed

All must pass:

1. **Business quality** Strong or Moderate+ with durable moat evidence
2. **No unresolved core problem**
3. **Thesis intact** — latest results support (not one narrative)
4. **Catalyst probability ≥ 65%** if add depends on future event (tariff, recovery, etc.)
5. **MoS vs Conservative IV** ≥ 0% (at or below normal fair value) — not bubble territory
6. **Premium to PCCL** sets **maximum add size** (table below)
7. User accepts **new-tranche drawdown** to PCCL (quantify before recommending)

If MoS vs IV is **negative** (price above normal fair value) → **token SIP only**
(tier 1–2 pace) — **not** zero adds on Strong quality; **not** sell legacy.

---

## Premium-to-PCCL size cap table

| Premium to PCCL | Max add vs existing shares | Reserve dry powder |
|----------------:|---------------------------|-------------------|
| 0–15% | Up to +50–75% of qty | 25–40% for lower tiers |
| 15–25% | Up to +25–35% | 40–50% |
| **25–40%** | **Up to +10–15%** | **50–60%** |
| 40–55% | Up to +5% or token | 70%+ |
| >55% | **Minimal token** (fixed sh/mo or 0–5% surplus ₹) | 100% reserve for tier 5–4 dips |

See **`continuous-sip-valuation-tiers.md`** for five-tier labels and pace table.

Apply **concentration cap** from `portfolio-analysis` (>15–20% single name).

---

## Blended cost & new-tranche risk (copy per stock)

```
Legacy cost basis     = Qty_legacy × Avg_legacy
New tranche cost      = Qty_add × Price_add
Blended avg           = (Legacy + New) / (Qty_legacy + Qty_add)

New-tranche loss @ PCCL = (PCCL − Price_add) / Price_add × New tranche cost
Blended return @ PCCL   = (PCCL − Blended avg) / Blended avg
```

Report both:

- **Blended book** at PCCL (legacy cushion)
- **New money at risk** if price falls to PCCL (honest downside on fresh capital)

Never recommend add size where new-tranche loss @ PCCL exceeds user's
stated risk tolerance or breaks concentration rules.

---

## Scale-in ladder (existing holder)

Build **top-down** from CMP — not PCCL-only bottom-up.

| Tier | Typical zone | Role |
|------|--------------|------|
| **Tier A** | CMP ± 3% | Fair-value scale-in — **size-capped** per premium table |
| **Tier B** | −5% to −10% from CMP | Confirmation add (earnings, technical support) |
| **Tier C** | 52W low / major support | Larger tranche |
| **PCCL zone** | At pessimistic limit | Max add if core-problem test passes |

Reserve **50–60%** of intended total add when executing Tier A above 25% premium.

---

## Worked example — Bharti Airtel (Aug 2026 pattern)

**Position:** 350 @ ₹1,100 | **CMP:** ~₹1,922 | **PCCL:** ~₹1,400 | **Conservative IV:** ~₹1,950

| Metric | Value |
|--------|------:|
| Premium to PCCL | **+37%** |
| MoS vs Conservative IV | **~0%** (at fair value) |
| Legacy gain @ CMP | +75% |

**Framework read:**

- Fresh buyer with alternatives → **WAIT** or small watchlist (premium too high vs PCCL)
- Existing holder scaling winner → **Tier A add OK: 35–50 shares** (10–14% of qty)

| Add | Blended avg | New tranche loss @ PCCL ₹1,400 |
|-----|------------|--------------------------------|
| +50 @ ₹1,922 | ₹1,203 | ~−₹26k on ₹96k new capital |

**Action:** ADD 40–50 now; reserve rest for ₹1,850 / ₹1,740 tiers; catalyst Dec tariff ~70%.

---

## Anti-patterns (never)

- "Wait for PCCL forever" on Strong compounders when user holds low-cost base
- "Add large because quality" when Premium to PCCL > 40% without size cap
- Confuse **scale-in at fair value** with **averaging down** after thesis break
- Ignore **opportunity cost** vs other names closer to PCCL when deploying fresh capital

---

## Output block (paste in report when user has position)

```markdown
### Add decision — existing holder

| Lens | Reading |
|------|---------|
| Premium to PCCL @ CMP | X% → max add +Y% of qty |
| MoS vs Conservative IV | Z% → fair / expensive |
| Catalyst probability | N% |

**Recommended add @ CMP:** [qty] ([%] of existing)
**Reserve for lower tiers:** [%] of intended add
**New-tranche loss if price → PCCL:** ₹___
**Blended avg after add:** ₹___
```

Cross-ref: `portfolio-analysis` Step 5b, `yield-on-cost-overlay.md` (cyclical dividend),
`stock-agent.mdc` section 11.
