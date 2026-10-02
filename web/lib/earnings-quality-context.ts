/**
 * Optional AI / context enrichment for Earnings Quality Part B year factors.
 * Uses Gemini when configured; else rule-based from risk registers + News index.
 */

import fs from 'fs/promises';
import path from 'path';
import { getRepoRoot } from './framework-paths';
import type { RiskFactorResult } from './stock-calculator-framework';

async function readNewsTickerSnippet(ticker: string): Promise<string> {
  try {
    const p = path.join(getRepoRoot(), 'News', 'TICKER-INDEX.md');
    const md = await fs.readFile(p, 'utf8');
    const lines = md.split('\n');
    const hits = lines.filter((l) => l.toUpperCase().includes(ticker.toUpperCase()));
    return hits.slice(0, 8).join('\n') || 'No ticker row in News/TICKER-INDEX.md';
  } catch {
    return '';
  }
}

async function callGemini(system: string, user: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL ?? 'gemini-3.6-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
    }),
  });

  if (!res.ok) return null;
  const json = await res.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

/** Build short per-FY context notes for Part B (oil, policy, etc.). */
export async function enrichForwardYearContext(input: {
  ticker: string;
  stockName: string;
  sector: string;
  internalRisk: RiskFactorResult;
  externalRisk: RiskFactorResult;
  fiscalYears: string[];
}): Promise<{ notes: Record<string, string>; aiEnriched: boolean }> {
  const newsSnippet = await readNewsTickerSnippet(input.ticker);

  const system = `You assist an India equity earnings-quality framework. Output ONLY valid JSON object:
{ "FY27": "one line external/internal context", "FY28": "...", ... }
Label FACT vs ASSUMPTION in text. Focus on material drivers: oil/commodity, RBI, policy, competition, AUM/market for AMCs, SIAM for auto. No buy/sell. Max 120 chars per year.`;

  const user = `Stock: ${input.stockName} (${input.ticker}) · Sector: ${input.sector}
Fiscal years: ${input.fiscalYears.join(', ')}

Internal risk summary: ${input.internalRisk.summary}
Top internal: ${input.internalRisk.topRisks.join('; ') || '—'}

External risk summary: ${input.externalRisk.summary}
Top external: ${input.externalRisk.topRisks.join('; ') || '—'}

News index snippet:
${newsSnippet.slice(0, 1500)}

For FY27 (current/next), emphasize active external factors (e.g. oil price if relevant).`;

  try {
    const raw = await callGemini(system, user);
    if (raw) {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Record<string, string>;
        return { notes: parsed, aiEnriched: true };
      }
    }
  } catch {
    /* fallback */
  }

  const notes: Record<string, string> = {};
  const ext = input.externalRisk.topRisks[0] ?? 'Monitor macro/sector';
  const int = input.internalRisk.topRisks[0] ?? 'Execution/margin';
  for (let i = 0; i < input.fiscalYears.length; i++) {
    const fy = input.fiscalYears[i];
    notes[fy] =
      i === 0
        ? `ASSUMPTION: ${ext} — current-year overlay (check oil/policy headlines)`
        : `ASSUMPTION: taper external; watch ${int.slice(0, 40)}`;
  }

  return { notes, aiEnriched: false };
}
