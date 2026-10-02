import { fetchLiveNseCmp } from './nse-cmp';
import { readStockTabContent } from './content';
import { getStockbookByTicker } from './stockbook-index';
import { resolveStock } from './stock-search';
import {
  parseFrameworkQualityMetrics,
  parseRiskFactor,
  computeCagrGapAnalysis,
  type FrameworkQualityMetrics,
  type RiskFactorResult,
  type CagrGapAnalysis,
} from './stock-calculator-framework';
import {
  generateFrameworkCalculatorReport,
  buildStockbookReportContext,
} from './stock-calculator-report';
import {
  buildCalculatorTabAnalysis,
  type CalculatorTabAnalysis,
} from './stock-calculator-tabs';

export type PeBasis = 'ttm' | 'forward';

export interface StockCalculatorInput {
  stockQuery: string;
  ticker?: string;
  peBasis: PeBasis;
  expectedCagrPct: number;
  years: number;
  /** Optional manual anchor P/E — overrides framework PARAMETERS value. */
  manualPeOverride?: number | null;
  /** Optional lump-sum investment in ₹ for exit-value projection. */
  investmentAmountInr?: number | null;
}

export interface PeSnapshot {
  cmp: number;
  cmpSource: string;
  ttmPe: number | null;
  forwardPe: number | null;
  avg10yPe: number | null;
  forwardFairPe: number | null;
  normalizedEps: number | null;
  framework5yFairPrice: number | null;
  parametersDate: string | null;
}

export interface ProjectionScenario {
  label: string;
  exitPe: number;
  exitPrice: number;
  totalReturnPct: number;
  priceCagrPct: number;
  /** Present when investmentAmountInr was provided */
  shares?: number;
  exitValueInr?: number;
  gainInr?: number;
}

export interface StockCalculatorResult {
  ticker: string;
  stockName: string;
  sector: string;
  peBasis: PeBasis;
  expectedCagrPct: number;
  years: number;
  manualPeOverride: number | null;
  investmentAmountInr: number | null;
  frameworkPe: number | null;
  snapshot: PeSnapshot;
  anchorPe: number;
  anchorEps: number;
  projectedEps: number;
  scenarios: ProjectionScenario[];
  impliedVerdict: string;
  quality: FrameworkQualityMetrics;
  internalRisk: RiskFactorResult;
  externalRisk: RiskFactorResult;
  cagrGap: CagrGapAnalysis;
  frameworkVerdict: string;
  reportMode: 'framework-local' | 'gemini';
  report: string;
  tabAnalysis: CalculatorTabAnalysis;
}

function parseNum(s: string): number | null {
  const n = parseFloat(s.replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Extract PE / EPS metrics from PARAMETERS_*.md (framework read-only). */
export function parseParametersMetrics(md: string): Omit<
  PeSnapshot,
  'cmp' | 'cmpSource'
> {
  const out: Omit<PeSnapshot, 'cmp' | 'cmpSource'> = {
    ttmPe: null,
    forwardPe: null,
    avg10yPe: null,
    forwardFairPe: null,
    normalizedEps: null,
    framework5yFairPrice: null,
    parametersDate: null,
  };

  const dateMatch = md.match(/\*\*CMP:\*\*\s*Rs\.?\s*[\d,]+(?:\.\d+)?\s*\(([\d-]+)\)/i);
  if (dateMatch) out.parametersDate = dateMatch[1];

  const ttmRow = md.match(/\|\s*\*\*P\/E\*\*[\s\S]*?\|\s*\*\*([\d.]+)x\*\*/i);
  if (ttmRow) out.ttmPe = parseNum(ttmRow[1]);

  const avgPeMatch = md.match(
    /\|\s*\*\*P\/E\*\*[\s\S]*?\|\s*[\d.]+\s*x\s*\|\s*[\d.]+\s*x\s*\|\s*\*\*([\d.]+)x\*\*/i
  );
  if (avgPeMatch) out.avg10yPe = parseNum(avgPeMatch[1]);

  const fwdPeMatch = md.match(/\|\s*\*\*Forward P\/E\*\*[\s\S]*?\|\s*\*\*([\d.]+)x\*\*/i);
  if (fwdPeMatch) out.forwardPe = parseNum(fwdPeMatch[1]);

  const fairPeMatch = md.match(
    /\|\s*\*\*Forward fair P\/E\*\*[\s\S]*?\|\s*[\d.]+\s*x\s*\|\s*\*\*([\d.]+)x\*\*/i
  );
  if (fairPeMatch) out.forwardFairPe = parseNum(fairPeMatch[1]);

  const normEpsMatch = md.match(
    /\|\s*\*\*Normalized EPS \(FY\d+\)\*\*[\s\S]*?\|\s*Rs\s*[\d.]+\s*\|\s*\*\*Rs\s*([\d,]+(?:\.\d+)?)\*\*/i
  );
  if (normEpsMatch) out.normalizedEps = parseNum(normEpsMatch[1]);

  const fairPriceMatch = md.match(
    /\|\s*\*\*5Y fair price \(base\)\*\*[\s\S]*?\|\s*Rs\s*[\d,]+\s*\|\s*Rs\s*[\d,]+\s*\|\s*\*\*Rs\s*([\d,]+(?:\.\d+)?)\*\*/i
  );
  if (fairPriceMatch) out.framework5yFairPrice = parseNum(fairPriceMatch[1]);

  return out;
}

function formatInr(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function formatPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

function buildScenario(
  label: string,
  cmp: number,
  projectedEps: number,
  exitPe: number,
  years: number,
  investmentAmountInr?: number | null
): ProjectionScenario {
  const exitPrice = projectedEps * exitPe;
  const totalReturnPct = ((exitPrice - cmp) / cmp) * 100;
  const priceCagrPct = (Math.pow(exitPrice / cmp, 1 / years) - 1) * 100;
  const scenario: ProjectionScenario = { label, exitPe, exitPrice, totalReturnPct, priceCagrPct };

  if (investmentAmountInr != null && investmentAmountInr > 0) {
    const shares = investmentAmountInr / cmp;
    scenario.shares = shares;
    scenario.exitValueInr = shares * exitPrice;
    scenario.gainInr = scenario.exitValueInr - investmentAmountInr;
  }

  return scenario;
}

function deriveVerdict(
  priceCagrPct: number,
  expectedCagrPct: number,
  peBasis: PeBasis
): string {
  const hurdle = 12;
  if (priceCagrPct >= hurdle) {
    return `Attractive — implied price CAGR ${formatPct(priceCagrPct)} meets/exceeds ${hurdle}% hurdle (${peBasis.toUpperCase()} lens)`;
  }
  if (priceCagrPct >= 8) {
    return `Modest — implied price CAGR ${formatPct(priceCagrPct)} below ${hurdle}% hurdle but above 8%`;
  }
  if (priceCagrPct >= 0) {
    return `Stretched — implied price CAGR ${formatPct(priceCagrPct)} is modest; earnings growth may not translate to price`;
  }
  return `Unfavourable — implied price CAGR ${formatPct(priceCagrPct)} is negative under this scenario`;
}

export async function runStockCalculator(
  input: StockCalculatorInput
): Promise<StockCalculatorResult> {
  const resolved =
    input.ticker != null
      ? await resolveStock(input.ticker)
      : await resolveStock(input.stockQuery);

  if (!resolved) {
    throw new Error(
      'Stock not found — enter a valid NSE ticker or company name, or pick from suggestions.'
    );
  }

  const cagr = input.expectedCagrPct;
  const years = Math.min(30, Math.max(1, Math.round(input.years)));
  if (!Number.isFinite(cagr) || cagr < -50 || cagr > 100) {
    throw new Error('Expected CAGR must be between -50% and 100%.');
  }

  const manualPe =
    input.manualPeOverride != null && Number.isFinite(input.manualPeOverride)
      ? input.manualPeOverride
      : null;
  if (manualPe != null && (manualPe <= 0 || manualPe > 500)) {
    throw new Error('Manual P/E override must be between 0 and 500.');
  }

  const investmentAmountInr =
    input.investmentAmountInr != null && Number.isFinite(input.investmentAmountInr)
      ? input.investmentAmountInr
      : null;
  if (investmentAmountInr != null && investmentAmountInr <= 0) {
    throw new Error('Investment amount must be greater than zero.');
  }

  const loc = await getStockbookByTicker(resolved.ticker);
  const sector = resolved.sector;
  const stockName = resolved.company;

  const quote = await fetchLiveNseCmp(resolved.ticker);
  const paramFile = loc
    ? await readStockTabContent(loc.sector, loc.stock, 'parameters', 'dev')
    : null;
  const detailFile = loc
    ? await readStockTabContent(loc.sector, loc.stock, 'detail', 'dev')
    : null;
  const summaryFile = loc
    ? await readStockTabContent(loc.sector, loc.stock, 'summary', 'dev')
    : null;
  const approachFile = loc
    ? await readStockTabContent(loc.sector, loc.stock, 'approach', 'dev')
    : null;
  const faqFile = loc
    ? await readStockTabContent(loc.sector, loc.stock, 'faq', 'dev')
    : null;
  const internalFile = loc
    ? await readStockTabContent(loc.sector, loc.stock, 'internal-risk', 'dev')
    : null;
  const externalFile = loc
    ? await readStockTabContent(loc.sector, loc.stock, 'external-risk', 'dev')
    : null;

  const quality = parseFrameworkQualityMetrics(
    paramFile?.content ?? null,
    detailFile?.content ?? null,
    internalFile?.content ?? externalFile?.content ?? null
  );
  const internalRisk = parseRiskFactor(
    internalFile?.content ?? null,
    'internal-negative-risk.md'
  );
  const externalRisk = parseRiskFactor(
    externalFile?.content ?? null,
    'external-negative-risk.md'
  );

  const paramMetrics = paramFile
    ? parseParametersMetrics(paramFile.content)
    : {
        ttmPe: null,
        forwardPe: null,
        avg10yPe: null,
        forwardFairPe: null,
        normalizedEps: null,
        framework5yFairPrice: null,
        parametersDate: null,
      };

  let cmpFromParams: number | null = null;
  if (paramFile) {
    const cmpMatch = paramFile.content.match(/\*\*CMP:\*\*\s*Rs\.?\s*([\d,]+(?:\.\d+)?)/i);
    if (cmpMatch) cmpFromParams = parseNum(cmpMatch[1]);
  }

  const cmp =
    quote?.price ??
    cmpFromParams ??
    (paramMetrics.normalizedEps && paramMetrics.forwardPe
      ? paramMetrics.normalizedEps * paramMetrics.forwardPe
      : null);

  if (cmp == null || cmp <= 0) {
    throw new Error(`Could not resolve CMP for ${resolved.ticker}. Try again later.`);
  }

  const snapshot: PeSnapshot = {
    cmp,
    cmpSource: quote?.source ?? (cmpFromParams ? 'parameters' : 'derived'),
    ...paramMetrics,
  };

  let frameworkPe: number | null =
    input.peBasis === 'ttm' ? snapshot.ttmPe : snapshot.forwardPe;

  if (frameworkPe == null && input.peBasis === 'forward' && snapshot.normalizedEps) {
    frameworkPe = cmp / snapshot.normalizedEps;
  }
  if (frameworkPe == null && snapshot.ttmPe) {
    frameworkPe = snapshot.ttmPe;
  }

  let anchorPe: number | null = manualPe ?? frameworkPe;

  if (anchorPe == null) {
    throw new Error(
      `${input.peBasis === 'ttm' ? 'TTM' : 'Forward'} P/E not available for ${resolved.ticker}. Enter a manual P/E override or check PARAMETERS file.`
    );
  }

  const anchorEps =
    manualPe != null
      ? cmp / anchorPe
      : input.peBasis === 'forward' && snapshot.normalizedEps
        ? snapshot.normalizedEps
        : cmp / anchorPe;

  const projectedEps = anchorEps * Math.pow(1 + cagr / 100, years);

  const scenarios: ProjectionScenario[] = [
    buildScenario(
      manualPe != null
        ? `Manual ${input.peBasis === 'ttm' ? 'TTM' : 'forward'} P/E`
        : `Same ${input.peBasis === 'ttm' ? 'TTM' : 'forward'} P/E`,
      cmp,
      projectedEps,
      anchorPe,
      years,
      investmentAmountInr
    ),
  ];

  if (snapshot.avg10yPe && Math.abs(snapshot.avg10yPe - anchorPe) > 0.5) {
    scenarios.push(
      buildScenario(
        'At 10Y average P/E',
        cmp,
        projectedEps,
        snapshot.avg10yPe,
        years,
        investmentAmountInr
      )
    );
  }
  if (snapshot.forwardFairPe && Math.abs(snapshot.forwardFairPe - anchorPe) > 0.5) {
    scenarios.push(
      buildScenario(
        'At forward fair P/E',
        cmp,
        projectedEps,
        snapshot.forwardFairPe,
        years,
        investmentAmountInr
      )
    );
  }

  const primaryScenario = scenarios[0];
  const impliedVerdict = deriveVerdict(
    primaryScenario.priceCagrPct,
    cagr,
    input.peBasis
  );

  const cagrGap = computeCagrGapAnalysis({
    quality,
    internalRisk,
    externalRisk,
    expectedCagrPct: cagr,
    primaryPriceCagrPct: primaryScenario.priceCagrPct,
  });

  const core: Omit<
    StockCalculatorResult,
    'report' | 'reportMode' | 'frameworkVerdict' | 'tabAnalysis'
  > = {
    ticker: resolved.ticker,
    stockName,
    sector,
    peBasis: input.peBasis,
    expectedCagrPct: cagr,
    years,
    manualPeOverride: manualPe,
    investmentAmountInr,
    frameworkPe,
    snapshot,
    anchorPe,
    anchorEps,
    projectedEps,
    scenarios,
    impliedVerdict,
    quality,
    internalRisk,
    externalRisk,
    cagrGap,
  };

  const stockCtx = buildStockbookReportContext(
    summaryFile?.content ?? null,
    approachFile?.content ?? null,
    faqFile?.content ?? null
  );

  const tabAnalysis = buildCalculatorTabAnalysis(
    paramFile?.content ?? null,
    approachFile?.content ?? null
  );

  const { report, reportMode, frameworkVerdict } = await generateFrameworkCalculatorReport(
    core,
    stockCtx
  );

  return { ...core, report, reportMode, frameworkVerdict, tabAnalysis };
}
