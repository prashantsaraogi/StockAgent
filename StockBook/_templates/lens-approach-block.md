<!-- LENSES-APPROACH:START -->
## Lens-driven plan

How standalone lenses constrain **pace** and **surplus** (source files updated independently).

| Lens | Read @ CMP | Effect on pace / surplus |
|------|------------|---------------------------|
| **News** | {NEWS_SNAP} | {NEWS_EFFECT} |
| **Parameters (Part 2 forward)** | {PARAM_SNAP} | Sets **Axis B** current value |
| **Broker street** | {BROKER_SNAP} | **Does not override** PCCL or pause buckets |
| **Holding CAGR** | {CAGR_SNAP} | Blended cap discipline on legacy winners |
| **Quotes** | {QUOTES_SNAP} | Staged starter vs lump sum on buy days |
| **PCCL / Axis A** | Tier in tables below | Baseline sh/mo |
| **Surplus rank** | `quadrant-map.md` | % of monthly investable |

## Lens conflict resolution

| If... | Then... |
|-------|---------|
| Street upside high but PCCL tier 1-2 | **PCCL wins** — token SIP only |
| Parameters forward cheap, Axis A expensive | **Dual-axis** — slow SIP; see Axis A/B tables |
| News overhang, thesis intact | **HOLD**; slow or pause **new** buys |
| Personal pause bucket (IT / HDFC Bank / ITC) | **0% surplus** — no lens overrides |
| YoC < 8% (dividend names) | **Pause adds** until YoC path clear |

*Registry:* [`ANALYSIS-LENSES-FRAMEWORK.md`](../../../ANALYSIS-LENSES-FRAMEWORK.md)
<!-- LENSES-APPROACH:END -->
