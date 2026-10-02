# Parse Trendlyne WebFetch markdown and write BROKER_[TICKER].md files.
# Usage: .\StockBook\_generate-all-broker-targets.ps1 [-Ticker BHARTIARTL]

param([string]$Ticker = '')

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$reportRoot = Join-Path $root 'Report'
$fetchDir = Join-Path $reportRoot '_broker-fetch'
$asOf = Get-Date -Format 'yyyy-MM-dd'

# Same holdings map as _generate-all-cagr.ps1
$holdings = @(
    @{ T='ASHOKLEY'; N='Ashok Leyland'; F='Auto\Ashok Leyland' }
    @{ T='BAJAJFINSV'; N='Bajaj Finserv'; F='Banking and Finance\Bajaj Finserv' }
    @{ T='BALKRISIND'; N='Balkrishna Industries'; F='Auto\Balkrishna Industries' }
    @{ T='BANKINDIA'; N='Bank of India'; F='Banking and Finance\Bank of India' }
    @{ T='BHARTIARTL'; N='Bharti Airtel'; F='Telecom\Bharti Airtel' }
    @{ T='CIPLA'; N='Cipla'; F='Pharma\Cipla' }
    @{ T='DELTACORP'; N='Delta Corp'; F='Hotels and Leisure\Delta Corp' }
    @{ T='DRREDDY'; N="Dr Reddy's Laboratories"; F='Pharma\Dr Reddys Laboratories' }
    @{ T='EICHERMOT'; N='Eicher Motors'; F='Auto\Eicher Motors' }
    @{ T='FORTIS'; N='Fortis Healthcare'; F='Healthcare\Fortis Healthcare' }
    @{ T='GICRE'; N='General Insurance Corporation'; F='Banking and Finance\General Insurance Corporation' }
    @{ T='GLENMARK'; N='Glenmark Pharma'; F='Pharma\Glenmark Pharma' }
    @{ T='HAVELLS'; N='Havells India'; F='Consumer\Havells India' }
    @{ T='HCLTECH'; N='HCL Technologies'; F='IT\HCL Technologies' }
    @{ T='HDFCAMC'; N='HDFC Asset Management'; F='Banking and Finance\HDFC Asset Management' }
    @{ T='HDFCBANK'; N='HDFC Bank'; F='Banking and Finance\HDFC Bank' }
    @{ T='HDFCLIFE'; N='HDFC Life Insurance'; F='Banking and Finance\HDFC Life Insurance' }
    @{ T='HEG'; N='HEG'; F='Infrastructure\HEG' }
    @{ T='HEROMOTOCO'; N='Hero MotoCorp'; F='Auto\Hero MotoCorp' }
    @{ T='HINDUNILVR'; N='Hindustan Unilever'; F='FMCG\Hindustan Unilever' }
    @{ T='ICICIBANK'; N='ICICI Bank'; F='Banking and Finance\ICICI Bank' }
    @{ T='IGL'; N='Indraprastha Gas'; F='Oil and Gas\Indraprastha Gas' }
    @{ T='INDHOTEL'; N='Indian Hotels'; F='Hotels and Leisure\Indian Hotels' }
    @{ T='INFY'; N='Infosys'; F='IT\Infosys' }
    @{ T='IOC'; N='Indian Oil Corporation'; F='Oil and Gas\Indian Oil Corporation' }
    @{ T='ITC'; N='ITC'; F='FMCG\ITC' }
    @{ T='ITCHOTELS'; N='ITC Hotels'; F='Hotels and Leisure\ITC Hotels' }
    @{ T='KOTAKBANK'; N='Kotak Mahindra Bank'; F='Banking and Finance\Kotak Mahindra Bank' }
    @{ T='KWIL'; N='Kwality Walls India'; F='FMCG\Kwality Walls India' }
    @{ T='LT'; N='Larsen and Toubro'; F='Infrastructure\Larsen and Toubro' }
    @{ T='LUPIN'; N='Lupin'; F='Pharma\Lupin' }
    @{ T='MARUTI'; N='Maruti Suzuki'; F='Auto\Maruti Suzuki' }
    @{ T='MAXHEALTH'; N='Max Healthcare'; F='Healthcare\Max Healthcare' }
    @{ T='MEDANTA'; N='Global Health (Medanta)'; F='Healthcare\Medanta' }
    @{ T='MOTHERSON'; N='Samvardhana Motherson'; F='Auto\Samvardhana Motherson' }
    @{ T='MUTHOOTFIN'; N='Muthoot Finance'; F='Banking and Finance\Muthoot Finance' }
    @{ T='ONGC'; N='Oil and Natural Gas Corp'; F='Oil and Gas\Oil and Natural Gas Corp' }
    @{ T='PNB'; N='Punjab National Bank'; F='Banking and Finance\PNB' }
    @{ T='RAAJINFRA'; N='Raajmarg Infra Investment'; F='Infrastructure\Raajmarg Infra Investment' }
    @{ T='SBIN'; N='State Bank of India'; F='Banking and Finance\State Bank of India' }
    @{ T='SUNPHARMA'; N='Sun Pharmaceutical'; F='Pharma\Sun Pharmaceutical' }
    @{ T='TATACONSUM'; N='Tata Consumer Products'; F='FMCG\Tata Consumer Products' }
    @{ T='TATAMOTORS'; N='Tata Motors (CV)'; F='Auto\Tata Motors CV' }
    @{ T='TCS'; N='Tata Consultancy Services'; F='IT\Tata Consultancy Services' }
    @{ T='TECHM'; N='Tech Mahindra'; F='IT\Tech Mahindra' }
    @{ T='TMPV'; N='Tata Motors Passenger Vehicles'; F='Auto\TMPV' }
    @{ T='UBL'; N='United Breweries'; F='Consumer\United Breweries' }
    @{ T='UJJIVANSFB'; N='Ujjivan Small Finance Bank'; F='Banking and Finance\Ujjivan Small Finance Bank' }
    @{ T='WIPRO'; N='Wipro'; F='IT\Wipro' }
    @{ T='WONDERLA'; N='Wonderla Holidays'; F='Hotels and Leisure\Wonderla Holidays' }
)

# Manual supplements when Trendlyne lacks broker (Ticker -> array of broker rows)
$supplements = @{
    BHARTIARTL = @(
        @{ Broker='Jefferies'; Date='2026-08-27'; Reco='Buy'; Target=2400; Source='Live search - Business Upturn / ET Aug 2026' }
    )
}

function Normalize-BrokerName {
    param([string]$Author)
    $a = $Author.Trim()
    if ($a -match 'Consensus') { return $null }
    if ($a -match 'ICICI Securities') { return 'ICICI Securities' }
    if ($a -match 'ICICI Direct') { return 'ICICI Direct' }
    if ($a -match 'Motilal Oswal') { return 'Motilal Oswal' }
    if ($a -match 'Axis Direct|Axis Capital') { return 'Axis Direct' }
    if ($a -match 'Kotak') { return 'Kotak Securities' }
    if ($a -match 'HDFC Sec') { return 'HDFC Securities' }
    if ($a -match 'Jefferies') { return 'Jefferies' }
    if ($a -match 'Morgan Stanley') { return 'Morgan Stanley' }
    if ($a -match 'HSBC') { return 'HSBC' }
    if ($a -match 'BOB Capital') { return 'BOB Capital' }
    if ($a -match 'Geojit') { return 'Geojit BNP Paribas' }
    if ($a -match 'Deven Choksey') { return 'Deven Choksey' }
    if ($a -match 'Motilal') { return 'Motilal Oswal' }
    if ($a -match 'Prabhudas') { return 'Prabhudas Lilladhar' }
    if ($a -match 'Sharekhan') { return 'Sharekhan' }
    if ($a -match 'Edelweiss') { return 'Edelweiss' }
    if ($a -match 'Anand Rathi') { return 'Anand Rathi' }
    if ($a -match 'IDBI Capital') { return 'IDBI Capital' }
    if ($a -match 'Emkay') { return 'Emkay' }
    if ($a -match 'FundsIndia') { return 'FundsIndia' }
    if ($a -match 'BP Wealth') { return 'BP Wealth' }
    # Strip trailing Target / Reco Target
    $a = ($a -replace '\s+(Reco\s+)?Target\s*$', '').Trim()
    return $a
}

function Parse-TrendlyneDate {
    param([string]$s)
    try {
        $d = [datetime]::ParseExact($s.Trim(), 'd MMM yyyy', [System.Globalization.CultureInfo]::InvariantCulture)
        return $d.ToString('yyyy-MM-dd')
    } catch { return $s }
}

function Parse-TrendlyneFetch {
    param([string]$Text)

    $result = @{
        Cmp = $null
        Consensus = $null
        ConsensusUpside = $null
        AnalystCount = $null
        Brokers = @{}
    }

    if ($Text -match 'average share price target of\s+([\d,]+(?:\.\d+)?)') {
        $result.Consensus = [double]($matches[1] -replace ',', '')
    }
    if ($Text -match 'upside of\s+([\d.]+)%\s+from the last price of\s+([\d,]+(?:\.\d+)?)') {
        $result.ConsensusUpside = [double]$matches[1]
        $result.Cmp = [double]($matches[2] -replace ',', '')
    }
    if ($Text -match 'View\s+(\d+)\s+reports from\s+(\d+)\s+analysts') {
        $result.AnalystCount = [int]$matches[2]
    }

    $rowRx = '\|\s*\|\s*(\d{1,2}\s+\w{3}\s+\d{4})\s*\|\s*[^|]+\|\s*([^|]+?)\s*\|\s*([\d,.]+)\s*\|\s*([\d,.]+)\s*\|'
    foreach ($m in [regex]::Matches($Text, $rowRx)) {
        $dateStr = $m.Groups[1].Value
        $author = $m.Groups[2].Value.Trim()
        $targetStr = $m.Groups[4].Value.Trim()
        if ($targetStr -notmatch '\d') { continue }
        $target = [double]($targetStr -replace ',', '')
        if ($target -le 0) { continue }

        $broker = Normalize-BrokerName -Author $author
        if (-not $broker) { continue }

        $isoDate = Parse-TrendlyneDate -s $dateStr
        $dt = try { [datetime]::Parse($isoDate) } catch { [datetime]::MinValue }

        # Extract reco from line after target if present
        $reco = '—'
        $lineStart = $m.Index
        $lineEnd = $Text.IndexOf("`n", $lineStart)
        if ($lineEnd -lt 0) { $lineEnd = $Text.Length }
        $line = $Text.Substring($lineStart, $lineEnd - $lineStart)
        if ($line -match '\|\s*([\d.]+|Target met)\s*\|\s*(\w+)') {
            $reco = $matches[2]
        }

        if (-not $result.Brokers.ContainsKey($broker) -or $dt -gt $result.Brokers[$broker].DateObj) {
            $result.Brokers[$broker] = @{
                Date = $isoDate
                DateObj = $dt
                Reco = $reco
                Target = $target
                Source = 'Trendlyne'
            }
        }
    }
    return $result
}

function Write-BrokerTargetFile {
    param($H, [hashtable]$Data, [array]$ExtraBrokers = @())

    $folder = Join-Path $reportRoot ($H.F -replace '\\', [IO.Path]::DirectorySeparatorChar)
    $outFile = Join-Path $folder ("BROKER_{0}.md" -f $H.T)
    if (-not (Test-Path $folder)) { New-Item -ItemType Directory -Path $folder -Force | Out-Null }

    $cmp = $Data.Cmp
    $rows = @()
    foreach ($k in $Data.Brokers.Keys) {
        $b = $Data.Brokers[$k]
        $up = if ($cmp -and $cmp -gt 0) { [math]::Round(($b.Target - $cmp) / $cmp * 100, 1) } else { $null }
        $rows += [pscustomobject]@{
            Broker = $k; Date = $b.Date; Reco = $b.Reco; Target = $b.Target
            Upside = $up; Source = $b.Source; DateObj = $b.DateObj
        }
    }
    foreach ($eb in $ExtraBrokers) {
        $dt = try { [datetime]::Parse($eb.Date) } catch { [datetime]::MaxValue }
        $up = if ($cmp -and $cmp -gt 0) { [math]::Round(($eb.Target - $cmp) / $cmp * 100, 1) } else { $null }
        $existing = $rows | Where-Object { $_.Broker -eq $eb.Broker }
        if ($existing -and ($existing | Sort-Object DateObj -Descending | Select-Object -First 1).DateObj -ge $dt) { continue }
        $rows = @($rows | Where-Object { $_.Broker -ne $eb.Broker })
        $rows += [pscustomobject]@{
            Broker = $eb.Broker; Date = $eb.Date; Reco = $eb.Reco; Target = [double]$eb.Target
            Upside = $up; Source = $eb.Source; DateObj = $dt
        }
    }

    $rows = $rows | Sort-Object { $_.Target } -Descending

    $consensusLine = if ($Data.Consensus) {
        $u = if ($null -ne $Data.ConsensusUpside) { "$($Data.ConsensusUpside)%" } else { '-' }
        $ac = if ($Data.AnalystCount) { "$($Data.AnalystCount) analysts" } else { 'Trendlyne' }
        "**Trendlyne consensus:** Rs $([math]::Round($Data.Consensus, 0)) (upside $u) | $ac"
    } else { '**Trendlyne consensus:** - (no fetch or stale)' }

    $cmpLine = if ($cmp) { "Rs $([math]::Round($cmp, 2))" } else { '-' }

    $sb = @"
# $($H.N) - Broker Target Prices

**Ticker:** $($H.T) (NSE) | **CMP:** $cmpLine | **CMP date:** $asOf  
$consensusLine  
**As of:** $asOf | **Horizon:** ~12-month broker targets (typical)

Cross-ref: ``BROKER-TARGET-FRAMEWORK.md`` | ``summary-analysis.md`` | ``.cursor/portfolio/broker-target-prices.md``

---

## Latest target by broker (most recent report per house)

| Broker | Date | Reco | Target (Rs) | Upside % | Source |
|--------|------|------|------------:|---------:|--------|
"@

    if ($rows.Count -eq 0) {
        $sb += [Environment]::NewLine + '| - | - | - | - | - | No broker rows parsed - run fetch |'
    } else {
        foreach ($r in $rows) {
            $t = '{0:N0}' -f $r.Target
            $u = if ($null -ne $r.Upside) { "$($r.Upside)%" } else { '-' }
            $sb += "`n| $($r.Broker) | $($r.Date) | $($r.Reco) | $t | $u | $($r.Source) |"
        }
    }

    if ($rows.Count -gt 0 -and $cmp -and $cmp -gt 0) {
        $avg = [math]::Round(($rows.Target | Measure-Object -Average).Average, 0)
        $avgUp = [math]::Round(($avg - $cmp) / $cmp * 100, 1)
        $sb += @"

**Street avg (listed brokers):** Rs $avg | **Upside vs CMP:** $avgUp% | **Brokers counted:** $($rows.Count)
"@
    }

    $sb += @"

---

## Agent use

- **Secondary** to PCCL, business quality, personal pause buckets — not a buy signal alone.
- Portfolio matrix blanks were **not** authoritative; this file lists only brokers with targets.

## Change log

| Date | Change |
|------|--------|
| $asOf | Generated from Trendlyne fetch + supplements |

"@

    $utf8 = New-Object System.Text.UTF8Encoding $false
    [IO.File]::WriteAllText($outFile, $sb, $utf8)
    return $outFile
}

if (-not (Test-Path $fetchDir)) { New-Item -ItemType Directory -Path $fetchDir -Force | Out-Null }

$list = if ($Ticker) { $holdings | Where-Object { $_.T -eq $Ticker } } else { $holdings }
$written = 0
$missing = @()

foreach ($h in $list) {
    $fetchFile = Join-Path $fetchDir "$($h.T).md"
    $extra = if ($supplements.ContainsKey($h.T)) { $supplements[$h.T] } else { @() }

    if (-not (Test-Path $fetchFile)) {
        $missing += $h.T
        if ($extra.Count -eq 0) { continue }
        $data = @{ Cmp = $null; Consensus = $null; Brokers = @{} }
    } else {
        $text = [IO.File]::ReadAllText($fetchFile)
        $data = Parse-TrendlyneFetch -Text $text
    }

    $path = Write-BrokerTargetFile -H $h -Data $data -ExtraBrokers $extra
    Write-Host "Wrote $path ($($data.Brokers.Count + $extra.Count) brokers)"
    $written++
}

Write-Host "`nDone: $written files. Missing fetch: $($missing.Count) - save Trendlyne WebFetch to StockBook/_broker-fetch/[TICKER].md"
