# Hard Exclusion Guards

Run **first** on every stock analysis, comparative scorecard, and
fresh-capital recommendation — **before** PCCL, YoC, or buy ladders.

Implements `stock-agent.mdc` section 16 (Final Decision Matrix) hard guards.

---

## Purpose

**Never suggest** BUY / ACCUMULATE / ADD / STAGED BUY for fresh capital when
a guard triggers — unless user explicitly requests a **turnaround forensic**
with evidence (still default **AVOID** for fresh capital).

Always show a **HIGH ALERT** banner at the top of the report when triggered.

---

## Guard 1 — Penny / micro-cap / manipulation risk

| Trigger | Threshold | Label |
|---------|-----------|-------|
| **Price penny zone** | CMP **< ₹20** | HIGH ALERT |
| **Deep penny** | CMP **< ₹10** | HARD EXCLUDE |
| **Micro-cap** | Market cap **< ₹500 cr** | HIGH ALERT (verify live) |
| **Illiquid** | Avg daily value **< ₹1 cr** | HIGH ALERT (verify) |
| **SME / BSE SME** | Listed on SME board | HIGH ALERT |

**Action:**

- **Never** fresh BUY / ADD / accumulate
- **Do not** rank in comparative fresh-entry 🥇
- If user holds → **TRIM / EXIT review**; never ADD
- Narrative hype ("multibagger") = **reject** without audited numbers

**Exceptions (rare — user must not assume):**

- Demerger / reverse split changed price — verify adjusted history
- User asks purely for **forensic / avoid thesis** — output AVOID, not buy

---

## Guard 2 — Heavy debt / balance-sheet stress

Run from `fundamental-analysis` + latest filings. Sector-adjust:

| Trigger | Threshold (non-financial) | HIGH ALERT |
|---------|---------------------------|------------|
| **Net debt / EBITDA** | **> 3.0×** | Yes |
| **Net debt / EBITDA** | **> 4.0×** | HARD EXCLUDE for fresh capital |
| **Debt / equity** | **> 2.0×** (non-infrastructure) | Yes |
| **Interest coverage** (EBIT / interest) | **< 2.0×** | Yes |
| **Negative net worth** | Equity < 0 | HARD EXCLUDE |
| **Promoter pledge + high debt** | Both material | HARD EXCLUDE |

**Banks / NBFCs / insurance:** use regulatory capital, GNPA, ALM — not generic
D/E thresholds. Use `management-governance-analysis` + sector norms.

**Action:**

- Fresh capital → **AVOID** or **WATCHLIST (no buy)** only
- Never high-conviction ADD
- PCCL irrelevant for fresh buy until deleveraging **proven** (2+ quarters FACT)

---

## Guard 3 — Persistent loss-making

Distinguish **cyclical one-quarter loss** (e.g. OMC Q1) vs **structural**.

| Trigger | Definition | HIGH ALERT |
|---------|------------|------------|
| **Persistent losses** | **PAT negative in 3+ of last 4 quarters** (consolidated) | HARD EXCLUDE fresh buy |
| **TTM PAT negative** | Trailing twelve months loss | HIGH ALERT |
| **Operating loss trend** | EBITDA negative 2+ consecutive quarters | HARD EXCLUDE |
| **Cash burn** | Negative OCF 3+ quarters without funded turnaround | HARD EXCLUDE |

**Cyclical exception (narrow):**

- **One** loss quarter after **proven** profitable cycle (OMC, metal, etc.)
- Must show: prior ROE/ROCE healthy, no Guard 2 breach, normalized path FACT
- Still **no fresh BUY** until return to profit **or** PCCL + recovery scenario
  with catalyst **≥65%** — default **WATCHLIST only**

**Examples (pattern — verify live):**

- Loss-making small-cap spec names (user ref: **Sigachi-style**) → **AVOID**
- Post-IPO loss + heavy SBC → run `ipo-forensic-analysis`; default AVOID

**Action:**

- **Never suggest** buying for "cheapness" alone
- Existing holder → **INVESTIGATE / TRIM**; do not average on hope

---

## Combined rule

If **any HARD EXCLUDE** trigger:

```
🚨 HIGH ALERT — NOT FOR FRESH CAPITAL
Guard(s): [Penny / Heavy debt / Persistent loss]
Recommendation: AVOID (fresh) | TRIM/EXIT review (if held)
Do NOT include in high-conviction bucket or buying ladder for new money.
```

If **HIGH ALERT** only (not hard exclude):

```
⚠️ HIGH ALERT — ELEVATED RISK
Fresh capital: WATCHLIST / AVOID only — no ADD recommendation
```

---

## Report placement (mandatory)

1. **Top of report** — alert banner if any guard fires
2. **Final decision** — cannot be BUY / ACCUMULATE if HARD EXCLUDE
3. **Comparative scorecard** — auto rank **last** or **Excluded**
4. **Portfolio** — if held, action **TRIM / EXIT review** not ADD

---

## Quick screen checklist (copy per stock)

- [ ] CMP ≥ ₹20 (or deep penny ≥ ₹10)?
- [ ] Market cap ≥ ₹500 cr (if material)?
- [ ] Net debt/EBITDA ≤ 3× (or sector OK)?
- [ ] Interest coverage ≥ 2×?
- [ ] PAT positive in ≥ 3 of last 4 Qs (or valid cyclical exception documented)?
- [ ] TTM PAT positive (or one-Q cyclical with evidence)?

If any critical box fails → run guard table above before continuing.

---

## Cross-refs

- Debt detail: `fundamental-analysis`, `risk-analysis`
- Turnaround: `pccl-analysis` (4-scenario) — still default no fresh buy
- IPO loss names: `ipo-forensic-analysis`
- Governance + debt: `management-governance-analysis`
