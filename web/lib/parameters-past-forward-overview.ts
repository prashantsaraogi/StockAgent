/**
 * Align StockBook PARAMETERS (Part 1 rear-view vs Part 2 forward) with
 * Value Research Online and Moneycontrol naming — for Overview two-column UI.
 * Never leave cells empty: StockBook → module run → Yahoo .NS (NSE feed).
 */

import type { StockCalculatorFullResult } from './stock-calculator-full';
import type { ParameterExternalSupplement } from './parameters-external-supplement';
import { label10yPe, resolve10yPeReference } from './pe-history-reference';

export interface ExternalParamLabels {
  valueResearchPast: string;
  moneycontrolPast: string;
  valueResearchFuture: string;
  moneycontrolFuture: string;
}

export interface PastForwardOverviewRow {
  id: string;
  parameter: string;
  external: ExternalParamLabels;
  past: { value: string; read: string | null; source?: string };
  future: { value: string; read: string | null; source?: string };
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

function isBlank(s: string | null | undefined): boolean {
  if (!s) return true;
  const t = s.replace(/\*\*/g, '').trim();
  return !t || t === '—' || t === '-';
}

function pick(...values: (string | null | undefined)[]): string | null {
  for (const v of values) {
    if (!isBlank(v)) return v!.replace(/\*\*/g, '').trim();
  }
  return null;
}

function fmtPe(v: number | null): string | null {
  if (v == null || !Number.isFinite(v)) return null;
  return `${v.toFixed(1)}×`;
}

function fmtPct(v: number | null, suffix = '%'): string | null {
  if (v == null || !Number.isFinite(v)) return null;
  return `${v.toFixed(1)}${suffix}`;
}

function premiumPct(cmp: number, fair: number): string | null {
  if (fair <= 0) return null;
  const p = ((cmp - fair) / fair) * 100;
  const sign = p >= 0 ? '+' : '';
  return `${sign}${p.toFixed(1)}% vs fair IV`;
}

function row(
  id: keyof typeof REF,
  parameter: string,
  past: { value: string; read: string | null; source?: string },
  future: { value: string; read: string | null; source?: string }
): PastForwardOverviewRow {
  return { id, parameter, external: REF[id], past, future };
}

function findHistRead(
  histRows: { parameter: string; read: string }[],
  name: string
): string | null {
  const r = histRows.find((x) => x.parameter === name);
  return r?.read && !isBlank(r.read) ? r.read.replace(/\*\*/g, '').trim() : null;
}

function findHistToday(histRows: { parameter: string; today: string }[], name: string): string | null {
  const r = histRows.find((x) => x.parameter === name);
  return r?.today && !isBlank(r.today) ? r.today.replace(/\*\*/g, '').trim() : null;
}

export function buildParametersPastForwardOverview(
  analysis: StockCalculatorFullResult
): PastForwardOverviewRow[] {
  const pe = analysis.peParameters;
  const ext: ParameterExternalSupplement | null = pe.externalSupplement ?? null;
  const hist = pe.historical;
  const fwd = pe.forward;
  const histPe = resolve10yPeReference(pe);
  const q = analysis.cagr.quality;
  const tab = analysis.cagr.tabAnalysis;
  const eq = analysis.earningsQuality;
  const margin = analysis.margin;

  const pePastToday = pick(
    hist.peToday,
    fmtPe(pe.ttmPe),
    fmtPe(ext?.trailingPe ?? null)
  );
  const pePastAvg = pick(hist.pe10yAvg, fmtPe(pe.avg10yPe), fmtPe(pe.median10yPe));
  const pePastRead =
    pick(findHistRead(hist.rows, 'P/E'), hist.part1Verdict) ??
    (pe.premiumTo10yPct != null
      ? `${pe.premiumTo10yPct >= 0 ? '+' : ''}${pe.premiumTo10yPct.toFixed(1)}% vs ${label10yPe(histPe.kind)}`
      : null);

  const forwardPeDisplay = pick(
    fmtPe(pe.forwardPe),
    fwd.forwardPe,
    fmtPe(ext?.forwardPe ?? null),
    pe.normalizedEps != null && pe.cmp != null && pe.cmp > 0
      ? fmtPe(pe.cmp / pe.normalizedEps)
      : null
  );
  const forwardFair = pick(
    fwd.forwardFairPe,
    fmtPe(pe.forwardFairPe),
    tab?.forward.forwardFairPe
  );

  const pePastValue =
    pePastToday && pePastAvg
      ? `${pePastToday} TTM · ${label10yPe(histPe.kind)} ${pePastAvg}`
      : pick(`${pePastToday ?? ''} TTM · ${label10yPe(histPe.kind)} pending`, pePastToday) ??
        `TTM ${fmtPe(ext?.trailingPe ?? pe.ttmPe) ?? 'pending'} · ${pe.cmpSource}`;

  const peFutureValue =
    forwardPeDisplay && forwardFair
      ? `${forwardPeDisplay} forward · fair ${forwardFair}`
      : pick(
          `${forwardPeDisplay ?? fmtPe(ext?.forwardPe ?? null) ?? 'Forward P/E pending'} · fair ${forwardFair ?? 'see PARAMETERS Part 2'}`,
          forwardPeDisplay
        ) ?? 'Forward P/E — fill PARAMETERS Part 2 or run refresh';

  const oeyPast = pick(
    hist.ownerEarningsYield,
    findHistToday(hist.rows, 'Owner Earnings Yield'),
    fmtPct(ext?.earningsYieldPct ?? null),
    pe.ttmPe != null ? fmtPct(100 / pe.ttmPe) : null
  );

  const oeyFuture = pick(
    fwd.forwardOwnerYield,
    pe.normalizedEps != null && pe.cmp != null && pe.cmp > 0
      ? fmtPct((pe.normalizedEps / pe.cmp) * 100)
      : null,
    ext?.forwardPe != null ? fmtPct(100 / ext.forwardPe) : null
  );

  const roePast = pick(
    findHistToday(hist.rows, 'ROE'),
    q.roeDisplay?.replace(/\*\*/g, '').trim(),
    fmtPct(ext?.roePct ?? null)
  );
  const roeFuture = pick(
    fwd.roeTrajectory,
    q.roeRead,
    ext?.roePct != null ? `TTM ${fmtPct(ext.roePct)} — project from thesis` : null
  );

  const marginPast = pick(
    findHistToday(hist.rows, 'EBITDA margin'),
    q.ebitdaDisplay?.replace(/\*\*/g, '').trim(),
    margin.partB?.rows?.find((r) => /ebitda|operating/i.test(r.metric))?.todayPct != null
      ? fmtPct(margin.partB!.rows.find((r) => /ebitda|operating/i.test(r.metric))!.todayPct!)
      : null,
    fmtPct(ext?.ebitdaMarginPct ?? ext?.operatingMarginPct ?? null)
  );
  const marginFuture = pick(
    fwd.ebitdaMarginPath,
    margin.partC?.passThroughVerdict,
    margin.partB?.verdict
  );

  const patCagr = eq.partA?.patCagr5y;
  const epsPast = pick(
    hist.epsCagrHist,
    patCagr != null ? `${patCagr.toFixed(1)}% PAT (5Y)` : null,
    eq.partA?.epsCagr5y != null ? `${eq.partA.epsCagr5y.toFixed(1)}% EPS (5Y)` : null,
    fmtPct(ext?.earningsGrowthPct ?? null) ? `${fmtPct(ext!.earningsGrowthPct!)} earnings (Yahoo TTM)` : null
  );
  const epsFuture = pick(
    fwd.epsCagrBase,
    q.baseEpsCagrRange,
    tab?.forward.epsCagrBase,
    `${analysis.inputs.expectedCagrPct}% user test CAGR`
  );

  let ivPast = pick(hist.premiumToIv, findHistToday(hist.rows, 'Premium to IV'));
  if (!ivPast && pe.premiumTo10yPct != null) {
    ivPast = `${pe.premiumTo10yPct >= 0 ? '+' : ''}${pe.premiumTo10yPct.toFixed(1)}% vs ${label10yPe(histPe.kind)}`;
  }
  let ivFuture = pick(fwd.forwardPremiumIv, tab?.forward.forwardPremiumIv);
  if (
    !ivFuture &&
    pe.cmp != null &&
    pe.normalizedEps != null &&
    pe.forwardFairPe != null &&
    pe.forwardFairPe > 0
  ) {
    ivFuture = premiumPct(pe.cmp, pe.normalizedEps * pe.forwardFairPe);
  }

  const pastCheap = pick(hist.cheapOrExpensive, hist.part1Verdict, analysis.overview.peVerdict);
  const impliedFwd = pick(
    fwd.implied5yPriceCagr,
    tab?.forward.implied5yPriceCagr,
    q.impliedPriceCagrPct != null ? `${q.impliedPriceCagrPct.toFixed(1)}%` : null
  );
  const fairPrice = pick(
    fwd.framework5yFairPrice,
    pe.framework5yFairPrice != null
      ? `₹${Math.round(pe.framework5yFairPrice).toLocaleString('en-IN')}`
      : null,
    tab?.forward.framework5yFairPrice
  );

  const returnPast = pick(
    pastCheap,
    ext?.priceReturn1yPct != null
      ? `1Y price ${ext.priceReturn1yPct >= 0 ? '+' : ''}${ext.priceReturn1yPct}% (Yahoo)`
      : null,
    analysis.overview.cagrVerdict
  );
  const returnFuture = pick(
    impliedFwd ? `${impliedFwd} implied 5Y price CAGR` : null,
    fairPrice ? `Base fair ${fairPrice}` : null,
    fwd.forwardVerdict,
    fwd.addCase,
    `${analysis.inputs.expectedCagrPct}% / ${analysis.inputs.years}Y scenario`
  );

  const yahooNote = ext ? 'Yahoo Finance .NS' : undefined;

  return [
    row(
      'pe',
      'P/E',
      { value: pePastValue, read: pePastRead, source: pePastToday ? pe.cmpSource : yahooNote },
      {
        value: peFutureValue,
        read: pick(fwd.forwardPremiumIv ? `vs forward IV ${fwd.forwardPremiumIv}` : null),
        source: forwardFair ? 'PARAMETERS Part 2' : yahooNote,
      }
    ),
    row(
      'earningsYield',
      'Owner earnings yield',
      { value: oeyPast ?? `TTM ${fmtPct(ext?.earningsYieldPct ?? null) ?? 'yield pending'}`, read: findHistRead(hist.rows, 'Owner Earnings Yield'), source: yahooNote },
      {
        value: oeyFuture ?? `Norm EPS yield — refresh Part 2`,
        read: ivFuture,
        source: 'PARAMETERS Part 2',
      }
    ),
    row(
      'roe',
      'ROE',
      { value: roePast ?? fmtPct(ext?.roePct ?? null) ?? 'ROE pending — Margin/Yahoo', read: findHistRead(hist.rows, 'ROE') ?? q.roeRead, source: yahooNote },
      {
        value: roeFuture ?? 'Thesis ROE path in PARAMETERS Part 2',
        read: fwd.roeTrajectoryRead ?? q.roeRead,
        source: 'PARAMETERS / Business Quality',
      }
    ),
    row(
      'margin',
      'EBITDA / operating margin',
      {
        value: marginPast ?? fmtPct(ext?.operatingMarginPct ?? null) ?? 'Margin pending — Margin tab',
        read: findHistRead(hist.rows, 'EBITDA margin') ?? q.ebitdaRead,
        source: yahooNote,
      },
      {
        value: marginFuture ?? margin.partC?.passThroughVerdict ?? 'Forward margin path in Part 2',
        read: fwd.ebitdaMarginPathRead ?? margin.partC?.passThroughVerdict,
        source: 'PARAMETERS / Margin',
      }
    ),
    row(
      'epsGrowth',
      'EPS / profit growth',
      { value: epsPast ?? 'Growth pending — Earnings Quality / Yahoo', read: eq.partA?.verdict ?? null, source: yahooNote },
      {
        value: epsFuture ?? `${analysis.inputs.expectedCagrPct}% test CAGR`,
        read: fwd.forwardVerdict ?? eq.partB?.verdict ?? null,
        source: 'PARAMETERS / CAGR test',
      }
    ),
    row(
      'vsFair',
      'Premium vs fair value',
      { value: ivPast ?? (pe.premiumTo10yPct != null ? `${pe.premiumTo10yPct.toFixed(1)}% vs history` : 'See PE module'), read: pastCheap, source: 'PARAMETERS Part 1' },
      { value: ivFuture ?? 'Compute after forward fair P/E in Part 2', read: fwd.addCase, source: 'PARAMETERS Part 2' },
    ),
    row(
      'returnOutlook',
      'Return outlook',
      { value: returnPast ?? analysis.overview.peVerdict, read: hist.part1Verdict, source: yahooNote },
      {
        value: returnFuture ?? analysis.overview.cagrVerdict,
        read: fwd.forwardVerdict ?? analysis.riskDecision.investmentVerdict,
        source: 'PARAMETERS / Risk',
      }
    ),
  ];
}
