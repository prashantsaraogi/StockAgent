'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatCagr, gainClass } from '@/lib/format-gain';
import { cmpSourceLabel } from '@/lib/cmp-labels';
import type { CmpSource } from '@/lib/cmp-labels';
import { notifyPortfolioHoldingsChanged } from '@/lib/portfolio-events';

export interface LotRow {
  id: string;
  ticker: string;
  company: string;
  sector: string;
  qty: number;
  price: number;
  purchaseDate: string;
  costBasis: number;
  cmp: number | null;
  cmpSource: CmpSource | null;
  cmpAsOf: string | null;
  cagrPct: number | null;
  simpleReturnPct: number | null;
  holdingYears: number | null;
  legacy?: boolean;
}

interface HoldingsLotsTableProps {
  lots: LotRow[];
  summaryCount: number;
}

export function HoldingsLotsTable({ lots, summaryCount }: HoldingsLotsTableProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    stockName: '',
    qty: '',
    price: '',
    purchaseDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function startEdit(lot: LotRow) {
    setEditingId(lot.id);
    setForm({
      stockName: lot.ticker,
      qty: String(lot.qty),
      price: String(lot.price),
      purchaseDate: lot.purchaseDate,
    });
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setError('');
  }

  async function saveEdit(lotId: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/holdings/${lotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockName: form.stockName,
          qty: Number(form.qty),
          price: Number(form.price),
          purchaseDate: form.purchaseDate,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? 'Update failed');
        return;
      }
      setEditingId(null);
      notifyPortfolioHoldingsChanged();
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function removeLot(lotId: string, label: string) {
    if (!confirm(`Delete lot: ${label}? This cannot be undone.`)) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/holdings/${lotId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? 'Delete failed');
        return;
      }
      if (editingId === lotId) setEditingId(null);
      notifyPortfolioHoldingsChanged();
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  if (lots.length === 0) {
    return (
      <p className="muted">No holdings yet. Use the form above to add your first purchase lot.</p>
    );
  }

  return (
    <>
      <p className="muted small lots-intro">
        <strong>{lots.length}</strong> purchase lot{lots.length !== 1 ? 's' : ''} across{' '}
        <strong>{summaryCount}</strong> ticker{summaryCount !== 1 ? 's' : ''}. CMP fetched live
        from <strong>NSE</strong> on each page load (5 min cache). Gain &amp; CAGR use NSE LTP.
      </p>

      {error && <p className="form-error">{error}</p>}

      <div className="holdings-table-wrap">
        <table className="holdings-table lots-table">
          <thead>
            <tr>
              <th>Purchase date</th>
              <th>Ticker</th>
              <th>Company</th>
              <th>Sector</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Cost</th>
              <th>CMP</th>
              <th>CAGR</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {lots.map((lot) =>
              editingId === lot.id ? (
                <tr key={lot.id} className="edit-row">
                  <td>
                    <input
                      type="date"
                      value={form.purchaseDate}
                      onChange={(e) => setForm((f) => ({ ...f, purchaseDate: e.target.value }))}
                      className="table-input"
                    />
                  </td>
                  <td colSpan={2}>
                    <input
                      type="text"
                      value={form.stockName}
                      onChange={(e) => setForm((f) => ({ ...f, stockName: e.target.value }))}
                      className="table-input"
                      placeholder="Ticker e.g. CIPLA"
                    />
                  </td>
                  <td>
                    <span className="tag">{lot.sector}</span>
                  </td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      value={form.qty}
                      onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
                      className="table-input narrow"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      className="table-input narrow"
                    />
                  </td>
                  <td colSpan={3} className="edit-actions">
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      disabled={loading}
                      onClick={() => saveEdit(lot.id)}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      disabled={loading}
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={lot.id} className={lot.legacy ? 'legacy-lot' : undefined}>
                  <td>
                    {lot.purchaseDate}
                    {lot.legacy && (
                      <span className="tag warn" title="Imported — edit date if needed">
                        legacy
                      </span>
                    )}
                  </td>
                  <td>
                    <strong>{lot.ticker}</strong>
                  </td>
                  <td>{lot.company}</td>
                  <td>
                    <span className="tag">{lot.sector}</span>
                  </td>
                  <td>{lot.qty}</td>
                  <td>₹{lot.price.toLocaleString('en-IN')}</td>
                  <td>₹{lot.costBasis.toLocaleString('en-IN')}</td>
                  <td title={lot.cmpSource ? cmpSourceLabel(lot.cmpSource) : undefined}>
                    {lot.cmp != null ? `₹${lot.cmp.toLocaleString('en-IN')}` : '—'}
                    {lot.cmpSource && lot.cmpSource !== 'stockbook' && (
                      <span className="tag ok small-tag">NSE</span>
                    )}
                  </td>
                  <td
                    className={
                      lot.cagrPct != null
                        ? lot.cagrPct >= 0
                          ? 'cagr-pos'
                          : 'cagr-neg'
                        : undefined
                    }
                  >
                    {formatCagr(lot.cagrPct)}
                  </td>
                  <td className="row-actions">
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      disabled={loading}
                      onClick={() => startEdit(lot)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-ghost btn-sm danger"
                      disabled={loading}
                      onClick={() =>
                        removeLot(
                          lot.id,
                          `${lot.qty} × ${lot.ticker} @ ₹${lot.price} (${lot.purchaseDate})`
                        )
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <section className="card inner-summary">
        <h4>Summary by ticker (aggregated)</h4>
        <p className="muted small">
          Dashboard and Ask Agent use aggregated qty and blended avg cost. CAGR uses each lot row
          above.
        </p>
      </section>
    </>
  );
}
