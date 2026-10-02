import fs from 'fs/promises';
import path from 'path';
import { getRepoRoot } from './framework-paths';
import { getStockbookByTicker } from './stockbook-index';

export interface QuarterScanItem {
  ticker: string;
  company: string;
  lastMention: string | null;
  expectedQuarter: string;
  stale: boolean;
  reason: string;
}

export interface QuarterScanResult {
  scannedAt: string;
  expectedQuarter: string;
  items: QuarterScanItem[];
  staleCount: number;
}

/** Indian FY: Apr–Mar. Map calendar month → likely reporting quarter label. */
export function currentExpectedQuarter(asOf = new Date()): string {
  const month = asOf.getMonth() + 1;
  const year = asOf.getFullYear();
  const fyEndYear = month >= 4 ? year + 1 : year;
  const fyLabel = `FY${String(fyEndYear).slice(-2)}`;

  if (month >= 4 && month <= 6) return `Q1 ${fyLabel}`;
  if (month >= 7 && month <= 9) return `Q2 ${fyLabel}`;
  if (month >= 10 && month <= 12) return `Q3 ${fyLabel}`;
  return `Q4 ${fyLabel}`;
}

const QUARTER_PATTERNS = [
  /Q[1-4]\s*FY\d{2,4}/gi,
  /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[- ]?\d{2,4}\s*(?:results|earnings)/gi,
  /(?:quarter|results)\s*(?:ended|ending)\s*[^\n|]+/gi,
  /\*\*Last results?:\*\*\s*([^\n]+)/i,
  /Analysis date:\*\*\s*(\d{4}-\d{2}-\d{2})/i,
];

function extractLastQuarterMention(text: string): string | null {
  for (const re of QUARTER_PATTERNS) {
    const matches = [...text.matchAll(re)];
    if (matches.length > 0) {
      return matches[matches.length - 1][0].trim();
    }
  }
  return null;
}

function isMentionStale(mention: string | null, expected: string, asOf: string): boolean {
  if (!mention) return true;
  const expQ = expected.replace(/\s+/g, '').toUpperCase();
  const norm = mention.replace(/\s+/g, '').toUpperCase();
  if (norm.includes(expQ)) return false;

  const dateInMention = mention.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (dateInMention) {
    const days =
      (new Date(`${asOf}T12:00:00`).getTime() -
        new Date(`${dateInMention[1]}-${dateInMention[2]}-${dateInMention[3]}T12:00:00`).getTime()) /
      86400000;
    return days > 100;
  }

  return true;
}

/** Scan portfolio for tickers that may need a quarterly results refresh. */
export async function scanQuarterResults(
  tickers: string[],
  companies: Map<string, string>
): Promise<QuarterScanResult> {
  const asOf = new Date().toISOString().slice(0, 10);
  const expected = currentExpectedQuarter();
  const items: QuarterScanItem[] = [];

  for (const ticker of [...new Set(tickers.map((t) => t.toUpperCase()))]) {
    const loc = await getStockbookByTicker(ticker);
    let text = '';

    if (loc) {
      const stockDir = path.join(getRepoRoot(), 'StockBook', loc.sector, loc.stock);
      for (const file of [
        'summary-analysis.md',
        `EARNINGS_QUALITY_${ticker}.md`,
        `PARAMETERS_${ticker}.md`,
      ]) {
        try {
          text += `\n${await fs.readFile(path.join(stockDir, file), 'utf8')}`;
        } catch {
          /* optional files */
        }
      }
    }

    const lastMention = extractLastQuarterMention(text);
    const stale = isMentionStale(lastMention, expected, asOf);
    items.push({
      ticker,
      company: companies.get(ticker) ?? ticker,
      lastMention,
      expectedQuarter: expected,
      stale,
      reason: stale
        ? lastMention
          ? `No ${expected} mention — last seen: ${lastMention.slice(0, 60)}`
          : `No recent quarter mention in StockBook`
        : `Up to date for ${expected}`,
    });
  }

  return {
    scannedAt: asOf,
    expectedQuarter: expected,
    items: items.sort((a, b) => Number(b.stale) - Number(a.stale)),
    staleCount: items.filter((i) => i.stale).length,
  };
}

export async function readBrokerAsOfDate(): Promise<string | null> {
  const p = path.join(getRepoRoot(), '.cursor/portfolio/broker-target-prices.md');
  try {
    const md = await fs.readFile(p, 'utf8');
    const m = md.match(/\*\*As of:\*\*\s*(\d{4}-\d{2}-\d{2})/i);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}
