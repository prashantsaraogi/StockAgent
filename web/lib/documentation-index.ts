/**
 * Documentation catalog — index for ReadMe → Documentation.
 * Paths relative to monorepo root (parent of web/).
 */

export interface DocHeading {
  level: 2 | 3;
  text: string;
  id: string;
}

export interface DocEntry {
  slug: string;
  title: string;
  description: string;
  path: string;
  category: string;
  order: number;
}

export interface DocCategory {
  id: string;
  label: string;
  description: string;
  docs: DocEntry[];
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Extract h2/h3 for in-page table of contents */
export function extractDocHeadings(markdown: string): DocHeading[] {
  const headings: DocHeading[] = [];
  const seen = new Map<string, number>();

  for (const line of markdown.split('\n')) {
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (!m) continue;
    const level = m[1].length as 2 | 3;
    const text = m[2].replace(/\*\*/g, '').replace(/`/g, '').trim();
    if (!text) continue;

    let id = slugifyHeading(text);
    const count = seen.get(id) ?? 0;
    if (count > 0) id = `${id}-${count}`;
    seen.set(slugifyHeading(text), count + 1);

    headings.push({ level, text, id });
  }

  return headings;
}

const DOC_ENTRIES: DocEntry[] = [
  {
    slug: 'web-mvp',
    title: 'Web MVP — Quick start',
    description: 'Install, run locally, Supabase vs dev mode, API endpoints.',
    path: 'web/README.md',
    category: 'getting-started',
    order: 1,
  },
  {
    slug: 'parallel-development',
    title: 'Parallel development (Cursor + Web)',
    description: 'Dual-track design — shared framework, tenant isolation, write rules.',
    path: 'docs/PARALLEL-DEVELOPMENT.md',
    category: 'getting-started',
    order: 2,
  },
  {
    slug: 'supabase-setup',
    title: 'Supabase setup',
    description: 'Auth, Postgres migrations, env vars, calculator history schema.',
    path: 'docs/SUPABASE-SETUP.md',
    category: 'getting-started',
    order: 3,
  },
  {
    slug: 'ui-design',
    title: 'UI design & routes',
    description: 'Information architecture, main tabs, StockBook sub-tabs, data sources.',
    path: 'docs/UI-DESIGN.md',
    category: 'web-app',
    order: 1,
  },
  {
    slug: 'ask-agent-rules',
    title: 'Ask Agent rules (web)',
    description: 'Framework-first precedence, verdict vocabulary, news query handling.',
    path: 'web/lib/agent/ASK-AGENT-RULES.md',
    category: 'web-app',
    order: 2,
  },
  {
    slug: 'stockbook-agent-rules',
    title: 'StockBook agent rules',
    description: 'Read order, write-back tiers, analysis lenses, PCCL integration.',
    path: 'StockBook/AGENT-RULES.md',
    category: 'framework',
    order: 1,
  },
  {
    slug: 'stock-question-framework',
    title: 'Stock question framework',
    description: 'Structured Q&A on StockBook pages — P/E vs results, one-offs, PCCL, faq write-back.',
    path: 'StockBook/STOCK-QUESTION-FRAMEWORK.md',
    category: 'framework',
    order: 1.5,
  },
  {
    slug: 'buy-decision-workflow',
    title: 'Buy decision workflow',
    description: '10-step mandatory process for buy/add — discipline, PCCL, quotes lens.',
    path: 'investor-wisdom/buy-decision-workflow.md',
    category: 'framework',
    order: 2,
  },
  {
    slug: 'personal-discipline',
    title: 'Personal discipline',
    description: 'Pause registry, structural buckets, no avg-down rules (Aug 2026).',
    path: 'investor-wisdom/personal-discipline.md',
    category: 'framework',
    order: 3,
  },
  {
    slug: 'long-term-mandate',
    title: 'Long-term investor mandate',
    description: 'Default HOLD — no TRIM/SELL for valuation; existential exit only.',
    path: '.cursor/skills/portfolio-analysis/long-term-investor-mandate.md',
    category: 'framework',
    order: 4,
  },
  {
    slug: 'news-agent-rules',
    title: 'News agent rules',
    description: 'Daily summary format, SEARCH-WORKFLOW, portfolio impact table.',
    path: 'News/AGENT-RULES.md',
    category: 'framework',
    order: 5,
  },
  {
    slug: 'news-search-workflow',
    title: 'News search workflow',
    description: 'IST calendar day, three buckets, stock-wise 50 holdings loop.',
    path: 'News/SEARCH-WORKFLOW.md',
    category: 'framework',
    order: 6,
  },
  {
    slug: 'pe-evaluation-framework',
    title: 'PE Evaluation — Stock Valuation Scorecard',
    description:
      'Purchase P/E vs today · EPS growth · 8-point scorecard · fresh vs legacy holder verdicts.',
    path: 'StockBook/PE-EVALUATION-FRAMEWORK.md',
    category: 'framework',
    order: 8,
  },
  {
    slug: 'earnings-quality-framework',
    title: 'Earnings Quality — Stock Calculator Tab 3',
    description:
      'Growth · profitability · cash quality · 8-quarter trend · revenue-vs-profit warnings.',
    path: 'StockBook/EARNINGS-QUALITY-FRAMEWORK.md',
    category: 'framework',
    order: 8.5,
  },
  {
    slug: 'precision-engineering-sector-outlook',
    title: 'Precision Engineering — Industry Growth sector',
    description:
      'Forgings, bearings, precision auto-tier-2, defence/aerospace machining — separate from Auto OEM and Infra EPC.',
    path: 'StockBook/Precision Engineering/precision-engineering-sector-outlook.md',
    category: 'framework',
    order: 8.54,
  },
  {
    slug: 'margin-framework',
    title: 'Margin Analysis — Stock Calculator',
    description:
      '5Y margin history · today vs 10Y · drivers & pass-through · quarterly margin trend.',
    path: 'StockBook/MARGIN-FRAMEWORK.md',
    category: 'framework',
    order: 8.55,
  },
  {
    slug: 'peg-evaluation-framework',
    title: 'PEG Evaluation — Stock Calculator',
    description:
      'P/E + PEG + ROCE + debt + FCF combined scorecard · 100-pt model · max P/E at target PEG · infra FCF lens.',
    path: 'StockBook/PEG-FRAMEWORK.md',
    category: 'framework',
    order: 8.56,
  },
  {
    slug: 'business-quality-moat-framework',
    title: 'Business Quality & Moat — Stock Calculator Tab 4',
    description:
      'Seven-pillar franchise score · market position · moat · pricing power · management.',
    path: 'StockBook/BUSINESS-QUALITY-MOAT-FRAMEWORK.md',
    category: 'framework',
    order: 8.6,
  },
  {
    slug: 'risk-decision-framework',
    title: 'Risk & Decision — Stock Calculator Tab 5',
    description:
      'Final decision engine · five-tab composite · thesis card · catalysts · breakers.',
    path: 'StockBook/RISK-DECISION-FRAMEWORK.md',
    category: 'framework',
    order: 8.7,
  },
  {
    slug: 'parameters-framework',
    title: 'PARAMETERS framework',
    description: 'Part 1 rear-view (10Y) · Part 2 forward (5Y) master table per stock.',
    path: 'StockBook/PARAMETERS-FRAMEWORK.md',
    category: 'framework',
    order: 9,
  },
  {
    slug: 'morning-run-prompts',
    title: 'Morning run prompts',
    description: 'Copy-paste Cursor prompts — Variants A/B/C, buy decision, trade update.',
    path: '.cursor/prompts/MORNING-RUN-PROMPT.md',
    category: 'framework',
    order: 7,
  },
];

const CATEGORY_META: Record<string, { label: string; description: string; order: number }> = {
  'getting-started': {
    label: 'Getting started',
    description: 'Install, deploy, and run the web app alongside Cursor.',
    order: 1,
  },
  'web-app': {
    label: 'Web application',
    description: 'Routes, UI architecture, and web-specific agent behaviour.',
    order: 2,
  },
  framework: {
    label: 'Investment framework',
    description: 'Core rules, workflows, news, and discipline — binding on all analysis.',
    order: 3,
  },
};

export function getDocBySlug(slug: string): DocEntry | undefined {
  return DOC_ENTRIES.find((d) => d.slug === slug);
}

/** Map repo-relative markdown path → documentation slug (bundled on Vercel). */
export function getDocSlugForRepoPath(repoPath: string): string | undefined {
  const norm = repoPath.replace(/\\/g, '/').replace(/^\.\//, '');
  return DOC_ENTRIES.find((d) => d.path.replace(/\\/g, '/') === norm)?.slug;
}

export function listDocCategories(): DocCategory[] {
  const byCategory = new Map<string, DocEntry[]>();
  for (const doc of DOC_ENTRIES) {
    const list = byCategory.get(doc.category) ?? [];
    list.push(doc);
    byCategory.set(doc.category, list);
  }

  return [...byCategory.entries()]
    .map(([id, docs]) => ({
      id,
      label: CATEGORY_META[id]?.label ?? id,
      description: CATEGORY_META[id]?.description ?? '',
      docs: docs.sort((a, b) => a.order - b.order),
    }))
    .sort(
      (a, b) =>
        (CATEGORY_META[a.id]?.order ?? 99) - (CATEGORY_META[b.id]?.order ?? 99)
    );
}

export function listAllDocs(): DocEntry[] {
  return [...DOC_ENTRIES].sort((a, b) => a.order - b.order);
}

export const GLOSSARY_PATH = 'GLOSSARY.md';
