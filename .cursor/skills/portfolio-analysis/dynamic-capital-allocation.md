# Dynamic Capital Allocation

**Category:** PORTFOLIO & CAPITAL ALLOCATION  
**Implements:** `stock-agent.mdc` §13, §20  
**Companion skills:** `dynamic-context-analysis`, `portfolio-analysis`, `stock-analysis/comparative-scorecard.md`

---

## Core doctrine

> **Surplus capital flows to where potential × margin of safety is highest *today* — not where it went last month.**

Allocation is **ratio-based and re-ranked continuously**:

- **Within a sector:** HDFC Bank > PNB when franchise, growth, governance, and valuation support it
- **Across sectors:** Hospitals may take 25–30% of surplus when bed occupancy, ARPOB, and policy tailwinds are strong; banks may take less when NIM is compressing and governance is open
- **Nothing is frozen** — the rank table in `quadrant-map.md` is a **snapshot**, not permanent policy

**Long-term mandate still applies:** re-ranking affects **new/salary capital only**. It does **not** mean sell A to buy B unless Tier-1 existential exit criteria are met.

---

## What “potential” means (not hype)

**Potential score** = weighted view of **where earnings and moat can go over 3–5 years**, adjusted for **what is already priced in**.

| Input | Weight | Source |
|-------|--------|--------|
| Sustainable EPS / revenue growth (pessimistic–normal) | High | `fundamental-analysis`, management guidance (label claim) |
| Industry ground reality (monthly KPIs) | High | `dynamic-context-analysis` Module A |
| Moat trajectory (widening / stable / eroding) | High | `business-model-analysis`, `structural-threat-analysis` |
| Valuation gap (MoS vs IV, Premium to PCCL) | High | `pccl-analysis`, `valuation-analysis` |
| Governance / legal / fraud | High (cap or zero) | `management-governance-analysis`, `legal-threat-analysis` |
| Policy & geopolitical tailwind/headwind | Medium | `dynamic-context-analysis` Modules B & C |
| Earnings momentum (last 2–4 quarters) | Medium | Filings |
| Portfolio concentration / underweight | Medium | `quadrant-map.md`, `holdings.md` |

**Potential ≠ past return.** A +200% legacy winner can have **low fresh-entry potential** if CMP is far above PCCL/IV.

**Potential ≠ quality alone.** A Strong business at full valuation ranks **below** an Adequate business at PCCL with improving ground reality.

---

## Allocation mechanics

### Step 1 — Score candidates (surplus only)

For each deploy candidate, output:

| Field | Example |
|-------|---------|
| Ticker | HDFCBANK |
| Sector bucket | Private banks |
| **Potential band** | High / Medium / Low / **Pause** |
| MoS vs IV | +4% |
| Premium to PCCL | +10% |
| Ground reality | NIM weak; governance overhang |
| **Fresh ₹ rank** | #2 in banks, #6 overall |

Use `stock-analysis/comparative-scorecard.md` when comparing peers.

### Step 2 — Within-sector ratio

Compare **peers in the same bucket** before cross-sector mix.

**Example — private banks (Aug 2026):**

| Name | Potential | Why | Surplus share *within bank slice* |
|------|-----------|-----|-----------------------------------|
| ICICIBANK | **High** | Governance era, underweight, cleaner catalysts | **~70%** |
| HDFCBANK | **Medium** | Strong franchise; governance caps | **~30%** |
| PNB | **Low / Pause** | PSU turnaround; lower ROE/moat vs privates | **0%** fresh (legacy HOLD only) |

**Rule:** Do not allocate fresh bank ₹ equally across all bank holdings. **Rank by potential today.**

### Step 3 — Cross-sector ratio

After within-sector ranks, set **monthly surplus %** across sectors.

**Example — Aug 2026 snapshot:**

| Sector | Potential | Surplus % | Top names |
|--------|-----------|----------:|-----------|
| Healthcare | **High** | 25–30% | MAXHEALTH, FORTIS |
| Private banks | Medium | 25% | ICICI, HDFC (split 70/30) |
| Infra / capex | Medium–High | 20% | LT |
| NBFC / gold | Medium | 10% | MUTHOOTFIN (token) |
| OMC / dividend | Medium (YoC) | 10% | IOC |
| IT | **Low / Pause** | 0% | TCS, INFY — structural AI headwind |

**Sum = 100%** of monthly investable surplus (user adjusts ₹).

### Step 4 — Convert % to shares

Use `salary-systematic-accumulation.md` + premium size caps + concentration ceiling.

Potential sets **relative ₹**; PCCL/IV and governance set **max absolute pace**.

---

## Dynamic re-ranking — when ranks change

Re-run allocation rank when **any** trigger fires:

| Trigger | Frequency | Action |
|---------|-----------|--------|
| **Material headline** (RBI, tariff, oil >5%, war escalation, budget) | **Same session** | Search news → transmission → re-rank affected sectors |
| **Monthly sector KPIs** (SIAM, AMFI, credit, aviation) | Monthly | Upgrade/downgrade sector potential band |
| **Quarterly results** | Event | Update EPS trajectory; PCCL; peer rank |
| **Governance / legal order** | Event | Cap or pause name; may flip peer rank inside sector |
| **PCCL breach** (price below PCCL) | Event | Run core-problem test; may **raise** rank if thesis intact |
| **Nifty / sector index ±8%** from last refresh | Ad hoc | Refresh quadrant-map + surplus table |
| **User trade** | Event | Recalculate weights; pause if concentration breach |

**Document every rank change:** old rank → new rank → **what evidence changed** → date.

---

## 180° thesis flip protocol

Analysis **can reverse completely** when evidence shifts. Examples:

| Before | After | Trigger |
|--------|-------|---------|
| ADD hospitals | **Pause** hospital surplus | Policy cap on bed fees; occupancy collapse 3 months |
| ICICI #1 bank | **Pause** all banks | Systemic NPA event; RBI moratorium elsewhere |
| HOLD HDFC, small DCA | **Pause adds** | RBI material stricture; CEO not reappointed |
| Pause IT adds | **Staged add** | AI disruption repriced; contract wins prove moat |
| High OMC allocation | **Cut OMC surplus to 0%** | Oil spike + subsidy freeze destroys normalized margin |

### Flip rules

1. **Search latest news** on analysis date — never flip from memory
2. State **what fact changed** (FACT vs headline rumour)
3. Update **PCCL**, **surplus rank**, and **`StockBook/[Stock]/`** if folder exists
4. **180° flip on action** (ADD → Pause) is allowed; **180° flip on legacy HOLD → SELL** requires **Tier-1 existential criteria** only
5. Separate **temporary** (geo oil spike) from **structural** (moat destroyed) — temporary flips may revert in weeks

---

## Daily / live news scan (when user asks or material session)

On **every stock or portfolio analysis**, pull **latest** context for **relevant** channels — not full macro every time, but **never skip** when sector is exposed.

### Minimum scan checklist

| Channel | Examples | Sectors affected |
|---------|----------|------------------|
| **Crude / energy** | Brent, OPEC, Middle East | OMC, airlines, paints, logistics, inflation |
| **Tariffs / trade** | US, China, EU duties on India exports | IT, pharma, textiles, auto components |
| **RBI / rates / FX** | Repo, liquidity, INR | Banks, NBFCs, real estate, consumption |
| **Geopolitical** | Iran, Taiwan, sanctions | Oil, defence, FII flows, gold |
| **Fiscal / budget** | Capex, PLI, customs | Infra, electronics, auto |
| **Sector regulators** | SEBI, IRDAI, TRAI, NHB | Financials, telecom, housing |
| **Index / flows** | MSCI, Nifty changes, FII/DII | Index heavyweights |
| **Company-specific** | BSE/NSE filings for holdings under review | Single name |

**Date stamp every scan:** “News checked: [date].”

Use `dynamic-context-analysis` Modules A/B/C + [policy-index-events.md](../dynamic-context-analysis/policy-index-events.md).

---

## Connect the dots → allocation

Mandatory synthesis chain:

```
Latest news + ground KPIs + policy/geo
    → Sector potential band (High/Med/Low/Pause)
    → Within-sector peer rank (e.g. HDFC vs PNB vs ICICI)
    → Cross-sector surplus % table
    → Per-name DCA pace + size caps (PCCL, governance, concentration)
    → Explicit: "What would flip this rank?"
```

---

## Output template (surplus deployment memo)

```markdown
## Dynamic allocation — as of [DATE]

### Context snapshot (1–3 lines)
[Oil / RBI / tariff / geo — direction: escalating | stable | de-escalating]

### Sector potential bands
| Sector | Band | vs last review | Driver |
|--------|------|----------------|--------|

### Within-sector rank
| Sector | #1 | #2 | Avoid fresh |
|--------|----|----|-------------|

### Recommended surplus split (%)
| Priority | % | Name(s) | Change vs last |
|----------|--:|---------|----------------|

### What would change ranks (next 30 days)
- [ ] Event → impact

### Legacy holdings
No sell/rotate — rank applies to **new ₹ only**.
```

---

## Anti-patterns

| Wrong | Right |
|-------|-------|
| Equal ₹ to all bank stocks you own | **Ratio by potential** — ICICI 70 / HDFC 30 / PNB 0 fresh |
| Frozen salary table for 12 months | **Re-rank** when ground reality or news shifts |
| Ignore oil/tariff because "long-term investor" | Long-term ≠ ignore macro transmission |
| Chase yesterday's winner after +50% without IV check | Potential falls as price rises |
| Sell HDFC to buy ICICI because rank changed | **Pause** HDFC adds; deploy **new** ₹ to ICICI |
| Flip to SELL on one bad quarter | Pause adds; SELL only Tier-1 existential |

---

## File integration

| File | Role |
|------|------|
| [quadrant-map.md](../../portfolio/quadrant-map.md) | Weight vs gain; hosts **current** surplus % snapshot |
| [holdings.md](../../portfolio/holdings.md) | Master positions |
| [comparative-scorecard.md](../stock-analysis/comparative-scorecard.md) | Peer comparison |
| [dynamic-context-analysis/SKILL.md](../dynamic-context-analysis/SKILL.md) | Live news + KPIs |
| [long-term-investor-mandate.md](long-term-investor-mandate.md) | No sell-to-rotate |
| `StockBook/[Stock]/` | Per-name thesis; update on material flip |

**Refresh `quadrant-map.md` surplus table** whenever sector potential bands change materially.
