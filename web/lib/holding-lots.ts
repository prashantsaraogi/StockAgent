import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { getUserPaths, assertSafeTenantId } from './tenant';
import { isServerlessReadOnlyFs, safeMkdir } from './serverless-fs';
import { parseHoldingsTable, type HoldingRow } from './holdings';
import { resolveStock } from './stock-search';
import { getStockbookByTicker } from './stockbook-index';
import { getCmpMetaMap } from './cmp';
import type { CmpSource } from './cmp-labels';
import { calcLotCagr } from './holding-cagr';

export interface HoldingLot {
  id: string;
  ticker: string;
  company: string;
  sector: string;
  qty: number;
  price: number;
  purchaseDate: string;
  addedAt: string;
  /** Imported from summary without real buy date — user should edit */
  legacy?: boolean;
}

export interface LotWithMetrics extends HoldingLot {
  costBasis: number;
  cmp: number | null;
  cmpSource: CmpSource | null;
  cmpAsOf: string | null;
  holdingYears: number | null;
  simpleReturnPct: number | null;
  cagrPct: number | null;
}

interface LotsFile {
  version: 1;
  lots: HoldingLot[];
}

function lotsPath(tenantId: string): string {
  return path.join(getUserPaths(tenantId).portfolioDir, 'lots.json');
}

async function readLotsFile(tenantId: string): Promise<LotsFile> {
  const file = lotsPath(tenantId);
  try {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw) as LotsFile;
    if (parsed?.version === 1 && Array.isArray(parsed.lots)) return parsed;
  } catch {
    /* seed below */
  }
  return { version: 1, lots: [] };
}

async function writeLotsFile(tenantId: string, data: LotsFile): Promise<void> {
  if (isServerlessReadOnlyFs()) {
    throw new Error('Saving portfolio lots is not supported on read-only hosting (use local dev).');
  }
  const file = lotsPath(tenantId);
  const ok = await safeMkdir(path.dirname(file));
  if (!ok) throw new Error('Could not create portfolio directory');
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

function validateLotFields(input: {
  qty: number;
  price: number;
  purchaseDate: string;
}): void {
  if (!Number.isFinite(input.qty) || input.qty <= 0) {
    throw new Error('Quantity must be positive');
  }
  if (!Number.isFinite(input.price) || input.price <= 0) {
    throw new Error('Price must be positive');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.purchaseDate)) {
    throw new Error('Purchase date must be YYYY-MM-DD');
  }
}

/** Import existing holdings.md rows into lots.json when lots file is empty. */
export async function ensureLotsInitialized(tenantId: string): Promise<HoldingLot[]> {
  assertSafeTenantId(tenantId);
  const data = await readLotsFile(tenantId);
  if (data.lots.length > 0) return data.lots;

  const rows = await parseHoldingsTable(tenantId);
  if (rows.length === 0) return [];

  const today = new Date().toISOString().slice(0, 10);
  const imported: HoldingLot[] = rows.map((r) => ({
    id: randomUUID(),
    ticker: r.ticker,
    company: r.company,
    sector: r.holdingsSector,
    qty: r.qty,
    price: r.avgCost,
    purchaseDate: today,
    addedAt: new Date().toISOString(),
    legacy: true,
  }));

  if (!isServerlessReadOnlyFs()) {
    try {
      await writeLotsFile(tenantId, { version: 1, lots: imported });
      await syncHoldingsMarkdown(tenantId, imported);
    } catch {
      /* read-only host — serve imported lots for this request only */
    }
  }
  return imported;
}

export async function listHoldingLots(tenantId: string): Promise<HoldingLot[]> {
  const lots = await ensureLotsInitialized(tenantId);
  return lots.sort(
    (a, b) =>
      a.ticker.localeCompare(b.ticker) ||
      a.purchaseDate.localeCompare(b.purchaseDate) ||
      a.addedAt.localeCompare(b.addedAt)
  );
}

export async function listLotsWithMetrics(tenantId: string): Promise<LotWithMetrics[]> {
  const lots = await listHoldingLots(tenantId);
  const cmpMeta = await getCmpMetaMap(lots.map((l) => l.ticker));

  return lots.map((lot) => {
    const meta = cmpMeta.get(lot.ticker.toUpperCase());
    const cmp = meta?.price ?? null;
    const metrics = calcLotCagr(lot, cmp);
    return {
      ...lot,
      costBasis: Math.round(lot.qty * lot.price),
      cmp,
      cmpSource: meta?.source ?? null,
      cmpAsOf: meta?.asOf ?? null,
      ...metrics,
    };
  });
}

export function aggregateRows(lots: HoldingLot[]): HoldingRow[] {
  const byTicker = new Map<
    string,
    { ticker: string; company: string; sector: string; qty: number; cost: number }
  >();

  for (const lot of lots) {
    const key = lot.ticker.toUpperCase();
    const prev = byTicker.get(key);
    if (prev) {
      prev.qty += lot.qty;
      prev.cost += lot.qty * lot.price;
      prev.company = lot.company;
      prev.sector = lot.sector;
    } else {
      byTicker.set(key, {
        ticker: lot.ticker,
        company: lot.company,
        sector: lot.sector,
        qty: lot.qty,
        cost: lot.qty * lot.price,
      });
    }
  }

  return [...byTicker.values()]
    .map((r) => ({
      ticker: r.ticker,
      company: r.company,
      holdingsSector: r.sector,
      qty: r.qty,
      avgCost: Math.round((r.cost / r.qty) * 100) / 100,
      costBasis: Math.round(r.cost),
    }))
    .sort((a, b) => a.ticker.localeCompare(b.ticker));
}

/** Rewrite holdings.md — summary (aggregated) + purchase lots table (CAGR source). */
export async function syncHoldingsMarkdown(tenantId: string, lots: HoldingLot[]): Promise<void> {
  assertSafeTenantId(tenantId);
  const { holdingsFile } = getUserPaths(tenantId);
  const rows = aggregateRows(lots);
  const today = new Date().toISOString().slice(0, 10);
  const totalCost = rows.reduce((s, r) => s + r.costBasis, 0);
  const totalLots = lots.length;

  const summaryRows = rows
    .map(
      (r, i) =>
        `| ${i + 1} | ${r.ticker} | ${r.company} | ${r.qty} | ${r.avgCost.toLocaleString('en-IN')} | ${r.costBasis.toLocaleString('en-IN')} | ${r.holdingsSector} |`
    )
    .join('\n');

  const lotRows = lots
    .sort(
      (a, b) =>
        a.ticker.localeCompare(b.ticker) || a.purchaseDate.localeCompare(b.purchaseDate)
    )
    .map((lot, i) => {
      const cost = Math.round(lot.qty * lot.price);
      const legacy = lot.legacy ? ' · LEGACY' : '';
      return `| ${i + 1} | ${lot.ticker} | ${lot.company} | ${lot.qty} | ${lot.price.toLocaleString('en-IN')} | ${lot.purchaseDate} | ${cost.toLocaleString('en-IN')} | ${lot.sector}${legacy} |`;
    })
    .join('\n');

  const md = `# Portfolio Holdings — web tenant

**Tenant:** \`${tenantId}\`  
**Last updated:** ${today}  
**Tickers:** ${rows.length} · **Purchase lots:** ${totalLots}  
**Total cost basis:** ₹${totalCost.toLocaleString('en-IN')}  
**Note:** Each buy is a separate lot in \`lots.json\` — used for per-lot CAGR.

---

## Summary table (aggregated by ticker)

| # | Ticker | Company | Qty | Avg cost (₹) | Cost basis (₹) | Sector |
|---|--------|---------|-----|--------------|----------------|--------|
${summaryRows || ''}

---

## Purchase lots (one row per buy — CAGR source)

| # | Ticker | Company | Qty | Price (₹) | Purchase date | Cost (₹) | Sector |
|---|--------|---------|-----|-----------|---------------|----------|--------|
${lotRows || ''}
`;

  if (isServerlessReadOnlyFs()) return;
  const ok = await safeMkdir(path.dirname(holdingsFile));
  if (!ok) return;
  await fs.writeFile(holdingsFile, md, 'utf8');
}

export interface AddLotInput {
  stockName: string;
  qty: number;
  price: number;
  purchaseDate: string;
}

export interface UpdateLotInput {
  stockName?: string;
  qty: number;
  price: number;
  purchaseDate: string;
}

async function persistLots(tenantId: string, lots: HoldingLot[]) {
  await writeLotsFile(tenantId, { version: 1, lots });
  await syncHoldingsMarkdown(tenantId, lots);
}

export async function addHoldingLot(
  tenantId: string,
  input: AddLotInput
): Promise<{ lot: HoldingLot; rows: HoldingRow[]; lots: HoldingLot[] }> {
  assertSafeTenantId(tenantId);

  if (!input.stockName?.trim()) throw new Error('Stock name is required');
  validateLotFields(input);

  const resolved = await resolveStock(input.stockName);
  if (!resolved) {
    throw new Error(
      `Stock "${input.stockName}" not found in StockBook. Try ticker (e.g. CIPLA) or company name.`
    );
  }

  const loc = await getStockbookByTicker(resolved.ticker);
  const sector = loc?.sector ?? resolved.sector;

  const lot: HoldingLot = {
    id: randomUUID(),
    ticker: resolved.ticker,
    company: resolved.company,
    sector,
    qty: Math.floor(input.qty),
    price: Math.round(input.price * 100) / 100,
    purchaseDate: input.purchaseDate,
    addedAt: new Date().toISOString(),
    legacy: false,
  };

  await ensureLotsInitialized(tenantId);
  const data = await readLotsFile(tenantId);
  data.lots.push(lot);
  await persistLots(tenantId, data.lots);

  return { lot, rows: aggregateRows(data.lots), lots: data.lots };
}

export async function updateHoldingLot(
  tenantId: string,
  lotId: string,
  input: UpdateLotInput
): Promise<{ lot: HoldingLot; rows: HoldingRow[]; lots: HoldingLot[] }> {
  assertSafeTenantId(tenantId);
  validateLotFields(input);

  await ensureLotsInitialized(tenantId);
  const data = await readLotsFile(tenantId);
  const idx = data.lots.findIndex((l) => l.id === lotId);
  if (idx < 0) throw new Error('Lot not found');

  const existing = data.lots[idx];
  let ticker = existing.ticker;
  let company = existing.company;
  let sector = existing.sector;

  if (input.stockName?.trim()) {
    const resolved = await resolveStock(input.stockName);
    if (!resolved) {
      throw new Error(`Stock "${input.stockName}" not found in StockBook.`);
    }
    const loc = await getStockbookByTicker(resolved.ticker);
    ticker = resolved.ticker;
    company = resolved.company;
    sector = loc?.sector ?? resolved.sector;
  }

  const updated: HoldingLot = {
    ...existing,
    ticker,
    company,
    sector,
    qty: Math.floor(input.qty),
    price: Math.round(input.price * 100) / 100,
    purchaseDate: input.purchaseDate,
    legacy: false,
  };

  data.lots[idx] = updated;
  await persistLots(tenantId, data.lots);

  return { lot: updated, rows: aggregateRows(data.lots), lots: data.lots };
}

export async function deleteHoldingLot(
  tenantId: string,
  lotId: string
): Promise<{ rows: HoldingRow[]; lots: HoldingLot[] }> {
  assertSafeTenantId(tenantId);

  await ensureLotsInitialized(tenantId);
  const data = await readLotsFile(tenantId);
  const next = data.lots.filter((l) => l.id !== lotId);
  if (next.length === data.lots.length) throw new Error('Lot not found');

  await persistLots(tenantId, next);
  return { rows: aggregateRows(next), lots: next };
}

export async function getHoldingLot(
  tenantId: string,
  lotId: string
): Promise<HoldingLot | null> {
  const lots = await listHoldingLots(tenantId);
  return lots.find((l) => l.id === lotId) ?? null;
}
