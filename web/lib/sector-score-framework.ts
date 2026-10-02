/**
 * 6-parameter Sector Score — Industry Growth framework.
 * Weights sum to 100%. Score each parameter 1–10; weighted total on 0–10 scale.
 * Display on web as 0–100 (×10) with sector-view classification.
 *
 * Evaluation questions, rubrics, and process: StockBook/SECTOR-OUTLOOK-FRAMEWORK.md
 */

export interface SectorScoreParameter {
  id: string;
  number: number;
  icon: string;
  label: string;
  /** Short label for UI — full questionnaire lives in framework doc only */
  evaluate: string;
  weightPct: number;
}

export const SECTOR_SCORE_PARAMETERS: SectorScoreParameter[] = [
  {
    id: 'growth-tam',
    number: 1,
    icon: '📈',
    label: 'Sector Growth & TAM',
    evaluate:
      'Industry CAGR, GDP/GVA growth, market size, penetration, 5-year opportunity',
    weightPct: 20,
  },
  {
    id: 'profitability',
    number: 2,
    icon: '💰',
    label: 'Profitability & Pricing Power',
    evaluate: 'Margin trend, ROCE/ROE, pricing power, operating leverage',
    weightPct: 20,
  },
  {
    id: 'structural-india',
    number: 3,
    icon: '🚀',
    label: 'India Structural Growth',
    evaluate:
      'Government capex, urbanisation, formalisation, digitalisation, rising income, import substitution, manufacturing shift',
    weightPct: 15,
  },
  {
    id: 'capacity-cycle',
    number: 4,
    icon: '🏭',
    label: 'Capacity & Demand Cycle',
    evaluate:
      'Capacity utilisation, demand growth, capex cycle, inventory cycle, supply-demand balance',
    weightPct: 15,
  },
  {
    id: 'capital-quality',
    number: 5,
    icon: '🏦',
    label: 'Capital & Balance-Sheet Quality',
    evaluate: 'Debt/equity, interest coverage, cash flow, working capital, asset turns',
    weightPct: 15,
  },
  {
    id: 'risk-valuation',
    number: 6,
    icon: '⚠️',
    label: 'Risk, Valuation & Competition',
    evaluate:
      'Regulation, commodity/input risk, competition, cyclicality, valuation vs growth',
    weightPct: 15,
  },
];

/** Sector view bands — playbook classification on 0–100 scale */
export const SECTOR_VIEW_BANDS = [
  { min: 80, label: 'Strong structural opportunity', emoji: '🟢', cssBand: 'strong' as const },
  { min: 70, label: 'Attractive', emoji: '🟢', cssBand: 'attractive' as const },
  { min: 60, label: 'Selective', emoji: '🟡', cssBand: 'selective' as const },
  { min: 50, label: 'Neutral', emoji: '🟠', cssBand: 'neutral' as const },
  { min: 0, label: 'Avoid / structurally weak', emoji: '🔴', cssBand: 'avoid' as const },
] as const;

export type SectorViewCssBand =
  | (typeof SECTOR_VIEW_BANDS)[number]['cssBand']
  | 'pending';

export interface SectorView {
  score100: number | null;
  label: string;
  emoji: string;
  cssBand: SectorViewCssBand;
}

export function computeWeightedTotal(scores: (number | null)[]): number | null {
  if (scores.length !== SECTOR_SCORE_PARAMETERS.length) return null;
  if (scores.some((s) => s == null || !Number.isFinite(s))) return null;
  let total = 0;
  for (let i = 0; i < SECTOR_SCORE_PARAMETERS.length; i++) {
    total += (scores[i]! / 10) * SECTOR_SCORE_PARAMETERS[i].weightPct;
  }
  return Math.round(total * 10) / 10;
}

/** Convert 0–10 weighted total to 0–100 playbook score */
export function scoreTo100(score0to10: number | null): number | null {
  if (score0to10 == null || !Number.isFinite(score0to10)) return null;
  return Math.round(score0to10 * 10);
}

/** Playbook sector view from 0–10 weighted total */
export function sectorViewFromScore(score0to10: number | null): SectorView {
  const score100 = scoreTo100(score0to10);
  if (score100 == null) {
    return { score100: null, label: 'Pending', emoji: '⏳', cssBand: 'pending' };
  }
  for (const band of SECTOR_VIEW_BANDS) {
    if (score100 >= band.min) {
      return { score100, label: band.label, emoji: band.emoji, cssBand: band.cssBand };
    }
  }
  return {
    score100,
    label: 'Avoid / structurally weak',
    emoji: '🔴',
    cssBand: 'avoid',
  };
}

/** Colour band for parameter-level 1–10 scores */
export function scoreBand(score: number | null): 'high' | 'mid' | 'low' | 'pending' {
  if (score == null || !Number.isFinite(score)) return 'pending';
  if (score >= 8) return 'high';
  if (score >= 6) return 'mid';
  return 'low';
}
