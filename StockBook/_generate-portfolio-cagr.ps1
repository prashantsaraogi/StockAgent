# Aggregate all CAGR_[TICKER].md files into portfolio-level dashboard.
# Usage: .\StockBook\_generate-portfolio-cagr.ps1
# Run after _generate-all-cagr.ps1 for fresh CMP.

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$reportRoot = Join-Path $root 'Report'
$outPath = Join-Path $root '.cursor\portfolio\portfolio-cagr.md'

# Sector tags (match holdings.md)
$sectors = @{
    ASHOKLEY='Auto'; BAJAJFINSV='Financials'; BALKRISIND='Auto'; BANKINDIA='Banks'
    BHARTIARTL='Telecom'; CIPLA='Pharma'; DELTACORP='Hotels / Gaming'; EICHERMOT='Auto'
    FORTIS='Healthcare'; GICRE='Insurance'; GLENMARK='Pharma'; HAVELLS='Consumer'
    HCLTECH='IT'; HDFCAMC='Financials'; HDFCBANK='Banks'; HDFCLIFE='Insurance'
    HEG='Industrials'; HEROMOTOCO='Auto'; HINDUNILVR='FMCG'; ICICIBANK='Banks'
    IGL='Oil & Gas'; INDHOTEL='Hotels'; INFY='IT'; IOC='OMC'; ITC='FMCG'
    ITCHOTELS='Hotels'; KOTAKBANK='Banks'; KWIL='FMCG'; LT='Infra'; LUPIN='Pharma'
    MARUTI='Auto'; MAXHEALTH='Healthcare'; MEDANTA='Healthcare'; MOTHERSON='Auto'
    MUTHOOTFIN='NBFC'; ONGC='Oil & Gas'; PNB='Banks'; RAAJINFRA='Infra'
    SBIN='Banks'; SUNPHARMA='Pharma'; TATACONSUM='FMCG'; TATAMOTORS='Auto'
    TCS='IT'; TECHM='IT'; TMPV='Auto'; UBL='Consumer'; UJJIVANSFB='Banks'
    WIPRO='IT'; WONDERLA='Leisure'; DRREDDY='Pharma'
}

function Parse-CagrFile {
    param([string]$Path)
    $text = Get-Content -Path $Path -Raw -Encoding UTF8
    $ticker = if ($text -match '\*\*Ticker:\*\*\s+(\w+)') { $Matches[1] } else { $null }
    $cmpDate = if ($text -match '\*\*CMP date:\*\*\s+([\d-]+)') { $Matches[1] } else { '' }
    if ($text -match '\|\s\*\*L1\*\*\s\|\s([\d,]+)\s\|\s\*\*([\d-]+)\*\*\s\|\s\*\*([\d,.]+)\*\*\s\|\s(\d+)\s\|\s([\d,.]+)\s\|\s\*\*([+-]?[\d.]+)%\*\*\s\|\s\*\*([+-]?[\d.]+|n/a)(?:%)?\*\*') {
        $qty = [int]($Matches[1] -replace ',', '')
        $buyDate = $Matches[2]
        $buyPrice = [double]($Matches[3] -replace ',', '')
        $days = [int]$Matches[4]
        $cmp = [double]($Matches[5] -replace ',', '')
        $simple = [double]$Matches[6]
        $cagrRaw = $Matches[7]
        $cagr = if ($cagrRaw -eq 'n/a') { $null } else { [double]$cagrRaw }
        $cost = [math]::Round($qty * $buyPrice, 0)
        $mv = [math]::Round($qty * $cmp, 0)
        $gain = $mv - $cost
        $name = if ($text -match '^#\s+(.+?)\s+-\s+Holding CAGR') { $Matches[1].Trim() } else { $ticker }
        $rel = $Path.Substring($reportRoot.Length + 1) -replace '\\CAGR_.+\.md$', '' -replace '\\', '/'
        return [pscustomobject]@{
            Ticker   = $ticker
            Name     = $name
            Sector   = $sectors[$ticker]
            Qty      = $qty
            BuyDate  = $buyDate
            BuyPrice = $buyPrice
            Cost     = $cost
            Cmp      = $cmp
            CmpDate  = $cmpDate
            MV       = $mv
            Gain     = $gain
            Simple   = $simple
            Cagr     = $cagr
            CagrDisplay = if ($null -eq $cagr) { 'n/a' } else { "$([math]::Round($cagr, 2))%" }
            Days     = $days
            File     = "StockBook/$rel/CAGR_$ticker.md"
        }
    }
    return $null
}

$rows = @()
Get-ChildItem -Path $reportRoot -Filter 'CAGR_*.md' -Recurse | ForEach-Object {
    $p = Parse-CagrFile -Path $_.FullName
    if ($p) { $rows += $p }
}

if ($rows.Count -eq 0) {
    Write-Error 'No CAGR files found. Run _generate-all-cagr.ps1 first.'
    exit 1
}

$totalCost = ($rows | Measure-Object -Property Cost -Sum).Sum
$totalMV = ($rows | Measure-Object -Property MV -Sum).Sum
$totalGain = $totalMV - $totalCost
$portSimple = if ($totalCost -gt 0) { ($totalMV / $totalCost - 1) * 100 } else { 0 }
$portCagr = if ($totalCost -gt 0) {
    $cagrRows = $rows | Where-Object { $null -ne $_.Cagr }
    $cagrCost = ($cagrRows | Measure-Object Cost -Sum).Sum
    if ($cagrCost -gt 0) {
        ($cagrRows | ForEach-Object { $_.Cost * $_.Cagr } | Measure-Object -Sum).Sum / $cagrCost
    } else { 0 }
} else { 0 }
$naCagrCount = @($rows | Where-Object { $null -eq $_.Cagr }).Count

# Portfolio-level CAGR if uniform buy date (sanity check)
$first = $rows[0]
$years = $first.Days / 365.25
$portCagrUniform = if ($years -gt 0 -and $totalCost -gt 0) {
    ([math]::Pow($totalMV / $totalCost, 1 / $years) - 1) * 100
} else { 0 }

$winners = @($rows | Where-Object { $_.Simple -ge 0 })
$losers = @($rows | Where-Object { $_.Simple -lt 0 })
$cmpDateLatest = ($rows | Sort-Object CmpDate -Descending | Select-Object -First 1).CmpDate
$today = Get-Date -Format 'yyyy-MM-dd'

function Fmt-Lakh([double]$n) {
    if ([math]::Abs($n) -ge 10000000) { return ('Rs {0:N2} Cr' -f ($n / 10000000)) }
    if ([math]::Abs($n) -ge 100000) { return ('Rs {0:N2} L' -f ($n / 100000)) }
    return ('Rs {0:N0}' -f $n)
}

function Fmt-Pct([double]$n) { $s = if ($n -ge 0) { '+' } else { '' }; return "$s$([math]::Round($n, 2))%" }

$sorted = $rows | Where-Object { $null -ne $_.Cagr } | Sort-Object Cagr -Descending
$top5 = $sorted | Select-Object -First 5
$bot5 = $sorted | Sort-Object Cagr | Select-Object -First 5

$sectorGroups = $rows | Group-Object Sector | ForEach-Object {
    $cost = ($_.Group | Measure-Object Cost -Sum).Sum
    $mv = ($_.Group | Measure-Object MV -Sum).Sum
    $simple = if ($cost -gt 0) { ($mv / $cost - 1) * 100 } else { 0 }
    $wcagr = if ($cost -gt 0) {
        $cg = $_.Group | Where-Object { $null -ne $_.Cagr }
        $cc = ($cg | Measure-Object Cost -Sum).Sum
        if ($cc -gt 0) { ($cg | ForEach-Object { $_.Cost * $_.Cagr } | Measure-Object -Sum).Sum / $cc } else { 0 }
    } else { 0 }
    [pscustomobject]@{
        Sector = $_.Name
        Count  = $_.Count
        Cost   = $cost
        MV     = $mv
        Simple = $simple
        Cagr   = $wcagr
        Weight = if ($totalCost -gt 0) { $cost / $totalCost * 100 } else { 0 }
    }
} | Sort-Object Cost -Descending

# Master table rows
$tableLines = @()
$rank = 1
foreach ($r in ($rows | Sort-Object { if ($null -eq $_.Cagr) { -9999 } else { $_.Cagr } } -Descending)) {
    $wt = if ($totalCost -gt 0) { $r.Cost / $totalCost * 100 } else { 0 }
    $cagrCol = if ($null -eq $r.Cagr) { '**n/a**' } else { "**$([math]::Round($r.Cagr, 2))%**" }
    $tableLines += "| $rank | **$($r.Ticker)** | $($r.Sector) | $($r.Qty.ToString('N0')) | $(Fmt-Lakh $r.Cost) | $(Fmt-Lakh $r.MV) | $(Fmt-Pct $r.Simple) | $cagrCol | $([math]::Round($wt, 1))% |"
    $rank++
}

$topLines = $top5 | ForEach-Object { "| **$($_.Ticker)** | $(Fmt-Pct $_.Simple) | **$([math]::Round($_.Cagr, 2))%** | $(Fmt-Lakh $_.MV) |" }
$botLines = $bot5 | ForEach-Object { "| **$($_.Ticker)** | $(Fmt-Pct $_.Simple) | **$([math]::Round($_.Cagr, 2))%** | $(Fmt-Lakh $_.MV) |" }
$secLines = $sectorGroups | ForEach-Object {
    "| $($_.Sector) | $($_.Count) | $(Fmt-Lakh $_.Cost) | $(Fmt-Lakh $_.MV) | $(Fmt-Pct $_.Simple) | **$([math]::Round($_.Cagr, 2))%** | $([math]::Round($_.Weight, 1))% |"
}

$fence = '```'
$content = @"
# Portfolio CAGR - Where Am I?

**As of:** $cmpDateLatest (CMP dates from individual CAGR_[TICKER].md files)  
**Generated:** $today  
**Positions:** $($rows.Count)  
**Legacy lot assumption:** holdings without confirmed trade use **2025-04-01**; **DRREDDY** = actual fill **2026-08-28**  
**CAGR n/a:** $naCagrCount position(s) with <1 day held (excluded from weighted CAGR)

Cross-ref: [holdings.md](holdings.md) | [StockBook/CAGR-FRAMEWORK.md](../StockBook/CAGR-FRAMEWORK.md) | `StockBook/_generate-portfolio-cagr.ps1`

---

## One-line snapshot

**Book $(Fmt-Lakh $totalCost) -> Market $(Fmt-Lakh $totalMV) | $(Fmt-Pct $portSimple) total | $(Fmt-Pct $portCagr) cost-weighted CAGR p.a. | $($winners.Count) up / $($losers.Count) down**

---

## Portfolio totals

| Metric | Value |
|--------|------:|
| Total cost basis | **$(Fmt-Lakh $totalCost)** |
| Market value @ CMP | **$(Fmt-Lakh $totalMV)** |
| Unrealised gain / (loss) | **$(Fmt-Pct ($totalGain / $totalCost * 100))** ($(Fmt-Lakh $totalGain)) |
| **Blended simple return** | **$(Fmt-Pct $portSimple)** |
| **Cost-weighted CAGR** (per-stock, by cost) | **$(Fmt-Pct $portCagr)** p.a. |
| Portfolio CAGR (uniform 2025-04-01 buy) | $(Fmt-Pct $portCagrUniform) p.a. |
| Holding period (legacy) | ~$($first.Days) days (~$([math]::Round($years, 2)) yrs) |
| CMP refresh | Run `StockBook/_generate-all-cagr.ps1` then this script |

*Cost-weighted CAGR = sum(cost x stock CAGR) / total cost. Use when lots have **different** buy dates later.*

---

## Top 5 - highest CAGR (since assumed buy date)

| Ticker | Simple return | CAGR p.a. | Market value |
|--------|-------------:|---------:|-------------:|
$($topLines -join "`n")

---

## Bottom 5 - lowest CAGR

| Ticker | Simple return | CAGR p.a. | Market value |
|--------|-------------:|---------:|-------------:|
$($botLines -join "`n")

---

## All holdings - ranked by CAGR

| # | Ticker | Sector | Qty | Cost | MV @ CMP | Simple | **CAGR** | Weight |
|--:|--------|--------|----:|-----:|---------:|-------:|---------:|-------:|
$($tableLines -join "`n")

---

## By sector (cost-weighted)

| Sector | Positions | Cost | MV | Simple | **CAGR** | Book % |
|--------|----------:|-----:|---:|-------:|---------:|-------:|
$($secLines -join "`n")

---

## How to read this

| Question | Look at |
|----------|---------|
| **Am I up overall?** | Portfolio totals - simple return |
| **Annualised pace since Apr-2025?** | Cost-weighted CAGR |
| **Which names carry the book?** | Weight column + sector table |
| **Best / worst performers?** | Top 5 / Bottom 5 |
| **Detail one stock?** | `StockBook/.../CAGR_[TICKER].md` |

---

## Refresh workflow

${fence}
1. .\StockBook\_generate-all-cagr.ps1
2. .\StockBook\_generate-portfolio-cagr.ps1
${fence}

---

## Change log

| Date | Change |
|------|--------|
| $today | Initial portfolio CAGR dashboard from $($rows.Count) stock CAGR files |

"@

$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($outPath, $content, $utf8)

# HTML companion (opens in browser - no markdown preview needed)
$htmlPath = Join-Path $root '.cursor\portfolio\portfolio-cagr.html'
$htmlRows = ($rows | Sort-Object { if ($null -eq $_.Cagr) { -9999 } else { $_.Cagr } } -Descending | ForEach-Object {
    $cagrCol = if ($null -eq $_.Cagr) { 'n/a' } else { "$([math]::Round($_.Cagr, 2))%" }
    $s = if ($_.Simple -ge 0) { '+' } else { '' }
    $cls = if ($_.Simple -ge 0) { 'pos' } else { 'neg' }
    "<tr><td>$($_.Ticker)</td><td>$($_.Sector)</td><td class=`"num`">$($_.Qty)</td><td class=`"num`">$([math]::Round($_.Cost,0))</td><td class=`"num`">$([math]::Round($_.MV,0))</td><td class=`"num $cls`">$s$([math]::Round($_.Simple,2))%</td><td class=`"num`">$cagrCol</td></tr>"
}) -join "`n"

$htmlTop = ($top5 | ForEach-Object {
    "<tr><td><strong>$($_.Ticker)</strong></td><td class=`"num`">+$( [math]::Round($_.Simple,2))%</td><td class=`"num`">$([math]::Round($_.Cagr,2))%</td><td class=`"num`">$([math]::Round($_.MV,0))</td></tr>"
}) -join "`n"

$htmlBot = ($bot5 | ForEach-Object {
    "<tr><td><strong>$($_.Ticker)</strong></td><td class=`"num`">$([math]::Round($_.Simple,2))%</td><td class=`"num`">$([math]::Round($_.Cagr,2))%</td><td class=`"num`">$([math]::Round($_.MV,0))</td></tr>"
}) -join "`n"

$html = @"
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Portfolio CAGR</title>
<style>
body{font-family:Segoe UI,sans-serif;max-width:1200px;margin:0 auto;padding:1.5rem;line-height:1.5;background:#f8fafc}
.header{background:#1e40af;color:#fff;padding:1.5rem;border-radius:8px;margin-bottom:1rem}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin:1rem 0}
.card{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:1rem}
.card h3{margin:0 0 .5rem;font-size:.85rem;color:#64748b;text-transform:uppercase}
.card .val{font-size:1.4rem;font-weight:700}
.pos{color:#15803d}.neg{color:#b91c1c}
table{width:100%;border-collapse:collapse;margin:1rem 0;background:#fff;font-size:.9rem}
th,td{border:1px solid #e2e8f0;padding:6px 8px}
th{background:#f1f5f9;text-align:left}
.num{text-align:right}
h2{margin-top:2rem;color:#1e293b}
</style></head><body>
<div class="header">
<h1>Portfolio CAGR - Where Am I?</h1>
<p>As of $cmpDateLatest | $($rows.Count) positions | Generated $today</p>
<p><strong>Book $(Fmt-Lakh $totalCost) -> Market $(Fmt-Lakh $totalMV) | $(Fmt-Pct $portSimple) | $(Fmt-Pct $portCagr) CAGR p.a.</strong></p>
</div>
<div class="cards">
<div class="card"><h3>Cost basis</h3><div class="val">$(Fmt-Lakh $totalCost)</div></div>
<div class="card"><h3>Market value</h3><div class="val">$(Fmt-Lakh $totalMV)</div></div>
<div class="card"><h3>Simple return</h3><div class="val pos">$(Fmt-Pct $portSimple)</div></div>
<div class="card"><h3>Weighted CAGR</h3><div class="val pos">$(Fmt-Pct $portCagr)</div></div>
<div class="card"><h3>Up / Down</h3><div class="val">$($winners.Count) / $($losers.Count)</div></div>
</div>
<h2>Top 5 CAGR</h2>
<table><tr><th>Ticker</th><th>Simple</th><th>CAGR</th><th>MV</th></tr>$htmlTop</table>
<h2>Bottom 5 CAGR</h2>
<table><tr><th>Ticker</th><th>Simple</th><th>CAGR</th><th>MV</th></tr>$htmlBot</table>
<h2>All holdings (ranked)</h2>
<table><tr><th>Ticker</th><th>Sector</th><th>Qty</th><th>Cost</th><th>MV</th><th>Simple</th><th>CAGR</th></tr>
$htmlRows
</table>
<p style="color:#64748b;font-size:.85rem">Source: individual CAGR_[TICKER].md files. Refresh: StockBook/_generate-portfolio-cagr.ps1</p>
</body></html>
"@

[System.IO.File]::WriteAllText($htmlPath, $html, $utf8)

Write-Output "Portfolio CAGR: cost=$(Fmt-Lakh $totalCost) MV=$(Fmt-Lakh $totalMV) simple=$(Fmt-Pct $portSimple) cagr=$(Fmt-Pct $portCagr)"
Write-Output "Written: $outPath ($($rows.Count) positions)"
Write-Output "Written: $htmlPath (open in browser)"
