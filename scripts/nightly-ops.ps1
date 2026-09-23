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

$RepoDir    = "C:\Users\Administrateur\Downloads\imtihan\imtihan"

# This Windows logon session's cached PATH can predate a mid-session tool
# install (confirmed: gh was installed via winget after this session's
# logon, and a freshly spawned process here still lacked it on PATH) —
# prepend known install locations defensively instead of depending on the
# session ever refreshing its environment block.
$ExtraPath = "C:\Program Files\GitHub CLI"
if ($env:PATH -notlike "*$ExtraPath*") {
    $env:PATH = "$ExtraPath;$env:PATH"
}
$PromptFile = Join-Path $RepoDir "scripts\nightly-ops-prompt.md"
$LogDir     = Join-Path $RepoDir "logs\nightly"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$Stamp   = Get-Date -Format "yyyy-MM-dd_HHmmss"
$LogFile = Join-Path $LogDir "$Stamp.log"

function Log($msg) {
    "$(Get-Date -Format o)  $msg" | Tee-Object -FilePath $LogFile -Append -Encoding utf8 | Out-Null
}

function RunGit {
    param([string[]]$GitArgs)
    $output = & git @GitArgs 2>&1
    $output | ForEach-Object { Log $_ }
    if ($LASTEXITCODE -ne 0) {
        throw "git $($GitArgs -join ' ') failed with exit code $LASTEXITCODE"
    }
}

Set-Location $RepoDir
Log "=== Nightly ops run started ==="

# Refuse to run against a dirty working tree rather than risk discarding
# or colliding with in-progress local work.
$dirty = git status --porcelain
if ($dirty) {
    Log "ABORT: working tree is not clean, refusing to touch it. Uncommitted changes:"
    Log ($dirty -join "`n")
    exit 1
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
    exit 1
}

$Prompt = Get-Content -Raw -Path $PromptFile
$AllowedTools = "Read Edit Write Grep Glob Agent Bash(git *) Bash(npm *) Bash(npx *) Bash(node *) Bash(gh *)"

Log "Launching claude -p (model claude-sonnet-5, scoped allowedTools)"

& claude -p $Prompt --model claude-sonnet-5 --allowedTools $AllowedTools 2>&1 |
    ForEach-Object { Log $_ }

Log "=== Nightly ops run finished, exit code $LASTEXITCODE ==="
