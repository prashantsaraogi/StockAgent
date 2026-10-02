import fs from 'fs/promises';
import path from 'path';
import { getRepoRoot } from './framework-paths';
import { getStockbookByTicker } from './stockbook-index';
import { fetchLiveNseCmp, fetchLiveNseCmpMap, type CmpQuote } from './nse-cmp';
import type { CmpSource } from './nse-cmp';

export type { CmpQuote, CmpSource } from './nse-cmp';
export { cmpSourceLabel } from './cmp-labels';

const CMP_PATTERNS = [
  /\*\*CMP:\*\*\s*₹?\s*([\d,]+(?:\.\d+)?)/i,
  /\*\*CMP:\*\*\s*Rs\.?\s*([\d,]+(?:\.\d+)?)/i,
  /\*\*CMP:\*\*\s*Rs\s*([\d,]+(?:\.\d+)?)/i,
  /CMP:\s*₹?\s*([\d,]+(?:\.\d+)?)/i,
  /CMP:\s*Rs\.?\s*([\d,]+(?:\.\d+)?)/i,
];

function parseCmpFromText(text: string): number | null {
  for (const re of CMP_PATTERNS) {
    const m = text.match(re);
    if (m) {
      const n = parseFloat(m[1].replace(/,/g, ''));
      if (!Number.isNaN(n) && n > 0) return n;
    }
  }
  return null;
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readStockbookCmp(ticker: string): Promise<number | null> {
  const loc = await getStockbookByTicker(ticker);
  if (!loc) return null;

  const stockDir = path.join(getRepoRoot(), 'StockBook', loc.sector, loc.stock);
  const paramGlob = `PARAMETERS_${ticker}.md`;

  try {
    const files = await fs.readdir(stockDir);
    const paramFile = files.find((f) => f.toUpperCase() === paramGlob.toUpperCase());
    if (paramFile) {
      const md = await fs.readFile(path.join(stockDir, paramFile), 'utf8');
      const cmp = parseCmpFromText(md);
      if (cmp) return cmp;
    }
  } catch {
    /* ignore */
  }

  const summaryPath = path.join(stockDir, 'summary-analysis.md');
  if (await fileExists(summaryPath)) {
    const md = await fs.readFile(summaryPath, 'utf8');
    return parseCmpFromText(md);
  }

  return null;
}

/**
 * Latest CMP — **NSE live first** (framework rule), StockBook fallback only.
 */
export async function getCmpQuote(ticker: string): Promise<CmpQuote | null> {
  const upper = ticker.toUpperCase();

  const live = await fetchLiveNseCmp(upper);
  if (live) return live;

  const stale = await readStockbookCmp(upper);
  if (stale != null) {
    return {
      ticker: upper,
      nseSymbol: upper,
      price: stale,
      source: 'stockbook',
      asOf: new Date().toISOString(),
    };
  }

  return null;
}

/** Batch CMP — live NSE first, StockBook fallback per missing ticker. */
export async function getCmpQuoteMap(
  tickers: string[]
): Promise<Map<string, CmpQuote | null>> {
  const unique = [...new Set(tickers.map((t) => t.toUpperCase()))];
  const map = await fetchLiveNseCmpMap(unique);

  await Promise.all(
    unique.map(async (t) => {
      if (map.get(t)) return;
      const stale = await readStockbookCmp(t);
      if (stale != null) {
        map.set(t, {
          ticker: t,
          nseSymbol: t,
          price: stale,
          source: 'stockbook',
          asOf: new Date().toISOString(),
        });
      } else {
        map.set(t, null);
      }
    })
  );

  return map;
}

/** Price only — prefer getCmpQuote for source metadata. */
export async function getCmpForTicker(ticker: string): Promise<number | null> {
  const q = await getCmpQuote(ticker);
  return q?.price ?? null;
}

/** Batch price map — Dashboard & Portfolio use this. */
export async function getCmpMap(tickers: string[]): Promise<Map<string, number | null>> {
  const quotes = await getCmpQuoteMap(tickers);
  const map = new Map<string, number | null>();
  for (const [t, q] of quotes) {
    map.set(t, q?.price ?? null);
  }
  return map;
}

export async function getCmpMetaMap(
  tickers: string[]
): Promise<Map<string, { price: number | null; source: CmpSource | null; asOf: string | null }>> {
  const quotes = await getCmpQuoteMap(tickers);
  const map = new Map<
    string,
    { price: number | null; source: CmpSource | null; asOf: string | null }
  >();
  for (const t of [...new Set(tickers.map((x) => x.toUpperCase()))]) {
    const q = quotes.get(t);
    map.set(t, {
      price: q?.price ?? null,
      source: q?.source ?? null,
      asOf: q?.asOf ?? null,
    });
  }
  return map;
}
