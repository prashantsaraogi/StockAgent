<!-- LENSES-SUMMARY:START -->
## Analysis lenses (integrated)

| Lens | File | Updated | Snapshot | Verdict tie-in |
|------|------|---------|----------|--------------|
| News | [`News/TICKER-INDEX.md`](../../../News/TICKER-INDEX.md) | {NEWS_DATE} | {NEWS_SNAP} | {NEWS_TIE} |
| Parameters (10Y + 5Y) | [`PARAMETERS_{TICKER}.md`](PARAMETERS_{TICKER}.md) | {PARAM_DATE} | {PARAM_SNAP} | {PARAM_TIE} |
| Broker targets | [`BROKER_{TICKER}.md`](BROKER_{TICKER}.md) | {BROKER_DATE} | {BROKER_SNAP} | Secondary to PCCL |
| Holding CAGR | [`CAGR_{TICKER}.md`](CAGR_{TICKER}.md) | {CAGR_DATE} | {CAGR_SNAP} | Legacy book context |
| Quotes | [`faq.md`](faq.md) | {FAQ_DATE} | {QUOTES_SNAP} | On buy/add only |
| PCCL / dual-axis | [`suggested-approach.md`](suggested-approach.md) | {APPROACH_DATE} | See valuation tier above | Sets SIP pace |

*Full registry:* [`StockBook/ANALYSIS-LENSES-FRAMEWORK.md`](../../../ANALYSIS-LENSES-FRAMEWORK.md) · Sync: `StockBook/_sync-analysis-lenses.ps1`
<!-- LENSES-SUMMARY:END -->

## StockBook files & lenses

| File | Purpose |
|------|---------|
| `summary-analysis.md` | Verdict + integrated lens snapshot |
| `suggested-approach.md` | Lens-driven SIP plan |
| `detail-analysis.md` | Full framework |
| `faq.md` | Q&A + Quotes lens |
| `PARAMETERS_{TICKER}.md` | 10Y rear-view + 5Y forward |
| `BROKER_{TICKER}.md` | Street targets by broker |
| `CAGR_{TICKER}.md` | Holding return per lot |

**Refresh:** After news run, parameters/broker batch, or verdict change — run lens sync.
