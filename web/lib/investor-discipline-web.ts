/**
 * Personal discipline buckets for web Basic Analysis (mirrors investor-wisdom/personal-discipline.md).
 */

export type DisciplineSurplusAction =
  | 'none'
  | 'pause-registry'
  | 'structural-it'
  | 'governance-hdfcbank'
  | 'regulatory-itc';

export interface DisciplineRule {
  surplusPct: number;
  legacyAction: string;
  surplusAction: string;
  /** When user has 0 shares — avoids legacy YoC / averaging language */
  freshSurplusAction?: string;
  bucket: DisciplineSurplusAction;
  reason: string;
  quote?: string;
}

const IT_CLUSTER = new Set(['TCS', 'INFY', 'HCLTECH', 'WIPRO', 'TECHM']);

const PAUSE_REGISTRY = new Set(['TCS', 'HDFCLIFE', 'ITC', 'IGL']);

export function getDisciplineRule(
  ticker: string,
  opts?: { hasPosition?: boolean }
): DisciplineRule | null {
  const t = ticker.toUpperCase();
  const hasPosition = opts?.hasPosition ?? false;

  if (IT_CLUSTER.has(t)) {
    return {
      surplusPct: 0,
      legacyAction: hasPosition
        ? 'HOLD legacy only — no ADD, no fair-value scale-in'
        : 'Not in your portfolio',
      surplusAction: '0% surplus — redirect to non-IT ranked names',
      bucket: 'structural-it',
      reason: 'AI / automation may permanently compress labour-arbitrage moat (structural-threat)',
      quote:
        'When a management with a reputation for brilliance tackles a business with a reputation for bad economics, it is the reputation of the business that remains intact. — Warren Buffett',
    };
  }

  if (t === 'HDFCBANK') {
    return {
      surplusPct: 0,
      legacyAction: hasPosition
        ? 'HOLD legacy — do not add to support largest bank line'
        : 'Not in your portfolio',
      surplusAction: '0% fresh scale — prefer ICICI / Axis for bank surplus',
      bucket: 'governance-hdfcbank',
      reason: 'RBI strictures, leadership transition, governance overhang for D-SIB',
      quote: 'In India, governance is not a footnote — it is part of valuation. — Framework / Nemish Shah theme',
    };
  }

  if (t === 'ITC') {
    return {
      surplusPct: 0,
      legacyAction: hasPosition
        ? 'HOLD legacy for dividend/compounding — pause aggressive adds'
        : 'Not in your portfolio',
      surplusAction: '0% aggressive add — bottom of FMCG surplus rank until YoC path clear',
      freshSurplusAction:
        '**0% fresh surplus** — WATCHLIST only; rank higher FMCG peers without tax/regulatory bucket first',
      bucket: 'regulatory-itc',
      reason: 'Tobacco taxation / GST regulatory overhang on cigarette economics',
      quote:
        'Regulation and taxation can permanently change economics — not just one quarter\'s EPS. — Framework synthesis',
    };
  }

  if (PAUSE_REGISTRY.has(t) && hasPosition) {
    return {
      surplusPct: 0,
      legacyAction: 'HOLD legacy — PAUSE ADDS (loss + expensive entry trap)',
      surplusAction: '0% surplus — do not average down to fix avg cost',
      bucket: 'pause-registry',
      reason: 'Personal pause registry: underwater + user acknowledged expensive averaging',
      quote: 'You don\'t have to make money back the same way you lost it. — Howard Marks',
    };
  }

  return null;
}

export function isPauseRegistryTicker(ticker: string): boolean {
  return PAUSE_REGISTRY.has(ticker.toUpperCase()) || getDisciplineRule(ticker) != null;
}
