---
name: fraud-detection-analysis
description: >-
  Detect and assess fraud, mis-selling, employee embezzlement, ED/PMLA,
  and integrity failures for Indian stocks. Always search latest news and
  exchange filings. Use for bank branch fraud, HDFC Dubai AT1, Kotak VP
  fraud, whistleblower, or before ADD/HOLD on governance-sensitive names.
---

# Fraud & Integrity Detection Skill

## Category

**MANAGEMENT / RISK** — fraud, mis-selling, embezzlement, ED/PMLA, integrity.

See [SKILL-CATEGORIES.md](../SKILL-CATEGORIES.md).

## Purpose

Search **live** for fraud and integrity failures; classify **isolated vs
systemic**; quantify **impact** on management rating, PCCL, and position size.

Implements `stock-agent.mdc` section 5 (Management & Integrity) and links
to section 21 (Legal) for ED/PMLA/criminal proceedings.

This skill answers:

> **Is there verified fraud or integrity failure — and does it break the thesis?**

Separate:

- **Employee / branch fraud** (Kotak Panchkula-style)
- **Mis-selling / conduct** (HDFC Dubai AT1-style)
- **Accounting / revenue fraud** (existential)
- **Promoter / key-person fraud** (governance fail)
- **Management denial** vs **regulator finding** vs **internal ethics admission**

---

## Mandatory live search (every analysis)

Run on **analysis date** for banks and any governance question:

```
[Company] fraud ED PMLA mis-selling
[Company] employee embezzlement branch
[Company] SEBI fraud enforcement integrity
[Company] whistleblower internal audit
[Company] regulator ban overseas branch
```

Plus BSE/NSE: Reg 30 — fraud, cyber, loss, regulatory action, key personnel.

Mark **UNVERIFIED** if not confirmed in filing or credible news.

---

## Fraud register (copy per stock)

| # | Type | Date | Amount (₹ cr) | Scope | Authority | Status | Systemic? | Source |
|---|------|------|-------------:|-------|-----------|--------|-----------|--------|
| 1 | | | | Branch / unit / group | ED / RBI / SEBI / foreign reg | Open / closed | Y/N | |

---

## Classification guide

| Type | Examples | Default systemic test |
|------|----------|----------------------|
| **Employee embezzlement** | Fake accounts, forged docs (Kotak VP) | Systemic if SOP bypass was **collusive + repeated** across branches |
| **Mis-selling / conduct** | AT1 as “safe deposit” (HDFC Dubai) | Systemic if **regulator reprimand + multi-year concealment** from HQ |
| **Cyber / operational** | Wallet hack, payment switch | Usually isolated if disclosed + remediated |
| **Accounting fraud** | Fake revenue, channel stuffing | **Always systemic** — HARD ALERT |
| **Promoter / ED-PMLA** | Promoter arrest, attachment | Case-by-case — often **core problem** |
| **Related-party looting** | RPT extraction | Governance + forensic |

**Management says “not fraud”** (e.g. HDFC CEO on Dubai) → label **MANAGEMENT CLAIM**;
weigh against **regulator order** and **internal ethics committee** findings.

---

## Systemic vs isolated verdict

| Verdict | Criteria | Fresh capital | Existing holder |
|---------|----------|---------------|-----------------|
| **Isolated** | Single branch/unit; amount **< 0.5%** of net worth or PAT; staff removed; recovered/attached | HOLD thesis; small PCCL cut optional |
| **Material conduct** | Regulator ban/reprimand; multi-year lapse; senior exits | **No add**; lower PCCL 5–15% |
| **Systemic / integrity fail** | Pattern across units; audit concealment; key-person complicity | **AVOID / TRIM**; sharp PCCL cut |
| **Accounting fraud** | Restatement, qualified audit | **EXIT / AVOID** — exclusion guard |

---

## Impact on framework outputs

| Output | How fraud changes it |
|--------|---------------------|
| **Management rating** | Downgrade 1–2 notches minimum on **material conduct** |
| **PCCL** | Cut **5–20%** material; **30%+** if systemic or D-SIB + integrity |
| **Position size** | Cap or block ADD until **regulatory closure** |
| **Catalyst probability** | Lower if legal/regulatory outcome pending |
| **Price decline** | Add driver row: fraud / mis-selling / ED (FACT vs CLAIM) |

Cross-ref: `bank-governance-checklist.md`, `legal-threat-analysis`, `exclusion-guards.md`.

---

## Bank-specific triggers (always search)

- Overseas branch: DFSA, FCA, MAS actions
- NRI / wealth mis-selling
- AT1 / structured product misselling
- Employee-led account fraud (municipal / corporate treasury)
- RBI fraud classification disclosure
- Concurrent with chairman exit / ethics resignation → **link events**

---

## Required output

### Fraud & integrity screen (date checked)

| Item | Result |
|------|--------|
| Live search performed | Y/N — queries used |
| Register rows | Count + summary |
| Systemic verdict | Isolated / Material / Systemic |
| Management vs regulator | Alignment or gap |

### Impact table

| Dimension | Before | After fraud news | Action |
|-----------|--------|------------------|--------|
| Mgmt rating | | | |
| PCCL | | | |
| ADD/HOLD/TRIM | | | |

### HIGH ALERT banner

Use when: accounting fraud, systemic integrity fail, ED on promoter,
or regulator **ban** on core business line.

---

## Important rules

- **Always search latest** — fraud status changes on order/chargesheet day
- Never treat CEO “no fraud” as FACT without regulator alignment
- Branch fraud **≠** auto-sell — assess **amount, recovery, SOP failure depth**
- For **held positions** (e.g. HDFC): update `portfolio/holdings.md` fraud note
- Link to **price-decline-analysis** if stock fell on fraud headline

---

## Additional resources

- Register template + HDFC/Kotak examples: [fraud-register-template.md](fraud-register-template.md)
- Bank governance: `management-governance-analysis/bank-governance-checklist.md`
