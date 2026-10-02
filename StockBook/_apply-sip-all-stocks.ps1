# Apply continuous SIP template to all portfolio Report stocks - 23 Aug 2026
$INR = [char]0x20B9
$EM = [char]0x2014
$MID = [char]0x00B7
$date = "23 Aug 2026"
$base = "d:\D-Drive\Personal\My-agent\Report"
$skip = @()

function Parse-PcclLow($p) {
  if ($p -match 'N/A|UNVERIFIED|tiny') { return 0 }
  $s = ($p -split '-')[0] -replace ',','' -replace '[^\d.]',''
  if ([string]::IsNullOrWhiteSpace($s)) { return 0 }
  return [double]$s
}
function Parse-PcclHigh($p) {
  if ($p -match 'N/A|UNVERIFIED|tiny') { return 0 }
  $parts = $p -split '-'
  if ($parts.Count -gt 1) {
    $s = $parts[1] -replace ',','' -replace '[^\d.]',''
    return [double]$s
  }
  return Parse-PcclLow $p
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
    if ($t -ge 4) { $lo = 1; $hi = 1 } else { $lo = 0; $hi = 0 }
    return @{ Lo = $lo; Hi = $hi; Note = "Core-problem / thesis watch $EM pace minimal" }
  }
  switch ($t) {
    5 { $lo = [math]::Max(1, [int][math]::Round($q * 0.035)); $hi = [math]::Max($lo, [int][math]::Round($q * 0.05)) }
    4 { $lo = [math]::Max(1, [int][math]::Round($q * 0.02)); $hi = [math]::Max($lo, [int][math]::Round($q * 0.04)) }
    3 { $lo = [math]::Max(1, [int][math]::Round($q * 0.01)); $hi = [math]::Max($lo, [int][math]::Round($q * 0.02)) }
    2 { $lo = 1; $hi = if ($q -gt 200) { 2 } else { 1 } }
    default { $lo = 1; $hi = 1 }
  }
  return @{ Lo = $lo; Hi = $hi; Note = "" }
}
function Get-BlendedCeil($avg, $cmp, $pcclMid) {
  if ($pcclMid -le 0) { return [math]::Round($avg * 1.12, 0) }
  $c = [math]::Min($avg * 1.25, $pcclMid * 1.15)
  if ($avg -lt $pcclMid) { $c = [math]::Min($c, $avg + ($pcclMid - $avg) * 0.45) }
  return [math]::Round([math]::Max($c, $avg * 1.05), 0)
}
function Get-TickerFile($t) { ($t -replace ' ', '-').ToLower() + "-report.html" }

# T,N,S,Q,A,C,P,Act,V,Sur,Val,ValWhy
$all = @(
  @{ T="ASHOKLEY"; N="Ashok Leyland"; S="Auto"; Q=100; A=40.21; C=173; P="140-160"; Act="HOLD"; V="HOLD $MID token SIP tier-paced"; Sur="5-10%"; Val="Expensive"; ValWhy="Legacy +330% $MID CV upturn partly priced. Forward recovery prob ~55-65% (cyclical, not compounder). +24% vs PCCL $MID token SIP only." }
  @{ T="BAJAJFINSV"; N="Bajaj Finserv"; S="Banking and Finance"; Q=60; A=1699.73; C=2033; P="1600-1750"; Act="HOLD"; V="HOLD $MID token SIP"; Sur="5%"; Val="Expensive"; ValWhy="Holding-co premium; +16-27% vs PCCL. Past rerating strong; forward prob ~60% $MID token SIP." }
  @{ T="BALKRISIND"; N="Balkrishna Industries"; S="Auto"; Q=21; A=1971.63; C=2351; P="1800-2000"; Act="HOLD"; V="HOLD tiny $MID token SIP"; Sur="5%"; Val="Expensive"; ValWhy="Export tyre cyclical; +18-31% vs PCCL. Quality niche but cycle peak risk $MID tiny token." }
  @{ T="BANKINDIA"; N="Bank of India"; S="Banking and Finance"; Q=1105; A=78.37; C=143; P="115-125"; Act="HOLD"; V="HOLD $MID YoC gate $MID token only"; Sur="0-5%"; Val="Fair"; ValWhy="PSU bank; +14-24% vs PCCL. YoC below 8% add gate. Forward prob ~60% $MID token only." }
  @{ T="BHARTIARTL"; N="Bharti Airtel"; S="Telecom"; Q=350; A=1079.71; C=1942; P="1600-1750"; Act="HOLD"; V="HOLD $MID continuous slow SIP"; Sur="10-15%"; Val="Fair"; ValWhy="Duopoly moat; tariff catalyst ~70%. +11-21% vs PCCL, near IV $MID steady slow SIP OK." }
  @{ T="CIPLA"; N="Cipla"; S="Pharma"; Q=25; A=1220.26; C=1432; P="880"; Act="HOLD"; V="HOLD tiny $MID token SIP"; Sur="5%"; Val="Very expensive"; ValWhy="+63% vs PCCL; US Q1 drag. Past ok; forward prob ~55% $MID tiny token only." }
  @{ T="DELTACORP"; N="Delta Corp"; S="Hotels and Leisure"; Q=1560; A=132.50; C=60; P="40-55"; Act="PAUSE"; V="HOLD legacy $MID legal overhang"; Sur="0%"; Val="Very expensive"; ValWhy="Legal/GST overhang; legacy -55%. Existential risk band $MID minimal/zero SIP." }
  @{ T="EICHERMOT"; N="Eicher Motors"; S="Auto"; Q=3; A=2668.88; C=8057; P="6500-7200"; Act="HOLD"; V="HOLD tiny $MID token SIP"; Sur="5%"; Val="Expensive"; ValWhy="Legacy +201%; premium motorcycle franchise. +12-24% vs PCCL $MID tiny token." }
  @{ T="FORTIS"; N="Fortis Healthcare"; S="Healthcare"; Q=1200; A=332.07; C=917; P="450"; Act="HOLD"; V="HOLD $MID token SIP 5-10 sh/mo capped"; Sur="10%"; Val="Very expensive"; ValWhy="+104% vs PCCL; legacy +176%. Hospital quality ok; forward PAT lag $MID token SIP vs Max." }
  @{ T="GICRE"; N="General Insurance Corporation"; S="Banking and Finance"; Q=215; A=183.31; C=138; P="110-130"; Act="HOLD"; V="HOLD tiny $MID token SIP"; Sur="5%"; Val="Fair"; ValWhy="Below cost -25%; near PCCL. PSU reinsurer; moderate forward ~55% $MID token." }
  @{ T="GLENMARK"; N="Glenmark Pharma"; S="Pharma"; Q=5; A=196.67; C=2150; P="N/A"; Act="HOLD"; V="HOLD legacy tiny"; Sur="0%"; Val="Very expensive"; ValWhy="Legacy multibagger +993%; immaterial weight. Do not scale at CMP." }
  @{ T="HAVELLS"; N="Havells India"; S="Consumer"; Q=65; A=1049.42; C=1480; P="1200-1350"; Act="HOLD"; V="HOLD $MID slow SIP"; Sur="10%"; Val="Fair"; ValWhy="Quality consumer electricals; +10-23% vs PCCL. Forward prob ~65% $MID slow SIP." }
  @{ T="HCLTECH"; N="HCL Technologies"; S="IT"; Q=360; A=1212.09; C=1303; P="1050-1150"; Act="HOLD"; V="HOLD $MID slow SIP"; Sur="5-10%"; Val="Fair"; ValWhy="IT moderate quality; +13-24% vs PCCL. Legacy +7%; forward prob ~60% amid AI $MID slow SIP." }
  @{ T="HDFCAMC"; N="HDFC Asset Management"; S="Banking and Finance"; Q=237; A=1500.98; C=2525; P="1900-2100"; Act="HOLD"; V="HOLD $MID token SIP at CMP"; Sur="5%"; Val="Very expensive"; ValWhy="+20-33% vs PCCL; AMC earnings cyclical peak concern. Legacy +68% $MID token only." }
  @{ T="HDFCBANK"; N="HDFC Bank"; S="Banking and Finance"; Q=1125; A=775.31; C=727; P="620-680"; Act="HOLD"; V="HOLD $MID continuous 5-10 sh/mo below avg"; Sur="10%"; Val="Fair"; ValWhy="Below your avg -6%; +7-17% vs PCCL. Governance overlay; forward prob ~65% post-RBI clarity $MID DCA OK." }
  @{ T="HDFCLIFE"; N="HDFC Life Insurance"; S="Banking and Finance"; Q=650; A=619.19; C=555; P="480-540"; Act="HOLD"; V="HOLD below cost $MID token SIP"; Sur="5%"; Val="Fair"; ValWhy="Below cost -10%; near/below PCCL band. Insurance growth moderate ~60% $MID token SIP." }
  @{ T="HEG"; N="HEG"; S="Infrastructure"; Q=100; A=157.22; C=711; P="400-500"; Act="HOLD"; V="HOLD $MID token SIP cyclical"; Sur="5%"; Val="Very expensive"; ValWhy="Graphite electrode cyclical; legacy +352%. +42-78% vs PCCL $MID token only." }
  @{ T="HEROMOTOCO"; N="Hero MotoCorp"; S="Auto"; Q=30; A=3117.37; C=5735; P="5000"; Act="HOLD"; V="HOLD $MID optional slow SIP"; Sur="10%"; Val="Fair"; ValWhy="2W leader; +15% vs PCCL. SIAM monitor; forward prob ~65% $MID slow SIP optional." }
  @{ T="HINDUNILVR"; N="Hindustan Unilever"; S="FMCG"; Q=250; A=2422.40; C=2040; P="1800-2000"; Act="HOLD"; V="HOLD below cost $MID token SIP"; Sur="5-10%"; Val="Fair"; ValWhy="Below cost -16%; +2-13% vs PCCL. FMCG quality; slow growth ~55% $MID token SIP." }
  @{ T="ICICIBANK"; N="ICICI Bank"; S="Banking and Finance"; Q=143; A=888.26; C=1420; P="1050-1150"; Act="ADD"; V="**ADD** salary #2 $MID 5-8 sh/mo continuous"; Sur="15-20%"; Val="Fair"; ValWhy="Top private bank; +23-35% vs PCCL acceptable for quality. Forward prob ~70% $MID salary ADD priority." }
  @{ T="IGL"; N="Indraprastha Gas"; S="Oil and Gas"; Q=2050; A=212.49; C=151; P="170-190"; Act="HOLD"; V="HOLD $MID slow SIP 10-20 sh/mo (Delhi EV watch)"; Sur="5%"; Val="Fair (structural CNG watch)"; ValWhy="Below PCCL -11% but Delhi EV Policy 2027 caps new CNG 3W. Forward ~55%. Slow SIP not full accelerate." }
  @{ T="INDHOTEL"; N="Indian Hotels"; S="Hotels and Leisure"; Q=400; A=94.61; C=736; P="550-650"; Act="HOLD"; V="HOLD $MID token SIP"; Sur="10%"; Val="Very expensive"; ValWhy="Legacy +677%; tourism rerating largely done. +13-34% vs PCCL $MID token on dips only." }
  @{ T="INFY"; N="Infosys"; S="IT"; Q=435; A=1480.69; C=1121; P="1050-1200"; Act="PAUSE"; V="HOLD $MID AI headwind $MID minimal SIP"; Sur="0-5%"; Val="Fair"; ValWhy="Below cost -24%; near PCCL. AI headwind priced ~55% forward $MID minimal SIP legacy hold." }
  @{ T="IOC"; N="Indian Oil Corporation"; S="Oil and Gas"; Q=1003; A=66.66; C=136; P="85-105"; Act="ADD"; V="**ADD** YoC overlay $MID salary #5"; Sur="10%"; Val="Expensive"; ValWhy="Legacy +104%; +30-60% vs PCCL. OMC cyclical; YoC on capital unlocks token ADD ~65% prob." }
  @{ T="ITC"; N="ITC"; S="FMCG"; Q=3000; A=357.94; C=269; P="300-340"; Act="HOLD"; V="HOLD $MID YoC on capital $MID tier 5 SIP"; Sur="10%"; Val="Low"; ValWhy="Below PCCL and cost -25%. Dividend/YoC compounder; forward prob ~65% $MID accelerate band." }
  @{ T="ITCHOTELS"; N="ITC Hotels"; S="Hotels and Leisure"; Q=1185; A=223.38; C=220; P="190-210"; Act="HOLD"; V="HOLD $MID token SIP"; Sur="5-10%"; Val="Fair"; ValWhy="Near cost; +5-16% vs PCCL. Demerger/listing watch ~60% $MID token SIP." }
  @{ T="KOTAKBANK"; N="Kotak Mahindra Bank"; S="Banking and Finance"; Q=1250; A=351.28; C=403; P="320-360"; Act="HOLD"; V="HOLD legacy bank $MID slow SIP"; Sur="10%"; Val="Fair"; ValWhy="Quality bank; +12-26% vs PCCL. Legacy +15%; forward prob ~65% $MID slow SIP." }
  @{ T="KWIL"; N="Kwality Walls India"; S="FMCG"; Q=250; A=46.27; C=46; P="UNVERIFIED"; Act="HOLD"; V="HOLD $MID watch listing"; Sur="5%"; Val="Fair"; ValWhy="New listing; near cost. PCCL UNVERIFIED $MID watch only." }
  @{ T="LT"; N="Larsen and Toubro"; S="Infrastructure"; Q=175; A=2304.03; C=4093; P="3360"; Act="ADD"; V="**ADD** 18-25 sh/mo continuous"; Sur="15-20%"; Val="Fair"; ValWhy="Infra compounder; +22% vs PCCL. Order book visible; forward prob ~70% $MID salary ADD." }
  @{ T="LUPIN"; N="Lupin"; S="Pharma"; Q=32; A=775.12; C=2100; P="1800"; Act="HOLD"; V="HOLD legacy winner $MID token SIP"; Sur="5-10%"; Val="Fair"; ValWhy="Legacy +171%; +17% vs PCCL. US portfolio improving ~65% $MID token SIP." }
  @{ T="MARUTI"; N="Maruti Suzuki"; S="Auto"; Q=57; A=11155.83; C=13565; P="10000-11000"; Act="HOLD"; V="HOLD $MID token SIP"; Sur="5-10%"; Val="Expensive"; ValWhy="Auto leader priced for perfection; +23-36% vs PCCL. Forward prob ~60% $MID token SIP." }
  @{ T="MAXHEALTH"; N="Max Healthcare"; S="Healthcare"; Q=2000; A=655.84; C=1000; P="750"; Act="ADD"; V="**ADD** salary #1 $MID 15 sh/mo continuous"; Sur="25-30%"; Val="Fair"; ValWhy="Hospital compounder; +33% vs PCCL ok for quality. Forward bed/EPS prob ~70% $MID salary #1 ADD." }
  @{ T="MEDANTA"; N="Medanta"; S="Healthcare"; Q=212; A=1061.62; C=1200; P="950-1050"; Act="HOLD"; V="HOLD $MID slow SIP 6 sh/mo optional"; Sur="10%"; Val="Fair"; ValWhy="+13% legacy; +14-26% vs PCCL. Quality hospital ~65% $MID optional slow SIP." }
  @{ T="MOTHERSON"; N="Samvardhana Motherson"; S="Auto"; Q=1000; A=65.27; C=155; P="120-140"; Act="HOLD"; V="HOLD $MID slow SIP"; Sur="10%"; Val="Fair"; ValWhy="Legacy +137%; +11-29% vs PCCL. Global auto comp ~60% $MID slow SIP." }
  @{ T="MUTHOOTFIN"; N="Muthoot Finance"; S="Banking and Finance"; Q=125; A=1289.74; C=2972; P="1750-1800"; Act="HOLD"; V="HOLD $MID token SIP 1-2 sh/mo"; Sur="0-5%"; Val="Expensive"; ValWhy="+65% vs PCCL; gold/PAT peak. Forward PAT ~4-5% ~55% prob. Strong moat $MID token 1-2/mo not zero." }
  @{ T="ONGC"; N="Oil and Natural Gas Corp"; S="Oil and Gas"; Q=400; A=86.48; C=236; P="180-210"; Act="HOLD"; V="HOLD legacy $MID token SIP"; Sur="5%"; Val="Expensive"; ValWhy="Legacy +173%; E&P cyclical +12-31% vs PCCL. Oil price dependent ~55% $MID token." }
  @{ T="PNB"; N="PNB"; S="Banking and Finance"; Q=1563; A=48.69; C=118; P="95-105"; Act="HOLD"; V="HOLD $MID YoC gate $MID token only"; Sur="0-5%"; Val="Fair"; ValWhy="PSU; +12-24% vs PCCL. YoC 8% gate blocks scale; forward ~60% $MID token." }
  @{ T="RAAJINFRA"; N="Raajmarg Infra Investment"; S="Infrastructure"; Q=100; A=110.46; C=105; P="90-100"; Act="HOLD"; V="HOLD tiny $MID token SIP"; Sur="5%"; Val="Fair"; ValWhy="Tiny infra invIT; near PCCL. Immaterial weight $MID token." }
  @{ T="SBIN"; N="State Bank of India"; S="Banking and Finance"; Q=400; A=192.10; C=1050; P="880-950"; Act="HOLD"; V="HOLD $MID YoC $MID token SIP"; Sur="0-5%"; Val="Fair"; ValWhy="Legacy +446%; +10-19% vs PCCL. YoC ~9% trail; PSU ~60% $MID token SIP." }
  @{ T="SUNPHARMA"; N="Sun Pharmaceutical"; S="Pharma"; Q=180; A=532.74; C=698; P="580-650"; Act="HOLD"; V="HOLD quality $MID slow SIP"; Sur="10%"; Val="Fair"; ValWhy="Quality pharma; +7-20% vs PCCL. Forward prob ~65% $MID slow SIP." }
  @{ T="TATACONSUM"; N="Tata Consumer Products"; S="FMCG"; Q=600; A=783.11; C=1150; P="900-1000"; Act="HOLD"; V="HOLD $MID slow SIP"; Sur="10%"; Val="Fair"; ValWhy="Legacy +47%; +15-28% vs PCCL. Tata brand tea/coffee ~65% $MID slow SIP." }
  @{ T="TATAMOTORS"; N="Tata Motors CV"; S="Auto"; Q=830; A=146.84; C=487; P="350-420"; Act="HOLD"; V="HOLD legacy CV $MID token SIP"; Sur="5%"; Val="Expensive"; ValWhy="Legacy +231%; +16-39% vs PCCL. CV cyclical peak concern ~55% $MID token." }
  @{ T="TCS"; N="Tata Consultancy Services"; S="IT"; Q=299; A=3303.50; C=2302; P="2000-2200"; Act="PAUSE"; V="HOLD $MID AI threat $MID minimal SIP"; Sur="0%"; Val="Expensive"; ValWhy="Below cost -30% but AI structural headwind. +5-15% vs PCCL; forward prob ~50% $MID minimal SIP." }
  @{ T="TECHM"; N="Tech Mahindra"; S="IT"; Q=27; A=860.61; C=576; P="500-580"; Act="PAUSE"; V="HOLD $MID minimal SIP"; Sur="0-5%"; Val="Expensive"; ValWhy="Below cost -33%; turnaround unproven ~50% $MID minimal SIP." }
  @{ T="TMPV"; N="TMPV"; S="Auto"; Q=820; A=461.24; C=318; P="352"; Act="PAUSE"; V="HOLD $MID JLR watch $MID minimal SIP"; Sur="0-5%"; Val="Fair"; ValWhy="Price below PCCL -10% but JLR core-problem open ~45% $MID minimal SIP until clarity." }
  @{ T="UBL"; N="United Breweries"; S="Consumer"; Q=10; A=1041.30; C=1900; P="N/A"; Act="HOLD"; V="HOLD tiny"; Sur="5%"; Val="Expensive"; ValWhy="Legacy +82%; tiny weight. Beer premium priced $MID token." }
  @{ T="UJJIVANSFB"; N="Ujjivan Small Finance Bank"; S="Banking and Finance"; Q=3115; A=46.57; C=74; P="55-65"; Act="HOLD"; V="HOLD spec bank $MID token SIP capped"; Sur="5%"; Val="Expensive"; ValWhy="SFB spec; +14-34% vs PCCL. Legacy +59%; forward ~55% $MID capped token." }
  @{ T="WIPRO"; N="Wipro"; S="IT"; Q=200; A=267.83; C=181; P="160-190"; Act="PAUSE"; V="HOLD $MID minimal SIP"; Sur="0-5%"; Val="Fair"; ValWhy="Below cost -32%; near PCCL. Turnaround watch ~55% $MID minimal SIP." }
  @{ T="WONDERLA"; N="Wonderla Holidays"; S="Hotels and Leisure"; Q=50; A=170.75; C=720; P="N/A"; Act="HOLD"; V="HOLD tiny $MID token SIP"; Sur="5%"; Val="Very expensive"; ValWhy="Legacy +321%; leisure small-cap. Immaterial $MID token only." }
)

foreach ($s in $all) {
  if ($skip -contains $s.N) { Write-Output "Skip (manual): $($s.N)"; continue }
  $dir = Join-Path $base (Join-Path $s.S ($s.N))
  if (-not (Test-Path $dir)) { Write-Output "Missing: $($s.N)"; continue }

  $pcclLow = Parse-PcclLow $s.P
  $pcclHigh = Parse-PcclHigh $s.P
  $pcclMid = if ($pcclHigh -gt 0) { ($pcclLow + $pcclHigh) / 2 } else { $pcclLow }
  $tier = Get-TierNum $s.C $pcclLow
  $tierLabel = Get-TierLabel $tier
  $stance = Get-SipStance $tier $s.Act
  $pace = Get-MonthlyPace $tier $s.Q $s.Act
  $blend = Get-BlendedCeil $s.A $s.C $pcclMid
  $cost = [math]::Round($s.Q * $s.A, 0)
  $val = [math]::Round($s.Q * $s.C, 0)
  $ret = [math]::Round(($s.C - $s.A) / $s.A * 100, 1)
  $prem = if ($pcclLow -gt 0) { [math]::Round(($s.C - $pcclLow) / $pcclLow * 100, 0) } else { "N/A" }
  $pcclDisp = if ($s.P -match 'N/A|UNVERIFIED') { $s.P } else { "$INR$($s.P)" }
  $html = Get-TickerFile $s.T
  $paceTxt = if ($pace.Lo -eq $pace.Hi) { "$($pace.Lo) sh/mo" } else { "$($pace.Lo)-$($pace.Hi) sh/mo" }
  if ($pace.Lo -eq 0) { $paceTxt = "0 sh/mo (HOLD legacy only until thesis clears)" }

  $valView = $s.Val
  $valWhy = $s.ValWhy

  $summary = @"
# $($s.N) $EM Summary Analysis

**Ticker:** $($s.T) (NSE)  
**Analysis date:** $date  
**Sector:** $($s.S)

---

## Your position

| Metric | Value |
|--------|------:|
| Quantity | $($s.Q) shares |
| Avg cost | $INR$($s.A) |
| Cost basis | $INR$($cost.ToString('N0')) |
| CMP (approx.) | $INR$($s.C) |
| Current value | $INR$($val.ToString('N0')) |
| Return | $ret% |

---

## Verdict (one line)

**$($s.V)**

---

## Valuation tier @ CMP ($INR$($s.C))

| Metric | Value |
|--------|------:|
| PCCL anchor (pessimistic) | $pcclDisp |
| Premium to PCCL (low) | $prem% |
| **Tier (1-5)** | **$tier $EM $tierLabel** |
| **Current value @ CMP** | **$valView** |
| **Framework read (past + forward)** | $valWhy |
| **SIP stance** | $stance |
| **Monthly pace** | **$paceTxt** |
| **Blended avg ceiling** | **$INR$blend** |
| Surplus slice | $($s.Sur) |

*Continuous SIP doctrine $EM PCCL protects pace and book, not entry timing. See ``suggested-approach.md``.*

---

## Action summary

| Action | Detail |
|--------|--------|
| **HOLD** | All $($s.Q) shares (wealth mandate) |
| **Continuous SIP** | **$paceTxt** @ tier **$tier** |
| **Blended cap** | Pause pace upgrade if book avg nears **$INR$blend** |
| **Accelerate** | If price enters tier **5** (at/below PCCL) |
| **Surplus rank** | **$($s.Act)** $MID $($s.Sur) of monthly investable |

---

## Files

| File | Purpose |
|------|---------|
| ``summary-analysis.md`` | Quick reference |
| ``suggested-approach.md`` | Continuous SIP plan, tiers, caps |
| ``detail-analysis.md`` | Full framework |
| ``faq.md`` | Q&A |

**Refresh:** Q2 FY27 results or material news.
"@

  $maxAdds = if ($pace.Hi -gt 0) { [math]::Min([int]($pace.Hi * 12), [int][math]::Max(12, $s.Q / 10)) } else { 0 }
  $yrLo = $pace.Lo * 12
  $yrHi = $pace.Hi * 12

  $approach = @"
# $($s.N) $EM Suggested Approach

**Analysis date:** $date  
**For:** $($s.Q) shares @ $INR$($s.A)  
**Investor mandate:** Continuous salary SIP in quality names $MID **PCCL protects** pace + blended book

---

## Philosophy

``````
Wealth = Quantity x Time x Business quality
Nobody knows timing $EM SIP through sideways markets
PCCL = protection (pace + book floor), NOT wait-for-crash entry
``````

Cross-ref: ``pccl-analysis/continuous-sip-valuation-tiers.md``

---

## Valuation tier @ CMP ($INR$($s.C))

| Metric | Value | Tier |
|--------|------:|:----:|
| PCCL anchor | $pcclDisp | |
| Premium to PCCL | $prem% | |
| **Label** | **$tierLabel** | **$tier** |
| **Current value @ CMP** | **$valView** | |
| **SIP stance** | $stance | |
| **Monthly pace** | **$paceTxt** | |
| **Blended ceiling** | **$INR$blend** | |

---

## Current value @ CMP (framework view)

| Item | Assessment |
|------|------------|
| **Current value** | **$valView** |
| **Past performance** | Legacy return **$ret%** on your book |
| **Forward probability** | See framework read below |
| **Price vs PCCL** | **$prem%** vs pessimistic anchor |
| **Framework read** | $valWhy |
| **SIP implication** | **$paceTxt** $EM surplus **$($s.Sur)** |

---

## Default action

| | |
|--|--|
| **HOLD** | All $($s.Q) shares |
| **Tier @ CMP** | **$tier** $EM $tierLabel |
| **Current value @ CMP** | **$valView** |
| **Continuous SIP** | **$paceTxt** |
| **Surplus slice** | **$($s.Sur)** |
| **Surplus action** | **$($s.Act)** |

---

## Blended average protection

| Item | Value |
|------|------:|
| Your avg cost | $INR$($s.A) |
| Blended ceiling | $INR$blend |
| 12-mo adds (base) | +$yrLo to +$yrHi shares |
| End qty (approx.) | $($s.Q + $yrLo) to $($s.Q + $yrHi) |

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

@ CMP: **tier $tier** $EM **$paceTxt**

---

## New-tranche risk @ PCCL

| Buy @ CMP | PCCL low | Loss on new $INR if revisits PCCL |
|----------:|---------:|----------------------------------:|
| $INR$($s.C) | $INR$pcclLow | ~$([math]::Round(($pcclLow - $s.C) / $s.C * 100, 0))% on fresh tranche |

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
- [ ] $($pace.Note)

---

## One-page decision card

``````
HOLD $($s.Q) @ $INR$($s.A)
Current value: $valView (tier $tier SIP pace)
Tier $tier @ CMP: $paceTxt continuous
Blended cap: $INR$blend
Accelerate: at/below PCCL $pcclDisp
Surplus: $($s.Act) $($s.Sur)
PCCL protects $EM does not block SIP
``````

**Next refresh:** Q2 FY27 results.
"@

  $faq = @"
# $($s.N) $EM FAQ

**Ticker:** $($s.T) $MID **Updated:** $date

---

## Q1. What is the framework action?

**$($s.V)** $EM **HOLD** all shares; continuous SIP: **$paceTxt** (tier **$tier**).

---

## Q2. Should I wait for PCCL or a crash before adding?

**No.** Continuous salary SIP at **tier $tier** pace. PCCL ($pcclDisp) **protects** via pace + blended cap ($INR$blend) $EM not a wait target.

---

## Q3. Is CMP very expensive, expensive, fair, or low?

**$valView** $EM $valWhy

---

## Q4. What if the stock is expensive?

**HOLD** legacy. **Slow to token SIP** (tier 1-2) $EM never zero on Strong quality unless core-problem. Rank **fresh salary** using surplus slice **$($s.Sur)**.

---

## Q5. Where does this rank for salary capital?

**$($s.Act)** $EM **$($s.Sur)** of monthly investable. See ``quadrant-map.md``.

---

**Next refresh:** Q2 FY27 or user trade.
"@

  $htmlContent = @"
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>$($s.N) Report</title>
<style>body{font-family:Segoe UI,sans-serif;max-width:900px;margin:0 auto;padding:1.5rem;line-height:1.6}
.header{background:#1e40af;color:#fff;padding:1.5rem;border-radius:8px;margin-bottom:1rem}
table{width:100%;border-collapse:collapse;margin:1rem 0}th,td{border:1px solid #ddd;padding:8px}th{background:#f1f5f9}
.num{text-align:right}.tier{font-size:1.1em;font-weight:bold}</style></head><body>
<div class="header"><h1>$($s.N)</h1><p>$($s.T) $MID $date</p>
<p><strong>Current value:</strong> $valView $MID Tier $tier $EM $paceTxt</p></div>
<h2>Position</h2>
<table><tr><th>Metric</th><th class="num">Value</th></tr>
<tr><td>Qty</td><td class="num">$($s.Q)</td></tr>
<tr><td>Avg cost</td><td class="num">$INR$($s.A)</td></tr>
<tr><td>CMP</td><td class="num">$INR$($s.C)</td></tr>
<tr><td>PCCL</td><td class="num">$pcclDisp</td></tr>
<tr><td>Current value</td><td class="num">$valView</td></tr>
<tr><td>Premium</td><td class="num">$prem%</td></tr>
<tr><td>Blended cap</td><td class="num">$INR$blend</td></tr></table>
<h2>Action</h2><p>HOLD all shares. Continuous SIP: <strong>$paceTxt</strong>. PCCL protects pace $EM not entry timing.</p>
</body></html>
"@

  $utf8 = New-Object System.Text.UTF8Encoding $false
  foreach ($pair in @(
    @("summary-analysis.md", $summary),
    @("suggested-approach.md", $approach),
    @("faq.md", $faq),
    @($html, $htmlContent)
  )) {
    [System.IO.File]::WriteAllText((Join-Path $dir $pair[0]), $pair[1], $utf8)
  }
  Write-Output "Updated: $($s.S)/$($s.N) (tier $tier)"
}

Write-Output "Done: $($all.Count - $skip.Count) stocks (skipped: $($skip -join ', '))"
