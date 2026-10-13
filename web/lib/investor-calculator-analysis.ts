/**
 * Investor-facing "Analysis" body for Stock Calculator reports (web only).
 * Framework evidence tags and file paths stay in engine / StockBook — not shown here.
 */

import type { PeBasis, StockCalculatorResult } from './stock-calculator-engine';
import { formatPct } from './investor-stock-report';

function peBasisLabel(basis: PeBasis): string {
  return basis === 'forward' ? 'forward P/E' : 'trailing (TTM) P/E';
}

function formatInr(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export function buildInvestorCalculatorAnalysisSection(
  result: Omit<
    StockCalculatorResult,
    'report' | 'reportMode' | 'frameworkVerdict' | 'tabAnalysis'
  >
): string {
  const {
    expectedCagrPct,
    years,
    quality,
    internalRisk,
    externalRisk,
    cagrGap,
    snapshot,
    anchorPe,
    peBasis,
    impliedVerdict,
  } = result;

  const supported = cagrGap.possibleCagrPct;
  const gapPp = cagrGap.cagrGapPp;
  const haircut = Math.max(internalRisk.haircutMidPp, externalRisk.haircutMidPp);

  let gapPlain = 'We could not compute a supported growth band — refresh company parameters and risk registers.';
  if (supported != null && gapPp != null) {
    if (cagrGap.gapTone === 'negative') {
      gapPlain = `Your **${formatPct(expectedCagrPct)}** growth assumption is **${Math.abs(gapPp).toFixed(1)} pp above** what the risk-adjusted model supports (~**${formatPct(supported)}**). Treat fresh buys as **small or wait** until evidence improves.`;
    } else if (cagrGap.gapTone === 'positive') {
      gapPlain = `Your **${formatPct(expectedCagrPct)}** assumption is **conservative** vs the supported band (~**${formatPct(supported)}**, gap **${gapPp >= 0 ? '+' : ''}${gapPp.toFixed(1)} pp**). That does **not** mean cheap — still check price vs PCCL and history.`;
    } else {
      gapPlain = `Your **${formatPct(expectedCagrPct)}** assumption is **in line** with the supported band (~**${formatPct(supported)}**, gap **${gapPp >= 0 ? '+' : ''}${gapPp.toFixed(1)} pp**). Valuation and moat still decide whether to add.`;
    }
  }

  const roeLine =
    quality.roePct != null
      ? `Return on equity **${quality.roeDisplay}**${quality.roePct >= 15 ? ' — passes a common quality hurdle (≥15%).' : ' — below a common quality hurdle (≥15%).'}`
      : 'Return on equity not available from live data or company parameters yet.';

  const riskLines: string[] = [];
  if (internalRisk.activeRiskCount > 0) {
    riskLines.push(
      `Company-specific risks (${internalRisk.activeRiskCount} active): worst level **${internalRisk.level}**, growth trim ~**${internalRisk.haircutMidPp.toFixed(1)} pp**.`
    );
    if (internalRisk.topRisks[0]) {
      riskLines.push(`Example: ${internalRisk.topRisks[0]}.`);
    }
  } else {
    riskLines.push('No company-specific risk rows loaded — add internal risk register for a fuller haircut.');
  }
  if (externalRisk.activeRiskCount > 0) {
    riskLines.push(
      `Macro / sector risks: worst level **${externalRisk.level}**, trim ~**${externalRisk.haircutMidPp.toFixed(1)} pp**.`
    );
  }

  return `## What this analysis means

[How to read colours & scorecard →](/readme/glossary#ask-agent-scorecard-colours) · [Glossary (PCCL, CAGR, risk levels) →](/readme/glossary)

### Valuation & growth expectations

- **Current price:** ${formatInr(snapshot.cmp)} (${snapshot.cmpSource}) at **${anchorPe.toFixed(1)}×** ${peBasisLabel(peBasis)}.
- **Your test:** ${formatPct(expectedCagrPct)} earnings CAGR over **${years} years**.
- **Supported growth band (after risk trim):** ${supported != null ? `~**${formatPct(supported)}**` : '—'}${haircut > 0 ? ` (up to **${haircut.toFixed(1)} pp** trimmed for ${internalRisk.level}/${externalRisk.level} risks)` : ''}.
- **In plain terms:** ${gapPlain}
- **Price scenario (same multiple):** ${impliedVerdict.replace(/framework/gi, 'model')}

### Business quality snapshot

- ${roeLine}
- EBITDA / margins: **${quality.ebitdaDisplay}** · Balance sheet: **${quality.debtDisplay}** · Cash: **${quality.cashFlowDisplay}**

### Risks to watch

${riskLines.map((l) => `- ${l}`).join('\n')}

### Before you add money

This run is a **what-if calculator** — not a buy recommendation. Use **Investment view** (Basic) or tabs **Business Quality**, **Risk & Decision**, and your **PCCL / pause rules** before deploying surplus. When unsure: **hold** legacy shares and **wait** on fresh capital until the next results.
`;
}
