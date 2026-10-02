# Apply Maruti-style dual-axis suggested-approach to all stocks - 24 Aug 2026
$INR = [char]0x20B9
$EM = [char]0x2014
$MID = [char]0x00B7
$TIMES = [char]0x00D7
$date = "24 Aug 2026"
$base = "d:\D-Drive\Personal\My-agent\Report"
$skip = @("Indraprastha Gas", "Maruti Suzuki")

function Parse-PcclLow($p) {
  if ($p -match 'N/A|UNVERIFIED|tiny') { return 0 }
  $s = ($p -split '-')[0] -replace ',','' -replace '[^\d.]',''
  if ([string]::IsNullOrWhiteSpace($s)) { return 0 }
  return [double]$s
}
function Get-TierNum($cmp, $pcclLow) {
  if ($pcclLow -le 0) { return 3 }
  $prem = ($cmp - $pcclLow) / $pcclLow * 100
  if ($prem -le 0) { return 5 }
  elseif ($prem -le 15) { return 4 }
  elseif ($prem -le 30) { return 3 }
  elseif ($prem -le 50) { return 2 }
  else { return 1 }
}
function Get-TierLabel($t) {
  switch ($t) {
    5 { return "Best cost to add" }
    4 { return "Fair value" }
    3 { return "Little premium" }
    2 { return "Expensive" }
    default { return "Very expensive" }
  }
}
function Get-SipStance($t, $act) {
  if ($act -eq "PAUSE") { return "Minimal token or HOLD legacy only (core-problem watch)" }
  switch ($t) {
    5 { return "Accelerate $EM largest monthly tranche" }
    4 { return "Steady $EM full salary pace" }
    3 { return "Slow $EM reduced tranche" }
    2 { return "Token $EM continuous 1-2 tranches/mo + blended cap" }
    default { return "Minimal token $EM 1 tranche/mo max + blended cap" }
  }
}
function Get-MonthlyPace($t, $q, $act) {
  if ($act -eq "PAUSE") {
    if ($t -ge 4) { return @{ Lo = 1; Hi = 1 } }
    return @{ Lo = 0; Hi = 0 }
  }
  switch ($t) {
    5 { $lo = [math]::Max(1, [int][math]::Round($q * 0.035)); $hi = [math]::Max($lo, [int][math]::Round($q * 0.05)) }
    4 { $lo = [math]::Max(1, [int][math]::Round($q * 0.02)); $hi = [math]::Max($lo, [int][math]::Round($q * 0.04)) }
    3 { $lo = [math]::Max(1, [int][math]::Round($q * 0.01)); $hi = [math]::Max($lo, [int][math]::Round($q * 0.02)) }
    2 { $lo = 1; $hi = if ($q -gt 200) { 2 } else { 1 } }
    default { $lo = 1; $hi = 1 }
  }
  return @{ Lo = $lo; Hi = $hi }
}
function Get-OverridePace($name) {
  switch ($name) {
    'Max Healthcare' { return @{ Lo = 15; Hi = 15; Txt = '15 sh/mo' } }
    'ICICI Bank' { return @{ Lo = 5; Hi = 8; Txt = '5-8 sh/mo' } }
    'Larsen and Toubro' { return @{ Lo = 18; Hi = 25; Txt = '18-25 sh/mo' } }
    'Muthoot Finance' { return @{ Lo = 1; Hi = 2; Txt = '1-2 sh/mo' } }
    'HCL Technologies' { return @{ Lo = 1; Hi = 2; Txt = '1-2 sh/mo' } }
    'Fortis Healthcare' { return @{ Lo = 5; Hi = 10; Txt = '5-10 sh/mo' } }
    default { return $null }
  }
}
function Get-BlendedCeil($avg, $cmp, $pcclMid) {
  if ($pcclMid -le 0) { return [math]::Round($avg * 1.12, 0) }
  $c = [math]::Min($avg * 1.25, $pcclMid * 1.15)
  if ($avg -lt $pcclMid) { $c = [math]::Min($c, $avg + ($pcclMid - $avg) * 0.45) }
  return [math]::Round([math]::Max($c, $avg * 1.05), 0)
}
function Get-ValBase($val) {
  if ($val -match 'Very expensive') { return 'Very expensive' }
  if ($val -match 'Expensive') { return 'Expensive' }
  if ($val -match 'Low') { return 'Low' }
  return 'Fair'
}
function Test-Divergence($tier, $valBase) {
  if ($tier -eq 5 -and $valBase -ne 'Low') { return $true }
  if ($tier -le 2 -and ($valBase -eq 'Fair' -or $valBase -eq 'Low')) { return $true }
  if ($tier -ge 4 -and ($valBase -match 'Expensive')) { return $true }
  return $false
}
function Get-SectorPE($sector) {
  switch -Regex ($sector) {
    'Banking|Finance|NBFC' { return @{ Lo = 14; Hi = 18; Label = "Banks / NBFC ~14-18$TIMES" } }
    'IT' { return @{ Lo = 22; Hi = 26; Label = "IT services ~22-26$TIMES" } }
    'Healthcare' { return @{ Lo = 35; Hi = 45; Label = "Hospitals ~35-45$TIMES" } }
    'Pharma' { return @{ Lo = 24; Hi = 30; Label = "Pharma ~24-30$TIMES" } }
    'Auto' { return @{ Lo = 25; Hi = 28; Label = "Auto OEM ~25-28$TIMES" } }
    'FMCG' { return @{ Lo = 45; Hi = 55; Label = "FMCG ~45-55$TIMES" } }
    'Oil and Gas' { return @{ Lo = 12; Hi = 23; Label = "OMC/CGD ~12-23$TIMES" } }
    'Infrastructure' { return @{ Lo = 28; Hi = 35; Label = "Infra/EPC ~28-35$TIMES" } }
    'Telecom' { return @{ Lo = 25; Hi = 30; Label = "Telecom ~25-30$TIMES" } }
    'Consumer' { return @{ Lo = 35; Hi = 42; Label = "Consumer ~35-42$TIMES" } }
    'Hotels' { return @{ Lo = 30; Hi = 40; Label = "Hotels/Leisure ~30-40$TIMES" } }
    default { return @{ Lo = 20; Hi = 30; Label = "Sector peer ~20-30$TIMES" } }
  }
}
function Get-SectorBand($sector) {
  switch -Regex ($sector) {
    'Healthcare' { return 'Healthcare **High**' }
    'Banking|Finance' { return 'Banks **High** (private) / Medium (PSU)' }
    'Infrastructure' { return 'Infra **High**' }
    'IT' { return 'IT **Low / Pause**' }
    'Oil and Gas' { return 'Oil & Gas **Medium** (watch crude)' }
    'Auto' { return 'Auto **Medium**' }
    'Pharma|FMCG' { return '**Medium**' }
    'Telecom' { return 'Telecom **Medium-High**' }
    default { return '**Medium**' }
  }
}
function Get-IndustryKpi($s) {
  switch ($s.T) {
    'MARUTI' { return 'PV leader; EV mix rising' }
    'HEROMOTOCO' { return '2W leader; SIAM monthly watch' }
    'ASHOKLEY' { return 'CV cycle; SIAM CV sales' }
    'TATAMOTORS' { return 'CV segment; cycle peak watch' }
    'MOTHERSON' { return 'Global auto components' }
    'TMPV' { return 'JLR / PV mix; core-problem watch' }
    'BHARTIARTL' { return 'Duopoly; tariff / ARPU' }
    'LT' { return 'Order book; infra capex cycle' }
    'MAXHEALTH' { return 'Bed additions; ARPOB' }
    'MEDANTA' { return 'Hospital occupancy; ARPOB' }
    'FORTIS' { return 'Hospital turnaround; bed growth' }
    'HDFCBANK' { return 'Credit growth; NIM post-merger' }
    'ICICIBANK' { return 'Retail + corporate credit mix' }
    'KOTAKBANK' { return 'Quality franchise; growth vs NIM' }
    'SBIN' { return 'PSU credit growth; asset quality' }
    'PNB' { return 'PSU bank; YoC gate' }
    'BANKINDIA' { return 'PSU bank; YoC gate' }
    'INFY' { return 'IT deal wins; AI headwind' }
    'TCS' { return 'IT leader; AI structural watch' }
    'HCLTECH' { return 'IT; AI / ER&D mix' }
    'WIPRO' { return 'Turnaround; deal pipeline' }
    'TECHM' { return 'Telecom vertical; turnaround' }
    'ITC' { return 'FMCG + hotels; dividend/YoC' }
    'HINDUNILVR' { return 'FMCG volume growth' }
    'IOC' { return 'OMC marketing margins; crude' }
    'IGL' { return 'CGD volumes; Delhi EV policy' }
    'ONGC' { return 'E&P; crude / gas realisations' }
    'MUTHOOTFIN' { return 'Gold loan AUM; PAT growth' }
    default { return "See ``detail-analysis.md``" }
  }
}
function Get-ForwardProb($valWhy) {
  if ($valWhy -match '~(\d+)-(\d+)%') { return "$($matches[1])-$($matches[2])%" }
  if ($valWhy -match '~(\d+)%') { return "~$($matches[1])%" }
  return 'Refresh at Q2'
}
function Get-PeRead($valBase) {
  switch ($valBase) {
    'Low' { return '**Cheap on earnings**' }
    'Very expensive' { return '**Premium to sector**' }
    'Expensive' { return '**In line to premium**' }
    default { return '**In line to sector**' }
  }
}
function Get-DivergenceNote($diverge, $tier, $valBase) {
  if (-not $diverge) {
    if ($tier -le 2) { return "**No** $EM both say token/minimal SIP" }
    if ($tier -eq 5 -and $valBase -eq 'Low') { return "**No** $EM both say accelerate" }
    if ($tier -ge 3) { return "**No** $EM both say steady/slow SIP" }
    return "**No** $EM axes align"
  }
  if ($tier -eq 5 -and $valBase -eq 'Fair') {
    return "**Yes** $EM price cheap vs PCCL but not **Low** forward"
  }
  if ($tier -le 2 -and $valBase -eq 'Fair') {
    return "**Yes** $EM PCCL expensive but forward still **Fair** (dual lens)"
  }
  if ($tier -ge 4 -and $valBase -match 'Expensive') {
    return "**Yes** $EM near PCCL but forward expensive"
  }
  return "**Yes** $EM see conflict resolution below"
}
function Get-AlignHeader($diverge) {
  if ($diverge) { return '**axes diverge**' }
  return '**axes align**'
}
function Get-ConflictLine($diverge, $tier, $valBase, $valFull, $finalPace, $sur) {
  $b = if ($valFull -match '\(') { $valFull } else { $valBase }
  if ($diverge) {
    return "**Conflict resolution:** A=$tier, B=$b $EM **diverge** $EM **$finalPace**, surplus $sur."
  }
  return "**Conflict resolution:** A=$tier, B=$b $EM **aligned** $EM **$finalPace**, surplus $sur."
}
function Get-FinalPace($name, $tier, $valBase, $paceTxt, $diverge) {
  $ov = Get-OverridePace $name
  if ($ov) { return $ov.Txt }
  if ($diverge -and $tier -eq 5 -and $valBase -eq 'Fair') {
    return "10-20 sh/mo (moderate; not full tier-5 mechanical)"
  }
  return $paceTxt
}
function Format-Prem($prem) {
  if ($prem -eq 'N/A') { return 'N/A vs PCCL' }
  $n = [int]$prem
  if ($n -ge 0) { return "+$n% vs PCCL" }
  return "$n% vs PCCL"
}

$all = @(
  @{ T="ASHOKLEY"; N="Ashok Leyland"; S="Auto"; Q=100; A=40.21; C=173; P="140-160"; Act="HOLD"; Sur="5-10%"; Val="Expensive"; ValWhy="Legacy +330%; CV cyclical. Forward ~55-65%. +24% vs PCCL $MID token SIP." }
  @{ T="BAJAJFINSV"; N="Bajaj Finserv"; S="Banking and Finance"; Q=60; A=1699.73; C=2033; P="1600-1750"; Act="HOLD"; Sur="5%"; Val="Expensive"; ValWhy="Holding-co premium; +16-27% vs PCCL. Forward ~60% $MID token SIP." }
  @{ T="BALKRISIND"; N="Balkrishna Industries"; S="Auto"; Q=21; A=1971.63; C=2351; P="1800-2000"; Act="HOLD"; Sur="5%"; Val="Expensive"; ValWhy="Export tyre; +18-31% vs PCCL. Forward ~55% $MID tiny token." }
  @{ T="BANKINDIA"; N="Bank of India"; S="Banking and Finance"; Q=1105; A=78.37; C=143; P="115-125"; Act="HOLD"; Sur="0-5%"; Val="Fair"; ValWhy="PSU bank; YoC gate. Forward ~60% $MID token only." }
  @{ T="BHARTIARTL"; N="Bharti Airtel"; S="Telecom"; Q=350; A=1079.71; C=1942; P="1600-1750"; Act="HOLD"; Sur="10-15%"; Val="Fair"; ValWhy="Duopoly; tariff catalyst. Forward ~70% $MID slow SIP OK." }
  @{ T="CIPLA"; N="Cipla"; S="Pharma"; Q=25; A=1220.26; C=1432; P="880"; Act="HOLD"; Sur="5%"; Val="Very expensive"; ValWhy="+63% vs PCCL; US drag. Forward ~55% $MID tiny token." }
  @{ T="DELTACORP"; N="Delta Corp"; S="Hotels and Leisure"; Q=1560; A=132.50; C=60; P="40-55"; Act="PAUSE"; Sur="0%"; Val="Very expensive"; ValWhy="Legal overhang; minimal/zero SIP. Forward ~40%." }
  @{ T="EICHERMOT"; N="Eicher Motors"; S="Auto"; Q=3; A=2668.88; C=8057; P="6500-7200"; Act="HOLD"; Sur="5%"; Val="Expensive"; ValWhy="Premium bike; +12-24% vs PCCL. Forward ~60% $MID tiny token." }
  @{ T="FORTIS"; N="Fortis Healthcare"; S="Healthcare"; Q=1200; A=332.07; C=917; P="450"; Act="HOLD"; Sur="10%"; Val="Very expensive"; ValWhy="+104% vs PCCL. Forward ~55% $MID token vs Max." }
  @{ T="GICRE"; N="General Insurance Corporation"; S="Banking and Finance"; Q=215; A=183.31; C=138; P="110-130"; Act="HOLD"; Sur="5%"; Val="Fair"; ValWhy="Near PCCL; PSU reinsurer. Forward ~55% $MID token." }
  @{ T="GLENMARK"; N="Glenmark Pharma"; S="Pharma"; Q=5; A=196.67; C=2150; P="N/A"; Act="HOLD"; Sur="0%"; Val="Very expensive"; ValWhy="Legacy multibagger; do not scale at CMP." }
  @{ T="HAVELLS"; N="Havells India"; S="Consumer"; Q=65; A=1049.42; C=1480; P="1200-1350"; Act="HOLD"; Sur="10%"; Val="Fair"; ValWhy="Quality electricals; Forward ~65% $MID slow SIP." }
  @{ T="HCLTECH"; N="HCL Technologies"; S="IT"; Q=360; A=1212.09; C=1303; P="1050-1150"; Act="HOLD"; Sur="0%"; Val="Fair"; ValWhy="IT; AI watch. Forward ~60% $MID 1-2 sh/mo sector pause." }
  @{ T="HDFCAMC"; N="HDFC Asset Management"; S="Banking and Finance"; Q=237; A=1500.98; C=2525; P="1900-2100"; Act="HOLD"; Sur="5%"; Val="Very expensive"; ValWhy="AMC peak concern. Forward ~55% $MID token only." }
  @{ T="HDFCBANK"; N="HDFC Bank"; S="Banking and Finance"; Q=1125; A=775.31; C=727; P="620-680"; Act="HOLD"; Sur="10%"; Val="Fair"; ValWhy="Below avg; governance overlay. Forward ~65% $MID DCA OK." }
  @{ T="HDFCLIFE"; N="HDFC Life Insurance"; S="Banking and Finance"; Q=650; A=619.19; C=555; P="480-540"; Act="HOLD"; Sur="5%"; Val="Fair"; ValWhy="Insurance; near PCCL. Forward ~60% $MID token SIP." }
  @{ T="HEG"; N="HEG"; S="Infrastructure"; Q=100; A=157.22; C=711; P="400-500"; Act="HOLD"; Sur="5%"; Val="Very expensive"; ValWhy="Graphite cyclical peak. Forward ~50% $MID token." }
  @{ T="HEROMOTOCO"; N="Hero MotoCorp"; S="Auto"; Q=30; A=3117.37; C=5735; P="5000"; Act="HOLD"; Sur="10%"; Val="Fair"; ValWhy="2W leader; SIAM monitor. Forward ~65% $MID slow SIP." }
  @{ T="HINDUNILVR"; N="Hindustan Unilever"; S="FMCG"; Q=250; A=2422.40; C=2040; P="1800-2000"; Act="HOLD"; Sur="5-10%"; Val="Fair"; ValWhy="FMCG quality; slow growth. Forward ~55% $MID token SIP." }
  @{ T="ICICIBANK"; N="ICICI Bank"; S="Banking and Finance"; Q=143; A=888.26; C=1420; P="1050-1150"; Act="ADD"; Sur="15-20%"; Val="Fair"; ValWhy="Salary #2 ADD; Forward ~70%." }
  @{ T="IGL"; N="Indraprastha Gas"; S="Oil and Gas"; Q=2050; A=212.49; C=151; P="170-190"; Act="HOLD"; Sur="5%"; Val="Fair (structural CNG watch)"; ValWhy="SKIP - manual dual-axis." }
  @{ T="INDHOTEL"; N="Indian Hotels"; S="Hotels and Leisure"; Q=400; A=94.61; C=736; P="550-650"; Act="HOLD"; Sur="10%"; Val="Very expensive"; ValWhy="Legacy +677%; token on dips. Forward ~55%." }
  @{ T="INFY"; N="Infosys"; S="IT"; Q=435; A=1480.69; C=1121; P="1050-1200"; Act="PAUSE"; Sur="0-5%"; Val="Fair"; ValWhy="AI headwind; near PCCL. Forward ~55% $MID minimal SIP." }
  @{ T="IOC"; N="Indian Oil Corporation"; S="Oil and Gas"; Q=1003; A=66.66; C=136; P="85-105"; Act="ADD"; Sur="10%"; Val="Expensive"; ValWhy="YoC overlay; legacy winner. Forward ~65% $MID token ADD." }
  @{ T="ITC"; N="ITC"; S="FMCG"; Q=3000; A=357.94; C=269; P="300-340"; Act="HOLD"; Sur="10%"; Val="Low"; ValWhy="Below PCCL; YoC compounder. Forward ~65% $MID accelerate band." }
  @{ T="ITCHOTELS"; N="ITC Hotels"; S="Hotels and Leisure"; Q=1185; A=223.38; C=220; P="190-210"; Act="HOLD"; Sur="5-10%"; Val="Fair"; ValWhy="Demerger watch. Forward ~60% $MID token SIP." }
  @{ T="KOTAKBANK"; N="Kotak Mahindra Bank"; S="Banking and Finance"; Q=1250; A=351.28; C=403; P="320-360"; Act="HOLD"; Sur="10%"; Val="Fair"; ValWhy="Quality bank. Forward ~65% $MID slow SIP." }
  @{ T="KWIL"; N="Kwality Walls India"; S="FMCG"; Q=250; A=46.27; C=46; P="UNVERIFIED"; Act="HOLD"; Sur="5%"; Val="Fair"; ValWhy="New listing watch. Forward UNVERIFIED." }
  @{ T="LT"; N="Larsen and Toubro"; S="Infrastructure"; Q=175; A=2304.03; C=4093; P="3360"; Act="ADD"; Sur="15-20%"; Val="Fair"; ValWhy="Infra ADD; order book. Forward ~70%." }
  @{ T="LUPIN"; N="Lupin"; S="Pharma"; Q=32; A=775.12; C=2100; P="1800"; Act="HOLD"; Sur="5-10%"; Val="Fair"; ValWhy="US improving. Forward ~65% $MID token SIP." }
  @{ T="MARUTI"; N="Maruti Suzuki"; S="Auto"; Q=57; A=11155.83; C=13565; P="10000-11000"; Act="HOLD"; Sur="5-10%"; Val="Expensive"; ValWhy="SKIP - manual dual-axis." }
  @{ T="MAXHEALTH"; N="Max Healthcare"; S="Healthcare"; Q=2000; A=655.84; C=1000; P="750"; Act="ADD"; Sur="25-30%"; Val="Fair"; ValWhy="Salary #1 ADD. Forward ~70%." }
  @{ T="MEDANTA"; N="Medanta"; S="Healthcare"; Q=212; A=1061.62; C=1200; P="950-1050"; Act="HOLD"; Sur="10%"; Val="Fair"; ValWhy="Hospital quality. Forward ~65% $MID optional slow SIP." }
  @{ T="MOTHERSON"; N="Samvardhana Motherson"; S="Auto"; Q=1000; A=65.27; C=155; P="120-140"; Act="HOLD"; Sur="10%"; Val="Fair"; ValWhy="Auto comp. Forward ~60% $MID slow SIP." }
  @{ T="MUTHOOTFIN"; N="Muthoot Finance"; S="Banking and Finance"; Q=125; A=1289.74; C=2972; P="1750-1800"; Act="HOLD"; Sur="0-5%"; Val="Expensive"; ValWhy="+65% vs PCCL; Forward ~55% $MID token 1-2/mo." }
  @{ T="ONGC"; N="Oil and Natural Gas Corp"; S="Oil and Gas"; Q=400; A=86.48; C=236; P="180-210"; Act="HOLD"; Sur="5%"; Val="Expensive"; ValWhy="E&P cyclical. Forward ~55% $MID token." }
  @{ T="PNB"; N="PNB"; S="Banking and Finance"; Q=1563; A=48.69; C=118; P="95-105"; Act="HOLD"; Sur="0-5%"; Val="Fair"; ValWhy="PSU YoC gate. Forward ~60% $MID token." }
  @{ T="RAAJINFRA"; N="Raajmarg Infra Investment"; S="Infrastructure"; Q=100; A=110.46; C=105; P="90-100"; Act="HOLD"; Sur="5%"; Val="Fair"; ValWhy="Tiny invIT. Forward ~55% $MID token." }
  @{ T="SBIN"; N="State Bank of India"; S="Banking and Finance"; Q=400; A=192.10; C=1050; P="880-950"; Act="HOLD"; Sur="0-5%"; Val="Fair"; ValWhy="PSU YoC ~9%. Forward ~60% $MID token." }
  @{ T="SUNPHARMA"; N="Sun Pharmaceutical"; S="Pharma"; Q=180; A=532.74; C=698; P="580-650"; Act="HOLD"; Sur="10%"; Val="Fair"; ValWhy="Quality pharma. Forward ~65% $MID slow SIP." }
  @{ T="TATACONSUM"; N="Tata Consumer Products"; S="FMCG"; Q=600; A=783.11; C=1150; P="900-1000"; Act="HOLD"; Sur="10%"; Val="Fair"; ValWhy="Tata brand. Forward ~65% $MID slow SIP." }
  @{ T="TATAMOTORS"; N="Tata Motors CV"; S="Auto"; Q=830; A=146.84; C=487; P="350-420"; Act="HOLD"; Sur="5%"; Val="Expensive"; ValWhy="CV cyclical. Forward ~55% $MID token." }
  @{ T="TCS"; N="Tata Consultancy Services"; S="IT"; Q=299; A=3303.50; C=2302; P="2000-2200"; Act="PAUSE"; Sur="0%"; Val="Expensive"; ValWhy="AI threat. Forward ~50% $MID minimal SIP." }
  @{ T="TECHM"; N="Tech Mahindra"; S="IT"; Q=27; A=860.61; C=576; P="500-580"; Act="PAUSE"; Sur="0-5%"; Val="Expensive"; ValWhy="Turnaround unproven. Forward ~50% $MID minimal." }
  @{ T="TMPV"; N="TMPV"; S="Auto"; Q=820; A=461.24; C=318; P="352"; Act="PAUSE"; Sur="0-5%"; Val="Fair"; ValWhy="Below PCCL; JLR watch. Forward ~45% $MID minimal SIP." }
  @{ T="UBL"; N="United Breweries"; S="Consumer"; Q=10; A=1041.30; C=1900; P="N/A"; Act="HOLD"; Sur="5%"; Val="Expensive"; ValWhy="Tiny; token. Forward ~55%." }
  @{ T="UJJIVANSFB"; N="Ujjivan Small Finance Bank"; S="Banking and Finance"; Q=3115; A=46.57; C=74; P="55-65"; Act="HOLD"; Sur="5%"; Val="Expensive"; ValWhy="SFB spec capped. Forward ~55% $MID token." }
  @{ T="WIPRO"; N="Wipro"; S="IT"; Q=200; A=267.83; C=181; P="160-190"; Act="PAUSE"; Sur="0-5%"; Val="Fair"; ValWhy="Turnaround watch. Forward ~55% $MID minimal." }
  @{ T="WONDERLA"; N="Wonderla Holidays"; S="Hotels and Leisure"; Q=50; A=170.75; C=720; P="N/A"; Act="HOLD"; Sur="5%"; Val="Very expensive"; ValWhy="Tiny leisure. Forward ~50% $MID token." }
)

$utf8 = New-Object System.Text.UTF8Encoding $false
$updated = 0
$skipped = 0

foreach ($s in $all) {
  if ($skip -contains $s.N) { $skipped++; Write-Output "Skip (manual): $($s.N)"; continue }

  $dir = Join-Path $base (Join-Path $s.S ($s.N))
  if (-not (Test-Path $dir)) { Write-Output "Missing dir: $($s.N)"; continue }

  $pcclLow = Parse-PcclLow $s.P
  $pcclHigh = if ($s.P -match '-') { [double](($s.P -split '-')[1] -replace ',','' -replace '[^\d.]','') } else { $pcclLow }
  $pcclMid = if ($pcclHigh -gt 0) { ($pcclLow + $pcclHigh) / 2 } else { $pcclLow }
  $tier = Get-TierNum $s.C $pcclLow
  $tierLabel = Get-TierLabel $tier
  $stance = Get-SipStance $tier $s.Act
  $pace = Get-MonthlyPace $tier $s.Q $s.Act
  $ov = Get-OverridePace $s.N
  if ($ov) { $pace = @{ Lo = $ov.Lo; Hi = $ov.Hi } }
  $blend = Get-BlendedCeil $s.A $s.C $pcclMid
  $ret = [math]::Round(($s.C - $s.A) / $s.A * 100, 1)
  $retSign = if ($ret -ge 0) { "+$ret" } else { "$ret" }
  $prem = if ($pcclLow -gt 0) { [math]::Round(($s.C - $pcclLow) / $pcclLow * 100, 0) } else { "N/A" }
  $premTxt = Format-Prem $prem
  $pcclDisp = if ($s.P -match 'N/A|UNVERIFIED') { $s.P } else { "$INR$($s.P)" }
  $valBase = Get-ValBase $s.Val
  $diverge = Test-Divergence $tier $valBase
  $alignHdr = Get-AlignHeader $diverge
  $divNote = Get-DivergenceNote $diverge $tier $valBase
  $secPE = Get-SectorPE $s.S
  $sectorBand = Get-SectorBand $s.S
  $indKpi = Get-IndustryKpi $s
  $fwdProb = Get-ForwardProb $s.ValWhy
  $peRead = Get-PeRead $valBase
  $paceTxt = if ($pace.Lo -eq 0) { "0 sh/mo (HOLD legacy only)" } elseif ($pace.Lo -eq $pace.Hi) { "$($pace.Lo) sh/mo" } else { "$($pace.Lo)-$($pace.Hi) sh/mo" }
  $finalPace = Get-FinalPace $s.N $tier $valBase $paceTxt $diverge
  $conflictLine = Get-ConflictLine $diverge $tier $valBase $s.Val $finalPace $s.Sur
  $yrLo = $pace.Lo * 12; $yrHi = $pace.Hi * 12
  $endLo = $s.Q + $yrLo; $endHi = $s.Q + $yrHi
  $lossPct = if ($pcclLow -gt 0) { [math]::Round(($pcclLow - $s.C) / $s.C * 100, 0) } else { "N/A" }

  $epsMid = [math]::Round($s.C / (($secPE.Lo + $secPE.Hi) / 2), 0)
  $epsLo = [math]::Round($s.C / $secPE.Hi, 0)
  $epsHi = [math]::Round($s.C / $secPE.Lo, 0)
  $peMid = [math]::Round(($secPE.Lo + $secPE.Hi) / 2, 0)
  $peLo = [math]::Max(1, [math]::Round($s.C / $epsHi, 0))
  $peHi = [math]::Round($s.C / $epsLo, 0)
  $shortName = if ($s.N.Length -gt 20) { $s.T } else { $s.N.Split(' ')[0] }

  $conflictBlock = if ($diverge) {
@"

## Conflict resolution (when axes diverge)

| Item | Decision |
|------|----------|
| Axis A alone | Tier $tier $EM mechanical **$paceTxt** |
| Axis B | **$($s.Val)** |
| **Final pace** | **$finalPace** |
| **Surplus rank** | **$($s.Sur)** |

$conflictLine

"@
  } else {
@"

$conflictLine

"@
  }

  $fence = '```'
  $tick = [char]0x60
  $approach = @"
# $($s.N) $EM Suggested Approach

**Analysis date:** $date  
**For:** $($s.Q) shares @ $INR$($s.A)  
**Investor mandate:** Continuous salary SIP in quality names $MID **PCCL protects** pace + blended book

---

## Philosophy

${fence}
Wealth = Quantity x Time x Business quality
Nobody knows timing $EM SIP through sideways markets
PCCL = protection (pace + book floor), NOT wait-for-crash entry
${fence}

Cross-ref: $($tick)pccl-analysis/continuous-sip-valuation-tiers.md$($tick) $MID $($tick)StockBook/_templates/dual-axis-suggested-approach.md$($tick)

---

## Dual-axis @ CMP ($INR$($s.C)) $EM $alignHdr

| | **Axis A $EM SIP tier** | **Axis B $EM Current value** |
|--|------------------------|----------------------------|
| **Question** | Price vs PCCL/IV? | Good buy **today** (forward)? |
| **Reading** | Tier **$tier** ($premTxt) | **$($s.Val)** |
| **Divergence?** | $divNote | |

---

## Valuation tier @ CMP ($INR$($s.C)) $EM Axis A

| Metric | Value | Tier |
|--------|------:|:----:|
| PCCL anchor | $pcclDisp | |
| Premium to PCCL | $prem% | |
| **Label** | **$tierLabel** | **$tier** |
| **Current value @ CMP** | **$($s.Val)** | |
| **SIP stance** | $stance | |
| **Monthly pace** | **$finalPace** | |
| **Blended ceiling** | **$INR$blend** | |

---

## Current value @ CMP $EM Axis B (P/E + industry + macro)

| Metric | $shortName | Sector / peer | Read |
|--------|-------:|--------------:|------|
| Normalized EPS ($INR) | ~$INR$epsLo-$epsHi | $EM | ASSUMPTION (refresh Q2) |
| P/E @ CMP (normalized) | **~$peLo-$peHi$TIMES** | $($secPE.Label) | $peRead |
| Legacy return on your cost | $retSign% | $EM | Past run partly in price |
| Industry / KPI | $indKpi | $EM | See detail-analysis |

| Factor | Read |
|--------|------|
| Sector band | $sectorBand |
| India macro | GDP 6.7%; RBI 5.25% (News 24 Aug) |
| Forward probability | **$fwdProb** |
| **Current value (B)** | **$($s.Val)** |

$conflictBlock
---

## Current value @ CMP (summary)

| Item | Assessment |
|------|------------|
| **Current value** | **$($s.Val)** |
| **Past performance** | Legacy return **$retSign%** on your book |
| **Forward probability** | **$fwdProb** |
| **Price vs PCCL** | **$prem%** vs pessimistic anchor |
| **Framework read** | $($s.ValWhy) |
| **SIP implication** | **$finalPace** $EM surplus **$($s.Sur)** |

---

## Default action

| | |
|--|--|
| **HOLD** | All $($s.Q) shares |
| **Tier @ CMP** | **$tier** $EM $tierLabel |
| **Current value @ CMP** | **$($s.Val)** |
| **Continuous SIP** | **$finalPace** |
| **Surplus slice** | **$($s.Sur)** |
| **Surplus action** | **$($s.Act)** |

---

## Blended average protection

| Item | Value |
|------|------:|
| Your avg cost | $INR$($s.A) |
| Blended ceiling | $INR$blend |
| 12-mo adds (base) | +$yrLo to +$yrHi shares |
| End qty (approx.) | $endLo to $endHi |

**Rule:** Slow pace upgrade if blended avg approaches **$INR$blend**. Do not stop SIP entirely unless core-problem / existential trigger.

---

## Price zones & actions

| Zone | vs PCCL | Tier | Action |
|------|---------|:----:|--------|
| At/below PCCL low | Stress | **5** | Core-problem check $EM **accelerate** |
| PCCL to +15% | Fair | **4** | **Steady SIP** |
| +15% to +30% | Little premium | **3** | **Slow SIP** |
| +30% to +50% | Expensive | **2** | **Token SIP** + blended cap |
| Above +50% | Very expensive | **1** | **Minimal token** (1/mo max) |

@ CMP: **tier $tier** $EM **$finalPace**

---

## New-tranche risk @ PCCL

| Buy @ CMP | PCCL low | Loss on new $INR if revisits PCCL |
|----------:|---------:|----------------------------------:|
| $INR$($s.C) | $INR$pcclLow | ~$lossPct% on fresh tranche |

Legacy @ $INR$($s.A) may still be above PCCL $EM size caps protect book.

---

## Triggers $EM upgrade or downgrade **pace**

### Upgrade (next tier pace)
- [ ] CMP moves down one tier band without thesis break
- [ ] Quarterly EPS supports normalized growth
- [ ] Core-problem test passes (if applicable)

### Downgrade (slower token)
- [ ] Blended avg within 3% of ceiling **$INR$blend**
- [ ] Material negative news / governance flag
- [ ] Axis B downgrades (Fair to Expensive)

---

## One-page decision card

${fence}
HOLD $($s.Q) @ $INR$($s.A)
Axis A $EM SIP tier $tier vs PCCL ($premTxt)
Axis B $EM Current value: $($s.Val) @ P/E ~$peLo-$peHi$TIMES vs sector ~$peMid$TIMES
DIVERGENCE: $(if ($diverge) { 'Yes' } else { 'No' }) $EM $finalPace
Surplus: $($s.Sur)
Blended cap: $INR$blend
${fence}

**Next refresh:** Q2 FY27 results $MID normalized P/E vs sector.
"@

  $path = Join-Path $dir "suggested-approach.md"
  [System.IO.File]::WriteAllText($path, $approach, $utf8)
  $updated++
  Write-Output "Updated: $($s.N)"
}

Write-Output "Done. Updated: $updated | Skipped manual: $skipped"
