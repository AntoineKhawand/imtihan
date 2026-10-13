# Safe regression for Windows PowerShell 5.1. This parses the runner but
# evaluates ONLY its RunGit function. No scheduler, fetch/pull, AI or push runs.
param([string]$RunnerPath = (Join-Path $PSScriptRoot "nightly-ops.ps1"))
$ErrorActionPreference = "Stop"
$ParseTokens = $null
$ParseErrors = $null
$RunnerAst = [System.Management.Automation.Language.Parser]::ParseFile(
    [IO.Path]::GetFullPath($RunnerPath), [ref]$ParseTokens, [ref]$ParseErrors
)
if ($ParseErrors.Count) { throw "Runner has PowerShell parse errors: $ParseErrors" }
$Functions = @($RunnerAst.FindAll({
    param($Node)
    $Node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $Node.Name -eq "RunGit"
}, $true))
if ($Functions.Count -ne 1) { throw "Expected exactly one RunGit helper" }
$CallSites = @($RunnerAst.FindAll({
    param($Node)
    $Node -is [System.Management.Automation.Language.CommandAst] -and $Node.GetCommandName() -eq "RunGit"
}, $true))
if ($CallSites.Count -ne 3) { throw "Expected three reviewed RunGit call sites" }
foreach ($Call in $CallSites) {
    if ($Call.CommandElements.Count -ne 3 -or
        $Call.CommandElements[1] -isnot [System.Management.Automation.Language.CommandParameterAst] -or
        $Call.CommandElements[1].ParameterName -ne "GitArgs" -or
        $Call.CommandElements[2] -isnot [System.Management.Automation.Language.ArrayExpressionAst]) {
        throw "RunGit must receive an explicit named array: $($Call.Extent.Text)"
    }
}
$script:ObservedArgs = @()
$script:MockExitCode = 0
$script:ObservedLogs = @()
function Log($Message) { $script:ObservedLogs += [string]$Message }
function git {
    $script:ObservedArgs = @($args)
    $global:LASTEXITCODE = $script:MockExitCode
    "mock git output"
}
# Never dot-source or invoke the full runner.
. ([scriptblock]::Create($Functions[0].Extent.Text))
$Cases = @(
    @{ Values = @("fetch", "origin") },
    @{ Values = @("checkout", "master") },
    @{ Values = @("pull", "--ff-only", "origin", "master") },
    @{ Values = @("status", "--short", "--", "file with spaces.txt") }
)
foreach ($Case in $Cases) {
    RunGit -GitArgs $Case.Values
    if ($script:ObservedArgs.Count -ne $Case.Values.Count) { throw "Git argument count changed" }
    for ($Index = 0; $Index -lt $Case.Values.Count; $Index++) {
        if ($script:ObservedArgs[$Index] -cne $Case.Values[$Index]) { throw "Git argument $Index changed" }
    }
}
if ($script:ObservedLogs.Count -ne $Cases.Count) { throw "Git output was not logged" }
$script:MockExitCode = 17
$FailureMessage = ""
try { RunGit -GitArgs @("fetch", "origin") } catch { $FailureMessage = $_.Exception.Message }
if ($FailureMessage -notlike "*git fetch origin failed with exit code 17*") { throw "Nonzero Git failure was not propagated" }
# Remove the fake command. The only real native command below is git --version.
Remove-Item -LiteralPath Function:\git
$script:ObservedLogs = @()
RunGit -GitArgs @("--version")
if ($LASTEXITCODE -ne 0 -or $script:ObservedLogs.Count -ne 1 -or $script:ObservedLogs[0] -notmatch "^git version ") {
    throw "Real non-mutating git --version failed"
}
[pscustomobject]@{
    PowerShellVersion = $PSVersionTable.PSVersion.ToString()
    NamedArrayCallSites = $CallSites.Count
    ExactArgumentCases = $Cases.Count
    FailureExitCode = 17
    RealGitVersion = $script:ObservedLogs[0]
    FullRunnerExecuted = $false
} | ConvertTo-Json -Compress
