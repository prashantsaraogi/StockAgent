import fs from 'fs/promises';
import path from 'path';
import { readRepoFile } from '@/lib/stockbook';
import { getSharedFrameworkPaths } from '@/lib/framework-paths';
import { parseHoldingsTable } from '@/lib/holdings';
import { readStockTabContent } from '@/lib/content';
import { getStockbookByTicker } from '@/lib/stockbook-index';
import { getUserPaths } from '@/lib/tenant';
import { getRepoRoot } from '@/lib/framework-paths';
import {
  matchStockQuestionArchetype,
  stockQuestionPlaybookForAgent,
} from '@/lib/stock-question-types';

export interface AgentQueryContext {
  tenantId: string;
  email?: string;
  ticker?: string;
  sector?: string;
  stockName?: string;
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
      parts.push(`### ${file.filename}\n${clip(file.content, 6000)}`);
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

async function buildHoldingsContext(tenantId: string): Promise<string> {
  try {
    const rows = await parseHoldingsTable(tenantId);
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

# Execution contract

1. **Never** skip the Framework lens section in your answer.
2. **Never** give generic "buy/sell" advice without PCCL/workflow/mandate checks.
3. Use verdict vocabulary from ASK-AGENT-RULES only.
4. Label facts vs MANAGEMENT CLAIM vs HYPOTHESIS vs UNVERIFIED.
5. For buy/add: run buy-decision-workflow steps 1–9; quotes lens mandatory (≥3 quotes).
6. Default for existing holdings: **HOLD** — no trim/sell for valuation per long-term mandate.`;
}

function buildUserPrompt(
  query: string,
  holdings: string,
  stockCtx: string,
  isBuyQuery: boolean,
  stockPlaybook: string
): string {
  return `${holdings}

${stockCtx ? `## StockBook for this query (Layer 2 — binding for this user)\n${stockCtx}\n` : ''}
${stockPlaybook}

## User question
${query}

---

## Instructions (mandatory)

Answer **only after** applying the core framework (Layer 1) and user context (Layer 2).

Use this **exact section structure** in markdown:

## Framework lens
## Context used
## Analysis
## Verdict
## Quotes lens

${stockPlaybook ? 'For this stock question archetype, include the extra subsections defined in STOCK-QUESTION-FRAMEWORK.md under **Analysis** (e.g. Results snapshot, One-off table, Growth vs P/E sync). End with **### FAQ write-back (suggested)** for faq.md.' : ''}

${isBuyQuery ? 'This is a **buy/add** query — run full buy-decision-workflow (Steps 1–9). Include ≥3 quotes in Quotes lens.' : 'Include ≥1 quote when patience, deployment, or discipline is relevant.'}

Do not give a generic AI stock opinion. If StockBook or pause registry blocks adds, state **PAUSE ADDS** clearly.`;
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
    tenantId: string;
  }
): string {
  const { holdings, stockCtx, isBuyQuery, quoteSnippet, tenantId } = ctx;
  const workflowSteps = isBuyQuery
    ? `1. Personal discipline pre-flight (pause registry, avg-cost trap)
2. Exclusion guards + fraud/legal screen
3. Structural-threat & pause registry
4. Sector comparative rank
5. PCCL dual anchor + tiers
6. Core-problem test + catalyst probability
7. Fresh vs existing holder lens
8. Quotes lens (mandatory)
9. Verdict: staged starter vs wait vs pause`
    : `1. AGENT-RULES read order (summary → faq → approach)
2. Core-problem test + valuation vs PCCL
3. Long-term mandate (default HOLD on existing)
4. Quotes lens where relevant`;

  return `## Framework lens

**Mode:** Local framework executor (add Gemini key for richer synthesis — framework rules unchanged)

Applied: \`ASK-AGENT-RULES.md\` · \`buy-decision-workflow.md\` · \`personal-discipline.md\`

${workflowSteps}

---

## Context used

**Tenant:** \`data/users/${tenantId}/\`

### Portfolio
${holdings}

${stockCtx ? `### StockBook\n${clip(stockCtx, 4000)}` : '*No ticker-specific StockBook loaded — name the stock for deeper context.*'}

---

## Analysis

**Your question:** ${query}

${isBuyQuery
    ? 'Before any ADD: run full buy-decision-workflow. Verify PCCL tier, personal discipline buckets (IT/AI → 0% surplus, HDFC Bank governance, ITC tax/regulatory), and surplus rank — **not CMP alone**. Never average down to fix avg cost.'
    : 'Separate **business quality** from **valuation at CMP**. Read existing StockBook verdict before contradicting. Default **HOLD** on legacy positions per long-term investor mandate.'}

---

## Verdict

**${isBuyQuery ? 'WAIT / PAUSE ADDS — pending full PCCL + workflow' : 'HOLD — framework review'}**

Complete PCCL, catalyst band, and quotes table after adding \`GOOGLE_GENERATIVE_AI_API_KEY\` (Gemini still runs **under** this framework — it does not replace it).

---

## Quotes lens

> ${quoteSnippet}

---

*Query saved to \`agent-inbox/last-query.md\`. Framework precedence: Core rules → Your holdings/StockBook → General knowledge.*
`;
}

export async function runFrameworkQuery(
  query: string,
  context: AgentQueryContext
): Promise<AgentQueryResult> {
  const shared = getSharedFrameworkPaths();
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
    buildHoldingsContext(context.tenantId),
    loadStockContext(context.tenantId, context.ticker, context.sector, context.stockName),
  ]);

  const hasStockScope = Boolean(context.ticker || context.stockName);
  const archetype = hasStockScope ? matchStockQuestionArchetype(query) : null;
  const stockPlaybook = hasStockScope ? stockQuestionPlaybookForAgent(archetype) : '';

  const isBuyQuery = /buy|add|accumulate|purchase|should i/i.test(query);
  const quoteSnippet =
    quotes.split('\n').find((l) => l.startsWith('> *'))?.replace(/^>\s*/, '') ??
    'Patience and discipline anchor every decision.';

  const system = buildSystemPrompt({
    askAgentRules,
    stockAgentRules,
    agentRules,
    buyWorkflow,
    discipline,
    longTermMandate,
    quotes,
    stockQuestionFramework,
    repoRoot: shared.repoRoot,
  });

  const userPrompt = buildUserPrompt(query, holdings, stockCtx, isBuyQuery, stockPlaybook);

  let answer: string;
  let mode: AgentQueryResult['mode'] = 'framework-local';
  let model: string | undefined;

  try {
    const geminiAnswer = await callGemini(system, userPrompt);
    if (geminiAnswer) {
      answer = geminiAnswer;
      mode = 'gemini';
      model = process.env.GEMINI_MODEL ?? 'gemini-3.6-flash';
    } else {
      answer = localFrameworkAnswer(query, {
        holdings,
        stockCtx,
        isBuyQuery,
        quoteSnippet,
        tenantId: context.tenantId,
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'LLM error';
    answer =
      localFrameworkAnswer(query, {
        holdings,
        stockCtx,
        isBuyQuery,
        quoteSnippet,
        tenantId: context.tenantId,
      }) + `\n\n> **LLM note:** ${msg}`;
  }

  await writeAgentInbox(context.tenantId, query, answer);

  return { answer, mode, model };
}
