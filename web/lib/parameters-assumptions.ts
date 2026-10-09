/** Part 2 assumption rows in PARAMETERS_*.md (batch + hand-built). */

function cleanCell(raw: string | undefined): string {
  return (raw ?? '').replace(/\*\*/g, '').trim() || '—';
}

export function extractAssumptionBaseCell(
  md: string,
  label: string
): string | null {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rowRe = new RegExp(
    `\\|\\s*(?:\\*\\*)?${escaped}(?:\\*\\*)?[^\\n]*\\|([^|]+)\\|([^|]+)\\|([^|]+)\\|`,
    'i'
  );
  const m = md.match(rowRe);
  if (!m) return null;
  return cleanCell(m[2]);
}

/** EPS CAGR (5Y) base % from Part 2 assumptions or horizon line. */
export function parseParametersEpsCagrBasePct(md: string | null | undefined): number | null {
  if (!md) return null;
  const fromAssumption = extractAssumptionBaseCell(md, 'EPS CAGR (5Y)');
  if (fromAssumption) {
    const n = parseFloat(fromAssumption.replace(/[^\d.]/g, ''));
    if (Number.isFinite(n)) return n;
  }
  const horizonBold = md.match(/EPS CAGR\s*\*\*([\d.]+)\s*%\*\*/i);
  if (horizonBold) {
    const n = parseFloat(horizonBold[1]);
    if (Number.isFinite(n)) return n;
  }
  const horizonPctFirst = md.match(/\*\*([\d.]+)\s*%\*\*\s*EPS CAGR/i);
  if (horizonPctFirst) {
    const n = parseFloat(horizonPctFirst[1]);
    if (Number.isFinite(n)) return n;
  }
  const horizonEmbedded = md.match(/EPS CAGR\s+\*\*([\d.]+)\s*%\*\*/i);
  if (horizonEmbedded) {
    const n = parseFloat(horizonEmbedded[1]);
    if (Number.isFinite(n)) return n;
  }
  const horizonPlain = md.match(/EPS CAGR\s+([\d.]+)\s*%/i);
  if (horizonPlain) {
    const n = parseFloat(horizonPlain[1]);
    if (Number.isFinite(n)) return n;
  }
  return null;
}
