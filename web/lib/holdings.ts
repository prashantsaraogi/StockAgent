import fs from 'fs/promises';
import path from 'path';
import { getRepoRoot } from './framework-paths';
import { getUserPaths, assertSafeTenantId } from './tenant';
import { isServerlessReadOnlyFs, safeWriteFile } from './serverless-fs';
import { getStockbookByTicker } from './stockbook-index';
import type { StockEntry } from './content';
import { toSlug } from './navigation';

export interface HoldingRow {
  ticker: string;
  company: string;
  holdingsSector: string;
  qty: number;
  avgCost: number;
  costBasis: number;
}

export async function parseHoldingsTable(tenantId: string): Promise<HoldingRow[]> {
  assertSafeTenantId(tenantId);
  const { holdingsFile } = getUserPaths(tenantId);
  let md: string;
  try {
    md = await fs.readFile(holdingsFile, 'utf8');
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return [];
    throw err;
  }
  const rows: HoldingRow[] = [];

  for (const m of md.matchAll(
    /\|\s*(\d+)\s*\|\s*(\w+)\s*\|\s*([^|]+)\|\s*([\d,]+)\s*\|\s*([\d,]+(?:\.\d+)?)\s*\|\s*([\d,]+)\s*\|\s*([^|]+)\|/g
  )) {
    const num = parseInt(m[1], 10);
    if (num > 51) continue; // skip other tables (top 10 rank, etc.)

    rows.push({
      ticker: m[2].trim().toUpperCase(),
      company: m[3].trim(),
      qty: parseInt(m[4].replace(/,/g, ''), 10),
      avgCost: parseFloat(m[5].replace(/,/g, '')),
      costBasis: parseInt(m[6].replace(/,/g, ''), 10),
      holdingsSector: m[7].trim(),
    });
  }

  return rows;
}

/** Portfolio holdings mapped to StockBook folders — user's stocks only. */
export async function listPortfolioHoldings(tenantId: string): Promise<StockEntry[]> {
  const holdings = await parseHoldingsTable(tenantId);
  const entries: StockEntry[] = [];

  for (const h of holdings) {
    const loc = await getStockbookByTicker(h.ticker);
    if (loc) {
      entries.push({
        sector: loc.sector,
        stock: loc.stock,
        sectorSlug: loc.sectorSlug,
        stockSlug: loc.stockSlug,
        ticker: h.ticker,
        hasFiles: true,
        holdingsSector: h.holdingsSector,
        qty: h.qty,
        avgCost: h.avgCost,
      });
    } else {
      entries.push({
        sector: h.holdingsSector,
        stock: h.company,
        sectorSlug: toSlug(h.holdingsSector),
        stockSlug: toSlug(h.company),
        ticker: h.ticker,
        hasFiles: false,
        holdingsSector: h.holdingsSector,
        qty: h.qty,
        avgCost: h.avgCost,
      });
    }
  }

  return entries.sort(
    (a, b) => a.sector.localeCompare(b.sector) || a.stock.localeCompare(b.stock)
  );
}

/** Import .cursor/portfolio/holdings.md → data/users/{tenantId}/portfolio/holdings.md */
export async function importCursorHoldings(tenantId: string): Promise<string> {
  const source = path.join(getRepoRoot(), '.cursor/portfolio/holdings.md');
  const dest = getUserPaths(tenantId).holdingsFile;
  let content = await fs.readFile(source, 'utf8');
  const today = new Date().toISOString().slice(0, 10);

  content = `# Portfolio Holdings — web tenant

**Tenant:** \`${tenantId}\`  
**Imported:** ${today} from \`.cursor/portfolio/holdings.md\`  
**Positions:** 51  
**Note:** Web app reads this file only — Cursor live file unchanged.

---

${content.replace(/^# Portfolio Holdings[^\n]*\n\n/m, '')}`;

  if (isServerlessReadOnlyFs()) {
    throw new Error('Importing holdings is not supported on read-only hosting (use local dev).');
  }
  const ok = await safeWriteFile(dest, content);
  if (!ok) throw new Error('Could not write holdings file.');
  return dest;
}

export async function getHoldingsSummary(tenantId: string): Promise<{
  count: number;
  totalCostBasis: number;
}> {
  const rows = await parseHoldingsTable(tenantId);
  return {
    count: rows.length,
    totalCostBasis: rows.reduce((s, r) => s + r.costBasis, 0),
  };
}
