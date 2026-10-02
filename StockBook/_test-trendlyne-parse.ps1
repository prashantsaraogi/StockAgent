$r = Invoke-WebRequest -Uri 'https://trendlyne.com/research-reports/stock/187/BHARTIARTL/bharti-airtel-ltd/' -UseBasicParsing -Headers @{ 'User-Agent' = 'Mozilla/5.0' } -TimeoutSec 30
Write-Host "Len:" $r.Content.Length
Write-Host "Jefferies:" ($r.Content -match 'Jefferies')
Write-Host "ICICI Sec:" ($r.Content -match 'ICICI Securities')
$rowRx = '\|\s*(?:\|\s*)?(\d{1,2}\s+\w{3}\s+\d{4})\s*\|\s*[^|]+\|\s*([^|]+?)\s*\|\s*([\d,.]+)\s*\|\s*([\d,.]+)\s*\|'
$m = [regex]::Matches($r.Content, $rowRx)
Write-Host "Row matches:" $m.Count
if ($m.Count -gt 0) {
    $m | Select-Object -First 5 | ForEach-Object { Write-Host $_.Groups[2].Value.Trim() $_.Groups[4].Value }
}
