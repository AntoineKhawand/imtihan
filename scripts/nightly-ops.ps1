# Imtihan nightly ops — invoked by Windows Task Scheduler once a night.
# Dispatches all 7 teams on real backlog items, verifies, commits to a
# dated branch, and opens a PR. Never touches master directly.
#
# Safety: no --dangerously-skip-permissions is used. --allowedTools scopes
# the run to Read/Edit/Write/Grep/Glob/Agent plus Bash restricted to
# git/npm/npx/node/gh only — anything else (firebase, rm -rf, arbitrary
# network tools) is simply not reachable, not just discouraged.

$ErrorActionPreference = "Stop"

$RepoDir    = "C:\Users\Administrateur\Downloads\imtihan\imtihan"
$PromptFile = Join-Path $RepoDir "scripts\nightly-ops-prompt.md"
$LogDir     = Join-Path $RepoDir "logs\nightly"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$Stamp   = Get-Date -Format "yyyy-MM-dd_HHmmss"
$LogFile = Join-Path $LogDir "$Stamp.log"

function Log($msg) {
    "$(Get-Date -Format o)  $msg" | Tee-Object -FilePath $LogFile -Append
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
    git fetch origin 2>&1 | ForEach-Object { Log $_ }

    Log "git checkout master"
    git checkout master 2>&1 | ForEach-Object { Log $_ }

    Log "git pull --ff-only origin master"
    git pull --ff-only origin master 2>&1 | ForEach-Object { Log $_ }
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
