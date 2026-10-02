# Install Windows Scheduled Tasks for morning (and optional evening) framework launcher.
# Run once in PowerShell (no admin needed for current-user tasks):
#   cd d:\D-Drive\Personal\My-agent\.cursor\prompts
#   .\Install-MorningRunTask.ps1
#
# Remove:
#   .\Install-MorningRunTask.ps1 -Uninstall

param(
    [switch]$Uninstall,
    [switch]$WithNumbers,
    [switch]$WithCursor,
    [switch]$WithEvening
)

$taskMorning = 'MyAgent-MorningRun'
$taskEvening = 'MyAgent-EveningRun'
$scriptPath = Join-Path $PSScriptRoot 'Start-MorningRun.ps1'
$eveningScript = Join-Path $PSScriptRoot 'Start-EveningRun.ps1'

$morningArgs = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""
if ($WithNumbers) { $morningArgs += ' -RunNumbers' }
if ($WithCursor) { $morningArgs += ' -OpenCursor' }

function Remove-TaskSafe($name) {
    Unregister-ScheduledTask -TaskName $name -Confirm:$false -ErrorAction SilentlyContinue
}

if ($Uninstall) {
    Remove-TaskSafe $taskMorning
    Remove-TaskSafe $taskEvening
    Write-Host "Removed tasks: $taskMorning, $taskEvening"
    exit 0
}

if (-not (Test-Path $scriptPath)) {
    Write-Error "Missing $scriptPath"
    exit 1
}

$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $morningArgs
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
Register-ScheduledTask -TaskName $taskMorning -Action $action -Trigger $trigger -Settings $settings -Description 'Open morning prompt HTML + copy Variant A to clipboard (06:00-13:59 IST window)' -Force | Out-Null

Write-Host "Installed: $taskMorning (runs at Windows logon; script skips outside 06:00-13:59 IST and if already ran today)"
Write-Host "  Script: $scriptPath"
if ($WithNumbers) { Write-Host "  + Phase 2 CAGR/PARAMETERS scripts on each run" }
if ($WithCursor) { Write-Host "  + Opens Cursor on project folder" }

if ($WithEvening) {
    if (-not (Test-Path $eveningScript)) {
        Write-Warning "Evening script not found - skipping evening task"
    } else {
        $evArgs = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$eveningScript`""
        $evAction = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $evArgs
        # 21:00 IST daily - adjust if PC timezone is not IST
        $evTrigger = New-ScheduledTaskTrigger -Daily -At '9:00PM'
        Register-ScheduledTask -TaskName $taskEvening -Action $evAction -Trigger $evTrigger -Settings $settings -Description 'Evening Variant B prompt (21:00 local - set PC to IST)' -Force | Out-Null
        Write-Host "Installed: $taskEvening (daily 21:00 local - ensure Windows timezone is IST)"
    }
}

Write-Host ""
Write-Host "Test now:  .\Start-MorningRun.ps1 -Force"
Write-Host "Task Scheduler -> Task Scheduler Library -> $taskMorning"
