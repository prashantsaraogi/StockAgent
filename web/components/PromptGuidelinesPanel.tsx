'use client';

import { useMemo, useState } from 'react';
import {
  PROMPT_CATEGORIES,
  channelLabel,
  type PromptChannel,
} from '@/lib/agent/prompt-guidelines';

function channelClass(ch: PromptChannel): string {
  switch (ch) {
    case 'web':
      return 'prompt-channel-web';
    case 'cursor':
      return 'prompt-channel-cursor';
    default:
      return 'prompt-channel-both';
  }
}

export function PromptGuidelinesPanel() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROMPT_CATEGORIES.map((cat) => ({
      ...cat,
      prompts: cat.prompts.filter((p) => {
        if (activeCategory !== 'all' && cat.id !== activeCategory) return false;
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.prompt.toLowerCase().includes(q) ||
          p.framework.some((f) => f.toLowerCase().includes(q))
        );
      }),
    })).filter((cat) => cat.prompts.length > 0);
  }, [activeCategory, query]);

  const totalCount = filtered.reduce((n, c) => n + c.prompts.length, 0);

  async function copyPrompt(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* fallback ignored */
    }
  }

  return (
    <div className="prompt-guidelines">
      <div className="prompt-guidelines-intro card wide">
        <p>
          Copy-paste prompts for stock analysis, portfolio, and news workflows.
          Ask Agent uses the same discipline as Stock Analysis — not generic stock chat.
        </p>
        <ul className="prompt-legend muted small">
          <li>
            <span className="tag prompt-channel-web">Web Ask Agent</span> — works in this web app
          </li>
          <li>
            <span className="tag prompt-channel-both">Web + Cursor</span> — web Q&amp;A; full
            file write-back in Cursor
          </li>
          <li>
            <span className="tag prompt-channel-cursor">Cursor only</span> — scripts, StockBook
            writes, morning run
          </li>
        </ul>
        <p className="muted small">
          Replace <code>{'{TICKER}'}</code>, <code>{'{DATE}'}</code>, etc. before sending. Buy/add
          prompts run full discipline checks and a quotes lens.
        </p>
      </div>

      <div className="prompt-toolbar">
        <input
          type="search"
          className="prompt-search"
          placeholder="Search prompts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search prompts"
        />
        <div className="prompt-category-pills">
          <button
            type="button"
            className={`prompt-pill ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {PROMPT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`prompt-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <p className="muted small prompt-count">
        <strong>{totalCount}</strong> prompt{totalCount !== 1 ? 's' : ''} shown
      </p>

      {filtered.map((cat) => (
        <section key={cat.id} className="prompt-category-block">
          <header className="prompt-category-head">
            <h2>{cat.label}</h2>
            <p className="muted small">{cat.description}</p>
          </header>

          <div className="prompt-card-grid">
            {cat.prompts.map((p) => (
              <article key={p.id} className="card prompt-card">
                <div className="prompt-card-head">
                  <h3>{p.title}</h3>
                  <span className={`tag ${channelClass(p.channel)}`}>
                    {channelLabel(p.channel)}
                  </span>
                </div>
                <p className="muted small prompt-card-desc">{p.description}</p>
                {p.placeholders && p.placeholders.length > 0 && (
                  <p className="prompt-placeholders muted small">
                    Placeholders:{' '}
                    {p.placeholders.map((ph) => (
                      <code key={ph}>{ph}</code>
                    ))}
                  </p>
                )}
                <pre className="prompt-text">{p.prompt}</pre>
                <button
                  type="button"
                  className="btn-primary prompt-copy-btn"
                  onClick={() => copyPrompt(p.id, p.prompt)}
                >
                  {copiedId === p.id ? 'Copied ✓' : 'Copy prompt'}
                </button>
              </article>
            ))}
          </div>
        </section>
      ))}

      {totalCount === 0 && (
        <p className="muted">No prompts match your search — try another category or keyword.</p>
      )}
    </div>
  );
}
