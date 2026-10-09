/**
 * Yahoo Finance session (cookie + crumb) for quoteSummary — v7 quote is often 401.
 */

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
};

let yahooSession: { cookies: string; crumb: string; expires: number } | null = null;

export async function getYahooFinanceSession(): Promise<{ cookies: string; crumb: string } | null> {
  if (yahooSession && Date.now() < yahooSession.expires) {
    return yahooSession;
  }
  try {
    const cookieRes = await fetch('https://fc.yahoo.com', {
      redirect: 'manual',
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(12000),
    });
    const cookies = (cookieRes.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).join('; ');
    const crumbRes = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
      headers: { ...BROWSER_HEADERS, Cookie: cookies },
      signal: AbortSignal.timeout(12000),
    });
    if (!crumbRes.ok) return null;
    const crumb = (await crumbRes.text()).trim();
    if (!crumb) return null;
    yahooSession = { cookies, crumb, expires: Date.now() + 60 * 60 * 1000 };
    return yahooSession;
  } catch {
    return null;
  }
}

type QuoteSummaryModule = Record<string, unknown>;

/** quoteSummary modules for `{SYMBOL}.NS` — returns first result object or null. */
export async function fetchYahooQuoteSummary(
  nseSymbol: string,
  modules: string
): Promise<QuoteSummaryModule | null> {
  const symbol = `${encodeURIComponent(nseSymbol)}.NS`;
  const session = await getYahooFinanceSession();

  if (session) {
    try {
      const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=${encodeURIComponent(modules)}&crumb=${encodeURIComponent(session.crumb)}`;
      const res = await fetch(url, {
        headers: { ...BROWSER_HEADERS, Cookie: session.cookies },
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        const json = (await res.json()) as { quoteSummary?: { result?: QuoteSummaryModule[] } };
        const hit = json?.quoteSummary?.result?.[0];
        if (hit) return hit;
      }
    } catch {
      /* fall through */
    }
  }

  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=${encodeURIComponent(modules)}`;
    const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(12000) });
    if (!res.ok) return null;
    const json = (await res.json()) as { quoteSummary?: { result?: QuoteSummaryModule[] } };
    return json?.quoteSummary?.result?.[0] ?? null;
  } catch {
    return null;
  }
}

export function rawNum(field: unknown): number | null {
  if (field == null) return null;
  if (typeof field === 'number' && Number.isFinite(field) && field > 0) return field;
  if (typeof field === 'object' && field !== null && 'raw' in field) {
    const raw = (field as { raw?: unknown }).raw;
    if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw;
  }
  return null;
}

/** Trailing P/E and EPS for NSE symbol from Yahoo quoteSummary. */
export async function fetchYahooTrailingPeMetrics(
  nseSymbol: string
): Promise<{ trailingPe: number | null; trailingEps: number | null }> {
  const summary = await fetchYahooQuoteSummary(
    nseSymbol,
    'summaryDetail,defaultKeyStatistics,financialData'
  );
  if (!summary) return { trailingPe: null, trailingEps: null };

  const detail = summary.summaryDetail as Record<string, unknown> | undefined;
  const stats = summary.defaultKeyStatistics as Record<string, unknown> | undefined;
  const financial = summary.financialData as Record<string, unknown> | undefined;

  const trailingEps = rawNum(stats?.trailingEps) ?? rawNum(financial?.epsTrailingTwelveMonths);
  let trailingPe =
    rawNum(detail?.trailingPE) ??
    rawNum(stats?.trailingPE) ??
    rawNum(financial?.trailingPE);

  const price =
    rawNum(detail?.regularMarketPrice) ??
    rawNum((summary.price as Record<string, unknown> | undefined)?.regularMarketPrice);

  if (trailingPe == null && price != null && trailingEps != null) {
    trailingPe = Math.round((price / trailingEps) * 10) / 10;
  }

  return { trailingPe, trailingEps };
}
