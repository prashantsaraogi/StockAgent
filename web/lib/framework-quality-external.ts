import type { FrameworkQualityMetrics } from './stock-calculator-framework';
import { fetchExternalMarginMetrics } from './margin-external-metrics';
import { fetchYahooQuoteSummary, rawNum } from './yahoo-finance-session';

export type QualityMetricSource = 'yahoo' | 'parameters' | null;

export interface EnrichedQualityMetrics extends FrameworkQualityMetrics {
  roeSource: QualityMetricSource;
  ebitdaSource: QualityMetricSource;
  debtSource: QualityMetricSource;
  cashFlowSource: QualityMetricSource;
  liveEnrichmentLabel: string | null;
}

function isMissingDisplay(display: string, pct: number | null): boolean {
  if (pct != null) return false;
  const d = display.replace(/\*\*/g, '').trim();
  return !d || d === '—' || /unverified|pending|n\/a/i.test(d);
}

function roeReadFromPct(pct: number): string {
  if (pct >= 18) return 'Strong vs 15% compounder gate';
  if (pct >= 15) return 'Pass — Buffett ≥15% gate';
  return 'Below 15% ROE gate';
}

function fmtPct(n: number): string {
  return `${Math.round(n * 10) / 10}%`;
}

/** Fill Block B gaps (UNVERIFIED in PARAMETERS) from Yahoo Finance .NS — same stack as CMP/margin tab. */
export async function enrichFrameworkQualityMetrics(
  ticker: string,
  quality: FrameworkQualityMetrics,
  sector: string
): Promise<EnrichedQualityMetrics> {
  const isFinancial = /bank|finance|nbfc|insurance|amc/i.test(sector);
  const ext = await fetchExternalMarginMetrics(ticker, isFinancial);

  let merged: FrameworkQualityMetrics = { ...quality };
  let debtFromYahoo: { display: string; ratio: number | null; read: string | null } | null = null;
  try {
    const summary = await fetchYahooQuoteSummary(
      ticker,
      'financialData,defaultKeyStatistics'
    );
    if (summary) {
      const financial = summary.financialData as Record<string, unknown> | undefined;
      const stats = summary.defaultKeyStatistics as Record<string, unknown> | undefined;
      const de = rawNum(financial?.debtToEquity) ?? rawNum(stats?.debtToEquity);
      const totalDebt = rawNum(financial?.totalDebt);
      const totalCash = rawNum(financial?.totalCash);
      if (de != null && de > 0) {
        debtFromYahoo = {
          ratio: de,
          display: `${Math.round(de * 100) / 100}× D/E`,
          read: de <= 0.5 ? 'Light leverage' : de <= 1.5 ? 'Moderate leverage' : 'Elevated leverage',
        };
      } else if (totalDebt != null && totalCash != null) {
        const net = totalDebt - totalCash;
        if (net <= 0) {
          debtFromYahoo = {
            ratio: 0,
            display: 'Net cash',
            read: 'Net cash on balance sheet (Yahoo TTM)',
          };
        } else if (totalDebt > 0) {
          debtFromYahoo = {
            ratio: null,
            display: `Gross debt ₹${Math.round(totalDebt / 1e7).toLocaleString('en-IN')} cr`,
            read: totalCash > 0 ? 'Partially offset by cash' : 'Gross debt (Yahoo TTM)',
          };
        }
      }
      const fcf = rawNum(financial?.freeCashflow);
      if (fcf != null && isMissingDisplay(merged.cashFlowDisplay, null)) {
        const cr = Math.round((fcf / 1e7) * 10) / 10;
        merged = {
          ...merged,
          cashFlowDisplay: `FCF ~₹${cr.toLocaleString('en-IN')} cr (TTM)`,
          cashFlowRead: merged.cashFlowRead ?? 'Operating cash after capex (Yahoo)',
        };
      }
    }
  } catch {
    /* optional debt/cash modules */
  }

  const out: EnrichedQualityMetrics = {
    ...merged,
    roeSource:
      merged.roePct != null && !isMissingDisplay(merged.roeDisplay, merged.roePct) ? 'parameters' : null,
    ebitdaSource:
      merged.ebitdaMarginPct != null &&
      !isMissingDisplay(merged.ebitdaDisplay, merged.ebitdaMarginPct)
        ? 'parameters'
        : null,
    debtSource:
      merged.debtRatio != null && !isMissingDisplay(merged.debtDisplay, merged.debtRatio)
        ? 'parameters'
        : null,
    cashFlowSource:
      merged.cashFlowDisplay !== '—' && !/unverified|pending/i.test(merged.cashFlowDisplay)
        ? 'parameters'
        : null,
    liveEnrichmentLabel: null,
  };

  if (!ext && !debtFromYahoo) return out;

  if (ext) {
    out.liveEnrichmentLabel = ext.label;
    if (isMissingDisplay(out.roeDisplay, out.roePct) && ext.ttm.roePct != null) {
      out.roePct = ext.ttm.roePct;
      out.roeDisplay = fmtPct(ext.ttm.roePct);
      out.roeRead = roeReadFromPct(ext.ttm.roePct);
      out.roeSource = 'yahoo';
    }
    if (isMissingDisplay(out.ebitdaDisplay, out.ebitdaMarginPct)) {
      const margin =
        ext.ttm.ebitdaMarginPct ??
        ext.ttm.operatingMarginPct ??
        ext.ttm.netMarginPct;
      if (margin != null) {
        out.ebitdaMarginPct = margin;
        out.ebitdaDisplay = fmtPct(margin);
        const avg = ext.avg5yEbitdaPct ?? ext.avg5yOperatingPct;
        out.ebitdaRead =
          avg != null
            ? `TTM ${fmtPct(margin)} vs 5Y avg ${fmtPct(avg)}`
            : 'TTM profitability (Yahoo Finance)';
        out.ebitdaSource = 'yahoo';
      }
    }
  }

  if (debtFromYahoo && isMissingDisplay(out.debtDisplay, out.debtRatio)) {
    out.debtDisplay = debtFromYahoo.display;
    out.debtRatio = debtFromYahoo.ratio;
    out.debtRead = debtFromYahoo.read;
    out.debtSource = 'yahoo';
  }

  if (
    out.cashFlowSource == null &&
    out.cashFlowDisplay !== '—' &&
    !/unverified|pending/i.test(out.cashFlowDisplay)
  ) {
    out.cashFlowSource = out.cashFlowDisplay.includes('Yahoo') || out.cashFlowDisplay.includes('FCF')
      ? 'yahoo'
      : 'parameters';
  }

  return out;
}

export function qualityMetricSourceLabel(source: QualityMetricSource): string {
  if (source === 'yahoo') return 'Yahoo Finance (TTM)';
  if (source === 'parameters') return 'Company parameters';
  return '—';
}
