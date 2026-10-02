# Broker Target Price Framework

**Purpose:** Track sell-side **12-month (typical) price targets** for portfolio holdings — one row per stock, major brokers in fixed columns, **average of available broker targets** in the last column.

**Output file:** [`broker-target-prices.md`](broker-target-prices.md) (summary) · [`broker-target-prices.html`](broker-target-prices.html) (full broker columns — open in browser)  
**Refresh script:** [`_fetch-broker-targets.ps1`](_fetch-broker-targets.ps1)

---

## Data source

| Item | Detail |
|------|--------|
| Primary | [Trendlyne](https://trendlyne.com) research-reports pages (Author + Target table) |
| Consensus | Trendlyne headline "average share price target" when present |
| CMP | LTP from same Trendlyne page (analysis date) |
| Horizon | Broker reports are typically **~12-month** forward targets — not a hard expiry; treat as **directional**, not precise fair value |

**Not used:** Moneycontrol broker research (often blocked). Manual broker PDFs.

---

## Column rules

| Column | Mapping (Trendlyne Author string) |
|--------|-------------------------------------|
| **ICICI Sec** | ICICI Securities, ICICI Direct |
| **Morgan** | Morgan Stanley |
| **Kotak** | Kotak Securities |
| **HDFC Sec** | HDFC Securities |
| **Jefferies** | Jefferies |
| **HSBC** | HSBC |
| **Motilal** | Motilal Oswal |
| **Other** | Latest target from any other named broker (Geojit, Axis, Emkay, Sharekhan, etc.) — **one cell = latest other-broker target**; full broker name in notes if needed |

**Average target:** Simple mean of **non-empty broker columns** (ICICI through Other). Does **not** double-count Trendlyne consensus unless no broker cells exist — then consensus is shown in Avg.

**Upside %:** `(Avg target − CMP) / CMP × 100` using same-day LTP.

---

## Per-broker selection

1. Parse all research rows with numeric Target.
2. Skip "Consensus Share Price Target" for broker columns.
3. For each broker bucket, keep the **most recent report date** only.
4. "Target met" rows still carry a numeric target — retained if latest for that broker.

---

## Coverage gaps

| Case | Display |
|------|---------|
| No Trendlyne page / no reports | `—` all columns; note in **Notes** |
| Micro-cap / new listing (KWIL, recent demergers) | May have zero coverage — expected |
| InvIT / thin coverage (RAAJINFRA) | Often IPO note only |
| Legal overhang (DELTACORP) | Stale targets — flag in Notes |

---

## Agent / user rules

1. **Read** `broker-target-prices.md` for "what does the Street think?" — **secondary** to PCCL, business quality, and personal discipline.
2. **Do not** buy solely because average target > CMP.
3. **Refresh** after quarterly results season or when user asks — run `_fetch-broker-targets.ps1`.
4. **Update** `holdings.md` link after material refresh.
5. Broker targets **do not** override: PCCL, structural-threat pause buckets, long-term HOLD mandate.

---

## Refresh

```powershell
cd d:\D-Drive\Personal\My-agent
.\.cursor\portfolio\_fetch-broker-targets.ps1
```

Typical runtime: ~2–3 min (50 stocks, 1.5s delay between requests).
