/**
 * Market data dependency graph — what moves daily vs on events,
 * and which service refreshes which StockBook artifacts.
 */

export type MarketDataKind =
  | 'cmp'
  | 'quarterly-results'
  | 'broker-targets'
  | 'sector-mcap'
  | 'news'
  | 'parameters-pe'
  | 'cagr-returns'
  | 'pccl-valuation';

export interface MarketDataNode {
  id: MarketDataKind;
  label: string;
  cadence: 'daily' | 'event' | 'weekly' | 'continuous';
  /** StockBook / portfolio files touched */
  artifacts: string[];
  /** Service id from services-catalog (apiAction or id) */
  serviceId: string;
  /** Other nodes that must refresh when this changes */
  downstream: MarketDataKind[];
}

/** Authoritative dependency map for Services tab + agent prompts. */
export const MARKET_DATA_GRAPH: MarketDataNode[] = [
  {
    id: 'cmp',
    label: 'CMP (NSE live)',
    cadence: 'daily',
    artifacts: [
      'PARAMETERS_[TICKER].md (header + Today @ CMP)',
      'CAGR_[TICKER].md (CMP, lot returns)',
      'BROKER_[TICKER].md (CMP, upside %)',
      'summary-analysis.md (CMP line)',
      'StockBook/_cmp-cache.json',
    ],
    serviceId: 'refresh-portfolio-cmp',
    downstream: ['parameters-pe', 'cagr-returns', 'broker-targets'],
  },
  {
    id: 'quarterly-results',
    label: 'Quarterly results',
    cadence: 'event',
    artifacts: [
      'summary-analysis.md',
      'EARNINGS_QUALITY_[TICKER].md',
      'PARAMETERS_[TICKER].md (TTM EPS, margins)',
      'faq.md',
      'PCCL / suggested-approach',
    ],
    serviceId: 'refresh-quarter-results',
    downstream: ['parameters-pe', 'pccl-valuation'],
  },
  {
    id: 'parameters-pe',
    label: 'P/E & valuation tables',
    cadence: 'event',
    artifacts: ['PARAMETERS_[TICKER].md Part 1 Today @ CMP', 'portfolio-parameters.md'],
    serviceId: 'refresh-cmp-derived-metrics',
    downstream: ['pccl-valuation'],
  },
  {
    id: 'cagr-returns',
    label: 'Holding CAGR',
    cadence: 'daily',
    artifacts: ['CAGR_[TICKER].md', 'portfolio-cagr.md'],
    serviceId: 'refresh-portfolio-cmp',
    downstream: [],
  },
  {
    id: 'broker-targets',
    label: 'Broker targets & reco',
    cadence: 'daily',
    artifacts: ['BROKER_[TICKER].md', '.cursor/portfolio/broker-target-prices.md'],
    serviceId: 'refresh-broker-targets',
    downstream: [],
  },
  {
    id: 'sector-mcap',
    label: 'Sector cap-tier mcap',
    cadence: 'weekly',
    artifacts: ['StockBook/*-sector-outlook.md cap-tier tables'],
    serviceId: 'refresh-sector-mcap',
    downstream: [],
  },
  {
    id: 'news',
    label: 'Daily news context',
    cadence: 'daily',
    artifacts: ['News/YYYY-MM/DD/summary.md', 'News/TICKER-INDEX.md'],
    serviceId: 'news-today',
    downstream: [],
  },
  {
    id: 'pccl-valuation',
    label: 'PCCL / fair value',
    cadence: 'event',
    artifacts: ['summary-analysis.md', 'suggested-approach.md', 'faq.md'],
    serviceId: 'refresh-quarter-results',
    downstream: [],
  },
];

/** Automated API actions run in order for "Run all automated". */
export const DAILY_AUTOMATED_ACTIONS = [
  'refresh-portfolio-cmp',
  'scan-quarter-results',
  'news-today',
] as const;

export const ALL_AUTOMATED_ACTIONS = [
  'refresh-portfolio-cmp',
  'scan-quarter-results',
  'refresh-sector-mcap',
  'news-today',
] as const;

export type AutomatedServiceAction = (typeof ALL_AUTOMATED_ACTIONS)[number];

export function getDownstreamLabels(kind: MarketDataKind): string[] {
  const node = MARKET_DATA_GRAPH.find((n) => n.id === kind);
  if (!node) return [];
  return node.downstream.map(
    (d) => MARKET_DATA_GRAPH.find((n) => n.id === d)?.label ?? d
  );
}
