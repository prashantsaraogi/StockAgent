# Generate PARAMETERS_[TICKER].md for all holdings (avg-first layout).
# Usage: .\StockBook\_generate-all-parameters.ps1 [-SkipFetch] [-Force] [-SkipDetailed]
#   -SkipDetailed : skip HDFCBANK (hand-built full file)
#   -Force        : overwrite all including HDFCBANK

param(
    [switch]$SkipFetch,
    [switch]$Force,
    [switch]$SkipDetailed
)

$ErrorActionPreference = 'Stop'
$reportRoot = $PSScriptRoot
$analysisDate = Get-Date -Format 'yyyy-MM-dd'

# T, N, F=folder, Type=bank|nbfc|insurance|omc|default, FairPE, Cmp, PeTTM, Pe10Y
# Cmp/Pe from upward/downward P/E analysis 25 Aug 2026 + DRREDDY 28 Aug 2026
$holdings = @(
    @{ T='ASHOKLEY'; N='Ashok Leyland'; F='Auto\Ashok Leyland'; Type='default'; FairPE=18; Cmp=173; PeTTM=27; Pe10Y=18 }
    @{ T='BAJAJFINSV'; N='Bajaj Finserv'; F='Banking and Finance\Bajaj Finserv'; Type='nbfc'; FairPE=20; Cmp=2033; PeTTM=16; Pe10Y=35 }
    @{ T='BALKRISIND'; N='Balkrishna Industries'; F='Auto\Balkrishna Industries'; Type='default'; FairPE=24; Cmp=2351; PeTTM=26.5; Pe10Y=24 }
    @{ T='BANKINDIA'; N='Bank of India'; F='Banking and Finance\Bank of India'; Type='bank'; FairPE=12; Cmp=143; PeTTM=16; Pe10Y=11 }
    @{ T='BHARTIARTL'; N='Bharti Airtel'; F='Telecom\Bharti Airtel'; Type='default'; FairPE=30; Cmp=1942; PeTTM=38.6; Pe10Y=36; Detailed=$true; EpsCagr5Y=0.15 }
    @{ T='CIPLA'; N='Cipla'; F='Pharma\Cipla'; Type='default'; FairPE=20; Cmp=1432; PeTTM=31.9; Pe10Y=28 }
    @{ T='DELTACORP'; N='Delta Corp'; F='Hotels and Leisure\Delta Corp'; Type='default'; FairPE=18; Cmp=60; PeTTM=10.7; Pe10Y=20 }
    @{ T='EICHERMOT'; N='Eicher Motors'; F='Auto\Eicher Motors'; Type='default'; FairPE=25; Cmp=8057; PeTTM=37.7; Pe10Y=25 }
    @{ T='FORTIS'; N='Fortis Healthcare'; F='Healthcare\Fortis Healthcare'; Type='default'; FairPE=35; Cmp=917; PeTTM=63.8; Pe10Y=40 }
    @{ T='GICRE'; N='General Insurance Corporation'; F='Banking and Finance\General Insurance Corporation'; Type='insurance'; FairPE=14; Cmp=138; PeTTM=15.5; Pe10Y=14 }
    @{ T='GLENMARK'; N='Glenmark Pharma'; F='Pharma\Glenmark Pharma'; Type='default'; FairPE=20; Cmp=2150; PeTTM=27; Pe10Y=25 }
    @{ T='HAVELLS'; N='Havells India'; F='Consumer\Havells India'; Type='default'; FairPE=40; Cmp=1480; PeTTM=38.5; Pe10Y=48 }
    @{ T='HCLTECH'; N='HCL Technologies'; F='IT\HCL Technologies'; Type='default'; FairPE=20; Cmp=1303; PeTTM=19.5; Pe10Y=22 }
    @{ T='HDFCAMC'; N='HDFC Asset Management'; F='Banking and Finance\HDFC Asset Management'; Type='default'; FairPE=35; Cmp=2525; PeTTM=38.3; Pe10Y=42; Detailed=$true; EpsCagr5Y=0.13 }
    @{ T='HDFCBANK'; N='HDFC Bank'; F='Banking and Finance\HDFC Bank'; Type='bank'; FairPE=15; Cmp=727; PeTTM=14.2; Pe10Y=22; Detailed=$true; EpsCagr5Y=0.12 }
    @{ T='HINDUNILVR'; N='Hindustan Unilever'; F='FMCG\Hindustan Unilever'; Type='default'; FairPE=45; Cmp=2040; PeTTM=43.1; Pe10Y=55; Detailed=$true; EpsCagr5Y=0.07 }
    @{ T='HDFCLIFE'; N='HDFC Life Insurance'; F='Banking and Finance\HDFC Life Insurance'; Type='insurance'; FairPE=30; Cmp=555; PeTTM=72; Pe10Y=42 }
    @{ T='HEG'; N='HEG'; F='Infrastructure\HEG'; Type='default'; FairPE=14; Cmp=711; PeTTM=39.2; Pe10Y=14 }
    @{ T='HEROMOTOCO'; N='Hero MotoCorp'; F='Auto\Hero MotoCorp'; Type='default'; FairPE=22; Cmp=5735; PeTTM=20.2; Pe10Y=22; Detailed=$true; EpsCagr5Y=0.12 }
    @{ T='ICICIBANK'; N='ICICI Bank'; F='Banking and Finance\ICICI Bank'; Type='bank'; FairPE=15; Cmp=1420; PeTTM=18.2; Pe10Y=20 }
    @{ T='IGL'; N='Indraprastha Gas'; F='Oil and Gas\Indraprastha Gas'; Type='omc'; FairPE=18; Cmp=151; PeTTM=14; Pe10Y=24 }
    @{ T='INDHOTEL'; N='Indian Hotels'; F='Hotels and Leisure\Indian Hotels'; Type='default'; FairPE=32; Cmp=736; PeTTM=53.2; Pe10Y=32 }
    @{ T='INFY'; N='Infosys'; F='IT\Infosys'; Type='default'; FairPE=20; Cmp=1121; PeTTM=14.7; Pe10Y=23 }
    @{ T='IOC'; N='Indian Oil Corporation'; F='Oil and Gas\Indian Oil Corporation'; Type='omc'; FairPE=10; Cmp=136; PeTTM=5.8; Pe10Y=10 }
    @{ T='ITC'; N='ITC'; F='FMCG\ITC'; Type='default'; FairPE=22; Cmp=269; PeTTM=17; Pe10Y=26 }
    @{ T='ITCHOTELS'; N='ITC Hotels'; F='Hotels and Leisure\ITC Hotels'; Type='default'; FairPE=32; Cmp=220; PeTTM=34; Pe10Y=35 }
    @{ T='KOTAKBANK'; N='Kotak Mahindra Bank'; F='Banking and Finance\Kotak Mahindra Bank'; Type='bank'; FairPE=15; Cmp=403; PeTTM=19.9; Pe10Y=28 }
    @{ T='KWIL'; N='Kwality Walls India'; F='FMCG\Kwality Walls India'; Type='default'; FairPE=40; Cmp=46; PeTTM=46; Pe10Y=46 }
    @{ T='LT'; N='Larsen and Toubro'; F='Infrastructure\Larsen and Toubro'; Type='default'; FairPE=28; Cmp=4093; PeTTM=31.9; Pe10Y=29; Detailed=$true; EpsCagr5Y=0.14 }
    @{ T='LUPIN'; N='Lupin'; F='Pharma\Lupin'; Type='default'; FairPE=20; Cmp=2100; PeTTM=16.6; Pe10Y=22 }
    @{ T='MARUTI'; N='Maruti Suzuki'; F='Auto\Maruti Suzuki'; Type='default'; FairPE=28; Cmp=13565; PeTTM=29.6; Pe10Y=28; Detailed=$true; EpsCagr5Y=0.11 }
    @{ T='MAXHEALTH'; N='Max Healthcare'; F='Healthcare\Max Healthcare'; Type='default'; FairPE=40; Cmp=1000; PeTTM=64.5; Pe10Y=45; Detailed=$true; EpsCagr5Y=0.18 }
    @{ T='MEDANTA'; N='Global Health (Medanta)'; F='Healthcare\Medanta'; Type='default'; FairPE=35; Cmp=1200; PeTTM=39.5; Pe10Y=38 }
    @{ T='MOTHERSON'; N='Samvardhana Motherson'; F='Auto\Samvardhana Motherson'; Type='default'; FairPE=20; Cmp=155; PeTTM=38.4; Pe10Y=20 }
    @{ T='MUTHOOTFIN'; N='Muthoot Finance'; F='Banking and Finance\Muthoot Finance'; Type='nbfc'; FairPE=12; Cmp=2972; PeTTM=11.2; Pe10Y=18 }
    @{ T='ONGC'; N='Oil and Natural Gas Corp'; F='Oil and Gas\Oil and Natural Gas Corp'; Type='omc'; FairPE=9; Cmp=236; PeTTM=6.8; Pe10Y=9 }
    @{ T='PNB'; N='Punjab National Bank'; F='Banking and Finance\PNB'; Type='bank'; FairPE=12; Cmp=118; PeTTM=6; Pe10Y=12 }
    @{ T='RAAJINFRA'; N='Raajmarg Infra Investment'; F='Infrastructure\Raajmarg Infra Investment'; Type='default'; FairPE=15; Cmp=105; PeTTM=30.5; Pe10Y=15 }
    @{ T='SBIN'; N='State Bank of India'; F='Banking and Finance\State Bank of India'; Type='bank'; FairPE=14; Cmp=1050; PeTTM=11.4; Pe10Y=14 }
    @{ T='SUNPHARMA'; N='Sun Pharmaceutical'; F='Pharma\Sun Pharmaceutical'; Type='default'; FairPE=25; Cmp=698; PeTTM=27; Pe10Y=30 }
    @{ T='TATACONSUM'; N='Tata Consumer Products'; F='FMCG\Tata Consumer Products'; Type='default'; FairPE=50; Cmp=1150; PeTTM=49.5; Pe10Y=58; Detailed=$true; EpsCagr5Y=0.13 }
    @{ T='TATAMOTORS'; N='Tata Motors (CV)'; F='Auto\Tata Motors CV'; Type='default'; FairPE=14; Cmp=487; PeTTM=23.6; Pe10Y=14 }
    @{ T='TCS'; N='Tata Consultancy Services'; F='IT\Tata Consultancy Services'; Type='default'; FairPE=22; Cmp=2302; PeTTM=15.3; Pe10Y=24 }
    @{ T='TECHM'; N='Tech Mahindra'; F='IT\Tech Mahindra'; Type='default'; FairPE=18; Cmp=576; PeTTM=24; Pe10Y=18 }
    @{ T='TMPV'; N='Tata Motors Passenger Vehicles'; F='Auto\TMPV'; Type='default'; FairPE=16; Cmp=318; PeTTM=26; Pe10Y=16 }
    @{ T='UBL'; N='United Breweries'; F='Consumer\United Breweries'; Type='default'; FairPE=38; Cmp=1900; PeTTM=38.5; Pe10Y=40 }
    @{ T='UJJIVANSFB'; N='Ujjivan Small Finance Bank'; F='Banking and Finance\Ujjivan Small Finance Bank'; Type='bank'; FairPE=12; Cmp=74; PeTTM=16.5; Pe10Y=14 }
    @{ T='WIPRO'; N='Wipro'; F='IT\Wipro'; Type='default'; FairPE=18; Cmp=181; PeTTM=13.5; Pe10Y=20 }
    @{ T='WONDERLA'; N='Wonderla Holidays'; F='Hotels and Leisure\Wonderla Holidays'; Type='default'; FairPE=25; Cmp=720; PeTTM=35; Pe10Y=25 }
    @{ T='DRREDDY'; N="Dr. Reddy's Laboratories"; F='Pharma\Dr Reddys Laboratories'; Type='default'; FairPE=20; Cmp=1178; PeTTM=22; Pe10Y=25 }
)

function Round1($n) { [math]::Round($n, 1) }
function Round0($n) { [math]::Round($n, 0) }
function PctVsAvg($today, $avg) {
    if ($avg -eq 0) { return '-' }
    $p = ($today - $avg) / $avg * 100
    $sign = if ($p -gt 0) { '+' } else { '' }
    return "$sign$([math]::Round($p, 0))%"
}
function PeRead($pe, $avg) {
    $ratio = $pe / $avg
    if ($ratio -lt 0.90) { return '**Cheap** vs 10Y' }
    if ($ratio -gt 1.10) { return '**Expensive** vs 10Y' }
    return '**Fair** vs 10Y'
}
function Oey($pe) { if ($pe -le 0) { return '-' }; return (Round1 (100 / $pe)) }

function Get-DefaultEpsCagr($h) {
    if ($h.EpsCagr5Y) { return [double]$h.EpsCagr5Y }
    switch ($h.Type) {
        'bank' { return 0.12 }
        'nbfc' { return 0.10 }
        'insurance' { return 0.12 }
        'omc' { return 0.05 }
        default {
            if ($h.F -match 'Healthcare|Pharma') { return 0.12 }
            if ($h.F -match 'FMCG') { return 0.07 }
            if ($h.F -match '^IT\\') { return 0.08 }
            return 0.10
        }
    }
}

function Get-ForwardBlockA($h, $cmp, $pe, $avg, $ivPe) {
    $eps = if ($pe -gt 0) { $cmp / $pe } else { 0 }
    $cagr = Get-DefaultEpsCagr $h
    $cagrPess = [math]::Round($cagr * 0.6, 2)
    $cagrOpt = [math]::Round($cagr * 1.4, 2)
    $fwdPe = [double]$ivPe
    $fwdPePess = [math]::Round($fwdPe * 0.85, 0)
    $fwdPeOpt = [math]::Round($fwdPe * 1.10, 0)
    $epsFY31 = [math]::Round($eps * [math]::Pow(1 + $cagr, 5), 1)
    $epsFY31P = [math]::Round($eps * [math]::Pow(1 + $cagrPess, 5), 1)
    $epsFY31O = [math]::Round($eps * [math]::Pow(1 + $cagrOpt, 5), 1)
    $fair5 = [math]::Round($epsFY31 * $fwdPe, 0)
    $fair5P = [math]::Round($epsFY31P * $fwdPePess, 0)
    $fair5O = [math]::Round($epsFY31O * $fwdPeOpt, 0)
    $cagr5 = if ($cmp -gt 0 -and $fair5 -gt 0) { [math]::Round(([math]::Pow($fair5 / $cmp, 0.2) - 1) * 100, 1) } else { 0 }
    $cagr5P = if ($cmp -gt 0 -and $fair5P -gt 0) { [math]::Round(([math]::Pow($fair5P / $cmp, 0.2) - 1) * 100, 1) } else { 0 }
    $cagr5O = if ($cmp -gt 0 -and $fair5O -gt 0) { [math]::Round(([math]::Pow($fair5O / $cmp, 0.2) - 1) * 100, 1) } else { 0 }
    $fwdOey = if ($cmp -gt 0) { Round1 ($eps / $cmp * 100) } else { '-' }
    $fwdPeNow = if ($eps -gt 0) { Round1 ($cmp / $eps) } else { '-' }
    $fwdIv = [math]::Round($eps * $fwdPe, 0)
    $premFwd = if ($fwdIv -gt 0) { PctVsAvg $cmp $fwdIv } else { '-' }
    $trap = if ($avg -gt $fwdPe * 1.15) { '**YES** - 10Y avg P/E > forward fair' } else { 'No' }
    $pctCagr = [math]::Round($cagr * 100, 0)
    $pctCagrP = [math]::Round($cagrPess * 100, 0)
    $pctCagrO = [math]::Round($cagrOpt * 100, 0)
    @"

# Part 2 - Forward vision (next 5 years)

**Horizon:** FY2027-FY2031 | **Base:** normalized EPS = TTM run-rate (average); EPS CAGR **${pctCagr}%**; forward fair P/E **${fwdPe}x** (sector table - may differ from 10Y avg **${avg}x**)

> Batch skeleton - override EPS/CAGR/fair P/E from ``detail-analysis.md`` after results. See ``PARAMETERS-FRAMEWORK.md`` Part 2.

## Assumptions

| Input | Pessimistic | **Base (average)** | Optimistic | Type |
|-------|------------:|-------------------:|-----------:|------|
| Normalized EPS (Year 0) | Rs $([math]::Round($eps * 0.97, 1)) | **Rs $([math]::Round($eps, 1))** | Rs $([math]::Round($eps * 1.03, 1)) | ASSUMPTION (= TTM proxy) |
| EPS CAGR (5Y) | ${pctCagrP}% | **${pctCagr}%** | ${pctCagrO}% | ASSUMPTION |
| Forward fair P/E | ${fwdPePess}x | **${fwdPe}x** | ${fwdPeOpt}x | ASSUMPTION |
| EPS FY31 | Rs $epsFY31P | **Rs $epsFY31** | Rs $epsFY31O | Calculated |
| 5Y fair price | Rs $fair5P | **Rs $fair5** | Rs $fair5O | Calculated |

## Forward @ CMP - Block A

| Parameter | Link to future price | **Base** | Pessimistic | Optimistic | **5Y fair (base)** | **Implied 5Y CAGR** | **Read** |
|-----------|---------------------|----------|-------------|------------|--------------------|---------------------|----------|
| Normalized EPS (Year 0) | Anchor | **Rs $([math]::Round($eps, 1))** | - | - | - | - | TTM proxy |
| Forward Owner Earnings Yield | Higher = cheaper | **${fwdOey}%** | - | - | - | - | At average EPS |
| Forward P/E | CMP / norm EPS | **${fwdPeNow}x** | - | - | - | - | vs forward fair ${fwdPe}x |
| Premium to forward IV | vs norm EPS x fair P/E | **$premFwd** | - | - | - | - | From base case |
| 5Y fair price (base) | EPS FY31 x fair P/E | - | Rs $fair5P | Rs $fair5O | **Rs $fair5** | **+${cagr5}%** | See implied CAGR |
| Implied 5Y price CAGR | CMP to base fair | - | +${cagr5P}% | +${cagr5O}% | - | **+${cagr5}%** | Compare to ~12% hurdle |
| **Historical multiple trap** | 10Y avg >> forward fair | - | - | - | - | - | $trap |

## Forward - Blocks B/C

| Block | Status |
|-------|--------|
| B - Quality trajectory | *Pending* - ROE/moat path from annual report |
| C - Safety trajectory | *Pending* - leverage/regulatory from annual report |

## Past-vs-forward snapshot

| Question | Part 1 (10Y) | Part 2 (5Y) |
|----------|--------------|-------------|
| Cheap vs expensive? | $(PeRead $pe $avg) | Implied 5Y CAGR **+${cagr5}%** (base) |
| History misleads? | Compare 10Y avg ${avg}x vs forward fair ${fwdPe}x | Trap flag: $trap |
"@
}

function Get-BlockB($h) {
    $hdr = '| Parameter | What it measures | Link to stock price | 10Y avg (normal) | 10Y avg (incl. COVID) | **Today @ CMP** | **vs normal avg** | **Read** |'
    $sep = '|-----------|------------------|---------------------|------------------|----------------------|-----------------|-------------------|----------|'
    switch ($h.Type) {
        'bank' {
            $rows = @(
                '| **ROE (DuPont result)** | Return on equity | Higher ROE supports higher P/B | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |',
                '| **ROA (DuPont engine)** | Profit / assets | Core earning power | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |',
                '| **Equity multiplier** | Assets / equity | Leverage amplifier | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |',
                '| **Buffett ROE gate (>=15%)** | Pass = compounder | P/B premium justified | *Pending* | *Pending* | **UNVERIFIED** | - | See annual report |'
            )
        }
        'nbfc' {
            $rows = @(
                '| **ROE** | Return on equity | Higher = better franchise | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |',
                '| **ROA** | PAT / assets | NBFC earning power | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |',
                '| **Buffett ROE gate (>=15%)** | Quality hurdle | Long-term premium | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |'
            )
        }
        'insurance' {
            $rows = @(
                '| **Embedded value / P/E** | Insurance valuation | P/E often distorted by EV | *Pending* | *Pending* | **UNVERIFIED** | - | Use EV lens |',
                '| **VNB margin** | New business quality | Drives long-term ROE | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |',
                '| **Buffett ROE gate** | Often N/A for insurers | Use solvency + VNB | *Pending* | *Pending* | **UNVERIFIED** | - | Sector-specific |'
            )
        }
        'omc' {
            $rows = @(
                '| **Normalized EPS cycle** | OMC earnings cyclical | P/E at trough = cycle low | *Pending* | *Pending* | **UNVERIFIED** | - | Use normalized EPS |',
                '| **ROE (cycle)** | Cyclical ROE | Low at cycle peak oil | *Pending* | *Pending* | **UNVERIFIED** | - | YoC overlay primary |',
                '| **Buffett ROE gate** | Often fails at cycle trough | Hold for dividend/YoC | *Pending* | *Pending* | **UNVERIFIED** | - | See YoC in Report |'
            )
        }
        default {
            $rows = @(
                '| **ROE** | Return on equity | Higher ROE supports higher P/E | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |',
                '| **DuPont margin / turnover** | ROE decomposition | Explains ROE quality | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |',
                '| **Buffett ROE gate (>=15%)** | Pass = compounder | Justifies premium | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |'
            )
        }
    }
    return (($hdr, $sep) + $rows) -join "`n"
}

function Get-BlockC($h) {
    $hdr = '| Parameter | What it measures | Link to stock price | 10Y avg (normal) | 10Y avg (incl. COVID) | **Today @ CMP** | **vs normal avg** | **Read** |'
    $sep = '|-----------|------------------|---------------------|------------------|----------------------|-----------------|-------------------|----------|'
    switch ($h.Type) {
        'bank' {
            $rows = @(
                '| **GNPA (%)** | Bad loans | Rising GNPA compresses P/B | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |',
                '| **CAR (%)** | Capital buffer | Higher = safer | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |',
                '| **Bank health (CAR/GNPA)** | Safety score | Higher = safer | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |',
                '| **Altman Z (bank-adapted)** | Distress proxy | Low Z = tail risk | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |'
            )
        }
        'nbfc' {
            $rows = @(
                '| **GNPA / stage-3** | Asset quality | Rising = de-rate | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |',
                '| **Altman Z (NBFC-adapted)** | Distress proxy | Sector-specific | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |'
            )
        }
        default {
            $rows = @(
                '| **Altman Z / Z-double-prime** | Distress score | Below 1.8 = watch (non-bank) | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |',
                '| **Net debt / EBITDA** | Leverage (if applicable) | High = risk | *Pending* | *Pending* | **UNVERIFIED** | - | Refresh from AR |'
            )
        }
    }
    return (($hdr, $sep) + $rows) -join "`n"
}

function Build-ParametersMd($h) {
    $pe = [double]$h.PeTTM
    $avg = [double]$h.Pe10Y
    $cmp = [double]$h.Cmp
    $oeyT = Oey $pe
    $oeyA = Oey $avg
    $peVs = PctVsAvg $pe $avg
    $peRead = PeRead $pe $avg
    $oeyVs = PctVsAvg ([double]$oeyT) ([double]$oeyA)
    $incCovid = Round1 ($avg * 0.98)  # placeholder — same as normal until full pull
    $ivPe = [double]$h.FairPE
    $eps = if ($pe -gt 0) { $cmp / $pe } else { 0 }
    $iv = Round0 ($eps * $ivPe)
    $premIv = if ($iv -gt 0) { PctVsAvg $cmp $iv } else { '-' }

    $blockB = Get-BlockB $h
    $blockC = Get-BlockC $h
    $verdict = PeRead $pe $avg

    @"
# $($h.N) - Stock Parameters

**Ticker:** $($h.T) | **CMP:** Rs $cmp ($analysisDate)
**Part 1:** FY2016-FY2025 (10Y rear-view) | **Part 2:** FY2027-FY2031 (5Y forward)

> **Batch-generated** - Part 1 from 10Y P/E; Part 2 skeleton from sector EPS CAGR + fair P/E. Deep-fill Blocks B/C + forward thesis from annual report. Hand-built: HDFCBANK, MAXHEALTH, HINDUNILVR.

---

## How to read this (30 seconds)

| Lens | Question |
|------|----------|
| **Part 1 - 10Y** | Cheap or expensive vs **own history**? |
| **Part 2 - 5Y forward** | At CMP, if **average** earnings grow, is 5Y return OK? |
| **Rule** | History does not have to repeat - read **both** before ADD |

---

# Part 1 - Rear-view (10Y history)

## Master table - Today vs 10Y average

### A - Price vs value

| Parameter | What it measures | Link to stock price | 10Y avg (normal) | 10Y avg (incl. COVID) | **Today @ CMP** | **vs normal avg** | **Read** |
|-----------|------------------|---------------------|------------------|----------------------|-----------------|-------------------|----------|
| **Owner Earnings Yield** | EPS / price (Buffett) | **Higher = cheaper** | **${oeyA}%** | ${oeyA}% | **${oeyT}%** | $oeyVs | $(if ([double]$oeyT -lt [double]$oeyA * 0.9) { '**Expensive** on yield' } elseif ([double]$oeyT -gt [double]$oeyA * 1.1) { '**Cheap** on yield' } else { '**Fair** on yield' }) |
| **P/E** | Price / EPS | **Higher = pays more per Rs profit** | **${avg}x** | ${avg}x | **${pe}x** | $peVs | $peRead |
| **Intrinsic Value (@${ivPe}x EPS)** | Normal fair value anchor | Price below IV = margin | **-** | - | **Rs $iv** | - | Premium to IV **$premIv** |
| **Premium to IV (%)** | (Price - IV) / IV | **Negative = below fair value** | *Pending full pull* | *Pending* | **$premIv** | - | From TTM EPS x $ivPe |
| **Graham Number** | sqrt(22.5 x EPS x BVPS) | Max Graham fair price | *Pending* | *Pending* | *Pending* | - | Needs BVPS from AR |
| **Premium to Graham (%)** | vs Graham max | **Negative = Graham zone** | *Pending* | *Pending* | *Pending* | - | Refresh from AR |

### B - Business quality

$blockB

### C - Safety

$blockC

---

## One-page verdict (Part 1) @ Rs $cmp

| Question | Answer |
|----------|--------|
| **Cheap or expensive vs own 10Y?** | P/E **${pe}x** vs avg **${avg}x** - $verdict |
| **Owner yield vs history?** | **${oeyT}%** vs avg **${oeyA}%** |
| **Full quality/safety rows?** | **Pending** - refresh Block B/C from annual report |

$(Get-ForwardBlockA $h $cmp $pe $avg $ivPe)

---

## Data sources

| Input | Source | Type |
|-------|--------|------|
| CMP, TTM P/E, 10Y avg P/E | ``upward/downward-averaging-pe-analysis.md`` (25 Aug 2026) | FACT / ASSUMPTION |
| IV @ fair P/E | ``PARAMETERS-FRAMEWORK.md`` sector table | ASSUMPTION |
| Block B/C | Annual report pull pending | UNVERIFIED |

**Framework:** [``PARAMETERS-FRAMEWORK.md``](../../PARAMETERS-FRAMEWORK.md) | PCCL in ``summary-analysis.md``

*Generated: $analysisDate | ``_generate-all-parameters.ps1``*
"@
}

$created = 0; $skipped = 0
foreach ($h in $holdings) {
    if ($h.Detailed -and $SkipDetailed -and -not $Force) {
        Write-Output "SKIP $($h.T) (detailed hand-built file)"
        $skipped++
        continue
    }
    $dir = Join-Path $reportRoot ($h.F -replace '\\', [IO.Path]::DirectorySeparatorChar)
    if (-not (Test-Path $dir)) {
        Write-Warning "Missing folder: $dir"
        continue
    }
    $out = Join-Path $dir "PARAMETERS_$($h.T).md"
    if ($h.Detailed -and (Test-Path $out) -and -not $Force) {
        Write-Output "SKIP $($h.T) (exists, use -Force to overwrite)"
        $skipped++
        continue
    }
    $content = Build-ParametersMd $h
    $utf8 = New-Object System.Text.UTF8Encoding $true
    [IO.File]::WriteAllText($out, $content, $utf8)
    $created++
    Write-Output "OK $($h.T)"
}

Write-Output "--- Created: $created · Skipped: $skipped"
