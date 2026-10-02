import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { getUserPaths, assertSafeTenantId } from './tenant';
import {
  groupByYearMonthDate,
  type DateYearGroup,
} from './date-history-group';
import { createClientIfConfigured } from './supabase/server';
import {
  isMissingTableError,
  isSupabaseTableUnavailable,
  markSupabaseTableUnavailable,
  warnMissingTableOnce,
} from './supabase/schema-errors';
import type { PeBasis, StockCalculatorResult } from './stock-calculator-engine';
import type {
  FrameworkQualityMetrics,
  RiskFactorResult,
  CagrGapAnalysis,
} from './stock-calculator-framework';
import {
  buildFallbackTabAnalysis,
  type CalculatorTabAnalysis,
} from './stock-calculator-tabs';

export interface CalculatorRecord {
  id: string;
  createdAt: string;
  ticker: string;
  stockName: string;
  sector: string;
  peBasis: PeBasis;
  expectedCagrPct: number;
  years: number;
  cmp: number;
  anchorPe: number;
  manualPeOverride: number | null;
  investmentAmountInr: number | null;
  frameworkPe: number | null;
  impliedVerdict: string;
  report: string;
  snapshot: StockCalculatorResult['snapshot'];
  scenarios: StockCalculatorResult['scenarios'];
  projectedEps: number;
  anchorEps: number;
  quality?: FrameworkQualityMetrics;
  internalRisk?: RiskFactorResult;
  externalRisk?: RiskFactorResult;
  cagrGap?: CagrGapAnalysis;
  frameworkVerdict?: string;
  reportMode?: 'framework-local' | 'gemini';
  tabAnalysis?: CalculatorTabAnalysis;
}

interface CalculatorIndexFile {
  version: 1;
  entries: CalculatorRecord[];
}

interface CalculatorHistoryRow {
  id: string;
  user_id: string;
  ticker: string;
  stock_name: string;
  sector: string;
  pe_basis: PeBasis;
  expected_cagr_pct: number;
  years: number;
  cmp: number;
  anchor_pe: number;
  manual_pe_override: number | null;
  investment_amount_inr: number | null;
  implied_verdict: string;
  report: string;
  snapshot: StockCalculatorResult['snapshot'];
  scenarios: StockCalculatorResult['scenarios'];
  projected_eps: number | null;
  anchor_eps: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

const EMPTY_QUALITY: FrameworkQualityMetrics = {
  roePct: null,
  roeDisplay: '—',
  roeRead: null,
  debtDisplay: '—',
  debtRatio: null,
  debtRead: null,
  ebitdaMarginPct: null,
  ebitdaDisplay: '—',
  ebitdaRead: null,
  cashFlowDisplay: '—',
  cashFlowRead: null,
  baseEpsCagrPct: null,
  baseEpsCagrRange: null,
  impliedPriceCagrPct: null,
};

function normalizeRecord(entry: CalculatorRecord): CalculatorRecord {
  return {
    ...entry,
    manualPeOverride: entry.manualPeOverride ?? null,
    investmentAmountInr: entry.investmentAmountInr ?? null,
    frameworkPe: entry.frameworkPe ?? null,
    quality: entry.quality ?? EMPTY_QUALITY,
    internalRisk: entry.internalRisk ?? {
      level: 'none',
      score: 0,
      haircutMidPp: 0,
      haircutRange: '0 pp',
      activeRiskCount: 0,
      topRisks: [],
      summary: 'Not recorded',
      source: 'unavailable',
    },
    externalRisk: entry.externalRisk ?? {
      level: 'none',
      score: 0,
      haircutMidPp: 0,
      haircutRange: '0 pp',
      activeRiskCount: 0,
      topRisks: [],
      summary: 'Not recorded',
      source: 'unavailable',
    },
    cagrGap: entry.cagrGap ?? {
      frameworkBaseEpsCagrPct: null,
      internalHaircutPp: 0,
      externalHaircutPp: 0,
      possibleEpsCagrPct: null,
      impliedPriceCagrPct: null,
      possibleCagrPct: null,
      expectedCagrPct: entry.expectedCagrPct,
      cagrGapPp: null,
      gapVerdict: 'Not recorded',
      gapTone: 'unknown',
    },
    frameworkVerdict: entry.frameworkVerdict ?? 'Not recorded',
    reportMode: entry.reportMode ?? 'framework-local',
    tabAnalysis:
      entry.tabAnalysis ??
      buildFallbackTabAnalysis(entry.snapshot, entry.quality ?? EMPTY_QUALITY),
  };
}

function calculatorDir(tenantId: string): string {
  return path.join(getUserPaths(tenantId).portfolioDir, '../stock-calculator');
}

function indexPath(tenantId: string): string {
  return path.join(calculatorDir(tenantId), 'index.json');
}

async function readIndex(tenantId: string): Promise<CalculatorIndexFile> {
  try {
    const raw = await fs.readFile(indexPath(tenantId), 'utf8');
    const parsed = JSON.parse(raw) as CalculatorIndexFile;
    if (parsed?.version === 1 && Array.isArray(parsed.entries)) return parsed;
  } catch {
    /* new */
  }
  return { version: 1, entries: [] };
}

async function writeIndex(tenantId: string, data: CalculatorIndexFile): Promise<void> {
  const dir = calculatorDir(tenantId);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(indexPath(tenantId), JSON.stringify(data, null, 2), 'utf8');
}

function rowToRecord(row: CalculatorHistoryRow): CalculatorRecord {
  const meta = row.metadata ?? {};
  return {
    id: row.id,
    createdAt: row.created_at,
    ticker: row.ticker,
    stockName: row.stock_name,
    sector: row.sector,
    peBasis: row.pe_basis,
    expectedCagrPct: Number(row.expected_cagr_pct),
    years: row.years,
    cmp: Number(row.cmp),
    anchorPe: Number(row.anchor_pe),
    manualPeOverride:
      row.manual_pe_override != null ? Number(row.manual_pe_override) : null,
    investmentAmountInr:
      row.investment_amount_inr != null ? Number(row.investment_amount_inr) : null,
    frameworkPe:
      typeof meta.frameworkPe === 'number'
        ? meta.frameworkPe
        : row.manual_pe_override == null
          ? Number(row.anchor_pe)
          : null,
    quality: (meta.quality as FrameworkQualityMetrics) ?? EMPTY_QUALITY,
    internalRisk: (meta.internalRisk as RiskFactorResult) ?? normalizeRecord({} as CalculatorRecord).internalRisk!,
    externalRisk: (meta.externalRisk as RiskFactorResult) ?? normalizeRecord({} as CalculatorRecord).externalRisk!,
    cagrGap: (meta.cagrGap as CagrGapAnalysis) ?? {
      frameworkBaseEpsCagrPct: null,
      internalHaircutPp: 0,
      externalHaircutPp: 0,
      possibleEpsCagrPct: null,
      impliedPriceCagrPct: null,
      possibleCagrPct: null,
      expectedCagrPct: Number(row.expected_cagr_pct),
      cagrGapPp: null,
      gapVerdict: 'Not recorded',
      gapTone: 'unknown',
    },
    frameworkVerdict:
      typeof meta.frameworkVerdict === 'string' ? meta.frameworkVerdict : 'Not recorded',
    reportMode:
      meta.reportMode === 'gemini' || meta.reportMode === 'framework-local'
        ? meta.reportMode
        : 'framework-local',
    tabAnalysis:
      (meta.tabAnalysis as CalculatorTabAnalysis) ??
      buildFallbackTabAnalysis(row.snapshot, (meta.quality as FrameworkQualityMetrics) ?? EMPTY_QUALITY),
    impliedVerdict: row.implied_verdict,
    report: row.report,
    snapshot: row.snapshot,
    scenarios: row.scenarios,
    projectedEps: Number(row.projected_eps ?? 0),
    anchorEps: Number(row.anchor_eps ?? 0),
  };
}

export function resultToRecord(
  result: StockCalculatorResult,
  id?: string
): CalculatorRecord {
  return {
    id: id ?? randomUUID(),
    createdAt: new Date().toISOString(),
    ticker: result.ticker,
    stockName: result.stockName,
    sector: result.sector,
    peBasis: result.peBasis,
    expectedCagrPct: result.expectedCagrPct,
    years: result.years,
    cmp: result.snapshot.cmp,
    anchorPe: result.anchorPe,
    manualPeOverride: result.manualPeOverride,
    investmentAmountInr: result.investmentAmountInr,
    frameworkPe: result.frameworkPe,
    impliedVerdict: result.impliedVerdict,
    report: result.report,
    snapshot: result.snapshot,
    scenarios: result.scenarios,
    projectedEps: result.projectedEps,
    anchorEps: result.anchorEps,
    quality: result.quality,
    internalRisk: result.internalRisk,
    externalRisk: result.externalRisk,
    cagrGap: result.cagrGap,
    frameworkVerdict: result.frameworkVerdict,
    reportMode: result.reportMode,
    tabAnalysis: result.tabAnalysis,
  };
}

async function persistRecordToDisk(tenantId: string, record: CalculatorRecord): Promise<void> {
  const index = await readIndex(tenantId);
  const existing = index.entries.findIndex((e) => e.id === record.id);
  if (existing >= 0) {
    index.entries[existing] = record;
  } else {
    index.entries.unshift(record);
  }
  await writeIndex(tenantId, index);
  await fs.writeFile(
    path.join(calculatorDir(tenantId), `${record.id}.md`),
    record.report,
    'utf8'
  );
}

const CALCULATOR_HISTORY_TABLE = 'calculator_history';

async function fetchAllFromSupabase(userId: string): Promise<CalculatorRecord[]> {
  if (isSupabaseTableUnavailable(CALCULATOR_HISTORY_TABLE)) return [];

  const supabase = await createClientIfConfigured();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(CALCULATOR_HISTORY_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    if (isMissingTableError(error)) {
      markSupabaseTableUnavailable(CALCULATOR_HISTORY_TABLE);
      warnMissingTableOnce(CALCULATOR_HISTORY_TABLE, '003_calculator_history.sql');
      return [];
    }
    if (process.env.NODE_ENV === 'development') {
      console.warn('calculator_history fetch failed:', error.message);
    }
    return [];
  }

  return (data as CalculatorHistoryRow[]).map(rowToRecord);
}

async function fetchOneFromSupabase(
  userId: string,
  id: string
): Promise<CalculatorRecord | null> {
  if (isSupabaseTableUnavailable(CALCULATOR_HISTORY_TABLE)) return null;

  const supabase = await createClientIfConfigured();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(CALCULATOR_HISTORY_TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) {
      markSupabaseTableUnavailable(CALCULATOR_HISTORY_TABLE);
      warnMissingTableOnce(CALCULATOR_HISTORY_TABLE, '003_calculator_history.sql');
      return null;
    }
    return null;
  }

  if (!data) return null;
  return rowToRecord(data as CalculatorHistoryRow);
}

export interface SaveCalculatorInput {
  tenantId: string;
  userId: string;
  authMode: 'supabase' | 'cookie-dev';
  result: StockCalculatorResult;
}

/** Persist calculator run — disk + Supabase; no portfolio link. */
export async function saveCalculatorRecord(input: SaveCalculatorInput): Promise<CalculatorRecord> {
  assertSafeTenantId(input.tenantId);
  const record = resultToRecord(input.result);

  await persistRecordToDisk(input.tenantId, record);

  if (input.authMode === 'supabase') {
    const supabase = await createClientIfConfigured();
    if (supabase && !isSupabaseTableUnavailable(CALCULATOR_HISTORY_TABLE)) {
      const { error } = await supabase.from(CALCULATOR_HISTORY_TABLE).insert({
        id: record.id,
        user_id: input.userId,
        ticker: record.ticker,
        stock_name: record.stockName,
        sector: record.sector,
        pe_basis: record.peBasis,
        expected_cagr_pct: record.expectedCagrPct,
        years: record.years,
        cmp: record.cmp,
        anchor_pe: record.anchorPe,
        manual_pe_override: record.manualPeOverride,
        investment_amount_inr: record.investmentAmountInr,
        implied_verdict: record.impliedVerdict,
        report: record.report,
        snapshot: record.snapshot,
        scenarios: record.scenarios,
        projected_eps: record.projectedEps,
        anchor_eps: record.anchorEps,
        metadata: {
          frameworkPe: record.frameworkPe,
          quality: record.quality,
          internalRisk: record.internalRisk,
          externalRisk: record.externalRisk,
          cagrGap: record.cagrGap,
          frameworkVerdict: record.frameworkVerdict,
          reportMode: record.reportMode,
          tabAnalysis: record.tabAnalysis,
        },
      });
      if (error) {
        if (isMissingTableError(error)) {
          markSupabaseTableUnavailable(CALCULATOR_HISTORY_TABLE);
          warnMissingTableOnce(CALCULATOR_HISTORY_TABLE, '003_calculator_history.sql');
        } else if (process.env.NODE_ENV === 'development') {
          console.warn('calculator_history insert failed:', error.message);
        }
      }
    }
  }

  return record;
}

export async function listCalculatorRecords(
  tenantId: string,
  userId?: string,
  authMode?: 'supabase' | 'cookie-dev'
): Promise<CalculatorRecord[]> {
  assertSafeTenantId(tenantId);
  let entries = (await readIndex(tenantId)).entries;

  if (
    entries.length === 0 &&
    authMode === 'supabase' &&
    userId
  ) {
    const remote = await fetchAllFromSupabase(userId);
    if (remote.length > 0) {
      for (const record of remote) {
        await persistRecordToDisk(tenantId, record);
      }
      entries = remote;
    }
  }

  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(normalizeRecord);
}

export async function getCalculatorRecord(
  tenantId: string,
  id: string,
  userId?: string,
  authMode?: 'supabase' | 'cookie-dev'
): Promise<CalculatorRecord | null> {
  const entries = await readIndex(tenantId);
  const local = entries.entries.find((e) => e.id === id);
  if (local) return normalizeRecord(local);

  if (authMode === 'supabase' && userId) {
    const remote = await fetchOneFromSupabase(userId, id);
    if (remote) {
      await persistRecordToDisk(tenantId, remote);
      return remote;
    }
  }

  return null;
}

export function groupCalculatorByDate(
  entries: CalculatorRecord[]
): DateYearGroup<CalculatorRecord>[] {
  return groupByYearMonthDate(entries, (e) => e.createdAt);
}
