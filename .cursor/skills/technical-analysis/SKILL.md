---
name: technical-analysis
description: >-
  Analyze Indian stock price and volume using moving averages, RSI,
  MACD, Bollinger Bands, and trend structure. Use when the user asks
  about chart patterns, support/resistance, technical view, or entry
  timing for NSE/BSE stocks.
---

# Technical Analysis Skill

## Category

**FUNDAMENTAL & BUSINESS** — price, volume, trend; **timing overlay** (not thesis).

See [SKILL-CATEGORIES.md](../SKILL-CATEGORIES.md).

## Purpose

Analyze historical price and volume to identify trends, momentum,
support/resistance, and short-to-long-term technical condition.

**Technical analysis informs timing — not business quality or fair value.**
Always combine with `valuation-analysis` and `pccl-analysis`.

Implements price/trend portion of `stock-analysis` workflow.

---

## Framework Alignment

Follow `stock-agent.mdc` evidence standard.

Classify outputs as:

- **FACT** — calculated from actual OHLCV data
- **OUR ASSUMPTION** — support/resistance zones, pattern interpretation
- **UNVERIFIED** — if data insufficient for an indicator

Never fabricate indicator values.

State **ticker, timeframe, data source, and date checked**.

---

## When to Use

- User asks for technical view, chart analysis, or timing
- Support/resistance and trend direction needed
- Buying ladder alignment with technical levels
- OHLCV data available (Yahoo Finance, user file, API)

Do **not** use as sole basis for investment decisions.

---

## Integration with Other Skills

| Skill | Link |
|-------|------|
| `pccl-analysis` | Technical support zones near PCCL = stronger staged entry |
| `valuation-analysis` | Fair value vs current price — separate from technicals |
| `risk-analysis` | Volatility and drawdown from same price series |
| `stock-analysis` | Technical section of full report |

---

## Step 1 — Data Requirements

Before calculating:

- Ticker, exchange, timeframe, frequency (daily default)
- OHLCV complete, numeric, chronological
- Missing/duplicate records flagged
- Adjusted vs unadjusted prices noted

If insufficient data for an indicator — **do not calculate it**.

Minimum data: RSI/MACD ~35+ days; SMA200 ~200 days.

---

## Step 2 — Trend Analysis

| Horizon | Typical lookback |
|---------|------------------|
| Short-term | 5–20 days |
| Medium-term | 50–100 days |
| Long-term | 200 days |

Analyze: higher highs/lows, lower highs/lows, support, resistance.

Support/resistance are **assumptions** unless tied to verified volume nodes.

---

## Step 3 — Moving Averages

Calculate when sufficient data: SMA 20/50/100/200, EMA 20/50.

Observe: price vs MAs, golden/death cross.

**Do not treat crossovers as guaranteed signals.**

---

## Step 4 — RSI (14)

- \>70 potentially overbought
- \<30 potentially oversold
- ~50 neutral

Never conclude buy/sell from RSI alone.

---

## Step 5 — MACD (12, 26, 9)

MACD line, signal, histogram — crossovers and momentum.

Note divergence only when sufficient history exists.

---

## Step 6 — Bollinger Bands (20, 2)

Band position, width, volatility expansion/contraction.

---

## Step 7 — Volume

Average volume, spikes, price-volume confirmation.

Unusual volume at support/resistance increases relevance.

---

## Step 8 — Signal Classification

Overall condition: **Bullish / Bearish / Neutral / Mixed**

List which indicators drove the classification.

---

## Required Output

### Data Summary
Ticker, period, bars used, date checked, source.

### Technical Summary
One-paragraph overview.

### Trend
Short / medium / long-term.

### Moving Averages
Key levels and price position.

### RSI
Value and interpretation.

### MACD
Momentum condition.

### Bollinger Bands
Volatility and price position.

### Volume
Notable observations.

### Support & Resistance
Key levels (assumptions labeled).

### Overall Technical Condition
Bullish / Bearish / Neutral / Mixed.

### Integration Note
How technicals relate to PCCL/buying ladder if those are known.

### Limitations
Insufficient data, low liquidity, corporate actions.

---

## Important Rules

Indicators describe **historical** price behavior.

Past patterns do not guarantee future performance.

Calculate only from actual available data.

Technical weakness ≠ broken business; technical strength ≠ cheap stock.
