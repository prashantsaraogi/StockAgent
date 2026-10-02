import './load-env-local';
import { refreshAllSectorOutlookMcaps } from '../lib/sector-mcap-refresh';

async function main() {
  console.log('Sector cap-tier mcap refresh — starting…\n');
  const results = await refreshAllSectorOutlookMcaps();
  let totalOk = 0;
  let totalFail = 0;

  for (const r of results) {
    const label = r.filePath.split('/').pop();
    console.log(`${label}`);
    console.log(`  refreshed: ${r.refreshedAt}`);
    console.log(`  updated:   ${r.tickersUpdated} tickers`);
    if (r.tickersFailed.length) {
      console.log(`  failed:    ${r.tickersFailed.join(', ')}`);
      totalFail += r.tickersFailed.length;
    }
    totalOk += r.tickersUpdated;
    console.log('');
  }

  console.log(`Done — ${totalOk} mcaps updated, ${totalFail} fetch failures.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
