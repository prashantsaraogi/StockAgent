import fs from 'fs/promises';
import path from 'path';
import { getRepoRoot } from './framework-paths';
import { aggregateRows, listLotsWithMetrics, type LotPersistenceContext } from './holding-lots';
import { assertSafeTenantId } from './tenant';

export interface DividendRegistryEntry {
  divPerShare: number;
  evidence: 'FACT' | 'UNVERIFIED' | 'ASSUMPTION';
  source?: string;
}

export interface DividendRegistry {
  asOf: string;
  label: string;
  yocAddGatePct: number;
  entries: Record<string, DividendRegistryEntry>;
  normalizedOverrides?: Record<string, { divPerShare: number; label: string }>;
}

export interface DividendRankRow {
  rank: number;
  ticker: string;
  company: string;
  qty: number;
  avgCost: number;
  cmp: number | null;
  fy26DivPerShare: number;
  yocPct: number;
  divYieldCmpPct: number | null;
  annualDivInr: number;
  evidence: string;
  note?: string;
}

export interface PortfolioDividendRank {
  asOf: string;
  yocAddGatePct: number;
  positionCount: number;
  topByYoc: DividendRankRow[];
  topByAbsoluteLowYoc: DividendRankRow[];
  topByCmpYield: DividendRankRow[];
  totalAnnualDivInr: number;
  top10AbsoluteLowYocSharePct: number | null;
  cmpCoveragePct: number | null;
  notes: string[];
}

let registryCache: DividendRegistry | null = null;

const EMPTY_DIVIDEND_REGISTRY: DividendRegistry = {
  asOf: 'unavailable',
  label: 'empty',
  yocAddGatePct: 8,
  entries: {},
};

export async function loadDividendRegistry(): Promise<DividendRegistry> {
  if (registryCache) return registryCache;
  const file = path.join(getRepoRoot(), '.cursor/portfolio/dividend-fy26.json');
  try {
    const raw = await fs.readFile(file, 'utf8');
    registryCache = JSON.parse(raw) as DividendRegistry;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') throw err;
    registryCache = EMPTY_DIVIDEND_REGISTRY;
  }
  return registryCache;
}

function buildRow(
  rank: number,
  ticker: string,
  company: string,
  qty: number,
  avgCost: number,
  cmp: number | null,
  entry: DividendRegistryEntry,
  note?: string
): DividendRankRow {
  const annualDivInr = Math.round(qty * entry.divPerShare);
  const yocPct = (entry.divPerShare / avgCost) * 100;
  const divYieldCmpPct =
    cmp != null && cmp > 0 ? Math.round((entry.divPerShare / cmp) * 1000) / 10 : null;
  return {
    rank,
    ticker,
    company,
    qty,
    avgCost,
    cmp,
    fy26DivPerShare: entry.divPerShare,
    yocPct: Math.round(yocPct * 10) / 10,
    divYieldCmpPct,
    annualDivInr,
    evidence: entry.evidence,
    note,
  };
}

function cmpByTicker(lots: Awaited<ReturnType<typeof listLotsWithMetrics>>): Map<string, number | null> {
  const map = new Map<string, number | null>();
  for (const lot of lots) {
    const key = lot.ticker.toUpperCase();
    if (!map.has(key)) map.set(key, lot.cmp);
  }
  return map;
}

export async function getPortfolioDividendRank(
  tenantId: string,
  lotCtx?: LotPersistenceContext
): Promise<PortfolioDividendRank> {
  assertSafeTenantId(tenantId);
  const [registry, lots] = await Promise.all([
    loadDividendRegistry(),
    listLotsWithMetrics(tenantId, lotCtx),
  ]);
  const holdings = aggregateRows(lots);
  const cmpMap = cmpByTicker(lots);

  const dividendRows = holdings
    .map((h) => {
      const entry = registry.entries[h.ticker];
      if (!entry || entry.divPerShare <= 0) return null;
      const cmp = cmpMap.get(h.ticker.toUpperCase()) ?? null;
      return buildRow(0, h.ticker, h.company, h.qty, h.avgCost, cmp, entry);
    })
    .filter((r): r is DividendRankRow => r !== null);

  const topByYoc = [...dividendRows]
    .sort((a, b) => b.yocPct - a.yocPct || b.annualDivInr - a.annualDivInr)
    .slice(0, 10)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  const lowYocRows = dividendRows.filter((r) => r.yocPct < registry.yocAddGatePct);
  const topByAbsoluteLowYoc = [...lowYocRows]
    .sort((a, b) => b.annualDivInr - a.annualDivInr)
    .slice(0, 10)
    .map((r, i) => ({
      ...r,
      rank: i + 1,
      note: whyLowYocNote(r.ticker, r.yocPct),
    }));

  const totalAnnualDivInr = dividendRows.reduce((s, r) => s + r.annualDivInr, 0);
  const top10AbsSum = topByAbsoluteLowYoc.reduce((s, r) => s + r.annualDivInr, 0);
  const top10AbsoluteLowYocSharePct =
    totalAnnualDivInr > 0 ? Math.round((top10AbsSum / totalAnnualDivInr) * 100) : null;

  const cmpRows = dividendRows.filter((r) => r.divYieldCmpPct != null);
  const topByCmpYield = [...cmpRows]
    .sort(
      (a, b) =>
        (b.divYieldCmpPct ?? 0) - (a.divYieldCmpPct ?? 0) ||
        b.annualDivInr - a.annualDivInr
    )
    .slice(0, 10)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  const cmpCoveragePct =
    dividendRows.length > 0 ? Math.round((cmpRows.length / dividendRows.length) * 100) : null;

  const notes: string[] = [];
  if (registry.asOf === 'unavailable') {
    notes.push(
      'Dividend registry file not available on this server (deploy bundle). Rank lists are empty; portfolio lots still load.'
    );
  } else {
    notes.push(
      'List 1 (YoC) = FY26 dividend per share ÷ your avg cost — primary lens for add gate on existing holders.',
      `8% YoC add gate: only names above ${registry.yocAddGatePct}% on trailing div qualify for scale adds on income logic alone.`,
      'List 3 (CMP yield) = div/sh ÷ live CMP — useful for fresh-entry comparison; not the primary metric for your legacy book.'
    );
  }

  const iocOverride = registry.normalizedOverrides?.IOC;
  const iocHolding = holdings.find((h) => h.ticker === 'IOC');
  if (iocOverride && iocHolding) {
    const normYoc = (iocOverride.divPerShare / iocHolding.avgCost) * 100;
    notes.push(
      `IOC special: trailing FY26 div only ₹1.25/sh (~${((1.25 / iocHolding.avgCost) * 100).toFixed(1)}% YoC). Normalized ~₹${iocOverride.divPerShare}/sh → ~${normYoc.toFixed(1)}% YoC — would rank ~#4 on normalized basis.`
    );
  }

  return {
    asOf: registry.asOf,
    yocAddGatePct: registry.yocAddGatePct,
    positionCount: holdings.length,
    topByYoc,
    topByAbsoluteLowYoc,
    topByCmpYield,
    totalAnnualDivInr,
    top10AbsoluteLowYocSharePct,
    cmpCoveragePct,
    notes,
  };
}

function whyLowYocNote(ticker: string, yocPct: number): string {
  const map: Record<string, string> = {
    ITC: 'Large book @ ₹358 — div compounder, not 8% income name',
    TCS: 'Legacy IT @ high avg — huge payout, low % on cost',
    HCLTECH: 'High avg cost — FY26 div generous in ₹',
    INFY: 'Qty × IT payout — low YoC on cost',
    HDFCBANK: 'Big qty, bank div on ₹775 cost is modest',
    HINDUNILVR: 'Quality FMCG — growth stock, not YoC compounder',
    MARUTI: 'Expensive avg — ₹140/sh still tiny vs cost',
    LT: 'Infra winner @ ₹2,304 — div is side benefit',
    BANKINDIA: 'High qty, low div/sh — below 8% gate',
    PNB: 'Largest PSU qty — income in ₹, not in %',
  };
  return map[ticker] ?? `YoC ${yocPct.toFixed(1)}% — below ${8}% add gate`;
}
