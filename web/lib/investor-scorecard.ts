/**
 * Ask Agent / Basic report — coloured scorecard with bullet takeaways.
 */

import type { StockCalculatorFullResult } from './stock-calculator-full';
import type { DisciplineRule } from './investor-discipline-web';
function formatCagrGapPp(gap: number | null): string {
  if (gap == null) return 'n/a';
  const rounded = Math.round(gap * 10) / 10;
  if (Math.abs(rounded) < 0.05) return '0 pp (aligned)';
  const sign = rounded >= 0 ? '+' : '';
  return `${sign}${rounded.toFixed(1)} pp`;
}

export type ScorecardTone = 'good' | 'ok' | 'caution' | 'bad' | 'severe';

const TONE_LABEL: Record<ScorecardTone, string> = {
  good: '🟢',
  ok: '🟠',
  caution: '🟡',
  bad: '🔴',
  severe: '⛔',
};

export interface ScorecardRow {
  check: string;
  tone: ScorecardTone;
  /** Observable number or metric backing the verdict (not opinion alone). */
  currentValue: string;
  headline: string;
  bullets: string[];
}

export function classifyScorecardTone(verdict: string, check?: string): ScorecardTone {
  const t = verdict.replace(/🟢|🟡|🟠|🔴/g, '').trim();
  const u = t.toUpperCase();

  if (u.includes('HIGH ALERT') || u.includes('AVOID FRESH') || u.includes('HARD EXCLUDE')) {
    return 'severe';
  }
  if (u.includes('AVOID') || u.includes('INVESTIGATE') || u.includes('NOT SCREAMING')) {
    return 'bad';
  }
  if (u.includes('🟢') || /\bSTRONG\b/.test(u) || u.includes('ATTRACTIVE') || u.includes('BELOW 10Y')) {
    return 'good';
  }
  if (u.includes('ACCUMULATE') || u.includes('STAGED STARTER OK') || u.includes('BUY')) {
    return 'good';
  }
  if (u.includes('WATCHLIST') || u.includes('WAIT') || u.includes('ALIGNED') || u.includes('HOLD / SELECTIVE')) {
    return 'ok';
  }
  if (u.includes('🟡') || u.includes('MIXED') || u.includes('MONITOR') || u.includes('AVERAGE') || u.includes('PARAMETERS READ')) {
    return 'caution';
  }
  if (check === 'Risk' && u.includes('0%')) {
    return 'ok';
  }
  return 'caution';
}

function stripEmojiPrefix(s: string): string {
  return s.replace(/^[\s\uFFFD🟢🟡🟠🔴]+/, '').trim();
}

function formatPct1(n: number): string {
  return `${n.toFixed(1)}%`;
}

function buildCagrRow(analysis: StockCalculatorFullResult): ScorecardRow {
  const headline = stripEmojiPrefix(
    analysis.overview.cagrVerdict ?? analysis.cagr.frameworkVerdict ?? analysis.cagr.impliedVerdict
  );
  const tone = classifyScorecardTone(headline, 'CAGR');
  const gap = analysis.cagr.cagrGap;
  const bullets: string[] = [];

  if (gap.possibleCagrPct != null) {
    bullets.push(
      `Framework-supported CAGR band ~**${gap.possibleCagrPct.toFixed(1)}%** vs your **${analysis.inputs.expectedCagrPct}%** assumption (${formatCagrGapPp(gap.cagrGapPp)}).`
    );
  }
  if (gap.gapTone === 'positive') {
    bullets.push('Headroom vs your hurdle — growth expectation is conservative vs model.');
  } else if (gap.gapTone === 'neutral') {
    bullets.push('Expectation is **in line** with supported growth — neither stretched nor a free pass.');
  } else if (gap.gapTone === 'negative') {
    bullets.push('Your CAGR hurdle may be **above** what risk-adjusted framework supports — size accordingly.');
  }
  if (headline.toUpperCase().includes('WATCHLIST')) {
    bullets.push('Not a green-light compounder pace signal — pair with PCCL and sector rank.');
  }
  if (bullets.length === 0) bullets.push(headline);

  const currentValue =
    gap.possibleCagrPct != null
      ? `Supported ~**${formatPct1(gap.possibleCagrPct)}** · your **${analysis.inputs.expectedCagrPct}%** · gap **${formatCagrGapPp(gap.cagrGapPp)}**`
      : `Hurdle **${analysis.inputs.expectedCagrPct}%** · ${analysis.inputs.years}Y`;

  return { check: 'CAGR', tone, currentValue, headline, bullets: bullets.slice(0, 3) };
}

function buildPeRow(analysis: StockCalculatorFullResult): ScorecardRow {
  const headline = stripEmojiPrefix(analysis.overview.peVerdict);
  const tone = classifyScorecardTone(headline, 'P/E');
  const pe = analysis.peParameters;
  const bullets: string[] = [];

  if (pe.ttmPe != null && pe.avg10yPe != null) {
    const cheap = pe.ttmPe < pe.avg10yPe * 0.85;
    const rich = pe.ttmPe > pe.avg10yPe * 1.1;
    bullets.push(
      `TTM **${pe.ttmPe.toFixed(1)}×** vs 10Y avg **${pe.avg10yPe.toFixed(1)}×** (${pe.cmpSource}).`
    );
    if (cheap) bullets.push('Trailing multiple **below** long-run average — cheap vs **history** (not automatic buy).');
    else if (rich) bullets.push('Trading **above** typical 10Y P/E — need earnings path to justify.');
    else bullets.push('Near historical P/E band — valuation is **neutral** vs own past.');
  }
  if (headline.toLowerCase().includes('purchase price')) {
    bullets.push('Add **legacy purchase price + date** in Stock Analysis for full holder P/E scorecard.');
  }
  if (analysis.peScorecard) {
    bullets.push(
      `8-point scorecard raw **${analysis.peScorecard.rawScore}/8** · weighted **${analysis.peScorecard.weightedOverall10}/10**.`
    );
  }
  if (bullets.length === 0) bullets.push(headline);

  let currentValue = '—';
  if (pe.ttmPe != null) {
    currentValue =
      pe.avg10yPe != null
        ? `TTM **${pe.ttmPe.toFixed(1)}×** · 10Y avg **${pe.avg10yPe.toFixed(1)}×**`
        : `TTM **${pe.ttmPe.toFixed(1)}×** (${pe.cmpSource})`;
    if (pe.cmp != null) currentValue += ` · CMP **₹${Math.round(pe.cmp).toLocaleString('en-IN')}**`;
  } else if (pe.cmp != null) {
    currentValue = `CMP **₹${Math.round(pe.cmp).toLocaleString('en-IN')}** (${pe.cmpSource}) · TTM P/E **not available** — add StockBook PARAMETERS or retry later`;
  }

  return { check: 'P/E', tone, currentValue, headline, bullets: bullets.slice(0, 3) };
}

function buildEarningsRow(analysis: StockCalculatorFullResult): ScorecardRow {
  const headline = stripEmojiPrefix(analysis.overview.earningsQualityVerdict);
  const tone = classifyScorecardTone(headline, 'Earnings');
  const eq = analysis.earningsQuality;
  const bullets: string[] = [];

  if (eq.warnings?.length) {
    bullets.push(`**${eq.warnings.length}** quality flag(s) — review one-offs, cash conversion, receivables.`);
  }
  bullets.push('Compare **5Y PAT/EPS trend** to latest quarter — avoid extrapolating one quarter.');
  if (headline.toLowerCase().includes('mixed')) {
    bullets.push('Translation from revenue to **reported EPS** is uneven — wait for two clean quarters if adding.');
  }

  let currentValue = '—';
  const qs = eq.quarterly ?? [];
  const latestQ = qs[qs.length - 1];
  const yoyQ = qs.length >= 5 ? qs[qs.length - 5] : null;
  if (latestQ?.quarter && latestQ.pat != null && yoyQ?.pat != null && yoyQ.pat !== 0) {
    const patYoY = ((latestQ.pat - yoyQ.pat) / Math.abs(yoyQ.pat)) * 100;
    if (latestQ.revenue != null && yoyQ.revenue != null && yoyQ.revenue !== 0) {
      const revYoY = ((latestQ.revenue - yoyQ.revenue) / Math.abs(yoyQ.revenue)) * 100;
      currentValue = `${latestQ.quarter}: rev **${revYoY >= 0 ? '+' : ''}${revYoY.toFixed(0)}%** · PAT **${patYoY >= 0 ? '+' : ''}${patYoY.toFixed(0)}%** YoY`;
    } else {
      currentValue = `${latestQ.quarter}: PAT **${patYoY >= 0 ? '+' : ''}${patYoY.toFixed(0)}%** YoY`;
    }
  } else if (eq.warnings.length) {
    currentValue = `**${eq.warnings.length}** quality flag(s) in file`;
  } else if (eq.growth?.[0]?.value) {
    currentValue = `${eq.growth[0].label}: **${eq.growth[0].value}**`;
  }

  return { check: 'Earnings', tone, currentValue, headline, bullets: bullets.slice(0, 3) };
}

function buildMarginRow(analysis: StockCalculatorFullResult): ScorecardRow {
  const headline = stripEmojiPrefix(analysis.overview.marginVerdict);
  const tone = classifyScorecardTone(headline, 'Margin');
  const bullets: string[] = [
    'Track **EBITDA / gross margin** vs 3–5Y range and stated drivers (input costs, mix, competition).',
  ];
  if (headline.toLowerCase().includes('mixed')) {
    bullets.push('Direction unclear — margin recovery must show in **numbers**, not guidance alone.');
  }

  const m = analysis.margin;
  const ebitdaRow = m.partB?.rows?.find((r) => /ebitda/i.test(r.metric));
  let currentValue = '—';
  if (ebitdaRow?.todayPct != null) {
    currentValue = `EBITDA margin **${formatPct1(ebitdaRow.todayPct)}**`;
    if (ebitdaRow.avg10yPct != null) {
      currentValue += ` · 10Y avg **${formatPct1(ebitdaRow.avg10yPct)}**`;
    }
    if (ebitdaRow.deltaPp != null) {
      const d = ebitdaRow.deltaPp;
      currentValue += ` (**${d >= 0 ? '+' : ''}${d.toFixed(1)} pp** vs avg)`;
    }
  } else if (m.partD?.changePp != null) {
    currentValue = `Latest quarter margin Δ **${m.partD.changePp >= 0 ? '+' : ''}${m.partD.changePp.toFixed(1)} pp**`;
  } else if (/no margin file/i.test(m.dataSource)) {
    currentValue =
      'No **MARGIN_** / **PARAMETERS** file — margins need StockBook data (not from Yahoo)';
  }

  return { check: 'Margin', tone, currentValue, headline, bullets: bullets.slice(0, 3) };
}

function buildBusinessQualityRow(analysis: StockCalculatorFullResult): ScorecardRow {
  const headline = stripEmojiPrefix(analysis.overview.businessQualityVerdict);
  const score = analysis.businessQuality.businessQualityScore10;
  let tone = classifyScorecardTone(headline, 'Business quality');
  if (score >= 8) tone = 'good';
  else if (score <= 4) tone = 'bad';
  else if (score <= 6 && tone === 'ok') tone = 'caution';

  const bullets: string[] = [
    `Moat / franchise score **${score}/10** — separate **business quality** from **price**.`,
  ];
  if (headline.toLowerCase().includes('average') || headline.toLowerCase().includes('weak')) {
    bullets.push('Cheap price may reflect **weaker franchise** — confirm moat with sector KPIs.');
  } else if (score >= 7) {
    bullets.push('Quality tier supports **long-term hold** lens — still subject to valuation and PCCL.');
  }
  const currentValue = `Franchise score **${score}/10**`;
  return { check: 'Business quality', tone, currentValue, headline, bullets: bullets.slice(0, 3) };
}

function buildRiskRow(
  analysis: StockCalculatorFullResult,
  riskHeadline: string,
  discipline: DisciplineRule | null
): ScorecardRow {
  const headline = stripEmojiPrefix(riskHeadline);
  let tone = classifyScorecardTone(headline, 'Risk');
  if (discipline?.surplusPct === 0) tone = tone === 'good' ? 'ok' : tone;
  if (analysis.riskDecision.verdictTone === 'avoid') tone = 'severe';

  const bullets: string[] = [];
  if (discipline && discipline.surplusPct === 0) {
    bullets.push(`Personal discipline: **0% surplus rank** — ${discipline.reason}`);
  }
  if (analysis.riskDecision.concerns.length) {
    bullets.push(analysis.riskDecision.concerns.slice(0, 2).join(' · '));
  }
  bullets.push(`Quantitative risk score **${analysis.riskDecision.quantitativeScore100}/100**.`);
  const t = analysis.riskDecision.thesis;
  const currentValue = `Score **${analysis.riskDecision.quantitativeScore100}/100** · ${t.valuationLabel} · ${t.riskLabel}`;
  return { check: 'Risk', tone, currentValue, headline, bullets: bullets.slice(0, 3) };
}

export function buildInvestorScorecardRows(
  analysis: StockCalculatorFullResult,
  riskHeadline: string,
  discipline: DisciplineRule | null
): ScorecardRow[] {
  return [
    buildCagrRow(analysis),
    buildPeRow(analysis),
    buildEarningsRow(analysis),
    buildMarginRow(analysis),
    buildBusinessQualityRow(analysis),
    buildRiskRow(analysis, riskHeadline, discipline),
  ];
}

export function buildInvestorScorecardMarkdown(
  analysis: StockCalculatorFullResult,
  riskHeadline: string,
  discipline: DisciplineRule | null
): string {
  const rows = buildInvestorScorecardRows(analysis, riskHeadline, discipline);

  const tableLines = rows.map(
    (r) => `| ${TONE_LABEL[r.tone]} | **${r.check}** | ${r.currentValue} | ${r.headline} |`
  );

  return `## Scorecard

| | Check | Current value | Verdict |
|:-:|-------|---------------|---------|
${tableLines.join('\n')}

[What the scorecard colours mean →](/readme/glossary#ask-agent-scorecard-colours)
`;
}
