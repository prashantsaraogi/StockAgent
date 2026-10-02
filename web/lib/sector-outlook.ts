import { listSectorOutlookFiles, readRepoMarkdown } from '@/lib/content';
import {
  parseSectorScoreFromMarkdown,
  sectorDisplayLabel,
} from '@/lib/sector-score-parser';

export interface SectorOutlookSummary {
  path: string;
  label: string;
  score: ReturnType<typeof parseSectorScoreFromMarkdown>;
}

export async function loadSectorOutlookSummaries(): Promise<{
  outlooks: SectorOutlookSummary[];
  comparativeRanks: { path: string; label: string }[];
}> {
  const files = await listSectorOutlookFiles();
  const outlooks: SectorOutlookSummary[] = [];
  const comparativeRanks: { path: string; label: string }[] = [];

  for (const f of files) {
    if (f.path.includes('-comparative-rank.md')) {
      comparativeRanks.push({ path: f.path, label: sectorDisplayLabel(f.path) });
      continue;
    }
    if (!f.path.includes('-sector-outlook.md')) continue;

    const md = (await readRepoMarkdown(f.path)) ?? '';
    outlooks.push({
      path: f.path,
      label: sectorDisplayLabel(f.path),
      score: parseSectorScoreFromMarkdown(md),
    });
  }

  outlooks.sort((a, b) => {
    const at = a.score.weightedTotal ?? -1;
    const bt = b.score.weightedTotal ?? -1;
    return bt - at;
  });

  return { outlooks, comparativeRanks };
}
