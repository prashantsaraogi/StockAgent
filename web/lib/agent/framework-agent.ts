import fs from 'fs/promises';
import path from 'path';
import { readRepoFile } from '@/lib/stockbook';
import { getSharedFrameworkPaths } from '@/lib/framework-paths';
import type { LotPersistenceContext } from '@/lib/holding-lots';
import { getPortfolioHoldingsRows } from '@/lib/portfolio-holdings';
import { readStockTabContent } from '@/lib/content';
import { getStockbookByTicker } from '@/lib/stockbook-index';
import { getUserPaths } from '@/lib/tenant';
import { getRepoRoot } from '@/lib/framework-paths';
import {
  matchStockQuestionArchetype,
  stockQuestionPlaybookForAgent,
} from '@/lib/stock-question-types';
import { sanitizeUserFacingAnswer } from '@/lib/investor-report-format';
import { stripAuthorPositionFromMarkdown } from '@/lib/portfolio-holdings';

export interface AgentQueryContext {
  tenantId: string;
  email?: string;
  ticker?: string;
  sector?: string;
  stockName?: string;
  portfolioLotContext?: LotPersistenceContext;
}

export interface AgentQueryResult {
  answer: string;
  mode: 'gemini' | 'framework-local';
  model?: string;
}

const ASK_AGENT_RULES_PATH = path.join(process.cwd(), 'lib/agent/ASK-AGENT-RULES.md');

function clip(text: string, max = 12000): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '\n\n… [truncated for context window]';
}

async function loadAskAgentRules(): Promise<string> {
  try {
    return await fs.readFile(ASK_AGENT_RULES_PATH, 'utf8');
  } catch {
    return 'Framework-first: AGENT-RULES and buy-decision-workflow always override generic AI.';
  }
}

async function loadStockContext(
  tenantId: string,
  ticker?: string,
  sector?: string,
  stockName?: string
): Promise<string> {
  if (!ticker && !stockName) return '';

  let sectorFolder = sector;
  let stockFolder = stockName;

  if (ticker && (!sectorFolder || !stockFolder)) {
    const loc = await getStockbookByTicker(ticker);
    if (loc) {
      sectorFolder = loc.sector;
      stockFolder = loc.stock;
    }
  }

  if (!sectorFolder || !stockFolder) return '';

  const parts: string[] = [];
  for (const tab of ['summary', 'faq', 'approach', 'parameters'] as const) {
    const file = await readStockTabContent(sectorFolder, stockFolder, tab, tenantId);
    if (file?.content) {
      parts.push(
        `### ${file.filename}\n${clip(stripAuthorPositionFromMarkdown(file.content), 6000)}`
      );
    }
  }

  const tickerUpper = ticker?.toUpperCase();
  if (tickerUpper) {
    const eqName = `EARNINGS_QUALITY_${tickerUpper}.md`;
    for (const base of [
      path.join(getUserPaths(tenantId).stockbookDir, sectorFolder, stockFolder, eqName),
      path.join(getRepoRoot(), 'StockBook', sectorFolder, stockFolder, eqName),
    ]) {
      try {
        const eq = await fs.readFile(base, 'utf8');
        parts.push(`### ${eqName}\n${clip(eq, 5000)}`);
        break;
      } catch {
        /* optional file */
      }
    }
  }

  return parts.join('\n\n');
}

async function buildHoldingsContext(
  tenantId: string,
  lotCtx?: LotPersistenceContext
): Promise<string> {
  try {
    const rows = await getPortfolioHoldingsRows(tenantId, lotCtx);
    if (rows.length === 0) return 'User portfolio: empty (no holdings imported yet).';
    const lines = rows.map(
      (r) =>
        `- ${r.ticker} | ${r.company} | ${r.qty} sh @ ₹${r.avgCost} | ${r.holdingsSector}`
    );
    return `User portfolio (${rows.length} holdings):\n${lines.join('\n')}`;
  } catch {
    return 'User portfolio: unavailable.';
  }
}

async function writeAgentInbox(
  tenantId: string,
  query: string,
  answer: string
): Promise<void> {
  const { safeWriteFile } = await import('@/lib/serverless-fs');
  const dir = path.join(getUserPaths(tenantId).portfolioDir, '../agent-inbox');
  const body = `# Web Ask Agent

**Updated:** ${new Date().toISOString()}
**Mode:** Framework-first (see ASK-AGENT-RULES.md)

## Question

${query}

## Answer

${answer}

---
*Same query context as Cursor stock agent. Open this file in Cursor to continue analysis.*
`;
  await safeWriteFile(path.join(dir, 'last-query.md'), body);
}

function buildSystemPrompt(ctx: {
  askAgentRules: string;
  stockAgentRules: string;
  agentRules: string;
  buyWorkflow: string;
  discipline: string;
  longTermMandate: string;
  quotes: string;
  stockQuestionFramework: string;
  repoRoot: string;
}): string {
  return `# Role

You are the **India Stock Investment Agent** web executor — **not** a generic financial chatbot.

Your job: run the **core framework first**, then answer. The framework is the **middle layer** between the user's question and your reply. **Framework precedence is always highest.**

If your general knowledge conflicts with AGENT-RULES, buy-decision-workflow, personal-discipline, or StockBook verdict → **framework wins. Never override.**

---

# ASK-AGENT-RULES (binding — read first)

${clip(ctx.askAgentRules, 6000)}

---

# Core framework sources (binding excerpts)

## stock-agent.mdc (Cursor master rules)
${clip(ctx.stockAgentRules, 10000)}

## StockBook AGENT-RULES
${clip(ctx.agentRules, 8000)}

## buy-decision-workflow.md
${clip(ctx.buyWorkflow, 7000)}

## personal-discipline.md
${clip(ctx.discipline, 4000)}

## long-term-investor-mandate.md
${clip(ctx.longTermMandate, 3500)}

## quotes.md (cite on deployment / patience decisions)
${clip(ctx.quotes, 3000)}

## STOCK-QUESTION-FRAMEWORK.md (stock-scoped Ask sidebar)
${clip(ctx.stockQuestionFramework, 5000)}

Framework root: ${ctx.repoRoot}

---

# Execution contract (internal — do not repeat in user reply)

1. Run buy-decision-workflow, discipline, PCCL, mandate checks **before** writing.
2. **Never** show "Framework lens", "Context used", file paths, or step lists to the user.
3. User-facing format: **user-output-template.md** only.
4. Use verdict vocabulary from ASK-AGENT-RULES in One-line / What to do.
5. Label missing data UNVERIFIED in prose — no invented CMP or dates.
6. Default for existing holdings: **HOLD** — no trim/sell for valuation per long-term mandate.`;
}

function buildUserPrompt(
  query: string,
  holdings: string,
  stockCtx: string,
  isBuyQuery: boolean,
  stockPlaybook: string,
  ticker?: string,
  stockName?: string
): string {
  const scope =
    ticker || stockName
      ? `Stock in scope: **${stockName ?? ticker}** (${ticker ?? 'ticker n/a'})`
      : 'No single stock pinned — infer from question if needed.';

  return `[INTERNAL DATA — do not dump verbatim; synthesize for the user]

### Portfolio
${holdings}

${stockCtx ? `### StockBook\n${stockCtx}\n` : ''}
${stockPlaybook ? `### Archetype hints (internal)\n${stockPlaybook}\n` : ''}

${scope}

## User question
${query}

---

Write the **user-visible** answer only (see USER OUTPUT TEMPLATE in system instructions).

${stockPlaybook ? 'Include results / P/E sync / driver tables **inside** Business quality or Valuation sections — not as FAQ write-back.' : ''}

${isBuyQuery ? 'Buy/add query: run full workflow internally; ≥3 quotes under **Quotes**.' : 'Include ≥1 quote when patience or deployment is relevant.'}

If pause registry or discipline blocks adds, say **PAUSE ADDS** or **0% surplus** clearly in **What to do**. Never mention .mdc files or workflow step numbers.`;
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

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${err.slice(0, 200)}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ?? null;
}

function localFrameworkAnswer(
  query: string,
  ctx: {
    holdings: string;
    stockCtx: string;
    isBuyQuery: boolean;
    quoteSnippet: string;
    ticker?: string;
    stockName?: string;
  }
): string {
  const { holdings, stockCtx, isBuyQuery, quoteSnippet, ticker, stockName } = ctx;
  const title =
    ticker || stockName
      ? `# ${stockName ?? ticker} (${ticker ?? '—'}) — Investment view`
      : '# Ask Agent — Investment view';
  const date = new Date().toISOString().slice(0, 10);

  const held = /^\s*-\s+\w+/.test(holdings) && ticker && holdings.toUpperCase().includes(ticker);

  return `${title}

**Date checked:** ${date}  
**CMP:** UNVERIFIED — add \`GOOGLE_GENERATIVE_AI_API_KEY\` for live synthesis

> **One-line:** ${isBuyQuery ? 'WAIT / PAUSE ADDS — confirm PCCL and discipline before any add' : 'HOLD — review StockBook and position before acting'}

---

## Your position

${held ? holdings.split('\n').find((l) => l.includes(ticker!)) ?? holdings : '*No matching row in imported holdings, or name a ticker (e.g. ITC) for a full report.*'}

## Business quality vs risks

${stockCtx ? clip(stockCtx, 1200) : 'Name a stock (even one word, e.g. **ITC**) for a full analysis with modules and live CMP.'}

## Valuation & PCCL

Run Stock Analysis → **Basic** or retry Ask Agent with Gemini configured for PCCL, premium, and YoC math.

## What to do

| Capital | Action |
| Legacy | **HOLD** per long-term mandate unless existential exit |
| Fresh / surplus | **WAIT** until workflow + rank clear — no avg-down to fix cost |

## Quotes

> ${quoteSnippet}

---

*Your question: ${query}*
`;
}

export async function runFrameworkQuery(
  query: string,
  context: AgentQueryContext
): Promise<AgentQueryResult> {
  const shared = getSharedFrameworkPaths();
  const userOutputTemplate = await fs
    .readFile(path.join(process.cwd(), 'lib/agent/user-output-template.md'), 'utf8')
    .catch(() => 'Use investor-facing sections only — no Framework lens heading.');

  const [
    askAgentRules,
    stockAgentRules,
    agentRules,
    buyWorkflow,
    discipline,
    longTermMandate,
    quotes,
    stockQuestionFramework,
    holdings,
    stockCtx,
  ] = await Promise.all([
    loadAskAgentRules(),
    readRepoFile('.cursor/rules/stock-agent.mdc').catch(() => ''),
    readRepoFile('StockBook/AGENT-RULES.md').catch(() => ''),
    readRepoFile('investor-wisdom/buy-decision-workflow.md').catch(() => ''),
    readRepoFile('investor-wisdom/personal-discipline.md').catch(() => ''),
    readRepoFile('.cursor/skills/portfolio-analysis/long-term-investor-mandate.md').catch(
      () => ''
    ),
    readRepoFile('investor-wisdom/quotes.md').catch(() => ''),
    readRepoFile('StockBook/STOCK-QUESTION-FRAMEWORK.md').catch(() => ''),
    buildHoldingsContext(context.tenantId, context.portfolioLotContext),
    loadStockContext(context.tenantId, context.ticker, context.sector, context.stockName),
  ]);

  const hasStockScope = Boolean(context.ticker || context.stockName);
  const archetype = hasStockScope ? matchStockQuestionArchetype(query) : null;
  const stockPlaybook = hasStockScope ? stockQuestionPlaybookForAgent(archetype) : '';

  const isBuyQuery = /buy|add|accumulate|purchase|should i/i.test(query);
  const quoteSnippet =
    quotes.split('\n').find((l) => l.startsWith('> *'))?.replace(/^>\s*/, '') ??
    'Patience and discipline anchor every decision.';

  const system =
    buildSystemPrompt({
      askAgentRules,
      stockAgentRules,
      agentRules,
      buyWorkflow,
      discipline,
      longTermMandate,
      quotes,
      stockQuestionFramework,
      repoRoot: shared.repoRoot,
    }) +
    `\n\n# USER OUTPUT TEMPLATE (binding for visible reply)\n${clip(userOutputTemplate, 4000)}`;

  const userPrompt = buildUserPrompt(
    query,
    holdings,
    stockCtx,
    isBuyQuery,
    stockPlaybook,
    context.ticker,
    context.stockName
  );

  let answer: string;
  let mode: AgentQueryResult['mode'] = 'framework-local';
  let model: string | undefined;

  try {
    const geminiAnswer = await callGemini(system, userPrompt);
    if (geminiAnswer) {
      answer = sanitizeUserFacingAnswer(geminiAnswer);
      mode = 'gemini';
      model = process.env.GEMINI_MODEL ?? 'gemini-3.6-flash';
    } else {
      answer = sanitizeUserFacingAnswer(
        localFrameworkAnswer(query, {
          holdings,
          stockCtx,
          isBuyQuery,
          quoteSnippet,
          ticker: context.ticker,
          stockName: context.stockName,
        })
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'LLM error';
    answer = sanitizeUserFacingAnswer(
      localFrameworkAnswer(query, {
        holdings,
        stockCtx,
        isBuyQuery,
        quoteSnippet,
        ticker: context.ticker,
        stockName: context.stockName,
      }) + `\n\n> **Note:** ${msg}`
    );
  }

  await writeAgentInbox(context.tenantId, query, answer);

  return { answer, mode, model };
}
