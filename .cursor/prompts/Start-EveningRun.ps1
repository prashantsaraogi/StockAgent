# Evening post-close launcher — Variant B (21:00 IST trading days).
param([switch]$Force)

$promptsDir = $PSScriptRoot
$htmlPath = Join-Path $promptsDir 'MORNING-RUN-PROMPT.html'
$stampFile = Join-Path $promptsDir '.evening-run-last.txt'

$dow = (Get-Date).DayOfWeek
if ($dow -eq 'Saturday' -or $dow -eq 'Sunday') { exit 0 }

$hour = (Get-Date).Hour
if ($hour -lt 20 -or $hour -gt 23) { exit 0 }

$today = Get-Date -Format 'yyyy-MM-dd'
if (-not $Force -and (Test-Path $stampFile) -and ((Get-Content $stampFile -Raw).Trim() -eq $today)) { exit 0 }

$text = @'
Run my India Stock Investment Agent MORNING FRAMEWORK — Variant B (post-close pass).

Follow: .cursor/prompts/MORNING-FRAMEWORK-SEQUENCE.md

Focus PHASE 1 only (full calendar day):
- News/SEARCH-WORKFLOW.md — window = today 00:01–23:59 IST (full day target)
- Bucket C post-close — highest priority (CNG, tariffs, block deals, global spillover)
- Stock-wise loop: all 50 holdings — complete any gap from morning partial run
- Merge/update same day summary.md (do not create duplicate date)
- TICKER-INDEX + affected Report summary-analysis.md
- Refresh quadrant-map.md if sector surplus band changed

Optional PHASE 2 if market moved >1%: re-run _generate-all-cagr.ps1 + _generate-portfolio-cagr.ps1

Deliver: what changed since morning pass · triggers for Monday open · FII/geo read.
'@

if (Test-Path $htmlPath) {
    Start-Process "file:///$($htmlPath.Replace('\','/'))#b"
}
Set-Clipboard -Value $text
Set-Content -Path $stampFile -Value $today -Encoding ASCII -NoNewline

Add-Type -AssemblyName System.Windows.Forms
$n = New-Object System.Windows.Forms.NotifyIcon
$n.Icon = [System.Drawing.SystemIcons]::Information
$n.Visible = $true
$n.ShowBalloonTip(8000, 'My Agent — Evening Run', 'Variant B copied — paste in Cursor chat.', [System.Windows.Forms.ToolTipIcon]::Info)
Start-Sleep -Seconds 7
$n.Dispose()
