import {
  readFullAnalysisSessionCache,
  writeFullAnalysisSessionCache,
  type CachedFullAnalysis,
} from './stock-full-analysis-session-cache';

/** Try server history, then this tab's session cache; backfill Supabase when cache-only. */
export async function loadFullAnalysisEntry(recordId: string): Promise<CachedFullAnalysis | null> {
  try {
    const res = await fetch(
      `/api/stock-calculator/full?recordId=${encodeURIComponent(recordId)}`
    );
    const data = await res.json();
    if (data.ok && data.entry) {
      const e = data.entry as CachedFullAnalysis;
      writeFullAnalysisSessionCache(e);
      return e;
    }
  } catch {
    /* session cache fallback */
  }

  const cached = readFullAnalysisSessionCache(recordId);
  if (cached) {
    void fetch('/api/stock-calculator/full/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry: cached }),
    }).catch(() => {});
    return cached;
  }

  return null;
}
