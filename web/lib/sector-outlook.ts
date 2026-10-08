import { listSectorOutlookFiles, readRepoMarkdown } from '@/lib/content';
import {
  parseSectorScoreFromMarkdown,
  sectorDisplayLabel,
} from '@/lib/sector-score-parser';
import {
  allIndustryGroupedSlugs,
  INDUSTRY_SECTOR_GROUPS,
  type IndustrySectorGroupDef,
} from '@/lib/industry-sector-groups';
import { scoreTo100 } from '@/lib/sector-score-framework';
import { SECTOR_OUTLOOK_PATHS, sectorLabelFromSlug } from '@/lib/sector-slugs';

export type IndustryGroupViewModel = {
  def: IndustrySectorGroupDef;
  cards: SectorOutlookSummary[];
  bestScore100: number | null;
};
import {
  getBundledSectorOutlookMd,
  listBundledComparativeRankPaths,
} from '@/lib/load-bundled-sector-outlook';

export interface SectorOutlookSummary {
  path: string;
  slug: string;
  label: string;
  score: ReturnType<typeof parseSectorScoreFromMarkdown>;
}

async function readOutlookMarkdown(relativePath: string): Promise<string> {
  return (await readRepoMarkdown(relativePath)) ?? getBundledSectorOutlookMd(relativePath) ?? '';
}

function buildIndustryGroupViews(
  bySlug: Map<string, SectorOutlookSummary>
): IndustryGroupViewModel[] {
  const views: IndustryGroupViewModel[] = [];

  for (const def of INDUSTRY_SECTOR_GROUPS) {
    const cards: SectorOutlookSummary[] = [];
    for (const member of def.members) {
      const row = bySlug.get(member.slug);
      if (!row) continue;
      cards.push({
        ...row,
        label: member.cardLabel ?? row.label,
      });
    }
    if (cards.length === 0) continue;

    const scores100 = cards
      .map((c) => scoreTo100(c.score.weightedTotal))
      .filter((n): n is number => n != null);
    const bestScore100 = scores100.length > 0 ? Math.max(...scores100) : null;

    views.push({ def, cards, bestScore100 });
  }

  views.sort((a, b) => (b.bestScore100 ?? -1) - (a.bestScore100 ?? -1));
  return views;
}

export async function loadSectorOutlookSummaries(): Promise<{
  industryGroups: IndustryGroupViewModel[];
  standaloneOutlooks: SectorOutlookSummary[];
  comparativeRanks: { path: string; label: string }[];
}> {
  const outlooks: SectorOutlookSummary[] = [];
  const seenPaths = new Set<string>();

  for (const [slug, relPath] of Object.entries(SECTOR_OUTLOOK_PATHS)) {
    const md = await readOutlookMarkdown(relPath);
    seenPaths.add(relPath);
    outlooks.push({
      path: relPath,
      slug,
      label: sectorLabelFromSlug(slug),
      score: parseSectorScoreFromMarkdown(md),
    });
  }

  const files = await listSectorOutlookFiles();
  for (const f of files) {
    if (!f.path.includes('-sector-outlook.md') || seenPaths.has(f.path)) continue;
    const md = await readOutlookMarkdown(f.path);
    outlooks.push({
      path: f.path,
      slug: f.path.split('/').pop()?.replace('-sector-outlook.md', '') ?? f.name,
      label: sectorDisplayLabel(f.path),
      score: parseSectorScoreFromMarkdown(md),
    });
  }

  outlooks.sort((a, b) => {
    const at = a.score.weightedTotal ?? -1;
    const bt = b.score.weightedTotal ?? -1;
    return bt - at;
  });

  const groupedSlugs = allIndustryGroupedSlugs();
  const bySlug = new Map(outlooks.map((o) => [o.slug, o]));
  const industryGroups = buildIndustryGroupViews(bySlug);
  const standaloneOutlooks = outlooks.filter((o) => !groupedSlugs.has(o.slug));

  const comparativeRanks: { path: string; label: string }[] = [];
  const rankPaths = new Set<string>();

  for (const f of files) {
    if (!f.path.includes('-comparative-rank.md')) continue;
    rankPaths.add(f.path);
    comparativeRanks.push({ path: f.path, label: sectorDisplayLabel(f.path) });
  }
  for (const p of listBundledComparativeRankPaths()) {
    if (rankPaths.has(p)) continue;
    rankPaths.add(p);
    comparativeRanks.push({ path: p, label: sectorDisplayLabel(p) });
  }
  comparativeRanks.sort((a, b) => a.label.localeCompare(b.label));

  return { industryGroups, standaloneOutlooks, comparativeRanks };
}
