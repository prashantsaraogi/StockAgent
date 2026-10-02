'use client';

import { useCallback, useRef, useState } from 'react';
import type { StockSearchResult } from '@/lib/stock-search';

/** Debounced stock search with stale-response guard (NSE calls can be slow). */
export function useStockSearchSuggestions(debounceMs = 200) {
  const [suggestions, setSuggestions] = useState<StockSearchResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seqRef = useRef(0);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  const queueSearch = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      const q = query.trim();
      if (q.length < 1) {
        setSuggestions([]);
        return;
      }

      debounceRef.current = setTimeout(() => {
        const seq = ++seqRef.current;
        void (async () => {
          try {
            const res = await fetch(`/api/holdings/search?q=${encodeURIComponent(q)}`);
            const data = (await res.json()) as { ok?: boolean; results?: StockSearchResult[] };
            if (seq !== seqRef.current) return;
            if (data.ok && data.results) setSuggestions(data.results);
          } catch {
            if (seq === seqRef.current) setSuggestions([]);
          }
        })();
      }, debounceMs);
    },
    [debounceMs]
  );

  return { suggestions, setSuggestions, clearSuggestions, queueSearch };
}
