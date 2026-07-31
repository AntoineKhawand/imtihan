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
- ✅ Step 3 — Structure & Style (points, difficulty slider, template, Version B)
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
- ✅ Version A/B (number shuffling via deterministic seed)
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
- ✅ /teacher/students — student management placeholder
- ✅ /analytics — analytics placeholder
- ✅ /community — community feed

### Export
- ✅ Word export — docx library, 3 templates (classic, modern, formal)
- ✅ Include/exclude corrigé toggle respected in Word export
- ✅ PDF export — browser print dialog (KaTeX renders natively)
- ✅ Email delivery (Brevo) with corrigé toggle
- ✅ School header fields (name, class, teacher, date, logo)
- ✅ School logo upload (Pro)
- ✅ Version A/B export
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
