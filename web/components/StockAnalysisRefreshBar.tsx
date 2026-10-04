'use client';

import { useState } from 'react';
import type { StockCalculatorFullInputs } from '@/lib/stock-calculator-full';
import { writeFullAnalysisSessionCache } from '@/lib/stock-full-analysis-session-cache';

interface StockAnalysisRefreshBarProps {
  recordId: string;
  ticker: string;
  stockName: string;
  inputs: StockCalculatorFullInputs;
  basicAnalysis: boolean;
  savedAt: string;
  purchasePrice?: number | null;
  purchaseDate?: string | null;
}

export function StockAnalysisRefreshBar({
  recordId,
  ticker,
  inputs,
  basicAnalysis,
  savedAt,
  purchasePrice,
  purchaseDate,
}: StockAnalysisRefreshBarProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const when = new Date(savedAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  async function refresh() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/stock-calculator/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker,
          stockQuery: ticker,
          refreshRecordId: recordId,
          analysisMode: basicAnalysis ? 'basic' : 'advanced',
          basicAnalysis,
          peBasis: inputs.peBasis,
          expectedCagrPct: inputs.expectedCagrPct,
          years: inputs.years,
          manualPeOverride: inputs.manualPeOverride ?? undefined,
          investmentAmountInr: inputs.investmentAmountInr ?? undefined,
          purchasePrice: purchasePrice ?? inputs.purchasePrice ?? undefined,
          purchaseDate: purchaseDate ?? inputs.purchaseDate ?? undefined,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? 'Refresh failed');
        return;
      }
      if (data.record?.id && data.analysis) {
        writeFullAnalysisSessionCache({
          id: data.record.id,
          createdAt: data.record.createdAt,
          ticker: data.analysis.ticker,
          stockName: data.analysis.stockName,
          sector: data.analysis.sector,
          childIds: data.record.childIds,
          analysis: data.analysis,
          historyPersisted: data.historyPersisted,
        });
      }
      window.location.reload();
    } catch {
      setError('Network error — try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card wide stock-analysis-saved-bar">
      <div className="stock-analysis-saved-bar-inner">
        <p className="muted small">
          Saved to your history · last run <strong>{when}</strong> IST
        </p>
        <button type="button" className="btn-secondary" onClick={refresh} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh with latest data'}
        </button>
      </div>
      {error && <p className="form-error small">{error}</p>}
    </div>
  );
}
