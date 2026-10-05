import type { HoldingsIndexTableResult, VsIndexRankRow } from './holdings-index-table';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pctClass(pct: string): string {
  if (pct === '—' || pct === '') return '';
  if (pct.startsWith('+')) return 'pos';
  if (pct.startsWith('-')) return 'neg';
  return '';
}

function rankRowsHtml(rows: VsIndexRankRow[], emptyLabel: string): string {
  if (rows.length === 0) {
    return `<tr><td colspan="6" class="muted">${escapeHtml(emptyLabel)}</td></tr>`;
  }
  return rows
    .map(
      (r) => `<tr>
<td class="num">${r.rank}</td>
<td><strong>${escapeHtml(r.stockName)}</strong><br><span class="ticker">${escapeHtml(r.ticker)}</span></td>
<td>${escapeHtml(r.indexCategory)}</td>
<td class="num ${pctClass(r.indexVariation)}">${escapeHtml(r.indexVariation)}</td>
<td class="num ${pctClass(r.stockVariation)}">${escapeHtml(r.stockVariation)}</td>
<td class="num ${pctClass(r.stockVsIndex)}">${escapeHtml(r.stockVsIndex)}</td>
</tr>`
    )
    .join('\n');
}

function rankGridSection(
  titleLaggards: string,
  titleLeaders: string,
  hint: string,
  idxCol: string,
  stkCol: string,
  worst: VsIndexRankRow[],
  best: VsIndexRankRow[]
): string {
  return `<div class="rank-grid">
<div class="rank-box">
<h2>${escapeHtml(titleLaggards)}</h2>
<p>${hint}</p>
<table>
<thead><tr><th class="num">#</th><th>Stock</th><th>Index</th><th class="num">${escapeHtml(idxCol)}</th><th class="num">${escapeHtml(stkCol)}</th><th class="num">Stock − Index</th></tr></thead>
<tbody>${rankRowsHtml(worst, 'No data')}</tbody>
</table>
</div>
<div class="rank-box">
<h2>${escapeHtml(titleLeaders)}</h2>
<p>${hint}</p>
<table>
<thead><tr><th class="num">#</th><th>Stock</th><th>Index</th><th class="num">${escapeHtml(idxCol)}</th><th class="num">${escapeHtml(stkCol)}</th><th class="num">Stock − Index</th></tr></thead>
<tbody>${rankRowsHtml(best, 'No data')}</tbody>
</table>
</div>
</div>`;
}

export interface HoldingsIndexHtmlOptions {
  audience?: 'repo' | 'web';
  userEmail?: string;
}

export function renderHoldingsIndexBenchmarkHtml(
  table: HoldingsIndexTableResult,
  options?: HoldingsIndexHtmlOptions
): string {
  const audience = options?.audience ?? 'repo';
  const date = table.asOf.slice(0, 10);
  const totalCost = table.rows.reduce((s, r) => s + r.purchaseCost, 0);
  const totalMv = table.rows.reduce((s, r) => s + (r.currentValue ?? 0), 0);
  const totalPnl = totalMv - totalCost;
  const totalVsCostPct =
    totalCost > 0 ? Math.round(((totalMv - totalCost) / totalCost) * 1000) / 10 : null;
  const totalVsCostStr =
    totalVsCostPct != null
      ? `${totalVsCostPct >= 0 ? '+' : ''}${totalVsCostPct.toFixed(1)}%`
      : '—';
  const totalPnlStr =
    totalCost > 0 && totalMv > 0
      ? `${totalPnl >= 0 ? '+' : '-'}₹${Math.abs(Math.round(totalPnl)).toLocaleString('en-IN')}`
      : '—';
  const withMv = table.rows.filter((r) => r.currentValue != null).length;

  const rowsHtml = table.rows
    .map(
      (r) => `<tr>
<td><strong>${escapeHtml(r.stockName)}</strong><br><span class="ticker">${escapeHtml(r.ticker)}</span></td>
<td>${escapeHtml(r.indexCategory)}</td>
<td class="num">${r.qty.toLocaleString('en-IN')}</td>
<td class="num">${escapeHtml(`₹${r.purchaseCost.toLocaleString('en-IN')}`)}</td>
<td class="num">${r.currentValue != null ? escapeHtml(`₹${r.currentValue.toLocaleString('en-IN')}`) : '—'}</td>
<td class="num">${escapeHtml(r.avgCostDisplay)}</td>
<td class="num">${escapeHtml(r.cmpDisplay)}</td>
<td class="num ${pctClass(r.unrealizedPnlDisplay)}">${escapeHtml(r.unrealizedPnlDisplay)}</td>
<td class="num ${pctClass(r.vsCostVariation)}">${escapeHtml(r.vsCostVariation)}</td>
<td class="num ${pctClass(r.monthlyIndexVariation)}">${escapeHtml(r.monthlyIndexVariation)}</td>
<td class="num ${pctClass(r.monthlyStockVariation)}">${escapeHtml(r.monthlyStockVariation)}</td>
<td class="num ${pctClass(r.monthlyStockVsIndex)}">${escapeHtml(r.monthlyStockVsIndex)}</td>
<td class="num ${pctClass(r.yearlyIndexVariation)}">${escapeHtml(r.yearlyIndexVariation)}</td>
<td class="num ${pctClass(r.yearlyStockVariation)}">${escapeHtml(r.yearlyStockVariation)}</td>
<td class="num ${pctClass(r.yearlyStockVsIndex)}">${escapeHtml(r.yearlyStockVsIndex)}</td>
</tr>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Portfolio — Stock vs index</title>
<style>
body{font-family:Segoe UI,system-ui,sans-serif;max-width:100%;margin:0 auto;padding:1.5rem;line-height:1.5;background:#f8fafc;color:#0f172a}
.header{background:linear-gradient(135deg,#1e3a8a,#1e40af);color:#fff;padding:1.25rem 1.5rem;border-radius:10px;margin-bottom:1.25rem;max-width:1280px;margin-left:auto;margin-right:auto}
.header h1{margin:0 0 .35rem;font-size:1.35rem}
.header p{margin:.25rem 0;opacity:.95;font-size:.92rem}
.note{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:.75rem 1rem;margin:0 auto 1rem;max-width:1280px;font-size:.88rem;color:#475569}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.75rem;margin:0 auto 1.25rem;max-width:1280px}
.card{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:.85rem 1rem}
.card h3{margin:0 0 .35rem;font-size:.75rem;color:#64748b;text-transform:uppercase;letter-spacing:.04em}
.card .val{font-size:1.15rem;font-weight:700}
.wrap{overflow-x:auto;background:#fff;border:1px solid #e2e8f0;border-radius:8px;margin:0 auto;max-width:100%}
table{width:100%;border-collapse:collapse;font-size:.82rem;min-width:1280px}
th,td{border-bottom:1px solid #e2e8f0;padding:7px 8px;vertical-align:top}
th{background:#f1f5f9;text-align:left;font-size:.72rem;text-transform:uppercase;letter-spacing:.02em;color:#475569}
th.group{background:#e2e8f0;text-align:center;font-size:.75rem}
th.num{text-align:right}
.num{text-align:right;font-variant-numeric:tabular-nums}
.ticker{font-size:.78rem;color:#64748b}
.pos{color:#15803d;font-weight:600}
.neg{color:#b91c1c;font-weight:600}
.spread{background:#f8fafc}
.rank-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1rem;margin:0 auto 1.25rem;max-width:1280px}
.rank-box{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:.85rem 1rem;overflow-x:auto}
.rank-box h2{margin:0 0 .5rem;font-size:1rem;color:#0f172a}
.rank-box p{margin:0 0 .65rem;font-size:.82rem;color:#64748b}
.rank-box table{min-width:0;font-size:.8rem}
.rank-box th,.rank-box td{padding:6px 8px}
.muted{color:#94a3b8}
footer{margin:1.5rem auto;font-size:.8rem;color:#64748b;max-width:1280px}
</style>
</head>
<body>
<div class="header">
<h1>Portfolio — Stock vs index (monthly / yearly)</h1>
<p>Generated ${escapeHtml(date)} · ${table.rows.length} stocks · CMP live (${withMv}/${table.rows.length})</p>
<p>${
    audience === 'web'
      ? `Private to <strong>${escapeHtml(options?.userEmail ?? 'your login')}</strong> · vs your cost + monthly/yearly vs sector index.`
      : 'Compare <strong>stock price</strong> change vs <strong>sector index</strong> — same time windows. Excel: open <code>holdings-index-benchmark.csv</code> in the same folder.'
  }</p>
</div>
<div class="cards">
<div class="card"><h3>Total purchase cost</h3><div class="val">₹${totalCost.toLocaleString('en-IN')}</div></div>
<div class="card"><h3>Total current value</h3><div class="val">₹${totalMv.toLocaleString('en-IN')}</div></div>
<div class="card"><h3>Positions</h3><div class="val">${table.rows.length}</div></div>
<div class="card"><h3>Total P&amp;L vs cost</h3><div class="val ${totalPnl >= 0 ? 'pos' : 'neg'}">${escapeHtml(totalPnlStr)} <span style="font-size:.9rem">(${escapeHtml(totalVsCostStr)})</span></div></div>
</div>
<p class="note">${escapeHtml(table.indexNote)}</p>
${rankGridSection(
    'Monthly (~21 sessions) — Top 5 lagging vs index',
    'Monthly (~21 sessions) — Top 5 leading vs index',
    'Lowest / highest <strong>Stock − Index</strong> (pp) over ~21 trading sessions.',
    'Mo index',
    'Mo stock',
    table.monthlyWorstVsIndex,
    table.monthlyBestVsIndex
  )}
${rankGridSection(
    'Yearly (~12M) — Top 5 lagging vs index',
    'Yearly (~12M) — Top 5 leading vs index',
    'Lowest / highest <strong>Stock − Index</strong> (pp) over ~12 months.',
    'Yr index',
    'Yr stock',
    table.yearlyWorstVsIndex,
    table.yearlyBestVsIndex
  )}
<div class="wrap">
<table>
<thead>
<tr>
<th rowspan="2">Stock Name</th>
<th rowspan="2">Index Category</th>
<th rowspan="2" class="num">Qty</th>
<th rowspan="2" class="num">Purchase Cost</th>
<th rowspan="2" class="num">Current Value</th>
<th colspan="4" class="group">Vs your cost (deployed capital)</th>
<th colspan="3" class="group">Monthly (~21 sessions)</th>
<th colspan="3" class="group">Yearly (~12M)</th>
</tr>
<tr>
<th class="num">Avg cost</th><th class="num">CMP</th><th class="num">P&amp;L ₹</th><th class="num spread">Vs cost %</th>
<th class="num">Index</th><th class="num">Stock</th><th class="num spread">Stock − Index</th>
<th class="num">Index</th><th class="num">Stock</th><th class="num spread">Stock − Index</th>
</tr>
</thead>
<tbody>
${rowsHtml}
</tbody>
</table>
</div>
<footer>${
    audience === 'web'
      ? `Not investment advice. Report generated for ${escapeHtml(options?.userEmail ?? 'your account')} only — not shared with other users.`
      : 'Not investment advice. “Stock − Index” in percentage points (pp): positive = stock outperformed the benchmark over that window. Refresh: <code>cd web &amp;&amp; npx tsx scripts/generate-holdings-index-table.ts</code>'
  }</footer>
</body>
</html>`;
}
