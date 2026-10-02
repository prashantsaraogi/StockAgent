'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  SERVICE_CATEGORIES,
  cadenceLabel,
  channelLabel,
  type AgentService,
  type ServiceCategory,
} from '@/lib/services-catalog';
import { MARKET_DATA_GRAPH, getDownstreamLabels } from '@/lib/market-data-deps';
import type { ServicesStatus } from '@/lib/services-status';

interface ServicesPanelProps {
  initialStatus: ServicesStatus;
}

interface RunState {
  serviceId: string;
  loading: boolean;
  result?: {
    ok: boolean;
    summary?: string;
    error?: string;
    newsWebPath?: string;
    steps?: { action: string; ok: boolean; summary: string; error?: string }[];
  };
}

function channelClass(ch: 'web' | 'cursor' | 'both' | undefined): string {
  switch (ch) {
    case 'web':
      return 'service-channel-web';
    case 'cursor':
      return 'service-channel-cursor';
    default:
      return 'service-channel-both';
  }
}

function statusLine(service: AgentService, status: ServicesStatus): string | null {
  switch (service.statusField) {
    case 'sectorMcap': {
      const s = status.sectorMcap;
      if (!s.lastRefreshed) return 'Mcap not refreshed yet';
      const stale =
        s.staleSectors.length > 0
          ? ` · ${s.staleSectors.length} sector${s.staleSectors.length !== 1 ? 's' : ''} stale (>7d)`
          : '';
      return `Last mcap refresh: ${s.lastRefreshed} (${s.sectorsWithStamp}/${s.sectorsTotal} sectors)${stale}`;
    }
    case 'latestNews': {
      const n = status.latestNews;
      if (!n.latestDate) return 'No news summaries yet';
      const ago =
        n.daysSinceLatest === 0
          ? 'today'
          : n.daysSinceLatest === 1
            ? 'yesterday'
            : `${n.daysSinceLatest} days ago`;
      return `Latest: ${n.latestDate} (${ago}) · ${n.totalDays} days archived`;
    }
    case 'sectorScores': {
      const sc = status.sectorScores;
      const due = sc.nextRefreshDue ? ` · next due ${sc.nextRefreshDue}` : '';
      return `${sc.scoredCount}/${sc.totalSectors} sectors scored · analysis ${sc.newestAnalysisDate ?? '—'}${due}`;
    }
    case 'portfolioCmp':
      return status.portfolioCmp.note;
    case 'cmpCache': {
      const c = status.cmpCache;
      if (!c.lastRefreshed) return 'StockBook CMP cache empty — run Update CMP';
      const stale = c.stale ? ' · stale (>1d)' : '';
      return `StockBook CMP: ${c.lastRefreshed} · ${c.tickerCount} tickers${stale}`;
    }
    case 'quarterResults':
      return `${status.quarterResults.expectedQuarter} — ${status.quarterResults.note}`;
    case 'brokerTargets': {
      const b = status.brokerTargets;
      if (!b.asOf) return b.note;
      const days =
        b.daysSinceRefresh === 0
          ? 'today'
          : b.daysSinceRefresh === 1
            ? 'yesterday'
            : `${b.daysSinceRefresh}d ago`;
      return `Broker summary: ${b.asOf} (${days})`;
    }
    default:
      return null;
  }
}

function ServiceCard({
  service,
  status,
  runState,
  copiedId,
  onRun,
  onCopy,
}: {
  service: AgentService;
  status: ServicesStatus;
  runState: RunState | null;
  copiedId: string | null;
  onRun: (service: AgentService) => void;
  onCopy: (id: string, text: string) => void;
}) {
  const statusText = statusLine(service, status);
  const isRunning = runState?.serviceId === service.id && runState.loading;
  const runResult = runState?.serviceId === service.id ? runState.result : undefined;

  return (
    <article className="card service-card">
      <div className="service-card-head">
        <div>
          <h3>{service.title}</h3>
          <div className="service-meta">
            <span className="tag service-cadence">{cadenceLabel(service.cadence)}</span>
            {service.channel && (
              <span className={`tag ${channelClass(service.channel)}`}>
                {channelLabel(service.channel)}
              </span>
            )}
            {service.estimatedDuration && (
              <span className="muted small">{service.estimatedDuration}</span>
            )}
          </div>
        </div>
      </div>

      <p className="muted small service-desc">{service.description}</p>

      {statusText && <p className="service-status muted small">{statusText}</p>}

      {service.prompt && service.prompt.length > 0 && (
        <pre className="service-prompt-preview">
          {service.prompt.length > 280 ? `${service.prompt.slice(0, 280)}…` : service.prompt}
        </pre>
      )}

      <div className="service-actions">
        {service.actionType === 'api' && service.apiAction && (
          <button
            type="button"
            className="btn-primary"
            disabled={isRunning}
            onClick={() => onRun(service)}
          >
            {isRunning ? 'Running…' : 'Run now'}
          </button>
        )}

        {service.actionType === 'prompt' && service.prompt && (
          <>
            <button
              type="button"
              className="btn-primary"
              onClick={() => onCopy(service.id, service.prompt!)}
            >
              {copiedId === service.id ? 'Copied ✓' : 'Copy prompt'}
            </button>
            <Link href="/chat" className="btn-ghost service-chat-link">
              Ask Agent →
            </Link>
          </>
        )}

        {service.actionType === 'link' && service.href && (
          <Link href={service.href} className="btn-primary">
            {service.hrefLabel ?? 'Open'}
          </Link>
        )}

        {service.actionType === 'info' && (
          <span className="muted small">See dependency map below ↓</span>
        )}

        {service.href && service.actionType !== 'link' && (
          <Link href={service.href} className="card-link">
            {service.hrefLabel ?? 'View'} →
          </Link>
        )}
      </div>

      {runResult && (
        <div className={`service-run-result ${runResult.ok ? 'ok' : 'err'}`}>
          {runResult.ok ? (
            <>
              <strong>Done.</strong> {runResult.summary}
              {runResult.newsWebPath && (
                <>
                  {' '}
                  <Link href={runResult.newsWebPath}>View news →</Link>
                </>
              )}
              {runResult.steps && runResult.steps.length > 0 && (
                <ul className="service-pack-steps">
                  {runResult.steps.map((step) => (
                    <li key={step.action} className={step.ok ? 'ok' : 'err'}>
                      <strong>{step.action}:</strong> {step.ok ? step.summary : step.error}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <strong>Failed.</strong> {runResult.error}
              {runResult.steps && (
                <ul className="service-pack-steps">
                  {runResult.steps.map((step) => (
                    <li key={step.action} className={step.ok ? 'ok' : 'err'}>
                      <strong>{step.action}:</strong> {step.ok ? step.summary : step.error}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </article>
  );
}

export function ServicesPanel({ initialStatus }: ServicesPanelProps) {
  const [status, setStatus] = useState(initialStatus);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [runState, setRunState] = useState<RunState | null>(null);
  const [packRunning, setPackRunning] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SERVICE_CATEGORIES.map((cat) => ({
      ...cat,
      services: cat.services.filter((s) => {
        if (activeCategory !== 'all' && cat.id !== activeCategory) return false;
        if (!q) return true;
        return (
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          (s.prompt?.toLowerCase().includes(q) ?? false)
        );
      }),
    })).filter((cat) => cat.services.length > 0);
  }, [activeCategory, query]);

  const totalCount = filtered.reduce((n, c) => n + c.services.length, 0);

  async function copyPrompt(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* ignore */
    }
  }

  async function runService(service: AgentService) {
    if (!service.apiAction) return;
    setRunState({ serviceId: service.id, loading: true });
    try {
      const res = await fetch('/api/services/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: service.apiAction }),
      });
      const data = await res.json();
      if (data.status) setStatus(data.status);
      setRunState({
        serviceId: service.id,
        loading: false,
        result: data.ok
          ? {
              ok: true,
              summary: data.summary,
              newsWebPath: data.newsWebPath,
              steps: data.steps,
            }
          : {
              ok: false,
              error: data.error ?? 'Unknown error',
              steps: data.steps,
            },
      });
    } catch {
      setRunState({
        serviceId: service.id,
        loading: false,
        result: { ok: false, error: 'Network error' },
      });
    }
  }

  async function runPack(action: 'run-daily-market-pack' | 'run-all-automated', label: string) {
    setPackRunning(action);
    setRunState({ serviceId: action, loading: true });
    try {
      const res = await fetch('/api/services/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.status) setStatus(data.status);
      setRunState({
        serviceId: action,
        loading: false,
        result: {
          ok: data.ok,
          summary: data.summary ?? label,
          error: data.error,
          newsWebPath: data.newsWebPath,
          steps: data.steps,
        },
      });
    } catch {
      setRunState({
        serviceId: action,
        loading: false,
        result: { ok: false, error: 'Network error' },
      });
    } finally {
      setPackRunning(null);
    }
  }

  return (
    <div className="services-panel">
      <div className="card wide services-intro">
        <p>
          Central hub for <strong>daily and weekly data maintenance</strong> — one-click refresh
          jobs (market cap, news) and copy-paste prompts for sector scores, ground reality, and
          portfolio workflows.
        </p>
        <ul className="services-legend muted small">
          <li>
            <span className="tag service-action-api">Run now</span> — writes to StockBook / News on
            disk
          </li>
          <li>
            <span className="tag service-action-prompt">Copy prompt</span> — paste in Ask Agent or
            Cursor
          </li>
          <li>
            <span className="tag service-cadence">Cadence</span> — suggested refresh frequency
          </li>
        </ul>
        <p className="muted small">
          Status checked {new Date(status.checkedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}{' '}
          IST · {status.scheduledRun.note}
        </p>
        <div className="services-pack-actions">
          <button
            type="button"
            className="btn-primary"
            disabled={!!packRunning}
            onClick={() => runPack('run-daily-market-pack', 'Daily market pack')}
          >
            {packRunning === 'run-daily-market-pack' ? 'Running daily pack…' : 'Run daily market pack'}
          </button>
          <button
            type="button"
            className="btn-ghost"
            disabled={!!packRunning}
            onClick={() => runPack('run-all-automated', 'All automated')}
          >
            {packRunning === 'run-all-automated' ? 'Running all…' : 'Run all automated'}
          </button>
        </div>
      </div>

      <div className="card wide services-deps">
        <h2>Market data dependency map</h2>
        <p className="muted small">
          CMP and quarterly results are inputs — P/E, CAGR, broker upside, and PCCL are derived.
          Run upstream services first.
        </p>
        <div className="services-deps-table-wrap">
          <table className="services-deps-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Cadence</th>
                <th>Updates</th>
                <th>Service</th>
              </tr>
            </thead>
            <tbody>
              {MARKET_DATA_GRAPH.map((node) => (
                <tr key={node.id}>
                  <td>
                    <strong>{node.label}</strong>
                    {node.downstream.length > 0 && (
                      <div className="muted small">
                        → {getDownstreamLabels(node.id).join(', ')}
                      </div>
                    )}
                  </td>
                  <td>{node.cadence}</td>
                  <td className="muted small">{node.artifacts.slice(0, 2).join(' · ')}</td>
                  <td>
                    <code>{node.serviceId}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="services-status-strip card wide">
        <div className="services-status-item">
          <span className="services-status-label">News</span>
          <strong>{status.latestNews.latestDate ?? '—'}</strong>
          <span className="muted small">{status.latestNews.totalDays} days</span>
        </div>
        <div className="services-status-item">
          <span className="services-status-label">Sector mcap</span>
          <strong>{status.sectorMcap.lastRefreshed ?? '—'}</strong>
          <span className="muted small">
            {status.sectorMcap.sectorsWithStamp}/{status.sectorMcap.sectorsTotal} sectors
          </span>
        </div>
        <div className="services-status-item">
          <span className="services-status-label">Sector scores</span>
          <strong>
            {status.sectorScores.scoredCount}/{status.sectorScores.totalSectors}
          </strong>
          <span className="muted small">{status.sectorScores.newestAnalysisDate ?? '—'}</span>
        </div>
        <div className="services-status-item">
          <span className="services-status-label">StockBook CMP</span>
          <strong>{status.cmpCache.lastRefreshed ?? '—'}</strong>
          <span className="muted small">{status.cmpCache.tickerCount} tickers</span>
        </div>
        <div className="services-status-item">
          <span className="services-status-label">Results</span>
          <strong>{status.quarterResults.expectedQuarter}</strong>
          <span className="muted small">scan daily</span>
        </div>
        <div className="services-status-item">
          <span className="services-status-label">Morning cron</span>
          <strong>{status.scheduledRun.lastRunAt?.slice(0, 10) ?? '—'}</strong>
          <span className="muted small">
            {status.scheduledRun.lastOk === true
              ? 'OK'
              : status.scheduledRun.lastOk === false
                ? 'failed'
                : 'not run'}
            {status.scheduledRun.lastTrigger ? ` · ${status.scheduledRun.lastTrigger}` : ''}
          </span>
        </div>
      </div>

      <div className="services-toolbar">
        <input
          type="search"
          className="services-search"
          placeholder="Search services…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search services"
        />
        <div className="services-category-pills">
          <button
            type="button"
            className={`services-pill ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`services-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <p className="muted small services-count">
        <strong>{totalCount}</strong> service{totalCount !== 1 ? 's' : ''} shown
      </p>

      {filtered.map((cat: ServiceCategory) => (
        <section key={cat.id} className="services-category-block">
          <header className="services-category-head">
            <h2>{cat.label}</h2>
            <p className="muted small">{cat.description}</p>
          </header>
          <div className="services-card-grid">
            {cat.services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                status={status}
                runState={runState}
                copiedId={copiedId}
                onRun={runService}
                onCopy={copyPrompt}
              />
            ))}
          </div>
        </section>
      ))}

      {totalCount === 0 && (
        <p className="muted">No services match your search — try another category.</p>
      )}

      <section className="card wide services-related">
        <h2>Related</h2>
        <div className="services-related-links">
          <Link href="/chat/prompts">Prompt Guidelines</Link>
          <Link href="/industry-analysis">Industry Growth</Link>
          <Link href="/journal/news">Daily News</Link>
          <Link href="/journal/analysis">Analysis Log</Link>
          <Link href="/chat">Ask Agent</Link>
        </div>
      </section>
    </div>
  );
}
