/**
 * App navigation — Information architecture
 * Login → My Agent (authenticated shell)
 */

/** Journal sub-tabs — daily news archive + Ask Agent history */
export const JOURNAL_NAV = [
  { href: '/journal/news', label: 'Daily News' },
  { href: '/journal/analysis', label: 'Analysis Log' },
] as const;

/** Stock Calculator sub-tabs */
export const STOCK_CALCULATOR_NAV = [
  { href: '/stock-calculator', label: 'Full Analysis' },
  { href: '/stock-calculator/cagr', label: 'CAGR Evaluation' },
  { href: '/stock-calculator/pe', label: 'PE Evaluation Framework' },
  { href: '/stock-calculator/peg', label: 'PEG Evaluation' },
  { href: '/stock-calculator/earnings-quality', label: 'Earnings Quality' },
  { href: '/stock-calculator/margin', label: 'Margin Analysis' },
  { href: '/stock-calculator/business-quality', label: 'Business Quality & Moat' },
  { href: '/stock-calculator/risk-decision', label: 'Risk & Decision' },
] as const;

export const MAIN_NAV = [
  { href: '/home', label: 'Dashboard', icon: '⌂' },
  { href: '/portfolio', label: 'Portfolio', icon: '◧' },
  { href: '/stock-calculator', label: 'Stock Calculator', icon: '⊕' },
  { href: '/journal', label: 'Journal', icon: '▤' },
  { href: '/industry-analysis', label: 'Industry Growth', icon: '◫' },
  { href: '/services', label: 'Services', icon: '⚙' },
  { href: '/wisdom', label: 'Wisdom', icon: '“' },
  { href: '/readme', label: 'ReadMe', icon: 'ℹ' },
  { href: '/chat', label: 'Ask Agent', icon: '◉' },
  { href: '/chat/prompts', label: 'Prompt Guidelines', icon: '▣' },
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
