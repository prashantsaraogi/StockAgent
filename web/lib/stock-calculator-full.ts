/**
 * Full Stock Calculator — run CAGR + PE + Earnings Quality + Margin + Business Quality + Risk in one pass.
 */

import { resolveStock } from './stock-search';
import { runStockCalculator, type PeBasis, type StockCalculatorResult } from './stock-calculator-engine';
import { loadPeEvaluation, type PeEvaluationResult } from './pe-evaluation';
import { runPeEvaluationScorecard, type PeScorecardResult } from './pe-evaluation-scorecard';
import { runEarningsQualityAnalysis, type EarningsQualityResult } from './earnings-quality';
import { runMarginAnalysis, type MarginAnalysisResult } from './margin-analysis';
import { runBusinessQualityAnalysis, type BusinessQualityResult } from './business-quality-moat';
import { runRiskDecisionAnalysis, type RiskDecisionResult } from './risk-decision';

export interface StockCalculatorFullInputs {
  peBasis: PeBasis;
  expectedCagrPct: number;
  years: number;
  manualPeOverride?: number | null;
  investmentAmountInr?: number | null;
  purchasePrice?: number | null;
  purchaseDate?: string | null;
}

export interface StockCalculatorFullResult {
  ticker: string;
  stockName: string;
  sector: string;
  analyzedAt: string;
  inputs: StockCalculatorFullInputs;
  cagr: StockCalculatorResult;
  peScorecard: PeScorecardResult | null;
  peParameters: PeEvaluationResult;
  earningsQuality: EarningsQualityResult;
  margin: MarginAnalysisResult;
  businessQuality: BusinessQualityResult;
  riskDecision: RiskDecisionResult;
  overview: {
    cagrVerdict: string;
    peVerdict: string;
    earningsQualityVerdict: string;
    marginVerdict: string;
    businessQualityVerdict: string;
    riskVerdict: string;
  };
}

function parsePurchaseDate(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const s = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T12:00:00`);
  if (Number.isNaN(d.getTime()) || d > new Date()) return null;
  return s;
}

function peVerdictFromScorecard(sc: PeScorecardResult | null, pe: PeEvaluationResult): string {
  if (sc) return sc.freshVerdict;
  if (pe.premiumTo10yPct != null && pe.premiumTo10yPct > 10) {
    return '🟡 Above 10Y average P/E — confirm with PCCL';
  }
  if (pe.premiumTo10yPct != null && pe.premiumTo10yPct <= 0) {
    return '🟢 At or below 10Y average P/E';
  }
  return '🟡 PARAMETERS read — add purchase price for full scorecard';
}

export async function runFullStockCalculatorAnalysis(input: {
  ticker: string;
  tenantId: string;
  peBasis: PeBasis;
  expectedCagrPct: number;
  years: number;
  manualPeOverride?: number | null;
  investmentAmountInr?: number | null;
  purchasePrice?: number | null;
  purchaseDate?: string | null;
}): Promise<StockCalculatorFullResult | null> {
  const resolved = await resolveStock(input.ticker.trim());
  if (!resolved) return null;

  const ticker = resolved.ticker;
  const purchaseDate = parsePurchaseDate(input.purchaseDate ?? null);
  const canRunPeScorecard =
    input.purchasePrice != null &&
    input.purchasePrice > 0 &&
    purchaseDate != null;

  const [
    cagr,
    peParameters,
    peScorecard,
    earningsQuality,
    margin,
    businessQuality,
    riskDecision,
  ] = await Promise.all([
    runStockCalculator({
      stockQuery: ticker,
      ticker,
      peBasis: input.peBasis,
      expectedCagrPct: input.expectedCagrPct,
      years: input.years,
      manualPeOverride: input.manualPeOverride ?? null,
      investmentAmountInr: input.investmentAmountInr ?? null,
    }),
    loadPeEvaluation(ticker, input.tenantId),
    canRunPeScorecard
      ? runPeEvaluationScorecard({
          ticker,
          purchasePrice: input.purchasePrice!,
          purchaseDate: purchaseDate!,
          tenantId: input.tenantId,
        })
      : Promise.resolve(null),
    runEarningsQualityAnalysis({ ticker, tenantId: input.tenantId }),
    runMarginAnalysis({ ticker, tenantId: input.tenantId }),
    runBusinessQualityAnalysis({ ticker, tenantId: input.tenantId }),
    runRiskDecisionAnalysis({ ticker, tenantId: input.tenantId }),
  ]);

  if (!cagr || !peParameters || !earningsQuality || !margin || !businessQuality || !riskDecision) {
    return null;
  }

  const sector = cagr.sector;
  const stockName = cagr.stockName;

  return {
    ticker,
    stockName,
    sector,
    analyzedAt: new Date().toISOString(),
    inputs: {
      peBasis: input.peBasis,
      expectedCagrPct: input.expectedCagrPct,
      years: input.years,
      manualPeOverride: input.manualPeOverride ?? null,
      investmentAmountInr: input.investmentAmountInr ?? null,
      purchasePrice: input.purchasePrice ?? null,
      purchaseDate: purchaseDate,
    },
    cagr,
    peScorecard,
    peParameters,
    earningsQuality,
    margin,
    businessQuality,
    riskDecision,
    overview: {
      cagrVerdict: cagr.frameworkVerdict ?? cagr.impliedVerdict,
      peVerdict: peVerdictFromScorecard(peScorecard, peParameters),
      earningsQualityVerdict: earningsQuality.overallVerdict,
      marginVerdict: margin.overallVerdict,
      businessQualityVerdict: businessQuality.verdict,
      riskVerdict: riskDecision.investmentVerdict,
    },
  };
}
