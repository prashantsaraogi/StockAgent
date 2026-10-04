import { listSectorOutlookFiles, readRepoMarkdown } from '@/lib/content';
import {
  parseSectorScoreFromMarkdown,
  sectorDisplayLabel,
} from '@/lib/sector-score-parser';
import { SECTOR_OUTLOOK_PATHS, sectorLabelFromSlug } from '@/lib/sector-slugs';
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

export async function loadSectorOutlookSummaries(): Promise<{
  outlooks: SectorOutlookSummary[];
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

  return { outlooks, comparativeRanks };
}
