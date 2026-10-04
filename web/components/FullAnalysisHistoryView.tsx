'use client';

import { useMemo } from 'react';
import {
  FullAnalysisHistoryTimeline,
  recordsToHistoryItems,
  type FullAnalysisHistoryListItem,
} from '@/components/FullAnalysisHistoryTimeline';
import { listFullAnalysisSessionCache } from '@/lib/stock-full-analysis-session-cache';
import type { StockCalculatorFullRecord } from '@/lib/stock-calculator-full-history';

function sessionToListItem(cached: ReturnType<typeof listFullAnalysisSessionCache>[number]): FullAnalysisHistoryListItem {
  const a = cached.analysis;
  return {
    id: cached.id,
    createdAt: cached.createdAt,
    stockName: cached.stockName,
    ticker: cached.ticker,
    sector: cached.sector,
    expectedCagrPct: a.inputs.expectedCagrPct,
    years: a.inputs.years,
    cmp: a.cagr.snapshot.cmp ?? null,
    overviewVerdict: a.overview.cagrVerdict,
    sessionOnly: !cached.historyPersisted,
  };
}

interface Props {
  serverEntries: StockCalculatorFullRecord[];
}

export function FullAnalysisHistoryView({ serverEntries }: Props) {
  const items = useMemo(() => {
    const byId = new Map<string, FullAnalysisHistoryListItem>();
    for (const item of recordsToHistoryItems(serverEntries)) {
      byId.set(item.id, item);
    }
    for (const cached of listFullAnalysisSessionCache()) {
      if (!byId.has(cached.id)) {
        byId.set(cached.id, sessionToListItem(cached));
      }
    }
    return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [serverEntries]);

  return (
    <FullAnalysisHistoryTimeline
      items={items}
      emptyMessage="No saved runs yet. Run Basic or Advanced analysis on Analyze — each run appears here. Open a run for all six modules and use Refresh to update quotes."
    />
  );
}
