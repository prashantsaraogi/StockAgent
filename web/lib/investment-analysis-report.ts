/**
 * Ask Agent — structured investment analysis report (ChatGPT-style layout, framework data).
 */

import type { StockCalculatorFullResult } from './stock-calculator-full';
import type { InvestorReportParts } from './investor-stock-report';
import { formatInr, formatPct } from './investor-stock-report';
import { buildInvestorFactorLensMarkdown } from './investor-factor-lens';
import { buildInvestorScorecardMarkdown } from './investor-scorecard';
import { buildBusinessQualityVsRisksMarkdown } from './investor-evidenced-readings';
import { getBundledParametersMd } from './load-bundled-stockbook';
import { parseHistoricalGrowthTab } from './stock-calculator-tabs';
import { label10yPe, resolve10yPeReference } from './pe-history-reference';
import {
  buildPeerSignalMatrix,
  SECTOR_PEER_LIST,
  type PeerSignal,
} from './peer-comparison-signals';

type Signal = PeerSignal;

interface FundRow {
  parameter: string;
  value: string;
  status: Signal;
  interpretation: string;
}

function signalFromScore10(score: number): Signal {
  if (score >= 7) return '🟢';
  if (score >= 5) return '🟡';
  return '🔴';
}

function signalFromPeVsAvg(ttm: number | null, avg10: number | null): Signal {
  if (ttm == null || avg10 == null) return '🟡';
  if (ttm < avg10 * 0.9) return '🟢';
  if (ttm > avg10 * 1.1) return '🔴';
  return '🟡';
}

function growthSignal(pct: number | null): Signal {
  if (pct == null) return '🟡';
  if (pct >= 8) return '🟢';
  if (pct <= 2) return '🟡';
  if (pct < 0) return '🔴';
  return '🟡';
}

function extractTimingCallout(summaryMd: string | null, faq: string | null): string | null {
  const blob = `${summaryMd ?? ''}\n${faq ?? ''}`;
  const results = blob.match(/results[^\n]{0,120}/i)?.[0];
  if (results && /today|tomorrow|after market|Q[1-4]/i.test(results)) {
    return `> **Important timing:** ${results.trim()}. Confirm on the exchange / company IR calendar before acting. *(From StockBook — verify date.)*`;
  }
  return null;
}

function buildFundamentalRows(
  analysis: StockCalculatorFullResult,
  cmp: number | null,
  parametersMd: string | null
): FundRow[] {
  const pe = analysis.peParameters;
  const hist = parseHistoricalGrowthTab(parametersMd);
  const eq = analysis.earningsQuality;
  const bq = analysis.businessQuality.businessQualityScore10;
  const ebitda = analysis.margin.partB?.rows?.find((r) => /ebitda/i.test(r.metric));
  const rows: FundRow[] = [];

  const histPe = resolve10yPeReference(pe);

  if (pe.ttmPe != null) {
    rows.push({
      parameter: 'TTM P/E @ CMP',
      value: `**${pe.ttmPe.toFixed(1)}×**`,
      status: signalFromPeVsAvg(pe.ttmPe, histPe.value),
      interpretation:
        histPe.value != null
          ? `vs ${label10yPe(histPe.kind)} **${histPe.value.toFixed(1)}×** (${pe.cmpSource})`
          : 'Live quote — add PARAMETERS for 10Y history',
    });
  }

  if (histPe.kind === 'median' && histPe.value != null) {
    rows.push({
      parameter: label10yPe('median'),
      value: `**${histPe.value.toFixed(1)}×**`,
      status: '🟡',
      interpretation:
        pe.avg10yPe != null && Math.abs(pe.avg10yPe - histPe.value) > 0.5
          ? `10Y mean **${pe.avg10yPe.toFixed(1)}×** for comparison — median from FY history / StockBook`
          : 'From FY P/E history or StockBook (excl. FY2020–21 when table present)',
    });
  }

  if (hist.ownerEarningsYield && hist.ownerEarningsYield !== '—') {
    rows.push({
      parameter: 'Owner earnings yield',
      value: hist.ownerEarningsYield,
      status: '🟢',
      interpretation: hist.pe10yAvg ? `10Y P/E avg ${hist.pe10yAvg}` : 'From PARAMETERS Part 1',
    });
  }

  if (eq.partA?.revenueCagr5y != null) {
    rows.push({
      parameter: 'Revenue CAGR (5Y)',
      value: `**${eq.partA.revenueCagr5y.toFixed(1)}%**`,
      status: growthSignal(eq.partA.revenueCagr5y),
      interpretation: eq.partA.dataComplete ? 'StockBook earnings file' : 'Partial history — refresh AR',
    });
  }

  if (eq.partA?.patCagr5y != null) {
    rows.push({
      parameter: 'PAT CAGR (5Y)',
      value: `**${eq.partA.patCagr5y.toFixed(1)}%**`,
      status: growthSignal(eq.partA.patCagr5y),
      interpretation: 'Trailing business growth proxy',
    });
  }

  if (pe.trailingEps != null) {
    rows.push({
      parameter: 'TTM EPS (live)',
      value: `**₹${pe.trailingEps.toFixed(2)}**`,
      status: '🟢',
      interpretation: pe.cmpSource,
    });
  }

  if (ebitda?.todayPct != null) {
    rows.push({
      parameter: 'EBITDA margin',
      value: `**${ebitda.todayPct.toFixed(1)}%**`,
      status: ebitda.deltaPp != null && ebitda.deltaPp >= 0 ? '🟢' : '🟡',
      interpretation:
        ebitda.avg10yPct != null
          ? `10Y avg ${ebitda.avg10yPct.toFixed(1)}%`
          : 'PARAMETERS / margin file',
    });
  }

  rows.push({
    parameter: 'Business quality score',
    value: `**${bq}/10**`,
    status: signalFromScore10(bq),
    interpretation: analysis.businessQuality.dataSource.replace(/^No /, 'Add '),
  });

  rows.push({
    parameter: 'Risk score (framework)',
    value: `**${analysis.riskDecision.quantitativeScore100}/100**`,
    status:
      analysis.riskDecision.quantitativeScore100 >= 65
        ? '🟢'
        : analysis.riskDecision.quantitativeScore100 >= 45
          ? '🟡'
          : '🔴',
    interpretation: analysis.riskDecision.thesis.riskLabel,
  });

  if (cmp != null) {
    rows.push({
      parameter: 'CMP',
      value: formatInr(cmp),
      status: '🟡',
      interpretation: pe.cmpSource,
    });
  }

  if (rows.length === 0) {
    rows.push({
      parameter: 'Data coverage',
      value: '—',
      status: '🟡',
      interpretation: 'Add StockBook PARAMETERS + earnings files for full scorecard',
    });
  }

  return rows;
}

function fundTable(rows: FundRow[]): string {
  const lines = rows.map(
    (r) => `| ${r.parameter} | ${r.value} | ${r.status} | ${r.interpretation} |`
  );
  return `| Parameter | Value | Status | Investor interpretation |
|-----------|------:|:------:|-------------------------|
${lines.join('\n')}`;
}

function peerTable(
  sector: string,
  subjectTicker: string,
  peerMatrix: Map<string, Record<string, Signal>>
): string | null {
  const norm =
    Object.keys(SECTOR_PEER_LIST).find((k) => sector.toLowerCase().includes(k.toLowerCase())) ??
    (sector.toLowerCase().includes('it') ? 'IT' : null);
  if (!norm || !SECTOR_PEER_LIST[norm]) return null;

  const peers = SECTOR_PEER_LIST[norm];
  const factors = [
    { key: 'scale', label: 'Scale' },
    { key: 'margin', label: 'Operating margin' },
    { key: 'cash', label: 'Cash generation' },
    { key: 'clients', label: 'Enterprise / moat' },
    { key: 'growth', label: 'Current growth momentum' },
    { key: 'ai', label: 'Structural / AI positioning' },
    { key: 'balance', label: 'Balance-sheet strength' },
    { key: 'quality', label: 'Business quality' },
  ];

  const header = `| Factor | ${peers.map((p) => p.label).join(' | ')} |`;
  const sep = `|--------|${peers.map(() => ':----:').join('|')}|`;

  const body = factors.map((f) => {
    const cells = peers.map((p) => {
      const row = peerMatrix.get(p.ticker.toUpperCase());
      const s = row?.[f.key] ?? '🟡';
      const isSubject = p.ticker.toUpperCase() === subjectTicker.toUpperCase();
      return f.key === 'quality' && isSubject ? `**${s}**` : s;
    });
    return `| ${f.label} | ${cells.join(' | ')} |`;
  });

  return `${header}\n${sep}\n${body.join('\n')}\n\n*Peer signals: live run for **${subjectTicker}**; peers from StockBook PARAMETERS + sector comparative rank (FACT/HYPOTHESIS scores → 🟢/🟡/🔴).*`;
}

function sectionBlock(title: string, signal: Signal, bullets: string[], verdict?: string): string {
  const v = verdict ? `\n\n**Verdict:** ${verdict}` : '';
  return `### ${title} — ${signal}\n\n${bullets.map((b) => `- ${b}`).join('\n')}${v}\n`;
}

function dashboardRow(area: string, status: string): string {
  return `| ${area} | ${status} |`;
}

export function buildInvestmentAnalysisReport(parts: InvestorReportParts): string {
  const {
    analysis,
    holding,
    cmp,
    cmpSource,
    pcclBase,
    pcclApplied,
    premiumPccl,
    discipline,
    oneLine,
    faq,
    summaryMd,
    declineSection,
    fiftyTwoWeekHigh,
    fiftyTwoWeekLow,
  } = parts;

  const date = analysis.analyzedAt.slice(0, 10);
  const pe = analysis.peParameters;
  const bqScore = analysis.businessQuality.businessQualityScore10;
  const parametersMd =
    getBundledParametersMd(analysis.ticker) ?? null;

  const timing = extractTimingCallout(summaryMd, faq);

  const fundRows = buildFundamentalRows(analysis, cmp, parametersMd);
  const growthSig = growthSignal(analysis.earningsQuality.partA?.patCagr5y ?? null);
  const peerSignals: Record<string, Signal> = {
    scale: bqScore >= 7 ? '🟢' : '🟡',
    margin: analysis.margin.partB.primaryDeltaPp != null && analysis.margin.partB.primaryDeltaPp >= 0 ? '🟢' : '🟡',
    cash: analysis.earningsQuality.overallTone === 'good' ? '🟢' : '🟡',
    clients: bqScore >= 8 ? '🟢' : '🟡',
    growth: growthSig,
    ai: /IT|software|tech/i.test(analysis.sector) ? '🟡' : '🟢',
    balance: analysis.riskDecision.thesis.riskLabel.toLowerCase().includes('low') ? '🟢' : '🟡',
    quality: signalFromScore10(bqScore),
  };

  const peerMatrix = buildPeerSignalMatrix(analysis.sector, analysis.ticker, peerSignals);
  const peerBlock = peerTable(analysis.sector, analysis.ticker, peerMatrix);

  const histPeRef = resolve10yPeReference(pe);
  const valSignal =
    premiumPccl != null && premiumPccl <= 0
      ? '🟢'
      : pe.ttmPe != null && histPeRef.value != null && pe.ttmPe < histPeRef.value * 0.95
        ? '🟢'
        : '🟡 **Needs price check**';

  const overallQuality =
    bqScore >= 8 ? '🟢 **Excellent**' : bqScore >= 6 ? '🟡 **Good**' : '🟡 **Average**';

  const scorecardRisk = holding
    ? analysis.overview.riskVerdict
    : discipline?.surplusPct === 0
      ? 'WATCHLIST / WAIT (0% fresh surplus)'
      : analysis.overview.riskVerdict;

  const factorBlock = buildInvestorFactorLensMarkdown(analysis, {
    cmp,
    premiumPccl,
    fiftyTwoWeekHigh,
    fiftyTwoWeekLow,
  });

  const scorecardBlock = buildInvestorScorecardMarkdown(analysis, scorecardRisk, discipline);
  const evidenceBlock =
    buildBusinessQualityVsRisksMarkdown(analysis, {
      holding,
      discipline,
      summaryMd,
      faq,
      concerns: analysis.riskDecision.concerns,
    }) ?? '';

  const positionNote = holding
    ? `You hold **${holding.qty}** sh @ avg **${formatInr(holding.avgCost)}** (cost **${formatInr(holding.costBasis)}**).`
    : '**Fresh entry lens** — not in your portfolio lots.';

  const pcclNote =
    pcclApplied != null
      ? `PCCL anchor **${formatInr(pcclApplied)}** · Premium **${premiumPccl != null ? formatPct(premiumPccl) : '—'}**`
      : 'PCCL — refresh StockBook PARAMETERS / detail-analysis';

  const bullish = analysis.riskDecision.thesis.whyOwn
    ? analysis.riskDecision.thesis.whyOwn.split(/[.;]/).slice(0, 4).map((s) => s.trim()).filter(Boolean)
    : [
        'Sustained earnings / EPS growth vs sector',
        'Margins stable or expanding',
        'Valuation vs 10Y P/E attractive',
        'Thesis KPIs in StockBook on track',
      ];

  const cautious = analysis.riskDecision.concerns.length
    ? analysis.riskDecision.concerns.slice(0, 5)
    : analysis.riskDecision.thesisBreakers.slice(0, 3).map((t) => t.text);

  const legacyHolderAction = holding
    ? (discipline?.legacyAction ?? '🟢 **Hold / monitor** (long-term mandate)')
    : '— (not in portfolio)';

  const newInvestorAction = !holding
    ? discipline?.surplusPct === 0
      ? '🟡 **Wait** — 0% surplus rank per personal discipline'
      : premiumPccl != null && premiumPccl > 15
        ? '🟡 **Accumulate gradually** — above PCCL; token size only'
        : '🟡 **Accumulate gradually** rather than chase / lump sum'
    : '🟡 **Accumulate gradually** on reasonable valuation (entry price matters)';

  const shortTermAction =
    '🟡 **Wait for next results / material news** — recheck valuation after earnings';

  const structuralSnippet =
    summaryMd?.match(/\*\*Framework read[^*]*\*\*[^|]*\|[^|]*\*\*([^*]+)\*\*/i)?.[1]?.trim() ??
    analysis.riskDecision.narrativeSummary?.slice(0, 280);

  return `# ${analysis.stockName} — Investment Analysis Report

**${analysis.stockName} | NSE: ${analysis.ticker} | India**  
**Report date: ${date}**

${timing ?? ''}

${positionNote}  
**CMP:** ${cmp != null ? `${formatInr(cmp)} (${cmpSource})` : 'UNVERIFIED'} · ${pcclNote}

> **One-line (framework):** ${oneLine}

---

## 1. 📊 Data & peer position

### ${analysis.ticker} fundamental scorecard

${fundTable(fundRows)}

*Sources: live quote (${cmpSource}), Stock Calculator modules, StockBook PARAMETERS when present. Rows marked — need annual-report / file refresh.*

${peerBlock ? `### Against major ${analysis.sector} peers\n\n**Relative positioning — qualitative view**\n\n${peerBlock}` : ''}

**Bottom line:** Separate **business quality** from **entry price** — strong franchises can still be wrong buys if growth or valuation disappoint.

---

## 2. 🔍 Individual analysis — ${analysis.stockName}

${sectionBlock(
  'Business quality',
  signalFromScore10(bqScore),
  [
    analysis.businessQuality.verdict,
    `Franchise score **${bqScore}/10** (${analysis.businessQuality.dataSource}).`,
    analysis.businessQuality.highlights[0]
      ? `${analysis.businessQuality.highlights[0].factor}: ${analysis.businessQuality.highlights[0].assessment}`
      : structuralSnippet ?? 'Refresh BUSINESS_QUALITY file for moat evidence.',
  ],
  bqScore >= 7 ? '🟢 Quality compounder lens' : '🟡 Average — price may reflect weaker moat'
)}

${sectionBlock(
  'Growth',
  growthSig,
  [
    analysis.cagr.frameworkVerdict ?? analysis.cagr.impliedVerdict,
    analysis.earningsQuality.partA?.epsCagr5y != null
      ? `5Y EPS CAGR **${analysis.earningsQuality.partA.epsCagr5y.toFixed(1)}%**`
      : 'Add EARNINGS_QUALITY Part A for 5Y EPS path',
    `Your ${analysis.inputs.expectedCagrPct}% hurdle vs supported band: ${analysis.cagr.cagrGap.possibleCagrPct?.toFixed(1) ?? '—'}%`,
  ],
  growthSig === '🟢' ? '🟢 Supportive trend' : '🟡 Near-term growth uncertain — watch next 2 quarters'
)}

${sectionBlock(
  'Profitability',
  analysis.margin.overallTone === 'good' ? '🟢' : '🟡',
  [
    analysis.margin.partB.rows.find((r) => /ebitda/i.test(r.metric))
      ? `EBITDA margin **${analysis.margin.partB.rows.find((r) => /ebitda/i.test(r.metric))!.todayPct?.toFixed(1) ?? '—'}%**`
      : analysis.earningsQuality.profitability[0]?.value ?? 'Margin file / PARAMETERS pending',
    analysis.earningsQuality.overallVerdict.replace(/^🟡\s*/, ''),
    pe.trailingEps != null ? `TTM EPS **₹${pe.trailingEps.toFixed(2)}** supports earnings level` : '',
  ].filter(Boolean),
  '🟢 High-quality earners show margin + cash conversion together'
)}

${sectionBlock(
  'Balance sheet & cash',
  analysis.earningsQuality.cashQuality.length ? '🟢' : '🟡',
  analysis.earningsQuality.cashQuality.slice(0, 3).map((c) => `${c.label}: **${c.value}**`).length
    ? analysis.earningsQuality.cashQuality.slice(0, 3).map((c) => `${c.label}: **${c.value}**`)
    : ['Refresh earnings-quality file for CFO/PAT and working-capital flags'],
  analysis.riskDecision.thesis.riskLabel
)}

${/IT|software|tech/i.test(analysis.sector)
  ? sectionBlock(
      'AI / structural positioning',
      '🟡',
      [
        'IT cluster: treat AI as **both opportunity and pricing threat** (personal discipline: pause heavy IT adds).',
        structuralSnippet ?? 'See StockBook external-negative-risk and structural-threat notes.',
      ],
      '**AI opportunity:** 🟢 · **Monetisation certainty:** 🟡'
    )
  : ''}

---

## 3. 🌎 Industry + investment verdict

### ${analysis.sector} — environment

🟡 **Monitor** sector KPIs, policy, and peer results. Use \`News/TICKER-INDEX.md\` and sector comparative rank before sizing surplus.

${declineSection ? `### Price / thesis context\n\n${declineSection.replace(/^##[^\n]*\n/, '').slice(0, 1200)}\n` : ''}

---

## 🚦 Investment dashboard

| Area | Status |
|------|:------:|
${[
  dashboardRow('Business quality', signalFromScore10(bqScore)),
  dashboardRow('Competitive position', peerSignals.clients),
  dashboardRow('Profitability', analysis.margin.overallTone === 'good' ? '🟢' : '🟡'),
  dashboardRow('Cash generation', analysis.earningsQuality.overallTone === 'good' ? '🟢' : '🟡'),
  dashboardRow('Balance sheet', peerSignals.balance),
  dashboardRow('Current revenue / EPS growth', growthSig),
  dashboardRow('Industry near-term demand', '🟡'),
  dashboardRow('Earnings visibility', analysis.earningsQuality.earningsQualityFile ? '🟢' : '🟡'),
  dashboardRow('Valuation', valSignal),
  dashboardRow('Overall business quality', overallQuality),
].join('\n')}

## 🎯 Overall view: **${bqScore >= 7 ? '🟢 QUALITY' : '🟡 MIXED QUALITY'} — ${valSignal.includes('🟢') ? '🟢' : '🟡'} VALUATION / ENTRY DEPENDENT**

**Framework read:** ${structuralSnippet ?? oneLine}

### What would improve conviction 🟢

${bullish.map((b) => `- ${b}`).join('\n')}

### What would raise caution 🔴

${cautious.map((c) => `- ${c}`).join('\n')}

### Investor action framework

| Situation | Action |
|-----------|--------|
| **Already holding** | ${legacyHolderAction} |
| **New long-term investor** | ${newInvestorAction} |
| **Short-term investor** | ${shortTermAction} |
| **Fresh surplus today** | ${discipline ? `${discipline.surplusPct}% rank — ${discipline.surplusAction}` : 'Rank vs portfolio PCCL gaps first'} |

**Best trigger to add:** Evidence that **growth is recovering** and price is **not rich vs PCCL / 10Y P/E** — not headline quality alone.

---

### One-line conclusion

**${analysis.ticker}** = ${overallQuality.replace(/\*\*/g, '')} + ${growthSig === '🟢' ? '🟢' : '🟡'} growth lens + ${valSignal} entry = **${oneLine.replace(/\*\*/g, '')}**

---

${factorBlock}

---

${scorecardBlock}

---

${evidenceBlock}

---

## Valuation detail

| Metric | Value |
|--------|------:|
| CMP | ${cmp != null ? formatInr(cmp) : '—'} |
| TTM P/E | ${pe.ttmPe != null ? `${pe.ttmPe.toFixed(1)}×` : '—'} |
| ${label10yPe(histPeRef.kind)} | ${histPeRef.value != null ? `${histPeRef.value.toFixed(1)}×` : '—'} |
${histPeRef.kind === 'median' && pe.avg10yPe != null ? `| 10Y avg P/E (mean) | ${pe.avg10yPe.toFixed(1)}× |` : ''}
| PCCL (rational) | ${pcclBase != null ? formatInr(pcclBase) : '—'} |
| Applied PCCL | ${pcclApplied != null ? formatInr(pcclApplied) : '—'} |

---

*Framework report — not investment advice. Numbers without a StockBook file are **live quote or model estimates**; verify against filings before trading.*
`;
}
