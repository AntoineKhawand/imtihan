# Nightly recovery QA — 2026-10-15

The owner requested interactive recovery and publication of the interrupted October 15 Windows run. This is not a claim that the original scheduled run completed: it exited 0xC000013A after Windows shutdown/sleep, with partial uncommitted work preserved separately before recovery.

## Reviewed changes

- BUG-062: derivatives preserve dependent/independent variables, case and order. Whole-token boundaries avoid prose/identifier matches. Physics quantities retain complete decimal/scientific values and their own unit. Chemistry validates complete element tokens and conservatively recognizes familiar letter-only formulas. Explicit math/LaTeX arguments remain protected.
- BUG-063: variation-table labels escape HTML before insertion. DOM/browser checks cover literal image/event labels and closing-tag/SVG payloads for VARIATION/TABLE_VAR, preserved rows/cells, and non-execution.
- Existing PR #102: independent review passed for its 24 pure transform-prompt tests. It was normally merged as `2f243f389c9fc8907aa0162e807cdfe18c5dd873`; the same test file was executed in the final combined local gate. GitHub reported successful Production deployment for that SHA.

## Independent verification

QA ran `npm run verify:fix` after the final product edit:

- TypeScript: passed; final repeat `npm run type-check` also exited 0 after the test-only selector edit.
- Full Vitest: **800 tests / 66 files passed**, 155.67 seconds.
- Isolated Chromium acceptance: **23 tests passed**, 2.0 minutes. Includes exact recovered notation nodes, KaTeX success, unchanged prose/explicit math, variation-label non-execution, table/chart/diagram/image component flows, corrigé/export behavior and responsive checks at 375/768/1440px.

The first gate was deliberately aborted when security review found BUG-063, then restarted after repair. The final gate includes both fixes. A QA-only locator was narrowed to the actual exercise-card table before browser collection, so the added adversarial fixture did not make the existing table-action assertion ambiguous.

Independent manual security review passed on final renderer SHA256 `cc306314f5a299fe71c20ca7b2cadff52f291288c3093ea977e4050b3ddffd46`. It verified retained escaping and KaTeX `trust:false`, strict token interpolation and bounded scan advancement. The security-review skill was unavailable; no automated scan or dependency audit was claimed. GitHub scans remain separate release checks.

## Limits and follow-up

This uses actual local components with safe mocked service callbacks and demo Firebase configuration. It does not certify paid AI providers, real email delivery, protected production exam flows or Firebase changes; no real Admin credentials, production API harness, real email or paid generation was used.

QA observed pre-existing low contrast in dark variation tables (hardcoded white surface with inherited theme text). Logged as open in DESIGN.md; this recovery does not claim that visual issue was fixed. Desktop and menu-closed 375px light/dark screenshots were visually reviewed; no horizontal overflow or page errors occurred in that mobile pass. Local artifacts: `test-results/bug062-recovered-notation.png`, `test-results/bug062-375-light.png`, `test-results/bug062-375-dark.png`. These are local/CI outputs, not production evidence.

The task remains enabled for October 16 at 00:00 Asia/Beirut. Windows denied prior wake/catch-up registration changes, so those settings remain disabled. Keep the PC awake; this release is not proof of a completed unattended run. The source/dependency checkout must be clean before the next runner preflight.

Other domains were triaged without speculative changes: no verified unblocked marketing/database/design task was selected; fresh SEO metrics require source access, and no curriculum or editorial claims were invented. No new founder decision was introduced.
