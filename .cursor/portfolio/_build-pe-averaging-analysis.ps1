# Build upward / downward averaging PE analysis for all 49 holdings
# Method: TTM P/E @ CMP vs 10Y ex-COVID avg (skip FY2020-21) + forward FY27E (ASSUMPTION)
$ErrorActionPreference = 'Continue'
$date = '25 Aug 2026'
$base = 'd:\D-Drive\Personal\My-agent'
$reportBase = Join-Path $base 'Report'
$outUp = Join-Path $base '.cursor\portfolio\upward-averaging-pe-analysis.md'
$outDn = Join-Path $base '.cursor\portfolio\downward-averaging-pe-analysis.md'
$EM = [char]0x2014
$TIMES = [char]0x00D7
$INR = [char]0x20B9
$MID = [char]0x00B7

function Get-ScreenerMetrics($ticker) {
  $sym = switch ($ticker) {
    'TATAMOTORS' { 'TMCV' }
    'TMPV' { 'TMPV' }
    'ITCHOTELS' { 'ITCHOTELS' }
    'KWIL' { 'KWIL' }
    default { $ticker }
  }
  try {
    $url = "https://www.screener.in/company/$sym/consolidated/"
    $html = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 25 -Headers @{'User-Agent' = 'Mozilla/5.0' }).Content
    $pe = $null; $cmp = $null; $eps = $null
    if ($html -match 'Stock P/E[\s\S]*?<span class="number">([\d\.]+)') { $pe = [double]$matches[1] }
    if ($html -match 'Current Price[\s\S]*?<span class="number">([\d,\.]+)') { $cmp = [double]($matches[1] -replace ',', '') }
    if ($html -match 'EPS[\s\S]*?<span class="number">([\d\.\-]+)') { $eps = [double]$matches[1] }
    return @{ Pe = $pe; Cmp = $cmp; Eps = $eps; Ok = ($pe -gt 0) }
  } catch {
    return @{ Pe = $null; Cmp = $null; Eps = $null; Ok = $false }
  }
}

function Get-Pe10yAvg($t) {
  $map = @{
    ASHOKLEY = 18; BAJAJFINSV = 35; BALKRISIND = 24; BANKINDIA = 11; BHARTIARTL = 36
    CIPLA = 28; DELTACORP = 20; EICHERMOT = 25; FORTIS = 40; GICRE = 14
    GLENMARK = 25; HAVELLS = 48; HCLTECH = 22; HDFCAMC = 42; HDFCBANK = 22
    HDFCLIFE = 42; HEG = 14; HEROMOTOCO = 22; HINDUNILVR = 55; ICICIBANK = 20
    IGL = 24; INDHOTEL = 32; INFY = 23; IOC = 10; ITC = 26; ITCHOTELS = 35
    KOTAKBANK = 28; KWIL = 46; LT = 29; LUPIN = 22; MARUTI = 28; MAXHEALTH = 45
    MEDANTA = 38; MOTHERSON = 20; MUTHOOTFIN = 18; ONGC = 9; PNB = 12
    RAAJINFRA = 15; SBIN = 14; SUNPHARMA = 30; TATACONSUM = 58; TATAMOTORS = 14
    TCS = 24; TECHM = 18; TMPV = 16; UBL = 40; UJJIVANSFB = 14; WIPRO = 20; WONDERLA = 25
  }
  if ($map.ContainsKey($t)) { return $map[$t] }
  return 22
}

function Get-FwdFactor($t, $sector) {
  switch ($t) {
    { $_ -in @('LT', 'MAXHEALTH', 'ICICIBANK', 'BHARTIARTL', 'MOTHERSON', 'SUNPHARMA', 'HAVELLS', 'MEDANTA', 'LUPIN') } { return 0.78 }
    { $_ -in @('HDFCBANK', 'KOTAKBANK', 'ITC', 'IGL', 'INFY', 'TCS', 'HCLTECH') } { return 0.86 }
    { $_ -in @('TCS', 'TECHM', 'WIPRO') } { return 0.88 }
    { $_ -in @('IOC', 'ONGC', 'HEG', 'DELTACORP') } { return 0.95 }
    default {
      if ($sector -match 'FMCG|Consumer') { return 0.94 }
      if ($sector -match 'Bank|Finance|NBFC|Insurance') { return 0.90 }
      if ($sector -match 'IT') { return 0.88 }
      if ($sector -match 'Auto') { return 0.85 }
      return 0.88
    }
  }
}

function Get-VerdictPe($ttm, $avg, $axisB) {
  $prem = if ($avg -gt 0) { ($ttm - $avg) / $avg * 100 } else { 0 }
  $peLabel = if ($prem -ge 12) { 'Expensive' }
    elseif ($prem -ge 5) { 'Slightly expensive' }
    elseif ($prem -ge -8) { 'Fair' }
    elseif ($prem -ge -30) { 'Cheap' }
    else { 'Very cheap' }
  if ($axisB -match 'Very expensive|Expensive' -and $peLabel -match 'Cheap|Fair') {
    return "$peLabel vs history $EM $axisB Axis B"
  }
  if ($axisB -eq 'Low' -and $peLabel -match 'Cheap|Fair') {
    return "Cheap $EM $axisB Axis B"
  }
  return "$peLabel vs history $EM $axisB Axis B"
}

function Parse-Approach($path) {
  $d = @{ Pace = 'See report'; Blend = 'N/A'; Pccl = 'N/A'; PeNorm = 'N/A'; PeLo = 0; PeHi = 0; AxisB = 'Fair'; ReportCmp = 0 }
  if (-not (Test-Path $path)) { return $d }
  $c = Get-Content $path -Raw -Encoding UTF8
  if ($c -match 'Dual-axis @ CMP \(' + [regex]::Escape([string]$INR) + '([\d,]+)\)') { $d.ReportCmp = [double]($matches[1] -replace ',', '') }
  if ($c -match 'Dual-axis @ CMP \([^\d]*([\d,]+)\)') { if ($d.ReportCmp -le 0) { $d.ReportCmp = [double]($matches[1] -replace ',', '') } }
  if ($c -match '\*\*Monthly pace\*\* \| \*\*([^*]+)\*\*') { $d.Pace = $matches[1].Trim() }
  if ($c -match '\*\*Blended ceiling\*\* \| \*\*[^0-9]*([\d,]+)\*\*') { $d.Blend = $matches[1] -replace ',', '' }
  if ($c -match '\| PCCL anchor \| ([^|]+) \|') { $d.Pccl = $matches[1].Trim() }
  if ($c -match 'P/E @ CMP \(normalized\) \| \*\*~([\d\.]+)-([\d\.]+)' ) {
    $d.PeNorm = "$($matches[1])-$($matches[2])"
    $d.PeLo = [double]$matches[1]; $d.PeHi = [double]$matches[2]
  } elseif ($c -match 'P/E @ CMP \(normalized\) \| \*\*~([\d\.]+)' ) {
    $d.PeNorm = $matches[1]; $d.PeLo = [double]$matches[1]; $d.PeHi = [double]$matches[1]
  }
  if ($c -match '\*\*Current value \(B\)\*\* \| \*\*([^*]+)\*\*') { $d.AxisB = $matches[1].Trim() }
  return $d
}

function Format-Pct($n) {
  $v = [math]::Round($n, 0)
  if ($v -ge 0) { return "+$v%" }
  return "$v%"
}

$holdings = @(
  @{ T='ASHOKLEY'; N='Ashok Leyland'; S='Auto'; Q=100; A=40.21; C=173 }
  @{ T='BAJAJFINSV'; N='Bajaj Finserv'; S='Banking and Finance'; Q=60; A=1699.73; C=2033 }
  @{ T='BALKRISIND'; N='Balkrishna Industries'; S='Auto'; Q=21; A=1971.63; C=2351 }
  @{ T='BANKINDIA'; N='Bank of India'; S='Banking and Finance'; Q=1105; A=78.37; C=143 }
  @{ T='BHARTIARTL'; N='Bharti Airtel'; S='Telecom'; Q=350; A=1079.71; C=1942 }
  @{ T='CIPLA'; N='Cipla'; S='Pharma'; Q=25; A=1220.26; C=1432 }
  @{ T='DELTACORP'; N='Delta Corp'; S='Hotels and Leisure'; Q=1560; A=132.50; C=60 }
  @{ T='EICHERMOT'; N='Eicher Motors'; S='Auto'; Q=3; A=2668.88; C=8057 }
  @{ T='FORTIS'; N='Fortis Healthcare'; S='Healthcare'; Q=1200; A=332.07; C=917 }
  @{ T='GICRE'; N='General Insurance Corporation'; S='Banking and Finance'; Q=215; A=183.31; C=138 }
  @{ T='GLENMARK'; N='Glenmark Pharma'; S='Pharma'; Q=5; A=196.67; C=2150 }
  @{ T='HAVELLS'; N='Havells India'; S='Consumer'; Q=65; A=1049.42; C=1480 }
  @{ T='HCLTECH'; N='HCL Technologies'; S='IT'; Q=360; A=1212.09; C=1303 }
  @{ T='HDFCAMC'; N='HDFC Asset Management'; S='Banking and Finance'; Q=237; A=1500.98; C=2525 }
  @{ T='HDFCBANK'; N='HDFC Bank'; S='Banking and Finance'; Q=1125; A=775.31; C=727 }
  @{ T='HDFCLIFE'; N='HDFC Life Insurance'; S='Banking and Finance'; Q=650; A=619.19; C=555 }
  @{ T='HEG'; N='HEG'; S='Infrastructure'; Q=100; A=157.22; C=711 }
  @{ T='HEROMOTOCO'; N='Hero MotoCorp'; S='Auto'; Q=30; A=3117.37; C=5735 }
  @{ T='HINDUNILVR'; N='Hindustan Unilever'; S='FMCG'; Q=250; A=2422.40; C=2040 }
  @{ T='ICICIBANK'; N='ICICI Bank'; S='Banking and Finance'; Q=143; A=888.26; C=1420 }
  @{ T='IGL'; N='Indraprastha Gas'; S='Oil and Gas'; Q=2050; A=212.49; C=151 }
  @{ T='INDHOTEL'; N='Indian Hotels'; S='Hotels and Leisure'; Q=400; A=94.61; C=736 }
  @{ T='INFY'; N='Infosys'; S='IT'; Q=435; A=1480.69; C=1121 }
  @{ T='IOC'; N='Indian Oil Corporation'; S='Oil and Gas'; Q=1003; A=66.66; C=136 }
  @{ T='ITC'; N='ITC'; S='FMCG'; Q=3000; A=357.94; C=269 }
  @{ T='ITCHOTELS'; N='ITC Hotels'; S='Hotels and Leisure'; Q=1185; A=223.38; C=220 }
  @{ T='KOTAKBANK'; N='Kotak Mahindra Bank'; S='Banking and Finance'; Q=1250; A=351.28; C=403 }
  @{ T='KWIL'; N='Kwality Walls India'; S='FMCG'; Q=250; A=46.27; C=46 }
  @{ T='LT'; N='Larsen and Toubro'; S='Infrastructure'; Q=175; A=2304.03; C=4093 }
  @{ T='LUPIN'; N='Lupin'; S='Pharma'; Q=32; A=775.12; C=2100 }
  @{ T='MARUTI'; N='Maruti Suzuki'; S='Auto'; Q=57; A=11155.83; C=13565 }
  @{ T='MAXHEALTH'; N='Max Healthcare'; S='Healthcare'; Q=2000; A=655.84; C=1000 }
  @{ T='MEDANTA'; N='Medanta'; S='Healthcare'; Q=212; A=1061.62; C=1200 }
  @{ T='MOTHERSON'; N='Samvardhana Motherson'; S='Auto'; Q=1000; A=65.27; C=155 }
  @{ T='MUTHOOTFIN'; N='Muthoot Finance'; S='Banking and Finance'; Q=125; A=1289.74; C=2972 }
  @{ T='ONGC'; N='Oil and Natural Gas Corp'; S='Oil and Gas'; Q=400; A=86.48; C=236 }
  @{ T='PNB'; N='PNB'; S='Banking and Finance'; Q=1563; A=48.69; C=118 }
  @{ T='RAAJINFRA'; N='Raajmarg Infra Investment'; S='Infrastructure'; Q=100; A=110.46; C=105 }
  @{ T='SBIN'; N='State Bank of India'; S='Banking and Finance'; Q=400; A=192.10; C=1050 }
  @{ T='SUNPHARMA'; N='Sun Pharmaceutical'; S='Pharma'; Q=180; A=532.74; C=698 }
  @{ T='TATACONSUM'; N='Tata Consumer Products'; S='FMCG'; Q=600; A=783.11; C=1150 }
  @{ T='TATAMOTORS'; N='Tata Motors CV'; S='Auto'; Q=830; A=146.84; C=487 }
  @{ T='TCS'; N='Tata Consultancy Services'; S='IT'; Q=299; A=3303.50; C=2302 }
  @{ T='TECHM'; N='Tech Mahindra'; S='IT'; Q=27; A=860.61; C=576 }
  @{ T='TMPV'; N='TMPV'; S='Auto'; Q=820; A=461.24; C=318 }
  @{ T='UBL'; N='United Breweries'; S='Consumer'; Q=10; A=1041.30; C=1900 }
  @{ T='UJJIVANSFB'; N='Ujjivan Small Finance Bank'; S='Banking and Finance'; Q=3115; A=46.57; C=74 }
  @{ T='WIPRO'; N='Wipro'; S='IT'; Q=200; A=267.83; C=181 }
  @{ T='WONDERLA'; N='Wonderla Holidays'; S='Hotels and Leisure'; Q=50; A=170.75; C=720 }
)

$rows = @()
$i = 0
foreach ($h in $holdings) {
  $i++
  Write-Host "[$i/49] $($h.T)..."
  $approachPath = Join-Path $reportBase (Join-Path $h.S "$($h.N)\suggested-approach.md")
  $ap = Parse-Approach $approachPath
  $m = Get-ScreenerMetrics $h.T
  Start-Sleep -Milliseconds 700
  $cmp = if ($ap.ReportCmp -gt 0) { [math]::Round($ap.ReportCmp, 0) }
    elseif ($m.Cmp -gt 0) { [math]::Round($m.Cmp, 0) } else { $h.C }
  $ttmPe = $null
  if ($m.Pe -gt 0 -and $ap.ReportCmp -gt 0 -and $m.Cmp -gt 0) {
    $drift = [math]::Abs($m.Cmp - $ap.ReportCmp) / $ap.ReportCmp
    if ($drift -le 0.08) { $ttmPe = [math]::Round($m.Pe, 1) }
    else { $ttmPe = [math]::Round(($ap.PeLo + $ap.PeHi) / 2, 1) }
  } elseif ($m.Pe -gt 0) { $ttmPe = [math]::Round($m.Pe, 1) }
  elseif ($ap.PeLo -gt 0) { $ttmPe = [math]::Round(($ap.PeLo + $ap.PeHi) / 2, 1) }
  if ($h.T -in @('IGL','TMPV','HDFCLIFE')) {
    if ($h.T -eq 'IGL') { $ttmPe = 14.0 }
    if ($h.T -eq 'TMPV') { $ttmPe = 26.0 }
    if ($h.T -eq 'HDFCLIFE') { $ttmPe = 72.0 }
  }
  $ttmEps = if ($m.Eps -and $ttmPe) { $m.Eps } elseif ($ttmPe -gt 0) { [math]::Round($cmp / $ttmPe, 2) } else { $null }

  $note = ''
  if ($h.T -eq 'IGL') { $note = 'norm EPS' }
  if ($h.T -eq 'TMPV') { $note = 'depressed EPS' }
  if ($h.T -in @('UJJIVANSFB','WONDERLA','RAAJINFRA','KWIL')) { $note = 'short history / illiquid' }

  $pe10 = Get-Pe10yAvg $h.T
  $fwdPe = if ($ttmPe) { [math]::Round($ttmPe * (Get-FwdFactor $h.T $h.S), 1) } else { $null }
  $ret = [math]::Round(($cmp - $h.A) / $h.A * 100, 1)
  $retTxt = if ($ret -ge 0) { "+$ret%" } else { "$ret%" }
  $vsAvg = if ($ttmPe -and $pe10) { ($ttmPe - $pe10) / $pe10 * 100 } else { $null }
  $vsAvgTxt = if ($null -ne $vsAvg) { Format-Pct $vsAvg } else { 'N/A' }
  $vsFwdAvg = if ($fwdPe -and $pe10) { Format-Pct (($fwdPe - $pe10) / $pe10 * 100) } else { 'N/A' }
  $verdict = if ($ttmPe) { Get-VerdictPe $ttmPe $pe10 $ap.AxisB } else { "UNVERIFIED $EM $($ap.AxisB)" }

  $rows += [PSCustomObject]@{
    T = $h.T; N = $h.N; S = $h.S; Q = $h.Q; A = $h.A; Cmp = $cmp
    Ret = $ret; RetTxt = $retTxt; Up = ($ret -ge 0)
    TtmPe = $ttmPe; Pe10 = $pe10; VsAvg = $vsAvgTxt; FwdPe = $fwdPe; VsFwd = $vsFwdAvg
    Verdict = $verdict; Pace = $ap.Pace; Pccl = $ap.Pccl; Blend = $ap.Blend
    PeNorm = $ap.PeNorm; AxisB = $ap.AxisB; TtmEps = $ttmEps; Note = $note
  }
}

function Build-StockDetail($r, $dir) {
  $avgLabel = if ($dir -eq 'up') { 'Premium vs avg' } else { 'Discount vs avg' }
  $avgNote = if ($dir -eq 'up') { 'Every add **raises** blended average' } else { 'Adds **lower** blended average if thesis intact' }
  $epsLine = if ($r.TtmEps) { "$INR$($r.TtmEps)" } else { 'See report' }
  $noteLine = if ($r.Note) { "`n| Note | $($r.Note) |" } else { '' }
  @"

### $($r.N) ($($r.T))

| Metric | Value |
|--------|------:|
| TTM EPS @ CMP | $epsLine |
| Normalized P/E band | ~$($r.PeNorm)$TIMES |
| 10Y ex-COVID avg P/E | ~$($r.Pe10)$TIMES |
| PCCL anchor | $($r.Pccl) |
| Blended ceiling | $INR$($r.Blend) |
| Axis B @ CMP | $($r.AxisB) |$noteLine

| Lens | Reading |
|------|---------|
| vs own history | TTM **$($r.TtmPe)$TIMES** vs avg **~$($r.Pe10)$TIMES** ($($r.VsAvg)) |
| vs forward (FY27E) | **~$($r.FwdPe)$TIMES** ($($r.VsFwd) vs avg) ASSUMPTION |
| vs Axis B | **$($r.AxisB)** |
| **$(if($dir-eq'up'){'Upward'}else{'Downward'}) averaging** | $avgNote |

"@
}

function Build-File($dir, $path, $title, $subtitle, $ruleBlock) {
  $subset = $rows | Where-Object { if ($dir -eq 'up') { $_.Up } else { -not $_.Up } } | Sort-Object { -$_.Q * $_.Cmp }
  $sb = New-Object System.Text.StringBuilder
  [void]$sb.AppendLine("# $title")
  [void]$sb.AppendLine('')
  [void]$sb.AppendLine("**Analysis date:** $date  ")
  [void]$sb.AppendLine("**Holdings:** $subtitle  ")
  [void]$sb.AppendLine("**Method:** 10-year FY-end P/E **excluding FY2020 & FY2021** (COVID-distorted) $MID compare **TTM P/E @ CMP** and **forward P/E** (FY27E EPS, ASSUMPTION)  ")
  [void]$sb.AppendLine("**Sources:** Screener.in TTM P/E (live) $MID CMP from ``StockBook/*/suggested-approach.md`` (24 Aug 2026) $MID 10Y avg ASSUMPTION")
  [void]$sb.AppendLine('')
  $xref = if ($dir -eq 'up') { 'downward-averaging-pe-analysis.md' } else { 'upward-averaging-pe-analysis.md' }
  [void]$sb.AppendLine("Cross-ref: ``$xref`` $MID ``GLOSSARY.md`` $MID ``pccl-analysis/premium-add-sizing.md``")
  [void]$sb.AppendLine('')
  [void]$sb.AppendLine('---')
  [void]$sb.AppendLine('')
  [void]$sb.AppendLine("## Master table ($($subset.Count) positions)")
  [void]$sb.AppendLine('')
  if ($dir -eq 'up') {
    [void]$sb.AppendLine('| Ticker | Qty | Avg cost | **CMP** | Legacy return | **TTM P/E** | **10Y ex-COVID avg** | Premium vs avg | **Forward P/E** | vs avg | **Verdict @ CMP** | SIP pace |')
  } else {
    [void]$sb.AppendLine('| Ticker | Qty | Avg cost | **CMP** | Legacy return | **TTM P/E** | **10Y ex-COVID avg** | Discount vs avg | **Forward P/E** | vs avg | **Verdict @ CMP** | SIP / action |')
  }
  [void]$sb.AppendLine('|--------|----:|---------:|--------:|--------------:|------------:|---------------------:|---------------:|----------------:|-------:|-------------------|------------|')
  foreach ($r in ($subset | Sort-Object T)) {
    $a = [math]::Round($r.A, 0)
    $peDisp = if ($r.TtmPe) { "$($r.TtmPe)$TIMES" } else { 'UNVERIFIED' }
    $fwdDisp = if ($r.FwdPe) { "~$($r.FwdPe)$TIMES" } else { 'N/A' }
    $noteFlag = if ($r.Note) { '*' } else { '' }
    [void]$sb.AppendLine("| **$($r.T)**$noteFlag | $($r.Q) | $INR$a | **$INR$($r.Cmp)** | $($r.RetTxt) | **$peDisp** | **~$($r.Pe10)$TIMES** | **$($r.VsAvg)** | **$fwdDisp** | $($r.VsFwd) | **$($r.Verdict)** | $($r.Pace) |")
  }
  [void]$sb.AppendLine('')
  [void]$sb.AppendLine("**Type labels:** FACT = Screener TTM P/E $MID CMP from report $MID ASSUMPTION = 10Y avg / FY27E forward $MID * = normalized or depressed EPS override")
  [void]$sb.AppendLine('')
  [void]$sb.AppendLine('---')
  [void]$sb.AppendLine('')
  [void]$sb.AppendLine('## Per-stock detail')
  foreach ($r in ($subset | Sort-Object T)) {
    [void]$sb.AppendLine((Build-StockDetail $r $dir))
  }
  [void]$sb.AppendLine('---')
  [void]$sb.AppendLine('')
  [void]$sb.AppendLine("## $(if($dir-eq'up'){'Upward'}else{'Downward'})-averaging rules")
  [void]$sb.AppendLine('')
  [void]$sb.AppendLine('```')
  [void]$sb.AppendLine($ruleBlock)
  [void]$sb.AppendLine('```')
  [void]$sb.AppendLine('')
  [void]$sb.AppendLine('| Stock | Cheap vs 10Y? | Framework add? |')
  [void]$sb.AppendLine('|-------|:-------------:|:----------------|')
  foreach ($r in ($subset | Sort-Object T)) {
    $cheap = if ($r.VsAvg -match '^\-') { 'Yes' } elseif ($r.VsAvg -eq 'N/A') { '?' } else { 'No' }
    $add = if ($r.Pace -match '0 sh|PAUSE|HOLD legacy only') { 'HOLD / minimal' } else { 'Per pace column' }
    if ($r.T -in @('TCS','TECHM') -and $r.Pace -match '0') { $add = '**0% surplus · HOLD**' }
    if ($r.T -eq 'ITC') { $add = '**Accelerate band**' }
    if ($r.T -eq 'DELTACORP') { $add = '**PAUSE / legal**' }
    [void]$sb.AppendLine("| $($r.T) | $cheap | $add |")
  }
  [void]$sb.AppendLine('')
  [void]$sb.AppendLine('---')
  [void]$sb.AppendLine('')
  [void]$sb.AppendLine('## One-page decision card')
  [void]$sb.AppendLine('')
  [void]$sb.AppendLine('```')
  $hdr = if ($dir -eq 'up') { 'UPWARD-AVERAGING BOOK' } else { 'DOWNWARD-AVERAGING BOOK' }
  [void]$sb.AppendLine("$hdr @ $date ($($subset.Count) names)")
  foreach ($r in ($subset | Sort-Object { -[math]::Abs($r.Ret) })) {
    [void]$sb.AppendLine("$($r.T.PadRight(12)) $($r.RetTxt.PadLeft(7))  P/E $($r.TtmPe)$TIMES vs avg $($r.Pe10)$TIMES  -> $($r.Pace)")
  }
  [void]$sb.AppendLine('Rule: PCCL + blended ceiling + Axis B + mandate (IT cluster 0% surplus)')
  [void]$sb.AppendLine('```')
  [void]$sb.AppendLine('')
  [void]$sb.AppendLine('**Next refresh:** Q2 FY27 results · normalized P/E · screener TTM re-fetch.')
  [System.IO.File]::WriteAllText($path, $sb.ToString(), (New-Object System.Text.UTF8Encoding $false))
}

$upRule = @'
Legacy CMP > avg cost  ->  dual lens applies
Adds @ CMP  ->  raise blended average  ->  premium-to-PCCL size caps
Never full-size add above PCCL unless Tier 4-5 + Axis B Fair/Low
'@

$dnRule = @'
CMP < avg cost  ->  mathematically favourable to lower blended avg IF thesis intact
Must still pass: PCCL · Axis B · core-problem test · IT cluster surplus = 0%
Cheap vs 10Y P/E alone != BUY if structural threat (TCS AI) or margin stress (IGL)
'@

Build-File 'up' $outUp "Upward averaging $EM P/E vs 10-year history (ex-COVID)" "Legacy **CMP > avg cost** $MID adds raise blended average" $upRule
Build-File 'dn' $outDn "Downward averaging $EM P/E vs 10-year history (ex-COVID)" "Legacy **CMP < avg cost** $MID adds lower blended average (if you add)" $dnRule

Write-Host "Upward: $(($rows | Where-Object Up).Count) | Downward: $(($rows | Where-Object { -not $_.Up }).Count)"
Write-Host "Written: $outUp"
Write-Host "Written: $outDn"
