export type CapTierId = 'large-cap' | 'mid-cap' | 'small-cap';
export type CapLensId = 'growth' | 'market-cap';

export interface CapTierStock {
  rank: number;
  company: string;
  ticker: string;
  mcapCr: number | null;
  metric: string | null;
  reading: string | null;
  type: string | null;
}

export interface CapTierLens {
  id: CapLensId;
  label: string;
  expectedCount: number;
  stocks: CapTierStock[];
}

export interface CapTierBlock {
  id: CapTierId;
  label: string;
  /** Sum of both lenses — e.g. Large cap = 10 (5 + 5). */
  expectedTotal: number;
  lenses: CapTierLens[];
}

export interface ParsedCapTierUniverse {
  tiers: CapTierBlock[];
  complete: boolean;
}

/** Stocks required in each lens — Large cap = 5 Growth + 5 Market cap = 10 total. */
export const EXPECTED_STOCKS_PER_LENS = 5;

const TIER_LENS_COUNTS: Record<CapTierId, number> = {
  'large-cap': EXPECTED_STOCKS_PER_LENS,
  'mid-cap': EXPECTED_STOCKS_PER_LENS,
  'small-cap': EXPECTED_STOCKS_PER_LENS,
};

const TIER_SPECS: { heading: RegExp; id: CapTierId; label: string }[] = [
  { heading: /### Large cap/i, id: 'large-cap', label: 'Large cap' },
  { heading: /### Mid cap/i, id: 'mid-cap', label: 'Mid cap' },
  { heading: /### Small cap/i, id: 'small-cap', label: 'Small cap' },
];

function parseNum(raw: string): number | null {
  const n = parseFloat(raw.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function parseTableRows(section: string): CapTierStock[] {
  const stocks: CapTierStock[] = [];

  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    if (/^\|\s*[-#]/.test(line)) continue;

    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.replace(/\*\*/g, '').trim());
    if (cells.length < 3) continue;

    const rank = parseNum(cells[0] ?? '');
    if (rank == null) continue;

    stocks.push({
      rank,
      company: cells[1] ?? '',
      ticker: cells[2] ?? '',
      mcapCr: cells[3] ? parseNum(cells[3]) : null,
      metric: cells[4] && cells[4] !== '—' ? cells[4] : null,
      reading: cells[5] && cells[5] !== '—' ? cells[5] : null,
      type: cells[6] ?? null,
    });
  }

  return stocks.sort((a, b) => a.rank - b.rank);
}

function parseLens(
  section: string,
  id: CapLensId,
  label: string,
  tierId: CapTierId
): CapTierLens {
  const expectedCount = TIER_LENS_COUNTS[tierId];
  const marker = `#### ${label}`;
  const idx = section.search(new RegExp(`^${marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'im'));
  if (idx < 0) {
    return { id, label, expectedCount, stocks: [] };
  }
  const after = section.slice(idx + marker.length);
  const next = after.search(/^#### /m);
  const lensSection = next >= 0 ? after.slice(0, next) : after;
  return {
    id,
    label,
    expectedCount,
    stocks: parseTableRows(lensSection),
  };
}

function emptyLenses(tierId: CapTierId): CapTierLens[] {
  const n = TIER_LENS_COUNTS[tierId];
  return [
    { id: 'growth', label: 'Growth perspective', expectedCount: n, stocks: [] },
    { id: 'market-cap', label: 'Market cap perspective', expectedCount: n, stocks: [] },
  ];
}

function tierExpectedTotal(lenses: CapTierLens[]): number {
  return lenses.reduce((sum, l) => sum + l.expectedCount, 0);
}

/** Parse `## Cap tier universe` from sector-outlook markdown. */
export function parseCapTierUniverseFromMarkdown(md: string): ParsedCapTierUniverse {
  const body = md.split(/## Cap tier universe/i)[1]?.split(/^## /m)[0] ?? '';
  const tiers: CapTierBlock[] = [];

  for (let i = 0; i < TIER_SPECS.length; i++) {
    const spec = TIER_SPECS[i]!;
    const start = body.search(spec.heading);
    if (start < 0) {
      const lenses = emptyLenses(spec.id);
      tiers.push({
        id: spec.id,
        label: spec.label,
        expectedTotal: tierExpectedTotal(lenses),
        lenses,
      });
      continue;
    }

    const nextHeading = TIER_SPECS[i + 1]?.heading;
    const end = nextHeading ? body.slice(start).search(nextHeading) : -1;
    const tierSection = end > 0 ? body.slice(start, start + end) : body.slice(start);

    const lenses = [
      parseLens(tierSection, 'growth', 'Growth perspective', spec.id),
      parseLens(tierSection, 'market-cap', 'Market cap perspective', spec.id),
    ];

    tiers.push({
      id: spec.id,
      label: spec.label,
      expectedTotal: tierExpectedTotal(lenses),
      lenses,
    });
  }

  const complete = tiers.every((t) =>
    t.lenses.every((l) => l.stocks.length >= l.expectedCount)
  );

  return { tiers, complete };
}
