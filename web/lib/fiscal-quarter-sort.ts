/**
 * Sort Indian FY quarter labels (Qn FYyy) and Tapetide period strings (e.g. "Sep 2026").
 */

export interface FiscalQuarterKey {
  fy: number;
  q: number;
}

const QFY = /Q([1-4])\s*FY\s*(\d{2,4})/i;
const MONTH_YEAR = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i;

const MONTH_NUM: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

export function parseFiscalQuarter(label: string): FiscalQuarterKey | null {
  const qfy = label.match(QFY);
  if (qfy) {
    let fy = parseInt(qfy[2], 10);
    if (fy < 100) fy += fy >= 50 ? 1900 : 2000;
    return { fy, q: parseInt(qfy[1], 10) };
  }

  const my = label.match(MONTH_YEAR);
  if (my) {
    const month = MONTH_NUM[my[1].slice(0, 3).toLowerCase()];
    const year = parseInt(my[2], 10);
    if (!month) return null;
    const fy = month >= 4 ? year + 1 : year;
    const q = month >= 4 ? Math.floor((month - 4) / 3) + 1 : 4;
    return { fy, q };
  }

  return null;
}

export function fiscalQuarterSortKey(label: string): number {
  const p = parseFiscalQuarter(label);
  if (!p) return 0;
  return p.fy * 10 + p.q;
}

export function formatFiscalQuarter(fy: number, q: number): string {
  const yy = fy >= 2000 ? String(fy).slice(-2) : String(fy);
  return `Q${q} FY${yy}`;
}

export function compareFiscalQuarterLabels(a: string, b: string): number {
  return fiscalQuarterSortKey(a) - fiscalQuarterSortKey(b);
}
