# Independent QA — exam editor and OpenAI migration

Date: 2026-10-12. Branch: `fix/exam-transform-qa`.

## Verdict

**PASS for branch push / draft PR. Production merge/deployment remains blocked until the production OpenAI configuration is verified and the changed real-provider flows can be checked.** No commit, push or deployment was performed by QA.

The independent final `npm run verify:fix` run exited 0:

| Phase | Executed result |
| --- | --- |
| TypeScript | PASS |
| Full Vitest | 58 files, 616 tests passed; 153.02 seconds |
| Isolated Chromium acceptance | 15 tests passed; 1.9 minutes reported by Playwright |
| Production build | PASS reported by implementing/root agent; not rerun by QA |
| Security review | PASS reported by security/root agent; QA independently exercised the image boundaries below |

The final automated run followed all product edits, including the independently discovered escaped-subscript fix, and all final test/fixture changes. It exited 0 with no failed or skipped acceptance tests. Browser execution was slower than the earlier run (individual initial tests took 4–15 seconds), but no failure, hang or new server error occurred. Subsequent QA documentation does not change product behavior.

## What was actually verified

- Real `ExerciseCard` and rendering components display the exact reported French corrigé, including its malformed closing-dollar/naked boxed infinity, without visible `\lim`, `\boxed`, dollar delimiters or KaTeX errors.
- An additional independent regression originally reproduced corruption of entirely valid limits, exponents, variation arrows and boxed answers. It passes after engineering restricted naked-math/arrow repairs to content outside existing math delimiters.
- Real button interactions cover explicit function plots, diagrams, illustrations, configured tables, automatic inline chart insertion, and the existing WYSIWYG edit/save/cancel behavior. The diagram fixture supplies actual fenced Mermaid code; acceptance checks the `/api/visual/mermaid` request and decoded code query, plus successful image loading. Both Mermaid and illustration image responses are intercepted fixtures, so these are **UI/request/rendering checks, not live OpenAI or real Mermaid service checks**.
- Independent successful-route cases now cover all five transform modes (table, visual, image, plot and insertPlot), with mocked provider responses attempting to replace identity, marks, answers and chapters. Every case preserves the original academic fields while applying the requested statement/plot change.
- A new semantic assertion reproduced the literal pasted Markdown-escaped form (`u\_{n+1}`, `\lim\_{...}`): it parsed without a KaTeX error but displayed a baseline underscore instead of a subscript. After engineering's bounded math-only normalization, its MathML matches correctly written subscripts. Preservation tests retain intentional underscores in prose, multi-letter identifiers and nested/explicit text, operator-name, roman, sans-serif and typewriter macros. The browser corrigé fixture now uses the pasted escaped form as well as the malformed boxed infinity.
- The new workflow dropdown was exercised at 375, 768 and 1440 pixels, in light/dark themes, with keyboard open/selection/Escape, disabled-option skipping, outside dismissal and viewport containment. The 375-pixel dark screenshot was visually inspected. Screenshots are under `test-results/exam-dropdown-*-dark.png`; the HTML report is `playwright-report/index.html` (ignored local artifacts).
- Eighteen independent image-route tests mock Firebase Admin and provider fetches: input/config/key/session boundaries; cached public PNG reads; correct content type; persisted generated PNGs; stable cache keys across random seeds; transactional daily quota; sanitized provider failures; invalid PNG rejection; concurrent deduplication; cross-site image/navigation and foreign Origin/Referer rejection; headerless misses denied; matching Referer-only legacy image requests allowed; cached public cross-site reads preserved. No real Admin credentials, quota writes or paid requests were used.
- The development-only browser fixture returns `notFound()` in production by construction and is excluded from generated sitemap routes and robots indexing. A regression checks that no `/test-*` route is advertised in the static sitemap.

## Live baseline and production limits

Using the normally signed-in Chrome session on `imtihan.live`, QA generated one small mathematics exam through Describe → Confirm → Generate. This real generation succeeded. The deployed corrigé displayed raw LaTeX in limits, boxed answers and a variation arrow. Plot and table actions closed their controls without visible resulting content; an exact returned server error was not captured. This was the **existing deployment**, not verification of the new branch.

The actual production project settings were opened through the normal browser UI:

`https://vercel.com/antoine-7251s-projects/imtihan/settings/environment-variables`

Vercel returned 404 / Not Found for the currently signed-in account and offered "Log In as a Different User". QA therefore could not inspect whether `OPENAI_API_KEY`, its production scope, image-model configuration or deployment permissions exist. On the independent repeat audit, browser policy loading itself was unavailable; the earlier wrong-account 404 remains the latest successful access evidence. No secret values were requested or exposed and no access bypass was attempted. The application and Vercel tabs remain available for follow-up after correct-account access is provided.

Do not describe the changed OpenAI generation, document upload, translation, scanner, rubric, blog or image provider paths as production-tested. Their current verification is the local unit/mocked integration suite plus static review. Real provider availability and final deployed behavior require a normally authenticated production/preview check after configuration is confirmed.

## Test reliability and continuing process

An intermediate full run failed only the existing native-canvas Word PNG test's 5-second timeout while a production build was running concurrently. Isolated rerun passed all 16 Word tests. QA gave only that cold native-canvas/mathjs test a bounded 15-second timeout, preserving every PNG/content assertion; the subsequent full gate passed.

`npm run verify:fix`, `.github/workflows/fix-qa.yml`, `CLAUDE.md` and `.claude/agents/qa.md` now require independent QA after every final modification/fix and before push/deploy, with explicit mocked-versus-real-provider reporting. The CI workflow runs on PRs and master. GitHub branch protection is **not configured**; its existence must not be implied by adding the workflow.

Preexisting export limitation: Word deliberately converts `[IMAGE:]`, `[GRAPH:]` and `[VISUAL:]` tags into labelled figure descriptions rather than embedding generated illustrations. This change does not alter that behavior. Mathematical `[PLOT:]` graphs have real PNG embedding coverage.
