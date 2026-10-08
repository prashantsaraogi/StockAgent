/**
 * Peer column signals for Investment Analysis Report — StockBook comparative rank + PARAMETERS.
 */

import { getBundledComparativeRankMd } from './load-bundled-sector-outlook';
import {
  getBundledBusinessQualityMd,
  getBundledParametersMd,
  getBundledPegMd,
} from './load-bundled-stockbook';
import { extractParametersMasterCells, parseFrameworkQualityMetrics } from './stock-calculator-framework';
import { parseHistoricalGrowthTab } from './stock-calculator-tabs';

export type PeerSignal = '🟢' | '🟡' | '🔴' | '—';

export const SECTOR_PEER_LIST: Record<string, { ticker: string; label: string }[]> = {
  IT: [
    { ticker: 'TCS', label: 'TCS' },
    { ticker: 'INFY', label: 'Infosys' },
    { ticker: 'HCLTECH', label: 'HCLTech' },
    { ticker: 'WIPRO', label: 'Wipro' },
  ],
  Pharma: [
    { ticker: 'SUNPHARMA', label: 'Sun Pharma' },
    { ticker: 'DRREDDY', label: "Dr Reddy's" },
    { ticker: 'CIPLA', label: 'Cipla' },
    { ticker: 'LUPIN', label: 'Lupin' },
  ],
  'Banking and Finance': [
    { ticker: 'HDFCBANK', label: 'HDFC Bank' },
    { ticker: 'ICICIBANK', label: 'ICICI Bank' },
    { ticker: 'KOTAKBANK', label: 'Kotak' },
    { ticker: 'AXISBANK', label: 'Axis Bank' },
  ],
};

const SECTOR_COMPARATIVE_PATH: Record<string, string> = {
  Pharma: 'StockBook/Pharma/pharma-comparative-rank.md',
  'Banking and Finance': 'StockBook/Banking and Finance/banking-finance-comparative-rank.md',
  FMCG: 'StockBook/FMCG/fmcg-comparative-rank.md',
  Healthcare: 'StockBook/Healthcare/healthcare-comparative-rank.md',
  'Oil and Gas': 'StockBook/Oil and Gas/oil-gas-comparative-rank.md',
};

const TICKER_ALIASES: Record<string, string> = {
  sun: 'SUNPHARMA',
  'sun pharmaceutical': 'SUNPHARMA',
  'sun pharma': 'SUNPHARMA',
  lupin: 'LUPIN',
  cipla: 'CIPLA',
  "dr reddy's": 'DRREDDY',
  'dr reddy': 'DRREDDY',
  'dr. reddy': 'DRREDDY',
  drreddy: 'DRREDDY',
  tcs: 'TCS',
  infy: 'INFY',
  infosys: 'INFY',
  hcltech: 'HCLTECH',
  wipro: 'WIPRO',
  hdfcbank: 'HDFCBANK',
  'hdfc bank': 'HDFCBANK',
  icicibank: 'ICICIBANK',
  'icici bank': 'ICICIBANK',
  kotakbank: 'KOTAKBANK',
  kotak: 'KOTAKBANK',
  axisbank: 'AXISBANK',
  'axis bank': 'AXISBANK',
};

function resolveSectorKey(sector: string): string | null {
  const s = sector.toLowerCase();
  for (const key of Object.keys(SECTOR_PEER_LIST)) {
    if (s.includes(key.toLowerCase())) return key;
  }
  if (s.includes('it') || s.includes('software')) return 'IT';
  if (s.includes('pharma')) return 'Pharma';
  if (s.includes('bank') || s.includes('finance')) return 'Banking and Finance';
  return null;
}

function score10ToSignal(score: number): PeerSignal {
  if (score >= 7.5) return '🟢';
  if (score >= 5.5) return '🟡';
  return '🔴';
}

function growthSignal(pct: number | null): PeerSignal {
  if (pct == null) return '🟡';
  if (pct >= 8) return '🟢';
  if (pct < 0) return '🔴';
  return '🟡';
}

function parseNum(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const n = parseFloat(raw.replace(/,/g, '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function labelToTicker(label: string): string | null {
  const norm = label.replace(/\*\*/g, '').trim().toLowerCase();
  if (TICKER_ALIASES[norm]) return TICKER_ALIASES[norm];
  for (const [alias, ticker] of Object.entries(TICKER_ALIASES)) {
    if (norm.includes(alias)) return ticker;
  }
  const compact = norm.replace(/[^a-z0-9]/g, '');
  for (const [alias, ticker] of Object.entries(TICKER_ALIASES)) {
    if (compact.includes(alias.replace(/[^a-z0-9]/g, ''))) return ticker;
  }
  return null;
}

function parseScoreCell(cell: string): number | null {
  const m = cell.replace(/\*\*/g, '').match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : null;
}

/** Master weighted scorecard: Parameter | Weight | Col1 | Col2 | ... */
export function parseComparativeScorecard(md: string): Map<string, Partial<Record<string, PeerSignal>>> {
  const out = new Map<string, Partial<Record<string, PeerSignal>>>();
  const section =
    md.match(/## Master weighted scorecard[\s\S]*?(?=\n## |\n---\n|$)/i)?.[0] ??
    md.match(/## Weighted scorecard[\s\S]*?(?=\n## |\n---\n|$)/i)?.[0] ??
    '';

  if (!section) return out;

  let colTickers: string[] = [];
  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|') || !/parameter/i.test(line) || !/weight/i.test(line)) continue;
    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    colTickers = cells
      .slice(2)
      .map((c) => labelToTicker(c))
      .filter((t): t is string => t != null);
    break;
  }
  if (colTickers.length === 0) return out;

  const rowMap: { re: RegExp; key: string; setScaleFromScore?: boolean }[] = [
    { re: /^\|\s*A PCCL/i, key: 'scale' },
    { re: /^\|\s*C Growth/i, key: 'growth' },
    { re: /^\|\s*D Management/i, key: 'clients' },
    { re: /^\|\s*E FII/i, key: 'cash' },
    { re: /^\|\s*F Internal risk/i, key: 'balance' },
    { re: /^\|\s*G External risk/i, key: 'ai' },
    { re: /Weighted total/i, key: 'quality', setScaleFromScore: true },
  ];

  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|') || /---/.test(line)) continue;
    const rowDef = rowMap.find((r) => r.re.test(line));
    if (!rowDef) continue;
    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    const scores = cells.slice(2);
    colTickers.forEach((ticker, i) => {
      const score = parseScoreCell(scores[i] ?? '');
      if (score == null) return;
      const sig = score10ToSignal(score);
      const prev = out.get(ticker) ?? {};
      prev[rowDef.key] = sig;
      if (rowDef.setScaleFromScore) {
        prev.scale = score10ToSignal(score);
      }
      out.set(ticker, prev);
    });
  }

  return out;
}

function parseBusinessQualityScore10(ticker: string): number | null {
  const bq = getBundledBusinessQualityMd(ticker);
  if (bq) {
    const m = bq.match(/Business Quality Score\*\*\s*\|\s*\*\*(\d+(?:\.\d+)?)\s*\/\s*10/i);
    if (m) return parseFloat(m[1]);
  }
  const peg = getBundledPegMd(ticker);
  if (peg) {
    const m = peg.match(/\|\s*\*\*businessQualityScore10\*\*\s*\|\s*(\d+(?:\.\d+)?)/i);
    if (m) return parseFloat(m[1]);
  }
  return null;
}

export function computePeerSignalsFromStockBook(ticker: string): Record<string, PeerSignal> {
  const params = getBundledParametersMd(ticker);
  const quality = parseFrameworkQualityMetrics(params, null);
  const hist = parseHistoricalGrowthTab(params);
  const bqScore = parseBusinessQualityScore10(ticker);

  const ebitdaToday = parseNum(extractParametersMasterCells(params ?? '', 'EBITDA margin').today);
  const ebitdaAvg = parseNum(extractParametersMasterCells(params ?? '', 'EBITDA margin').avg10y);
  const marginDelta =
    ebitdaToday != null && ebitdaAvg != null ? Math.round((ebitdaToday - ebitdaAvg) * 10) / 10 : null;

  let patCagr: number | null = null;
  const peg = getBundledPegMd(ticker);
  const pegPat = peg?.match(/\|\s*\*\*patGrowthPct\*\*\s*\|\s*([\d.]+)/i)?.[1];
  if (pegPat) patCagr = parseFloat(pegPat);
  if (patCagr == null && hist.pe10yAvg) {
    /* use earnings section if present in eq file - skip */
  }

  const netCash = (params ?? '').match(/\|\s*\*\*Net cash \/ debt\*\*[^\n]+/i)?.[0] ?? '';
  const balanceStrong = /net cash|fortress|safe/i.test(netCash);

  const score = bqScore ?? (quality.roePct != null && quality.roePct >= 15 ? 7.5 : 6);

  return {
    scale: score >= 7 ? '🟢' : '🟡',
    margin:
      marginDelta == null ? '🟡' : marginDelta >= 0 ? '🟢' : marginDelta >= -2 ? '🟡' : '🔴',
    cash: quality.cashFlowDisplay !== '—' || balanceStrong ? '🟢' : '🟡',
    clients: score10ToSignal(score),
    growth: growthSignal(patCagr),
    ai: '🟡',
    balance: balanceStrong ? '🟢' : '🟡',
    quality: score10ToSignal(score),
  };
}

function mergePeerSignals(
  stockbook: Record<string, PeerSignal>,
  comparative: Partial<Record<string, PeerSignal>> | undefined
): Record<string, PeerSignal> {
  if (!comparative) return stockbook;
  return {
    scale: comparative.scale ?? stockbook.scale,
    margin: stockbook.margin,
    cash: comparative.cash ?? stockbook.cash,
    clients: comparative.clients ?? stockbook.clients,
    growth: comparative.growth ?? stockbook.growth,
    ai: comparative.ai ?? stockbook.ai,
    balance: comparative.balance ?? stockbook.balance,
    quality: comparative.quality ?? stockbook.quality,
  };
}

export function buildPeerSignalMatrix(
  sector: string,
  subjectTicker: string,
  subjectSignals: Record<string, PeerSignal>
): Map<string, Record<string, PeerSignal>> {
  const matrix = new Map<string, Record<string, PeerSignal>>();
  const subject = subjectTicker.toUpperCase();
  const sectorKey = resolveSectorKey(sector);

  const compPath = sectorKey ? SECTOR_COMPARATIVE_PATH[sectorKey] : undefined;
  const compMd = compPath ? getBundledComparativeRankMd(compPath) : null;
  const fromRank = compMd ? parseComparativeScorecard(compMd) : new Map();

  matrix.set(subject, mergePeerSignals(subjectSignals, fromRank.get(subject)));

  if (!sectorKey || !SECTOR_PEER_LIST[sectorKey]) return matrix;

  for (const peer of SECTOR_PEER_LIST[sectorKey]) {
    const t = peer.ticker.toUpperCase();
    if (t === subject) continue;
    const stockbook = computePeerSignalsFromStockBook(t);
    matrix.set(t, mergePeerSignals(stockbook, fromRank.get(t)));
  }

  return matrix;
}

export function resolveSectorKeyForPeers(sector: string): string | null {
  return resolveSectorKey(sector);
}
