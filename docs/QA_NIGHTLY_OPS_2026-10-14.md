# Independent QA — Windows nightly runner

Date: 2026-10-14. Branch: `fix/nightly-git-arguments`.

## Verdict

**PASS for source push and narrowly applying the reviewed local runner repair.** Independent `npm run verify:fix` exited 0: TypeScript passed; 65 Vitest files / 713 tests passed (115.86s); 21 isolated Chromium cases passed (2.3 minutes reported by Playwright). No failures or skipped cases occurred in the final gate. It followed the final runner/prompt edits; the workflow-only addition was separately parsed and reviewed while unaffected application checks continued.

Windows PowerShell 5.1 regression and workflow/prompt review pass. QA has not changed the installed launcher or runtime prompt and has not invoked the overnight workload. A successful future scheduled workload is not certified by this source-QA verdict.

## Changed behavior and PowerShell evidence

The scheduled runner previously called `RunGit @("fetch", "origin")` with a variadic string-array helper. In Windows PowerShell 5.1 this collapsed the intended native arguments into one `fetch origin` string. Root's real overnight log identified Git rejecting that argument. The repaired helper requires `GitArgs`; all three runner calls supply explicit `-GitArgs @(...)` arrays.

`powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-nightly-git.ps1` passes on **Windows PowerShell 5.1.26100.9444**. The regression parses the runner, checks its three named-array call sites, and evaluates **only the RunGit function AST**. A mock Git command verifies four exact argument vectors: fetch, checkout, pull and a filename containing spaces. Mock exit code 17 is preserved as a terminating helper failure; command output is logged. The mock is then removed and the only real native command is **git --version**, returning `git version 2.44.0.windows.1`.

A negative control using the pre-fix source from Git correctly fails with exit 1 at `RunGit @("fetch", "origin")`, before any runner operation. It confirms the durable regression rejects the original defect. No actual fetch, checkout, pull, AI dispatch, commit, push or PR creation is executed by this harness. The full runner is never dot-sourced.

## Prompt and workflow review

- The nightly prompt now explicitly requires independent `qa` verification via `npm run verify:fix` after final edits and before commits/pushes. It distinguishes isolated fixtures from real providers and forbids production APIs, real credentials, paid AI calls, emails and live browser automation. Legacy credentialed e2e/emulator suites are not authorized in the unattended job.
- `.github/workflows/nightly-runner-qa.yml` is valid parsed YAML. Assertions confirm PR/master path filters, `contents: read`, checkout credentials disabled, a five-minute Windows job and explicit `powershell` shell. Its only run command is the safe regression above; it does not launch overnight operations. The GitHub job itself requires a future push/run; local YAML review is not a claim that CI has already executed it.

## Actual scheduler versus this code check

Root's read-only inspection reports **Imtihan Nightly Ops** enabled/Ready at midnight Beirut, last run 2026-10-14 00:00 exited 1, next scheduled run 2026-10-15 00:00. `WakeToRun` and `StartWhenAvailable` are false; the machine needs to be awake at the trigger. Root also reports existing Claude authentication is logged in. QA did not operate Task Scheduler, inspect tokens, change those settings or run a paid session.

These observations do not prove a successful overnight run after the fix. The installed Downloads launcher contains pre-existing local modifications; root must preserve them while applying the narrow helper/call-site and prompt updates. After installation, the safe regression can be run with `-RunnerPath` pointing to that installed launcher, followed by root's `-PreflightOnly` check. Those deployment checks and the next real overnight outcome are outside this source-QA verdict.

No real Firebase Admin credentials, production API harness, paid provider request, email send or full nightly run was used. QA did not commit, push, deploy or modify the installed script.

## Installed repair verification (root)

After the independent PASS, root backed up the existing Downloads launcher and runtime prompt, changed only the Git helper/call sites and prompt step 4, and preserved pre-existing local changes. The same Windows PowerShell 5.1 regression passed against the actual installed launcher via -RunnerPath. The installed launcher's -PreflightOnly -NoNotifications check exited 0 against the isolated nightly-automation checkout. No full overnight AI workload was started; last scheduled result remains exit 1 until the next real run. Task settings were not changed.
