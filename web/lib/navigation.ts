/**
 * App navigation — Information architecture
 * Login → My Agent (authenticated shell)
 */

/** Grouped hub — journal, services, wisdom, help, prompts */
export const RESOURCES_HUB_TITLE = 'Resources & Playbook';
export const RESOURCES_HUB_INTRO =
  'Daily journal, automated services, investor wisdom, help docs, and copy-paste agent prompts — in one place.';

export const RESOURCES_NAV = [
  { href: '/resources', label: 'Overview', exact: true as const },
  { href: '/journal/news', label: 'Journal', matchPrefix: '/journal' },
  { href: '/services', label: 'Services', matchPrefix: '/services' },
  { href: '/wisdom', label: 'Wisdom', matchPrefix: '/wisdom' },
  { href: '/readme', label: 'ReadMe', matchPrefix: '/readme' },
  { href: '/chat/prompts', label: 'Prompt Guidelines', matchPrefix: '/chat/prompts' },
] as const;

export function isResourcesSectionPath(pathname: string): boolean {
  if (pathname === '/resources') return true;
  return RESOURCES_NAV.some(
    (item) =>
      'matchPrefix' in item &&
      item.matchPrefix &&
      pathname.startsWith(item.matchPrefix)
  );
}

/** Journal sub-tabs — daily news archive + Ask Agent history */
export const JOURNAL_NAV = [
  { href: '/journal/news', label: 'Daily News' },
  { href: '/journal/analysis', label: 'Analysis Log' },
] as const;

/** Stock Analysis area — routes stay under /stock-calculator */
export const STOCK_ANALYSIS_TITLE = 'Stock Analysis';
export const STOCK_ANALYSIS_INTRO =
  'For stocks you hold or are planning to buy — valuation, quality, earnings, and risk in one place.';

/** Stock Analysis sub-tabs (module drill-down + history) */
export const STOCK_CALCULATOR_NAV = [
  { href: '/stock-calculator', label: 'Analyze' },
  { href: '/stock-calculator/cagr', label: 'CAGR' },
  { href: '/stock-calculator/pe', label: 'P/E' },
  { href: '/stock-calculator/peg', label: 'PEG' },
  { href: '/stock-calculator/earnings-quality', label: 'Earnings Quality' },
  { href: '/stock-calculator/margin', label: 'Margin' },
  { href: '/stock-calculator/business-quality', label: 'Business Quality' },
  { href: '/stock-calculator/risk-decision', label: 'Risk & Decision' },
  { href: '/stock-calculator/history', label: 'History' },
] as const;

export const MAIN_NAV = [
  { href: '/home', label: 'Dashboard', icon: '⌂' },
  { href: '/portfolio', label: 'Portfolio', icon: '◧' },
  { href: '/stock-calculator', label: STOCK_ANALYSIS_TITLE, icon: '⊕' },
  { href: '/industry-analysis', label: 'Industry Growth', icon: '◫' },
  { href: '/resources', label: RESOURCES_HUB_TITLE, icon: '▦' },
  { href: '/chat', label: 'Ask Agent', icon: '◉' },
] as const;

/** StockBook file tabs — matches StockBook/AGENT-RULES.md read order + report */
export const STOCKBOOK_TABS = [
  { id: 'summary', label: 'Summary', file: 'summary-analysis.md' },
  { id: 'faq', label: 'FAQ', file: 'faq.md' },
  { id: 'approach', label: 'Approach', file: 'suggested-approach.md' },
  { id: 'detail', label: 'Detail', file: 'detail-analysis.md' },
  { id: 'parameters', label: 'Parameters', filePattern: 'PARAMETERS_*.md' },
  { id: 'broker', label: 'Broker', filePattern: 'BROKER_*.md' },
  { id: 'cagr', label: 'CAGR', filePattern: 'CAGR_*.md' },
  { id: 'external-risk', label: 'External Risk', file: 'external-negative-risk.md' },
  { id: 'internal-risk', label: 'Internal Risk', file: 'internal-negative-risk.md' },
  { id: 'report', label: 'Report', filePattern: '*-report.html', type: 'html' as const },
] as const;

export type StockbookTabId = (typeof STOCKBOOK_TABS)[number]['id'];

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function stockbookPath(sector: string, stock: string, tab = 'summary'): string {
  return `/stockbook/${toSlug(sector)}/${toSlug(stock)}/${tab}`;
}
