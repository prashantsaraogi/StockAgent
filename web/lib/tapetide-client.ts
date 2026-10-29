/**
 * Tapetide REST API — NSE/BSE quarterly P&L, quote (TTM P/E).
 * https://developers.tapetide.com/api/operations/getfinancials/
 * Requires TAPETIDE_TOKEN (Bearer tpt_rt_…).
 */

const TAPETIDE_BASE = 'https://api.tapetide.com/v1';

export interface TapetideQuote {
  symbol: string;
  price: number | null;
  peTtm: number | null;
  updatedAt: string | null;
  asOf: string | null;
}

export interface TapetideQuarterPat {
  period: string;
  patCr: number | null;
  /** When this period became public (ISO date). */
  availableFrom: string | null;
}

export interface TapetideQuarterlyResult {
  quarters: TapetideQuarterPat[];
  asOf: string | null;
  patRowLabel: string | null;
}

function token(): string | null {
  const t = process.env.TAPETIDE_TOKEN?.trim();
  return t && t.length > 0 ? t : null;
}

async function tapetideGet<T>(path: string, query?: Record<string, string>): Promise<T | null> {
  const bearer = token();
  if (!bearer) return null;

  const url = new URL(`${TAPETIDE_BASE}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  }

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${bearer}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(25_000),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: unknown; meta?: { as_of?: string } };
    return json as T;
  } catch {
    return null;
  }
}

const PAT_ROW_PATTERNS = [
  /^profit after tax/i,
  /^net profit/i,
  /^pat\b/i,
  /^profit for the period/i,
  /^profit\/\(loss\) after tax/i,
  /^net profit after tax/i,
];

function pickPatRow(rowOrder: string[], data: Record<string, Record<string, unknown>>): string | null {
  for (const pattern of PAT_ROW_PATTERNS) {
    const hit = rowOrder.find((r) => pattern.test(r.trim()));
    if (hit && data[hit]) return hit;
  }
  for (const key of rowOrder) {
    if (/profit|pat/i.test(key) && /tax|after/i.test(key) && data[key]) return key;
  }
  return null;
}

function numVal(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/,/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

type FinancialsSection = {
  periods?: string[];
  row_order?: string[];
  data?: Record<string, Record<string, number | null>>;
  availability?: { period?: string; available_from?: string }[];
};

/** Latest quarterly consolidated PAT (₹ cr) from Tapetide P&L. */
export async function fetchTapetideQuarterlyPat(
  nseSymbol: string,
  periods = 12
): Promise<TapetideQuarterlyResult | null> {
  const raw = await tapetideGet<{ data?: FinancialsSection | FinancialsSection[]; meta?: { as_of?: string } }>(
    `/stocks/${encodeURIComponent(nseSymbol)}/financials`,
    { section: 'quarterly', periods: String(Math.min(40, Math.max(1, periods))) }
  );
  if (!raw?.data) return null;

  const section = Array.isArray(raw.data) ? raw.data[0] : raw.data;
  if (!section?.periods?.length || !section.data) return null;

  const rowOrder = section.row_order ?? Object.keys(section.data);
  const patRow = pickPatRow(rowOrder, section.data);
  if (!patRow) return null;

  const byPeriod = section.data[patRow] ?? {};
  const availMap = new Map<string, string>();
  for (const a of section.availability ?? []) {
    if (a.period && a.available_from) availMap.set(a.period, a.available_from);
  }

  const quarters: TapetideQuarterPat[] = section.periods.map((period) => ({
    period,
    patCr: numVal(byPeriod[period]),
    availableFrom: availMap.get(period) ?? null,
  }));

  return {
    quarters,
    asOf: raw.meta?.as_of ?? null,
    patRowLabel: patRow,
  };
}

/** Live quote incl. TTM P/E when Tapetide has it. */
export async function fetchTapetideQuote(nseSymbol: string): Promise<TapetideQuote | null> {
  const raw = await tapetideGet<{
    data?: {
      symbol?: string;
      price?: number;
      pe_ttm?: number;
      updated_at?: string;
    };
    meta?: { as_of?: string };
  }>(`/stocks/${encodeURIComponent(nseSymbol)}/quote`);

  if (!raw?.data) return null;
  const d = raw.data;
  return {
    symbol: d.symbol ?? nseSymbol,
    price: numVal(d.price),
    peTtm: numVal(d.pe_ttm),
    updatedAt: d.updated_at ?? null,
    asOf: raw.meta?.as_of ?? null,
  };
}

export function isTapetideConfigured(): boolean {
  return token() != null;
}
