/**
 * Merge quarterly PAT from Tapetide → StockBook EQ → Yahoo with latest-publication priority.
 */

import type { QuarterlyRow } from './earnings-quality';
import type { TapetideQuarterPat } from './tapetide-client';
import type { RunRateQuarterInput } from './pe-quarterly-run-rate';
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
};

/** Normalise period label for loose matching (Tapetide vs EQ FY labels). */
function periodKey(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function mergeQuarterlyPatSources(input: {
  tapetide: TapetideQuarterPat[] | null;
  eqRows: QuarterlyRow[];
  eqDataSource: string;
  stockbookFact?: boolean;
}): {
  rows: MergedQuarterPatRow[];
  inputs: RunRateQuarterInput[];
  sourceRank: PatSourceSnapshot[];
  latestResultSource: string;
  mergeNote: string;
} {
  const snapshots: PatSourceSnapshot[] = [];

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
      latestAt: null,
      quarterCount: input.eqRows.length,
    });
  }

  snapshots.sort((a, b) => parseIsoTime(b.latestAt) - parseIsoTime(a.latestAt));

  const byPeriod = new Map<string, CellCandidate>();

  const upsert = (period: string, cand: CellCandidate) => {
    const key = periodKey(period);
    const prev = byPeriod.get(key);
    if (!prev) {
      byPeriod.set(key, cand);
      return;
    }
    const tNew = parseIsoTime(cand.availableFrom);
    const tOld = parseIsoTime(prev.availableFrom);
    if (tNew > tOld) {
      byPeriod.set(key, cand);
      return;
    }
    if (tNew === tOld && tNew === 0) {
      const rank = (id: PatSourceSnapshot['id']) =>
        id === 'tapetide' ? 3 : id === 'stockbook' ? 2 : 1;
      if (rank(cand.sourceId) > rank(prev.sourceId)) byPeriod.set(key, cand);
    }
  };

  for (const q of input.tapetide ?? []) {
    upsert(q.period, {
      sourceId: 'tapetide',
      sourceLabel: 'Tapetide API',
      patCr: q.patCr,
      availableFrom: q.availableFrom,
      evidence: 'UNVERIFIED',
      periodEnded: q.period,
    });
  }

  for (const q of input.eqRows) {
    const isYahoo = /yahoo/i.test(input.eqDataSource);
    upsert(q.quarter, {
      sourceId: isYahoo ? 'yahoo' : 'stockbook',
      sourceLabel: isYahoo ? 'Yahoo Finance' : input.eqDataSource,
      patCr: q.pat,
      availableFrom: null,
      evidence: input.stockbookFact && !isYahoo ? 'FACT' : 'UNVERIFIED',
      periodEnded: q.quarter,
    });
  }

  const orderedPeriods: string[] = [];
  for (const q of input.tapetide ?? []) {
    if (!orderedPeriods.some((p) => periodKey(p) === periodKey(q.period))) {
      orderedPeriods.push(q.period);
    }
  }
  for (const q of input.eqRows) {
    if (!orderedPeriods.some((p) => periodKey(p) === periodKey(q.quarter))) {
      orderedPeriods.push(q.quarter);
    }
  }

  const rows: MergedQuarterPatRow[] = orderedPeriods.map((period) => {
    const cell = byPeriod.get(periodKey(period));
    return {
      quarter: period,
      patCr: cell?.patCr ?? null,
      source: cell?.sourceLabel ?? '—',
      evidence: cell?.evidence ?? 'UNVERIFIED',
      periodEnded: cell?.periodEnded ?? period,
      announcedOn: cell?.availableFrom ?? null,
    };
  });

  const inputs: RunRateQuarterInput[] = rows.map((r) => ({
    quarter: r.quarter,
    patCr: r.patCr,
    eps: null,
  }));

  const top = snapshots[0];
  const latestResultSource = top?.label ?? 'Manual / none';
  const mergeNote =
    snapshots.length === 0
      ? 'No automated quarterly PAT — enter values manually or set TAPETIDE_TOKEN.'
      : `Per quarter: newest publication date wins; tie-break Tapetide → StockBook → Yahoo. Overall freshest feed: ${latestResultSource}${top?.latestAt ? ` (latest publication ${top.latestAt.slice(0, 10)})` : ''}. Cross-check consolidated PAT vs BSE/NSE before FACT.`;

  return { rows, inputs, sourceRank: snapshots, latestResultSource, mergeNote };
}
