# Morning Run launcher — open HTML, copy prompt to clipboard, optional Phase 2 scripts.
# Usage:
#   .\Start-MorningRun.ps1              # default: morning window, once per day
#   .\Start-MorningRun.ps1 -Force       # ignore once-per-day guard
#   .\Start-MorningRun.ps1 -RunNumbers  # also run CAGR + PARAMETERS scripts (~2-5 min)
#   .\Start-MorningRun.ps1 -OpenCursor  # try to open Cursor on project folder

param(
    [switch]$Force,
    [switch]$RunNumbers,
    [switch]$OpenCursor,
    [switch]$SkipClipboard
)

$ErrorActionPreference = 'SilentlyContinue'
$promptsDir = $PSScriptRoot
$projectRoot = Split-Path (Split-Path $promptsDir -Parent) -Parent
$htmlPath = Join-Path $promptsDir 'MORNING-RUN-PROMPT.html'
$stampFile = Join-Path $promptsDir '.morning-run-last.txt'
$logFile = Join-Path $promptsDir 'morning-run.log'

function Write-Log($msg) {
    $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $msg"
    Add-Content -Path $logFile -Value $line -Encoding UTF8
}

function Show-Toast($title, $message) {
    try {
        Add-Type -AssemblyName System.Windows.Forms
        $n = New-Object System.Windows.Forms.NotifyIcon
        $n.Icon = [System.Drawing.SystemIcons]::Information
        $n.Visible = $true
        $n.ShowBalloonTip(8000, $title, $message, [System.Windows.Forms.ToolTipIcon]::Info)
        Start-Sleep -Seconds 7
        $n.Dispose()
    } catch {
        Write-Log "Toast failed: $_"
    }
}

function Get-VariantKey {
    $dow = (Get-Date).DayOfWeek
    if ($dow -eq 'Saturday') { return 'c' }
    return 'a'
}

function Get-MorningPromptText([string]$Variant) {
    switch ($Variant) {
        'c' {
            return @'
Run my India Stock Investment Agent MORNING FRAMEWORK — Variant C (weekly deep).

Follow: .cursor/prompts/MORNING-FRAMEWORK-SEQUENCE.md — all phases 0–6.

PHASE 1: Full news for last 7 days — catch missed post-close · stock-wise 50/50
PHASE 2:
  .\_generate-all-cagr.ps1
  .\_generate-portfolio-cagr.ps1
  cd ..\.cursor\portfolio
  .\_build-pe-averaging-analysis.ps1
  cd ..\..\Report
  .\_generate-all-parameters.ps1 -SkipDetailed
  Refresh portfolio-parameters.md

PHASE 3: Full quadrant-map.md refresh with live CMP · sector comparative ranks if stale
PHASE 6: List top 10 holdings needing PARAMETERS Block B/C deep-fill (like HDFCBANK)

Deliver:
- Week in review (macro + portfolio holdings)
- Surplus deployment table for next month salary
- Stale reports list (summary-analysis date >30 days)
- One paragraph: what changed vs last week in framework ranks

No TRIM/SELL. Long-term mandate.
'@
        }
        default {
            return @'
Run my India Stock Investment Agent MORNING FRAMEWORK — Variant A (early morning).

Follow end-to-end: .cursor/prompts/MORNING-FRAMEWORK-SEQUENCE.md

PHASE 0 — Read: holdings.md · latest News/summary.md · TICKER-INDEX.md · quadrant-map.md

PHASE 1 — NEWS (mandatory):
- News/SEARCH-WORKFLOW.md — window = today 00:01 IST to NOW (state partial)
- Buckets A + B (+ C if overnight headlines exist)
- Stock-wise loop: all 50 holdings from holdings.md — gap-check each vs macro pass
- Primary four: CNBC-TV18 · Moneycontrol · ET · NDTV Profit
- Write/update News/YYYY-MM/YYYY-MM-DD/summary.md + TICKER-INDEX.md
- Light StockBook write-back for material holdings only

PHASE 2 — PORTFOLIO NUMBERS (run scripts):
cd d:\D-Drive\Personal\My-agent\Report
.\_generate-all-cagr.ps1
.\_generate-portfolio-cagr.ps1
.\_generate-all-parameters.ps1 -SkipDetailed
Refresh .cursor/portfolio/portfolio-parameters.md index table

PHASE 3 — SURPLUS:
- Refresh quadrant-map.md only if news/CMP shifts surplus rank
- Flag any holding down >=15% from peak (price-decline §22 watchlist)

PHASE 4 — Deliver short brief:
1) Macro + geo one paragraph
2) Top 5 material news for my holdings
3) Surplus rank changes (if any)
4) Portfolio CAGR snapshot (total return + cost-weighted CAGR)
5) Parameters: cheap vs expensive vs 10Y (count + top 3 cheap / top 3 expensive)
6) Any ADD/PAUSE flips from news
7) Next run: post-close ~21:00 IST for full day news

Do not suggest TRIM/SELL. Surplus deployment only. Persist all updates to files — not chat only.
'@
        }
    }
}

# Morning IST window: 06:00–13:59 (local PC should be IST)
$hour = (Get-Date).Hour
if ($hour -lt 6 -or $hour -gt 13) {
    Write-Log "Skip: outside morning window (hour=$hour)"
    exit 0
}

$today = Get-Date -Format 'yyyy-MM-dd'
if (-not $Force -and (Test-Path $stampFile)) {
    $last = Get-Content $stampFile -Raw
    if ($last.Trim() -eq $today) {
        Write-Log "Skip: already ran today"
        exit 0
    }
}

$variant = Get-VariantKey
$variantLabel = if ($variant -eq 'c') { 'C (weekly)' } else { 'A (daily)' }
Write-Log "Start variant=$variant RunNumbers=$RunNumbers"

# Open HTML on correct tab
if (Test-Path $htmlPath) {
    $uri = "file:///$($htmlPath.Replace('\','/'))#$variant"
    Start-Process $uri
} else {
    Write-Log "HTML not found: $htmlPath"
}

# Clipboard
if (-not $SkipClipboard) {
    $text = Get-MorningPromptText $variant
    Set-Clipboard -Value $text
    Write-Log "Copied variant $variant to clipboard"
}

# Optional Phase 2 scripts only (no news agent — numbers refresh)
if ($RunNumbers) {
    Write-Log "Running Phase 2 scripts..."
    $reportDir = Join-Path $projectRoot 'Report'
    Push-Location $reportDir
    & .\_generate-all-cagr.ps1 2>&1 | Out-Null
    & .\_generate-portfolio-cagr.ps1 2>&1 | Out-Null
    & .\_generate-all-parameters.ps1 -SkipDetailed 2>&1 | Out-Null
    Pop-Location
    Write-Log "Phase 2 scripts done"
}

if ($OpenCursor) {
    $cursorCmd = Get-Command cursor -ErrorAction SilentlyContinue
    if ($cursorCmd) {
        Start-Process cursor -ArgumentList "`"$projectRoot`""
        Write-Log "Opened Cursor"
    }
}

Set-Content -Path $stampFile -Value $today -Encoding ASCII -NoNewline

$msg = "Variant $variantLabel copied. Open Cursor -> New chat -> Ctrl+V -> Enter."
if ($RunNumbers) { $msg += " Phase 2 numbers scripts ran." }
Show-Toast 'My Agent — Morning Run' $msg
Write-Log "Done"
