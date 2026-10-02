# Generate CAGR_[TICKER].md for all holdings in portfolio.
# Usage: .\StockBook\_generate-all-cagr.ps1 [-SkipFetch] [-CmpDate '2026-08-28']

param(
    [switch]$SkipFetch,
    [string]$BuyDate = '2025-04-01',
    [string]$CmpDate = (Get-Date -Format 'yyyy-MM-dd')
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$reportRoot = Join-Path $root 'Report'
$calcScript = Join-Path $PSScriptRoot '_calc-cagr.ps1'

# Ticker, Company, Qty, AvgCost, CostBasis, RelativeFolder under StockBook/
$holdings = @(
    @{ T='ASHOKLEY'; N='Ashok Leyland'; Q=100; A=40.21; C=4021; F='Auto\Ashok Leyland' }
    @{ T='BAJAJFINSV'; N='Bajaj Finserv'; Q=60; A=1699.73; C=101984; F='Banking and Finance\Bajaj Finserv' }
    @{ T='BALKRISIND'; N='Balkrishna Industries'; Q=21; A=1971.63; C=41404; F='Auto\Balkrishna Industries' }
    @{ T='BANKINDIA'; N='Bank of India'; Q=1105; A=78.37; C=86599; F='Banking and Finance\Bank of India' }
    @{ T='BHARTIARTL'; N='Bharti Airtel'; Q=415; A=1212.26; C=503089; F='Telecom\Bharti Airtel' }
    @{ T='CIPLA'; N='Cipla'; Q=25; A=1220.26; C=30507; F='Pharma\Cipla' }
    @{ T='DELTACORP'; N='Delta Corp'; Q=1560; A=132.50; C=206700; F='Hotels and Leisure\Delta Corp' }
    @{ T='EICHERMOT'; N='Eicher Motors'; Q=3; A=2668.88; C=8007; F='Auto\Eicher Motors' }
    @{ T='FORTIS'; N='Fortis Healthcare'; Q=1200; A=332.07; C=398484; F='Healthcare\Fortis Healthcare' }
    @{ T='GICRE'; N='General Insurance Corporation'; Q=215; A=183.31; C=39412; F='Banking and Finance\General Insurance Corporation' }
    @{ T='GLENMARK'; N='Glenmark Pharma'; Q=5; A=196.67; C=983; F='Pharma\Glenmark Pharma' }
    @{ T='HAVELLS'; N='Havells India'; Q=65; A=1049.42; C=68212; F='Consumer\Havells India' }
    @{ T='HCLTECH'; N='HCL Technologies'; Q=360; A=1212.09; C=436352; F='IT\HCL Technologies' }
    @{ T='HDFCAMC'; N='HDFC Asset Management'; Q=237; A=1500.98; C=355732; F='Banking and Finance\HDFC Asset Management' }
    @{ T='HDFCBANK'; N='HDFC Bank'; Q=1125; A=775.31; C=872224; F='Banking and Finance\HDFC Bank' }
    @{ T='HDFCLIFE'; N='HDFC Life Insurance'; Q=650; A=619.19; C=402474; F='Banking and Finance\HDFC Life Insurance' }
    @{ T='HEG'; N='HEG'; Q=100; A=157.22; C=15722; F='Infrastructure\HEG' }
    @{ T='HEROMOTOCO'; N='Hero MotoCorp'; Q=30; A=3117.37; C=93521; F='Auto\Hero MotoCorp' }
    @{ T='HINDUNILVR'; N='Hindustan Unilever'; Q=250; A=2422.40; C=605600; F='FMCG\Hindustan Unilever' }
    @{ T='ICICIBANK'; N='ICICI Bank'; Q=143; A=888.26; C=127021; F='Banking and Finance\ICICI Bank' }
    @{ T='IGL'; N='Indraprastha Gas'; Q=2050; A=212.49; C=435605; F='Oil and Gas\Indraprastha Gas' }
    @{ T='INDHOTEL'; N='Indian Hotels'; Q=400; A=94.61; C=37844; F='Hotels and Leisure\Indian Hotels' }
    @{ T='INFY'; N='Infosys'; Q=435; A=1480.69; C=644100; F='IT\Infosys' }
    @{ T='IOC'; N='Indian Oil Corporation'; Q=1003; A=66.66; C=66860; F='Oil and Gas\Indian Oil Corporation' }
    @{ T='ITC'; N='ITC'; Q=3000; A=357.94; C=1073820; F='FMCG\ITC' }
    @{ T='ITCHOTELS'; N='ITC Hotels'; Q=1185; A=223.38; C=264705; F='Hotels and Leisure\ITC Hotels' }
    @{ T='KOTAKBANK'; N='Kotak Mahindra Bank'; Q=1250; A=351.28; C=439100; F='Banking and Finance\Kotak Mahindra Bank' }
    @{ T='KWIL'; N='Kwality Walls India'; Q=250; A=46.27; C=11568; F='FMCG\Kwality Walls India' }
    @{ T='LT'; N='Larsen and Toubro'; Q=175; A=2304.03; C=403205; F='Infrastructure\Larsen and Toubro' }
    @{ T='LUPIN'; N='Lupin'; Q=32; A=775.12; C=24804; F='Pharma\Lupin' }
    @{ T='MARUTI'; N='Maruti Suzuki'; Q=57; A=11155.83; C=635882; F='Auto\Maruti Suzuki' }
    @{ T='MAXHEALTH'; N='Max Healthcare'; Q=2000; A=655.84; C=1311680; F='Healthcare\Max Healthcare' }
    @{ T='MEDANTA'; N='Global Health (Medanta)'; Q=212; A=1061.62; C=225063; F='Healthcare\Medanta' }
    @{ T='MOTHERSON'; N='Samvardhana Motherson'; Q=1000; A=65.27; C=65270; F='Auto\Samvardhana Motherson' }
    @{ T='MUTHOOTFIN'; N='Muthoot Finance'; Q=125; A=1289.74; C=161218; F='Banking and Finance\Muthoot Finance' }
    @{ T='ONGC'; N='Oil and Natural Gas Corp'; Q=400; A=86.48; C=34592; F='Oil and Gas\Oil and Natural Gas Corp' }
    @{ T='PNB'; N='Punjab National Bank'; Q=1563; A=48.69; C=76102; F='Banking and Finance\PNB' }
    @{ T='RAAJINFRA'; N='Raajmarg Infra Investment'; Q=100; A=110.46; C=11046; F='Infrastructure\Raajmarg Infra Investment'; Y='RIIT.BO' }
    @{ T='SBIN'; N='State Bank of India'; Q=400; A=192.10; C=76840; F='Banking and Finance\State Bank of India' }
    @{ T='SUNPHARMA'; N='Sun Pharmaceutical'; Q=180; A=532.74; C=95893; F='Pharma\Sun Pharmaceutical' }
    @{ T='TATACONSUM'; N='Tata Consumer Products'; Q=602; A=783.96; C=471942; F='FMCG\Tata Consumer Products' }
    @{ T='TATAMOTORS'; N='Tata Motors (CV)'; Q=830; A=146.84; C=121877; F='Auto\Tata Motors CV'; Y='TMCV.NS' }
    @{ T='TCS'; N='Tata Consultancy Services'; Q=299; A=3303.50; C=987747; F='IT\Tata Consultancy Services' }
    @{ T='TECHM'; N='Tech Mahindra'; Q=27; A=860.61; C=23236; F='IT\Tech Mahindra' }
    @{ T='TMPV'; N='Tata Motors Passenger Vehicles'; Q=820; A=461.24; C=378217; F='Auto\TMPV' }
    @{ T='UBL'; N='United Breweries'; Q=10; A=1041.30; C=10413; F='Consumer\United Breweries' }
    @{ T='UJJIVANSFB'; N='Ujjivan Small Finance Bank'; Q=3115; A=46.57; C=145066; F='Banking and Finance\Ujjivan Small Finance Bank' }
    @{ T='WIPRO'; N='Wipro'; Q=200; A=267.83; C=53566; F='IT\Wipro' }
    @{ T='WONDERLA'; N='Wonderla Holidays'; Q=50; A=170.75; C=8538; F='Hotels and Leisure\Wonderla Holidays' }
    # DRREDDY: manual CAGR_DRREDDY.md only (confirmed lots) - do not batch-overwrite
)

function Get-NseCmp {
    param([string]$Ticker)
    $url = "https://query1.finance.yahoo.com/v8/finance/chart/${Ticker}?interval=1d&range=1d"
    $j = Invoke-RestMethod -Uri $url -Headers @{ 'User-Agent' = 'Mozilla/5.0' } -TimeoutSec 25
    $meta = $j.chart.result[0].meta
    return [pscustomobject]@{
        Price = [double]$meta.regularMarketPrice
        Time  = [DateTimeOffset]::FromUnixTimeSeconds([int64]$meta.regularMarketTime).ToOffset([TimeSpan]::FromHours(5.5)).DateTime.ToString('yyyy-MM-dd')
    }
}

function Format-IndianNumber {
    param([double]$n)
    if ($n -ge 1000) { return ('{0:N0}' -f $n) -replace ',', ',' }
    if ($n -ge 100) { return ('{0:F2}' -f $n) }
    return ('{0:F2}' -f $n)
}

$created = 0
$failed = @()

foreach ($h in $holdings) {
    $dir = Join-Path $reportRoot $h.F
    if (-not (Test-Path $dir)) {
        $failed += "$($h.T): folder missing $dir"
        continue
    }

    $cmp = $null
    $cmpSource = 'Yahoo Finance NSE (.NS) - proxy for NSE last price'
    $cmpQuoteDate = $CmpDate

    if (-not $SkipFetch) {
        try {
            Start-Sleep -Milliseconds 250
            $yahooSym = if ($h.Y) {
                if ($h.Y -match '\.') { $h.Y } else { "$($h.Y).NS" }
            } else { "$($h.T).NS" }
            $q = Get-NseCmp -Ticker $yahooSym
            $cmp = $q.Price
            if ($q.Time) { $cmpQuoteDate = $q.Time.Substring(0, 10) }
            if ($h.Y -like '*.BO') { $cmpSource = "Yahoo Finance BSE ($yahooSym) - NSE symbol RIIT; proxy for last price" }
            elseif ($h.Y) { $cmpSource = "Yahoo Finance NSE ($yahooSym) - NSE listing; proxy for last price" }
        } catch {
            $failed += "$($h.T): fetch failed - $($_.Exception.Message)"
            continue
        }
    } else {
        $failed += "$($h.T): SkipFetch - no CMP"
        continue
    }

    $metrics = & $calcScript -BuyPrice $h.A -BuyDate $BuyDate -Cmp $cmp -CmpDate $cmpQuoteDate
    $mv = [math]::Round($h.Q * $cmp, 0)
    $sign = if ($metrics.SimplePct -ge 0) { '+' } else { '' }

    $content = @"
# $($h.N) - Holding CAGR

**Ticker:** $($h.T) (NSE)  
**CMP:** **Rs $(Format-IndianNumber $cmp)** | **CMP date:** $cmpQuoteDate | **Source:** $cmpSource  
**Last calculated:** $(Get-Date -Format 'yyyy-MM-dd')

Cross-ref: ``CAGR-FRAMEWORK.md`` | ``.cursor/portfolio/holdings.md`` | ``summary-analysis.md``

---

## Lots (live)

| Lot | Qty | Buy date | Buy price (Rs) | Days held | CMP (Rs) | Simple return % | CAGR % | Notes |
|-----|-----|----------|---------------|----------:|--------:|----------------:|-------:|-------|
| **L1** | $($h.Q.ToString('N0')) | **$BuyDate** | **$($h.A.ToString('N2'))** | $($metrics.DaysHeld) | $(Format-IndianNumber $cmp) | **$sign$($metrics.SimplePct.ToString('F2'))%** | **$($metrics.CAGRPct.ToString('F2'))%** | LEGACY - assumed purchase date until user supplies actual lots |

*Holding period: $($metrics.DaysHeld) days = $($metrics.YearsHeld.ToString('F2')) years (buy date to CMP date).*

---

## Portfolio summary (this ticker)

| Metric | Value |
|--------|------:|
| Total qty | $($h.Q.ToString('N0')) |
| Total cost (Rs) | $($h.C.ToString('N0')) |
| Market value @ CMP (Rs) | $($mv.ToString('N0')) |
| Blended simple return % | **$sign$($metrics.SimplePct.ToString('F2'))%** |
| Cost-weighted CAGR % | **$($metrics.CAGRPct.ToString('F2'))%** |

---

## When user adds real purchase history

Replace L1 with dated lots. Archive synthetic L1 when superseded.

---

## Change log

| Date | Change |
|------|--------|
| $(Get-Date -Format 'yyyy-MM-dd') | Batch generated - legacy lot $BuyDate - CMP Rs $(Format-IndianNumber $cmp) ($cmpQuoteDate) |

"@

    $outPath = Join-Path $dir "CAGR_$($h.T).md"
    $utf8 = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($outPath, $content, $utf8)
    $created++
    Write-Output "OK $($h.T) CMP=$cmp CAGR=$($metrics.CAGRPct)%"
}

Write-Output "---"
Write-Output "Created/updated: $created files"
if ($failed.Count) {
    Write-Output "Failed:"
    $failed | ForEach-Object { Write-Output "  $_" }
}

# Rebuild portfolio dashboard
$portfolioScript = Join-Path $PSScriptRoot '_generate-portfolio-cagr.ps1'
if (Test-Path $portfolioScript) {
    & $portfolioScript
}
