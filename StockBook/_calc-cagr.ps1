# StockBook/_calc-cagr.ps1
# Calculate holding CAGR from buy date to CMP date.
# Usage:
#   .\StockBook\_calc-cagr.ps1 -BuyPrice 775.31 -BuyDate '2025-04-01' -Cmp 711 -CmpDate '2026-08-27'
#   .\StockBook\_calc-cagr.ps1 -BuyPrice 775.31 -BuyDate '2025-04-01' -Cmp 711  # CmpDate defaults to today

param(
    [Parameter(Mandatory = $true)]
    [double]$BuyPrice,

    [Parameter(Mandatory = $true)]
    [string]$BuyDate,

    [Parameter(Mandatory = $true)]
    [double]$Cmp,

    [string]$CmpDate = (Get-Date -Format 'yyyy-MM-dd')
)

$start = [datetime]::ParseExact($BuyDate, 'yyyy-MM-dd', $null)
$end = [datetime]::ParseExact($CmpDate, 'yyyy-MM-dd', $null)
$days = ($end - $start).Days

if ($days -le 0) {
    Write-Error "CMP date must be after buy date."
    exit 1
}

$years = $days / 365.25
$ratio = $Cmp / $BuyPrice
$simplePct = ($ratio - 1) * 100
$cagrPct = ([math]::Pow($ratio, 1 / $years) - 1) * 100

[pscustomobject]@{
    BuyDate     = $BuyDate
    BuyPrice    = $BuyPrice
    Cmp         = $Cmp
    CmpDate     = $CmpDate
    DaysHeld    = $days
    YearsHeld   = [math]::Round($years, 4)
    SimplePct   = [math]::Round($simplePct, 2)
    CAGRPct     = [math]::Round($cagrPct, 2)
}
