# Combine stock StockBook/*.md files into one shareable HTML report.
# Usage: .\StockBook\_combine-stockbook-md-to-html.ps1 -StockFolder "Consumer\Cupid" [-OutputFile cupid-report.html]
# See: StockBook/AGENT-RULES.md

param(
    [Parameter(Mandatory = $true)]
    [string]$StockFolder,
    [string]$OutputFile = '',
    [string]$CompanyName = '',
    [string]$Ticker = '',
    [string]$Verdict = ''
)

$ErrorActionPreference = 'Stop'
$reportRoot = $PSScriptRoot
$stockDir = Join-Path $reportRoot $StockFolder
if (-not (Test-Path $stockDir)) { throw "Folder not found: $stockDir" }

$sectionFiles = @(
    @{ File = 'summary-analysis.md';     Id = 'summary';  Label = 'Summary';           NavClass = 's1' }
    @{ File = 'detail-analysis.md';       Id = 'detail';    Label = 'Detail Analysis';   NavClass = 's2' }
    @{ File = 'suggested-approach.md';    Id = 'approach';  Label = 'Suggested Approach'; NavClass = 's3' }
    @{ File = 'faq.md';                   Id = 'faq';       Label = 'FAQ';               NavClass = 's4' }
    @{ File = 'external-negative-risk.md'; Id = 'ext-risk'; Label = 'External Risks';    NavClass = 's5' }
    @{ File = 'internal-negative-risk.md'; Id = 'int-risk'; Label = 'Internal Risks';    NavClass = 's6' }
)

# Optional lens files - match PARAMETERS_*.md, CAGR_*.md, BROKER_*.md
$paramFile = Get-ChildItem -Path $stockDir -Filter 'PARAMETERS_*.md' -ErrorAction SilentlyContinue | Select-Object -First 1
$cagrFile  = Get-ChildItem -Path $stockDir -Filter 'CAGR_*.md' -ErrorAction SilentlyContinue | Select-Object -First 1
$brokerFile = Get-ChildItem -Path $stockDir -Filter 'BROKER_*.md' -ErrorAction SilentlyContinue | Select-Object -First 1
if ($paramFile)  { $sectionFiles += @{ File = $paramFile.Name;  Id = 'parameters'; Label = 'Parameters'; NavClass = 's7' } }
if ($cagrFile)   { $sectionFiles += @{ File = $cagrFile.Name;   Id = 'cagr';       Label = 'Holding CAGR'; NavClass = 's8' } }
if ($brokerFile) { $sectionFiles += @{ File = $brokerFile.Name; Id = 'broker';     Label = 'Broker Targets'; NavClass = 's9' } }

function Escape-Html([string]$t) {
    if ($null -eq $t) { return '' }
    return ($t -replace '&', '&amp;' -replace '<', '&lt;' -replace '>', '&gt;' -replace '"', '&quot;')
}

function Format-Inline([string]$t) {
    if ([string]::IsNullOrWhiteSpace($t)) { return '' }
    $s = Escape-Html $t
    $s = [regex]::Replace($s, '\*\*([^*]+)\*\*', '<strong>$1</strong>')
    $s = [regex]::Replace($s, '\*([^*]+)\*', '<em>$1</em>')
    $s = [regex]::Replace($s, '`([^`]+)`', '<code>$1</code>')
    $s = [regex]::Replace($s, '\[([^\]]+)\]\(([^)]+)\)', '<a href="$2">$1</a>')
    return $s
}

function Convert-MarkdownToHtml([string]$md) {
    if ([string]::IsNullOrWhiteSpace($md)) { return '' }
    # Strip HTML comment blocks used for lens sync metadata duplicates (optional keep content inside)
    $md = [regex]::Replace($md, '<!--\s*LENSES-SUMMARY:START\s*-->[\s\S]*?<!--\s*LENSES-SUMMARY:END\s*-->', '')
    $md = [regex]::Replace($md, '<!--\s*LENSES-APPROACH:START\s*-->[\s\S]*?<!--\s*LENSES-APPROACH:END\s*-->', '')

    $lines = $md -split "`r?`n"
    $html = New-Object System.Collections.Generic.List[string]
    $i = 0
    $inCode = $false
    $codeBuf = New-Object System.Collections.Generic.List[string]
    $tableBuf = New-Object System.Collections.Generic.List[string]
    $inTable = $false
    $listBuf = New-Object System.Collections.Generic.List[string]
    $inList = $false
    $paraBuf = New-Object System.Collections.Generic.List[string]

    function Flush-Para {
        if ($paraBuf.Count -gt 0) {
            $text = ($paraBuf -join ' ').Trim()
            if ($text) { $html.Add('<p>' + (Format-Inline $text) + '</p>') | Out-Null }
            $paraBuf.Clear()
        }
    }

    function Flush-List {
        if ($listBuf.Count -gt 0) {
            $html.Add('<ul class="bullet">') | Out-Null
            foreach ($item in $listBuf) {
                $html.Add('<li>' + (Format-Inline $item) + '</li>') | Out-Null
            }
            $html.Add('</ul>') | Out-Null
            $listBuf.Clear()
        }
        $script:inList = $false
    }

    function Flush-Table {
        if ($tableBuf.Count -lt 2) { $tableBuf.Clear(); $script:inTable = $false; return }
        $rows = @($tableBuf | Where-Object { $_ -match '\|' })
        if ($rows.Count -lt 2) { $tableBuf.Clear(); $script:inTable = $false; return }
        $html.Add('<table>') | Out-Null
        $ri = 0
        foreach ($row in $rows) {
            if ($row -match '^\|\s*[-:\s|]+\s*\|$') { continue }
            $cells = ($row.Trim('|').Split('|') | ForEach-Object { $_.Trim() })
            $tag = if ($ri -eq 0) { 'th' } else { 'td' }
            if ($ri -eq 0) { $html.Add('<thead><tr>') | Out-Null } elseif ($ri -eq 1) { $html.Add('<tbody>') | Out-Null; $html.Add('<tr>') | Out-Null } else { $html.Add('<tr>') | Out-Null }
            if ($ri -eq 0) {
                foreach ($c in $cells) { $html.Add('<th>' + (Format-Inline $c) + '</th>') | Out-Null }
                $html.Add('</tr></thead>') | Out-Null
            } else {
                foreach ($c in $cells) {
                    $cls = if ($c -match '^[\d,.Rs%+\-~x]+$' -or $c -match '^\d') { ' class="num"' } else { '' }
                    $html.Add("<td$cls>" + (Format-Inline $c) + '</td>') | Out-Null
                }
                $html.Add('</tr>') | Out-Null
            }
            $ri++
        }
        $html.Add('</tbody></table>') | Out-Null
        $tableBuf.Clear()
        $script:inTable = $false
    }

    while ($i -lt $lines.Count) {
        $line = $lines[$i]
        $trim = $line.Trim()

        if ($trim -match '^```') {
            Flush-Para
            Flush-List
            if ($inTable) { Flush-Table }
            if ($inCode) {
                $codeText = Escape-Html ($codeBuf -join "`n")
                $html.Add("<pre class=`"code-block`">$codeText</pre>") | Out-Null
                $codeBuf.Clear()
                $inCode = $false
            } else { $inCode = $true }
            $i++; continue
        }
        if ($inCode) { $codeBuf.Add($line) | Out-Null; $i++; continue }

        if ($trim -eq '---') {
            Flush-Para; Flush-List
            if ($inTable) { Flush-Table }
            $html.Add('<hr>') | Out-Null
            $i++; continue
        }

        if ($trim -match '^\|') {
            Flush-Para; Flush-List
            $inTable = $true
            $tableBuf.Add($line) | Out-Null
            $i++; continue
        } elseif ($inTable) { Flush-Table }

        if ($trim -match '^#{1,4}\s') {
            Flush-Para; Flush-List
            if ($trim -match '^####\s+(.+)') { $html.Add('<h4>' + (Format-Inline $Matches[1]) + '</h4>') | Out-Null }
            elseif ($trim -match '^###\s+(.+)') { $html.Add('<h3>' + (Format-Inline $Matches[1]) + '</h3>') | Out-Null }
            elseif ($trim -match '^##\s+(.+)') { $html.Add('<h2>' + (Format-Inline $Matches[1]) + '</h2>') | Out-Null }
            elseif ($trim -match '^#\s+(.+)') { $html.Add('<h1>' + (Format-Inline $Matches[1]) + '</h1>') | Out-Null }
            $i++; continue
        }

        if ($trim -match '^[-*]\s+\[([ xX])\]\s+(.+)') {
            Flush-Para
            $checked = $Matches[1] -match 'x'
            $mark = if ($checked) { '&#9745;' } else { '&#9744;' }
            if (-not $inList) { $inList = $true }
            $listBuf.Add("$mark $($Matches[2])") | Out-Null
            $i++; continue
        }

        if ($trim -match '^[-*]\s+(.+)') {
            Flush-Para
            if (-not $inList) { $inList = $true }
            $listBuf.Add($Matches[1]) | Out-Null
            $i++; continue
        } elseif ($inList -and [string]::IsNullOrWhiteSpace($trim)) {
            Flush-List
            $i++; continue
        } elseif ($inList) { Flush-List }

        if ($trim -match '^>\s*(.+)') {
            Flush-Para
            $html.Add('<blockquote><p>' + (Format-Inline $Matches[1]) + '</p></blockquote>') | Out-Null
            $i++; continue
        }

        if ([string]::IsNullOrWhiteSpace($trim)) {
            Flush-Para
            $i++; continue
        }

        $paraBuf.Add($trim) | Out-Null
        $i++
    }

    Flush-Para
    Flush-List
    if ($inTable) { Flush-Table }
    if ($inCode -and $codeBuf.Count -gt 0) {
        $codeText = Escape-Html ($codeBuf -join "`n")
        $html.Add("<pre class=`"code-block`">$codeText</pre>") | Out-Null
    }

    return ($html -join "`n")
}

# Parse header from summary if not supplied
$summaryPath = Join-Path $stockDir 'summary-analysis.md'
if (Test-Path $summaryPath) {
    $summaryText = Get-Content -Path $summaryPath -Raw -Encoding UTF8
    if (-not $CompanyName -and $summaryText -match '^#\s+(.+?)\s+[-—]') { $CompanyName = $Matches[1].Trim() }
    if (-not $Ticker -and $summaryText -match '\*\*Ticker:\*\*\s+(\w+)') { $Ticker = $Matches[1] }
    if (-not $Verdict -and $summaryText -match '(?ms)## Verdict[^\r\n]*\r?\n+\*\*(.+?)\*\*') { $Verdict = $Matches[1].Trim() }
}
if (-not $CompanyName) { $CompanyName = (Split-Path $StockFolder -Leaf) }
if (-not $Ticker) { $Ticker = $CompanyName.ToUpper() -replace '\s', '' }

$folderLeaf = Split-Path $StockFolder -Leaf
if (-not $OutputFile) {
    $slug = ($folderLeaf.ToLower() -replace '\s+', '-')
    $OutputFile = "$slug-report.html"
}
$outPath = Join-Path $stockDir $OutputFile
$genDate = Get-Date -Format 'dd MMM yyyy'

$navItems = @()
$sections = @()
$sectionNum = 0
foreach ($sec in $sectionFiles) {
    $path = Join-Path $stockDir $sec.File
    if (-not (Test-Path $path)) { continue }
    $sectionNum++
    $md = Get-Content -Path $path -Raw -Encoding UTF8
    $body = Convert-MarkdownToHtml $md
    # Drop duplicate top h1 from section body (keep section h2 as first visible title)
    $body = [regex]::Replace($body, '^<h1>[^<]+</h1>\s*', '', 1)
    $navItems += "      <a href=`"#$($sec.Id)`" class=`"$($sec.NavClass)`">$sectionNum. $($sec.Label)</a>"
    $sections += @"
    <section id="$($sec.Id)">
      <span class="section-label label-$($sec.Id)">Section $sectionNum</span>
      <h2 class="section-title">$($sec.Label)</h2>
      <div class="section-body">
$body
      </div>
    </section>
"@
}

$navHtml = $navItems -join "`n"
$sectionsHtml = $sections -join "`n`n"
$verdictBox = if ($Verdict) { "<div class=`"verdict-box`"><strong>Verdict:</strong> $(Escape-Html $Verdict)</div>" } else { '' }

$html = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>$CompanyName - Investment Report</title>
  <style>
    :root {
      --bg: #f8f9fb; --card: #ffffff; --text: #1a1d26; --muted: #5c6370; --border: #e2e6ed;
      --accent: #7c2d12; --accent-light: #fff7ed; --hold: #0d6e4f; --hold-light: #e8f5f0;
      --warn: #b45309; --warn-light: #fff7ed;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Segoe UI", system-ui, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; font-size: 15px; }
    .header { background: linear-gradient(135deg, #7c2d12 0%, #9a3412 100%); color: #fff; padding: 2rem 1.5rem 1.5rem; }
    .header-inner { max-width: 960px; margin: 0 auto; }
    .header h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem; }
    .header .meta { opacity: 0.9; font-size: 0.9rem; margin-bottom: 1rem; }
    .verdict-box { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 8px; padding: 0.85rem 1rem; font-size: 0.95rem; }
    .nav { background: var(--card); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .nav-inner { max-width: 960px; margin: 0 auto; display: flex; gap: 0.35rem; padding: 0.75rem 1.5rem; flex-wrap: wrap; }
    .nav a { text-decoration: none; color: var(--muted); font-size: 0.8rem; font-weight: 600; padding: 0.35rem 0.7rem; border-radius: 6px; }
    .nav a:hover { background: var(--bg); color: var(--text); }
    main { max-width: 960px; margin: 0 auto; padding: 1.5rem; }
    section { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 1.75rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .section-label { display: inline-block; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 0.25rem 0.6rem; border-radius: 4px; margin-bottom: 0.5rem; background: var(--accent-light); color: var(--accent); }
    .section-title { font-size: 1.35rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border); }
    .section-body h1 { font-size: 1.25rem; margin: 1rem 0 0.75rem; }
    .section-body h2 { font-size: 1.15rem; margin: 1.25rem 0 0.65rem; padding-bottom: 0.35rem; border-bottom: 1px solid var(--border); }
    .section-body h3 { font-size: 1.05rem; margin: 1rem 0 0.5rem; color: var(--text); }
    .section-body h4 { font-size: 0.95rem; margin: 0.85rem 0 0.4rem; color: var(--muted); }
    .section-body p { margin-bottom: 0.75rem; }
    .section-body hr { border: none; border-top: 1px solid var(--border); margin: 1.25rem 0; }
    table { width: 100%; border-collapse: collapse; margin: 0.75rem 0 1.25rem; font-size: 0.875rem; }
    th, td { padding: 0.6rem 0.75rem; text-align: left; border-bottom: 1px solid var(--border); vertical-align: top; }
    th { background: #f1f5f9; font-weight: 600; }
    td.num, th.num { text-align: right; }
    tr:hover td { background: #fafbfc; }
    ul.bullet { margin: 0.5rem 0 1rem 1.25rem; font-size: 0.9rem; }
    ul.bullet li { margin-bottom: 0.35rem; }
    pre.code-block { background: #f1f5f9; border: 1px solid var(--border); padding: 1rem 1.25rem; border-radius: 8px; font-family: Consolas, monospace; font-size: 0.85rem; line-height: 1.6; margin: 1rem 0; white-space: pre-wrap; overflow-x: auto; }
    code { background: #f1f5f9; padding: 0.1rem 0.35rem; border-radius: 3px; font-size: 0.85em; }
    blockquote { border-left: 4px solid var(--accent); padding: 0.5rem 1rem; margin: 1rem 0; background: var(--accent-light); font-style: italic; }
    a { color: #1d4ed8; }
    .footer { text-align: center; padding: 1.5rem; color: var(--muted); font-size: 0.8rem; }
    @media print { .nav { display: none; } section { break-inside: avoid; box-shadow: none; } body { background: #fff; } }
    @media (max-width: 640px) { .header h1 { font-size: 1.4rem; } section { padding: 1.25rem; } table { font-size: 0.78rem; } }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <h1>$CompanyName</h1>
      <p class="meta">$Ticker (NSE) | Full investment report | Generated $genDate<br>
      <span style="opacity:0.85">Combined from markdown sections - shareable HTML</span></p>
      $verdictBox
    </div>
  </header>
  <nav class="nav">
    <div class="nav-inner">
$navHtml
    </div>
  </nav>
  <main>
$sectionsHtml
  </main>
  <footer class="footer">
    $CompanyName ($Ticker) · My-agent investment framework · $genDate<br>
    Not investment advice. Verify all figures against exchange filings before acting.
  </footer>
</body>
</html>
"@

[System.IO.File]::WriteAllText($outPath, $html, [System.Text.UTF8Encoding]::new($true))
Write-Output "Written: $outPath ($sectionNum sections)"
