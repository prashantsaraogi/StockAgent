# Batch report generator - 23 Aug 2026
# Uses Unicode char codes for Windows PowerShell compatibility
$INR = [char]0x20B9
$EM = [char]0x2014
$MID = [char]0x00B7

$date = "23 Aug 2026"
$base = "d:\D-Drive\Personal\My-agent\Report"

$stocks = @(
  @{ T="ICICIBANK"; N="ICICI Bank"; S="Banking and Finance"; Q=143; A=888.26; C=1420; R=59.9; W=1.3; V="**ADD** priority #1 $MID 5-8 sh/mo"; P="1,050-1,150"; Act="ADD" }
  @{ T="KOTAKBANK"; N="Kotak Mahindra Bank"; S="Banking and Finance"; Q=1250; A=351.28; C=403; R=14.7; W=3.2; V="HOLD legacy bank"; P="320-360"; Act="HOLD" }
  @{ T="UJJIVANSFB"; N="Ujjivan Small Finance Bank"; S="Banking and Finance"; Q=3115; A=46.57; C=74; R=58.7; W=1.4; V="HOLD $MID small bank spec $MID capped"; P="55-65"; Act="HOLD" }
  @{ T="BAJAJFINSV"; N="Bajaj Finserv"; S="Banking and Finance"; Q=60; A=1699.73; C=2033; R=19.6; W=0.8; V="HOLD $MID tiny weight"; P="1,600-1,750"; Act="HOLD" }
  @{ T="HDFCAMC"; N="HDFC Asset Management"; S="Banking and Finance"; Q=237; A=1500.98; C=2525; R=68.2; W=3.8; V="HOLD legacy $MID no add at CMP"; P="1,900-2,100"; Act="HOLD" }
  @{ T="HDFCLIFE"; N="HDFC Life Insurance"; S="Banking and Finance"; Q=650; A=619.19; C=555; R=-10.4; W=2.3; V="HOLD $MID below cost"; P="480-540"; Act="HOLD" }
  @{ T="GICRE"; N="General Insurance Corporation"; S="Banking and Finance"; Q=215; A=183.31; C=138; R=-24.9; W=0.2; V="HOLD $MID tiny"; P="110-130"; Act="HOLD" }
  @{ T="MEDANTA"; N="Medanta"; S="Healthcare"; Q=212; A=1061.62; C=1200; R=13.0; W=1.6; V="HOLD $MID optional 6 sh/mo"; P="950-1,050"; Act="HOLD" }
  @{ T="SUNPHARMA"; N="Sun Pharmaceutical"; S="Pharma"; Q=180; A=532.74; C=698; R=31.0; W=0.8; V="HOLD $MID quality pharma"; P="580-650"; Act="HOLD" }
  @{ T="GLENMARK"; N="Glenmark Pharma"; S="Pharma"; Q=5; A=196.67; C=2150; R=993.2; W=0.07; V="HOLD legacy tiny"; P="N/A tiny"; Act="HOLD" }
  @{ T="RAAJINFRA"; N="Raajmarg Infra Investment"; S="Infrastructure"; Q=100; A=110.46; C=105; R=-4.9; W=0.07; V="HOLD $MID ignore size"; P="90-100"; Act="HOLD" }
  @{ T="HEG"; N="HEG"; S="Infrastructure"; Q=100; A=157.22; C=711; R=352.1; W=0.4; V="HOLD $MID graphite cyclical"; P="400-500"; Act="HOLD" }
  @{ T="MARUTI"; N="Maruti Suzuki"; S="Auto"; Q=57; A=11155.83; C=13565; R=21.6; W=4.8; V="HOLD $MID no add at CMP"; P="10,000-11,000"; Act="HOLD" }
  @{ T="TATAMOTORS"; N="Tata Motors CV"; S="Auto"; Q=830; A=146.84; C=487; R=231.7; W=2.5; V="HOLD legacy CV"; P="350-420"; Act="HOLD" }
  @{ T="MOTHERSON"; N="Samvardhana Motherson"; S="Auto"; Q=1000; A=65.27; C=155; R=137.5; W=1.0; V="HOLD"; P="120-140"; Act="HOLD" }
  @{ T="BALKRISIND"; N="Balkrishna Industries"; S="Auto"; Q=21; A=1971.63; C=2351; R=19.2; W=0.3; V="HOLD tiny"; P="1,800-2,000"; Act="HOLD" }
  @{ T="EICHERMOT"; N="Eicher Motors"; S="Auto"; Q=3; A=2668.88; C=8057; R=201.9; W=0.15; V="HOLD tiny"; P="6,500-7,200"; Act="HOLD" }
  @{ T="ASHOKLEY"; N="Ashok Leyland"; S="Auto"; Q=100; A=40.21; C=173; R=330.2; W=0.11; V="HOLD tiny"; P="140-160"; Act="HOLD" }
  @{ T="TCS"; N="Tata Consultancy Services"; S="IT"; Q=299; A=3303.50; C=2302; R=-30.3; W=4.3; V="HOLD $MID **no add** (AI threat)"; P="2,000-2,200"; Act="PAUSE" }
  @{ T="INFY"; N="Infosys"; S="IT"; Q=435; A=1480.69; C=1121; R=-24.3; W=3.1; V="HOLD $MID **no add**"; P="1,050-1,200"; Act="PAUSE" }
  @{ T="HCLTECH"; N="HCL Technologies"; S="IT"; Q=360; A=1212.09; C=1303; R=7.5; W=2.9; V="HOLD $MID no add"; P="1,050-1,150"; Act="HOLD" }
  @{ T="WIPRO"; N="Wipro"; S="IT"; Q=200; A=267.83; C=181; R=-32.5; W=0.2; V="HOLD $MID no add"; P="160-190"; Act="PAUSE" }
  @{ T="TECHM"; N="Tech Mahindra"; S="IT"; Q=27; A=860.61; C=576; R=-33.1; W=0.1; V="HOLD $MID no add"; P="500-580"; Act="PAUSE" }
  @{ T="ITC"; N="ITC"; S="FMCG"; Q=3000; A=357.94; C=269; R=-24.7; W=5.1; V="HOLD $MID YoC dividend on capital"; P="300-340"; Act="HOLD" }
  @{ T="HINDUNILVR"; N="Hindustan Unilever"; S="FMCG"; Q=250; A=2422.40; C=2040; R=-15.8; W=3.2; V="HOLD $MID below cost"; P="1,800-2,000"; Act="HOLD" }
  @{ T="TATACONSUM"; N="Tata Consumer Products"; S="FMCG"; Q=600; A=783.11; C=1150; R=46.9; W=4.3; V="HOLD $MID slow DCA optional"; P="900-1,000"; Act="HOLD" }
  @{ T="KWIL"; N="Kwality Walls India"; S="FMCG"; Q=250; A=46.27; C=46; R=-0.6; W=0.07; V="HOLD $MID new listing watch"; P="UNVERIFIED"; Act="HOLD" }
  @{ T="BHARTIARTL"; N="Bharti Airtel"; S="Telecom"; Q=350; A=1079.71; C=1942; R=79.8; W=4.3; V="HOLD $MID slow add size-capped"; P="1,600-1,750"; Act="HOLD" }
  @{ T="IOC"; N="Indian Oil Corporation"; S="Oil and Gas"; Q=1003; A=66.66; C=136; R=103.9; W=0.9; V="**ADD** $MID YoC overlay $MID salary #5"; P="85-105"; Act="ADD" }
  @{ T="IGL"; N="Indraprastha Gas"; S="Oil and Gas"; Q=2050; A=212.49; C=151; R=-29.1; W=1.9; V="HOLD $MID below cost"; P="170-190"; Act="HOLD" }
  @{ T="ONGC"; N="Oil and Natural Gas Corp"; S="Oil and Gas"; Q=400; A=86.48; C=236; R=173.4; W=0.6; V="HOLD legacy"; P="180-210"; Act="HOLD" }
  @{ T="DELTACORP"; N="Delta Corp"; S="Hotels and Leisure"; Q=1560; A=132.50; C=60; R=-55.0; W=0.6; V="HOLD $MID **no add** legal overhang"; P="40-55"; Act="PAUSE" }
  @{ T="INDHOTEL"; N="Indian Hotels"; S="Hotels and Leisure"; Q=400; A=94.61; C=736; R=677.8; W=1.8; V="HOLD $MID add on dips only"; P="550-650"; Act="HOLD" }
  @{ T="ITCHOTELS"; N="ITC Hotels"; S="Hotels and Leisure"; Q=1185; A=223.38; C=220; R=-1.5; W=1.6; V="HOLD $MID watch listing"; P="190-210"; Act="HOLD" }
  @{ T="WONDERLA"; N="Wonderla Holidays"; S="Hotels and Leisure"; Q=50; A=170.75; C=720; R=321.7; W=0.2; V="HOLD tiny"; P="N/A"; Act="HOLD" }
  @{ T="HAVELLS"; N="Havells India"; S="Consumer"; Q=65; A=1049.42; C=1480; R=41.0; W=0.6; V="HOLD"; P="1,200-1,350"; Act="HOLD" }
  @{ T="UBL"; N="United Breweries"; S="Consumer"; Q=10; A=1041.30; C=1900; R=82.5; W=0.12; V="HOLD tiny"; P="N/A"; Act="HOLD" }
)

function Get-TickerFile($t) { ($t -replace ' ', '-').ToLower() + "-report.html" }

foreach ($s in $stocks) {
  $dir = Join-Path $base (Join-Path $s.S ($s.N))
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $cost = [math]::Round($s.Q * $s.A, 0)
  $val = [math]::Round($s.Q * $s.C, 0)
  $html = Get-TickerFile $s.T
  $pccl = if ($s.P -like "N/A*") { $s.P } else { "$INR$($s.P)" }

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
| Return | $($s.R)% |
| Portfolio weight | ~$($s.W)% |

---

## Verdict (one line)

**$($s.V)**

---

## PCCL / valuation (planning)

| Item | Value |
|------|------:|
| PCCL anchor (pessimistic) | $pccl |
| Action (surplus) | **$($s.Act)** |

*Refresh PCCL after quarterly results.*

---

## Action summary

| Action | Detail |
|--------|--------|
| **Legacy holding** | **HOLD** all shares (wealth mandate) |
| **New capital** | **$($s.Act)** $EM see ``suggested-approach.md`` |
| **If expensive / overweight** | **PAUSE ADDS** $EM never reduce legacy for valuation |

**Refresh:** Q2 FY27 results or material news.
"@

  $detail = @"
# $($s.N) $EM Detail Analysis

**Analysis date:** $date  
**Framework:** India Stock Investment Agent

---

## 1. Business snapshot

| Item | Note |
|------|------|
| Sector | $($s.S) |
| Franchise | Assess moat vs peers in sector report refresh |
| Q1 FY27 | Search latest results on refresh |

---

## 2. Your position math

| Metric | Value |
|--------|------:|
| Cost basis | $INR$cost |
| CMP | $INR$($s.C) |
| Return | $($s.R)% |
| Weight | ~$($s.W)% |

---

## 3. Valuation & PCCL

| Scenario | PCCL / IV |
|----------|----------|
| Pessimistic anchor | $pccl |
| @ CMP $INR$($s.C) | Compare premium to PCCL on refresh |

---

## 4. Framework verdict

**$($s.V)**

Long-term mandate: **HOLD** legacy; **ADD** with caps; **PAUSE ADDS** when expensive $EM existential exit only if Tier-1 breach (fraud, moat destroyed).

---

## 5. Dynamic allocation

See ``quadrant-map.md`` and ``dynamic-capital-allocation.md`` for sector surplus rank.

**Date checked:** $date
"@

  $addAction = switch ($s.Act) {
    "ADD"    { "**ADD** $EM deploy salary capital per caps" }
    "PAUSE"  { "**PAUSE ADDS** $EM HOLD legacy; wait for better entry or thesis clarity" }
    default  { "**HOLD** legacy $EM optional token DCA only if sized; rank fresh salary capital to higher names" }
  }

  $approach = @"
# $($s.N) $EM Suggested Approach

**Analysis date:** $date  
**Position:** $($s.Q) @ $INR$($s.A)  
**Investor mandate:** Long-term wealth builder $EM **HOLD** legacy $MID **ADD** only with size caps

---

## Default action

**$($s.V)**

| | |
|--|--|
| **HOLD** | All $($s.Q) shares |
| **New capital** | $addAction |
| **Surplus rank** | **$($s.Act)** |

---

## Decision card

HOLD $($s.Q) @ $INR$($s.A)
$($s.V)
PCCL anchor: $pccl
Refresh after Q2 FY27
"@

  $faq = @"
# $($s.N) $EM FAQ

**Ticker:** $($s.T) $MID **Updated:** $date

---

## Q1. What is the framework action?

**$($s.V)** $EM **HOLD** all shares; surplus action: **$($s.Act)**.

---

## Q2. What if the stock is expensive or overweight?

**HOLD** all $($s.Q) shares. Wealth path = quantity $MID time $EM not trading. If expensive: **PAUSE ADDS** on this name; deploy **fresh salary capital** to higher-ranked names in ``quadrant-map.md``.

---

## Q3. What is PCCL?

Planning anchor **$pccl** $EM refresh after quarterly results.

---

## Q4. Where does this rank for salary capital?

See ``quadrant-map.md`` and sector surplus table. **$($s.Act)** for fresh $INR.

---

**Next refresh:** Q2 FY27 or user trade.
"@

  $htmlContent = @"
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>$($s.N) Report</title>
<style>body{font-family:Segoe UI,sans-serif;max-width:900px;margin:0 auto;padding:1.5rem;line-height:1.6}
.header{background:#1e40af;color:#fff;padding:1.5rem;border-radius:8px;margin-bottom:1rem}
table{width:100%;border-collapse:collapse;margin:1rem 0}th,td{border:1px solid #ddd;padding:8px}th{background:#f1f5f9}
.num{text-align:right}</style></head><body>
<div class="header"><h1>$($s.N)</h1><p>$($s.T) $MID $date $MID $($s.S)</p>
<p><strong>$($s.V)</strong></p></div>
<h2>Position</h2>
<table><tr><th>Metric</th><th class="num">Value</th></tr>
<tr><td>Qty</td><td class="num">$($s.Q)</td></tr>
<tr><td>Avg cost</td><td class="num">$INR$($s.A)</td></tr>
<tr><td>CMP</td><td class="num">$INR$($s.C)</td></tr>
<tr><td>Return</td><td class="num">$($s.R)%</td></tr>
<tr><td>Weight</td><td class="num">~$($s.W)%</td></tr></table>
<h2>PCCL anchor</h2><p>$pccl</p>
<h2>Action</h2><p><strong>HOLD</strong> $($s.Q) shares $MID <strong>$($s.Act)</strong> for new capital (wealth mandate).</p>
</body></html>
"@

  $utf8 = New-Object System.Text.UTF8Encoding $false
  foreach ($pair in @(
    @("summary-analysis.md", $summary),
    @("detail-analysis.md", $detail),
    @("suggested-approach.md", $approach),
    @("faq.md", $faq),
    @($html, $htmlContent)
  )) {
    [System.IO.File]::WriteAllText((Join-Path $dir $pair[0]), $pair[1], $utf8)
  }
  Write-Output "Created: $($s.S)/$($s.N)"
}

Write-Output "Done: $($stocks.Count) stocks"
