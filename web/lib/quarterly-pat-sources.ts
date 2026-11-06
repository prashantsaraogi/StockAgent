/**
 * Merge quarterly PAT from Tapetide → StockBook EQ → Yahoo with latest-publication priority.
 */

import type { QuarterlyRow } from './earnings-quality';
import type { TapetideQuarterPat } from './tapetide-client';
import type { RunRateQuarterInput } from './pe-quarterly-run-rate';
import {
  compareFiscalQuarterLabels,
  formatFiscalQuarter,
  parseFiscalQuarter,
} from './fiscal-quarter-sort';

type EvidenceLabel = 'FACT' | 'UNVERIFIED' | 'OUR ASSUMPTION';

export interface PatSourceSnapshot {
  id: 'tapetide' | 'stockbook' | 'yahoo';
  label: string;
  latestAt: string | null;
  quarterCount: number;
}

export interface MergedQuarterPatRow {
  quarter: string;
  patCr: number | null;
  source: string;
  evidence: EvidenceLabel;
  periodEnded: string | null;
  announcedOn: string | null;
}

function parseIsoTime(iso: string | null | undefined): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

function maxAvailableFrom(quarters: { availableFrom?: string | null }[]): string | null {
  let best = 0;
  let label: string | null = null;
  for (const q of quarters) {
    const t = parseIsoTime(q.availableFrom ?? null);
    if (t > best) {
      best = t;
      label = q.availableFrom ?? null;
    }
  }
  return label;
}

type CellCandidate = {
  sourceId: PatSourceSnapshot['id'];
  sourceLabel: string;
  patCr: number | null;
  availableFrom: string | null;
  evidence: EvidenceLabel;
  periodEnded: string | null;
  displayQuarter: string;
};

function fiscalSlotKey(label: string): string | null {
  const p = parseFiscalQuarter(label);
  if (!p) return null;
  return formatFiscalQuarter(p.fy, p.q);
}

export function mergeQuarterlyPatSources(input: {
  tapetide: TapetideQuarterPat[] | null;
  eqRows: QuarterlyRow[];
  eqDataSource: string;
  stockbookFact?: boolean;
  stockbookLastUpdated?: string | null;
  calculationDate?: string;
}): {
  rows: MergedQuarterPatRow[];
  inputs: RunRateQuarterInput[];
  sourceRank: PatSourceSnapshot[];
  latestResultSource: string;
  mergeNote: string;
  latestQuarterInTable: string | null;
  staleStockbookWarning: string | null;
} {
  const snapshots: PatSourceSnapshot[] = [];
  const stockbookUpdatedMs = parseIsoTime(input.stockbookLastUpdated);

  if (input.tapetide?.length) {
    snapshots.push({
      id: 'tapetide',
      label: 'Tapetide API (quarterly P&L)',
      latestAt: maxAvailableFrom(input.tapetide),
      quarterCount: input.tapetide.length,
    });
  }

  if (input.eqRows.length) {
    const isYahoo = /yahoo/i.test(input.eqDataSource);
    snapshots.push({
      id: isYahoo ? 'yahoo' : 'stockbook',
      label: isYahoo ? 'Yahoo Finance (.NS)' : `StockBook / ${input.eqDataSource}`,
      latestAt: input.stockbookLastUpdated ?? null,
      quarterCount: input.eqRows.length,
    });
  }

  snapshots.sort((a, b) => parseIsoTime(b.latestAt) - parseIsoTime(a.latestAt));

  const bySlot = new Map<string, CellCandidate>();

  const upsert = (period: string, cand: CellCandidate) => {
    const slot = fiscalSlotKey(period) ?? period.trim().toLowerCase();
    const prev = bySlot.get(slot);
    if (!prev) {
      bySlot.set(slot, cand);
      return;
    }
    const tNew = parseIsoTime(cand.availableFrom);
    const tOld = parseIsoTime(prev.availableFrom);

    if (tNew > tOld) {
      bySlot.set(slot, cand);
      return;
    }
    if (tNew > 0 && tOld === 0 && prev.sourceId === 'stockbook') {
      bySlot.set(slot, cand);
      return;
    }
    if (tNew === tOld) {
      const rank = (id: PatSourceSnapshot['id']) =>
        id === 'tapetide' ? 3 : id === 'stockbook' ? 2 : 1;
      if (rank(cand.sourceId) > rank(prev.sourceId)) bySlot.set(slot, cand);
    }
  };

  const isYahoo = /yahoo/i.test(input.eqDataSource);

  for (const q of input.eqRows) {
    upsert(q.quarter, {
      sourceId: isYahoo ? 'yahoo' : 'stockbook',
      sourceLabel: isYahoo ? 'Yahoo Finance' : input.eqDataSource,
      patCr: q.pat,
      availableFrom: input.stockbookLastUpdated ?? null,
      evidence: input.stockbookFact && !isYahoo ? 'FACT' : 'UNVERIFIED',
      periodEnded: q.quarter,
      displayQuarter: q.quarter,
    });
  }

  for (const q of input.tapetide ?? []) {
    const slot = fiscalSlotKey(q.period);
    const display = slot ?? q.period;
    upsert(q.period, {
      sourceId: 'tapetide',
      sourceLabel: 'Tapetide API',
      patCr: q.patCr,
      availableFrom: q.availableFrom,
      evidence: 'UNVERIFIED',
      periodEnded: q.period,
      displayQuarter: display.includes('FY') ? display : q.period,
    });
  }

  const mergedCells = [...bySlot.values()].sort((a, b) =>
    compareFiscalQuarterLabels(a.displayQuarter, b.displayQuarter)
  );

  const rows: MergedQuarterPatRow[] = mergedCells.map((cell) => ({
    quarter: cell.displayQuarter,
    patCr: cell.patCr,
    source: cell.sourceLabel,
    evidence: cell.evidence,
    periodEnded: cell.periodEnded,
    announcedOn: cell.availableFrom,
  }));

  const inputs: RunRateQuarterInput[] = rows.map((r) => ({
    quarter: r.quarter,
    patCr: r.patCr,
    eps: null,
  }));

  const latestQuarterInTable = rows.length ? rows[rows.length - 1].quarter : null;
  const tapetideLatest = maxAvailableFrom(input.tapetide ?? []);
  let staleStockbookWarning: string | null = null;

  if (
    input.stockbookFact &&
    tapetideLatest &&
    stockbookUpdatedMs > 0 &&
    parseIsoTime(tapetideLatest) > stockbookUpdatedMs
  ) {
    staleStockbookWarning =
      `StockBook file is older than Tapetide (file ${input.stockbookLastUpdated?.slice(0, 10) ?? '—'} vs Tapetide publication ${tapetideLatest.slice(0, 10)}). Tapetide wins overlapping quarters — refresh EARNINGS_QUALITY after results.`;
  }

  const calcMs = parseIsoTime(input.calculationDate);
  if (latestQuarterInTable && calcMs > 0) {
    const latestAnn = rows[rows.length - 1].announcedOn;
    if (latestAnn && calcMs - parseIsoTime(latestAnn) > 45 * 86400000) {
      staleStockbookWarning =
        (staleStockbookWarning ? staleStockbookWarning + ' ' : '') +
        `Latest quarter in table (${latestQuarterInTable}) may be stale vs today — paste new PAT after results or redeploy after StockBook update.`;
    }
  }

  const top = snapshots[0];
  const latestResultSource = top?.label ?? 'Manual / none';
  const mergeNote =
    snapshots.length === 0
      ? 'No automated quarterly PAT — enter values manually or set TAPETIDE_TOKEN.'
      : `Quarters sorted FY order. Per slot: newest publication wins; Tapetide over StockBook when Tapetide has a newer available_from. Freshest feed: ${latestResultSource}${top?.latestAt ? ` (${String(top.latestAt).slice(0, 10)})` : ''}. After results day, update StockBook or paste PAT — providers lag 0–2 days.`;

  return {
    rows,
    inputs,
    sourceRank: snapshots,
    latestResultSource,
    mergeNote,
    latestQuarterInTable,
    staleStockbookWarning,
  };
}
