# Portfolio Dividend Rank — Three Lenses

**As of:** 2026-09-13  
**Holdings:** 51 positions (see [holdings.md](holdings.md))  
**Dividend basis:** FY26 trailing total ₹/share  
**Registry:** [dividend-fy26.json](dividend-fy26.json) · **Web UI:** [Portfolio](/portfolio) tab  
**Framework:** [`yield-on-cost-overlay.md`](../skills/pccl-analysis/yield-on-cost-overlay.md) · **8% YoC add gate**

Cross-ref: [holdings.md](holdings.md) | [portfolio-cagr.md](portfolio-cagr.md) | [quadrant-map.md](quadrant-map.md)

---

## One-line snapshot

**Best YoC:** ONGC ~15.3% · SBIN ~9.0% · ASHOKLEY ~8.7%  
**Most ₹ despite low YoC:** ITC ~₹43,500/yr · TCS ~₹32,890 · HCLTECH ~₹21,600  
**Best @ CMP (live):** computed on Portfolio page from FY26 div ÷ NSE CMP  
**Rule:** YoC = div/sh ÷ **your avg cost** (Lists 1–2) · CMP yield = div/sh ÷ **CMP** (List 3, secondary)

---

## List 1 — Top 10 by Yield on Cost (YoC)

Ranked by **FY26 dividend per share ÷ avg cost**. Primary lens for PSU/OMC/bank income names.

| Rank | Ticker | Company | Qty | Avg cost | FY26 div/sh | **YoC** | Est. annual div ₹ | Evidence |
|------|--------|---------|-----|----------|-------------|---------|-------------------|----------|
| 1 | **ONGC** | Oil & Natural Gas Corp | 400 | ₹86.48 | ₹13.25 | **~15.3%** | ~₹5,300 | FACT |
| 2 | **SBIN** | State Bank of India | 400 | ₹192.10 | ₹17.35 | **~9.0%** | ~₹6,940 | FACT |
| 3 | **ASHOKLEY** | Ashok Leyland | 100 | ₹40.21 | ₹3.50 | **~8.7%** | ~₹350 | FACT |
| 4 | **GICRE** | General Insurance Corp | 215 | ₹183.31 | ₹13.25 | **~7.2%** | ~₹2,849 | FACT |
| 5 | **PNB** | Punjab National Bank | 1,563 | ₹48.69 | ₹3.00 | **~6.2%** | ~₹4,689 | FACT |
| 6 | **BANKINDIA** | Bank of India | 1,105 | ₹78.37 | ₹4.65 | **~5.9%** | ~₹5,138 | FACT |
| 7 | **ITC** | ITC | 3,000 | ₹357.94 | ₹14.50 | **~4.1%** | ~₹43,500 | FACT |
| 8 | **HCLTECH** | HCL Technologies | 360 | ₹1,212.09 | ₹60.00 | **~4.9%** | ~₹21,600 | FACT |
| 9 | **HEROMOTOCO** | Hero MotoCorp | 30 | ₹3,117.37 | ₹120.00 | **~3.9%** | ~₹3,600 | UNVERIFIED |
| 10 | **INDHOTEL** | Indian Hotels | 400 | ₹94.61 | ₹3.25 | **~3.4%** | ~₹1,300 | FACT |

### List 1 notes

- **8% add gate:** Only **SBIN (~9%)** and **ASHOKLEY (~8.7%)** clearly pass on trailing div. **ONGC (~15%)** passes on yield but is **cyclical E&P** — use PCCL/cycle lens, not YoC alone.
- **IOC (not in top 10 trailing):** FY26 trailing only **₹1.25/sh → ~1.9% YoC**. Normalized mid-cycle **~₹5.25/sh → ~7.9% YoC** — would rank ~#4 on normalized basis.
- **High ₹ but lower rank here:** ITC is #7 on YoC but **#1 on absolute ₹** (3,000 shares).

---

## List 2 — Top 10 by absolute dividend ₹ (YoC below 8%)

Where you collect the **most dividend cash in ₹** even though **YoC is below the 8% add gate**.

| Rank | Ticker | Qty | FY26 div/sh | **Annual div ₹** | **YoC** | Why YoC looks low |
|------|--------|-----|-------------|------------------|---------|-------------------|
| 1 | **ITC** | 3,000 | ₹14.50 | **~₹43,500** | ~4.0% | Large book @ ₹358 — div compounder, not 8% income name |
| 2 | **TCS** | 299 | ₹110 | **~₹32,890** | ~3.3% | Legacy IT @ ₹3,304 avg — huge payout, low % on cost |
| 3 | **HCLTECH** | 360 | ₹60 | **~₹21,600** | ~4.9% | High avg cost ₹1,212 — FY26 div generous in ₹ |
| 4 | **INFY** | 435 | ₹48 | **~₹20,880** | ~3.2% | Qty × IT payout |
| 5 | **HDFCBANK** | 1,125 | ₹15.50 | **~₹17,438** | ~2.0% | Big qty, bank div on ₹775 cost is modest |
| 6 | **HINDUNILVR** | 250 | ₹41 | **~₹10,250** | ~1.7% | Quality FMCG — growth stock, not YoC compounder |
| 7 | **MARUTI** | 64 | ₹140 | **~₹8,960** | ~1.2% | Expensive avg ₹11,315 — ₹140/sh still tiny vs cost |
| 8 | **LT** | 175 | ₹38 | **~₹6,650** | ~1.7% | Infra winner @ ₹2,304 — div is side benefit |
| 9 | **BANKINDIA** | 1,105 | ₹4.65 | **~₹5,138** | ~5.9% | High qty, low div/sh — below 8% gate |
| 10 | **PNB** | 1,563 | ₹3.00 | **~₹4,689** | ~6.2% | Largest PSU qty — income in ₹, not in % |

### List 2 notes

- These 10 names likely pay **~₹1.7–1.8 lakh/yr** — roughly **~70%** of meaningful portfolio dividend cash.
- **Not on this list (high YoC, not top ₹):** ONGC (~₹5,300/yr, ~15% YoC), SBIN (~₹6,940/yr, ~9% YoC).
- **Near-miss #11:** Muthoot Finance (~₹5,000/yr est.) · Tata Consumer (~₹4,800/yr est.).
- **Framework:** None of the top-₹ names qualify for **scale adds on dividend logic alone** — hold for quality + legacy book; cash flow is a **bonus**.

---

## List 3 — Top 10 by dividend yield @ CMP (live)

Ranked by **FY26 dividend per share ÷ current NSE CMP**. Secondary lens — useful for **fresh-entry** comparison; **not** the primary add gate for existing holders (see List 1 YoC).

| Rank | Ticker | FY26 div/sh | **Div yield @ CMP** | YoC (ref) | Note |
|------|--------|-------------|---------------------|-----------|------|
| *Live* | *Portfolio page* | *registry* | *div ÷ CMP* | *List 1* | Refreshes with NSE quotes on each load |

**Web UI:** List 3 is computed live on `/portfolio` — not statically cached in this file.

**Framework:** High CMP yield on a PSU/OMC may still fail PCCL or cyclical tests — use alongside List 1, not instead of it.

---

## Refresh workflow

1. After **FY dividend season** or **holdings change** → update [dividend-fy26.json](dividend-fy26.json) per ticker
2. Re-run agent prompt: *"Refresh portfolio dividend rank"* — updates this file + web recompute
3. Web Portfolio page reads `dividend-fy26.json` + live `lots.json` automatically

**Agent rule:** When user asks dividend rank / YoC top 10 / absolute income — read this file first, then [holdings.md](holdings.md).
