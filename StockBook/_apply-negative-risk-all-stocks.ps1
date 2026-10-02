# Create external-negative-risk.md + internal-negative-risk.md for all Report holdings
# Exemplar (skip overwrite): Larsen and Toubro
$date = '25 Aug 2026'
$base = 'd:\D-Drive\Personal\My-agent\Report'
$skipNames = @('Larsen and Toubro')
$utf8 = New-Object System.Text.UTF8Encoding $false
$EM = [char]0x2014
$MID = [char]0x00B7

function Get-BaseGrowth($t, $s) {
  switch ($t) {
    'LT' { return '12-15% CAGR' }
    'MAXHEALTH' { return '18-22% CAGR' }
    'ICICIBANK' { return '14-18% CAGR' }
    'HDFCBANK' { return '12-16% CAGR' }
    'TCS' { return '8-12% CAGR' }
    'INFY' { return '8-12% CAGR' }
    'ITC' { return '10-14% CAGR (ex hotels)' }
    'MARUTI' { return '10-14% CAGR' }
    'BHARTIARTL' { return '15-20% CAGR' }
    default {
      switch -Regex ($s) {
        'IT' { return '8-12% CAGR' }
        'Bank|Finance|NBFC|Insurance' { return '12-18% CAGR' }
        'Healthcare' { return '15-20% CAGR' }
        'Pharma|FMCG' { return '10-15% CAGR' }
        'Auto' { return '10-15% CAGR' }
        'Oil' { return '5-12% CAGR (cyclical)' }
        'Infrastructure' { return '10-15% CAGR' }
        'Telecom' { return '12-18% CAGR' }
        'Hotels|Leisure' { return '12-18% CAGR' }
        default { return '10-15% CAGR (ASSUMPTION)' }
      }
    }
  }
}

function Get-ExternalBody($t, $n, $s) {
  $rows = switch -Regex ($s) {
    'Infrastructure' {
      @(
        '| **E1** | Middle East / geopolitical tension | Geopolitical | **L1-L2** | **-2 to -5 pp** | ME project delays; logistics; insurance | Monitor News geo |'
        '| **E2** | Oil / commodity inflation (Brent >$90) | Commodity | **L1-L2** | **-1 to -4 pp** | Input costs; client capex deferral | News 25 Aug |'
        '| **E3** | RBI rates / inflation | Policy | **L1-L2** | **-1 to -3 pp** | WC cost; private capex | Hawkish MPC |'
        '| **E4** | INR / FX | FX | **L1** | **-0 to -2 pp** | Imported kit cost | RBI intervention |'
      )
    }
    'IT' {
      @(
        '| **E1** | US / global tech demand slowdown | Macro | **L1-L2** | **-2 to -5 pp** | Client IT budget cuts | US tech selloff Aug 2026 |'
        '| **E2** | USD-INR / onsite wage inflation | FX / labour | **L1** | **-0 to -2 pp** | Margin on offshore delivery | Monitor |'
        '| **E3** | Visa / immigration policy (US/EU) | Policy | **L1-L2** | **-1 to -3 pp** | Onshore mix cost | HYPOTHESIS |'
        '| **E4** | FPI risk-off on IT sector | Market | **L1** | **-0 to -1 pp** | Multiple only | GIFT Nifty cautious |'
      )
    }
    'Bank|Finance|NBFC|Insurance' {
      @(
        '| **E1** | RBI hawkish / NIM compression | Policy | **L1-L2** | **-1 to -4 pp** | Funding cost; transmission lag | Repo 5.25% |'
        '| **E2** | Credit cycle / asset quality downturn | Macro | **L2** | **-3 to -7 pp** | Slippages; provisioning | Monitor RBI credit |'
        '| **E3** | INR volatility / liquidity | FX | **L1** | **-0 to -2 pp** | Treasury / FX book | FACT |'
        '| **E4** | Regulatory change (Basel, NBFC rules) | Policy | **L1-L2** | **-1 to -3 pp** | Capital / growth cap | UNVERIFIED |'
      )
    }
    'Oil' {
      @(
        '| **E1** | Crude price spike / OMC under-recovery | Commodity | **L2** | **-3 to -8 pp** | Marketing margin squeeze | Brent ~$92 |'
        '| **E2** | Geopolitical (Iran, Hormuz) | Geopolitical | **L1-L3** | **-2 to -10 pp** | Import cost; CGD input | Operation Economic Outcast |'
        '| **E3** | Delhi / state EV-CNG policy | Policy | **L2** | **-3 to -6 pp** (IGL) | Volume mix shift | Structural for IGL |'
        '| **E4** | INR weakness | FX | **L1** | **-0 to -2 pp** | Import parity | Monitor |'
      )
    }
    'Auto' {
      @(
        '| **E1** | Commodity / input cost inflation | Commodity | **L1-L2** | **-2 to -5 pp** | Material margin (Maruti Q1 PAT -9%) | FACT sector |'
        '| **E2** | Oil / fuel prices (demand elasticity) | Commodity | **L1** | **-0 to -2 pp** | PV/2W demand | Brent >$90 |'
        '| **E3** | SIAM volume slowdown | Sector | **L1-L2** | **-2 to -4 pp** | Utilisation | Monthly SIAM |'
        '| **E4** | EV policy / FAME | Policy | **L1-L2** | **-1 to -4 pp** | ICE mix | Structural watch |'
      )
    }
    'Healthcare' {
      @(
        '| **E1** | Regulatory cap on procedures / drugs | Policy | **L1-L2** | **-1 to -4 pp** | ARPOB ceiling | Monitor NPPA/state |'
        '| **E2** | Medical inflation / doctor cost | Macro | **L1** | **-0 to -2 pp** | Margin | ASSUMPTION |'
        '| **E3** | Pandemic / occupancy shock | Event | **L3** (tail) | **-8+ pp** | Occupancy collapse | Low prob |'
      )
    }
    'Pharma' {
      @(
        '| **E1** | US FDA / pricing pressure | Regulatory | **L1-L2** | **-2 to -5 pp** | US generics margin | Company-specific |'
        '| **E2** | INR appreciation vs USD exports | FX | **L1** | **-0 to -2 pp** | Export realisation | Monitor |'
        '| **E3** | China API supply / cost | Supply chain | **L1-L2** | **-1 to -3 pp** | COGS | Sector |'
      )
    }
    'FMCG' {
      @(
        '| **E1** | Rural demand weakness | Macro | **L1-L2** | **-1 to -4 pp** | Volume growth | GDP/macro |'
        '| **E2** | Palm oil / commodity input | Commodity | **L1** | **-0 to -2 pp** | Gross margin | ASSUMPTION |'
        '| **E3** | GST / excise / tobacco regulation (ITC) | Policy | **L1-L2** | **-1 to -5 pp** | Segment mix | ITC-specific |'
      )
    }
    'Telecom' {
      @(
        '| **E1** | Regulatory tariff / AGR | Policy | **L2** | **-3 to -6 pp** | Revenue per user | Monitor TRAI |'
        '| **E2** | 5G capex / spectrum cost | Sector | **L1-L2** | **-1 to -4 pp** | FCF; ROCE | Duopoly stable |'
        '| **E3** | INR / equipment import | FX | **L1** | **-0 to -2 pp** | Capex cost | Monitor |'
      )
    }
    'Hotels|Leisure' {
      @(
        '| **E1** | Geo / travel demand shock | Macro | **L2-L3** | **-5 to -12 pp** | Occupancy/RevPAR | ME tension |'
        '| **E2** | GST / gaming regulation (Delta) | Policy | **L2-L3** | **-5 to -15 pp** | Licence revenue | Legal overhang |'
        '| **E3** | Consumer discretionary slowdown | Macro | **L1-L2** | **-2 to -4 pp** | Leisure spend | Monitor |'
      )
    }
    default {
      @(
        '| **E1** | India GDP / consumption slowdown | Macro | **L1-L2** | **-1 to -4 pp** | Revenue volume | GDP 6.7% |'
        '| **E2** | Inflation / rates | Macro | **L1** | **-0 to -2 pp** | Margin / demand | RBI 5.25% |'
        '| **E3** | INR / commodity | FX | **L1** | **-0 to -2 pp** | Input cost | Monitor |'
      )
    }
  }
  return ($rows -join "`n")
}

function Get-InternalBody($t, $n, $s) {
  $extra = switch ($t) {
    'HDFCBANK' {
      @(
        '| **I1** | Post-merger integration / HDFC Ltd | Execution | **L1-L2** | **-2 to -5 pp** | NIM, asset mix, cost synergies | FACT — ongoing |'
        '| **I2** | Governance / branch conduct overlay | Governance | **L1-L2** | **-1 to -4 pp** | Trust; growth pace | Live-search banks |'
      )
    }
    'ICICIBANK' { @('| **I1** | Bakhshi-era execution / growth vs risk | Governance | **L1** | **-0 to -2 pp** | Asset quality discipline | Monitor |') }
    'TCS' {
      @(
        '| **I1** | **GenAI disruption** — legacy services pricing | Structural / tech | **L2-L3** | **-4 to -10 pp** | Headcount-led model pressure | IT outlook 2026 |'
        '| **I2** | Client concentration / deal slippage | Execution | **L1-L2** | **-2 to -4 pp** | Revenue visibility | Quarterly |'
      )
    }
    'INFY' { @('| **I1** | **AI automation** on application services | Structural / tech | **L2** | **-3 to -7 pp** | Offshore FTE productivity | IT outlook 2026 |') }
    'HCLTECH' { @('| **I1** | AI impact on ER&D / software mix | Structural | **L1-L2** | **-2 to -5 pp** | Productivity vs pricing | Monitor |') }
    'WIPRO' { @('| **I1** | Turnaround execution risk | Execution | **L2** | **-3 to -6 pp** | Deal wins vs attrition | PAUSE surplus |') }
    'TECHM' { @('| **I1** | Telecom vertical + turnaround | Execution | **L2** | **-3 to -6 pp** | Margin recovery unproven | PAUSE |') }
    'DELTACORP' { @('| **I1** | **GST / casino legal overhang** | Legal | **L3** | **-10+ pp** | Licence / tax demand | Legal register |') }
    'IGL' { @('| **I1** | **CNG volume / Delhi EV policy** | Structural | **L2** | **-3 to -7 pp** | Volume growth ceiling | Dual-axis diverge |') }
    'TMPV' { @('| **I1** | JLR / PV turnaround; Q1 PAT collapse | Execution | **L2-L3** | **-5 to -12 pp** | Loss quarters | Pause adds |') }
    'MARUTI' { @('| **I1** | Margin vs volume (Q1 PAT -9% YoY) | Execution | **L1-L2** | **-2 to -5 pp** | Material cost pass-through | Q1 FY27 |') }
    'MUTHOOTFIN' { @('| **I1** | Gold loan regulation / LTV rules | Regulatory | **L1-L2** | **-2 to -5 pp** | AUM growth cap | RBI NBFC |') }
    'HDFCAMC' { @('| **I1** | AMC flow cyclicality / peak AUM | Cycle | **L1-L2** | **-2 to -5 pp** | Fee income | Very expensive tier |') }
    default { @() }
  }
  $baseRows = switch -Regex ($s) {
    'Bank|Finance|NBFC|Insurance' {
      @(
        '| **I1** | Asset quality / slippage spike | Credit | **L2** | **-3 to -7 pp** | Credit costs | Quarterly |'
        '| **I2** | Governance / fraud / branch conduct | Governance | **L2-L3** | **-5 to -15 pp** | Existential for banks | Live-search |'
        '| **I3** | ALM / liquidity mismatch | Balance sheet | **L2** | **-3 to -6 pp** | NIM + growth | Monitor |'
      )
    }
    'IT' {
      @(
        '| **I1** | **AI / GenAI** pricing & productivity | Structural | **L2-L3** | **-4 to -10 pp** | Moat erosion risk | indian-it-ai-outlook-2026 |'
        '| **I2** | Attrition / wage inflation | Operations | **L1** | **-0 to -2 pp** | Margin | Quarterly |'
        '| **I3** | Client bankruptcy / deal cancel | Concentration | **L1-L2** | **-2 to -4 pp** | Revenue | Monitor |'
      )
    }
    default {
      @(
        '| **I1** | Execution / margin miss vs guidance | Execution | **L1-L2** | **-2 to -5 pp** | EPS vs consensus | Quarterly |'
        '| **I2** | Balance sheet stress (debt, WC) | Balance sheet | **L1-L2** | **-2 to -4 pp** | ROCE / FCF | Exclusion guards |'
        '| **I3** | Governance / promoter / RPT | Governance | **L2-L3** | **-5+ pp** | Trust premium loss | Live-search |'
        '| **I4** | Competitive share loss | Competition | **L1-L2** | **-1 to -4 pp** | Moat | Sector data |'
      )
    }
  }
  $all = @()
  if ($extra.Count -gt 0) { $all += $extra }
  $all += $baseRows
  # dedupe by first column rough - for IT skip generic I1 if TCS/INFY have specific
  if ($t -in @('TCS','INFY','HCLTECH','WIPRO','TECHM') -and $extra.Count -gt 0) {
    $all = $extra + ($baseRows | Select-Object -Skip 1)
  }
  return ($all -join "`n")
}

function Build-External($t, $n, $s) {
  $bg = Get-BaseGrowth $t $s
  $body = Get-ExternalBody $t $n $s
  @"
# $n ($t) $EM External negative risk register

**Analysis date:** $date  
**Scope:** Macro $MID geopolitical $MID policy $MID sector $MID commodity $MID FX  
**Pair file:** ``internal-negative-risk.md``  
**Base-case sustainable EPS growth:** **$bg**

Cross-ref: ``News/TICKER-INDEX.md`` $MID latest ``News/YYYY-MM/DD/summary.md``

---

## Three-level impact scale (growth rate)

| Level | Label | **Growth haircut** | Duration | Structural vs temporary | Framework action |
|:-----:|-------|-------------------|----------|------------------------|------------------|
| **L1** | Low | **0-2 pp** | <4 quarters | Temporary | **HOLD** pace |
| **L2** | Medium | **3-7 pp** | 1-3 years | Mixed | **Slow SIP** |
| **L3** | High | **>=8 pp** | Structural | Permanent sector shock | **PCCL cut / EXIT** |

---

## Risk register $EM external

| # | Risk | Type | Level | Growth impact | Transmission to $t | Status ($date) |
|---|------|------|:-----:|---------------|-------------------|----------------|
$body

---

## Combined external stress (scenario)

| Scenario | Trigger combo | Level | EPS growth band | PCCL / action |
|----------|---------------|:-----:|-----------------|---------------|
| **Base** | Thesis intact | — | **$bg** | Per suggested-approach |
| **Stress A** | One external L2 | **L2** | Haircut 3-7 pp | Slow SIP |
| **Stress B** | External L3 tail | **L3** | Haircut >=8 pp | Pause surplus $MID PCCL review |

---

## Monitoring checklist

- [ ] Latest ``News/`` summary for $t
- [ ] Sector KPI / commodity / FX / rates
- [ ] Upgrade level if headline persists 30+ days

**Next refresh:** Quarterly results or material news.

"@
}

function Build-Internal($t, $n, $s) {
  $bg = Get-BaseGrowth $t $s
  $body = Get-InternalBody $t $n $s
  @"
# $n ($t) $EM Internal negative risk register

**Analysis date:** $date  
**Scope:** Governance $MID execution $MID balance sheet $MID competition $MID technology $MID legal  
**Pair file:** ``external-negative-risk.md``  
**Base-case sustainable EPS growth:** **$bg**

Cross-ref: ``management-governance-analysis`` $MID ``structural-threat-analysis`` $MID ``legal-threat-analysis``

---

## Three-level impact scale (growth rate)

| Level | Label | **Growth haircut** | Duration | Structural vs temporary | Framework action |
|:-----:|-------|-------------------|----------|------------------------|------------------|
| **L1** | Low | **0-2 pp** | <4 quarters | Temporary | **HOLD** pace |
| **L2** | Medium | **3-7 pp** | 1-3 years | Partial structural | **Slow SIP** |
| **L3** | High | **>=8 pp** | Structural / fraud | Moat destroyed | **EXIT** review |

---

## Risk register $EM internal

| # | Risk | Type | Level | Growth impact | Evidence / trigger | Status ($date) |
|---|------|------|:-----:|---------------|-------------------|----------------|
$body

---

## Combined internal stress (scenario)

| Scenario | Trigger | Level | EPS growth band | PCCL / action |
|----------|---------|:-----:|-----------------|---------------|
| **Base** | Management executes | — | **$bg** | Per suggested-approach |
| **Stress** | Internal L2–L3 materialises | **L2–L3** | See rows | Pause / PCCL cut |

---

## Monitoring checklist

- [ ] Quarterly results vs normalized EPS
- [ ] Governance / legal / AI KPIs (sector-specific)
- [ ] Worst-of vs ``external-negative-risk.md``

**Next refresh:** Quarterly results.

"@
}

$all = @(
  @{ T='ASHOKLEY'; N='Ashok Leyland'; S='Auto' }
  @{ T='BAJAJFINSV'; N='Bajaj Finserv'; S='Banking and Finance' }
  @{ T='BALKRISIND'; N='Balkrishna Industries'; S='Auto' }
  @{ T='BANKINDIA'; N='Bank of India'; S='Banking and Finance' }
  @{ T='BHARTIARTL'; N='Bharti Airtel'; S='Telecom' }
  @{ T='CIPLA'; N='Cipla'; S='Pharma' }
  @{ T='DELTACORP'; N='Delta Corp'; S='Hotels and Leisure' }
  @{ T='EICHERMOT'; N='Eicher Motors'; S='Auto' }
  @{ T='FORTIS'; N='Fortis Healthcare'; S='Healthcare' }
  @{ T='GICRE'; N='General Insurance Corporation'; S='Banking and Finance' }
  @{ T='GLENMARK'; N='Glenmark Pharma'; S='Pharma' }
  @{ T='HAVELLS'; N='Havells India'; S='Consumer' }
  @{ T='HCLTECH'; N='HCL Technologies'; S='IT' }
  @{ T='HDFCAMC'; N='HDFC Asset Management'; S='Banking and Finance' }
  @{ T='HDFCBANK'; N='HDFC Bank'; S='Banking and Finance' }
  @{ T='HDFCLIFE'; N='HDFC Life Insurance'; S='Banking and Finance' }
  @{ T='HEG'; N='HEG'; S='Infrastructure' }
  @{ T='HEROMOTOCO'; N='Hero MotoCorp'; S='Auto' }
  @{ T='HINDUNILVR'; N='Hindustan Unilever'; S='FMCG' }
  @{ T='ICICIBANK'; N='ICICI Bank'; S='Banking and Finance' }
  @{ T='IGL'; N='Indraprastha Gas'; S='Oil and Gas' }
  @{ T='INDHOTEL'; N='Indian Hotels'; S='Hotels and Leisure' }
  @{ T='INFY'; N='Infosys'; S='IT' }
  @{ T='IOC'; N='Indian Oil Corporation'; S='Oil and Gas' }
  @{ T='ITC'; N='ITC'; S='FMCG' }
  @{ T='ITCHOTELS'; N='ITC Hotels'; S='Hotels and Leisure' }
  @{ T='KOTAKBANK'; N='Kotak Mahindra Bank'; S='Banking and Finance' }
  @{ T='KWIL'; N='Kwality Walls India'; S='FMCG' }
  @{ T='LT'; N='Larsen and Toubro'; S='Infrastructure' }
  @{ T='LUPIN'; N='Lupin'; S='Pharma' }
  @{ T='MARUTI'; N='Maruti Suzuki'; S='Auto' }
  @{ T='MAXHEALTH'; N='Max Healthcare'; S='Healthcare' }
  @{ T='MEDANTA'; N='Medanta'; S='Healthcare' }
  @{ T='MOTHERSON'; N='Samvardhana Motherson'; S='Auto' }
  @{ T='MUTHOOTFIN'; N='Muthoot Finance'; S='Banking and Finance' }
  @{ T='ONGC'; N='Oil and Natural Gas Corp'; S='Oil and Gas' }
  @{ T='PNB'; N='PNB'; S='Banking and Finance' }
  @{ T='RAAJINFRA'; N='Raajmarg Infra Investment'; S='Infrastructure' }
  @{ T='SBIN'; N='State Bank of India'; S='Banking and Finance' }
  @{ T='SUNPHARMA'; N='Sun Pharmaceutical'; S='Pharma' }
  @{ T='TATACONSUM'; N='Tata Consumer Products'; S='FMCG' }
  @{ T='TATAMOTORS'; N='Tata Motors CV'; S='Auto' }
  @{ T='TCS'; N='Tata Consultancy Services'; S='IT' }
  @{ T='TECHM'; N='Tech Mahindra'; S='IT' }
  @{ T='TMPV'; N='TMPV'; S='Auto' }
  @{ T='UBL'; N='United Breweries'; S='Consumer' }
  @{ T='UJJIVANSFB'; N='Ujjivan Small Finance Bank'; S='Banking and Finance' }
  @{ T='WIPRO'; N='Wipro'; S='IT' }
  @{ T='WONDERLA'; N='Wonderla Holidays'; S='Hotels and Leisure' }
)

$created = 0
$skipped = 0
foreach ($s in $all) {
  $dir = Join-Path $base (Join-Path $s.S ($s.N))
  if (-not (Test-Path $dir)) { Write-Host "Missing: $($s.N)"; continue }
  if ($skipNames -contains $s.N) { $skipped++; Write-Host "Skip exemplar: $($s.N)"; continue }
  $ext = Join-Path $dir 'external-negative-risk.md'
  $int = Join-Path $dir 'internal-negative-risk.md'
  [System.IO.File]::WriteAllText($ext, (Build-External $s.T $s.N $s.S), $utf8)
  [System.IO.File]::WriteAllText($int, (Build-Internal $s.T $s.N $s.S), $utf8)
  $created += 2
  Write-Host "OK: $($s.T)"
}
Write-Host "Created/updated: $created files | Skipped exemplar: $skipped"
