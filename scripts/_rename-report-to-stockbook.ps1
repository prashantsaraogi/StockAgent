# Rename Report -> StockBook across repository
$ErrorActionPreference = 'Stop'
$root = 'd:\D-Drive\Personal\My-agent'
Set-Location $root

$oldDir = Join-Path $root 'Report'
$newDir = Join-Path $root 'StockBook'

if (-not (Test-Path $oldDir)) {
    if (Test-Path $newDir) { Write-Host 'StockBook already exists'; exit 0 }
    throw 'StockBook folder not found'
}

if (Test-Path $newDir) { throw 'StockBook already exists - abort' }

Rename-Item -Path $oldDir -NewName 'StockBook'
Write-Host 'Renamed folder: Report -> StockBook'

# Rename combine script for consistency
$oldScript = Join-Path $newDir '_combine-stockbook-md-to-html.ps1'
$newScript = Join-Path $newDir '_combine-stockbook-md-to-html.ps1'
if (Test-Path $oldScript) {
    Rename-Item $oldScript '_combine-stockbook-md-to-html.ps1'
    Write-Host 'Renamed script: _combine-stockbook-md-to-html.ps1 -> _combine-stockbook-md-to-html.ps1'
}

$extensions = @('*.md', '*.mdc', '*.ps1', '*.html', '*.txt', '*.json', '*.doc')
$files = Get-ChildItem -Path $root -Recurse -File -Include $extensions |
    Where-Object { $_.FullName -notmatch '\\\.git\\' }

function Update-Content($text) {
    $text = $text -replace 'StockBook/', 'StockBook/'
    $text = $text -replace 'StockBook\\', 'StockBook\'
    $text = $text -replace '# Report —', '# StockBook —'
    $text = $text -replace '# StockBook -', '# StockBook -'
    $text = $text -replace 'StockBook folder', 'StockBook folder'
    $text = $text -replace 'StockBook folders', 'StockBook folders'
    $text = $text -replace 'StockBook write-back', 'StockBook write-back'
    $text = $text -replace 'write back to StockBook', 'write back to StockBook'
    $text = $text -replace 'update StockBook in', 'update StockBook in'
    $text = $text -replace 'update StockBook/', 'update StockBook/'
    $text = $text -replace 'Create `StockBook/', 'Create `StockBook/'
    $text = $text -replace 'save StockBook', 'save StockBook'
    $text = $text -replace 'existing StockBook', 'existing StockBook'
    $text = $text -replace 'in-scope StockBook', 'in-scope StockBook'
    $text = $text -replace 'StockBook browser', 'StockBook browser'
    $text = $text -replace 'StockBook/README', 'StockBook/README'
    $text = $text -replace '_combine-report-md-to-html\.ps1', '_combine-stockbook-md-to-html.ps1'
    $text = $text -replace 'When to read ``StockBook/', 'When to read ``StockBook/'  # unlikely
    $text = $text -replace 'When to create or update ``StockBook/', 'When to create or update ``StockBook/'
    $text = $text -replace 'Do not use in StockBook action', 'Do not use in StockBook action'
    $text = $text -replace 'StockBook action vocabulary', 'StockBook action vocabulary'
    return $text
}

$count = 0
foreach ($file in $files) {
    $raw = [System.IO.File]::ReadAllText($file.FullName)
    $updated = Update-Content $raw
    if ($updated -ne $raw) {
        [System.IO.File]::WriteAllText($file.FullName, $updated)
        $count++
    }
}

Write-Host "Updated $count files"

# Verify no StockBook/ path refs left (excluding *-report.html filenames in content is ok)
$remaining = Select-String -Path (Get-ChildItem -Path $root -Recurse -File -Include $extensions | ForEach-Object FullName) -Pattern 'StockBook/' -SimpleMatch -ErrorAction SilentlyContinue |
    Where-Object { $_.Line -notmatch '-StockBook\.html' -and $_.Line -notmatch 'generate report' -and $_.Line -notmatch 'HTML report' -and $_.Line -notmatch 'broker report' -and $_.Line -notmatch 'status report' -and $_.Line -notmatch 'full report' -and $_.Line -notmatch 'stock report' -and $_.Line -notmatch 'each report' -and $_.Line -notmatch 'per report' }
Write-Host "Remaining StockBook/ references (review): $($remaining.Count)"
$remaining | Select-Object -First 15 | ForEach-Object { Write-Host "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" }
