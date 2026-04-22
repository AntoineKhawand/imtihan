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
- ✅ Anthropic client singleton
- ✅ Prompt architecture (analyze.ts, generate.ts)
- ✅ /api/analyze route with Zod validation
- ✅ /api/generate route with SSE streaming
- ✅ SEO Strategy implemented (sitemap, robots, JSON-LD, metadata)
- ✅ GEO Strategy implemented (llms.txt, FAQ structured data, Vercel Analytics)
- ✅ CLAUDE.md, README, ARCHITECTURE, ROADMAP, BUGS

### UI — Workflow
- ✅ Global styles + design system (Fraunces + Geist, emerald palette)
- ✅ Root layout
- ✅ Landing page — hero, features, testimonials, pricing
- ✅ Step 1 — Describe + upload
- ✅ Step 2 — Confirm context (auto-filled form, editable)
- ✅ Step 3 — Structure & Style (header, difficulty, template, Version B)
- 🔨 Step 4 — Generate & refine (streaming preview, per-exercise actions)
- 📋 Step 5 — Export (Word + PDF download)

### UI — Components
- ✅ Button
- ✅ Dropzone
- 🔨 Input, Select, Slider, Toggle
- 🔨 ExerciseCard (preview + actions)
- 📋 Skeleton loaders
- 📋 Toast notifications (sonner)

### Auth
- 📋 /auth/login — Google + email/password
- 📋 /auth/register
- 📋 Auth middleware (protect /(app)/ routes)
- 📋 User profile creation in Firestore on first login

### Dashboard / Library
- 📋 /dashboard — recent exams, quota indicator
- 📋 /library — all saved exams, search + filter
- 📋 Exam detail page — re-open, regenerate, export

### Generation Features
- 📋 Version A/B — parallel generation with different numbers
- 📋 Per-exercise regeneration (keep everything else)
- 📋 Difficulty adjustment per exercise
- 📋 Corrigé with methodology (already in prompt — needs UI toggle)

### Export
- 📋 Word export — docx library, 4 templates
- 📋 PDF export — @react-pdf/renderer
- 📋 Email delivery (Resend)

### Payments
- 🔨 Stripe integration
- 🔨 Free tier quota enforcement (3 exams)
- 🔨 /pricing page
- 🔨 Subscription management

---

## v1.1 — Post-MVP (Target: Q4 2026)

- ❌ Arabic language support (RTL layout, Arabic math conventions)
- ❌ Biology / SVT subject
- ❌ Informatics / Computer Science subject
- ❌ Custom .docx format upload (parse teacher's own template, replicate format)
- ❌ Question bank — save/favorite individual exercises
- ❌ Exam tags + search in library
- ❌ Dark mode UI polish
- ❌ Mobile-first improvements

## v2 — School Accounts (Target: 2027)

- 💭 School admin accounts (one subscription, multiple teachers)
- 💭 Shared question bank per school
- 💭 Homework generator (same workflow, different output)
- 💭 Lesson plan generator
- 💭 AI grading assistant (scan student answer → AI grades + comments)
- 💭 Analytics — question difficulty stats per teacher
- 💭 Integration with Lebanese school platforms

---

## Recently Completed

| Date | Item |
|---|---|
| 2026-04 | Project scaffold and full documentation |
| 2026-04 | Curriculum data (all 4 curricula, Math/Physics/Chemistry) |
| 2026-04 | Landing page design |
| 2026-04 | Step 1 (Describe + upload) |
