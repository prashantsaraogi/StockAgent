'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SummarySlide } from '@/lib/analysis-summary-slides';
import {
  SUMMARY_TOTAL_SECONDS,
  summarySecondsPerSlide,
} from '@/lib/analysis-summary-slides';

interface Props {
  slides: SummarySlide[];
  /** Hide chrome for Win+G / OBS capture (YouTube upload). */
  recordMode?: boolean;
}

function toneClass(tone?: string): string {
  if (tone === 'good') return 'asv-bullet-good';
  if (tone === 'warn') return 'asv-bullet-warn';
  if (tone === 'bad') return 'asv-bullet-bad';
  return '';
}

export function AnalysisSummaryVideoPlayer({ slides, recordMode = false }: Props) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  const secondsPerSlide = summarySecondsPerSlide(slides.length);

  useEffect(() => {
    if (!playing) return;
    const tick = window.setInterval(() => {
      setElapsed((e) => {
        const next = e + 0.25;
        if (next >= SUMMARY_TOTAL_SECONDS) {
          setIndex(0);
          return 0;
        }
        const idx = Math.min(
          slides.length - 1,
          Math.floor(next / secondsPerSlide)
        );
        setIndex(idx);
        return next;
      });
    }, 250);
    return () => clearInterval(tick);
  }, [playing, slides.length, secondsPerSlide]);

  const restart = useCallback(() => {
    setIndex(0);
    setElapsed(0);
    setPlaying(true);
  }, []);

  const progressPct = useMemo(
    () => Math.min(100, (elapsed / SUMMARY_TOTAL_SECONDS) * 100),
    [elapsed]
  );

  const slide = slides[index] ?? slides[0];

  return (
    <div className={`asv-root ${recordMode ? 'asv-record-mode' : ''}`}>
      <div className="asv-stage" id="asv-capture">
        <div className="asv-progress" style={{ width: `${progressPct}%` }} aria-hidden />
        <div className="asv-slide" key={index}>
          {slide.subtitle && <p className="asv-subtitle">{slide.subtitle}</p>}
          <h1 className="asv-title">{slide.title}</h1>
          {slide.bullets && (
            <ul className="asv-bullets">
              {slide.bullets.map((b) => (
                <li key={b.text} className={toneClass(b.tone)}>
                  {b.text}
                </li>
              ))}
            </ul>
          )}
          {slide.cards && slide.cards.length > 0 && (
            <div className="asv-overview-grid">
              {slide.cards.map((card) => (
                <article key={card.label} className="asv-overview-card">
                  <span className="asv-card-label">{card.label}</span>
                  <p className={`asv-card-verdict asv-card-${card.tone}`}>{card.verdict}</p>
                </article>
              ))}
            </div>
          )}
          {slide.charts?.map((chart) => (
            <div key={chart.heading} className="asv-chart-block">
              <h2 className="asv-chart-heading">{chart.heading}</h2>
              <div className="asv-bar-list">
                {chart.bars.map((bar) => {
                  const pct = bar.max > 0 ? Math.min(100, (bar.value / bar.max) * 100) : 0;
                  return (
                    <div key={bar.label} className="asv-bar-row">
                      <span className="asv-bar-label">{bar.label}</span>
                      <div className="asv-bar-track">
                        <div
                          className={`asv-bar-fill asv-bar-fill-${bar.tone ?? 'neutral'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={`asv-bar-value asv-card-${bar.tone ?? 'neutral'}`}>
                        {bar.display}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {slide.rows && (
            <table className="asv-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Signal</th>
                  <th>Takeaway</th>
                </tr>
              </thead>
              <tbody>
                {slide.rows.map((r) => (
                  <tr key={r.module}>
                    <td>{r.module}</td>
                    <td>{r.signal}</td>
                    <td className="asv-muted">{r.takeaway}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {!recordMode && (
        <div className="asv-controls">
          <button type="button" className="btn-secondary" onClick={restart}>
            Restart 60s
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              const el = document.getElementById('asv-capture');
              if (el?.requestFullscreen) void el.requestFullscreen();
            }}
          >
            Fullscreen for YouTube capture
          </button>
        </div>
      )}

      {!recordMode && (
        <p className="asv-hint muted small">
          <strong>YouTube:</strong> open{' '}
          <code>?record=1</code> on this URL for a clean 16:9 frame (no buttons). Record with Win+G
          or OBS, then upload. Loop is {SUMMARY_TOTAL_SECONDS}s.
        </p>
      )}
    </div>
  );
}
