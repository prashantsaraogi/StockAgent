/**
 * Agent Services catalog — refresh jobs, daily maintenance, and analysis prompts.
 * One-click API actions vs copy-paste prompts for Cursor / Ask Agent.
 */

export type ServiceActionType = 'api' | 'prompt' | 'link' | 'info';
export type ServiceCadence = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'on-demand' | 'continuous';
export type ServiceChannel = 'web' | 'cursor' | 'both';

export interface AgentService {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  cadence: ServiceCadence;
  actionType: ServiceActionType;
  /** POST /api/services/run body.action */
  apiAction?: string;
  prompt?: string;
  href?: string;
  hrefLabel?: string;
  channel?: ServiceChannel;
  estimatedDuration?: string;
  /** Maps to status fields on ServicesPanel */
  statusField?:
    | 'sectorMcap'
    | 'latestNews'
    | 'sectorScores'
    | 'portfolioCmp'
    | 'cmpCache'
    | 'quarterResults'
    | 'brokerTargets';
  /** Show in "Run daily pack" / "Run all automated" */
  packMembership?: 'daily' | 'all-automated' | 'none';
}

export interface ServiceCategory {
  id: string;
  label: string;
  description: string;
  services: AgentService[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'market-data',
    label: 'Market data refresh',
    description:
      'CMP, quarterly results, broker calls, and derived P/E — daily-changing market inputs with cascade updates.',
    services: [
      {
        id: 'run-daily-market-pack',
        categoryId: 'market-data',
        title: 'Run daily market pack',
        description:
          'One click: refresh portfolio CMP in StockBook → scan for new quarter results → today\'s news. **Scheduled:** 8 AM IST via Task Scheduler (`register-morning-cron.ps1`) or HTTP cron.',
        cadence: 'daily',
        actionType: 'api',
        apiAction: 'run-daily-market-pack',
        channel: 'web',
        estimatedDuration: '~2–5 min',
        packMembership: 'daily',
      },
      {
        id: 'run-all-automated',
        categoryId: 'market-data',
        title: 'Run all automated services',
        description:
          'Daily pack + weekly sector mcap refresh — every one-click job in the Services tab.',
        cadence: 'on-demand',
        actionType: 'api',
        apiAction: 'run-all-automated',
        channel: 'web',
        estimatedDuration: '~3–7 min',
        packMembership: 'all-automated',
      },
      {
        id: 'refresh-portfolio-cmp',
        categoryId: 'market-data',
        title: 'Update CMP — all portfolio holdings',
        description:
          'Fetch live NSE quotes · write StockBook/_cmp-cache.json · update PARAMETERS (CMP + trailing P/E), CAGR returns, BROKER upside %, summary-analysis CMP lines.',
        cadence: 'daily',
        actionType: 'api',
        apiAction: 'refresh-portfolio-cmp',
        href: '/portfolio',
        hrefLabel: 'Portfolio',
        channel: 'web',
        estimatedDuration: '~30–90s',
        statusField: 'cmpCache',
        packMembership: 'daily',
      },
      {
        id: 'scan-quarter-results',
        categoryId: 'market-data',
        title: 'Scan for new quarterly results',
        description:
          'Flags holdings missing the current quarter (e.g. Q2 FY27) in summary / earnings files — run before full results refresh.',
        cadence: 'daily',
        actionType: 'api',
        apiAction: 'scan-quarter-results',
        channel: 'web',
        estimatedDuration: '~10s',
        statusField: 'quarterResults',
        packMembership: 'daily',
      },
      {
        id: 'refresh-quarter-results',
        categoryId: 'market-data',
        title: 'Refresh quarterly results (AI)',
        description:
          'After new results: update summary, EARNINGS_QUALITY, PARAMETERS TTM EPS/margins, PCCL, faq — cascade P/E and valuation tables.',
        cadence: 'quarterly',
        actionType: 'prompt',
        channel: 'both',
        estimatedDuration: '5–15 min per stock',
        prompt: `Refresh quarterly results for {TICKER} — analysis date = today.

1. Live-search latest quarter results + management commentary (BSE/NSE filings)
2. Update StockBook: summary-analysis.md · EARNINGS_QUALITY_{TICKER}.md (**Part A** 5Y table + section D quarterly) · MARGIN_{TICKER}.md (Part A margins + Part C drivers) · PARAMETERS_{TICKER}.md (TTM EPS, margins, Today @ CMP P/E)
3. Re-run PCCL if normalized EPS changed · update faq.md Q&A
4. Label FACT vs MANAGEMENT CLAIM · state quarter (e.g. Q2 FY27)

If multiple tickers flagged by scan — do highest-weight holdings first.`,
      },
      {
        id: 'refresh-broker-single',
        categoryId: 'market-data',
        title: 'Update broker call — one stock',
        description:
          'Daily broker flow: e.g. ICICI Securities target on HUL — Trendlyne + live search → BROKER_[TICKER].md.',
        cadence: 'daily',
        actionType: 'prompt',
        channel: 'both',
        estimatedDuration: '2–5 min',
        statusField: 'brokerTargets',
        prompt: `Update broker targets for {TICKER} — BROKER-TARGET-FRAMEWORK.md.

1. Trendlyne research-reports — latest target per broker house
2. Live search if Jefferies / Morgan Stanley missing
3. Write BROKER_{TICKER}.md · recalc upside vs live CMP
4. If material new call — one line in News/TICKER-INDEX.md

Street targets are secondary to PCCL — not a buy signal alone.`,
      },
      {
        id: 'refresh-broker-portfolio',
        categoryId: 'market-data',
        title: 'Refresh broker targets — full portfolio',
        description:
          'Batch broker refresh for all holdings · updates per-stock BROKER files + portfolio broker-target-prices summary.',
        cadence: 'weekly',
        actionType: 'prompt',
        channel: 'cursor',
        estimatedDuration: '30–60 min',
        statusField: 'brokerTargets',
        prompt: `Refresh broker targets for all portfolio holdings — StockBook/BROKER-TARGET-FRAMEWORK.md.

For each ticker in holdings.md:
1. Fetch Trendlyne latest report per broker · live-search supplements
2. Update BROKER_[TICKER].md · refresh CMP + upside
3. Regenerate .cursor/portfolio/broker-target-prices.md summary

Prioritize names with new results or large book weight.`,
      },
      {
        id: 'refresh-cmp-derived-metrics',
        categoryId: 'market-data',
        title: 'Derived metrics map (reference)',
        description:
          'What updates when CMP or results change — use before ADD/surplus rank decisions.',
        cadence: 'on-demand',
        actionType: 'info',
        channel: 'both',
        href: '/services',
        hrefLabel: 'Dependency map below',
      },
    ],
  },
  {
    id: 'automated',
    label: 'Automated data refresh',
    description:
      'One-click jobs that write directly to StockBook / News on disk — no manual copy-paste.',
    services: [
      {
        id: 'refresh-sector-mcap',
        categoryId: 'automated',
        title: 'Sector cap-tier market cap',
        description:
          'Refresh Mcap ₹ cr for all Large / Mid / Small tables across 17 sector outlook files (Yahoo NSE).',
        cadence: 'weekly',
        actionType: 'api',
        apiAction: 'refresh-sector-mcap',
        href: '/industry-analysis',
        hrefLabel: 'Industry Growth',
        channel: 'web',
        estimatedDuration: '~1–2 min',
        statusField: 'sectorMcap',
      },
      {
        id: 'news-today',
        categoryId: 'automated',
        title: 'News summary — today (IST)',
        description:
          'Run News/SEARCH-WORKFLOW for portfolio holdings and write News/YYYY-MM/DD/summary.md (partial window if intraday).',
        cadence: 'daily',
        actionType: 'api',
        apiAction: 'news-today',
        href: '/journal/news',
        hrefLabel: 'Daily News',
        channel: 'web',
        estimatedDuration: '~30s–2 min',
        statusField: 'latestNews',
      },
      {
        id: 'portfolio-cmp',
        categoryId: 'automated',
        title: 'Portfolio CMP (live NSE on page load)',
        description:
          'Dashboard and Portfolio pages fetch live NSE quotes on each load (5 min cache). Use “Update CMP — all portfolio holdings” to persist into StockBook files.',
        cadence: 'continuous',
        actionType: 'link',
        href: '/portfolio',
        hrefLabel: 'Open Portfolio',
        channel: 'web',
        statusField: 'portfolioCmp',
      },
    ],
  },
  {
    id: 'news-daily',
    label: 'News & daily context',
    description: 'Dated summaries, ticker index, and end-of-day passes.',
    services: [
      {
        id: 'news-date',
        categoryId: 'news-daily',
        title: 'News for a specific date',
        description: 'Full calendar-day SEARCH-WORKFLOW for all holdings — writes dated summary.md.',
        cadence: 'on-demand',
        actionType: 'prompt',
        channel: 'web',
        prompt: `Add news for {DATE} — run News/SEARCH-WORKFLOW for all portfolio holdings.

Write News/{YYYY-MM}/{DATE}/summary.md with portfolio impact table, macro, geo, triggers.
Search window: {DATE} 00:01–23:59 IST. Label FACT vs UNVERIFIED.`,
        statusField: 'latestNews',
      },
      {
        id: 'news-ticker-index',
        categoryId: 'news-daily',
        title: 'Update News/TICKER-INDEX',
        description: 'After a news run — persist ticker headlines for StockBook pre-read.',
        cadence: 'daily',
        actionType: 'prompt',
        channel: 'cursor',
        prompt: `Update News/TICKER-INDEX.md from the latest News summary.

Read today's summary.md · add material tickers · cross-ref portfolio holdings · label dates checked.`,
      },
      {
        id: 'morning-a',
        categoryId: 'news-daily',
        title: 'Morning run — Variant A (early IST)',
        description: 'Full morning sequence: news + scripts + surplus brief (Cursor).',
        cadence: 'daily',
        actionType: 'prompt',
        channel: 'cursor',
        estimatedDuration: '15–30 min',
        prompt: `Run my India Stock Investment Agent MORNING FRAMEWORK — Variant A (early morning).

Follow: .cursor/prompts/MORNING-FRAMEWORK-SEQUENCE.md

PHASE 0 — Read: holdings.md · latest News/summary.md · TICKER-INDEX · quadrant-map
PHASE 1 — NEWS: SEARCH-WORKFLOW · stock-wise 50 holdings · write summary.md
PHASE 2 — Portfolio numbers scripts (CAGR, PARAMETERS)
PHASE 3 — Surplus / quadrant-map if rank shifted
PHASE 4 — Deliver brief: macro · top 5 news · surplus changes · ADD/PAUSE flips

No TRIM/SELL. Persist to files — not chat only.`,
      },
      {
        id: 'morning-b',
        categoryId: 'news-daily',
        title: 'Morning run — Variant B (post-close)',
        description: 'Full calendar-day news pass — Bucket C post-close priority.',
        cadence: 'daily',
        actionType: 'prompt',
        channel: 'cursor',
        prompt: `Run MORNING FRAMEWORK — Variant B (post-close pass).

News window = today 00:01–23:59 IST · Bucket C priority · complete stock-wise gaps from morning.
Merge same-day summary.md · update TICKER-INDEX.`,
      },
    ],
  },
  {
    id: 'industry',
    label: 'Industry & sector outlook',
    description: '6-parameter sector scores, cap-tier universe, and comparative ranks.',
    services: [
      {
        id: 'refresh-all-sector-scores',
        categoryId: 'industry',
        title: 'Re-score all 17 sectors (6 parameters)',
        description:
          'Agent researches Growth, Profitability, India Structural, Capacity, Capital Quality, Risk/Valuation — updates all sector-outlook.md files (classic + thematic).',
        cadence: 'weekly',
        actionType: 'prompt',
        channel: 'cursor',
        estimatedDuration: '20–40 min',
        statusField: 'sectorScores',
        prompt: `Refresh all 17 sector outlook scores — run StockBook/SECTOR-OUTLOOK-FRAMEWORK.md end-to-end.

For each sector in SECTOR-OUTLOOK-INDEX.md:
1. Live-search latest sector KPIs, policy, peer results (analysis date = today)
2. Fill ## Sector score — 6 parameters table (/100 weighted)
3. Set **Analysis date:** and **Next weekly refresh due:**
4. Update SECTOR-OUTLOOK-INDEX rank table

Do not leave PENDING scores. Label FACT vs ASSUMPTION.`,
      },
      {
        id: 'refresh-single-sector',
        categoryId: 'industry',
        title: 'Refresh one sector outlook',
        description: 'Deep refresh for a single sector — score + cap-tier narrative.',
        cadence: 'on-demand',
        actionType: 'prompt',
        channel: 'both',
        prompt: `Refresh sector outlook for {SECTOR} — run SECTOR-OUTLOOK-FRAMEWORK.md.

Update 6-parameter score table · cap-tier universe tables (Large 5 / Mid 4 / Small 3) · sector view band.
Live-search ground reality. Write-back {sector}-sector-outlook.md + SECTOR-OUTLOOK-INDEX.`,
      },
      {
        id: 'refresh-precision-engineering',
        categoryId: 'industry',
        title: 'Precision Engineering — sector outlook + rank',
        description:
          'Separate theme: forgings, bearings, gears, defence/aerospace machining, export tier-2 — India strength lens.',
        cadence: 'weekly',
        actionType: 'prompt',
        channel: 'both',
        href: '/industry-analysis/precision-engineering',
        hrefLabel: 'Precision Engineering',
        prompt: `Refresh Precision Engineering sector — precision-engineering-sector-outlook.md + comparative-rank.

Re-score 6 parameters · cap tiers · India strength checklist · write SECTOR-OUTLOOK-INDEX.
Not Auto OEM volume · not Infra EPC.`,
      },
      {
        id: 'refresh-india-strategic-manufacturing',
        categoryId: 'industry',
        title: 'India strategic manufacturing — refresh all 5 themes',
        description:
          'Bundled weekly pass: AI DC · semicon/electronics · CDMO · aerospace/space · HV grid — scores + comparative ranks + thesis map.',
        cadence: 'weekly',
        actionType: 'prompt',
        channel: 'both',
        href: '/industry-analysis',
        hrefLabel: 'Industry Growth',
        prompt: `Refresh India 2030 strategic manufacturing themes — run SECTOR-OUTLOOK-FRAMEWORK.md for each:

1. AI Data Centre Infrastructure — ai-data-centre-infrastructure-sector-outlook.md + comparative-rank
2. Semiconductor and Electronics — semiconductor-electronics-sector-outlook.md + comparative-rank
3. Specialty Pharma CDMO — specialty-pharma-cdmo-sector-outlook.md + comparative-rank
4. Aerospace and Space — aerospace-space-sector-outlook.md + comparative-rank (MTAR overlap with Precision Engineering)
5. HV Grid Equipment — hv-grid-equipment-sector-outlook.md + comparative-rank

Update india-strategic-manufacturing-thesis.md · SECTOR-OUTLOOK-INDEX rank table · run web refresh-sector-mcap.`,
      },
      {
        id: 'sector-surplus-rank',
        categoryId: 'industry',
        title: 'Sector surplus band & rank',
        description: 'Which sectors get fresh salary capital this month — dynamic allocation.',
        cadence: 'weekly',
        actionType: 'prompt',
        channel: 'both',
        href: '/industry-analysis',
        hrefLabel: 'Industry Growth',
        prompt: `Which sectors get fresh surplus capital this month? Refresh dynamic capital allocation rank.

Read latest News summaries · sector comparative ranks · quadrant-map.
State % slice per sector and top name within each. IT cluster = 0% if structural headwind unchanged.`,
      },
      {
        id: 'cap-tier-universe',
        categoryId: 'industry',
        title: 'Rebuild cap-tier stock universe',
        description: 'Re-rank Large/Mid/Small tables per SECTOR-CAP-TIER-FRAMEWORK when peers shift.',
        cadence: 'monthly',
        actionType: 'prompt',
        channel: 'cursor',
        prompt: `Rebuild cap-tier universe for {SECTOR} per StockBook/SECTOR-CAP-TIER-FRAMEWORK.md.

Large cap · Mid cap · Small cap — **5 stocks per lens** (Growth + Market cap each).
Then run sector mcap refresh job for Mcap ₹ cr column.`,
      },
    ],
  },
  {
    id: 'market-context',
    label: 'Ground reality & policy',
    description: 'Monthly KPIs, RBI, geopolitical — dynamic context before forward P/E buys.',
    services: [
      {
        id: 'ground-auto',
        categoryId: 'market-context',
        title: 'Auto / SIAM monthly sales',
        description: 'SIAM ground reality — Hero, Maruti, industry vs holdings.',
        cadence: 'monthly',
        actionType: 'prompt',
        channel: 'both',
        prompt: `Latest SIAM auto sales ground reality — impact on MARUTI, HEROMOTOCO, my auto holdings.

Monthly trend + YoY · map to thesis and surplus rank.`,
      },
      {
        id: 'rbi-policy',
        categoryId: 'market-context',
        title: 'RBI / rate / liquidity',
        description: 'Policy transmission to banks, NBFCs, surplus rank within financials.',
        cadence: 'on-demand',
        actionType: 'prompt',
        channel: 'both',
        prompt: `Latest RBI policy stance — impact on my bank and NBFC holdings.

Transmission to credit growth · NIM · surplus rank within financials.`,
      },
      {
        id: 'geo-oil',
        categoryId: 'market-context',
        title: 'Geopolitical / oil scenario',
        description: 'Escalating vs de-escalating — OMC, INR, FII-sensitive names.',
        cadence: 'on-demand',
        actionType: 'prompt',
        channel: 'both',
        prompt: `Geopolitical oil scenario update — direction and India transmission.

Impact on IOC, ONGC, IGL, aviation, INR-sensitive names. Scenario tree + what upgrades/downgrades view.`,
      },
      {
        id: 'amfi-flows',
        categoryId: 'market-context',
        title: 'AMFI flows / SIP trend',
        description: 'Monthly AMC ground reality — flows and SIP for financial sector thesis.',
        cadence: 'monthly',
        actionType: 'prompt',
        channel: 'both',
        prompt: `Latest AMFI monthly flows and SIP trend — impact on AMC holdings and financial sector surplus rank.

Compare latest month + 3–6 month trend. Label FACT vs UNVERIFIED.`,
      },
    ],
  },
  {
    id: 'portfolio',
    label: 'Portfolio maintenance',
    description: 'Holdings updates, surplus deployment, and reality checks.',
    services: [
      {
        id: 'surplus-deploy',
        categoryId: 'portfolio',
        title: 'Deploy salary surplus',
        description: 'Rank by risk/reward today — no sell-to-rotate.',
        cadence: 'monthly',
        actionType: 'prompt',
        channel: 'both',
        href: '/portfolio',
        hrefLabel: 'Portfolio',
        prompt: `I have ₹{AMOUNT} salary surplus this month — where should it go per surplus rank?

Read quadrant-map · latest News · PCCL gaps · pause registry. Top 3 names with % split.
No sell-to-rotate.`,
      },
      {
        id: 'portfolio-review',
        categoryId: 'portfolio',
        title: 'Portfolio reality check',
        description: 'Large holdings — PAUSE adds vs thesis intact (not sell for valuation).',
        cadence: 'quarterly',
        actionType: 'prompt',
        channel: 'both',
        prompt: `Portfolio reality check — which large holdings should PAUSE new adds (not sell)?

ROCE · EPS trend · cash conversion · concentration · opportunity cost for fresh capital only.`,
      },
      {
        id: 'stock-ask-pe-sync',
        categoryId: 'portfolio',
        title: 'Stock Q&A — P/E vs results (StockBook)',
        description:
          'Structured answer on any holding: P/E sync, one-offs, add-gate — web sidebar or Cursor. Writes to Analysis Log + suggested faq.md.',
        cadence: 'on-demand',
        actionType: 'prompt',
        channel: 'both',
        href: '/stockbook',
        hrefLabel: 'Open StockBook',
        prompt: `{TICKER} — Is current P/E justified vs latest results? Growth and P/E in sync?

Open StockBook page → Ask sidebar (or run here). STOCK-QUESTION-FRAMEWORK Q1:
normalize PAT · sync table · PARAMETERS 10Y P/E · holder PCCL/add-gate · FAQ write-back.`,
      },
      {
        id: 'trade-update',
        categoryId: 'portfolio',
        title: 'Record buy/sell trade',
        description: 'Update holdings.md, CAGR lot, StockBook write-back.',
        cadence: 'on-demand',
        actionType: 'prompt',
        channel: 'cursor',
        prompt: `Update portfolio: bought {QTY} {TICKER} @ ₹{PRICE} on {YYYY-MM-DD}.

Update holdings.md · CAGR lot file · quadrant-map if needed · StockBook faq write-back.`,
      },
      {
        id: 'portfolio-index-benchmark',
        categoryId: 'portfolio',
        title: 'Stock vs index report (per login)',
        description:
          'On Portfolio: vs your cost (P&L), monthly/yearly stock vs sector index, top-5 lag/lead. Download CSV/HTML — built from that user’s lots only (Supabase or dev tenant).',
        cadence: 'weekly',
        actionType: 'link',
        channel: 'web',
        href: '/portfolio',
        hrefLabel: 'Open Portfolio report',
      },
      {
        id: 'portfolio-dividend-rank',
        categoryId: 'portfolio',
        title: 'Portfolio dividend rank — YoC + absolute ₹',
        description:
          'Three lenses: YoC top 10 · highest ₹ (YoC below 8%) · dividend yield @ CMP. Collapsible tables on Portfolio.',
        cadence: 'quarterly',
        actionType: 'prompt',
        channel: 'both',
        href: '/portfolio',
        hrefLabel: 'Portfolio dividend tables',
        prompt: `Refresh portfolio dividend rank for all holdings.

Read holdings.md · dividend-fy26.json · yield-on-cost-overlay.md.
Update dividend-fy26.json · regenerate portfolio-dividend-rank.md (YoC top 10 + absolute ₹ top 10).`,
      },
    ],
  },
  {
    id: 'stock-calculator',
    label: 'Stock Analysis',
    description:
      'Holdings & buy candidates — CAGR · P/E · PEG · Earnings Quality · Margin · Business Quality · Risk. Populate StockBook files the tabs read.',
    services: [
      {
        id: 'refresh-earnings-quality',
        categoryId: 'stock-calculator',
        title: 'Refresh Earnings Quality — Part A + Part B',
        description:
          '5Y rear-view EPS table (Part A) + risk-adjusted forward path inputs (Part B via internal/external risk files). Powers Stock Analysis → Earnings Quality tab.',
        cadence: 'quarterly',
        actionType: 'prompt',
        channel: 'both',
        href: '/stock-calculator/earnings-quality',
        hrefLabel: 'Earnings Quality tab',
        estimatedDuration: '10–20 min per stock',
        prompt: `Refresh Earnings Quality for {TICKER} — StockBook/EARNINGS-QUALITY-FRAMEWORK.md v1.1.

**Part A — Five-year rear-view**
1. Live-search annual results FY21–FY25 (or latest five FYs) — Revenue, PAT, EPS, EPS YoY, CFO/PAT
2. Write ## Part A table in EARNINGS_QUALITY_{TICKER}.md · label FACT vs UNVERIFIED
3. Flag one-off years (tax/structure) in Note column · quality signal 🟢/🟡/🔴

**Part B inputs (forward path — tab reads automatically)**
4. Confirm PARAMETERS base EPS CAGR · internal-negative-risk.md · external-negative-risk.md
5. Update external factors if macro shifted (e.g. oil L1/L2 for auto/OMC in current FY)
6. Refresh section D quarterly table + cross-check warnings (revenue ↑ profit ↓)

Run Stock Analysis → Earnings Quality to verify Part A/B render. Write-back faq if verdict changes.`,
      },
      {
        id: 'earnings-quality-forward-context',
        categoryId: 'stock-calculator',
        title: 'Update forward-year risk context (Part B)',
        description:
          'When oil, RBI, policy, or competition shifts — refresh external-negative-risk.md so Part B haircuts and AI year notes stay current.',
        cadence: 'on-demand',
        actionType: 'prompt',
        channel: 'both',
        prompt: `Update Earnings Quality Part B forward context for {TICKER} — analysis date = today.

1. Read external-negative-risk.md + internal-negative-risk.md · live-search sector headlines
2. Set L1/L2/L3 levels and top risks (oil, policy, competition, execution)
3. Note current FY external overlay (e.g. "FY27 oil elevated — ASSUMPTION")
4. Update News/TICKER-INDEX if material · re-run Earnings Quality tab

Part B engine: base EPS CAGR minus max(internal, external haircut); temporary external risks taper in outer years.`,
      },
      {
        id: 'pe-gordon-fair-pe',
        categoryId: 'stock-calculator',
        title: 'PE Evaluation — Gordon fair P/E + implied growth',
        description:
          'Fair P/E = 1/(R−G) · inverse implied G · sensitivity tables — Stock Analysis P/E tab Part D.',
        cadence: 'on-demand',
        actionType: 'prompt',
        channel: 'both',
        href: '/stock-calculator/pe',
        hrefLabel: 'PE Evaluation tab',
        prompt: `{TICKER} — Gordon fair P/E and implied growth at CMP.

StockBook/PE-EVALUATION-FRAMEWORK.md Part D:
1. Required return R (default 12%) · sustainable EPS growth G from PARAMETERS
2. Fair P/E = 1/(R−G) · compare trailing/forward P/E vs fair
3. Inverse: implied G = R − 1/P/E · growth gap vs base thesis
4. Sensitivity table — do not use Gordon alone for BUY; confirm PCCL + PARAMETERS

Label ASSUMPTION on R and G. Run PE Evaluation tab to verify scorecard.`,
      },
      {
        id: 'refresh-margin-analysis',
        categoryId: 'stock-calculator',
        title: 'Refresh Margin Analysis — Part A–D',
        description:
          '5Y margin history · Today vs 10Y EBITDA · drivers/pass-through · quarterly margin from EARNINGS_QUALITY.',
        cadence: 'quarterly',
        actionType: 'prompt',
        channel: 'both',
        href: '/stock-calculator/margin',
        hrefLabel: 'Margin Analysis tab',
        estimatedDuration: '10–15 min per stock',
        prompt: `Refresh Margin Analysis for {TICKER} — StockBook/MARGIN-FRAMEWORK.md.

**Part A:** 5Y table — Gross, EBITDA, EBIT, Net %, YoY Δ pp, signal per FY
**Part B:** Confirm PARAMETERS Today @ CMP vs 10Y avg EBITDA margin
**Part C:** Drivers (RM/oil, mix, discounting, operating leverage) + pass-through verdict
**Part D:** Sync EARNINGS_QUALITY section D margin row (8 quarters)

Live-search latest quarter if results published. Label FACT vs ASSUMPTION.
Run Stock Analysis → Margin tab to verify.`,
      },
      {
        id: 'refresh-peg-evaluation',
        categoryId: 'stock-calculator',
        title: 'Refresh PEG Evaluation — scorecard + PEG file',
        description:
          'P/E · PEG · ROCE · debt · FCF · 100-pt score · combo check · populate PEG_[TICKER].md after FY results.',
        cadence: 'quarterly',
        actionType: 'prompt',
        channel: 'both',
        href: '/stock-calculator/peg',
        hrefLabel: 'PEG Evaluation tab',
        estimatedDuration: '10–15 min per stock',
        prompt: `Refresh PEG Evaluation for {TICKER} — StockBook/PEG-FRAMEWORK.md.

Update PEG_{TICKER}.md FY26 overrides: ttmPe, epsGrowthPct, revenue/PAT growth, ROCE, debt, FCF, fcfIndustryMode.
Cross-check PARAMETERS + detail-analysis. Label FACT vs OUR ASSUMPTION.
Note infra FCF lens for EPC names (L&T) vs consumer (Hero, ITC).

Run Stock Analysis → PEG tab to verify scorecard + 100-pt total.`,
      },
      {
        id: 'ask-agent-stock',
        categoryId: 'stock-calculator',
        title: 'Ask Agent — stock search & general Q&A',
        description:
          '`/chat` has **Stock search** (pick name → investment view) and **General question** (summary-first answer). User-facing text only.',
        cadence: 'on-demand',
        actionType: 'link',
        href: '/chat',
        hrefLabel: 'Ask Agent',
        channel: 'web',
      },
      {
        id: 'stock-calculator-full',
        categoryId: 'stock-calculator',
        title: 'Analyze stock — basic or advanced (6 modules)',
        description:
          'Stock Analysis home: **Basic** = stock name only → **Investment view** (PCCL, discipline, quotes, position) + 6 modules. **Advanced** = custom P/E + CAGR.',
        cadence: 'on-demand',
        actionType: 'link',
        href: '/stock-calculator',
        hrefLabel: 'Analyze tab',
        channel: 'web',
      },
    ],
  },
];

export const ALL_SERVICES = SERVICE_CATEGORIES.flatMap((c) => c.services);

export function cadenceLabel(c: ServiceCadence): string {
  switch (c) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'continuous':
      return 'Live on page load';
    default:
      return 'On demand';
  }
}

export function channelLabel(ch: ServiceChannel): string {
  switch (ch) {
    case 'web':
      return 'Web';
    case 'cursor':
      return 'Cursor';
    default:
      return 'Web + Cursor';
  }
}

export function findService(id: string): AgentService | undefined {
  return ALL_SERVICES.find((s) => s.id === id);
}
