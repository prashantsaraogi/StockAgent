/**
 * Stock-scoped quick questions — StockBook sidebar + framework archetypes.
 * See StockBook/STOCK-QUESTION-FRAMEWORK.md
 */

export type StockQuestionArchetypeId =
  | 'pe-growth-sync'
  | 'post-results'
  | 'add-at-cmp'
  | 'price-decline'
  | 'pccl-sip'
  | 'pe-vs-history';

export interface StockQuickQuestion {
  id: StockQuestionArchetypeId;
  label: string;
  /** Sent to /api/chat as the user message */
  prompt: string;
  /** Extra instructions appended for the LLM when this archetype matches */
  playbookHint: string;
}

export const STOCK_QUICK_QUESTIONS: StockQuickQuestion[] = [
  {
    id: 'pe-growth-sync',
    label: 'P/E vs latest results',
    prompt:
      'Is the current trailing P/E justified given the latest quarterly results? Are revenue growth, normalized earnings, and the P/E multiple in sync? Strip one-offs before judging PAT.',
    playbookHint: `Apply STOCK-QUESTION-FRAMEWORK **Q1 P/E vs growth sync**.
Include: Results snapshot (date checked) · One-off/normalized PAT table · Growth vs P/E sync table · PEG on normalized growth · vs 10Y P/E from PARAMETERS · holder add-gate if portfolio row exists.
Do NOT equate headline PAT beat with sync when revenue is low single-digit.`,
  },
  {
    id: 'post-results',
    label: 'What changed after results?',
    prompt:
      'What changed in the investment thesis after the latest quarterly results? Before vs after on margins, segment mix, and normalized EPS.',
    playbookHint: 'Apply **Q2 post-results**. Before/after thesis table. State if PCCL/PARAMETERS refresh needed.',
  },
  {
    id: 'add-at-cmp',
    label: 'Add at CMP?',
    prompt:
      'Should I add shares at the current market price today? Run full buy discipline for my existing position size and avg cost.',
    playbookHint: 'Full **buy-decision-workflow** Steps 1–9. ≥3 quotes. Map to STAGED STARTER / WAIT / PAUSE ADDS only.',
  },
  {
    id: 'price-decline',
    label: 'Why did it fall?',
    prompt:
      'Why has the stock fallen from its recent peak? Driver table (FACT vs narrative), structural vs temporary, and PCCL implication before any average-down.',
    playbookHint: 'Apply **Q4 price-decline** + price-decline-analysis skill. Mandatory driver table. No average on sentiment alone.',
  },
  {
    id: 'pccl-sip',
    label: 'PCCL & SIP pace',
    prompt:
      'Where is price vs Applied PCCL and valuation tier? What SIP pace and add gate apply for me as an existing holder?',
    playbookHint: 'Apply **Q5 PCCL/SIP**. Report Rational/Conviction/Base/Applied PCCL if they differ. Cite suggested-approach tiers.',
  },
  {
    id: 'pe-vs-history',
    label: 'Vs own 10Y P/E',
    prompt:
      'Is the stock cheap or expensive versus its own 10-year P/E and owner earnings yield history? Separate history from forward earnings power.',
    playbookHint: 'Apply **Q6 vs history**. Excerpt PARAMETERS Part 1. Warn: cheap vs history ≠ justified growth P/E.',
  },
];

const ARCHETYPE_PATTERNS: { id: StockQuestionArchetypeId; re: RegExp }[] = [
  { id: 'pe-growth-sync', re: /p\s*\/?\s*e|peg|multiple|justified|in sync|growth.*pe|pe.*growth|valuation.*result/i },
  { id: 'post-results', re: /after (the )?latest|what changed|post.?results|quarterly result/i },
  { id: 'add-at-cmp', re: /\b(buy|add|accumulate|purchase)\b/i },
  { id: 'price-decline', re: /why (did|has).*fall|drawdown|down \d+%|average down|52.?week low/i },
  { id: 'pccl-sip', re: /pccl|premium to|sip pace|add gate|valuation tier/i },
  { id: 'pe-vs-history', re: /10\s*y|historical p\s*\/?\s*e|owner yield|parameters|own history/i },
];

/** Pick strongest matching archetype for agent playbook injection (stock context only). */
export function matchStockQuestionArchetype(query: string): StockQuickQuestion | null {
  const trimmed = query.trim();
  for (const q of STOCK_QUICK_QUESTIONS) {
    if (trimmed === q.prompt || trimmed.startsWith(q.prompt.slice(0, 40))) return q;
  }
  for (const { id, re } of ARCHETYPE_PATTERNS) {
    if (re.test(trimmed)) {
      return STOCK_QUICK_QUESTIONS.find((q) => q.id === id) ?? null;
    }
  }
  return null;
}

export function stockQuestionPlaybookForAgent(archetype: StockQuickQuestion | null): string {
  if (!archetype) return '';
  return `\n## Stock question archetype: ${archetype.id}\n\n${archetype.playbookHint}\n\nFollow sections in StockBook/STOCK-QUESTION-FRAMEWORK.md. End with a **FAQ write-back** snippet (Q/A bullet for faq.md).\n`;
}
