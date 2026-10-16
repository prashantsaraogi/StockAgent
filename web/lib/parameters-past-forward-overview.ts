/**
 * Align StockBook PARAMETERS (Part 1 rear-view vs Part 2 forward) with
 * Value Research Online and Moneycontrol naming — for Overview two-column UI.
 */

import type { PeEvaluationResult } from './pe-evaluation';
import type { EarningsQualityResult } from './earnings-quality';
import { label10yPe, resolve10yPeReference } from './pe-history-reference';

export interface ExternalParamLabels {
  /** VRO — trailing / historical context (Key Ratios, FY tables, 5Y avg). */
  valueResearchPast: string;
  /** Moneycontrol — TTM / annual results on quote page. */
  moneycontrolPast: string;
  valueResearchFuture: string;
  moneycontrolFuture: string;
}

export interface PastForwardOverviewRow {
  id: string;
  parameter: string;
  external: ExternalParamLabels;
  past: { value: string; read: string | null };
  future: { value: string; read: string | null };
}

const REF: Record<string, ExternalParamLabels> = {
  pe: {
    valueResearchPast: 'P/E (TTM) · 3Y/5Y avg · FY-end P/E table',
    moneycontrolPast: 'P/E ratio (TTM) · historical annual P/E',
    valueResearchFuture: 'Forward P/E concept · PEG (5Y hist EPS growth)',
    moneycontrolFuture: 'Forward P/E · consensus EPS (when shown)',
  },
  earningsYield: {
    valueResearchPast: 'Earnings yield (EBIT / EV) · TTM',
    moneycontrolPast: 'Earnings per share (TTM) vs price',
    valueResearchFuture: 'Implied yield at normalized EPS (manual)',
    moneycontrolFuture: 'Forward EPS yield (estimate ÷ CMP)',
  },
  roe: {
    valueResearchPast: 'ROE (%) · TTM · 5Y avg',
    moneycontrolPast: 'Return on equity (%)',
    valueResearchFuture: 'ROE trend (qualitative + ratings)',
    moneycontrolFuture: 'ROE trajectory / guidance (if disclosed)',
  },
  margin: {
    valueResearchPast: 'OPM (%) · TTM',
    moneycontrolPast: 'Operating / EBITDA margin',
    valueResearchFuture: 'Margin outlook (management / sector)',
    moneycontrolFuture: 'Margin commentary on results page',
  },
  epsGrowth: {
    valueResearchPast: 'EPS growth · 1Y/3Y/5Y · Key Ratios → Growth',
    moneycontrolPast: 'Profit growth (YoY / multi-year)',
    valueResearchFuture: 'Expected EPS growth (your thesis)',
    moneycontrolFuture: 'Forward EPS growth / broker est. (when listed)',
  },
  vsFair: {
    valueResearchPast: 'P/E vs own history · vs peers (median)',
    moneycontrolPast: 'P/E vs sector · 52-week range',
    valueResearchFuture: 'Price vs fair value (model / IV)',
    moneycontrolFuture: 'Target price / upside (broker tab)',
  },
  returnOutlook: {
    valueResearchPast: 'Price return · 1Y/3Y/5Y/10Y',
    moneycontrolPast: 'Returns · 1W/1M/1Y on quote',
    valueResearchFuture: 'Implied return if fair price reached',
    moneycontrolFuture: 'Target upside % (broker aggregate)',
  },
};

function rowFromPart1(
  id: keyof typeof REF,
  parameter: string,
  pastValue: string,
  pastRead: string | null,
  futureValue: string,
  futureRead: string | null
): PastForwardOverviewRow {
  return {
    id,
    parameter,
    external: REF[id],
    past: { value: pastValue, read: pastRead },
    future: { value: futureValue, read: futureRead },
  };
}

function findHistRead(histRows: { parameter: string; read: string }[], name: string): string | null {
  const r = histRows.find((x) => x.parameter === name);
  return r?.read && r.read !== '—' ? r.read : null;
}

function fmtPe(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return '—';
  return `${v.toFixed(1)}×`;
}

export function buildParametersPastForwardOverview(input: {
  pe: PeEvaluationResult;
  earningsQuality?: EarningsQualityResult | null;
}): PastForwardOverviewRow[] {
  const { pe, earningsQuality } = input;
  const hist = pe.historical;
  const fwd = pe.forward;
  const histPe = resolve10yPeReference(pe);

  const pePastToday = hist.peToday ?? (pe.ttmPe != null ? fmtPe(pe.ttmPe) : '—');
  const pePastAvg = hist.pe10yAvg ?? (pe.avg10yPe != null ? fmtPe(pe.avg10yPe) : '—');
  const pePastRead = findHistRead(hist.rows, 'P/E') ?? hist.part1Verdict;

  const forwardPeDisplay =
    pe.forwardPe != null
      ? fmtPe(pe.forwardPe)
      : pe.normalizedEps != null && pe.cmp != null && pe.cmp > 0
        ? fmtPe(pe.cmp / pe.normalizedEps)
        : '—';
  const forwardFair = fwd.forwardFairPe ?? (pe.forwardFairPe != null ? fmtPe(pe.forwardFairPe) : '—');

  const rows: PastForwardOverviewRow[] = [];

  rows.push(
    rowFromPart1(
      'pe',
      'P/E',
      `${pePastToday} today · ${label10yPe(histPe.kind)} ${pePastAvg}`,
      pePastRead,
      `${forwardPeDisplay} forward · fair ${forwardFair}`,
      fwd.forwardPremiumIv ? `vs forward IV ${fwd.forwardPremiumIv}` : null
    )
  );

  const oeyPast = hist.ownerEarningsYield ?? findHistRead(hist.rows, 'Owner Earnings Yield');
  rows.push(
    rowFromPart1(
      'earningsYield',
      'Owner earnings yield',
      oeyPast && oeyPast !== '—' ? oeyPast : pe.ttmPe != null ? `${(100 / pe.ttmPe).toFixed(1)}%` : '—',
      findHistRead(hist.rows, 'Owner Earnings Yield'),
      fwd.forwardOwnerYield ?? '—',
      fwd.forwardPremiumIv ? `Forward IV ${fwd.forwardPremiumIv}` : null
    )
  );

  const roeRow = hist.rows.find((r) => r.parameter === 'ROE');
  rows.push(
    rowFromPart1(
      'roe',
      'ROE',
      roeRow?.today ?? '—',
      roeRow?.read ?? null,
      fwd.roeTrajectory ?? '—',
      fwd.roeTrajectoryRead ?? null
    )
  );

  const marginRow = hist.rows.find((r) => r.parameter === 'EBITDA margin');
  rows.push(
    rowFromPart1(
      'margin',
      'EBITDA / operating margin',
      marginRow?.today ?? '—',
      marginRow?.read ?? null,
      fwd.ebitdaMarginPath ?? '—',
      fwd.ebitdaMarginPathRead ?? null
    )
  );

  const patCagr = earningsQuality?.partA?.patCagr5y;
  const histGrowth =
    hist.epsCagrHist ??
    (patCagr != null ? `${patCagr.toFixed(1)}% PAT (5Y)` : null) ??
    '—';
  rows.push(
    rowFromPart1(
      'epsGrowth',
      'EPS / profit growth',
      histGrowth,
      null,
      fwd.epsCagrBase ?? '—',
      fwd.forwardVerdict
    )
  );

  const ivPast = hist.premiumToIv ?? findHistRead(hist.rows, 'Premium to IV');
  rows.push(
    rowFromPart1(
      'vsFair',
      'Premium vs fair value',
      ivPast ?? '—',
      hist.cheapOrExpensive ?? hist.part1Verdict,
      fwd.forwardPremiumIv ?? '—',
      fwd.addCase
    )
  );

  rows.push(
    rowFromPart1(
      'returnOutlook',
      'Return outlook',
      hist.cheapOrExpensive ?? hist.part1Verdict ?? 'Rear-view verdict in PARAMETERS',
      hist.part1Verdict,
      fwd.implied5yPriceCagr
        ? `${fwd.implied5yPriceCagr} implied 5Y price CAGR`
        : '—',
      fwd.forwardVerdict ?? fwd.addCase
    )
  );

  return rows;
}
