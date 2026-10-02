import fs from 'fs/promises';
import path from 'path';
import { getRepoRoot } from './framework-paths';
import { getStockbookByTicker } from './stockbook-index';
import { fetchLiveNseCmpMap } from './nse-cmp';
import { calcLotCagr } from './holding-cagr';

export interface CmpRefreshTickerResult {
  ticker: string;
  cmp: number | null;
  filesUpdated: string[];
  error?: string;
}

export interface CmpRefreshResult {
  refreshedAt: string;
  tickersRequested: number;
  tickersUpdated: number;
  tickersFailed: string[];
  results: CmpRefreshTickerResult[];
  cachePath: string;
}

function formatRs(n: number): string {
  if (Number.isInteger(n)) return n.toLocaleString('en-IN');
  return n.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

function formatPct(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return `${rounded >= 0 ? '+' : ''}${rounded}%`;
}

/** Replace CMP header lines across StockBook markdown variants. */
export function patchCmpInMarkdown(md: string, cmp: number, date: string): string {
  const price = formatRs(cmp);
  let out = md;

  out = out.replace(
    /\*\*CMP:\*\*\s*(?:Rs\.?|₹)\s*[\d,]+(?:\.\d+)?(?:\s*\([^)]*\))?/gi,
    `**CMP:** Rs ${price} (${date})`
  );
  out = out.replace(
    /\*\*CMP:\*\*\s*\*\*(?:Rs\.?|₹)\s*[\d,]+(?:\.\d+)?\*\*/gi,
    `**CMP:** **Rs ${price}**`
  );
  out = out.replace(/\*\*CMP date:\*\*\s*\d{4}-\d{2}-\d{2}/gi, `**CMP date:** ${date}`);
  out = out.replace(
    /(\*\*Ticker:\*\*[^\n]*\|\s*\*\*CMP:\*\*\s*(?:Rs\.?|₹)\s*)[\d,]+(?:\.\d+)?/gi,
    `$1${price}`
  );

  return out;
}

/** Recalculate upside % in broker target table when CMP changes. */
export function patchBrokerUpside(md: string, cmp: number): string {
  return md.replace(
    /^(\|\s*[^|]+\|\s*[^|]+\|\s*[^|]+\|\s*([\d,]+(?:\.\d+)?)\s*\|\s*)([-+]?[\d.]+%?)(\s*\|)/gm,
    (line, prefix, targetStr, _oldUpside, suffix) => {
      if (!line.includes('| Broker |') && !/^\|\s*[-–—]/.test(line) && !/^\|\s*Broker/.test(line)) {
        const target = parseFloat(String(targetStr).replace(/,/g, ''));
        if (Number.isFinite(target) && target > 0 && cmp > 0) {
          const upside = ((target - cmp) / cmp) * 100;
          return `${prefix}${formatPct(upside)}${suffix}`;
        }
      }
      return line;
    }
  );
}

/** Recalculate CAGR lot rows and portfolio summary when CMP changes. */
export function patchCagrMetrics(md: string, cmp: number, date: string): string {
  let out = patchCmpInMarkdown(md, cmp, date);
  const asOf = new Date(`${date}T12:00:00`);

  const lines = out.split('\n');
  const updated = lines.map((line) => {
    if (!line.trim().startsWith('|')) return line;
    if (/^\|\s*Lot/.test(line) || /^\|\s*[-–—]/.test(line)) return line;
    const cells = line.split('|').map((c) => c.trim());
    if (cells.length < 10) return line;
    const qty = parseInt(cells[2]?.replace(/,/g, '') ?? '', 10);
    const buyDate = cells[3];
    const buyPrice = parseFloat(cells[4]?.replace(/,/g, '') ?? '');
    if (!Number.isFinite(qty) || !Number.isFinite(buyPrice) || !/^\d{4}-\d{2}-\d{2}$/.test(buyDate ?? '')) {
      return line;
    }
    const metrics = calcLotCagr({ price: buyPrice, purchaseDate: buyDate }, cmp, asOf);
    const days = buyDate
      ? Math.max(
          0,
          Math.round((asOf.getTime() - new Date(`${buyDate}T00:00:00`).getTime()) / 86400000)
        )
      : null;

    cells[6] = formatRs(cmp);
    if (days != null) cells[5] = String(days);
    if (metrics.simpleReturnPct != null) {
      cells[7] = `**${formatPct(metrics.simpleReturnPct)}**`;
    }
    if (metrics.cagrPct != null) {
      cells[8] = `**${metrics.cagrPct.toFixed(2)}%**`;
    } else if (metrics.simpleReturnPct != null && (days ?? 0) <= 0) {
      cells[8] = '**—**';
    }
    return `| ${cells.slice(1, -1).join(' | ')} |`;
  });

  out = updated.join('\n');

  const totalQtyMatch = out.match(/\|\s*Total qty\s*\|\s*(\d+)/i);
  const totalCostMatch = out.match(/\|\s*Total cost \(Rs\)\s*\|\s*([\d,]+)/i);
  if (totalQtyMatch && totalCostMatch) {
    const totalQty = parseInt(totalQtyMatch[1], 10);
    const totalCost = parseInt(totalCostMatch[1].replace(/,/g, ''), 10);
    const mktVal = totalQty * cmp;
    const blendedReturn = totalCost > 0 ? ((mktVal - totalCost) / totalCost) * 100 : null;

    out = out.replace(
      /\|\s*Market value @ CMP \(Rs\)\s*\|\s*[\d,]+/i,
      `| Market value @ CMP (Rs) | ${mktVal.toLocaleString('en-IN')}`
    );
    if (blendedReturn != null) {
      out = out.replace(
        /\|\s*Blended simple return %\s*\|\s*\*\*[^|]+\*\*/i,
        `| Blended simple return % | **${formatPct(blendedReturn)}**`
      );
    }
  }

  return out;
}

/** Derive new trailing P/E in PARAMETERS when old CMP + P/E exist in table. */
export function patchParametersPeFromCmp(md: string, newCmp: number, date: string): string {
  const headerMatch = md.match(/\*\*CMP:\*\*\s*(?:Rs\.?|₹)\s*([\d,]+(?:\.\d+)?)/i);
  const oldCmp = headerMatch ? parseFloat(headerMatch[1].replace(/,/g, '')) : null;

  const peRow = md.match(/\|\s*\*\*P\/E\*\*[^\n]+\|\s*\*\*([\d.]+)x\*\*/i);
  const oldPe = peRow ? parseFloat(peRow[1]) : null;

  let out = patchCmpInMarkdown(md, newCmp, date);

  if (oldCmp && oldPe && oldCmp > 0 && oldPe > 0 && newCmp > 0) {
    const eps = oldCmp / oldPe;
    const newPe = newCmp / eps;
    const newPeStr = `${(Math.round(newPe * 10) / 10).toFixed(1)}x`;
    out = out.replace(
      /(\|\s*\*\*P\/E\*\*[^\n]+\|\s*\*\*)[\d.]+x(\*\*)/i,
      `$1${newPeStr}$2`
    );
  }

  return out;
}

async function updateFileIfExists(
  filePath: string,
  transform: (md: string) => string
): Promise<boolean> {
  try {
    const md = await fs.readFile(filePath, 'utf8');
    const next = transform(md);
    if (next !== md) {
      await fs.writeFile(filePath, next, 'utf8');
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function refreshPortfolioCmpInStockbook(
  tickers: string[]
): Promise<CmpRefreshResult> {
  const unique = [...new Set(tickers.map((t) => t.toUpperCase()))];
  const date = new Date().toISOString().slice(0, 10);
  const quotes = await fetchLiveNseCmpMap(unique);
  const results: CmpRefreshTickerResult[] = [];
  const failed: string[] = [];
  const cache: Record<string, { cmp: number; asOf: string; source: string }> = {};

  for (const ticker of unique) {
    const quote = quotes.get(ticker);
    const filesUpdated: string[] = [];

    if (!quote?.price) {
      failed.push(ticker);
      results.push({ ticker, cmp: null, filesUpdated, error: 'CMP fetch failed' });
      continue;
    }

    const cmp = quote.price;
    cache[ticker] = { cmp, asOf: quote.asOf, source: quote.source };

    const loc = await getStockbookByTicker(ticker);
    if (!loc) {
      results.push({ ticker, cmp, filesUpdated, error: 'Not in StockBook' });
      continue;
    }

    const stockDir = path.join(getRepoRoot(), 'StockBook', loc.sector, loc.stock);

    const paramFile = `PARAMETERS_${ticker}.md`;
    const cagrFile = `CAGR_${ticker}.md`;
    const brokerFile = `BROKER_${ticker}.md`;

    if (
      await updateFileIfExists(path.join(stockDir, paramFile), (md) =>
        patchParametersPeFromCmp(md, cmp, date)
      )
    ) {
      filesUpdated.push(paramFile);
    }

    if (
      await updateFileIfExists(path.join(stockDir, cagrFile), (md) =>
        patchCagrMetrics(md, cmp, date)
      )
    ) {
      filesUpdated.push(cagrFile);
    }

    if (
      await updateFileIfExists(path.join(stockDir, brokerFile), (md) => {
        let next = patchCmpInMarkdown(md, cmp, date);
        next = patchBrokerUpside(next, cmp);
        return next;
      })
    ) {
      filesUpdated.push(brokerFile);
    }

    if (
      await updateFileIfExists(path.join(stockDir, 'summary-analysis.md'), (md) =>
        patchCmpInMarkdown(md, cmp, date)
      )
    ) {
      filesUpdated.push('summary-analysis.md');
    }

    results.push({ ticker, cmp, filesUpdated });
  }

  const cachePath = path.join(getRepoRoot(), 'StockBook', '_cmp-cache.json');
  await fs.writeFile(
    cachePath,
    JSON.stringify({ version: 1, refreshedAt: date, quotes: cache }, null, 2),
    'utf8'
  );

  return {
    refreshedAt: date,
    tickersRequested: unique.length,
    tickersUpdated: results.filter((r) => r.cmp != null && r.filesUpdated.length > 0).length,
    tickersFailed: failed,
    results,
    cachePath,
  };
}

export async function readCmpCacheStatus(): Promise<{
  refreshedAt: string | null;
  tickerCount: number;
}> {
  const cachePath = path.join(getRepoRoot(), 'StockBook', '_cmp-cache.json');
  try {
    const raw = await fs.readFile(cachePath, 'utf8');
    const parsed = JSON.parse(raw) as { refreshedAt?: string; quotes?: Record<string, unknown> };
    return {
      refreshedAt: parsed.refreshedAt ?? null,
      tickerCount: Object.keys(parsed.quotes ?? {}).length,
    };
  } catch {
    return { refreshedAt: null, tickerCount: 0 };
  }
}
