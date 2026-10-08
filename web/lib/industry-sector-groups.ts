/**
 * Industry Growth — major clusters and sub-sector outlook slugs.
 * Every entry in SECTOR_OUTLOOK_PATHS should appear in exactly one group.
 */

export type IndustryGroupMember = {
  slug: string;
  cardLabel?: string;
  /** Combined sector outlook card (e.g. Banking & Finance aggregate) */
  role?: 'overview';
};

export type IndustrySectorGroupDef = {
  id: string;
  title: string;
  intro: string;
  members: IndustryGroupMember[];
};

export const INDUSTRY_SECTOR_GROUPS: IndustrySectorGroupDef[] = [
  {
    id: 'healthcare-medical',
    title: 'Healthcare & Medical',
    intro:
      'Hospitals and healthcare delivery · branded pharma · specialty / CDMO chain — separate P/E and policy lenses.',
    members: [
      { slug: 'healthcare', cardLabel: 'Hospitals & delivery' },
      { slug: 'pharma', cardLabel: 'Pharma' },
      { slug: 'specialty-pharma-cdmo', cardLabel: 'Specialty pharma & CDMO' },
    ],
  },
  {
    id: 'banking-finance',
    title: 'Banking & Finance',
    intro:
      'Combined financials outlook plus banks, NBFC, insurance, and asset management (AMC).',
    members: [
      { slug: 'banking-finance', role: 'overview', cardLabel: 'Overview' },
      { slug: 'banking-finance-banks', cardLabel: 'Banks' },
      { slug: 'banking-finance-nbfc', cardLabel: 'NBFC' },
      { slug: 'banking-finance-insurance', cardLabel: 'Insurance' },
      { slug: 'banking-finance-amc', cardLabel: 'AMC' },
    ],
  },
  {
    id: 'technology-digital',
    title: 'Technology & Digital',
    intro: 'IT services · telecom · AI data-centre infrastructure · semiconductors & electronics.',
    members: [
      { slug: 'it', cardLabel: 'IT services' },
      { slug: 'telecom', cardLabel: 'Telecom' },
      { slug: 'ai-data-centre-infrastructure', cardLabel: 'AI data centres' },
      { slug: 'semiconductor-electronics', cardLabel: 'Semiconductor & electronics' },
    ],
  },
  {
    id: 'industrials-infrastructure',
    title: 'Industrials & Infrastructure',
    intro: 'EPC and core infra · precision engineering · aerospace & space · HV grid equipment.',
    members: [
      { slug: 'infrastructure', cardLabel: 'Infrastructure' },
      { slug: 'precision-engineering', cardLabel: 'Precision engineering' },
      { slug: 'aerospace-space', cardLabel: 'Aerospace & space' },
      { slug: 'hv-grid-equipment', cardLabel: 'HV grid equipment' },
    ],
  },
  {
    id: 'consumer-auto-leisure',
    title: 'Consumer, Auto & Leisure',
    intro: 'FMCG · consumer durables · autos (SIAM) · hotels and leisure.',
    members: [
      { slug: 'fmcg', cardLabel: 'FMCG' },
      { slug: 'consumer', cardLabel: 'Consumer durables' },
      { slug: 'auto', cardLabel: 'Auto' },
      { slug: 'hotels-leisure', cardLabel: 'Hotels & leisure' },
    ],
  },
  {
    id: 'energy',
    title: 'Energy',
    intro: 'Oil, gas, OMC cycle, and energy-linked policy (RBI / geopolitical transmission).',
    members: [{ slug: 'oil-gas', cardLabel: 'Oil & gas' }],
  },
];

const SLUG_TO_GROUP = new Map<string, IndustrySectorGroupDef>();
for (const group of INDUSTRY_SECTOR_GROUPS) {
  for (const m of group.members) {
    SLUG_TO_GROUP.set(m.slug, group);
  }
}

export function getIndustryGroupForSlug(slug: string): IndustrySectorGroupDef | null {
  return SLUG_TO_GROUP.get(slug) ?? null;
}

export function getIndustryGroupMember(slug: string): IndustryGroupMember | null {
  const group = getIndustryGroupForSlug(slug);
  if (!group) return null;
  return group.members.find((m) => m.slug === slug) ?? null;
}

export function allIndustryGroupedSlugs(): Set<string> {
  return new Set(SLUG_TO_GROUP.keys());
}

export function industryDetailBackNavigation(slug: string): { href: string; label: string } {
  const group = getIndustryGroupForSlug(slug);
  if (!group) {
    return { href: '/industry-analysis', label: '← Industry Growth' };
  }
  const member = getIndustryGroupMember(slug);
  if (member?.role === 'overview') {
    return { href: `/industry-analysis#${group.id}`, label: `← ${group.title}` };
  }
  return { href: `/industry-analysis#${group.id}`, label: `← ${group.title}` };
}

/** @deprecated Use getIndustryGroupForSlug — kept for any stale imports */
export const BANKING_FINANCE_PARENT_SLUG = 'banking-finance';

export function isBankingFinanceIndustrySlug(slug: string): boolean {
  return getIndustryGroupForSlug(slug)?.id === 'banking-finance';
}
