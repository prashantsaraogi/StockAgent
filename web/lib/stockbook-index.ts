import fs from 'fs/promises';
import path from 'path';
import { getRepoRoot } from './framework-paths';
import { toSlug } from './navigation';

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

/** Build ticker → StockBook folder map from summary-analysis.md files. */
export async function buildStockbookTickerIndex(): Promise<Map<string, StockbookLocation>> {
  if (cachedIndex) return cachedIndex;

  const index = new Map<string, StockbookLocation>();
  const root = path.join(getRepoRoot(), 'StockBook');

  async function walk(sectorDir: string, sector: string): Promise<void> {
    const stocks = await fs.readdir(sectorDir, { withFileTypes: true });
    for (const st of stocks) {
      if (!st.isDirectory()) continue;
      const stock = st.name;
      const summaryPath = path.join(sectorDir, st.name, 'summary-analysis.md');
      if (!(await exists(summaryPath))) continue;

      const md = await fs.readFile(summaryPath, 'utf8');
      const match = md.match(/\*\*Ticker:\*\*\s*([A-Z0-9]+)/);
      if (!match) continue;

      const ticker = match[1].toUpperCase();
      index.set(ticker, {
        sector,
        stock,
        sectorSlug: toSlug(sector),
        stockSlug: toSlug(stock),
        ticker,
      });
    }
  }

  const sectors = await fs.readdir(root, { withFileTypes: true });
  for (const s of sectors) {
    if (!s.isDirectory() || s.name.startsWith('.')) continue;
    await walk(path.join(root, s.name), s.name);
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
