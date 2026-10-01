# Roadmap — Imtihan

## Legend
- ✅ Done
- 🔨 In progress
- 📋 Planned
- 💭 Considering
- ❌ Deferred

---

## MVP — Target: Q3 2026

### Foundation
- ✅ Project scaffold (Next.js 15, TypeScript, Tailwind)
- ✅ Curriculum data — Bac Libanais, Bac Français, IB, University
- ✅ Type system (ExamContext, Exercise, Exam, UserProfile)
- ✅ Firebase client + admin setup
- ✅ Gemini client singleton + prompt architecture
- ✅ /api/analyze — vision-powered context extraction (Zod validated)
- ✅ /api/generate — SSE streaming with progressive exercise delivery
- ✅ /api/export — Word (.docx) generation with 3 templates
- ✅ /api/export/send — generate + email in one call (Brevo)
- ✅ SEO strategy (sitemap, robots, JSON-LD, metadata, canonical)
- ✅ GEO strategy (llms.txt, FAQ structured data, Vercel Analytics)
- ✅ CLAUDE.md, README, ARCHITECTURE, ROADMAP, BUGS

### UI — Workflow (all 5 steps complete)
- ✅ Global styles + design system (Fraunces + Geist, emerald palette)
- ✅ Root layout
- ✅ Landing page — hero, features, testimonials, pricing
- ✅ Step 1 — Describe + file upload (PDF, DOCX, images via Gemini vision)
- ✅ Step 2 — Confirm context (auto-filled, fully editable)
- ✅ Step 3 — Structure & Style (points, difficulty slider, template)
- ✅ Step 4 — Generate & Refine (SSE streaming, per-exercise actions)
- ✅ Step 5 — Export (Word download, PDF/print, email, library save)

### UI — Components
- ✅ Button, Input, Select, Slider, Toggle
- ✅ Dropzone (drag-and-drop with file preview)
- ✅ ExerciseCard (full: corrigé toggle, barème, methodology, micro-barème, common mistakes)
- ✅ ExerciseEditor (inline editing of any exercise field)
- ✅ Skeleton loaders
- ✅ Toast notifications
- ✅ MathPlot (SVG graph rendering)
- ✅ ProGuard (free-tier paywall wrapper)
- ✅ TutorialOverlay (onboarding walkthrough)

### Generation Features
- ✅ Progressive SSE streaming (exercises appear as they're generated)
- ✅ Per-exercise actions: regenerate, make easier, make harder, edit, remove, save to bank
- ✅ Chapter coverage tracker (highlights missing chapters in red)
- ✅ Difficulty distribution bar
- ✅ Corrigé with barème, methodology, micro-barème, common mistakes
- ✅ Corrigé toggle (per-exercise reveal)
- ✅ Version A/B — real, AI-generated second variant (different numbers/wording/context, same difficulty & points, see `/api/generate/version-b`; replaced the old shuffle-only implementation 2026-09-27, `FOUNDER_DECISIONS.md` #9)
- ✅ Answer checker tools: math expression, statistics, chemistry (molar mass), physics constants (NIST CODATA)
- ✅ AI diagram tool (Mermaid), AI image tool, math plot tool, table tool (per-exercise)
- ✅ Question bank — save individual exercises to localStorage
- ✅ Cache — navigating back restores generated exercises (no re-generation)

### Math Rendering
- ✅ KaTeX inline + display math ($...$ and $$...$$)
- ✅ mhchem for chemistry (\ce{})
- ✅ Subscripted variables outside math auto-wrapped (R_1, Z_0, U_{CE})
- ✅ Bare Greek letters auto-wrapped (\Omega, \alpha, \mu …)
- ✅ \text{}, \vec{}, \frac{}{}, \sqrt{} outside math auto-wrapped
- ✅ Unclosed $ blocks handled gracefully (strip stray delimiter, treat rest as prose)
- ✅ Pipe tables with KaTeX cells
- ✅ Mermaid diagrams via /api/visual/mermaid
- ✅ Variation tables (sign-chart style)

### Auth
- ✅ /auth/login — Google + email/password
- ✅ /auth/register
- ✅ Auth middleware (protects /(app)/ routes via session cookie)
- ✅ User profile creation in Firestore on first login
- ✅ Session cookie via Firebase Admin

### Dashboard / Library
- ✅ /dashboard — recent exams, quota indicator, stat bar
- ✅ /library (bank page) — saved question bank
- ✅ /exam/[id] — exam detail view
- ⚠️ /teacher/students — built, but non-functional in production: always shows "No students yet" for every teacher (BUG-026, `firestore.rules` never permitted the teacher-scoped queries this page makes). Fix is written to disk but not yet deployed.
- ✅ /analytics — analytics placeholder
- ✅ /community — community feed

### Export
- ✅ Word export — docx library, 3 templates (classic, modern, formal)
- ✅ Include/exclude corrigé toggle respected in Word export
- ✅ PDF export — browser print dialog (KaTeX renders natively)
- ✅ Email delivery (Brevo) with corrigé toggle
- ✅ School header fields (name, class, teacher, date, logo)
- ✅ School logo upload (Pro)
- ✅ Version A/B export — Version B generated on-demand at Export (Pro-only), reflected in Word, PDF (`/print?variant=b`), and email
- ✅ Language override at export time

### Payments
- ✅ Stripe integration (checkout, portal, webhook)
- ✅ Free tier quota enforcement (1 lifetime exam)
- ✅ /pricing page
- ✅ /upgrade page
- ✅ Subscription management (grace period, renewal banner)
- ✅ Pro feature gates (logo, email, Version B, modern template)

### Admin
- ✅ /admin — user list, stats
- ✅ Admin API routes (quota, promo, reset trial, extend pro)

### Content / SEO
- ✅ Blog (8 articles + auto-publish cron)
- ✅ SEO landing pages (Bac Libanais, Bac Français, IB)
- ✅ Contact form
- ✅ Privacy policy, Terms of service
- ✅ About page

---

## v1.1 — Post-MVP (Target: Q4 2026)

- ❌ Arabic language support (RTL layout, Arabic math conventions)
- ❌ Biology / SVT subject
- ❌ Informatics / Computer Science subject
- ❌ Custom .docx format upload (parse teacher's own template)
- ❌ Firestore persistence for draft exams (currently sessionStorage only)
- ❌ Question bank server-side sync (currently localStorage only)
- ❌ Dark mode polish
- ❌ Mobile-first improvements (currently desktop-primary)

## v2 — School Accounts (Target: 2027)

- 💭 School admin accounts (one subscription, multiple teachers)
- 💭 Shared question bank per school
- 💭 Homework generator (same workflow, different output)
- 💭 Lesson plan generator
- 💭 AI grading assistant
- 💭 Analytics — question difficulty stats per teacher
- 💭 Integration with Lebanese school platforms
- 💭 LaTeX rendering in Word/PDF exports (requires server-side mathjax-node)

---

## Recently Completed

| Date | Item |
|---|---|
| 2026-04 | Project scaffold and full documentation |
| 2026-04 | Curriculum data (all 4 curricula, Math/Physics/Chemistry) |
| 2026-04 | Landing page design |
| 2026-04 | Full 5-step workflow (Describe → Confirm → Structure → Generate → Export) |
| 2026-04 | Auth (Google + email/password, session cookie, middleware) |
| 2026-04 | Stripe payments + subscription management |
| 2026-04 | Word export (3 templates) + PDF print + email delivery |
| 2026-04 | Blog (8 articles) + SEO landing pages |
| 2026-07 | Revert accent colour to emerald #1a5e3f (was accidentally changed to indigo) |
| 2026-07 | Math rendering overhaul: subscripts, Greek letters, \\text{}, \\frac{}{}, unclosed $ |
| 2026-07 | Fix: includeAnswerKey toggle now respected in Word + email export |
| 2026-07 | Fix: export page step indicator corrected to Step 5 of 5 |
| 2026-09 | Sociology curriculum (Bac Libanais), document sourcing/borders, per-exercise point overrides, fragment-level AI regeneration |
| 2026-09 | Fix: renderContent %%PTABLE%% leak, dropped paragraphs, RTL list indent |
| 2026-09 | Fix: /admin loading skeleton on initial fetch |
| 2026-09 | Add Vitest regression test for the www→apex redirect rule in `next.config.ts`; fix stale assertion in `generate-prompts.test.ts` (BUG-015) |
| 2026-09-19 | Add scoped admin blog-post edit path: `GET /api/admin/blog` (list), `GET`/`PATCH /api/admin/blog/[id]` (fetch/update title, description, content, category by doc id), plus a minimal "Manage Existing Posts" panel in `/admin`'s Blog tab. Unblocks `content-curriculum`/`seo-growth`'s GEO pass (BlogCallout/BlogFAQ) on the 27 cron-generated posts — previously no edit path existed anywhere in the app (only add-if-missing seed routes and read-only admin diagnostics). All 3 new/touched routes reuse the existing `verifyIdToken` + `isAdmin` admin-auth pattern (see `src/lib/admin.ts`) and Zod-validate the PATCH body (`src/types/blog.ts`'s `BlogPostUpdateSchema`) — intentionally scoped, not a full CMS: no create/delete/publish-toggle, `slug`/`author`/`readTime`/`published`/`createdAt` untouched. `npm run type-check` clean. Not tested live (dev server not started — machine under memory pressure); verified by manual code review only. `qa` should verify with the e2e suite before this is trusted for real edits.
| 2026-09-29 | (nightly-ops) Closed out `CURRICULUM_COVERAGE_STRATEGY.md`'s "Exemplar-bank build-out" backlog (all 3 items). New `src/lib/schoolBank.ts`: `getChapterExemplars(curriculumId, levelId, subject, chapterId)` queries the real `schoolBank` collection (`curriculumId`/`subject`/`exercise.chapterIds array-contains chapterId`, the exact composite index `firestore.indexes.json` already has for `/api/tools/chapter-performance`) via `adminDb`, sorts up to 50 scanned docs by `sharedAt` in JS (no new Firestore index added — that file is `database`'s, and adding `sharedAt` to the existing index would've required one), returns top 2. New `src/lib/prompts/generate.ts` export `buildExemplarsPrompt()` (pure, sync — same convention as `buildTeacherStylePrompt`) formats results as a clearly-labeled "SCHOOL BANK EXEMPLARS (for inspiration ONLY — do NOT copy verbatim...)" block; no-op (`""`) when every chapter has 0 exemplars, which is the expected case for a long time post-launch. Wired into `/api/generate/route.ts`: fetches exemplars for up to 8 selected chapters in parallel (skipped for university mode and for adjustment/regenerate passes), passed into `buildGenerateUserPrompt`'s new optional 6th param. New types `src/types/schoolBank.ts` (`ChapterExemplar`, `ChapterExemplarGroup`) and Zod boundary `src/lib/schemas/schoolBank.ts` validating raw `schoolBank` docs before use (malformed/legacy docs are skipped, not thrown). 10 new Vitest tests in `src/__tests__/schoolBank-exemplars.test.ts` (0/1/2-exemplar cases), all pure — deliberately does not mock/exercise the real Firestore call, same pattern as every other prompt-builder test in this repo. **Used `adminDb`, not the client Firestore SDK**, despite the backlog item suggesting the client-SDK pattern `bank/page.tsx` uses — documented in `schoolBank.ts`'s own comment: `src/lib/firebase.ts`'s client SDK explicitly never initializes when `typeof window === "undefined"`, so it cannot be used inside `/api/generate/route.ts` (a Node.js API route) at all; `src/lib/teacherStyle.ts` and `/api/tools/chapter-performance/route.ts` already establish `adminDb` as the correct pattern for this exact kind of server-side prompt-context read from `schoolBank`. `npm run type-check` clean; `npm test` 227/227 (217 baseline + 10 new — first full-suite run hit transient vitest worker-pool timeouts unrelated to this change, confirmed by an immediate clean re-run). `npm run test:e2e` / `npm run test:rules` intentionally not run (unattended-run constraint) — `qa` should verify the generate flow still streams correctly, and `security` should sanity-check the new `schoolBank` read path (bounded, advisory-only, fails closed to `[]`, no user-supplied query params).
| 2026-10-01 | **Step 2 "AI notes" (`/create/confirm`) now auto-dismiss/reappear per field, not just a flat dismissible list.** `AnalyzeResult.warnings` (`src/types/exam.ts`) changed from `string[]` to `ExamContextWarning[]` — `{ field: string, message: string }`, `field` being an `ExamContext` key. `buildAnalyzeSystemPrompt()` (`src/lib/prompts/analyze.ts`) now asks for this per-field shape and restricts `field` to a named list of real `ExamContext` keys. `/api/analyze/route.ts`'s Zod schema accepts either the new object shape or a bare string (coerced to `{ field: "general", message }`) for provider robustness. `src/app/create/confirm/page.tsx`: snapshots the AI's original field values on load (`originalValues`); its `update()` helper and the curriculum-select handler now call a shared `reconcileWarningsForField(field, newValue)` that auto-adds a warning's index to `dismissedWarnings` when the teacher edits that field away from the AI's original value, and removes it again if they revert the edit back — no behavior change for fields with no warning attached. Checked `src/app/exam/[id]/page.tsx`'s own unrelated `warnings` (a student exam-taking mistake counter, not `AnalyzeResult.warnings`) — confirmed no overlap, not touched. Updated/added tests in `src/__tests__/analyze-prompts.test.ts` (new per-field-shape assertions). `npm run type-check` clean, `npm test` 262/262 (256 baseline + 6 new, this + the plot feature below). `qa` should verify the live flow: generate a context with a low-confidence field, edit it away then back, confirm the note disappears then reappears. `security` should review `/api/analyze`'s updated Zod boundary (still auth-gated via `verifySession`, no change to that). |
| 2026-10-01 | **Perf/cost: extended Claude prompt caching (`cache_control: { type: "ephemeral" }`) to the 4 Claude `messages.create()` calls that didn't have it** — `/api/generate/route.ts` already had it on its static system prompt (comment there: "cutting TTFT by ~50%"); this closes the gap for the other four. For each route, only the genuinely request-invariant system prompt got the `cache_control` block (array-of-blocks shape, same as the working route); all per-request content (teacher description, the specific exam/exercise/fragment being transformed) stays in the user message, uncached, same as before — no architecture change. `src/app/api/analyze/route.ts`: `buildAnalyzeSystemPrompt()` takes zero arguments, so the whole system prompt is cached — identical across *every* analyze call, not just same (language/curriculum/subject); added `prompt-caching-2024-07-31` to its existing `anthropic-beta` header (was `pdfs-2024-09-25` only). `src/app/api/exam/translate/route.ts`: `buildTranslateExamSystemPrompt(targetLanguage)` varies only by target language (3 values) — cached whole prompt, added the beta header (this call previously sent no `anthropic-beta` header at all). `src/app/api/exam/regenerate-fragment/route.ts`: `buildRegenerateFragmentSystemPrompt(context)` varies only by `(curriculumId, language)` — cached whole prompt + added header, but flagged in-code: this prompt is short enough (~a few hundred tokens) it may sit below Anthropic's ~1024-token minimum cacheable block size for Sonnet, so it may not produce an actual cache hit yet; harmless either way (a too-small cached block is simply not cached, no error), and keeps the shape consistent if the prompt grows later. `src/app/api/generate/version-b/route.ts` (the highest-value of the four per the task): confirmed it does **not** reuse `generate.ts`'s prompt builder — it has its own `buildVariantExamSystemPrompt(context)` in `src/lib/prompts/variantExam.ts`, which deliberately excludes curriculum/chapter grounding (see that file's own scope note) and in fact only varies by `context.language`, not by curriculum/subject at all — an even *broader* cache key than `/api/generate`'s (language, curriculum, subject) scope, so this should have the best cache-hit rate of the four. Did not touch any Gemini fallback code path (out of scope) or `src/app/api/cron/blog-auto-publish/route.ts`'s separate Claude call (not one of the four named routes). `npm run type-check` clean; `npm test` 262/262 passed. Not independently measured against real traffic (no AI cost/latency dashboard exists yet — `METRICS.md` already flags "AI cost per exam: not tracked" as a known gap this should help close once instrumented). `qa` should verify no generation regressions on translate/transform/Version B (same JSON output, same exercise count/order); this changes the real Claude API call shape for all three. A reasonable follow-up, intentionally not done here to stay in scope ("no architecture change"): `/api/analyze`'s `buildCurriculaReference()` output is also fully static but currently lives in the *user* prompt (mixed with the dynamic teacher description) — moving it into a second cached system block would likely be a bigger win than the system-prompt cache alone, since it's the largest static chunk in that route, but that's a real restructuring of the route, not just adding `cache_control` to what's already there.
