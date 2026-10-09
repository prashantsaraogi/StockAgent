# Business Quality & Moat Framework

**Analysis lens L14** · Stock Calculator Tab 4 · Cross-ref §2 Business Quality & Moat in agent rules

---

## Core question

> **Is this a great business or merely a cheap stock?**

P/E and earnings quality answer *price* and *profit quality*. This tab answers **franchise durability** — why competitors cannot easily replicate the economics.

---

## Seven pillars (score each 0–10)

### 1. Market position

| Track | Why |
|-------|-----|
| Market share | Scale and shelf presence |
| Share trend | Gaining vs losing |
| Rank (#1 / #2 / #3) | Leadership premium |

### 2. Competitive advantage

| Moat source | Examples |
|-------------|----------|
| Brand | Trust, pricing, recall |
| Distribution | Dealers, reach, last mile |
| Cost advantage | Scale, sourcing, process |
| Network effect | Platform, ecosystem |
| Switching costs | Integration, habit, regulation |
| Technology | IP, R&D lead (with evidence) |
| Scale | Fixed-cost leverage |

### 3. Pricing power

Can the company raise prices without losing customers materially?

### 4. Industry runway

| Track | Why |
|-------|-----|
| TAM | Headroom |
| Industry growth | Tailwind vs headwind |
| Penetration | Under-penetrated = runway |
| Structural growth | Policy, demographics |
| Cyclicality | Earnings volatility risk |

### 5. Capital efficiency

| Track | Benchmark |
|-------|-----------|
| ROCE | ≥15% strong compounder band |
| ROE | ≥15% Buffett gate |
| Incremental ROCE | New capex returns |

### 6. Management quality

| Track | Red flags |
|-------|-----------|
| Capital allocation | M&A, buybacks, dividend, capex |
| Promoter behaviour | Pledge, related deals |
| Governance | Auditor, disclosure |
| Related-party transactions | Material RPT |
| Dilution | ESOP / primary at bad prices |

### 7. Reinvestment runway

Can the company **reinvest** retained earnings at high returns for years?

---

## Signal legend

| Signal | Meaning | Pillar score guide |
|--------|---------|-------------------|
| 🟢 | Strong / durable | 8–10 |
| 🟡 | Moderate / monitor | 5–7 |
| 🔴 | Weak / eroding | 0–4 |

**Business Quality Score** = weighted average of seven pillar scores (equal weight default), rounded to **X/10**.

**Score ceiling:** Competitive or structurally uncertain industries (auto, commodity, regulated) rarely score **10/10** even with a dominant franchise — document the cap in `Ceiling note`.

---

## Maruti reference (8/10, not 10/10)

| Factor | Assessment | Signal |
|--------|------------|--------|
| Market position | Very strong (#1 PV ~41%) | 🟢 |
| Brand | Very strong | 🟢 |
| Distribution | Very strong | 🟢 |
| Scale / cost advantage | Strong | 🟢 |
| Pricing power | Moderate (competitive PV) | 🟡 |
| EV transition | Needs monitoring | 🟡 |
| Capital efficiency | Good (ROCE ~19%, ROE ~14%, net cash) | 🟢 |

**Business Quality: 8/10** — great franchise, but auto is competitive and EV/SUV transition creates uncertainty.

---

## StockBook data contract

```
StockBook/[Sector]/[Stock]/BUSINESS_QUALITY_[TICKER].md
```

Sections: **Overall score** · **Pillars 1–7** (factor tables) · **Scorecard summary** · **Ceiling note**

Engine reads `PARAMETERS_*.md` (ROE, volume, EBITDA, net cash / OEY), `detail-analysis.md` (§2 moat table, §5 management), and `PEG_*.md` (`businessQualityScore10`, ROCE, growth) when no dedicated file exists.

**Mandatory UI rule:** Stock Calculator Tab 4 must show **7/7 pillar scores** — never blank `--/10`. Derivation order:

1. `BUSINESS_QUALITY_[TICKER].md` scorecard + factor tables (preferred)
2. Merge gaps from PARAMETERS master rows + detail §2 moat + PEG fields
3. Sector baseline (O&G, banks, auto, pharma, IT) labeled **OUR ASSUMPTION**
4. PEG `businessQualityScore10` pillar proxies (± pillar deltas) if still empty

Overall score = file **Business Quality Score** when present; else **equal-weight average of seven pillars**. Agent write-back should replace assumptions with **FACT** rows in `BUSINESS_QUALITY_[TICKER].md` (bundled at web build like MARGIN / EARNINGS_QUALITY).

---

## Agent write-back

After moat discussion: update `BUSINESS_QUALITY_[TICKER].md`, refresh `summary-analysis.md` moat paragraph, capture Q&A in `faq.md`.

---

*Framework v1 · Sep 2026 · Stock Calculator Tab 4*
