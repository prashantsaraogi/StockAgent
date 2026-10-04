/**
 * Stock Calculator — framework-first full report.
 * Deterministic core (binding) + optional Gemini synthesis under framework rules.
 * NO portfolio / holdings context — standalone what-if.
 */

import { readRepoFile } from './stockbook';
import type { StockCalculatorResult, ProjectionScenario, PeBasis } from './stock-calculator-engine';
import type {
  FrameworkQualityMetrics,
  RiskFactorResult,
  CagrGapAnalysis,
} from './stock-calculator-framework';

export interface StockbookReportContext {
  summaryExcerpt: string | null;
  approachExcerpt: string | null;
  faqExcerpt: string | null;
  stockbookVerdict: string | null;
}

export interface FrameworkReportResult {
  report: string;
  reportMode: 'framework-local' | 'gemini';
  frameworkVerdict: string;
}

function clip(text: string, max = 1200): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '\n\n… [truncated]';
}

function formatInr(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function formatPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

function peBasisLabel(basis: PeBasis): string {
  return basis === 'ttm' ? 'TTM P/E' : 'Forward P/E';
}

function extractStockbookVerdict(approachMd: string | null): string | null {
  if (!approachMd) return null;
  const axisB = approachMd.match(/\*\*Current value \(B\)\*\*[^|]*\|\s*\*\*([^*]+)\*\*/i);
  if (axisB) return axisB[1].trim();
  const expensive = approachMd.match(/ADD case\?[^*]*\*\*([^*]+)\*\*/i);
  if (expensive) return expensive[1].trim();
  const tier = approachMd.match(/\*\*Label\*\*[^|]*\|\s*\*\*([^*]+)\*\*/i);
  if (tier) return tier[1].trim();
  return null;
}

function deriveFrameworkVerdict(
  cagrGap: CagrGapAnalysis,
  internalRisk: RiskFactorResult,
  externalRisk: RiskFactorResult
): string {
  const maxRisk = Math.max(internalRisk.score, externalRisk.score);
  if (maxRisk >= 3) return 'INVESTIGATE — L3 risk on internal/external register';
  if (cagrGap.gapTone === 'negative' && cagrGap.cagrGapPp != null && cagrGap.cagrGapPp < -4) {
    return 'WAIT — expected CAGR materially above supported growth band';
  }
  if (cagrGap.gapTone === 'negative') return 'WATCHLIST — CAGR expectation stretched vs supported band';
  if (cagrGap.gapTone === 'neutral') return 'WATCHLIST — aligned with supported CAGR band';
  if (maxRisk >= 2) return 'STAGED STARTER OK — what-if only; L2 risk caps size';
  return 'WATCHLIST — valuation room exists; confirm PCCL and discipline before deploy';
}

function pickQuotes(cagrGap: CagrGapAnalysis): string[] {
  const quotes: string[] = [];

  quotes.push(
    '> *"The stock market is a device for transferring money from the impatient to the patient."*  \n> — **Warren Buffett**'
  );

  if (cagrGap.gapTone === 'negative') {
    quotes.push(
      '> *"Price is what you pay; value is what you get."*  \n> — **Warren Buffett**'
    );
    quotes.push(
      '> *"It\'s far better to buy a wonderful company at a fair price than a fair company at a wonderful price."*  \n> — **Warren Buffett**'
    );
  } else if (cagrGap.gapTone === 'positive') {
    quotes.push(
      '> *"Our favourite holding period is forever."*  \n> — **Warren Buffett**'
    );
    quotes.push(
      '> *"Time is your friend; impulse is your enemy."*  \n> — **John Bogle**'
    );
  } else {
    quotes.push(
      '> *"There is always something to do. You just need a higher standard before you act."*  \n> — **Charlie Munger** *(attributed)*'
    );
    quotes.push(
      '> *"Don\'t average down on a losing position unless the thesis has improved — not because the price fell."*  \n> — **Framework synthesis** *(Buffett/Lynch doctrine)*'
    );
  }

  return quotes.slice(0, 3);
}

function scenarioTableRows(
  scenarios: ProjectionScenario[],
  investmentAmountInr: number | null
): string {
  const hasInv = investmentAmountInr != null && investmentAmountInr > 0;
  return scenarios
    .map((s) => {
      const inv =
        hasInv && s.exitValueInr != null
          ? ` | ${formatInr(s.exitValueInr)} | ${formatInr(s.gainInr!)}`
          : '';
      return `| ${s.label} | ${s.exitPe.toFixed(1)}× | ${formatInr(s.exitPrice)} | ${formatPct(s.totalReturnPct)} | ${formatPct(s.priceCagrPct)}${inv} |`;
    })
    .join('\n');
}

function buildDeterministicReport(
  result: Omit<StockCalculatorResult, 'report' | 'reportMode' | 'frameworkVerdict' | 'tabAnalysis'>,
  ctx: StockbookReportContext,
  frameworkVerdict: string
): string {
  const {
    ticker,
    stockName,
    sector,
    peBasis,
    expectedCagrPct,
    years,
    manualPeOverride,
    investmentAmountInr,
    frameworkPe,
    snapshot,
    anchorPe,
    anchorEps,
    projectedEps,
    scenarios,
    impliedVerdict,
    quality,
    internalRisk,
    externalRisk,
    cagrGap,
  } = result;

  const basisLabel = peBasisLabel(peBasis);
  const quotes = pickQuotes(cagrGap);
  const hasInv = investmentAmountInr != null && investmentAmountInr > 0;
  const investHeader = hasInv ? ' | Exit value | Gain ₹' : '';
  const investSep = hasInv ? ' |-----------:|-------:|' : '';

  const debtGuard =
    quality.debtRatio != null && quality.debtRatio > 3
      ? '**HIGH ALERT — leverage screen:** Net debt/EBITDA > 3× — fresh capital guard applies (exclusion-guards.md).'
      : quality.debtRatio != null && quality.debtRatio > 2
        ? '*Leverage elevated — size cap on fresh deployment.*'
        : '*Leverage within normal framework band or not reported.*';

  return `# Stock Calculator Report — ${stockName} (${ticker})

**Sector:** ${sector} · **Date:** ${new Date().toISOString().slice(0, 10)}  
**Mode:** Framework-first · **Standalone what-if** (no Portfolio / holdings link)

> This report is **not** generic AI stock commentary. It applies the **India Stock Investment Framework** — the same core logic as Ask Agent and StockBook — to your calculator inputs.

---

## Framework lens

**Precedence:** Core framework → StockBook context → Calculator math (never reversed).

**Applied in this run:**

1. **PARAMETERS read order** — Part 1 (10Y rear-view) for ROE, EBITDA, leverage; Part 2 forward P/E **confirmatory only** (PARAMETERS-FRAMEWORK.md).
2. **Risk registers** — \`internal-negative-risk.md\` + \`external-negative-risk.md\` with L1/L2/L3 growth haircut scale (0–2 / 3–7 / ≥8 pp).
3. **CAGR gap test** — Framework *possible* CAGR vs **your** expected ${formatPct(expectedCagrPct)} earnings CAGR.
4. **PE projection** — Anchor ${basisLabel} ${anchorPe.toFixed(1)}× @ ${formatInr(snapshot.cmp)}; exit scenarios at same / 10Y avg / forward fair multiple.
5. **Calculator isolation** — No cost basis, no averaging-down, no portfolio weights (mandate for this tool).
6. **Exclusion guards** — ${debtGuard}

**Binding sources:** \`stock-agent.mdc\` · \`StockBook/AGENT-RULES.md\` · \`investor-wisdom/buy-decision-workflow.md\` · \`PARAMETERS-FRAMEWORK.md\`

---

## Context used

| Layer | Source | Status |
|-------|--------|--------|
| StockBook summary | \`summary-analysis.md\` | ${ctx.summaryExcerpt ? 'Loaded (excerpt below)' : 'Not available'} |
| StockBook approach | \`suggested-approach.md\` | ${ctx.approachExcerpt ? 'Loaded' : 'Not available'} |
| PARAMETERS | \`PARAMETERS_${ticker}.md\` | ${snapshot.parametersDate ? `CMP as of ${snapshot.parametersDate}` : 'Loaded'} |
| Internal risk | \`internal-negative-risk.md\` | ${internalRisk.source === 'unavailable' ? 'Missing' : 'Loaded'} |
| External risk | \`external-negative-risk.md\` | ${externalRisk.source === 'unavailable' ? 'Missing' : 'Loaded'} |
| Live CMP | NSE / Yahoo / PARAMETERS | ${snapshot.cmpSource} |

${ctx.stockbookVerdict ? `**StockBook saved verdict (Axis B / approach):** *${ctx.stockbookVerdict}* — **FACT** from StockBook; calculator does not override without new evidence.\n` : ''}
${ctx.summaryExcerpt ? `\n### Summary excerpt (StockBook)\n\n${ctx.summaryExcerpt}\n` : ''}
${ctx.approachExcerpt ? `\n### Approach excerpt (StockBook)\n\n${ctx.approachExcerpt}\n` : ''}

**Your inputs (ASSUMPTION unless from PARAMETERS):**

| Input | Value | Type |
|-------|------:|------|
| PE basis | ${basisLabel} | User selection |
| Expected earnings CAGR | ${formatPct(expectedCagrPct)} | **YOUR ASSUMPTION** |
| Horizon | ${years} years | User selection |
| Manual P/E override | ${manualPeOverride != null ? `${manualPeOverride.toFixed(1)}×` : '—'} | ${manualPeOverride != null ? 'User override' : 'Framework PARAMETERS'} |
| Hypothetical investment | ${hasInv ? formatInr(investmentAmountInr!) : '—'} | ${hasInv ? 'Illustrative only' : '—'} |

---

## Business quality

| Metric | Today @ CMP | Framework read | Label |
|--------|------------:|----------------|-------|
| **ROE** | ${quality.roeDisplay} | ${quality.roeRead ?? '—'} | ${quality.roePct != null && quality.roePct >= 15 ? 'FACT — Buffett gate pass' : quality.roePct != null ? 'FACT — below 15% gate' : 'UNVERIFIED'} |
| **EBITDA margin** | ${quality.ebitdaDisplay} | ${quality.ebitdaRead ?? '—'} | PARAMETERS Part 1 |
| **Debt / leverage** | ${quality.debtDisplay} | ${quality.debtRead ?? '—'} | ${quality.debtRatio != null ? 'FACT' : 'Qualitative / UNVERIFIED'} |
| **Cash flow / balance sheet** | ${quality.cashFlowDisplay} | ${quality.cashFlowRead ?? '—'} | StockBook / PARAMETERS |

*Separate **business quality** from **valuation at CMP** — excellent business can still be a poor entry at the wrong price.*

---

## Valuation & PE projection

| Metric | Value | Source |
|--------|------:|--------|
| CMP | ${formatInr(snapshot.cmp)} | ${snapshot.cmpSource} |
| TTM P/E | ${snapshot.ttmPe != null ? `${snapshot.ttmPe.toFixed(1)}×` : '—'} | PARAMETERS |
| Forward P/E | ${snapshot.forwardPe != null ? `${snapshot.forwardPe.toFixed(1)}×` : '—'} | PARAMETERS Part 2 |
| 10Y avg P/E | ${snapshot.avg10yPe != null ? `${snapshot.avg10yPe.toFixed(1)}×` : '—'} | PARAMETERS Part 1 |
| Forward fair P/E | ${snapshot.forwardFairPe != null ? `${snapshot.forwardFairPe.toFixed(1)}×` : '—'} | ASSUMPTION in PARAMETERS |
| Anchor P/E used | ${anchorPe.toFixed(1)}× (${manualPeOverride != null ? 'manual' : basisLabel}) | Calculator |
| Implied anchor EPS | ${formatInr(anchorEps)} | Derived |
| EPS after ${years}Y @ ${formatPct(expectedCagrPct)} | ${formatInr(projectedEps)} | **YOUR CAGR assumption** |
| Framework 5Y fair (base) | ${snapshot.framework5yFairPrice != null ? formatInr(snapshot.framework5yFairPrice) : '—'} | PARAMETERS |

**Price scenario verdict (primary lens):** ${impliedVerdict}

---

## Risk assessment (framework registers)

### Internal risk — company-specific

| Field | Value |
|-------|-------|
| Worst level | **${internalRisk.level}** |
| Growth haircut | ~${internalRisk.haircutMidPp.toFixed(1)} pp (${internalRisk.haircutRange}) |
| Active rows | ${internalRisk.activeRiskCount} |
| Summary | ${internalRisk.summary.replace(/\*\*/g, '')} |

${internalRisk.topRisks.length ? `**Top risks:** ${internalRisk.topRisks.join(' · ')}\n` : ''}

### External risk — macro / sector / policy

| Field | Value |
|-------|-------|
| Worst level | **${externalRisk.level}** |
| Growth haircut | ~${externalRisk.haircutMidPp.toFixed(1)} pp (${externalRisk.haircutRange}) |
| Active rows | ${externalRisk.activeRiskCount} |
| Summary | ${externalRisk.summary.replace(/\*\*/g, '')} |

${externalRisk.topRisks.length ? `**Top risks:** ${externalRisk.topRisks.join(' · ')}\n` : ''}

*Risk level scale (AGENT-RULES): L1 = 0–2 pp · L2 = 3–7 pp · L3 = ≥8 pp off sustainable EPS CAGR.*

---

## CAGR gap analysis

| Metric | Value |
|--------|------:|
| Framework base EPS CAGR | ${quality.baseEpsCagrRange ?? (quality.baseEpsCagrPct != null ? formatPct(quality.baseEpsCagrPct) : '—')} |
| Max risk haircut applied | −${Math.max(internalRisk.haircutMidPp, externalRisk.haircutMidPp).toFixed(1)} pp |
| **Possible EPS CAGR** | **${cagrGap.possibleEpsCagrPct != null ? formatPct(cagrGap.possibleEpsCagrPct) : '—'}** |
| Implied price CAGR (framework) | ${cagrGap.impliedPriceCagrPct != null ? formatPct(cagrGap.impliedPriceCagrPct) : '—'} |
| **Possible CAGR (conservative)** | **${cagrGap.possibleCagrPct != null ? formatPct(cagrGap.possibleCagrPct) : '—'}** |
| **Your expected CAGR** | **${formatPct(expectedCagrPct)}** |
| **Gap (possible − expected)** | **${cagrGap.cagrGapPp != null ? `${cagrGap.cagrGapPp >= 0 ? '+' : ''}${cagrGap.cagrGapPp.toFixed(1)} pp` : '—'}** |

${cagrGap.gapVerdict}

---

## Exit scenarios (${years} years)

| Scenario | Exit P/E | Exit price | Total return | Price CAGR${investHeader} |
|----------|---------:|-----------:|-------------:|-----------:${investSep} |
${scenarioTableRows(scenarios, investmentAmountInr)}

*Formula: projected EPS = anchor EPS × (1 + CAGR)^years; exit = projected EPS × exit P/E.*

---

## Core-problem test

> **Why might ${formatPct(expectedCagrPct)} CAGR be wrong?**

| Question | Framework answer |
|----------|------------------|
| Is growth **temporary vs structural**? | Internal ${internalRisk.level} · External ${externalRisk.level} — review risk registers. |
| Is the stock **cheap for a reason**? | Compare TTM ${snapshot.ttmPe?.toFixed(1) ?? '—'}× vs 10Y ${snapshot.avg10yPe?.toFixed(1) ?? '—'}×; forward IV premium in PARAMETERS. |
| Does **price CAGR** match **earnings CAGR**? | Primary scenario price CAGR vs your ${formatPct(expectedCagrPct)}% earnings assumption — multiple re-rating may differ. |
| StockBook disagree? | ${ctx.stockbookVerdict ? `Saved verdict: *${ctx.stockbookVerdict}*` : 'No approach verdict loaded.'} |

---

## Analysis

**Framework-constrained read (deterministic):**

1. **Quality lens** — ROE ${quality.roeDisplay}, EBITDA ${quality.ebitdaDisplay}, cash ${quality.cashFlowDisplay}. ${quality.roePct != null && quality.roePct < 15 ? 'Sub-15% ROE: Buffett compounder gate **not met** today.' : quality.roePct != null ? 'ROE supports quality compounder framing.' : 'ROE unverified — do not rank on quality alone.'}

2. **Valuation lens** — At ${formatInr(snapshot.cmp)} on ${anchorPe.toFixed(1)}× ${basisLabel}, ${impliedVerdict.toLowerCase()}. Forward P/E is **confirmatory only** — not a primary buy trigger per framework.

3. **Risk lens** — Combined worst haircut ~${Math.max(internalRisk.haircutMidPp, externalRisk.haircutMidPp).toFixed(1)} pp caps *possible* EPS path before your ${formatPct(expectedCagrPct)} assumption is tested.

4. **CAGR gap** — ${cagrGap.gapVerdict} This is the key differentiator vs generic AI: we anchor on **StockBook PARAMETERS + risk registers**, not headline optimism.

5. **Not a buy call** — Calculator output informs **WAIT / WATCHLIST / STAGED** vocabulary; fresh capital still requires full \`buy-decision-workflow.md\` + PCCL when you choose to deploy.

---

## Verdict

**${frameworkVerdict}**

| Check | Result |
|-------|--------|
| 12% long-term hurdle (price CAGR) | Primary scenario vs hurdle — see exit table |
| Framework possible vs expected CAGR | Gap ${cagrGap.cagrGapPp != null ? `${cagrGap.cagrGapPp >= 0 ? '+' : ''}${cagrGap.cagrGapPp.toFixed(1)} pp` : '—'} |
| StockBook alignment | ${ctx.stockbookVerdict ?? 'Not loaded'} |
| Fresh capital action | Run full buy-decision-workflow before any real ADD |

*Calculator verdict is **what-if only** — does not replace StockBook \`suggested-approach.md\` or personal pause registry.*

---

## Quotes lens

${quotes.map((q, i) => `${i + 1}. ${q}`).join('\n\n')}

---

## What would change the view

- Quarterly EPS **above** ${formatPct(expectedCagrPct)} run-rate for 2+ quarters → revisit possible CAGR upward.
- Risk register **downgrade** (L2→L1) on internal or external file → haircut reduces; gap narrows.
- **CMP** moves ≥10% without thesis change → re-run calculator; PCCL tier may shift.
- New **StockBook** approach verdict after results → framework verdict takes precedence over this run.
- Material **governance / legal / structural** headline → run fraud-detection + legal-threat analysis before any ADD.

---

*Report generated by Stock Calculator · Framework precedence: Core rules → StockBook → Calculator math · Not generic AI opinion.*
`;
}

async function callGemini(system: string, userPrompt: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL ?? 'gemini-3.6-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
    }),
  });

  if (!res.ok) return null;
  const json = await res.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

async function loadFrameworkSystemPrompt(): Promise<string> {
  const [askRules, agentRules, buyWorkflow] = await Promise.all([
    readRepoFile('web/lib/agent/ASK-AGENT-RULES.md').catch(() => ''),
    readRepoFile('StockBook/AGENT-RULES.md').catch(() => ''),
    readRepoFile('investor-wisdom/buy-decision-workflow.md').catch(() => ''),
  ]);

  return `# Role — Stock Calculator framework synthesizer

You refine the **Analysis** section of a Stock Calculator report. You are NOT a generic financial chatbot.

**Rules:**
- Framework precedence: AGENT-RULES + buy-decision-workflow + StockBook > general knowledge
- **Never** contradict numbers in the deterministic report (CMP, P/E, CAGR gap, scenarios)
- **Never** mention portfolio holdings or suggest averaging down
- Use verdict vocabulary: HOLD, PAUSE ADDS, WAIT, STAGED STARTER OK, WATCHLIST, INVESTIGATE
- Label FACT vs ASSUMPTION vs HYPOTHESIS
- Forward P/E is confirmatory only
- Output ONLY the "## Analysis" section body (markdown, no duplicate headers)

## ASK-AGENT-RULES excerpt
${clip(askRules, 4000)}

## AGENT-RULES excerpt
${clip(agentRules, 3000)}

## buy-decision-workflow excerpt
${clip(buyWorkflow, 2500)}
`;
}

export async function generateFrameworkCalculatorReport(
  result: Omit<StockCalculatorResult, 'report' | 'reportMode' | 'frameworkVerdict' | 'tabAnalysis'>,
  ctx: StockbookReportContext
): Promise<FrameworkReportResult> {
  const frameworkVerdict = deriveFrameworkVerdict(
    result.cagrGap,
    result.internalRisk,
    result.externalRisk
  );

  let report = buildDeterministicReport(result, ctx, frameworkVerdict);
  let reportMode: FrameworkReportResult['reportMode'] = 'framework-local';

  try {
    const system = await loadFrameworkSystemPrompt();
    const userPrompt = `Refine the **Analysis** section for this Stock Calculator run.

**Do not change any numbers.** Framework verdict: ${frameworkVerdict}

Ticker: ${result.ticker} · ${result.stockName}
Expected CAGR: ${result.expectedCagrPct}% · Possible CAGR: ${result.cagrGap.possibleCagrPct ?? 'n/a'}%
Gap: ${result.cagrGap.cagrGapPp ?? 'n/a'} pp
StockBook verdict: ${ctx.stockbookVerdict ?? 'n/a'}

Current deterministic Analysis section to refine (keep framework tone, add depth, cite risk registers):

${report.split('## Analysis')[1]?.split('## Verdict')[0] ?? ''}

Return ONLY improved Analysis paragraphs (3–6 short paragraphs, bullet-friendly). No generic "consult a financial advisor".`;

    const geminiAnalysis = await callGemini(system, userPrompt);
    if (geminiAnalysis && geminiAnalysis.trim().length > 80) {
      report = report.replace(
        /## Analysis[\s\S]*?(?=## Verdict)/,
        `## Analysis\n\n${geminiAnalysis.trim()}\n\n*Synthesis mode: Gemini under framework rules — numbers unchanged from deterministic core.*\n\n`
      );
      reportMode = 'gemini';
    }
  } catch {
    /* keep deterministic */
  }

  return { report, reportMode, frameworkVerdict };
}

export function buildStockbookReportContext(
  summaryMd: string | null,
  approachMd: string | null,
  faqMd: string | null
): StockbookReportContext {
  return {
    summaryExcerpt: summaryMd ? clip(summaryMd.replace(/^#.*\n/, ''), 900) : null,
    approachExcerpt: approachMd ? clip(approachMd.replace(/^#.*\n/, ''), 900) : null,
    faqExcerpt: faqMd ? clip(faqMd, 600) : null,
    stockbookVerdict: extractStockbookVerdict(approachMd),
  };
}
