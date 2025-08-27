param(
    [string]$arg
)

if($arg -eq $null){
    $arg = "NOOP"
}

# Clean up URL encoding before anything else
$argClean = $arg.Replace('%3d', '=').Replace('%2b', '+').Replace('%2f', '/')

$command = "-ExecutionPolicy Bypass -WindowStyle Hidden -NonInteractive -NoProfile -Command `"Invoke-Expression ([System.Text.Encoding]::UTF8.GetString([convert]::FromBase64String('$argClean')))`""
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $command
$principal = New-ScheduledTaskPrincipal -UserID "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

$taskName = "OpenBAS-Payload-" + [guid]::NewGuid().ToString()
Register-ScheduledTask -TaskName $taskName -Action $action -Principal $principal
Start-ScheduledTask -TaskName $taskName

write-host "Task Triggered, sleep for 2 seconds..."

Start-Sleep -Seconds 2

write-host "Sleep Complete, removing Scheduled Task"

Unregister-ScheduledTask -TaskName $taskName -Confirm:$false


write-host "Task removed. Action Complete"
