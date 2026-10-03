import fs from 'fs/promises';
import path from 'path';
import { getRepoRoot } from './framework-paths';
import { toSlug } from './navigation';
import { STOCKBOOK_TICKER_INDEX } from './bundled/stockbook-index.generated';

export interface StockbookLocation {
  sector: string;
  stock: string;
  sectorSlug: string;
  stockSlug: string;
  ticker: string;
}

let cachedIndex: Map<string, StockbookLocation> | null = null;

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function rowToLocation(row: { sector: string; stock: string; ticker: string }): StockbookLocation {
  const ticker = row.ticker.toUpperCase();
  return {
    sector: row.sector,
    stock: row.stock,
    sectorSlug: toSlug(row.sector),
    stockSlug: toSlug(row.stock),
    ticker,
  };
}

function loadBundledTickerIndex(): Map<string, StockbookLocation> {
  const index = new Map<string, StockbookLocation>();
  for (const row of Object.values(STOCKBOOK_TICKER_INDEX)) {
    const loc = rowToLocation(row);
    index.set(loc.ticker, loc);
  }
  return index;
}

/** Build ticker → StockBook folder map from bundled index + on-disk summary-analysis.md. */
export async function buildStockbookTickerIndex(): Promise<Map<string, StockbookLocation>> {
  if (cachedIndex) return cachedIndex;

  const index = loadBundledTickerIndex();
  const root = path.join(getRepoRoot(), 'StockBook');

  if (!(await exists(root))) {
    cachedIndex = index;
    return index;
  }

  async function walk(sectorDir: string, sector: string): Promise<void> {
    let stocks;
    try {
      stocks = await fs.readdir(sectorDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const st of stocks) {
      if (!st.isDirectory()) continue;
      const stock = st.name;
      const summaryPath = path.join(sectorDir, st.name, 'summary-analysis.md');
      if (!(await exists(summaryPath))) continue;

      try {
        const md = await fs.readFile(summaryPath, 'utf8');
        const match = md.match(/\*\*Ticker:\*\*\s*([A-Z0-9.&-]+)/i);
        if (!match) continue;

        const ticker = match[1].toUpperCase();
        index.set(ticker, {
          sector,
          stock,
          sectorSlug: toSlug(sector),
          stockSlug: toSlug(stock),
          ticker,
        });
      } catch {
        /* skip unreadable summary */
      }
    }
  }

  try {
    const sectors = await fs.readdir(root, { withFileTypes: true });
    for (const s of sectors) {
      if (!s.isDirectory() || s.name.startsWith('.')) continue;
      await walk(path.join(root, s.name), s.name);
    }
  } catch {
    /* hosted deploy without StockBook on disk — bundled index still applies */
  }

  cachedIndex = index;
  return index;
}

export async function getStockbookByTicker(ticker: string): Promise<StockbookLocation | null> {
  const index = await buildStockbookTickerIndex();
  return index.get(ticker.toUpperCase()) ?? null;
}

/** Clear cache (tests / after StockBook sync). */
export function clearStockbookTickerIndexCache(): void {
  cachedIndex = null;
}
