'use client';

import type { StockSearchResult } from '@/lib/stock-search';

interface StockSearchSuggestionsProps {
  suggestions: StockSearchResult[];
  onPick: (stock: StockSearchResult) => void;
}

export function StockSearchSuggestions({ suggestions, onPick }: StockSearchSuggestionsProps) {
  return (
    <ul className="stock-suggestions" role="listbox">
      {suggestions.map((s) => (
        <li key={`${s.ticker}-${s.source}`}>
          <button type="button" onClick={() => onPick(s)}>
            <strong>{s.company}</strong>
            <span className="muted stock-suggestion-meta">
              {s.ticker} · {s.sector}
              {s.inStockBook ? (
                <span className="tag stock-search-book">StockBook</span>
              ) : (
                <span className="tag stock-search-nse">NSE</span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
