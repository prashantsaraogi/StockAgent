# Generate web application roadmap Word document
$ErrorActionPreference = 'Stop'
$outPath = Join-Path $PSScriptRoot 'India-Stock-Agent-Web-Application-Roadmap.docx'

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Add()

function Add-Heading($text, $level) {
    $p = $doc.Content.Paragraphs.Add()
    $p.Range.Text = $text
    $style = switch ($level) { 1 { 'Heading 1' } 2 { 'Heading 2' } 3 { 'Heading 3' } default { 'Heading 2' } }
    $p.Range.Style = $style
}

function Add-Para($text) {
    $p = $doc.Content.Paragraphs.Add()
    $p.Range.Text = $text
    $p.Range.Style = 'Normal'
}

function Add-Bullet($text) {
    $p = $doc.Content.Paragraphs.Add()
    $p.Range.Text = $text
    $p.Range.ListFormat.ApplyBulletDefault()
}

function Add-Table($headers, $rows) {
    $cols = $headers.Count
    $table = $doc.Tables.Add($doc.Content.Paragraphs.Add().Range, ($rows.Count + 1), $cols)
    for ($c = 0; $c -lt $cols; $c++) { $table.Cell(1, $c + 1).Range.Text = $headers[$c] }
    for ($r = 0; $r -lt $rows.Count; $r++) {
        for ($c = 0; $c -lt $cols; $c++) { $table.Cell($r + 2, $c + 1).Range.Text = $rows[$r][$c] }
    }
    $doc.Content.Paragraphs.Add() | Out-Null
}

Add-Heading 'India Stock Investment Agent - Web Application Roadmap' 1
Add-Para 'Document version: 1.0 | Date: 5 September 2026 | Project: My-agent'
Add-Para 'Purpose: Plan MVP and subsequent phases for a multi-user web application that runs the existing investment framework (22 sections, PCCL, sector outlook, StockBook write-back) with per-user portfolio and reports.'
Add-Para 'Disclaimer: This product is a research assistant. It is not SEBI-registered investment advice.'

Add-Heading '1. Executive Summary' 2
Add-Para 'The My-agent repository already separates shared framework logic from user-specific data. The web application will preserve this split: one core framework for all users; isolated StockBook folders and holdings per user after email login.'
Add-Bullet 'MVP (Phase 1): Auth, portfolio, one-stock analysis chat, markdown StockBook write-back.'
Add-Bullet 'Phase 2: Full StockBook browser, thematic analysis, news index, sector outlook views.'
Add-Bullet 'Phase 3: Automation - morning run, broker fetch, portfolio CAGR dashboard, HTML export.'
Add-Para 'Recommended stack: Next.js (UI + API), Supabase (auth + Postgres metadata), S3/R2 (user markdown files), LLM API (Gemini Flash default), live search API.'

Add-Heading '2. Current State (Repository)' 2
Add-Para 'The project today is framework-complete in Cursor: ~694 markdown files, 22-section rules, skills, investor-wisdom workflows, StockBook/ per stock, News/, portfolio holdings, PowerShell sync scripts, HTML report generation.'
Add-Table @('Layer', 'Location today', 'Web app treatment') @(
    @('Shared framework', '.cursor/rules, .cursor/skills, investor-wisdom/, StockBook/*-FRAMEWORK.md', 'Read-only; versioned; same for all users'),
    @('Per-user data', 'StockBook/[Sector]/[Stock]/, .cursor/portfolio/holdings.md', 'Tenant-scoped storage per user_id'),
    @('Semi-shared', 'News/ summaries', 'Shared cache + per-user TICKER-INDEX links'),
    @('Agent logic', 'Cursor agent + skills', 'Backend agent service with tool calling')
)

Add-Heading '3. Architecture (Target)' 2
Add-Para 'Monorepo layout (same git project):'
Add-Bullet 'framework/ - rules, skills, workflows (shared)'
Add-Bullet 'web/ - Next.js app, API routes, agent orchestration'
Add-Bullet 'scripts/ - existing PowerShell tools (HTML combine, broker fetch)'
Add-Bullet 'data/users/{userId}/ - dev only; production uses cloud storage'
Add-Para 'On signup (email magic link or OTP): provision portfolio/holdings.md and empty stockbook/ tree (mirrors StockBook/[Sector]/[Stock]/). Core framework never copied per user.'
Add-Heading '4. Phase 1 - MVP (Weeks 1-8)' 2
Add-Para 'Goal: Prove end-to-end loop - login, ask about one stock, agent runs framework, saves StockBook markdown, user reads verdict.'

Add-Heading '4.1 MVP Features (In Scope)' 3
Add-Bullet 'Email-based authentication (magic link or OTP) - no access without verified email'
Add-Bullet 'User onboarding: empty portfolio + optional CSV import of qty/avg cost'
Add-Bullet 'Holdings CRUD: view/edit quantities and average cost'
Add-Bullet 'Analysis chat: single-stock query (e.g. Analyze Maruti - buy today?)'
Add-Bullet 'Agent pipeline: read shared framework + user holdings + existing StockBook + live search'
Add-Bullet 'StockBook write-back: summary-analysis.md, faq.md, suggested-approach.md (Standard tier minimum)'
Add-Bullet 'Framework gates: exclusion guards, buy-decision-workflow, personal discipline pre-flight'
Add-Bullet 'Rate limits: e.g. 5-10 deep analyses per user per day (cost control)'
Add-Bullet 'Export: download user StockBook folder as ZIP'

Add-Heading '4.2 MVP Features (Out of Scope)' 3
Add-Bullet 'Thematic multi-stock runs, sector outlook weekly cron, morning run automation'
Add-Bullet 'Broker target batch fetch, PARAMETERS auto-fill, HTML report combiner in UI'
Add-Bullet 'Multi-user admin dashboard, billing, mobile app'

Add-Heading '4.3 MVP Technical Deliverables' 3
Add-Table @('Component', 'Technology', 'Notes') @(
    @('Frontend', 'Next.js 14+ App Router', 'Login, chat, holdings, StockBook viewer (markdown render)'),
    @('Auth', 'Supabase Auth or Clerk', 'Email only for MVP'),
    @('User StockBook', 'S3 / Cloudflare R2', 'Same folder structure as repo StockBook/ today'),
    @('Metadata', 'Supabase Postgres', 'User profile, holdings snapshot, analysis job status'),
    @('Agent', 'Node API + LLM (Gemini 2.5 Flash)', 'RAG over framework; selective skill loading'),
    @('Search', 'Serper or Tavily', 'Live news for dynamic context'),
    @('Jobs', 'Inngest or BullMQ + Redis', 'Async analysis over 60 seconds')
)

Add-Heading '4.4 MVP Success Criteria' 3
Add-Bullet 'User can sign up, add 3 holdings, run one full stock analysis, see updated StockBook files'
Add-Bullet 'Agent follows buy-decision-workflow and does not contradict StockBook/AGENT-RULES.md without new evidence'
Add-Bullet 'Per-user data isolated - User A cannot read User B StockBook'
Add-Bullet 'Framework update (e.g. PCCL rule change) applies to all users without migrating their StockBook files'

Add-Heading '5. Phase 2 - Product V1 (Weeks 9-14)' 2
Add-Para 'Goal: Match Cursor experience for daily use - browse StockBook, run thematic analysis, sector research views.'

Add-Heading '5.1 Phase 2 Features' 3
Add-Bullet 'StockBook browser: sector to stock to all files (summary, FAQ, detail, PARAMETERS, BROKER, risks)'
Add-Bullet 'HTML report view: render combined report like existing cupid-report.html pattern'
Add-Bullet 'Thematic / comparative analysis: user names 3-6 tickers - agent updates all in-scope StockBook folders'
Add-Bullet 'Sector outlook (L11): read/write fmcg-sector-outlook.md style files; weekly refresh reminder in UI'
Add-Bullet 'News integration: shared News/ cache; per-user TICKER-INDEX; link headlines to holdings'
Add-Bullet 'PCCL / tier dashboard: premium to Applied PCCL, SIP tier, blended cap per holding'
Add-Bullet 'Quadrant map / surplus rank: fresh capital allocation view from StockBook + holdings'
Add-Bullet 'FAQ history: searchable Q and A per stock'
Add-Bullet 'Conviction inputs: user sets Conviction_PCCL, blended caps - persisted to faq.md'
Add-Bullet 'Optional: premium LLM tier button (Deep run - Claude/GPT-4 class)'

Add-Heading '5.2 Phase 2 Technical Additions' 3
Add-Bullet 'Background jobs for multi-stock thematic runs (progress UI)'
Add-Bullet 'Framework version pinning: deploy framework v2 while users stay on StockBook files written under v1'
Add-Bullet 'Markdown + HTML dual write (reuse _combine-stockbook-md-to-html.ps1 logic in Node)'

Add-Heading '6. Phase 3 - Automation and Scale (Weeks 15-22)' 2
Add-Para 'Goal: Portfolio monitoring at scale - scheduled runs, batch data, dashboards.'

Add-Heading '6.1 Phase 3 Features' 3
Add-Bullet 'Morning run: scheduled daily digest - news scan, holdings fair-value screen, sector alerts'
Add-Bullet 'Broker target fetch: Trendlyne-style BROKER_[TICKER].md batch refresh'
Add-Bullet 'PARAMETERS batch: 10Y rear-view + 5Y forward skeleton per holding'
Add-Bullet 'Portfolio CAGR dashboard: per-lot CAGR, sector snapshot (from CAGR-FRAMEWORK)'
Add-Bullet 'P/E averaging analysis: integrate upward/downward averaging PE scripts into UI'
Add-Bullet 'Sector outlook weekly cron: auto-refresh all sector-outlook.md files due over 7 days'
Add-Bullet 'Email notifications: e.g. StockBook updated for MAXHEALTH'
Add-Bullet 'Admin: usage analytics, LLM cost per user, framework changelog'
Add-Bullet 'Billing (optional): Stripe/Razorpay for paid tiers - higher analysis limits, premium models'

Add-Heading '6.2 Phase 3 Technical Additions' 3
Add-Bullet 'Cron workers (Vercel cron, Railway, or dedicated worker VM)'
Add-Bullet 'Market data API: NSE CMP refresh for PARAMETERS Block A'
Add-Bullet 'Caching layer for framework RAG embeddings'
Add-Bullet 'Multi-region storage if user base grows'

Add-Heading '7. Data Model and Multi-Tenancy' 2
Add-Table @('Path (per user)', 'Content') @(
    @('portfolio/holdings.md', 'Qty, avg cost, sector tags'),
    @('stockbook/{sector}/{stock}/summary-analysis.md', 'Verdict, PCCL, tier'),
    @('stockbook/{sector}/{stock}/faq.md', 'Q and A, quotes lens, user caps'),
    @('stockbook/{sector}/{stock}/suggested-approach.md', 'SIP plan, blended caps'),
    @('stockbook/.../detail-analysis.md', 'Full thesis'),
    @('news/ticker-index.md', 'User-specific headline links'),
    @('settings/discipline.md', 'Pause registry, surplus rules (optional)')
)
Add-Para 'Shared (read-only at runtime): framework/rules, framework/skills, investor-wisdom/, StockBook/*-FRAMEWORK.md, StockBook/AGENT-RULES.md templates.'

Add-Heading '8. Cost Estimate (Monthly INR)' 2
Add-Table @('Scenario', 'Users', 'Infra', 'LLM + Search', 'Total approx.') @(
    @('MVP - solo dev', '1', 'Rs 0-500', 'Rs 500-2,000', 'Rs 1,000-4,000'),
    @('Phase 2 - small beta', '5-20', 'Rs 3,000-4,000', 'Rs 5,000-15,000', 'Rs 10,000-25,000'),
    @('Phase 3 - growth', '50+', 'Rs 8,000-15,000', 'Rs 25,000-80,000+', 'Rs 40,000-1,10,000+')
)
Add-Para 'Largest variable: LLM usage. One full framework analysis approx Rs 5-40 depending on model. Mitigation: Gemini Flash default, RAG (do not inject all 694 files), rate limits, selective skill loading.'

Add-Heading '9. Risks and Mitigations' 2
Add-Table @('Risk', 'Mitigation') @(
    @('LLM cost blow-up', 'Rate limits, Flash default, async queue, user quotas'),
    @('Hallucinated financial data', 'Live search required; label FACT vs ASSUMPTION; cite sources'),
    @('Framework drift (Cursor vs web)', 'Single framework/ folder; same AGENT-RULES'),
    @('Regulatory / advice liability', 'Prominent disclaimer; no buy/sell orders; research tool only'),
    @('User data leak', 'Tenant isolation in storage; auth on every API; audit logs'),
    @('Stale StockBook files', 'Analysis date on every file; weekly sector refresh in Phase 3')
)

Add-Heading '10. Phase Timeline Summary' 2
Add-Table @('Phase', 'Duration', 'Theme', 'Key deliverable') @(
    @('Phase 1 - MVP', '4-8 weeks', 'Prove the loop', 'Login + chat + one-stock StockBook write-back'),
    @('Phase 2 - V1', '+4-6 weeks', 'Daily usability', 'StockBook browser + thematic + sector outlook'),
    @('Phase 3 - V2', '+4-8 weeks', 'Automation', 'Morning run + broker batch + CAGR dashboard')
)
Add-Para 'Total estimated calendar: 12-22 weeks to full Phase 3, depending on part-time vs full-time development.'

Add-Heading '11. Next Actions (Immediate)' 2
Add-Bullet 'Create web/ folder scaffold: Next.js + Supabase auth boilerplate'
Add-Bullet 'Define API contract: POST /api/analyze { ticker, question } -> job id -> poll -> StockBook paths'
Add-Bullet 'Prototype agent with one stock (MARUTI) reading holdings.md + framework + writing StockBook/Auto/Maruti Suzuki/faq.md'
Add-Bullet 'Legal: terms of use + research disclaimer page before any beta users'

Add-Para ''
Add-Para 'End of document. Generated from My-agent repository planning session, September 2026.'

$doc.SaveAs2($outPath)
$doc.Close()
$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
Write-Host "Created: $outPath"
