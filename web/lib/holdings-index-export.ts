import type { HoldingsIndexTableResult, VsIndexRankRow } from './holdings-index-table';

function csvCell(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** UTF-8 BOM CSV — opens cleanly in Microsoft Excel. */
export function renderHoldingsIndexBenchmarkCsv(table: HoldingsIndexTableResult): string {
  const headers = [
    'Stock Name',
    'Ticker',
    'Index Category',
    'Quantity',
    'Purchase Cost (INR)',
    'Current Value (INR)',
    'Avg Cost per Share (INR)',
    'CMP (INR)',
    'Unrealized P and L (INR)',
    'Vs Cost (pct)',
    'Monthly Index Variation',
    'Monthly Stock Variation',
    'Monthly Stock vs Index (pp)',
    'Yearly Index Variation',
    'Yearly Stock Variation',
    'Yearly Stock vs Index (pp)',
  ];

  const lines = [headers.map(csvCell).join(',')];

  for (const r of table.rows) {
    lines.push(
      [
        r.stockName,
        r.ticker,
        r.indexCategory,
        String(r.qty),
        String(r.purchaseCost),
        r.currentValue != null ? String(r.currentValue) : '',
        r.avgCostPerShare != null ? r.avgCostPerShare.toFixed(2) : '',
        r.cmp != null ? r.cmp.toFixed(2) : '',
        r.unrealizedPnlInr != null ? String(r.unrealizedPnlInr) : '',
        r.vsCostVariation,
        r.monthlyIndexVariation,
        r.monthlyStockVariation,
        r.monthlyStockVsIndex,
        r.yearlyIndexVariation,
        r.yearlyStockVariation,
        r.yearlyStockVsIndex,
      ]
        .map(csvCell)
        .join(',')
    );
  }

  function rankBlock(
    title: string,
    rows: VsIndexRankRow[],
    indexCol: string,
    stockCol: string
  ) {
    lines.push('');
    lines.push(csvCell(title));
    lines.push(
      ['Rank', 'Stock Name', 'Ticker', 'Index Category', indexCol, stockCol, 'Stock vs Index (pp)']
        .map(csvCell)
        .join(',')
    );
    for (const r of rows) {
      lines.push(
        [
          String(r.rank),
          r.stockName,
          r.ticker,
          r.indexCategory,
          r.indexVariation,
          r.stockVariation,
          r.stockVsIndex,
        ]
          .map(csvCell)
          .join(',')
      );
    }
  }

  rankBlock(
    'MONTHLY TOP 5 LAGGING VS INDEX (lowest Stock minus Index pp)',
    table.monthlyWorstVsIndex,
    'Monthly Index Variation',
    'Monthly Stock Variation'
  );
  rankBlock(
    'MONTHLY TOP 5 LEADING VS INDEX (highest Stock minus Index pp)',
    table.monthlyBestVsIndex,
    'Monthly Index Variation',
    'Monthly Stock Variation'
  );
  rankBlock(
    'YEARLY TOP 5 LAGGING VS INDEX (lowest Stock minus Index pp)',
    table.yearlyWorstVsIndex,
    'Yearly Index Variation',
    'Yearly Stock Variation'
  );
  rankBlock(
    'YEARLY TOP 5 LEADING VS INDEX (highest Stock minus Index pp)',
    table.yearlyBestVsIndex,
    'Yearly Index Variation',
    'Yearly Stock Variation'
  );

  return `\uFEFF${lines.join('\r\n')}\r\n`;
}
