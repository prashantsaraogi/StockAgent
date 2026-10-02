import {
  SECTOR_SCORE_PARAMETERS,
  computeWeightedTotal,
  type SectorScoreParameter,
} from './sector-score-framework';

export interface ParsedSectorScoreRow {
  parameterId: string;
  parameter: SectorScoreParameter;
  score: number | null;
  reading: string | null;
  type: string | null;
}

export interface ParsedSectorScore {
  rows: ParsedSectorScoreRow[];
  weightedTotal: number | null;
  analysisDate: string | null;
  nextRefreshDue: string | null;
  complete: boolean;
}

function parseNum(raw: string): number | null {
  const n = parseFloat(raw.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function matchParameter(labelCell: string): SectorScoreParameter | undefined {
  const norm = labelCell.toLowerCase().replace(/\*\*/g, '').trim();
  return SECTOR_SCORE_PARAMETERS.find((p) => {
    const pl = p.label.toLowerCase();
    return norm.includes(pl.slice(0, 12)) || pl.includes(norm.slice(0, 12));
  });
}

/** Parse `## Sector score — 6 parameters` table from sector-outlook markdown. */
export function parseSectorScoreFromMarkdown(md: string): ParsedSectorScore {
  const section = md.split(/## Sector score — 6 parameters/i)[1]?.split(/^## /m)[0] ?? '';

  const rows: ParsedSectorScoreRow[] = SECTOR_SCORE_PARAMETERS.map((parameter) => ({
    parameterId: parameter.id,
    parameter,
    score: null,
    reading: null,
    type: null,
  }));

  let weightedTotal: number | null = null;

  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    if (/^\|\s*[-#]/.test(line)) continue;

    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.replace(/\*\*/g, '').trim());
    if (cells.length < 3) continue;

    const first = cells[0];
    if (/weighted total/i.test(cells.join(' '))) {
      const totalCell = cells.find((c) => /^\d/.test(c)) ?? cells[2];
      weightedTotal = parseNum(totalCell ?? '');
      continue;
    }

    const paramCell = cells.length >= 5 ? cells[1] : cells[0];
    const scoreCell = cells.length >= 5 ? cells[2] : cells[1];
    const readingCell = cells.length >= 5 ? cells[4] : cells[3];
    const typeCell = cells.length >= 6 ? cells[5] : null;

    const parameter = matchParameter(paramCell);
    if (!parameter) continue;

    const idx = rows.findIndex((r) => r.parameterId === parameter.id);
    if (idx < 0) continue;

    rows[idx] = {
      ...rows[idx],
      score: parseNum(scoreCell ?? ''),
      reading: readingCell && readingCell !== '—' ? readingCell : null,
      type: typeCell,
    };
  }

  const scores = rows.map((r) => r.score);
  const computed = computeWeightedTotal(scores);
  const complete = scores.every((s) => s != null);

  const dateMatch = md.match(/\*\*Analysis date:\*\*\s*([\d-]+)/i);
  const dueMatch = md.match(/\*\*Next weekly refresh due:\*\*\s*([\d-]+)/i);

  return {
    rows,
    weightedTotal: weightedTotal ?? computed,
    analysisDate: dateMatch?.[1] ?? null,
    nextRefreshDue: dueMatch?.[1] ?? null,
    complete,
  };
}

export function sectorOutlookSlug(path: string): string {
  const name = path.split('/').pop()?.replace('.md', '') ?? 'sector';
  return name.replace(/-sector-outlook$/, '').replace(/-comparative-rank$/, '');
}

export function sectorDisplayLabel(path: string): string {
  const slug = sectorOutlookSlug(path);
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
