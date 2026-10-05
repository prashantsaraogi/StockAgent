/**
 * Build holdings × index + stock variation table from .cursor/portfolio/holdings.md
 * Run: npx tsx scripts/generate-holdings-index-table.ts
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildHoldingsIndexTableFromStocks } from '../lib/holdings-index-table';
import { renderHoldingsIndexBenchmarkHtml } from '../lib/holdings-index-html';
import { renderHoldingsIndexBenchmarkCsv } from '../lib/holdings-index-export';

const webDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.join(webDir, '..');
const holdingsPath = path.join(repoRoot, '.cursor/portfolio/holdings.md');
const outDir = path.join(repoRoot, '.cursor/portfolio');

interface HoldingRow {
  ticker: string;
  company: string;
  qty: number;
  costBasis: number;
  sector: string;
}

function parseHoldingsMd(md: string): HoldingRow[] {
  const rows: HoldingRow[] = [];
  for (const line of md.split('\n')) {
    if (!line.startsWith('|')) continue;
    if (line.includes('Ticker') || line.includes('---')) continue;
    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 7) continue;
    const ticker = cells[1]?.replace(/\*\*/g, '');
    if (!ticker || !/^[A-Z0-9.&-]+$/i.test(ticker)) continue;
    const qty = parseInt(cells[3]?.replace(/,/g, '') ?? '', 10);
    const costBasis = parseFloat(cells[5]?.replace(/,/g, '') ?? '');
    if (!Number.isFinite(qty) || !Number.isFinite(costBasis)) continue;
    rows.push({
      ticker,
      company: cells[2] ?? ticker,
      qty,
      costBasis: Math.round(costBasis),
      sector: cells[6] ?? 'Other',
    });
  }
  return rows;
}

function formatInr(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

async function main() {
  const md = await fs.readFile(holdingsPath, 'utf8');
  const holdings = parseHoldingsMd(md);
  const table = await buildHoldingsIndexTableFromStocks(
    holdings.map((h) => ({
      ticker: h.ticker,
      company: h.company,
      sector: h.sector,
      qty: h.qty,
      costBasis: h.costBasis,
      cmp: null,
      currentValue: 0,
    }))
  );

  const date = table.asOf.slice(0, 10);
  const lines = [
    `# Portfolio — stock vs index`,
    '',
    `**Generated:** ${date} · **Source:** holdings.md + NSE/Yahoo`,
    '',
    `> ${table.indexNote}`,
    '',
    '| Stock | Index | Qty | Cost | Value | Avg cost | CMP | P&L | Vs cost | M Idx | M Stk | M Stk−Idx | Y Idx | Y Stk | Y Stk−Idx |',
    '|-------|-------|----:|-----:|------:|---------:|----:|----:|--------:|------:|------:|----------:|------:|------:|----------:|',
  ];

  for (const r of table.rows) {
    lines.push(
      `| ${r.stockName} (${r.ticker}) | ${r.indexCategory} | ${r.qty.toLocaleString('en-IN')} | ${formatInr(r.purchaseCost)} | ${r.currentValue != null ? formatInr(r.currentValue) : '—'} | ${r.avgCostDisplay} | ${r.cmpDisplay} | ${r.unrealizedPnlDisplay} | ${r.vsCostVariation} | ${r.monthlyIndexVariation} | ${r.monthlyStockVariation} | ${r.monthlyStockVsIndex} | ${r.yearlyIndexVariation} | ${r.yearlyStockVariation} | ${r.yearlyStockVsIndex} |`
    );
  }

  const rankMd = (
    title: string,
    rows: typeof table.yearlyWorstVsIndex,
    idxHdr: string,
    stkHdr: string
  ) => {
    lines.push('', `## ${title}`, '');
    lines.push(`| # | Stock | Index | ${idxHdr} | ${stkHdr} | Stock − Index |`);
    lines.push('|--:|-------|-------|---------:|---------:|--------------:|');
    for (const r of rows) {
      lines.push(
        `| ${r.rank} | ${r.stockName} (${r.ticker}) | ${r.indexCategory} | ${r.indexVariation} | ${r.stockVariation} | ${r.stockVsIndex} |`
      );
    }
  };

  rankMd(
    'Monthly top 5 lagging vs index (lowest Stock − Index pp)',
    table.monthlyWorstVsIndex,
    'Mo index',
    'Mo stock'
  );
  rankMd(
    'Monthly top 5 leading vs index (highest Stock − Index pp)',
    table.monthlyBestVsIndex,
    'Mo index',
    'Mo stock'
  );
  rankMd(
    'Yearly top 5 lagging vs index (lowest Stock − Index pp)',
    table.yearlyWorstVsIndex,
    'Yr index',
    'Yr stock'
  );
  rankMd(
    'Yearly top 5 leading vs index (highest Stock − Index pp)',
    table.yearlyBestVsIndex,
    'Yr index',
    'Yr stock'
  );

  lines.push('', '---', '', '*Not investment advice.*', '');

  const outMd = path.join(outDir, 'holdings-index-benchmark.md');
  const outHtml = path.join(outDir, 'holdings-index-benchmark.html');
  const outCsv = path.join(outDir, 'holdings-index-benchmark.csv');

  await fs.writeFile(outMd, lines.join('\n'), 'utf8');
  await fs.writeFile(outHtml, renderHoldingsIndexBenchmarkHtml(table), 'utf8');
  await fs.writeFile(outCsv, renderHoldingsIndexBenchmarkCsv(table), 'utf8');

  console.log(`Wrote ${table.rows.length} rows →`);
  console.log(`  ${outHtml}`);
  console.log(`  ${outCsv}  (open in Excel)`);
  console.log(`  ${outMd}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
