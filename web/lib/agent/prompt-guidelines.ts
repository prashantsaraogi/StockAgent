/**
 * Framework prompt catalog — queries Ask Agent / Cursor agent understands.
 * Web badges: which prompts work in web Ask Agent vs Cursor-only.
 */

export type PromptChannel = 'web' | 'cursor' | 'both';

export interface PromptExample {
  id: string;
  title: string;
  description: string;
  prompt: string;
  channel: PromptChannel;
  /** Framework files / workflows triggered */
  framework: string[];
  /** Replace placeholders before copy */
  placeholders?: string[];
}

export interface PromptCategory {
  id: string;
  label: string;
  description: string;
  prompts: PromptExample[];
}

export const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: 'buy-add',
    label: 'Buy / Add / Deploy',
    description:
      'Full buy-decision-workflow (10 steps) · PCCL · quotes lens · personal discipline pre-flight.',
    prompts: [
      {
        id: 'buy-today',
        title: 'Buy decision today (single stock)',
        description:
          'Mandatory for fresh capital or add — runs exclusion guards, PCCL, catalyst band, ≥3 quotes.',
        prompt: `BUY DECISION today — run full framework for {TICKER}.

1. investor-wisdom/buy-decision-workflow.md — all 10 steps
2. investor-wisdom/personal-discipline.md — pause registry
3. stock-analysis + exclusion-guards
4. Read StockBook — summary · faq · PARAMETERS · suggested-approach
5. Quotes lens — ≥3 quotes from investor-wisdom/quotes.md
6. Verdict: STAGED STARTER OK | ACCUMULATE SIP | WAIT | PAUSE ADDS

Surplus rank vs quadrant-map. Do not suggest selling other holdings to fund this.`,
        channel: 'both',
        framework: ['buy-decision-workflow', 'personal-discipline', 'PCCL', 'quotes.md'],
        placeholders: ['{TICKER}'],
      },
      {
        id: 'should-i-add',
        title: 'Should I add at CMP?',
        description: 'Existing holder scale-in — premium-to-PCCL caps, dual lens, YoC if dividend name.',
        prompt: `Should I add {TICKER} at CMP today? I hold {QTY} shares @ ₹{AVG_COST}.

Run buy-decision-workflow + PCCL dual anchor (Rational + Conviction if stated).
Check: pause registry · structural buckets · premium-to-PCCL size caps · blended YoC if dividend name.
Verdict with quotes lens — no averaging down to fix cost.`,
        channel: 'both',
        framework: ['buy-decision-workflow', 'premium-add-sizing', 'yield-on-cost-overlay'],
        placeholders: ['{TICKER}', '{QTY}', '{AVG_COST}'],
      },
      {
        id: 'compare-fresh',
        title: 'Compare fresh surplus deployment',
        description: 'Comparative scorecard — which name gets salary ₹ today (not sell-to-rotate).',
        prompt: `Compare fresh surplus deployment: {TICKER1} vs {TICKER2} [vs {TICKER3}].

Run buy-decision-workflow for each · comparative scorecard · state #1 rank for salary capital today.
Read latest News + PARAMETERS + quadrant-map. Quotes lens on final verdict.
Never frame as sell A to buy B.`,
        channel: 'both',
        framework: ['comparative-scorecard', 'buy-decision-workflow', 'dynamic-capital-allocation'],
        placeholders: ['{TICKER1}', '{TICKER2}', '{TICKER3}'],
      },
      {
        id: 'lump-sum-check',
        title: 'Lump sum vs staged starter',
        description: 'Impulse control — staged starter cap when catalyst 50–65% or above Tier 2 PCCL.',
        prompt: `I want to deploy ₹{AMOUNT} lump sum into {TICKER} today. Staged starter or lump sum?

Run buy-decision-workflow Step 8–9 · quotes lens (patience / impulse quotes).
State max starter size if above Applied PCCL. Flag personal discipline if averaging underwater book.`,
        channel: 'both',
        framework: ['buy-decision-workflow', 'quotes.md', 'personal-discipline'],
        placeholders: ['{TICKER}', '{AMOUNT}'],
      },
    ],
  },
  {
    id: 'hold-pause',
    label: 'Hold / Pause / Wait',
    description: 'Long-term investor mandate — default HOLD; no TRIM/SELL for valuation alone.',
    prompts: [
      {
        id: 'hold-thesis',
        title: 'Hold thesis check',
        description: 'Quarterly monitoring — thesis intact vs structural break.',
        prompt: `HOLD thesis check for {TICKER} — is the original investment case still valid today?

Load StockBook summary-analysis + latest News for this ticker.
Report: business quality · earnings momentum · core-problem status · verdict HOLD or PAUSE ADDS.
Do not suggest TRIM/SELL unless existential criteria (long-term-investor-mandate).`,
        channel: 'both',
        framework: ['long-term-investor-mandate', 'StockBook AGENT-RULES'],
        placeholders: ['{TICKER}'],
      },
      {
        id: 'pause-adds',
        title: 'Why pause adds?',
        description: 'Concentration, expensive tier, structural bucket — not a sell call.',
        prompt: `Why PAUSE ADDS on {TICKER}? I already hold it.

Explain framework reason: PCCL tier · overweight · structural threat · pause registry · YoC gate.
Default HOLD legacy shares. Fresh surplus % = 0% if in IT/AI, HDFC Bank governance, or ITC tax buckets.`,
        channel: 'both',
        framework: ['personal-discipline', 'continuous-sip-valuation-tiers'],
        placeholders: ['{TICKER}'],
      },
      {
        id: 'wait-vs-watchlist',
        title: 'WAIT vs WATCHLIST',
        description: 'Catalyst probability <50% or stretched valuation without margin of safety.',
        prompt: `{TICKER} — should I WAIT or WATCHLIST for fresh entry?

Run core-problem test · catalyst probability rule · PCCL gap at CMP.
Label FACT vs ASSUMPTION. Include ≥1 quote on patience if WAIT.`,
        channel: 'both',
        framework: ['core-problem test', 'catalyst probability', 'PCCL'],
        placeholders: ['{TICKER}'],
      },
    ],
  },
  {
    id: 'pccl-valuation',
    label: 'PCCL & Valuation',
    description: 'Pessimistic case conviction limit · margin of safety · fair value tiers.',
    prompts: [
      {
        id: 'pccl-calc',
        title: 'PCCL and premium at CMP',
        description: 'Rational + Conviction dual anchor · Applied PCCL on loss positions.',
        prompt: `What is PCCL for {TICKER} at CMP? Report Rational, Conviction (if any), Base, and Applied PCCL.

Premium to Applied PCCL % · MoS vs conservative IV · four-scenario valuation.
If I hold below avg cost, apply loss-position floor rule.`,
        channel: 'both',
        framework: ['PCCL dual-anchor', 'pccl-loss-position-floor', 'valuation-analysis'],
        placeholders: ['{TICKER}'],
      },
      {
        id: 'why-cheap',
        title: 'Core-problem test — why cheap?',
        description: 'Mandatory at or near PCCL — temporary vs structural.',
        prompt: `Why is {TICKER} cheap at CMP? Run core-problem test.

Classify: temporary/cyclical vs structural/permanent.
Check governance · legal · AI/disruption · leverage · earnings quality.
Verdict: investigate before add.`,
        channel: 'both',
        framework: ['core-problem test', 'structural-threat-analysis'],
        placeholders: ['{TICKER}'],
      },
      {
        id: 'fair-value-tier',
        title: 'Valuation tier & SIP pace',
        description: 'Five valuation tiers — token vs steady vs accelerate.',
        prompt: `{TICKER} — valuation tier at CMP (Very expensive → Best cost) and recommended SIP pace.

Use continuous-sip-valuation-tiers + StockBook suggested-approach Axis A/B.
Separate business quality from price attractiveness.`,
        channel: 'both',
        framework: ['continuous-sip-valuation-tiers', 'PARAMETERS Part 1 + Part 2'],
        placeholders: ['{TICKER}'],
      },
      {
        id: 'yoc-dividend',
        title: 'Yield on cost (dividend names)',
        description: 'OMC, PSU, banks — 8% blended YoC gate before adds above PCCL.',
        prompt: `{TICKER} — YoC analysis for add decision. My avg cost ₹{AVG_COST}, qty {QTY}.

Normalized dividend YoC on deployed capital · 8% add gate · blended YoC after proposed add @ CMP.
Never use dividend yield on CMP as primary metric for existing holders.`,
        channel: 'both',
        framework: ['yield-on-cost-overlay', 'PCCL'],
        placeholders: ['{TICKER}', '{AVG_COST}', '{QTY}'],
      },
    ],
  },
  {
    id: 'compare-rank',
    label: 'Compare & Surplus Rank',
    description: 'Dynamic capital allocation — surplus only, not sell-to-rotate.',
    prompts: [
      {
        id: 'sector-rank',
        title: 'Sector surplus band today',
        description: 'Module E + ground reality — which sectors get 0% vs 25–30% surplus.',
        prompt: `Which sectors get fresh surplus capital this month? Refresh dynamic capital allocation rank.

Read latest News summaries · sector comparative ranks · quadrant-map.
State % slice per sector and top name within each. IT cluster = 0% if structural headwind unchanged.`,
        channel: 'both',
        framework: ['dynamic-capital-allocation', 'sector-news-orientation-lens'],
      },
      {
        id: 'precision-engineering-sector',
        title: 'Precision Engineering — sector score + peers',
        description:
          'India manufacturing depth theme — separate from Auto OEM volume and Infra EPC.',
        prompt: `Refresh Precision Engineering sector — StockBook/Precision Engineering/precision-engineering-sector-outlook.md.

1. Re-score 6 parameters (China+1, PLI, defence indigenisation, export auto-tier-2, EV precision content)
2. Update cap-tier tables: Bharat Forge · TI India · Sona Comstar · Kaynes · MTAR · Motherson · Balkrishna
3. Refresh precision-engineering-comparative-rank.md for surplus rank
4. Update SECTOR-OUTLOOK-INDEX · run Industry Growth web mcap refresh

Cross-ref Auto (OEM) and Infrastructure (EPC) — do not duplicate primary lens.`,
        channel: 'both',
        framework: ['SECTOR-OUTLOOK-FRAMEWORK', 'thematic-comparative-analysis'],
      },
      {
        id: 'india-strategic-manufacturing-themes',
        title: 'India strategic manufacturing — 5 thematic sectors',
        description:
          'AI DC · semicon · CDMO · aerospace/space · HV grid — chain map + Industry Growth scores.',
        prompt: `Refresh India 2030 strategic manufacturing — StockBook/India Strategic Manufacturing/india-strategic-manufacturing-thesis.md.

For each thematic sector outlook + comparative-rank (AI DC · Semiconductor/Electronics · Specialty CDMO · Aerospace/Space · HV Grid):
1. Re-score 6 parameters · cap-tier tables · live-search policy/KPIs (analysis date = today)
2. Cross-ref Precision Engineering for MTAR/forging · Infrastructure for legacy data-centre rank
3. Update SECTOR-OUTLOOK-INDEX · run Industry Growth refresh-sector-mcap

Thematic score ≠ buy at any price — filter with ROCE · FCF · debt · PCCL.`,
        channel: 'both',
        framework: ['SECTOR-OUTLOOK-FRAMEWORK', 'thematic-comparative-analysis'],
      },
      {
        id: 'bank-compare',
        title: 'Compare banks for fresh ₹',
        description: 'Within-sector peer rank — e.g. ICICI vs HDFC vs PNB.',
        prompt: `Rank for fresh capital today: ICICIBANK vs HDFCBANK vs PNB (or my bank holdings).

Governance screen on HDFC Bank · fraud-detection for all banks · PCCL gap · surplus rank.
Fresh capital only — not sell-to-rotate.`,
        channel: 'both',
        framework: ['comparative-scorecard', 'fraud-detection-analysis', 'bank-governance'],
      },
      {
        id: 'thematic-compare',
        title: 'Thematic / value-chain compare',
        description: 'Multi-ticker theme exposure — writes comparative rank to StockBook.',
        prompt: `Thematic compare — {THEME} exposure: {TICKER1}, {TICKER2}, {TICKER3}.

Run thematic-comparative-analysis · fresh-entry rank · write StockBook theme comparative file.`,
        channel: 'cursor',
        framework: ['thematic-comparative-analysis', 'StockBook write-back'],
        placeholders: ['{THEME}', '{TICKER1}', '{TICKER2}', '{TICKER3}'],
      },
    ],
  },
  {
    id: 'news',
    label: 'News & Daily Context',
    description: 'Dated News archive · SEARCH-WORKFLOW · portfolio impact table.',
    prompts: [
      {
        id: 'news-date',
        title: 'Add news for a date',
        description: 'Web Ask Agent writes News/YYYY-MM/DD/summary.md — stock-wise holdings loop.',
        prompt: `Add news for {DATE} — run News/SEARCH-WORKFLOW for all portfolio holdings.

Write News/{YYYY-MM}/{DATE}/summary.md with portfolio impact table, macro, geo, triggers.
Search window: {DATE} 00:01–23:59 IST. Label FACT vs UNVERIFIED.`,
        channel: 'web',
        framework: ['News/AGENT-RULES', 'News/SEARCH-WORKFLOW'],
        placeholders: ['{DATE}'],
      },
      {
        id: 'news-today',
        title: 'Run news for today',
        description: 'Partial window if intraday — state buckets A/B/C scanned.',
        prompt: `Run news for today — partial IST window to now.

Stock-wise loop all holdings · primary four outlets · write today's summary.md.`,
        channel: 'web',
        framework: ['News/SEARCH-WORKFLOW', 'News/TICKER-INDEX'],
      },
      {
        id: 'news-ticker',
        title: 'Latest news impact on holding',
        description: 'Read News + TICKER-INDEX before thesis or SIP pace change.',
        prompt: `Latest news impact on {TICKER} — read News/TICKER-INDEX and today's summary.

How does it affect current value @ CMP, SIP pace, or PCCL? Structural vs temporary?`,
        channel: 'both',
        framework: ['News/AGENT-RULES', 'dynamic-context-analysis'],
        placeholders: ['{TICKER}'],
      },
      {
        id: 'morning-a',
        title: 'Morning run — Variant A (early IST)',
        description: 'Cursor full morning run — news + scripts + surplus brief.',
        prompt: `Run my India Stock Investment Agent MORNING FRAMEWORK — Variant A (early morning).

Follow: .cursor/prompts/MORNING-FRAMEWORK-SEQUENCE.md

PHASE 0 — Read: holdings.md · latest News/summary.md · TICKER-INDEX · quadrant-map
PHASE 1 — NEWS: SEARCH-WORKFLOW · stock-wise 50 holdings · write summary.md
PHASE 2 — Portfolio numbers scripts (CAGR, PARAMETERS)
PHASE 3 — Surplus / quadrant-map if rank shifted
PHASE 4 — Deliver brief: macro · top 5 news · surplus changes · ADD/PAUSE flips

No TRIM/SELL. Persist to files — not chat only.`,
        channel: 'cursor',
        framework: ['MORNING-FRAMEWORK-SEQUENCE', 'MORNING-RUN-PROMPT Variant A'],
      },
      {
        id: 'morning-b',
        title: 'Morning run — Variant B (post-close)',
        description: 'Full calendar day news — Bucket C post-close priority.',
        prompt: `Run MORNING FRAMEWORK — Variant B (post-close pass).

News window = today 00:01–23:59 IST · Bucket C priority · complete stock-wise gaps from morning.
Merge same-day summary.md · update TICKER-INDEX.`,
        channel: 'cursor',
        framework: ['MORNING-RUN-PROMPT Variant B', 'News/SEARCH-WORKFLOW'],
      },
    ],
  },
  {
    id: 'risk-forensics',
    label: 'Risk, Legal & Forensics',
    description: 'Governance · fraud · litigation · price-decline attribution.',
    prompts: [
      {
        id: 'price-decline',
        title: 'Why did the stock fall?',
        description: 'Mandatory when down ≥15% from peak — driver table before averaging.',
        prompt: `{TICKER} fell sharply from recent high — why? Run price-decline-analysis (§22).

Peak price · date · % decline · driver table (FACT/HYPOTHESIS) · structural vs temporary.
Explicit yes/no on add at CMP.`,
        channel: 'both',
        framework: ['price-decline-analysis', 'core-problem test'],
        placeholders: ['{TICKER}'],
      },
      {
        id: 'governance-bank',
        title: 'Bank governance / fraud screen',
        description: 'Always live-search — branch fraud, mis-selling, ED/PMLA.',
        prompt: `Governance and fraud screen for {BANK_TICKER} — latest news and exchange filings.

Employee fraud · mis-selling · whistleblower · regulator findings vs management denial.
Impact on management rating and PCCL.`,
        channel: 'both',
        framework: ['fraud-detection-analysis', 'bank-governance-checklist'],
        placeholders: ['{BANK_TICKER}'],
      },
      {
        id: 'legal-overhang',
        title: 'Legal / tax overhang sizing',
        description: 'Quantify best/base/worst liability vs net cash — position caps.',
        prompt: `Legal threat analysis for {TICKER} — proceeding register · catalyst probability.

Classify: dispute vs existential · worst case vs net worth · fresh capital cap.
Good operations do not override unresolved existential legal loss.`,
        channel: 'both',
        framework: ['legal-threat-analysis', 'legal-overhang-speculative-sizing'],
        placeholders: ['{TICKER}'],
      },
      {
        id: 'ai-structural',
        title: 'AI / structural threat',
        description: 'Permanent moat erosion vs cyclical — IT cluster rules.',
        prompt: `Structural threat assessment for {TICKER} — AI, disruption, or regulatory destruction of economics.

Temporary crisis vs permanent change · numerical evidence of adaptation · PCCL impact.
IT names: 0% surplus if structural headwind dominant.`,
        channel: 'both',
        framework: ['structural-threat-analysis', 'personal-discipline IT bucket'],
        placeholders: ['{TICKER}'],
      },
    ],
  },
  {
    id: 'portfolio',
    label: 'Portfolio & Holdings',
    description: 'Holdings context · trade update · portfolio reality check.',
    prompts: [
      {
        id: 'trade-update',
        title: 'Record a buy/sell trade',
        description: 'Update holdings.md · CAGR lot · StockBook write-back.',
        prompt: `Update portfolio: bought {QTY} {TICKER} @ ₹{PRICE} on {YYYY-MM-DD}.

Update holdings.md · CAGR lot file · quadrant-map if needed · StockBook faq write-back.`,
        channel: 'cursor',
        framework: ['holdings.md', 'portfolio-analysis'],
        placeholders: ['{TICKER}', '{QTY}', '{PRICE}', '{YYYY-MM-DD}'],
      },
      {
        id: 'surplus-deploy',
        title: 'Where to deploy salary surplus?',
        description: 'Rank by risk/reward today — dynamic potential-weighted allocation.',
        prompt: `I have ₹{AMOUNT} salary surplus this month — where should it go per framework rank?

Read quadrant-map · latest News · PCCL gaps · pause registry. Top 3 names with % split.
No sell-to-rotate.`,
        channel: 'both',
        framework: ['dynamic-capital-allocation', 'buy-decision-workflow'],
        placeholders: ['{AMOUNT}'],
      },
      {
        id: 'ask-agent-stock-search',
        title: 'Ask Agent — Stock search tab',
        description:
          'Web `/chat` → **Stock search**: pick ticker → investment view with **Factor lens** table (🟢/🟡/🔴) + scorecard. Thread restores from your account + Analysis Log.',
        prompt: `Web Ask Agent — Stock search mode — {TICKER}

Full investor view (same engine as Stock Analysis → Basic): one-line, your position, valuation, what to do — no internal framework headings.`,
        channel: 'web',
        framework: ['buy-decision-workflow', 'personal-discipline', 'PCCL'],
        placeholders: ['{TICKER}'],
      },
      {
        id: 'ask-agent-general-query',
        title: 'Ask Agent — General question tab',
        description:
          'Web `/chat` → **General question**: portfolio, sector, news, compare — summary-first answer. Saved per user; `/chat` reloads recent Q&A.',
        prompt: `Web Ask Agent — General question mode

User question: {QUERY}

Reply with **Summary** (2–4 sentences) then short **Details** only. Framework runs internally; no file paths or workflow steps in the reply.`,
        channel: 'web',
        framework: ['buy-decision-workflow', 'portfolio-analysis'],
        placeholders: ['{QUERY}'],
      },
      {
        id: 'portfolio-review',
        title: 'Portfolio reality check',
        description: 'Large holdings — capital productive? thesis valid?',
        prompt: `Portfolio reality check — which large holdings should PAUSE new adds (not sell)?

ROCE · EPS trend · cash conversion · concentration · opportunity cost for fresh capital only.`,
        channel: 'both',
        framework: ['portfolio-analysis', 'long-term-investor-mandate'],
      },
      {
        id: 'portfolio-dividend-rank',
        title: 'Refresh portfolio dividend rank',
        description:
          'YoC top 10 + absolute ₹ top 10 + CMP yield top 10 — update registry + markdown.',
        prompt: `Refresh portfolio dividend rank for all holdings.

Read holdings.md · dividend-fy26.json · yield-on-cost-overlay.md.
1. Update dividend-fy26.json FY26 div/sh per ticker (FACT labels)
2. Regenerate .cursor/portfolio/portfolio-dividend-rank.md — List 1 YoC top 10 + List 2 absolute ₹ (YoC < 8%) + List 3 note (CMP live on web)
3. Note IOC normalized vs trailing · 8% add gate read

Web Portfolio page recomputes Lists 1–3 from registry + lots + live CMP automatically.`,
        channel: 'both',
        framework: ['yield-on-cost-overlay', 'holdings.md', 'portfolio-dividend-rank.md'],
      },
    ],
  },
  {
    id: 'stock-deep',
    label: 'Stock Deep-Dive',
    description: 'Full StockBook read order · PARAMETERS · write-back.',
    prompts: [
      {
        id: 'analyze-stock',
        title: 'Full stock analysis',
        description: 'Full disciplined analysis — exclusion guards first.',
        prompt: `Full framework analysis for {TICKER} at CMP.

Read StockBook: summary → faq → suggested-approach → detail → PARAMETERS → risk files.
Run exclusion guards · business quality · earnings quality · PCCL · verdict.
Write-back StockBook if material update.`,
        channel: 'both',
        framework: ['stock-analysis SKILL', 'StockBook AGENT-RULES'],
        placeholders: ['{TICKER}'],
      },
      {
        id: 'stock-pe-growth-sync',
        title: 'P/E vs latest results (in sync?)',
        description:
          'Same playbook as StockBook Ask sidebar — normalize one-offs, sync table, holder add-gate.',
        prompt: `{TICKER} — Is trailing P/E justified vs latest quarterly results? Are growth and P/E in sync?

Run StockBook/STOCK-QUESTION-FRAMEWORK.md **Q1**. Read PARAMETERS + EARNINGS_QUALITY + latest filing (live-search, date checked).
Strip one-offs · normalized PAT · Growth vs P/E sync table · PEG on normalized EPS growth · vs 10Y P/E · portfolio add-gate if held.
Write-back suggested Q/A to faq.md.`,
        channel: 'both',
        framework: ['STOCK-QUESTION-FRAMEWORK', 'PARAMETERS-FRAMEWORK', 'EARNINGS-QUALITY-FRAMEWORK'],
        placeholders: ['{TICKER}'],
      },
      {
        id: 'results-update',
        title: 'Post-results thesis update',
        description:
          'Refresh PCCL · FAQ · summary · Earnings Quality Part A row + quarterly section D.',
        prompt: `{TICKER} Q{QN} FY{YY} results — update thesis.

Normalize earnings · raise/lower PCCL if evidence · ADD/HOLD/PAUSE ADDS.
Write-back: faq.md · summary-analysis.md · EARNINGS_QUALITY_{TICKER}.md (Part A FY row if annual · section D quarterly · cross-check warnings).`,
        channel: 'both',
        framework: ['fundamental-analysis', 'EARNINGS-QUALITY-FRAMEWORK', 'StockBook write-back'],
        placeholders: ['{TICKER}', '{QN}', '{YY}'],
      },
      {
        id: 'parameters-read',
        title: 'PARAMETERS cheap vs expensive',
        description: 'Part 1 rear-view vs Part 2 forward — Axis B confirmatory only.',
        prompt: `{TICKER} — PARAMETERS read: Part 1 (10Y) vs Part 2 (forward) @ CMP.

Cheap or expensive vs history? Forward IV premium? ADD case from PARAMETERS quick read.`,
        channel: 'both',
        framework: ['PARAMETERS-FRAMEWORK', 'sector-news-orientation-lens'],
        placeholders: ['{TICKER}'],
      },
    ],
  },
  {
    id: 'stock-calculator',
    label: 'Stock Analysis',
    description:
      'Web tabs — populate StockBook files; run Analyze (basic or advanced) to verify Part A/B, Gordon PE, scorecards.',
    prompts: [
      {
        id: 'full-analysis-all-tabs',
        title: 'Stock Analysis — all 6 modules (basic or advanced)',
        description:
          'Populate StockBook then run **Analyze** — Basic also shows **Investment view** (chat-style narrative).',
        prompt: `Prepare StockBook for {TICKER} then verify all Stock Analysis modules.

1. Refresh PARAMETERS · MARGIN · EARNINGS_QUALITY · BUSINESS_QUALITY · RISK_DECISION · summary/faq/detail (PCCL)
2. User runs **Stock Analysis → Analyze** — **Basic** (stock name only; default TTM P/E, 12% CAGR, 5Y) opens **Framework report** tab (holdings + discipline + PCCL + quotes) plus 6 modules; **Advanced** = custom P/E + CAGR
3. Cross-check Framework one-line vs module verdicts — flag conflicts (e.g. margin 🔴 but BQ 🟢)
4. **PEG** tab separately for combined P/E + growth scorecard

Modules: Framework report (Basic) · CAGR · PE · Earnings Quality · Margin · Business Quality · Risk.`,
        channel: 'both',
        framework: ['MARGIN-FRAMEWORK', 'EARNINGS-QUALITY-FRAMEWORK', 'PARAMETERS'],
        placeholders: ['{TICKER}'],
      },
      {
        id: 'earnings-quality-part-ab',
        title: 'Earnings Quality — Part A (5Y) + Part B (forward)',
        description:
          'Historical EPS path + risk-adjusted forward EPS — internal/external risk haircuts per FY.',
        prompt: `Earnings Quality Part A + Part B for {TICKER} — EARNINGS-QUALITY-FRAMEWORK.md v1.1.

**Part A:** Last 5 FY — Revenue, PAT, EPS, EPS YoY, CFO/PAT, quality signal. Write ## Part A table.
**Part B inputs:** PARAMETERS EPS CAGR · internal-negative-risk.md · external-negative-risk.md.
Current-year external overlay (e.g. oil price for auto) — full haircut FY27, taper outer years.

Also refresh section D quarterly · cross-check revenue↑ profit↓.
Verify in Stock Calculator → Earnings Quality tab.`,
        channel: 'both',
        framework: ['EARNINGS-QUALITY-FRAMEWORK', 'external-negative-risk', 'internal-negative-risk'],
        placeholders: ['{TICKER}'],
      },
      {
        id: 'earnings-quality-rear-view',
        title: 'Earnings Quality — 5Y EPS history only (Part A)',
        description: 'Rear-view quality — EPS CAGR, negative years, cash conversion flags.',
        prompt: `{TICKER} — build Earnings Quality Part A (five-year rear-view).

FY21–FY25 (or latest five): EPS, EPS YoY %, PAT, revenue, CFO/PAT where available.
Compute 5Y EPS CAGR · flag weak/negative EPS years · label FACT vs ASSUMPTION.
Write StockBook/EARNINGS_QUALITY_{TICKER}.md ## Part A table.`,
        channel: 'both',
        framework: ['EARNINGS-QUALITY-FRAMEWORK', 'fundamental-analysis'],
        placeholders: ['{TICKER}'],
      },
      {
        id: 'earnings-quality-forward',
        title: 'Earnings Quality — forward risk path (Part B)',
        description: 'Update risk registers when macro/sector shifts — feeds Part B haircuts + AI notes.',
        prompt: `{TICKER} — refresh Earnings Quality Part B forward context (analysis date = today).

Read/update external-negative-risk.md and internal-negative-risk.md.
State current FY dominant factor (oil, RBI, policy, competition, execution).
Note L1/L2/L3 and haircut rationale · update News/TICKER-INDEX if material.
Re-run Earnings Quality tab — check adjusted EPS growth FY27–FY31 table.`,
        channel: 'both',
        framework: ['EARNINGS-QUALITY-FRAMEWORK', 'dynamic-context-analysis'],
        placeholders: ['{TICKER}'],
      },
      {
        id: 'pe-gordon-fair',
        title: 'Gordon fair P/E + implied growth',
        description: 'PE Evaluation Part D — Fair P/E = 1/(R−G); inverse implied G at CMP P/E.',
        prompt: `{TICKER} — Gordon fair P/E and implied growth at CMP.

Required return R · sustainable growth G from PARAMETERS · fair P/E = 1/(R−G).
Compare CMP P/E vs fair · implied G = R − 1/P/E · growth gap vs base EPS CAGR.
Sensitivity — confirm with PCCL; Gordon is confirmatory not primary BUY trigger.
StockBook/PE-EVALUATION-FRAMEWORK.md Part D.`,
        channel: 'both',
        framework: ['PE-EVALUATION-FRAMEWORK', 'gordon-fair-pe', 'PARAMETERS'],
        placeholders: ['{TICKER}'],
      },
      {
        id: 'margin-full',
        title: 'Margin Analysis — full module (Part A–D)',
        description:
          '5Y margin path · vs 10Y history · drivers/pass-through · quarterly compression flags.',
        prompt: `{TICKER} — full Margin Analysis per MARGIN-FRAMEWORK.md.

Part A: 5Y Gross/EBITDA/EBIT/Net margins + signals
Part B: Today @ CMP vs 10Y normal (PARAMETERS)
Part C: Drivers + pass-through test (oil/RM, mix, discounting)
Part D: 8-quarter margin trend from EARNINGS_QUALITY

Flag volume↑ margin↓ · write MARGIN_{TICKER}.md · verify Margin Analysis tab.`,
        channel: 'both',
        framework: ['MARGIN-FRAMEWORK', 'EARNINGS-QUALITY-FRAMEWORK', 'PARAMETERS'],
        placeholders: ['{TICKER}'],
      },
      {
        id: 'margin-pass-through',
        title: 'Margin pass-through check',
        description: 'Did input-cost inflation destroy operating leverage? (e.g. auto Q1 FY27).',
        prompt: `{TICKER} — margin pass-through check at CMP.

Revenue growth vs EBITDA margin change (latest quarter + 5Y trend).
Classify: maintain / expand / lose margin. Cyclical RM vs structural discounting.
Update MARGIN_{TICKER}.md Part C + EARNINGS_QUALITY cross-check warning.`,
        channel: 'both',
        framework: ['MARGIN-FRAMEWORK', 'dynamic-context-analysis'],
        placeholders: ['{TICKER}'],
      },
      {
        id: 'peg-evaluation-full',
        title: 'PEG Evaluation — combined scorecard',
        description:
          'P/E + PEG + ROCE + debt + FCF · 100-pt model · Hero combo · max P/E at target PEG — not PEG alone.',
        prompt: `{TICKER} — PEG Evaluation per StockBook/PEG-FRAMEWORK.md.

1. Business → growth → ROCE → debt → FCF → P/E → PEG → entry price
2. Update PEG_{TICKER}.md FY26 overrides (FACT labels)
3. Zone table: P/E, PEG, ROCE, debt, FCF, revenue/PAT growth
4. 100-pt breakdown · combo check (ROCE>20, PEG<2, P/E<25, net cash, FCF)
5. Max P/E at PEG 1 / 1.5 / 2 / 2.5 for stated EPS growth
6. Infra lens for L&T-style FCF — do not use ITC FCF rules on EPC

Verify Stock Calculator → PEG Evaluation tab. Cross-ref PCCL — PEG does not override pessimistic buy limit.`,
        channel: 'both',
        framework: ['PEG-FRAMEWORK', 'PARAMETERS', 'PE-EVALUATION-FRAMEWORK'],
        placeholders: ['{TICKER}'],
      },
    ],
  },
  {
    id: 'ground-context',
    label: 'Ground Reality & Policy',
    description: 'Monthly KPIs · RBI · MSCI · geopolitical — dynamic context.',
    prompts: [
      {
        id: 'ground-auto',
        title: 'Auto / SIAM ground reality',
        description: 'Monthly sales vs industry — Hero, Maruti, etc.',
        prompt: `Latest SIAM auto sales ground reality — impact on MARUTI, HEROMOTOCO, my auto holdings.

Monthly trend + YoY · map to thesis and surplus rank.`,
        channel: 'both',
        framework: ['dynamic-context-analysis Module A'],
      },
      {
        id: 'rbi-policy',
        title: 'RBI / rate / liquidity impact',
        description: 'Policy → sector KPI → bank/NBFC names.',
        prompt: `Latest RBI policy stance — impact on my bank and NBFC holdings.

Transmission to credit growth · NIM · surplus rank within financials.`,
        channel: 'both',
        framework: ['dynamic-context-analysis Module B'],
      },
      {
        id: 'geo-oil',
        title: 'Geopolitical / oil scenario',
        description: 'Escalating vs de-escalating · OMC, INR, FII flows.',
        prompt: `Geopolitical oil scenario update — direction and India transmission.

Impact on IOC, ONGC, IGL, aviation, INR-sensitive names. Scenario tree + what upgrades/downgrades view.`,
        channel: 'both',
        framework: ['dynamic-context-analysis Module C'],
      },
    ],
  },
];

export const ALL_PROMPTS = PROMPT_CATEGORIES.flatMap((c) =>
  c.prompts.map((p) => ({ ...p, categoryId: c.id, categoryLabel: c.label }))
);

export function channelLabel(ch: PromptChannel): string {
  switch (ch) {
    case 'web':
      return 'Web Ask Agent';
    case 'cursor':
      return 'Cursor only';
    default:
      return 'Web + Cursor';
  }
}
