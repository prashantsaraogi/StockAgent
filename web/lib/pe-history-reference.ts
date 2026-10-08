/**
 * 10Y P/E history reference — prefer median when PARAMETERS / FY table provides it.
 */

export type Pe10yReferenceKind = 'median' | 'avg';

export interface Pe10yReference {
  value: number | null;
  kind: Pe10yReferenceKind;
}

export function resolve10yPeReference(pe: {
  avg10yPe: number | null;
  median10yPe?: number | null;
}): Pe10yReference {
  if (pe.median10yPe != null && pe.median10yPe > 0) {
    return { value: pe.median10yPe, kind: 'median' };
  }
  if (pe.avg10yPe != null && pe.avg10yPe > 0) {
    return { value: pe.avg10yPe, kind: 'avg' };
  }
  return { value: null, kind: 'avg' };
}

export function label10yPe(kind: Pe10yReferenceKind): string {
  return kind === 'median' ? '10Y median P/E' : '10Y avg P/E';
}

export function parseYearlyPeSeriesFromParameters(md: string): number[] {
  const block = md.match(/\|\s*FY\s*\|[^\n]+\|\s*\n\|\s*[-|:\s]+\|\s*\n((?:\|[^\n]+\n)+)/i);
  if (!block) return [];

  const headerLine = block[0].split('\n')[0] ?? '';
  const parts = headerLine.split('|').map((c) =>
    c
      .trim()
      .replace(/\*+/g, '')
      .toLowerCase()
  );
  const peIdx = parts.findIndex((c) => c === 'p/e' || c.startsWith('p/e'));
  if (peIdx < 0) return [];

  const out: number[] = [];
  for (const line of block[1].trim().split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').map((c) => c.trim());
    const fy = (cells[1] ?? '').replace(/\*+/g, '');
    if (fy === '2020' || fy === '2021') continue;

    const raw = cells[peIdx]?.replace(/,/g, '').match(/([\d.]+)/)?.[1];
    if (!raw) continue;
    const n = parseFloat(raw);
    if (Number.isFinite(n) && n > 0 && n < 500) out.push(n);
  }
  return out;
}

function medianOf(values: number[]): number | null {
  if (values.length < 3) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  const med = s.length % 2 === 1 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  return Math.round(med * 10) / 10;
}

/** Explicit median in StockBook text, or median of FY P/E column (excl. FY2020–21). */
export function parseMedian10yPeFromMd(md: string): number | null {
  const explicit =
    md.match(/10Y\s+median[^|\n]{0,80}?\~?\s*\*\*([\d.]+)\s*[×x]\*\*/i) ??
    md.match(/\|\s*\*\*10Y median P\/E\*\*[^\n]*\|\s*\*\*([\d.]+)\s*[×x]\*\*/i) ??
    md.match(/median\s+P\/E[^|\n]{0,50}?\*\*([\d.]+)\s*[×x]\*\*/i);
  if (explicit) {
    const n = parseFloat(explicit[1]);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return medianOf(parseYearlyPeSeriesFromParameters(md));
}
