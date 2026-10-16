# Nightly recovery QA - 2026-10-16

**PASS.** Final `npm run verify:fix` exited **0** after the last product edit: TypeScript, 804 unit/mocked integration tests, and 27 isolated Chromium cases. This report does not reuse the successful gate from before the zero-rendering repair.

## Scope and review

- Interrupted engineering work adds four real KaTeX failure/success regressions, exercising inline/display exception fallbacks with escaped source preservation and shallow success controls. No provider or prompt change.
- The variation-table wrapper now uses the existing themed `--surface` token with its existing `--text` labels, cells and arrows. The print composition already overrides these to white paper and document ink.
- The final follow-up replaces the variation table's hollow-circle zero marker with literal `<span class="font-medium">0</span>`, preserving actual mathematical content and accessible text. Static review confirms no new interpolation or parsing/escaping changes.
- Browser assertions require literal zero, inspect text-bearing descendant spans at 375/768/1440px in light/dark, and inspect the actual zero span under print media with a dark app theme.

The earlier independent QA agent verified the themed-surface change. This final reviewer authored that earlier surface class and independently reviews the parent's subsequent zero-rendering repair; the complete gate is being repeated against the frozen combined source.

Frozen renderer SHA256: `D7C07941700FB7D25F81BA6E93E608657939918734A86C2D5E8E55349D7E0BFA`.

## Initial final-source gate attempt

`npm run verify:fix` passed TypeScript, then encountered timing failures in unchanged export tests during severe Windows memory pressure:

- `export-latex-convert.test.ts`: unbalanced input at the cap took 2136ms against its existing 2000ms bound.
- `export-generateWordDocument.test.ts`: real PNG embedding took 30465ms against its existing 15000ms cold-start timeout.
- Windows reported 398MB free physical RAM out of approximately 15.8GB. Even read-only shell commands were substantially delayed.

The owned failed gate session was stopped, with no threshold changes, skips or product edits. No remaining checkout-owned Node processes were found afterward. Unrelated project servers, user applications and browsers were not terminated. A fresh exact gate is required after resources recover; these timing failures are not silently treated as a pass.

## Exact gate retry

After memory pressure eased (1206MB free measured immediately before restart; 605MB after the gate loaded), QA restarted the exact `npm run verify:fix` command with unchanged time bounds, configuration and assertions.

- TypeScript: passed.
- Full Vitest: **804 tests / 67 files passed**, 245.56 seconds. Both previously timing-sensitive export tests passed unchanged.
- Independent isolated Chromium acceptance: **27 tests passed**, 4.9 minutes, zero retries or skips. Collected browser page errors were empty. Includes the existing exam/editor/admin component regressions, escaped variation labels, literal zero assertions, responsive light/dark text contrast and real print composition.

The clean retry resolves the initial resource-related timing failures. No test threshold or product behavior was weakened to obtain this result.

## Contrast and visual evidence

At each of 375/768/1440px, actual text-bearing table cells and descendant spans measured **19.80:1** in light mode (`rgb(10,10,10)` on white) and **17.31:1** in dark mode (`rgb(250,250,247)` on `rgb(22,22,22)`). The zero cell is asserted to contain literal `0`. These are computed text/surface measurements; existing plus/minus opacity is retained. Zero has no reduced-opacity styling.

The actual `/print` composition under a dark app theme and print media measured **16.05:1** for the zero's descendant span (`rgb(23,36,31)` on white), exceeding the asserted 7:1 minimum. The white print surface and document ink tokens are preserved.

Manually reviewed the six fresh `test-results/variation-{375,768,1440}-{light,dark}.png` captures and `test-results/variation-print-dark-app.png`. Zero is visibly a numeral in the 768/1440 and print captures; the 375px adversarial long-label fixture scrolls horizontally inside its table, with no page overflow. Its zero remains actual measured/asserted text rather than a decorative marker. Escaped payload text stays inert in both themes. These captures are local test artifacts, not production screenshots.

## Safety and limits

The mandatory `playwright.fix.config.ts` uses isolated local components, demo Firebase configuration and fixture callbacks/image responses. The legacy credentialed auth helpers are excluded. No real Admin credentials, production API harness, paid AI generation, actual email, queue operation, task-setting change, merge or publication is performed by QA. This verification cannot certify real provider credentials, production delivery or a completed unattended overnight run.

Publication is pending the parent's review, GitHub checks and release process. This QA report makes no claim that this source is already merged or deployed; actual PR/deployment evidence will be recorded separately.
