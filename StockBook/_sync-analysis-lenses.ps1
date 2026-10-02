# Sync integrated lens sections into summary-analysis.md and suggested-approach.md
# Usage: .\StockBook\_sync-analysis-lenses.ps1 [-Ticker BHARTIARTL]
# See: StockBook/ANALYSIS-LENSES-FRAMEWORK.md

param([string]$Ticker = '')

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$reportRoot = $PSScriptRoot
$newsIndex = Join-Path $root 'News\TICKER-INDEX.md'
$syncDate = Get-Date -Format 'yyyy-MM-dd'

$holdings = @(
    @{ T='ASHOKLEY'; F='Auto\Ashok Leyland' }
    @{ T='BAJAJFINSV'; F='Banking and Finance\Bajaj Finserv' }
    @{ T='BALKRISIND'; F='Auto\Balkrishna Industries' }
    @{ T='BANKINDIA'; F='Banking and Finance\Bank of India' }
    @{ T='BHARTIARTL'; F='Telecom\Bharti Airtel' }
    @{ T='CIPLA'; F='Pharma\Cipla' }
    @{ T='CUPID'; F='Consumer\Cupid' }
    @{ T='DELTACORP'; F='Hotels and Leisure\Delta Corp' }
    @{ T='DRREDDY'; F='Pharma\Dr Reddys Laboratories' }
    @{ T='EICHERMOT'; F='Auto\Eicher Motors' }
    @{ T='FORTIS'; F='Healthcare\Fortis Healthcare' }
    @{ T='GICRE'; F='Banking and Finance\General Insurance Corporation' }
    @{ T='GLENMARK'; F='Pharma\Glenmark Pharma' }
    @{ T='HAVELLS'; F='Consumer\Havells India' }
    @{ T='HCLTECH'; F='IT\HCL Technologies' }
    @{ T='HDFCAMC'; F='Banking and Finance\HDFC Asset Management' }
    @{ T='HDFCBANK'; F='Banking and Finance\HDFC Bank' }
    @{ T='HDFCLIFE'; F='Banking and Finance\HDFC Life Insurance' }
    @{ T='HEG'; F='Infrastructure\HEG' }
    @{ T='HEROMOTOCO'; F='Auto\Hero MotoCorp' }
    @{ T='HINDUNILVR'; F='FMCG\Hindustan Unilever' }
    @{ T='ICICIBANK'; F='Banking and Finance\ICICI Bank' }
    @{ T='IGL'; F='Oil and Gas\Indraprastha Gas' }
    @{ T='INDHOTEL'; F='Hotels and Leisure\Indian Hotels' }
    @{ T='INFY'; F='IT\Infosys' }
    @{ T='IOC'; F='Oil and Gas\Indian Oil Corporation' }
    @{ T='ITC'; F='FMCG\ITC' }
    @{ T='ITCHOTELS'; F='Hotels and Leisure\ITC Hotels' }
    @{ T='KOTAKBANK'; F='Banking and Finance\Kotak Mahindra Bank' }
    @{ T='KWIL'; F='FMCG\Kwality Walls India' }
    @{ T='LT'; F='Infrastructure\Larsen and Toubro' }
    @{ T='LUPIN'; F='Pharma\Lupin' }
    @{ T='MARUTI'; F='Auto\Maruti Suzuki' }
    @{ T='MAXHEALTH'; F='Healthcare\Max Healthcare' }
    @{ T='MEDANTA'; F='Healthcare\Medanta' }
    @{ T='MOTHERSON'; F='Auto\Samvardhana Motherson' }
    @{ T='MUTHOOTFIN'; F='Banking and Finance\Muthoot Finance' }
    @{ T='ONGC'; F='Oil and Gas\Oil and Natural Gas Corp' }
    @{ T='PNB'; F='Banking and Finance\PNB' }
    @{ T='RAAJINFRA'; F='Infrastructure\Raajmarg Infra Investment' }
    @{ T='SBIN'; F='Banking and Finance\State Bank of India' }
    @{ T='SUNPHARMA'; F='Pharma\Sun Pharmaceutical' }
    @{ T='TATACONSUM'; F='FMCG\Tata Consumer Products' }
    @{ T='TATAMOTORS'; F='Auto\Tata Motors CV' }
    @{ T='TCS'; F='IT\Tata Consultancy Services' }
    @{ T='TECHM'; F='IT\Tech Mahindra' }
    @{ T='TMPV'; F='Auto\TMPV' }
    @{ T='UBL'; F='Consumer\United Breweries' }
    @{ T='UJJIVANSFB'; F='Banking and Finance\Ujjivan Small Finance Bank' }
    @{ T='WIPRO'; F='IT\Wipro' }
    @{ T='WONDERLA'; F='Hotels and Leisure\Wonderla Holidays' }
)

function Get-FileDate([string]$path) {
    if (-not (Test-Path $path)) { return '-' }
    return (Get-Item $path).LastWriteTime.ToString('yyyy-MM-dd')
}

function Trunc([string]$s, [int]$max = 72) {
    if ([string]::IsNullOrWhiteSpace($s)) { return 'See lens file' }
    $s = ($s -replace '\s+', ' ').Trim()
    if ($s.Length -le $max) { return $s }
    return $s.Substring(0, $max - 3) + '...'
}

function Get-NewsForTicker {
    param([string]$T, [string]$IndexText)
    if (-not $IndexText) { return @{ Date='-'; Snap='No news index'; Tie='Check News/'; Effect='No material flag' } }
    $lines = $IndexText -split "`n"
    foreach ($line in $lines) {
        if ($line -match "\|\s*$T\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*([^|]+)\|") {
            $snap = $matches[2].Trim()
            return @{
                Date = $matches[1]
                Snap = Trunc $snap
                Tie = if ($snap -match '-ve|negative|down|cut|fraud|ED|GST') { 'Slow SIP / watch' } else { 'Context only' }
                Effect = if ($snap -match 'block|lawsuit|ED|fraud|demand') { 'Pause lump sum; slow pace' } else { 'Monitor; thesis-led pace' }
            }
        }
    }
    return @{ Date='-'; Snap='No row in TICKER-INDEX'; Tie='See macro digest'; Effect='Thesis-led pace' }
}

function Get-ParamSnapshot([string]$path) {
    if (-not (Test-Path $path)) { return @{ Snap='File missing'; Tie='Run PARAMETERS batch'; Date='-' } }
    $t = [IO.File]::ReadAllText($path)
    if ($t -match '\|\s*\*\*Together\*\*\s*\|\s*([^|]+)\|\s*([^|]+)\|') {
        return @{ Snap = Trunc ($matches[1].Trim() + ' - ' + $matches[2].Trim()); Tie='Axis B / ADD gate'; Date = Get-FileDate $path }
    }
    if ($t -match 'Quick read @[^|]+\|\s*([^|]+)\|') {
        return @{ Snap = Trunc $matches[1].Trim(); Tie='Axis B input'; Date = Get-FileDate $path }
    }
    if ($t -match 'P/E \*\*([\d.]+x)\*\* vs avg \*\*([\d.x]+)\*\*[^|]*\|\s*\*\*([^|*]+)\*\*') {
        return @{ Snap = Trunc ("P/E $($matches[1]) vs 10Y $($matches[2]) - $($matches[3])"); Tie='Axis B input'; Date = Get-FileDate $path }
    }
    return @{ Snap='See PARAMETERS file'; Tie='Refresh Part 1+2'; Date = Get-FileDate $path }
}

function Get-BrokerSnapshot([string]$path) {
    if (-not (Test-Path $path)) { return @{ Snap='No BROKER file'; Date='-' } }
    $t = [IO.File]::ReadAllText($path)
    $snap = 'See BROKER file'
    if ($t -match 'Trendlyne consensus:\*\* Rs ([\d,]+) \(upside ([\d.]+)%\)') {
        $snap = "Consensus Rs $($matches[1]) (+$($matches[2])%)"
    }
    if ($t -match 'Brokers counted:\*\* (\d+)') {
        $snap += "; $($matches[1]) brokers"
    } elseif ($t -match '\|\s*Jefferies\s*\|') {
        $snap += '; incl. Jefferies'
    }
    if ($t -match 'No broker rows parsed') { $snap = 'Consensus only - refresh fetch' }
    return @{ Snap = Trunc $snap; Date = Get-FileDate $path }
}

function Get-CagrSnapshot([string]$path) {
    if (-not (Test-Path $path)) { return @{ Snap='No CAGR file'; Date='-' } }
    $t = [IO.File]::ReadAllText($path)
    $snap = 'See CAGR file'
    if ($t -match 'Cost-weighted CAGR %[^|]*\|\s*\*\*([^|*]+)\*\*') {
        $snap = "Book CAGR $($matches[1].Trim())"
    } elseif ($t -match 'Blended simple return %[^|]*\|\s*\*\*([^|*]+)\*\*') {
        $snap = "Simple return $($matches[1].Trim())"
    }
    return @{ Snap = Trunc $snap; Date = Get-FileDate $path }
}

function Get-QuotesSnapshot([string]$path) {
    if (-not (Test-Path $path)) { return @{ Snap='No faq yet'; Date='-' } }
    $t = [IO.File]::ReadAllText($path)
    if ($t -match 'Quotes lens') {
        return @{ Snap='Quotes lens in faq.md'; Date = Get-FileDate $path }
    }
    return @{ Snap='Not run (no buy/add logged)'; Date = Get-FileDate $path }
}

function Replace-MarkedSection {
    param([string]$Content, [string]$Start, [string]$End, [string]$Replacement)
    $escS = [regex]::Escape($Start)
    $escE = [regex]::Escape($End)
    $pattern = "(?s)$escS.*?$escE"
    if ($Content -match $pattern) {
        return [regex]::Replace($Content, $pattern, $Replacement)
    }
    return $null
}

function Build-SummaryLensBlock {
    param($H, $News, $Param, $Broker, $Cagr, $Quotes, $ApproachDate)
    @"
<!-- LENSES-SUMMARY:START -->
## Analysis lenses (integrated)

| Lens | File | Updated | Snapshot | Verdict tie-in |
|------|------|---------|----------|--------------|
| News | [``News/TICKER-INDEX.md``](../../../News/TICKER-INDEX.md) | $($News.Date) | $($News.Snap) | $($News.Tie) |
| Parameters (10Y + 5Y) | [``PARAMETERS_$($H.T).md``](PARAMETERS_$($H.T).md) | $($Param.Date) | $($Param.Snap) | $($Param.Tie) |
| Broker targets | [``BROKER_$($H.T).md``](BROKER_$($H.T).md) | $($Broker.Date) | $($Broker.Snap) | Secondary to PCCL |
| Holding CAGR | [``CAGR_$($H.T).md``](CAGR_$($H.T).md) | $($Cagr.Date) | $($Cagr.Snap) | Legacy book context |
| Quotes | [``faq.md``](faq.md) | $($Quotes.Date) | $($Quotes.Snap) | On buy/add only |
| PCCL / dual-axis | [``suggested-approach.md``](suggested-approach.md) | $ApproachDate | See valuation tier above | Sets SIP pace |

*Full registry:* [``StockBook/ANALYSIS-LENSES-FRAMEWORK.md``](../../../ANALYSIS-LENSES-FRAMEWORK.md) - Sync: ``StockBook/_sync-analysis-lenses.ps1`` ($syncDate)
<!-- LENSES-SUMMARY:END -->

## StockBook files & lenses

| File | Purpose |
|------|---------|
| ``summary-analysis.md`` | Verdict + integrated lens snapshot |
| ``suggested-approach.md`` | Lens-driven SIP plan |
| ``detail-analysis.md`` | Full framework |
| ``faq.md`` | Q&A + Quotes lens |
| ``PARAMETERS_$($H.T).md`` | 10Y rear-view + 5Y forward |
| ``BROKER_$($H.T).md`` | Street targets by broker |
| ``CAGR_$($H.T).md`` | Holding return per lot |

**Refresh:** After news run, parameters/broker batch, or verdict change - run lens sync.
"@
}

function Build-ApproachLensBlock {
    param($News, $Param, $Broker, $Cagr, $Quotes)
    @"
<!-- LENSES-APPROACH:START -->
## Lens-driven plan

How standalone lenses constrain **pace** and **surplus** (source files updated independently).

| Lens | Read @ CMP | Effect on pace / surplus |
|------|------------|---------------------------|
| **News** | $($News.Snap) | $($News.Effect) |
| **Parameters (Part 2 forward)** | $($Param.Snap) | Sets **Axis B** current value |
| **Broker street** | $($Broker.Snap) | **Does not override** PCCL or pause buckets |
| **Holding CAGR** | $($Cagr.Snap) | Blended cap discipline on legacy winners |
| **Quotes** | $($Quotes.Snap) | Staged starter vs lump sum on buy days |
| **PCCL / Axis A** | Tier in tables below | Baseline sh/mo |
| **Surplus rank** | ``quadrant-map.md`` | % of monthly investable |

## Lens conflict resolution

| If... | Then... |
|-------|---------|
| Street upside high but PCCL tier 1-2 | **PCCL wins** - token SIP only |
| Parameters forward cheap, Axis A expensive | **Dual-axis** - slow SIP; see Axis A/B tables |
| News overhang, thesis intact | **HOLD**; slow or pause **new** buys |
| Personal pause bucket (IT / HDFC Bank / ITC) | **0% surplus** - no lens overrides |
| YoC < 8% (dividend names) | **Pause adds** until YoC path clear |

*Registry:* [``ANALYSIS-LENSES-FRAMEWORK.md``](../../../ANALYSIS-LENSES-FRAMEWORK.md) · Sync: $syncDate
<!-- LENSES-APPROACH:END -->
"@
}

$newsText = if (Test-Path $newsIndex) { [IO.File]::ReadAllText($newsIndex) } else { '' }
$list = if ($Ticker) { $holdings | Where-Object { $_.T -eq $Ticker } } else { $holdings }
$utf8 = New-Object System.Text.UTF8Encoding $false
$count = 0

foreach ($h in $list) {
    $folder = Join-Path $reportRoot ($h.F -replace '\\', [IO.Path]::DirectorySeparatorChar)
    $summaryPath = Join-Path $folder 'summary-analysis.md'
    $approachPath = Join-Path $folder 'suggested-approach.md'
    if (-not (Test-Path $summaryPath)) { Write-Host "Skip $($h.T) - no summary"; continue }

    $news = Get-NewsForTicker -T $h.T -IndexText $newsText
    $param = Get-ParamSnapshot -path (Join-Path $folder "PARAMETERS_$($h.T).md")
    $broker = Get-BrokerSnapshot -path (Join-Path $folder "BROKER_$($h.T).md")
    $cagr = Get-CagrSnapshot -path (Join-Path $folder "CAGR_$($h.T).md")
    $quotes = Get-QuotesSnapshot -path (Join-Path $folder 'faq.md')
    $approachDate = Get-FileDate $approachPath

    $sumBlock = Build-SummaryLensBlock -H $h -News $news -Param $param -Broker $broker -Cagr $cagr -Quotes $quotes -ApproachDate $approachDate
    $appBlock = Build-ApproachLensBlock -News $news -Param $param -Broker $broker -Cagr $cagr -Quotes $quotes

    # --- summary ---
    $sum = [IO.File]::ReadAllText($summaryPath)
    $replaced = Replace-MarkedSection -Content $sum -Start '<!-- LENSES-SUMMARY:START -->' -End '<!-- LENSES-SUMMARY:END -->' -Replacement $sumBlock
    if ($replaced) {
        $sum = $replaced
    } else {
        if ($sum -match '(?s)## Files\r?\n') {
            $sum = $sum -replace '(?s)## Files\r?\n.*', ($sumBlock + "`n")
        } else {
            $sum = $sum.TrimEnd() + "`n`n" + $sumBlock + "`n"
        }
    }
    [IO.File]::WriteAllText($summaryPath, $sum, $utf8)

    # --- approach ---
    if (Test-Path $approachPath) {
        $app = [IO.File]::ReadAllText($approachPath)
        $replacedApp = Replace-MarkedSection -Content $app -Start '<!-- LENSES-APPROACH:START -->' -End '<!-- LENSES-APPROACH:END -->' -Replacement $appBlock
        if ($replacedApp) {
            $app = $replacedApp
        } else {
            if ($app -match '(?s)(Cross-ref:.*?\r?\n\r?\n---\r?\n)') {
                $app = [regex]::Replace($app, '(?s)(Cross-ref:.*?\r?\n\r?\n---\r?\n)', "`$1`n$appBlock`n", 1)
            } elseif ($app -match '(?s)(---\r?\n\r?\n## Dual-axis)') {
                $app = [regex]::Replace($app, '(?s)(---\r?\n\r?\n)(## Dual-axis)', "`$1$appBlock`n`n`$2", 1)
            } else {
                $app = $app.TrimEnd() + "`n`n" + $appBlock + "`n"
            }
        }
        [IO.File]::WriteAllText($approachPath, $app, $utf8)
    }

    $count++
    Write-Host "Synced $($h.T)"
}

Write-Host "Done: $count stocks lens-synced ($syncDate)"
