param(
    [Parameter(Mandatory=$true)][string]$SourceRepo,
    [Parameter(Mandatory=$true)][string]$AutomationRoot,
    [string]$TaskName = "Imtihan Nightly Ops"
)
$ErrorActionPreference = "Stop"
$SourceRepo = [IO.Path]::GetFullPath($SourceRepo)
$AutomationRoot = [IO.Path]::GetFullPath($AutomationRoot)
$Checkout = Join-Path $AutomationRoot "checkout"
$Runtime = Join-Path $AutomationRoot "runtime"
if ($Checkout -eq $SourceRepo -or $SourceRepo.StartsWith($AutomationRoot + [IO.Path]::DirectorySeparatorChar)) {
    throw "Automation must be separate from the source checkout."
}
New-Item -ItemType Directory -Force $Runtime | Out-Null
$Existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($Existing -and [string]$Existing.State -eq "Running") { throw "Wait for the current task to finish before provisioning." }
if ($Existing) {
    Export-ScheduledTask -TaskName $TaskName | Set-Content -Encoding Unicode (Join-Path $Runtime "task-before.xml")
}
$Remote = & git -C $SourceRepo remote get-url origin
if ($LASTEXITCODE -ne 0) { throw "Cannot resolve origin." }
if (-not (Test-Path -LiteralPath $Checkout)) {
    & git clone --no-hardlinks $SourceRepo $Checkout
    if ($LASTEXITCODE -ne 0) { throw "Dedicated clone failed." }
    & git -C $Checkout remote set-url origin $Remote
    if ($LASTEXITCODE -ne 0) { throw "Cannot configure clone origin." }
}
$CloneRemote = & git -C $Checkout remote get-url origin
if ($LASTEXITCODE -ne 0 -or $CloneRemote -ne $Remote) { throw "Existing checkout has an unexpected origin." }
Copy-Item -LiteralPath (Join-Path $PSScriptRoot "nightly-ops.ps1") -Destination $Runtime
Copy-Item -LiteralPath (Join-Path $PSScriptRoot "nightly-ops-prompt.md") -Destination $Runtime
# Keep only the intended read-only analytics MCP server; browser/global servers
# are neither required nor granted for unattended work. Never print credentials.
$Servers = @{}
$SourceMcp = Join-Path $SourceRepo ".mcp.json"
if (Test-Path $SourceMcp) {
    $Config = Get-Content -Raw $SourceMcp | ConvertFrom-Json
    if ($Config.mcpServers.gsc) { $Servers["gsc"] = $Config.mcpServers.gsc }
}
@{mcpServers=$Servers} | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 (Join-Path $Runtime "mcp.json")
$Runner = Join-Path $Runtime "nightly-ops.ps1"
$Prompt = Join-Path $Runtime "nightly-ops-prompt.md"
$Mcp = Join-Path $Runtime "mcp.json"
$Logs = Join-Path $AutomationRoot "logs"
$Arguments = '-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}" -RepoDir "{1}" -PromptFile "{2}" -LogDir "{3}" -McpConfig "{4}"' -f $Runner,$Checkout,$Prompt,$Logs,$Mcp
$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $Arguments -WorkingDirectory $Checkout
$Trigger = New-ScheduledTaskTrigger -Daily -At "00:00"
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -WakeToRun -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 4) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
# Preserve the existing identity/logon mode: changing that requires credentials.
$Principal = if ($Existing) { $Existing.Principal } else { New-ScheduledTaskPrincipal -UserId ([Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive }
$Task = New-ScheduledTask -Action $Action -Trigger $Trigger -Settings $Settings -Principal $Principal
Register-ScheduledTask -TaskName $TaskName -InputObject $Task -Force -ErrorAction Stop | Out-Null
Write-Output "Provisioned $TaskName with isolated checkout: $Checkout"
Write-Output "Logon mode: $($Principal.LogonType). A signed-in Windows session is still required for Interactive mode."
