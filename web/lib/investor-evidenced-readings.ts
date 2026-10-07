/**
 * Ask Agent — "Business quality vs risks" rows only when backed by data.
 */

import type { StockCalculatorFullResult } from './stock-calculator-full';
import type { DisciplineRule } from './investor-discipline-web';
import type { HoldingRow } from './holdings';

export interface EvidencedAreaRow {
  area: string;
  reading: string;
}

function stripEmoji(s: string): string {
  return s.replace(/^[\s🟢🟡🟠🔴⛔]+/, '').trim();
}

function hasRealStockbookFile(dataSource: string): boolean {
  if (/^no /i.test(dataSource)) return false;
  return true;
}

function buildBusinessQualityRow(
  analysis: StockCalculatorFullResult,
  summaryMd: string | null,
  faq: string | null
): EvidencedAreaRow | null {
  const bq = analysis.businessQuality;
  const hasBqFile = bq.businessQualityFile != null;
  const hasParams = bq.parametersFile != null && hasRealStockbookFile(bq.dataSource);
  const factFactors = bq.pillars.flatMap((p) => p.factors).filter((f) => f.evidence === 'FACT');
  const scoredPillars = bq.pillars.filter((p) => p.score10 != null);

  const opsSnap =
    summaryMd?.match(/PAT \+[\d.]+%;\s*cig \+[\d.]+%/i)?.[0] ??
    faq?.match(/cig rev \+[\d.]+% YoY/i)?.[0];
  const freshRow = summaryMd?.match(/\|\s*\*\*Fresh capital\*\*[^\|]*\|\s*([^|]+)\|/i)?.[1]?.trim();

  if (!hasBqFile && !hasParams && factFactors.length === 0 && scoredPillars.length === 0 && !opsSnap && !freshRow) {
    return null;
  }

  if (!hasBqFile && !hasParams && bq.businessQualityScore10 === 5 && factFactors.length === 0) {
    return null;
  }

  const bits: string[] = [`Franchise score **${bq.businessQualityScore10}/10**`];
  if (hasBqFile) bits.push(`Source: \`${bq.businessQualityFile}\``);
  else if (hasParams) bits.push(`Source: PARAMETERS (\`${bq.parametersFile}\`)`);
  if (bq.highlights[0]) bits.push(`${bq.highlights[0].factor}: ${bq.highlights[0].assessment}`);
  else if (factFactors[0]) bits.push(`${factFactors[0].label}: ${factFactors[0].assessment}`);
  if (opsSnap) bits.push(`Ops: ${opsSnap}`);
  if (freshRow && bq.businessQualityScore10 <= 7) bits.push(`Fresh-capital lens: ${freshRow}`);

  const verdictShort = stripEmoji(bq.verdict).split('—')[0]?.trim() ?? stripEmoji(bq.verdict);
  return {
    area: 'Business quality',
    reading: `${verdictShort} (${bits.join(' · ')})`,
  };
}

function buildEarningsQualityRow(analysis: StockCalculatorFullResult): EvidencedAreaRow | null {
  const eq = analysis.earningsQuality;
  const hasFile = eq.earningsQualityFile != null;
  const qs = eq.quarterly ?? [];
  const latestQ = qs[qs.length - 1];
  const yoyQ = qs.length >= 5 ? qs[qs.length - 5] : null;
  const numericGrowth = eq.growth.filter((g) => g.numeric != null);
  const numericProfit = eq.profitability.filter((g) => g.numeric != null);

  if (!hasFile && qs.length === 0 && numericGrowth.length === 0 && numericProfit.length === 0 && eq.warnings.length === 0) {
    return null;
  }

  const bits: string[] = [];
  if (latestQ?.quarter && latestQ.pat != null && yoyQ?.pat != null && yoyQ.pat !== 0) {
    const patYoY = ((latestQ.pat - yoyQ.pat) / Math.abs(yoyQ.pat)) * 100;
    bits.push(`${latestQ.quarter} PAT **${patYoY >= 0 ? '+' : ''}${patYoY.toFixed(0)}%** YoY`);
  }
  const epsCagr5y = eq.partA?.epsCagr5y ?? null;
  if (epsCagr5y != null) {
    bits.push(`5Y EPS CAGR **${epsCagr5y}%**`);
  }
  if (numericGrowth[0]) {
    bits.push(`${numericGrowth[0].label} **${numericGrowth[0].value}**`);
  }
  if (eq.warnings[0]) {
    bits.push(`Flag: ${eq.warnings[0].title}`);
  }
  if (hasFile) bits.push(`Source: \`${eq.earningsQualityFile}\``);

  const pe = analysis.peParameters;
  if (bits.length === 0 && pe.trailingEps != null) {
    bits.push(`TTM EPS **₹${pe.trailingEps.toFixed(2)}** (${pe.cmpSource})`);
  }

  if (bits.length === 0) return null;

  const verdictShort = stripEmoji(eq.overallVerdict).split('—')[0]?.trim() ?? stripEmoji(eq.overallVerdict);
  return {
    area: 'Earnings quality',
    reading: `${verdictShort} — ${bits.join(' · ')}`,
  };
}

function buildMarginTrendRow(analysis: StockCalculatorFullResult): EvidencedAreaRow | null {
  const m = analysis.margin;
  const hasFile = m.marginFile != null;
  const ebitdaRow = m.partB?.rows?.find((r) => /ebitda/i.test(r.metric));
  const hasPartA = m.partA.years.length > 0;
  const hasQuarters = m.partD.quarters.length >= 2;

  if (!hasFile && ebitdaRow?.todayPct == null && m.partB.primaryDeltaPp == null && !hasPartA && !hasQuarters) {
    return null;
  }

  const bits: string[] = [];
  if (ebitdaRow?.todayPct != null) {
    let s = `EBITDA margin **${ebitdaRow.todayPct.toFixed(1)}%**`;
    if (ebitdaRow.avg10yPct != null) s += ` vs 10Y **${ebitdaRow.avg10yPct.toFixed(1)}%**`;
    if (ebitdaRow.deltaPp != null) {
      s += ` (**${ebitdaRow.deltaPp >= 0 ? '+' : ''}${ebitdaRow.deltaPp.toFixed(1)} pp**)`;
    }
    bits.push(s);
  } else if (m.partA.avgEbitdaPct != null) {
    bits.push(`5Y avg EBITDA **${m.partA.avgEbitdaPct}%**`);
  }
  if (hasQuarters && m.partD.changePp != null) {
    bits.push(`Quarterly margin Δ **${m.partD.changePp >= 0 ? '+' : ''}${m.partD.changePp.toFixed(1)} pp**`);
  }
  if (hasFile) bits.push(`Source: \`${m.marginFile}\``);
  else if (m.parametersFile) bits.push(`PARAMETERS partial (\`${m.parametersFile}\`)`);

  if (bits.length === 0) return null;

  const verdictShort = stripEmoji(m.overallVerdict).split('—')[0]?.trim() ?? stripEmoji(m.overallVerdict);
  return {
    area: 'Margin trend',
    reading: `${verdictShort} — ${bits.join(' · ')}`,
  };
}

function overallRiskHeadline(
  holding: HoldingRow | null,
  discipline: DisciplineRule | null,
  moduleVerdict: string
): string {
  if (!holding) {
    if (discipline && discipline.surplusPct === 0) {
      return `WATCHLIST / WAIT for fresh capital — ${discipline.reason.split('(')[0]?.trim() ?? discipline.reason}`;
    }
    if (moduleVerdict.toUpperCase().includes('AVOID')) return moduleVerdict;
    return 'WATCHLIST / WAIT — confirm PCCL, sector rank, and core-problem before starter size';
  }
  return moduleVerdict;
}

export function buildOverallRiskRowSimple(
  analysis: StockCalculatorFullResult,
  discipline: DisciplineRule | null,
  holding: HoldingRow | null
): EvidencedAreaRow {
  const risk = analysis.riskDecision;
  const moduleVerdict = holding
    ? analysis.overview.riskVerdict
    : discipline?.surplusPct === 0
      ? 'WATCHLIST / WAIT (0% fresh surplus)'
      : analysis.overview.riskVerdict;
  const overall = overallRiskHeadline(holding, discipline, moduleVerdict);
  const t = risk.thesis;
  const bits = [
    `Risk score **${risk.quantitativeScore100}/100**`,
    t.valuationLabel,
    t.riskLabel,
  ];
  if (analysis.peParameters.ttmPe != null) {
    bits.push(`TTM P/E **${analysis.peParameters.ttmPe.toFixed(1)}×**`);
  }
  if (analysis.peParameters.cmp != null) {
    bits.push(`CMP **₹${Math.round(analysis.peParameters.cmp).toLocaleString('en-IN')}**`);
  }
  return {
    area: 'Overall risk view',
    reading: `${overall} (${bits.join(' · ')})`,
  };
}

export function buildBusinessQualityVsRisksMarkdown(
  analysis: StockCalculatorFullResult,
  opts: {
    holding: HoldingRow | null;
    discipline: DisciplineRule | null;
    summaryMd: string | null;
    faq: string | null;
    concerns: string[];
  }
): string | null {
  const rows: EvidencedAreaRow[] = [];

  const bq = buildBusinessQualityRow(analysis, opts.summaryMd, opts.faq);
  if (bq) rows.push(bq);

  const eq = buildEarningsQualityRow(analysis);
  if (eq) rows.push(eq);

  const margin = buildMarginTrendRow(analysis);
  if (margin) rows.push(margin);

  rows.push(buildOverallRiskRowSimple(analysis, opts.discipline, opts.holding));

  if (rows.length === 0) return null;

  const table = rows.map((r) => `| ${r.area} | ${r.reading} |`).join('\n');
  const concerns =
    opts.concerns.length > 0
      ? `\n\n**Key concerns:** ${opts.concerns.slice(0, 4).join(' · ')}`
      : '';

  return `## Business quality vs risks

| Area | Reading |
|------|---------|
${table}${concerns}
`;
}
