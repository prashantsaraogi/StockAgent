# Fetch broker price targets from Trendlyne for all portfolio holdings.
# Usage: .\.cursor\portfolio\_fetch-broker-targets.ps1
# Output: broker-target-prices.md

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$outPath = Join-Path $PSScriptRoot 'broker-target-prices.md'
$htmlPath = Join-Path $PSScriptRoot 'broker-target-prices.html'
$holdingsPath = Join-Path $PSScriptRoot 'holdings.md'
$asOf = Get-Date -Format 'yyyy-MM-dd'

# Trendlyne stock id + slug (verified Aug 2026)
$trendlyneMap = @{
    ASHOKLEY   = @{ Id = 114;      Slug = 'ashok-leyland-ltd' }
    BAJAJFINSV = @{ Id = 147;      Slug = 'bajaj-finserv-ltd' }
    BALKRISIND = @{ Id = 153;      Slug = 'balkrishna-industries-ltd' }
    BANKINDIA  = @{ Id = 163;      Slug = 'bank-of-india' }
    BHARTIARTL = @{ Id = 187;      Slug = 'bharti-airtel-ltd' }
    CIPLA      = @{ Id = 268;      Slug = 'cipla-ltd' }
    DELTACORP  = @{ Id = 320;      Slug = 'delta-corp-ltd' }
    DRREDDY    = @{ Id = 346;      Slug = 'dr-reddy-s-laboratories-ltd' }
    EICHERMOT  = @{ Id = 360;      Slug = 'eicher-motors-ltd' }
    FORTIS     = @{ Id = 424;      Slug = 'fortis-healthcare-ltd' }
    GLENMARK   = @{ Id = 464;      Slug = 'glenmark-pharmaceuticals-ltd' }
    HAVELLS    = @{ Id = 525;      Slug = 'havells-india-ltd' }
    HCLTECH    = @{ Id = 531;      Slug = 'hcl-technologies-ltd' }
    HEG        = @{ Id = 535;      Slug = 'heg-ltd' }
    HEROMOTOCO = @{ Id = 540;      Slug = 'hero-motocorp-ltd' }
    HINDUNILVR = @{ Id = 560;      Slug = 'hindustan-unilever-ltd' }
    ICICIBANK  = @{ Id = 584;      Slug = 'icici-bank-ltd' }
    IGL        = @{ Id = 596;      Slug = 'indraprastha-gas-ltd' }
    INDHOTEL   = @{ Id = 606;      Slug = 'indian-hotels-company-ltd' }
    INFY       = @{ Id = 630;      Slug = 'infosys-ltd' }
    IOC        = @{ Id = 639;      Slug = 'indian-oil-corporation-ltd' }
    ITC        = @{ Id = 647;      Slug = 'itc-ltd' }
    ITCHOTELS  = @{ Id = 2956218;  Slug = 'itc-hotels-ltd' }
    KOTAKBANK  = @{ Id = 758;      Slug = 'kotak-mahindra-bank-ltd' }
    LT         = @{ Id = 800;      Slug = 'larsen-toubro-ltd' }
    LUPIN      = @{ Id = 804;      Slug = 'lupin-ltd' }
    MARUTI     = @{ Id = 842;      Slug = 'maruti-suzuki-india-ltd' }
    MOTHERSON  = @{ Id = 878;      Slug = 'samvardhana-motherson-international-ltd' }
    MUTHOOTFIN = @{ Id = 897;      Slug = 'muthoot-finance-ltd' }
    ONGC       = @{ Id = 974;      Slug = 'oil-and-natural-gas-corporation-ltd' }
    PNB        = @{ Id = 1048;     Slug = 'punjab-national-bank' }
    SBIN       = @{ Id = 1193;     Slug = 'state-bank-of-india' }
    SUNPHARMA  = @{ Id = 1316;     Slug = 'sun-pharmaceutical-industries-ltd' }
    TATACONSUM = @{ Id = 1359;     Slug = 'tata-consumer-products-ltd' }
    TMPV       = @{ Id = 1362;     Slug = 'tata-motors-passenger-vehicles-ltd' }
    TCS        = @{ Id = 1372;     Slug = 'tata-consultancy-services-ltd' }
    TECHM      = @{ Id = 1374;     Slug = 'tech-mahindra-ltd' }
    UBL        = @{ Id = 1437;     Slug = 'united-breweries-ltd' }
    WIPRO      = @{ Id = 1526;     Slug = 'wipro-ltd' }
    WONDERLA   = @{ Id = 1528;     Slug = 'wonderla-holidays-ltd' }
    HDFCBANK   = @{ Id = 533;      Slug = 'hdfc-bank-ltd' }
    HDFCAMC    = @{ Id = 94155;    Slug = 'hdfc-asset-management-company-ltd' }
    HDFCLIFE   = @{ Id = 65394;    Slug = 'hdfc-life-insurance-company-ltd' }
    GICRE      = @{ Id = 63527;    Slug = 'general-insurance-corporation-of-india' }
    MAXHEALTH  = @{ Id = 276825;  Slug = 'max-healthcare-institute-ltd' }
    MEDANTA    = @{ Id = 1108489;  Slug = 'global-health-ltd' }
    UJJIVANSFB = @{ Id = 175415;   Slug = 'ujjivan-small-finance-bank-ltd' }
    RAAJINFRA  = @{ Id = 3448665;  Slug = 'raajmarg-infra-investment-trust' }
    TATAMOTORS = @{ Id = 3327757;  Slug = 'tata-motors-ltd' }  # NSE: TMCV (CV entity)
    KWIL       = $null  # New listing; no Trendlyne coverage yet (Aug 2026)
}

$companyNames = @{
    ASHOKLEY='Ashok Leyland'; BAJAJFINSV='Bajaj Finserv'; BALKRISIND='Balkrishna Ind'
    BANKINDIA='Bank of India'; BHARTIARTL='Bharti Airtel'; CIPLA='Cipla'; DELTACORP='Delta Corp'
    DRREDDY="Dr Reddy's"; EICHERMOT='Eicher Motors'; FORTIS='Fortis'; GICRE='GIC Re'
    GLENMARK='Glenmark'; HAVELLS='Havells'; HCLTECH='HCL Tech'; HDFCAMC='HDFC AMC'
    HDFCBANK='HDFC Bank'; HDFCLIFE='HDFC Life'; HEG='HEG'; HEROMOTOCO='Hero MotoCorp'
    HINDUNILVR='HUL'; ICICIBANK='ICICI Bank'; IGL='IGL'; INDHOTEL='Indian Hotels'
    INFY='Infosys'; IOC='Indian Oil'; ITC='ITC'; ITCHOTELS='ITC Hotels'; KOTAKBANK='Kotak Bank'
    KWIL='Kwality Walls'; LT='L&T'; LUPIN='Lupin'; MARUTI='Maruti'; MAXHEALTH='Max Healthcare'
    MEDANTA='Medanta'; MOTHERSON='Motherson'; MUTHOOTFIN='Muthoot Finance'; ONGC='ONGC'
    PNB='PNB'; RAAJINFRA='Raajmarg Infra'; SBIN='SBI'; SUNPHARMA='Sun Pharma'
    TATACONSUM='Tata Consumer'; TATAMOTORS='Tata Motors CV'; TCS='TCS'; TECHM='Tech Mahindra'
    TMPV='Tata Motors PV'; UBL='United Breweries'; UJJIVANSFB='Ujjivan SFB'
    WIPRO='Wipro'; WONDERLA='Wonderla'
}

function Get-BrokerBucket {
    param([string]$Author)
    if ([string]::IsNullOrWhiteSpace($Author)) { return $null }
    $a = $Author.ToLower()
    if ($a -match 'consensus') { return $null }
    if ($a -match 'icici') { return 'ICICI' }
    if ($a -match 'morgan stanley') { return 'Morgan' }
    if ($a -match 'kotak') { return 'Kotak' }
    if ($a -match 'hdfc sec') { return 'HDFC' }
    if ($a -match 'jefferies') { return 'Jefferies' }
    if ($a -match 'hsbc') { return 'HSBC' }
    if ($a -match 'motilal') { return 'Motilal' }
    return 'Other'
}

function Parse-TrendlyneDate {
    param([string]$s)
    try {
        return [datetime]::ParseExact($s.Trim(), 'd MMM yyyy', [System.Globalization.CultureInfo]::InvariantCulture)
    } catch {
        return [datetime]::MinValue
    }
}

function Fetch-TrendlyneTargets {
    param([string]$Ticker, [hashtable]$Meta)

    $result = [ordered]@{
        Ticker = $Ticker
        Company = $companyNames[$Ticker]
        Cmp = $null
        Consensus = $null
        ICICI = $null; Morgan = $null; Kotak = $null; HDFC = $null
        Jefferies = $null; HSBC = $null; Motilal = $null; Other = $null
        OtherBroker = $null
        Avg = $null
        Upside = $null
        BrokerCount = 0
        Notes = ''
        Ok = $false
    }

    if (-not $Meta) {
        $result.Notes = 'No Trendlyne mapping'
        return $result
    }

    $url = "https://trendlyne.com/research-reports/stock/$($Meta.Id)/$Ticker/$($Meta.Slug)/"
    try {
        $html = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30 -Headers @{
            'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }).Content
    } catch {
        $result.Notes = "Fetch failed: $($_.Exception.Message)"
        return $result
    }

    if ($html -match 'average share price target of\s+([\d,]+(?:\.\d+)?)') {
        $result.Consensus = [double]($matches[1] -replace ',', '')
    }
    if ($html -match 'from the last price of\s+([\d,]+(?:\.\d+)?)') {
        $result.Cmp = [double]($matches[1] -replace ',', '')
    }

    # Row pattern: | | DD Mon YYYY | Stock | Author | LTP | Target |
    $rowRx = '\|\s*(?:\|\s*)?(\d{1,2}\s+\w{3}\s+\d{4})\s*\|\s*[^|]+\|\s*([^|]+?)\s*\|\s*([\d,.]+)\s*\|\s*([\d,.]+)\s*\|'
    $matches = [regex]::Matches($html, $rowRx)
    $latestByBucket = @{}
    $latestOtherName = $null
    $latestOtherDate = [datetime]::MinValue

    foreach ($m in $matches) {
        $dateStr = $m.Groups[1].Value
        $author = $m.Groups[2].Value.Trim()
        $ltp = [double]($m.Groups[3].Value -replace ',', '')
        $target = [double]($m.Groups[4].Value -replace ',', '')
        if ($target -le 0) { continue }

        if (-not $result.Cmp -and $ltp -gt 0) { $result.Cmp = $ltp }

        $bucket = Get-BrokerBucket -Author $author
        if (-not $bucket) { continue }

        $dt = Parse-TrendlyneDate -s $dateStr
        if (-not $latestByBucket.ContainsKey($bucket) -or $dt -gt $latestByBucket[$bucket].Date) {
            $latestByBucket[$bucket] = @{ Date = $dt; Target = $target; Author = $author }
        }
        if ($bucket -eq 'Other' -and $dt -ge $latestOtherDate) {
            $latestOtherDate = $dt
            $latestOtherName = ($author -replace '\s+(Target|Reco Target|Reco)$', '').Trim()
        }
    }

    foreach ($key in @('ICICI','Morgan','Kotak','HDFC','Jefferies','HSBC','Motilal','Other')) {
        if ($latestByBucket.ContainsKey($key)) {
            $result[$key] = $latestByBucket[$key].Target
        }
    }
    if ($latestOtherName) { $result.OtherBroker = $latestOtherName }

    $vals = @('ICICI','Morgan','Kotak','HDFC','Jefferies','HSBC','Motilal','Other') |
        ForEach-Object { if ($result[$_]) { [double]$result[$_] } }
    if ($vals.Count -gt 0) {
        $result.Avg = [math]::Round(($vals | Measure-Object -Average).Average, 2)
        $result.BrokerCount = $vals.Count
    } elseif ($result.Consensus) {
        $result.Avg = $result.Consensus
        $result.BrokerCount = 0
        $result.Notes = 'Avg = Trendlyne consensus (no named broker in table)'
    }

    if ($result.Avg -and $result.Cmp -and $result.Cmp -gt 0) {
        $result.Upside = [math]::Round(($result.Avg - $result.Cmp) / $result.Cmp * 100, 1)
    }

    $result.Ok = ($null -ne $result.Avg)
    return $result
}

function Format-Price {
    param($v)
    if ($null -eq $v -or $v -eq 0) { return '-' }
    if ($v -ge 1000) { return ('{0:N0}' -f $v) -replace ',', ',' }
    return ('{0:N2}' -f $v) -replace '\.00$', ''
}

# Fixed 50 holdings (matches holdings.md summary table)
$tickers = @(
    'ASHOKLEY','BAJAJFINSV','BALKRISIND','BANKINDIA','BHARTIARTL','CIPLA','DELTACORP','EICHERMOT',
    'FORTIS','GICRE','GLENMARK','HAVELLS','HCLTECH','HDFCAMC','HDFCBANK','HDFCLIFE','HEG',
    'HEROMOTOCO','HINDUNILVR','ICICIBANK','IGL','INDHOTEL','INFY','IOC','ITC','ITCHOTELS',
    'KOTAKBANK','KWIL','LT','LUPIN','MARUTI','MAXHEALTH','MEDANTA','MOTHERSON','MUTHOOTFIN',
    'ONGC','PNB','RAAJINFRA','SBIN','SUNPHARMA','TATACONSUM','TATAMOTORS','TCS','TECHM','TMPV',
    'UBL','UJJIVANSFB','WIPRO','WONDERLA','DRREDDY'
)

Write-Host "Fetching broker targets for $($tickers.Count) holdings..."
$rows = @()
$i = 0
foreach ($t in $tickers) {
    $i++
    Write-Host "  [$i/$($tickers.Count)] $t"
    $meta = $trendlyneMap[$t]
    $rows += Fetch-TrendlyneTargets -Ticker $t -Meta $meta
    Start-Sleep -Milliseconds 1200
}

function Get-RowNotes {
    param($r)
    $otherNote = if ($r.OtherBroker) { $r.OtherBroker } else { '' }
    $notes = @($otherNote, $r.Notes) | Where-Object { $_ } | Select-Object -First 1
    if (-not $notes) { return '' }
    if ($notes.Length -gt 40) { return $notes.Substring(0, 37) + '...' }
    return $notes
}

function Get-UpsideClass {
    param($upside)
    if ($null -eq $upside) { return '' }
    if ($upside -ge 0) { return 'pos' }
    return 'neg'
}

$okCount = ($rows | Where-Object { $_.Ok }).Count
$namedCount = ($rows | Where-Object { $_.BrokerCount -gt 0 }).Count
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("# Broker Target Prices (Portfolio)")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("> **Full broker table:** open **[HTML view](broker-target-prices.html)** in browser (Cursor markdown preview cannot render the wide 15-column table).")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("**As of:** $asOf  ")
[void]$sb.AppendLine("**Source:** Trendlyne research reports (latest target per broker)  ")
[void]$sb.AppendLine("**Horizon:** Typically ~12-month forward targets (broker convention)  ")
[void]$sb.AppendLine("**Coverage:** $okCount / $($tickers.Count) with target; $namedCount with named-broker columns  ")
[void]$sb.AppendLine("**Refresh:** `_fetch-broker-targets.ps1`  ")
[void]$sb.AppendLine("**Framework:** [BROKER-TARGET-FRAMEWORK.md](BROKER-TARGET-FRAMEWORK.md)")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("> **Use with discipline:** Street targets are secondary to PCCL, business quality, and personal pause buckets. Do not buy on target upside alone.")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("---")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("## Summary (preview-friendly)")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("| # | Stock | CMP | Avg target | Upside | Brokers | Notes |")
[void]$sb.AppendLine("|--:|-------|----:|-----------:|-------:|--------:|-------|")

$n = 0
foreach ($r in $rows) {
    $n++
    $notes = Get-RowNotes -r $r
    $up = if ($null -ne $r.Upside) { "$($r.Upside)%" } else { '-' }
    $line = "| $n | **$($r.Ticker)** $($r.Company) | $(Format-Price $r.Cmp) | **$(Format-Price $r.Avg)** | $up | $($r.BrokerCount) | $notes |"
    [void]$sb.AppendLine($line)
}

[void]$sb.AppendLine("")
[void]$sb.AppendLine("---")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("## Legend")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("- **Avg** = mean of populated broker columns (ICICI through Other). If none, Trendlyne consensus.")
[void]$sb.AppendLine("- **Other** = latest target from a broker outside the named columns (Geojit, Axis, Emkay, Sharekhan, etc.).")
[void]$sb.AppendLine("- **-** = no recent target from that broker.")
[void]$sb.AppendLine("- **TATAMOTORS** row uses NSE **TMCV** (commercial vehicles entity post-demerger).")
[void]$sb.AppendLine("- **Per-broker columns:** require JS-rendered Trendlyne page; use agent refresh for full broker breakdown.")
[void]$sb.AppendLine("- **KWIL** / thin names may lack coverage until brokers initiate.")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("## Top upside (Avg vs CMP, coverage >= 2 brokers)")
[void]$sb.AppendLine("")

$topUp = $rows | Where-Object { $_.BrokerCount -ge 2 -and $null -ne $_.Upside } | Sort-Object Upside -Descending | Select-Object -First 10
foreach ($t in $topUp) {
    [void]$sb.AppendLine("- **$($t.Ticker)** +$($t.Upside)% (Avg $(Format-Price $t.Avg) vs CMP $(Format-Price $t.Cmp), $($t.BrokerCount) brokers)")
}

[void]$sb.AppendLine("")
[void]$sb.AppendLine("## Below CMP (negative upside on avg target)")
[void]$sb.AppendLine("")
$topDn = $rows | Where-Object { $null -ne $_.Upside -and $_.Upside -lt 0 } | Sort-Object Upside | Select-Object -First 8
foreach ($t in $topDn) {
    [void]$sb.AppendLine("- **$($t.Ticker)** $($t.Upside)% (Avg $(Format-Price $t.Avg) vs CMP $(Format-Price $t.Cmp))")
}

# HTML companion (horizontal scroll - full broker columns)
$htmlIdx = 0
$htmlRows = ($rows | ForEach-Object {
    $htmlIdx++
    $r = $_
    $notes = (Get-RowNotes -r $r) -replace '&', '&amp;' -replace '<', '&lt;' -replace '>', '&gt;'
    $upCls = Get-UpsideClass -upside $r.Upside
    $upTxt = if ($null -ne $r.Upside) { "$($r.Upside)%" } else { '-' }
    $cells = @('ICICI','Morgan','Kotak','HDFC','Jefferies','HSBC','Motilal','Other') | ForEach-Object {
        $v = Format-Price $r.$_
        if ($v -ne '-') { "<td class=`"num`">$v</td>" }
        else { '<td class="num muted">-</td>' }
    }
    $avg = Format-Price $r.Avg
    @"
<tr>
<td class="num">$htmlIdx</td>
<td><strong>$($r.Ticker)</strong><br><span class="sub">$($r.Company)</span></td>
<td class="num">$(Format-Price $r.Cmp)</td>
$($cells -join "`n")
<td class="num"><strong>$avg</strong></td>
<td class="num $upCls">$upTxt</td>
<td class="num">$($r.BrokerCount)</td>
<td class="notes">$notes</td>
</tr>
"@
}) -join "`n"

$htmlTop = ($topUp | Select-Object -First 5 | ForEach-Object {
    "<li><strong>$($_.Ticker)</strong> +$($_.Upside)% (Avg $(Format-Price $_.Avg) vs CMP $(Format-Price $_.Cmp), $($_.BrokerCount) brokers)</li>"
}) -join "`n"

$htmlDn = ($topDn | ForEach-Object {
    "<li><strong>$($_.Ticker)</strong> $($_.Upside)% (Avg $(Format-Price $_.Avg) vs CMP $(Format-Price $_.Cmp))</li>"
}) -join "`n"

$html = @"
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Broker Target Prices</title>
<style>
body{font-family:Segoe UI,sans-serif;margin:0;padding:1.5rem;line-height:1.5;background:#f8fafc;color:#1e293b}
.wrap{max-width:1400px;margin:0 auto}
.header{background:#0f766e;color:#fff;padding:1.25rem 1.5rem;border-radius:8px;margin-bottom:1rem}
.header h1{margin:0 0 .5rem;font-size:1.35rem}
.header p{margin:.25rem 0;opacity:.95;font-size:.95rem}
.scroll{overflow-x:auto;border:1px solid #e2e8f0;border-radius:8px;background:#fff;margin:1rem 0;box-shadow:0 1px 3px rgba(0,0,0,.06)}
table{border-collapse:collapse;font-size:.82rem;min-width:1100px;width:100%}
th,td{border:1px solid #e2e8f0;padding:6px 8px;vertical-align:top}
th{background:#f1f5f9;text-align:left;white-space:nowrap;position:sticky;top:0;z-index:1}
.num{text-align:right;white-space:nowrap}
.muted{color:#94a3b8}
.sub{font-size:.75rem;color:#64748b;font-weight:400}
.pos{color:#15803d;font-weight:600}.neg{color:#b91c1c;font-weight:600}
.notes{font-size:.78rem;max-width:140px}
h2{margin-top:1.75rem;font-size:1.1rem;color:#334155}
ul{margin:.5rem 0;padding-left:1.25rem}
.footer{color:#64748b;font-size:.85rem;margin-top:1.5rem}
</style></head><body>
<div class="wrap">
<div class="header">
<h1>Broker Target Prices (Portfolio)</h1>
<p>As of $asOf | $okCount / $($tickers.Count) with target | ~12-month broker horizon</p>
<p>Source: Trendlyne research reports. Avg = mean of named broker columns, else consensus.</p>
</div>
<div class="scroll">
<table>
<tr>
<th>#</th><th>Stock</th><th>CMP</th>
<th>ICICI Sec</th><th>Morgan</th><th>Kotak</th><th>HDFC Sec</th>
<th>Jefferies</th><th>HSBC</th><th>Motilal</th><th>Other</th>
<th>Avg</th><th>Upside</th><th>Brokers</th><th>Notes</th>
</tr>
$htmlRows
</table>
</div>
<h2>Top upside (2+ brokers)</h2>
<ul>$htmlTop</ul>
<h2>Below CMP</h2>
<ul>$htmlDn</ul>
<p class="footer">Refresh: .cursor/portfolio/_fetch-broker-targets.ps1 | Markdown summary: broker-target-prices.md</p>
</div></body></html>
"@

$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($outPath, $sb.ToString(), $utf8)
[System.IO.File]::WriteAllText($htmlPath, $html, $utf8)
Write-Host "Wrote $outPath ($okCount/$($tickers.Count) with targets)"
Write-Host "Wrote $htmlPath (open in browser)"
