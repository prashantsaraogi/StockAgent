/**
 * Backfill Risk & Decision sections A–D when RISK_DECISION_[TICKER].md is missing or thin.
 */

import type { loadPeEvaluation } from './pe-evaluation';
import type { runEarningsQualityAnalysis } from './earnings-quality';
import type { runBusinessQualityAnalysis } from './business-quality-moat';
import type {
  FrameworkQualityMetrics,
  RiskFactorResult,
} from './stock-calculator-framework';
import type { ForwardGrowthTab } from './stock-calculator-tabs';
import type {
  CatalystRow,
  RiskFactorRow,
  ThesisBreaker,
} from './risk-decision';

export interface MonitorTriggerRow {
  trigger: string;
  metric: string;
  threshold: string;
  action: string;
}

function levelSignal(level: string, defaultSignal: '🟢' | '🟡' | '🔴'): '🟢' | '🟡' | '🔴' {
  const u = level.toUpperCase();
  if (u.includes('L3')) return '🔴';
  if (u.includes('L2')) return '🟡';
  if (u.includes('L1')) return defaultSignal;
  return defaultSignal;
}

function sectorCatalystHints(sector: string): CatalystRow[] {
  const s = sector.toLowerCase();
  if (s.includes('fmcg') || s.includes('consumer')) {
    return [
      {
        catalyst: 'Rural / volume recovery',
        direction: '↑',
        probability: 'Medium',
        evidence: 'Sector template — ASSUMPTION',
      },
      {
        catalyst: 'Premium mix / innovation',
        direction: '↑',
        probability: 'Medium',
        evidence: 'Sector template — ASSUMPTION',
      },
    ];
  }
  if (s.includes('auto')) {
    return [
      { catalyst: 'Volume growth', direction: '↑', probability: 'High', evidence: 'Sector template' },
      { catalyst: 'Mix / SUV shift', direction: '↑', probability: 'Medium-High', evidence: 'Sector template' },
    ];
  }
  if (s.includes('bank') || s.includes('finance')) {
    return [
      { catalyst: 'Credit growth + stable asset quality', direction: '↑', probability: 'Medium', evidence: 'Sector template' },
      { catalyst: 'NIM stability', direction: '↑', probability: 'Medium', evidence: 'Sector template' },
    ];
  }
  if (s.includes('it')) {
    return [
      { catalyst: 'Deal wins / large deals', direction: '↑', probability: 'Medium', evidence: 'Sector template' },
      { catalyst: 'Margin stabilisation', direction: '↑', probability: 'Medium', evidence: 'Sector template' },
    ];
  }
  if (s.includes('pharma') || s.includes('health')) {
    return [
      { catalyst: 'US / export pipeline', direction: '↑', probability: 'Medium', evidence: 'Sector template' },
      { catalyst: 'Domestic volume growth', direction: '↑', probability: 'Medium', evidence: 'Sector template' },
    ];
  }
  return [
    {
      catalyst: 'Earnings compounding vs base case',
      direction: '↑',
      probability: 'Medium',
      evidence: 'Generic — PARAMETERS / tab synthesis',
    },
  ];
}

export function synthesizeRiskFactors(input: {
  sector: string;
  peEval: Awaited<ReturnType<typeof loadPeEvaluation>>;
  eq: Awaited<ReturnType<typeof runEarningsQualityAnalysis>>;
  bq: Awaited<ReturnType<typeof runBusinessQualityAnalysis>>;
  quality: FrameworkQualityMetrics;
  internalRisk: RiskFactorResult;
  externalRisk: RiskFactorResult;
  valuation10: number;
  risk10: number;
}): RiskFactorRow[] {
  const rows: RiskFactorRow[] = [];
  let id = 0;
  const push = (bucket: string, factor: string, assessment: string, level: string, signal: '🟢' | '🟡' | '🔴') => {
    rows.push({
      id: `syn_${id++}`,
      bucket,
      factor,
      assessment,
      level,
      signal,
    });
  };

  const bqScore = input.bq?.businessQualityScore10 ?? 5;
  push(
    'Business risk',
    'Franchise / moat (Tab 4)',
    bqScore >= 7 ? 'Strong business quality score' : bqScore >= 5.5 ? 'Average franchise — monitor' : 'Weak moat signals',
    bqScore >= 7 ? 'L1' : bqScore >= 5.5 ? 'L1-L2' : 'L2',
    bqScore >= 7 ? '🟢' : bqScore >= 5.5 ? '🟡' : '🔴'
  );

  for (const r of input.internalRisk.topRisks.slice(0, 2)) {
    push('Business risk', r.split('(')[0]?.trim() || r, input.internalRisk.summary.slice(0, 120), input.internalRisk.level, levelSignal(input.internalRisk.level, '🟡'));
  }

  const debt = input.quality.debtRatio;
  const debtDisplay = input.quality.debtDisplay;
  if (debt != null || debtDisplay !== '—') {
    const heavy = debt != null && debt > 2;
    push(
      'Financial risk',
      'Leverage (PARAMETERS)',
      debtDisplay !== '—' ? debtDisplay : `Net debt / EBITDA ~${debt}x`,
      heavy ? 'L2-L3' : 'L1',
      heavy ? '🔴' : debt != null && debt > 1 ? '🟡' : '🟢'
    );
  } else {
    push('Financial risk', 'Balance sheet', 'Refresh PARAMETERS Block C — debt/cash', 'L1', '🟡');
  }

  const eqWarn = input.eq?.warnings[0]?.detail;
  push(
    'Financial risk',
    'Earnings → cash (Tab 3)',
    eqWarn ?? (input.eq?.overallTone === 'good' ? 'No material EQ warnings' : 'Mixed earnings quality — watch CFO/PAT'),
    eqWarn ? 'L1-L2' : 'L1',
    eqWarn ? '🟡' : input.eq?.overallTone === 'good' ? '🟢' : '🟡'
  );

  const prem = input.peEval?.premiumTo10yPct;
  push(
    'Valuation risk',
    'P/E vs 10Y (Tab 1)',
    prem != null ? `${prem >= 0 ? '+' : ''}${prem.toFixed(1)}% vs 10Y avg` : 'PE Evaluation — refresh PARAMETERS Part 1',
    prem != null && prem > 15 ? 'L1-L2' : 'L1',
    prem != null && prem > 20 ? '🔴' : prem != null && prem > 8 ? '🟡' : '🟢'
  );

  if (input.valuation10 < 6) {
    push('Valuation risk', 'Forward / IV stretch', 'Composite valuation score below 6/10', 'L1-L2', '🟡');
  }

  push(
    'Governance risk',
    'Governance register',
    'Live-search banks/NBFCs · read internal-negative-risk for flags',
    'L1',
    '🟡'
  );

  for (const r of input.externalRisk.topRisks.slice(0, 3)) {
    push(
      'External risk',
      r.split('(')[0]?.trim() || r,
      input.externalRisk.summary.slice(0, 100),
      input.externalRisk.level,
      levelSignal(input.externalRisk.level, '🟡')
    );
  }
  if (input.externalRisk.topRisks.length === 0) {
    push(
      'External risk',
      'Macro / policy',
      input.externalRisk.source === 'dynamic-synthesis'
        ? input.externalRisk.summary
        : input.externalRisk.summary,
      'L1',
      '🟡'
    );
  }

  return rows;
}

export function synthesizeCatalysts(input: {
  sector: string;
  quality: FrameworkQualityMetrics;
  forward: ForwardGrowthTab;
  peEval: Awaited<ReturnType<typeof loadPeEvaluation>>;
  eq: Awaited<ReturnType<typeof runEarningsQualityAnalysis>>;
}): CatalystRow[] {
  const rows: CatalystRow[] = [];

  const eps = input.quality.baseEpsCagrPct;
  if (eps != null) {
    rows.push({
      catalyst: 'Base-case EPS CAGR path',
      direction: '↑',
      probability: eps >= 12 ? 'Medium-High' : 'Medium',
      evidence: `${eps}% — PARAMETERS / framework`,
    });
  }

  if (input.forward.volumeCagr && input.forward.volumeCagr !== '—') {
    rows.push({
      catalyst: 'Volume / UVG growth',
      direction: '↑',
      probability: 'Medium',
      evidence: input.forward.volumeCagr,
    });
  }

  if (input.forward.implied5yPriceCagr && input.forward.implied5yPriceCagr !== '—') {
    const m = input.forward.implied5yPriceCagr.match(/([\d.]+)/);
    if (m && parseFloat(m[1]) >= 10) {
      rows.push({
        catalyst: '5Y fair price path',
        direction: '↑',
        probability: 'Medium',
        evidence: input.forward.implied5yPriceCagr,
      });
    }
  }

  const prem = input.peEval?.premiumTo10yPct;
  if (prem != null && prem < -5) {
    rows.push({
      catalyst: 'Re-rating from cheap vs history',
      direction: '↑',
      probability: 'Medium',
      evidence: `P/E ${prem.toFixed(1)}% vs 10Y — PE tab`,
    });
  }

  if (input.eq?.warnings.some((w) => /margin/i.test(w.detail))) {
    rows.push({
      catalyst: 'Margin recovery',
      direction: '↑',
      probability: 'Medium',
      evidence: 'Near-term drag — HYPOTHESIS if temporary',
    });
  }

  rows.push(...sectorCatalystHints(input.sector));

  const seen = new Set<string>();
  return rows.filter((r) => {
    const k = r.catalyst.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 8);
}

export function synthesizeThesisBreakers(input: {
  sector: string;
  internalRisk: RiskFactorResult;
  externalRisk: RiskFactorResult;
  eq: Awaited<ReturnType<typeof runEarningsQualityAnalysis>>;
  bq: Awaited<ReturnType<typeof runBusinessQualityAnalysis>>;
}): ThesisBreaker[] {
  const rows: ThesisBreaker[] = [];
  const add = (text: string, critical = true) => {
    if (!rows.some((r) => r.text === text)) {
      rows.push({ text, severity: critical ? 'critical' : 'warn' });
    }
  };

  add('EPS growth turns negative for several consecutive quarters');
  add('Operating margin fails to recover while competition intensifies');
  add('ROCE / ROE deteriorates materially vs 10Y norm');
  add('Cash generation weakens — sustained CFO/PAT < 0.8 without explanation');

  for (const w of input.eq?.warnings ?? []) {
    add(w.detail, true);
  }

  for (const r of [...input.internalRisk.topRisks, ...input.externalRisk.topRisks].slice(0, 4)) {
    add(`Materialisation: ${r.replace(/\s*\([^)]+\)\s*$/, '')}`, true);
  }

  const bq = input.bq?.businessQualityScore10 ?? 5;
  if (bq < 6) {
    add('Business quality score falls persistently below 6/10 — moat erosion', true);
  }

  const s = input.sector.toLowerCase();
  if (s.includes('auto')) add('EV transition causes persistent loss of competitiveness');
  if (s.includes('it')) add('Structural AI/disruption erodes pricing power without offsetting growth');
  if (s.includes('bank')) add('Asset quality / GNPA spike with credit cost normalisation failure');
  if (s.includes('fmcg')) add('Volume growth stalls while input costs compress margins for multiple quarters');

  return rows.slice(0, 10);
}

export function synthesizeMonitorTriggers(input: {
  sector: string;
  eq: Awaited<ReturnType<typeof runEarningsQualityAnalysis>>;
  nextQuarterWatch: string[];
}): MonitorTriggerRow[] {
  const rows: MonitorTriggerRow[] = [
    {
      trigger: 'Quarterly results',
      metric: 'Revenue YoY · PAT YoY · EPS',
      threshold: 'PAT lagging revenue 2+ quarters',
      action: 'Re-run Tab 3 + pause surplus adds until explained',
    },
    {
      trigger: 'Margin trajectory',
      metric: 'EBITDA / net margin vs prior year',
      threshold: '↓ >150 bps YoY without one-off',
      action: 'Refresh Margin tab · check core-problem test',
    },
    {
      trigger: 'Valuation re-rate',
      metric: 'P/E vs 10Y and forward IV',
      threshold: 'Premium > +20% vs 10Y with EPS miss',
      action: 'Tighten SIP pace · review PCCL gap',
    },
  ];

  for (const w of input.nextQuarterWatch) {
    rows.push({
      trigger: 'Framework watch',
      metric: w,
      threshold: 'Deteriorating vs last 4Q trend',
      action: 'Update RISK_DECISION + faq.md',
    });
  }

  const s = input.sector.toLowerCase();
  if (s.includes('bank')) {
    rows.push({
      trigger: 'Asset quality',
      metric: 'GNPA / NNPA · credit cost',
      threshold: 'GNPA up 2+ quarters',
      action: 'Governance + fraud live-search · reduce fresh capital rank',
    });
  }
  if (s.includes('fmcg')) {
    rows.push({
      trigger: 'Volume / UVG',
      metric: 'Underlying volume growth',
      threshold: 'Below 5% for 2+ quarters',
      action: 'Reassess growth CAGR in PARAMETERS',
    });
  }

  if (input.eq?.partA?.epsCagr5y != null && input.eq.partA.epsCagr5y < 5) {
    rows.push({
      trigger: 'EPS compounding',
      metric: '5Y EPS CAGR',
      threshold: '< 5% sustained',
      action: 'Thesis breaker review — hold vs pause adds',
    });
  }

  return rows.slice(0, 8);
}
