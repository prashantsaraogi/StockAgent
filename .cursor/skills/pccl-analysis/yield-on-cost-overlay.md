# Yield on Cost & Income on Capital Overlay

Use with `pccl-analysis/SKILL.md` for **dividend-paying cyclicals** (OMC, PSU,
banks, utilities, mature FMCG) when the user cares about **income on deployed
capital** — **never** dividend yield on current market price alone.

---

## User mandate (hard rule for dividend stocks)

> **Dividend is measured on YOUR deployed capital (avg cost / cost basis) — not on CMP or market value.**

| Wrong metric | Right metric |
|--------------|--------------|
| Dividend yield on CMP (e.g. 2.5% @ ₹118) | **YoC on avg cost** (e.g. 6.2% @ ₹48.69) |
| Income / current market value | **Annual dividend ₹ / cost basis** |
| "Cheap yield" at high CMP | **Blended YoC after every proposed add** |

### 8% add gate (default hurdle)

For **high-dividend / income** names, **do not recommend ADD** unless there is a
**probable path to blended normalized YoC ≥ 8%** on deployed capital:

```
YoC % = Normalized dividend per share / Your blended avg cost × 100

ADD allowed only if:
  Blended YoC (after add @ proposed price) ≥ 8%
  AND normalized dividend assumption is defensible (not peak-cycle alone)
  AND probability of sustaining ≥ 8% is stated (see probability table below)
```

**If current YoC < 8% and adds at CMP cannot reach 8%:** **HOLD legacy · pause adds**
until (a) **dividend rises** on existing book, or (b) **price falls** enough that
blended YoC ≥ 8% at normalized dividend.

**Report always:**

1. YoC on **current avg cost** (not CMP)
2. **Dividend ₹ on cost basis** (qty × div / cost basis)
3. **Blended YoC** after any proposed add
4. **Dividend ₹/share needed for 8%** on current cost: `Avg cost × 0.08`
5. **Probability** of reaching ≥ 8% YoC (base / optimistic / pessimistic)

---

## Why this exists

**PCCL alone is insufficient** for names where:

- Legacy cost is far below CMP (high yield on cost)
- User wants **quantity and total dividend ₹** to grow
- Cyclical earnings swing but **normalized dividend** remains meaningful
- Stock may **never revisit PCCL** in a normal cycle

**Do not use a single-line rule:** "above PCCL → never add."

Run **Income on Capital (IoC) first**, then PCCL for **size cap and downside**,
not as the only veto.

---

## Core metrics (report all three)

### 1. Yield on Cost — YoC (primary for holder)

```
YoC % = Normalized annual dividend per share / Your avg cost × 100
```

Use **normalized dividend** — not peak-cycle FY26 ₹8.25 for OMC unless labeled
**TRAILING PEAK (FACT, may not repeat)**.

Also show **trailing YoC** separately with warning label.

**Do not use** dividend yield on CMP for add/hold on existing positions —
it penalizes winners and flatters new buys at high prices.

### 2. Blended YoC after proposed add

```
Blended avg cost = (Qty × Avg + Qty_add × Price_add) / (Qty + Qty_add)
Blended YoC = Normalized dividend / Blended avg × 100
```

Add is **acceptable only if blended YoC stays ≥ hurdle** (below).

### 3. Total dividend income (₹)

```
Annual dividend ₹ = Total shares × Normalized dividend per share
Δ Income = (New shares − Old shares) × Normalized dividend
```

User may rationally add above PCCL to **raise absolute income** if YoC hurdle
passes and size is capped.

---

## Normalized dividend rules (cyclical / OMC)

| Label | Use |
|-------|-----|
| **Trailing (last FY)** | FACT — may be peak or trough |
| **Normalized (base case)** | OUR ASSUMPTION — mid-cycle or weak-normal year |
| **Pessimistic (PCCL year)** | Dividend if earnings match PCCL scenario |

Never extrapolate **record FY** dividend indefinitely (OMC FY26, etc.).

For IOC-style names: build normalized from **FY25-type weak-normal** and
**partial recovery** — not FY26 peak alone.

---

## IoC hurdle table (default — user: **8%+ gate**)

| Blended YoC (normalized) | Add? |
|--------------------------|------|
| **≥ 8%** | **Allowed** — staged add; size cap per PCCL premium table |
| **7–8%** | **Wait** — legacy HOLD only; no add until ≥ 8% probable |
| **6–7%** | **No add** — dividend hike or much lower price needed |
| **< 6%** | **No add** — HOLD legacy; income on cost acceptable but no new capital |

**User constraint:** Add dividend stocks **only while probability of ≥ 8% YoC on
deployed capital holds** — not "any positive yield on CMP."

### Probability of ≥ 8% YoC (report for every dividend name)

| Band | Meaning | Typical action |
|------|---------|----------------|
| **>65%** | Normalized div + price path clearly supports 8% | Staged add if blended math passes |
| **50–65%** | Achievable if 1–2 catalysts land (div hike, CET1, cycle) | Small add or wait for catalyst |
| **<50%** | 8% needs aggressive div or unrealistically low CMP | **HOLD only · no add** |

Adjust hurdle down 0.5–1% only if user states **effective after-tax** rate — label ASSUMPTION.

---

## Combined decision flow (not single rule)

```
1. Core-problem test → pass?
2. Normalized YoC on current cost → report
3. Blended YoC if add @ CMP → ≥ hurdle?
4. Premium to PCCL → sets MAX size (cap table below)
5. MoS vs Conservative IV → fair or expensive?
6. Catalyst / crude / policy (cyclical) → probability
7. Opportunity cost vs other portfolio names
→ ADD (size) / HOLD / WAIT
```

**PCCL protects downside sizing. YoC unlocks quantity growth above PCCL.**

---

## Premium size cap — cyclical dividend overlay

When **blended YoC ≥ 8%** (normalized) AND core-problem pass:

| Premium to PCCL | Max add vs existing qty |
|----------------:|------------------------|
| 0–25% | +25–40% |
| 25–45% | +10–20% |
| 45–60% | **+5–10%** |
| >60% | +5% token max |

Stricter than quality-compounder premium add — cyclical risk remains.

When blended YoC **7–8%**: half the above caps.

When blended YoC **< 7%**: PCCL-zone adds only.

---

## Worked example — IOC (Aug 2026)

**Recorded:** 1,003 shares @ **₹68.31** blended (930 @ ₹63 + 73 @ ₹136)

| Dividend scenario | ₹/share | YoC on ₹68.31 | Label |
|-------------------|--------:|--------------:|-------|
| FY26 trailing | 8.25 | **12.1%** | FACT — peak year |
| Normalized weak-normal | **5.50** | **8.0%** | OUR ASSUMPTION |
| Pessimistic (PCCL year) | 3.50 | 5.1% | ASSUMPTION |

**CMP ~₹135–136** | PCCL **₹85–105**

### Add 100 shares @ ₹136?

| Metric | Result |
|--------|--------|
| New total | 1,103 @ **₹74.47** blended |
| Blended YoC @ ₹5.50 norm | **7.4%** |
| Blended YoC @ ₹6.00 norm | **8.1%** → **passes 8% hurdle** |
| Premium to PCCL @ ₹100 | +36% → cap **+10–20%** → 100 OK |
| Total div ₹ @ ₹5.50 | ₹6,067 vs ₹5,517 (+₹550/yr) |

**Framework read:** **Small staged add (50–100 shares) @ ₹135–136 is acceptable**
on **IoC + cyclical fair value** — not because PCCL allows it, but because
**normalized blended YoC ~8%** + size cap + legacy cushion. **Do not** size
on trailing 12% YoC alone.

### Add 300 shares @ ₹136?

Blended avg ~₹83 → YoC @ ₹5.50 = **6.6%** → **fails** IoC hurdle → **no**.

---

## Anti-patterns

- Block all adds above PCCL on cyclical div names without YoC math
- Size adds using **trailing peak dividend** after record FY
- Ignore **total ₹ income** when user explicitly invests for income
- Treat YoC on legacy as permission for **unlimited** add at CMP

---

## Output block

```markdown
### Income on Capital (before PCCL veto)

| Metric | Current | After add @ ₹X |
|--------|--------:|---------------:|
| Blended avg cost | | |
| Trailing YoC | | (peak — label) |
| **Normalized YoC** | | |
| Annual dividend ₹ | | |
| IoC hurdle pass? | | |

**PCCL premium:** X% → max add +Y shares
**Combined action:**
```

Cross-ref: `premium-add-sizing.md` (quality compounders), `portfolio/holdings.md`.

---

## Worked example — PNB (Aug 2026) — 8% gate blocks adds

**Recorded:** 1,563 @ **₹48.69** · Cost basis **₹76,102** · CMP ~₹118

| Dividend | YoC on **capital** | YoC on CMP *(ignore)* |
|----------|-------------------:|----------------------:|
| ₹3.00 trail | **6.16%** | ~2.5% |
| ₹3.25 norm | **6.67%** | — |
| **₹3.90 (8% gate)** | **8.01%** | — |

**8% gate needs:** ₹48.69 × 8% = **₹3.90/sh** on existing book.

**Add 100 @ ₹118?** Blend ₹52.86 → YoC @ ₹3.25 = **6.15%** → **FAIL · no add**.

**Probability ≥8% YoC in 2–3 yr:** ~45% (div hike + RBI path) → **HOLD only**.

**Do not** cite 2.5% CMP yield as reason to add.
