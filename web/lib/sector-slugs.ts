/** Map URL slug → sector outlook markdown path */
export const SECTOR_OUTLOOK_PATHS: Record<string, string> = {
  fmcg: 'StockBook/FMCG/fmcg-sector-outlook.md',
  auto: 'StockBook/Auto/auto-sector-outlook.md',
  'banking-finance': 'StockBook/Banking and Finance/banking-sector-outlook.md',
  'banking-finance-banks': 'StockBook/Banking and Finance/banks-sector-outlook.md',
  'banking-finance-nbfc': 'StockBook/Banking and Finance/nbfc-sector-outlook.md',
  'banking-finance-insurance': 'StockBook/Banking and Finance/insurance-sector-outlook.md',
  'banking-finance-amc': 'StockBook/Banking and Finance/amc-sector-outlook.md',
  healthcare: 'StockBook/Healthcare/healthcare-sector-outlook.md',
  pharma: 'StockBook/Pharma/pharma-sector-outlook.md',
  it: 'StockBook/IT/it-sector-outlook.md',
  infrastructure: 'StockBook/Infrastructure/infrastructure-sector-outlook.md',
  'oil-gas': 'StockBook/Oil and Gas/oil-gas-sector-outlook.md',
  telecom: 'StockBook/Telecom/telecom-sector-outlook.md',
  'hotels-leisure': 'StockBook/Hotels and Leisure/hotels-leisure-sector-outlook.md',
  consumer: 'StockBook/Consumer/consumer-sector-outlook.md',
  'precision-engineering':
    'StockBook/Precision Engineering/precision-engineering-sector-outlook.md',
  'ai-data-centre-infrastructure':
    'StockBook/AI Data Centre Infrastructure/ai-data-centre-infrastructure-sector-outlook.md',
  'semiconductor-electronics':
    'StockBook/Semiconductor and Electronics/semiconductor-electronics-sector-outlook.md',
  'specialty-pharma-cdmo':
    'StockBook/Specialty Pharma CDMO/specialty-pharma-cdmo-sector-outlook.md',
  'aerospace-space':
    'StockBook/Aerospace and Space/aerospace-space-sector-outlook.md',
  'hv-grid-equipment':
    'StockBook/HV Grid Equipment/hv-grid-equipment-sector-outlook.md',
};

/** Display labels where slug → title is not obvious */
export const SECTOR_SLUG_LABELS: Record<string, string> = {
  'precision-engineering': 'Precision Engineering',
  'ai-data-centre-infrastructure': 'AI Data Centre Infrastructure',
  'semiconductor-electronics': 'Semiconductor & Electronics',
  'specialty-pharma-cdmo': 'Specialty Pharma CDMO',
  'aerospace-space': 'Aerospace & Space',
  'hv-grid-equipment': 'HV Grid Equipment',
  healthcare: 'Hospitals & delivery',
  'banking-finance': 'Banking & Finance (overview)',
  'banking-finance-banks': 'Banks',
  'banking-finance-nbfc': 'NBFC',
  'banking-finance-insurance': 'Insurance',
  'banking-finance-amc': 'AMC',
  'oil-gas': 'Oil & Gas',
  'hotels-leisure': 'Hotels & Leisure',
};

export function sectorSlugFromOutlookPath(path: string): string | null {
  for (const [slug, p] of Object.entries(SECTOR_OUTLOOK_PATHS)) {
    if (p === path) return slug;
  }
  const base = path.split('/').pop()?.replace('-sector-outlook.md', '') ?? '';
  return base || null;
}

export function outlookPathFromSlug(slug: string): string | null {
  return SECTOR_OUTLOOK_PATHS[slug] ?? null;
}

export function sectorLabelFromSlug(slug: string): string {
  if (SECTOR_SLUG_LABELS[slug]) return SECTOR_SLUG_LABELS[slug];
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
