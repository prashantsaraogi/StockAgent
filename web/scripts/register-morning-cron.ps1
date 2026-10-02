# Register Windows Task Scheduler - daily market pack @ 8:00 AM (local timezone)
# Run once from PowerShell:
#   cd web
#   .\scripts\register-morning-cron.ps1
#
# Prerequisites: Node/npm on PATH; CRON_TENANT_ID in web\.env.local

$ErrorActionPreference = 'Stop'
$WebRoot = Split-Path $PSScriptRoot -Parent
$TaskName = 'MyAgent-DailyMarketPack-8AM'
$At = '08:00'

$npmCmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
if ($npmCmd) {
  $npm = $npmCmd.Source
} else {
  $npmCmd2 = Get-Command npm -ErrorAction SilentlyContinue
  if (-not $npmCmd2) {
    throw 'npm not found on PATH - install Node.js first.'
  }
  $npm = $npmCmd2.Source
}

$Action = New-ScheduledTaskAction -Execute $npm -Argument 'run daily-market-pack' -WorkingDirectory $WebRoot
$Trigger = New-ScheduledTaskTrigger -Daily -At $At
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Principal $Principal -Force | Out-Null

Write-Host ''
Write-Host "Scheduled task registered: $TaskName"
Write-Host "  Time:     daily at $At (machine local time - use IST timezone for 8 AM IST)"
Write-Host "  Command:  npm run daily-market-pack"
Write-Host "  Folder:   $WebRoot"
Write-Host ''
Write-Host 'Ensure web\.env.local has:'
Write-Host '  CRON_TENANT_ID=<your Supabase user uuid>'
Write-Host '  CRON_SECRET=<optional - for HTTP cron only>'
Write-Host ''
Write-Host 'Test now:  cd web; npm run daily-market-pack'
Write-Host "Remove:    Unregister-ScheduledTask -TaskName $TaskName -Confirm:`$false"
