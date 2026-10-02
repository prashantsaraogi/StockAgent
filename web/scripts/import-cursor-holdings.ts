/**
 * Import Cursor portfolio holdings into a web user tenant folder.
 * Usage: npx tsx scripts/import-cursor-holdings.ts [tenantId]
 */
import { importCursorHoldings, listPortfolioHoldings, getHoldingsSummary } from '../lib/holdings';
import { clearStockbookTickerIndexCache } from '../lib/stockbook-index';

const tenantId =
  process.argv[2] ?? '2a244608-4b6a-4e66-aa44-b43c18e7ac87';

async function main() {
  clearStockbookTickerIndexCache();
  const dest = await importCursorHoldings(tenantId);
  const summary = await getHoldingsSummary(tenantId);
  const mapped = await listPortfolioHoldings(tenantId);
  const withFiles = mapped.filter((s) => s.hasFiles).length;
  const unmapped = mapped.filter((s) => !s.hasFiles);

  console.log('\n=== Holdings import complete ===\n');
  console.log(`Tenant:     ${tenantId}`);
  console.log(`Written:    ${dest}`);
  console.log(`Positions:  ${summary.count}`);
  console.log(`Cost basis: ₹${summary.totalCostBasis.toLocaleString('en-IN')}`);
  console.log(`StockBook:  ${withFiles}/${summary.count} mapped to analysis folders`);

  if (unmapped.length > 0) {
    console.log('\nUnmapped tickers (no StockBook summary yet):');
    for (const u of unmapped) {
      console.log(`  - ${u.ticker} (${u.stock})`);
    }
  }
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
