param([string]$arg)

if(-not $arg){ $arg = "NOOP" }

# Clean up URL encoding before anything else
$argClean = $arg.Replace('%3d', '=').Replace('%2b', '+').Replace('%2f', '/')

$command = "-ExecutionPolicy Bypass -WindowStyle Hidden -NonInteractive -NoProfile -Command `"Invoke-Expression ([System.Text.Encoding]::UTF8.GetString([convert]::FromBase64String('$argClean')))`""

Write-Host "[DEBUG] Command: powershell.exe $command"

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $command
$principal = New-ScheduledTaskPrincipal -UserID "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$taskName = "OpenBAS-Payload-" + [guid]::NewGuid().ToString()

try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Principal $principal -ErrorAction Stop
    Write-Host "[OK] Task $taskName registered"
} catch {
    Write-Host "[ERROR] Register-ScheduledTask : $($_.Exception.Message)"
}

try {
    Start-ScheduledTask -TaskName $taskName -ErrorAction Stop
    Write-Host "[OK] Task $taskName started"
} catch {
    Write-Host "[ERROR] Start-ScheduledTask : $($_.Exception.Message)"
}

Start-Sleep -Seconds 2

try {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction Stop
    Write-Host "[OK] Task $taskName removed"
} catch {
    Write-Host "[ERROR] Unregister-ScheduledTask : $($_.Exception.Message)"
}
