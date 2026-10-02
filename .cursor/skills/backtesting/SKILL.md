---
name: backtesting
description: >-
  Backtest trading or investment strategies on historical Indian market
  data with bias checks and performance metrics. Use when the user asks
  to test a strategy, rule, or indicator on historical OHLCV data.
---

# Backtesting Skill

## Category

**TOOLS** — historical strategy testing (on request only).

See [SKILL-CATEGORIES.md](../SKILL-CATEGORIES.md).

## Purpose

Evaluate a trading or investment strategy using **historical data only**,
with explicit bias checks and performance reporting.

**Backtesting informs strategy design — not future guarantees.**

Separate from fundamental `stock-analysis` unless user requests it.

---

## Framework Alignment

State all assumptions explicitly.

Never use future information (no look-ahead bias).

Classify results as **historical FACT** — not predictions.

---

## When to Use

- User asks to backtest a strategy or rule
- Testing entry/exit signals on historical data
- Comparing strategy vs buy-and-hold benchmark

Not for: fundamental buy/hold thesis (use `stock-analysis`).

---

## Integration with Other Skills

| Skill | Link |
|-------|------|
| `technical-analysis` | Signal definitions (SMA cross, RSI, etc.) |
| `risk-analysis` | Drawdown, Sharpe from backtest equity curve |

---

## Step 1 — Required Inputs

Define before running:

| Input | Required |
|-------|----------|
| Strategy rules (entry/exit) | Yes |
| Ticker or universe | Yes |
| Date range | Yes |
| Data frequency | Yes |
| Starting capital | Yes |
| Position sizing | Yes |
| Transaction costs | If available |
| Slippage | If available |

If missing — ask user or state assumption clearly.

---

## Step 2 — Data Validation

- Chronological order
- Missing/duplicate OHLC
- Unrealistic prices
- Adjusted prices if dividends/splits matter
- Strategy uses **only** data available at each bar

---

## Step 3 — Strategy Definition

### Entry
Exact conditions to open.

### Exit
Exact conditions to close.

### Position Sizing
Fixed %, equal weight, or user rule.

### Risk Management
Stop loss, take profit, max exposure — only if user/config defines.

---

## Step 4 — Performance Metrics

When appropriate:

- Total / annualized return
- Trade count, win rate, avg win/loss
- Max drawdown, volatility, Sharpe
- vs buy-and-hold benchmark

Include transaction costs when assumptions exist; else disclose exclusion.

---

## Step 5 — Bias Checklist

| Bias | Check |
|------|-------|
| Look-ahead | Signals use past data only |
| Survivorship | Universe not cherry-picked ex-post |
| Data leakage | Train/test not mixed |
| Overfitting | Too many params vs data |
| Execution | Realistic fill prices |

---

## Required Output

### Strategy
Exact rules in plain language.

### Backtest Period & Data Source

### Performance Metrics

### Trade Summary
Count, win rate, avg trade.

### Drawdown
Max and notable periods.

### Benchmark Comparison

### Bias & Limitations

### Conclusion
Historical result only — not a forecast.

---

## Important Rules

Past performance ≠ future results.

Never modify data to improve results.

Never fabricate backtest output.

Prefer Python (pandas) when coding; use pytest for critical logic.

Keep backtest logic separate from analysis report generation.

---

## Implementation Notes

When building code in this project:

- Use pandas, numpy for calculations
- Store data-processing separate from UI
- Document edge cases (missing bars, halts, illiquid stocks)
