'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SummarySlide } from '@/lib/analysis-summary-slides';
import {
  SUMMARY_SECONDS_PER_SLIDE,
  SUMMARY_TOTAL_SECONDS,
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

  const slideDurationMs = SUMMARY_SECONDS_PER_SLIDE * 1000;

  useEffect(() => {
    if (!playing) return;
    const tick = window.setInterval(() => {
      setElapsed((e) => {
        const next = e + 0.25;
        if (next >= SUMMARY_TOTAL_SECONDS) {
          setIndex(0);
          return 0;
        }
        const idx = Math.min(slides.length - 1, Math.floor(next / SUMMARY_SECONDS_PER_SLIDE));
        setIndex(idx);
        return next;
      });
    }, 250);
    return () => clearInterval(tick);
  }, [playing, slides.length]);

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
