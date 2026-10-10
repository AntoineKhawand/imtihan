# Imtihan nightly ops — invoked by Windows Task Scheduler once a night.
# Dispatches all 7 teams on real backlog items, verifies, commits to a
# dated branch, and opens a PR. Never touches master directly.
#
# Safety: no --dangerously-skip-permissions is used. --allowedTools scopes
# the run to Read/Edit/Write/Grep/Glob/Agent plus Bash restricted to
# git/npm/npx/node/gh only — anything else (firebase, rm -rf, arbitrary
# network tools) is simply not reachable, not just discouraged.
#
# Note: $ErrorActionPreference is deliberately left at the default
# "Continue" for this script. Native tools (git, claude, npm) routinely
# write normal status text to stderr (e.g. "Already on 'master'"), and
# under "Stop" PowerShell 5.1 promotes each stderr line from a native exe
# into a terminating error even when the exe's real exit code is 0 — that
# previously caused false aborts on ordinary git output. Real failures are
# instead detected explicitly via $LASTEXITCODE after each git call.

param(
    [string]$RepoDir = (Split-Path $PSScriptRoot -Parent),
    [string]$PromptFile = (Join-Path $PSScriptRoot "nightly-ops-prompt.md"),
    [string]$LogDir = "",
    [string]$McpConfig = "",
    [string]$Model = "claude-sonnet-5",
    [switch]$PreflightOnly,
    [switch]$NoNotifications
)

# Machine-local deployment config also supports an existing task whose action
# cannot be edited without elevation. Explicit parameters always win.
$LocalConfig = Join-Path $PSScriptRoot "nightly-ops.local.json"
if (Test-Path -LiteralPath $LocalConfig) {
    $Installed = Get-Content -Raw $LocalConfig | ConvertFrom-Json
    foreach ($Name in @("RepoDir", "PromptFile", "LogDir", "McpConfig")) {
        if (-not $PSBoundParameters.ContainsKey($Name) -and $Installed.$Name) {
            Set-Variable -Name $Name -Value $Installed.$Name
        }
    }
}
$RepoDir = [IO.Path]::GetFullPath($RepoDir)

# This Windows logon session's cached PATH can predate a mid-session tool
# install (confirmed: gh was installed via winget after this session's
# logon, and a freshly spawned process here still lacked it on PATH) —
# prepend known install locations defensively instead of depending on the
# session ever refreshing its environment block.
#
# 2026-10-07: this exact gap silently broke the Oct 6 and Oct 7 runs —
# `claude.cmd` lives in the npm global prefix (not on this PATH), so
# `& claude -p ...` threw CommandNotFoundException. That error happens at
# command-resolution time, before the pipeline (and its `2>&1`) ever runs,
# so it never reached Log, and $LASTEXITCODE was left untouched from the
# prior successful git call — the run silently did nothing but logged
# "exit code 0" anyway. Confirmed by reproducing the same failure
# interactively and fixing it by adding npm's global prefix here.
$ExtraPaths = @("C:\Program Files\GitHub CLI", "$env:APPDATA\npm", "$env:USERPROFILE\.local\bin")
foreach ($p in $ExtraPaths) {
    if ($env:PATH -notlike "*$p*") {
        $env:PATH = "$p;$env:PATH"
    }
}
if (-not $LogDir) { $LogDir = Join-Path $RepoDir "logs\nightly" }
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$Stamp   = Get-Date -Format "yyyy-MM-dd_HHmmss"
$LogFile = Join-Path $LogDir "$Stamp.log"

function Log($msg) {
    Add-Content -Path $LogFile -Value "$(Get-Date -Format o)  $msg" -Encoding UTF8
}

# 2026-10-01: the founder asked to be told every night when this fires and
# what it's doing, without depending on a Claude Code session being open at
# midnight (nothing guarantees that). A native Windows balloon notification
# is independent of any session — it fires whether or not anyone's watching.
# Wrapped in try/catch and never touches $LASTEXITCODE: a notification
# failure must never abort or mask the real run underneath it.
function Notify($title, $message) {
    if ($NoNotifications) { return }
    try {
        Add-Type -AssemblyName System.Windows.Forms
        $icon = New-Object System.Windows.Forms.NotifyIcon
        $icon.Icon = [System.Drawing.SystemIcons]::Information
        $icon.Visible = $true
        $icon.BalloonTipTitle = $title
        $icon.BalloonTipText = $message
        $icon.ShowBalloonTip(20000)
        Start-Sleep -Seconds 1
        $icon.Dispose()
    } catch {
        Log "Notify() failed (non-fatal, run continues): $_"
    }
}

function RunGit {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)
    $output = & git @GitArgs 2>&1
    $output | ForEach-Object { Log $_ }
    if ($LASTEXITCODE -ne 0) {
        throw "git $($GitArgs -join ' ') failed with exit code $LASTEXITCODE"
    }
}

if (-not (Test-Path -LiteralPath $RepoDir -PathType Container)) { throw "Checkout directory missing: $RepoDir" }
Set-Location -LiteralPath $RepoDir -ErrorAction Stop
Log "=== Nightly ops run started ==="
Log "Checkout: $RepoDir"
$RunMutex = New-Object System.Threading.Mutex($false, "Local\ImtihanNightlyOps")
try { $OwnsMutex = $RunMutex.WaitOne(0) } catch [System.Threading.AbandonedMutexException] { $OwnsMutex = $true }
if (-not $OwnsMutex) { Log "ABORT: another nightly run is active"; exit 1 }
Notify "Imtihan Nightly Ops" "Tonight's run just started. Log: $LogFile"

# Fail explicitly before a previous native command can leave a stale success code.
foreach ($tool in @("git", "npm", "node", "gh", "claude")) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Log "ABORT: required executable missing: $tool"
        Notify "Imtihan Nightly Ops - ABORTED" "Required executable missing: $tool"
        exit 1
    }
}
if (-not (Test-Path -LiteralPath $PromptFile)) {
    Log "ABORT: prompt file missing: $PromptFile"
    exit 1
}
if ($McpConfig -and -not (Test-Path -LiteralPath $McpConfig)) {
    Log "ABORT: MCP configuration missing: $McpConfig"
    exit 1
}

# Refuse to run against a dirty working tree rather than risk discarding
# or colliding with in-progress local work.
$dirty = git status --porcelain
if ($LASTEXITCODE -ne 0) { Log "ABORT: git status failed"; exit 1 }
if ($dirty) {
    Log "ABORT: working tree is not clean, refusing to touch it. Uncommitted changes:"
    Log ($dirty -join "`n")
    Notify "Imtihan Nightly Ops - ABORTED" "Working tree was dirty, run skipped. Check the log."
    exit 1
}

if ($PreflightOnly) {
    Log "Preflight passed; no sync, AI invocation, push, or PR creation requested."
    Write-Output "Preflight passed: $RepoDir"
    exit 0
}

try {
    Log "git fetch origin"
    RunGit @("fetch", "origin")

    Log "git checkout master"
    RunGit @("checkout", "master")

    Log "git pull --ff-only origin master"
    RunGit @("pull", "--ff-only", "origin", "master")
} catch {
    Log "ABORT: git sync failed: $_"
    Notify "Imtihan Nightly Ops - ABORTED" "git sync failed, run skipped. Check the log."
    exit 1
}

$Prompt = Get-Content -Raw -Path $PromptFile
$TodayBranch = "nightly/$(Get-Date -Format 'yyyy-MM-dd')"
$Prompt = "Use this branch name for this entire run: $TodayBranch. Working directory: $RepoDir.`n`n$Prompt"

# Isolated checkout has its own dependencies. Install only when lock content changes.
$LockHash = (Get-FileHash (Join-Path $RepoDir "package-lock.json") -Algorithm SHA256).Hash
$LockStamp = Join-Path $RepoDir "node_modules\.nightly-lock-hash"
if (-not (Test-Path $LockStamp) -or (Get-Content $LockStamp -Raw).Trim() -ne $LockHash) {
    Log "Installing locked dependencies in dedicated checkout"
    & npm ci --no-fund --no-audit 2>&1 | ForEach-Object { Log $_ }
    if ($LASTEXITCODE -ne 0) { Log "ABORT: npm ci failed"; exit 1 }
    Set-Content -Path $LockStamp -Value $LockHash
}

# WebSearch and a read-only slice of the gsc MCP tools are included here
# because content-curriculum.md and seo-growth.md both declare them, but
# --allowedTools is a hard ceiling for the whole session tree (subagents
# included) — declaring a tool in an agent's own frontmatter doesn't grant
# it if the outer session was never given it. Confirmed root cause after
# both teams hit repeated tool-denial dead ends across several nightly runs.
# Deliberately NOT included: gsc's mutating tools (add_site, delete_site,
# submit_sitemap, delete_sitemap, manage_sitemaps, reauthenticate) and all
# chrome-devtools tools (live browser automation) — those change real GSC
# config or drive a live browser, which an unattended overnight run
# shouldn't be able to do without a human watching. seo-growth can still
# read search-analytics data; it just can't reconfigure Search Console or
# open a browser on its own.
$GscReadOnlyTools = "mcp__gsc__list_properties mcp__gsc__get_performance_overview mcp__gsc__get_search_analytics mcp__gsc__get_search_by_page_query mcp__gsc__get_advanced_search_analytics mcp__gsc__compare_search_periods mcp__gsc__check_indexing_issues mcp__gsc__inspect_url_enhanced mcp__gsc__batch_url_inspection mcp__gsc__get_sitemaps mcp__gsc__get_sitemap_details mcp__gsc__list_sitemaps_enhanced mcp__gsc__get_site_details mcp__gsc__get_capabilities mcp__gsc__get_creator_info"

# WebFetch: added 2026-09-25 alongside WebSearch — engineering/seo-growth/
# content-curriculum/marketing/database/security all now declare it in
# their own agent frontmatter (read a specific real page directly rather
# than only a search summary). Skill: added so the new `security` team can
# invoke the built-in security-review skill during its nightly pass.
$AllowedTools = "Read Edit Write Grep Glob Agent WebSearch WebFetch Skill Bash(git *) Bash(npm *) Bash(npx *) Bash(node *) Bash(gh *) $GscReadOnlyTools"

# 2026-09-30: the CLI's own default background-task wait ceiling (600s) killed
# the run mid-flight tonight — content-curriculum/design/qa/seo-growth had
# already done real, verifiable work, but engineering and security were still
# running (security's own npm ci for a dependency audit was still in
# progress), so the process never reached its own commit/push/PR steps and
# exited 0 anyway, silently discarding nothing but also shipping nothing.
# Let the scheduled task own the outer runtime limit (four hours in the
# installer), rather than the CLI truncating an individual background task.
# Existing protected tasks need elevated re-registration to adopt that limit.
$env:CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS = "0"

Log "Launching claude -p (model $Model, scoped allowedTools)"

$ClaudeArgs = @("-p", $Prompt, "--model", $Model, "--allowedTools", $AllowedTools)
if ($McpConfig) { $ClaudeArgs += @("--strict-mcp-config", "--mcp-config", $McpConfig) }
try {
    $LASTEXITCODE = 1
    & claude @ClaudeArgs 2>&1 | ForEach-Object { Log $_ }
    $ExitCode = $LASTEXITCODE
} catch {
    Log "Claude launch failed: $($_.Exception.Message)"
    $ExitCode = 1
}

Log "=== Nightly ops run finished, exit code $ExitCode ==="

# Tell the founder what actually happened, not just that the process ended —
# exit code 0 alone was misleading on 2026-09-30 (the run was truncated
# before it ever reached its own PR-creation step, yet still exited 0).
# Checking for a real PR against tonight's branch name is a direct,
# unambiguous answer to "did anything actually ship" instead of leaving that
# to be inferred from the exit code.
try {
    $PrJson = & gh pr list --head $TodayBranch --state open --json url,title 2>&1
    $PrList = $PrJson | ConvertFrom-Json
} catch {
    $PrList = $null
}
if ($PrList -and $PrList.Count -gt 0) {
    $PrUrl = $PrList[0].url
    Notify "Imtihan Nightly Ops - done" "PR opened: $PrUrl"
} elseif ($ExitCode -ne 0) {
    Notify "Imtihan Nightly Ops - finished with errors" "Exit code $ExitCode, no PR opened. Check the log: $LogFile"
} else {
    Notify "Imtihan Nightly Ops - finished, no PR" "Run completed but no PR was opened for $TodayBranch. Check the log: $LogFile"
}
exit $ExitCode
