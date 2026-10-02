# Fetch Trendlyne research-reports pages -> StockBook/_broker-fetch/[TICKER].md
# Skips non-empty existing files. Output format matches WebFetch markdown for _generate-all-broker-targets.ps1

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
$fetchDir = Join-Path $PSScriptRoot '_broker-fetch'
$asOf = Get-Date -Format 'yyyy-MM-dd'

if (-not (Test-Path $fetchDir)) { New-Item -ItemType Directory -Path $fetchDir -Force | Out-Null }

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
    TATAMOTORS = @{ Id = 3327757;  Slug = 'tata-motors-ltd' }
}

function Convert-HtmlToFetchMarkdown {
    param([string]$Html, [string]$Ticker, [string]$Url)

    $consensus = ''
    if ($Html -match '(?s)(<h3[^>]*>.*?</h3>\s*)?([^<]+has an average share price target[^<]+|Latest broker research reports[^<]+)') {
        $consensus = ($matches[2] -replace '\s+', ' ').Trim()
    }
    if (-not $consensus -and $Html -match 'average share price target of\s+([\d,]+(?:\.\d+)?)[^<]*upside of\s+([\d.]+)%[^<]*last price of\s+([\d,]+(?:\.\d+)?)') {
        $consensus = "has an average share price target of $($matches[1]). The consensus estimate represents an upside of $($matches[2])% from the last price of $($matches[3])."
    }

    $rows = @()
    $rowRx = '<tr[^>]*>\s*<td[^>]*>\s*</td>\s*<td[^>]*>([^<]+)</td>\s*<td[^>]*>([^<]+)</td>\s*<td[^>]*>([^<]+)</td>\s*<td[^>]*>([^<]+)</td>\s*<td[^>]*>([^<]+)</td>'
    foreach ($m in [regex]::Matches($Html, $rowRx)) {
        $date = $m.Groups[1].Value.Trim()
        $stock = $m.Groups[2].Value.Trim()
        $author = $m.Groups[3].Value.Trim()
        $ltp = $m.Groups[4].Value.Trim()
        $target = $m.Groups[5].Value.Trim()
        if ($date -notmatch '\d{1,2}\s+\w{3}\s+\d{4}') { continue }
        $rows += "| | $date | $stock | $author | $ltp | $target | | | | |"
    }

    # Fallback: pipe-delimited rows in page source
    if ($rows.Count -eq 0) {
        $pipeRx = '\|\s*(?:\|\s*)?(\d{1,2}\s+\w{3}\s+\d{4})\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([\d,.]+)\s*\|\s*([\d,.]+)\s*\|'
        foreach ($m in [regex]::Matches($Html, $pipeRx)) {
            $rows += "| | $($m.Groups[1].Value.Trim()) | $($m.Groups[2].Value.Trim()) | $($m.Groups[3].Value.Trim()) | $($m.Groups[4].Value.Trim()) | $($m.Groups[5].Value.Trim()) | | | | |"
        }
    }

    $sb = @"
# Content from $Url

# Trendlyne fetch — $Ticker — $asOf

$consensus

| Summary | Date | Stock | Author | LTP | Target | Price at reco(Change since reco%) | Upside(%) | Type | Report | Discuss |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
$($rows -join "`n")
"@
    return $sb
}

$saved = 0
$skipped = 0
$failed = @()

foreach ($kv in $trendlyneMap.GetEnumerator() | Sort-Object Name) {
    $ticker = $kv.Key
    $meta = $kv.Value
    $outFile = Join-Path $fetchDir "$ticker.md"

    if ((Test-Path $outFile) -and ((Get-Item $outFile).Length -gt 50)) {
        $skipped++
        continue
    }

    $url = "https://trendlyne.com/research-reports/stock/$($meta.Id)/$ticker/$($meta.Slug)/"
    $html = $null
    for ($attempt = 1; $attempt -le 3; $attempt++) {
        try {
            $html = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 45 -Headers @{
                'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                'Accept' = 'text/html,application/xhtml+xml'
            }).Content
            break
        } catch {
            if ($attempt -eq 3) {
                $failed += $ticker
                Write-Warning "FAIL $ticker : $($_.Exception.Message)"
            } else {
                Start-Sleep -Seconds 2
            }
        }
    }

    if (-not $html) { continue }

    $md = Convert-HtmlToFetchMarkdown -Html $html -Ticker $ticker -Url $url
    $utf8 = New-Object System.Text.UTF8Encoding $false
    [IO.File]::WriteAllText($outFile, $md, $utf8)
    $saved++
    Write-Host "Saved $ticker ($($md.Length) bytes)"
    Start-Sleep -Milliseconds 400
}

Write-Host "`nSummary: saved=$saved skipped=$skipped failed=$($failed.Count)"
if ($failed.Count) { Write-Host "Failed: $($failed -join ', ')" }
