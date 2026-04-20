# Imtihan — امتحان

**AI-powered exam generator for Lebanese teachers.**

Generate professional exams + corrigés in minutes — perfectly matched to Bac Libanais, Bac Français, IB, or university courses.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in your keys (see Setup section below)

# 3. Run dev server
npm run dev
# → http://localhost:3000
```

## Project Structure

```
imtihan/
├── CLAUDE.md              ← AI agent instructions — READ FIRST
├── README.md              ← This file
├── ARCHITECTURE.md        ← Technical deep-dive
├── ROADMAP.md             ← What's planned
├── BUGS.md                ← Known issues
├── src/
│   ├── app/               ← Next.js routes + API endpoints
│   ├── components/        ← UI components
│   ├── lib/               ← Firebase, Anthropic, utils, prompts
│   ├── types/             ← TypeScript types (shared contracts)
│   └── data/curricula/    ← Curriculum chapter data (source of truth)
└── docs/                  ← Additional documentation
```

## Setup

### 1. Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Sign-in methods → Google + Email/Password
3. Enable **Firestore** → Start in production mode → Add rules from `docs/firestore.rules`
4. Enable **Storage**
5. Go to Project Settings → General → copy the config into `.env.local`
6. Go to Project Settings → Service Accounts → Generate new private key → copy into `.env.local`

### 2. Anthropic API

1. Get your API key from [console.anthropic.com](https://console.anthropic.com/settings/keys)
2. Add to `.env.local` as `ANTHROPIC_API_KEY`

### 3. Stripe (optional for MVP — add when paywall is ready)

1. Get keys from [dashboard.stripe.com](https://dashboard.stripe.com)
2. Add to `.env.local`

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run type-check` | TypeScript type check |
| `npm run lint` | ESLint |
| `npm run format` | Prettier format |

## Key Concepts

### Workflow Steps

1. **Describe** — teacher writes what they want + optional document upload
2. **Confirm** — auto-filled context review (curriculum, level, chapters, language)
3. **Structure** — difficulty mix, points, template, Version A/B
4. **Generate** — live-streamed exercises with per-exercise regeneration
5. **Export** — Word + PDF download, saved to library

### Curriculum Data

All curriculum chapters live in `src/data/curricula/`. This is the **single source of truth** — Claude only generates exercises for chapters defined here. Adding a new chapter = add it to the appropriate file.

### Prompt Architecture

All AI prompts are in `src/lib/prompts/`. They are versioned TypeScript files with named exports. Never inline prompts inside route handlers.

### Zod Validation

Every boundary (API request, API response, AI output) is validated with Zod. If Claude returns malformed JSON, we catch it gracefully and show a retry option — not a 500 error page.

## Curriculum Coverage (MVP)

| Curriculum | Levels | Subjects |
|---|---|---|
| Bac Libanais | EB9 → Terminale S | Math, Physics, Chemistry |
| Bac Français | Seconde → Terminale | Math, Physics, Chemistry |
| IB Diploma | MYP 5, DP SL/HL | Math (AA), Physics, Chemistry |
| University | L1–L3, M1–M2 | Free-form (teacher provides syllabus) |

## Design System

- **Fonts:** Fraunces (display serif) + Geist (sans) + Geist Mono
- **Palette:** Ink black · Cream off-white · Emerald `#1a5e3f` accent
- **Aesthetic:** Editorial — think The New Yorker meets Linear.app
- **Dark mode:** Supported via CSS custom properties + `.dark` class
- **Motion:** Framer Motion for workflow transitions

See `tailwind.config.ts` for design tokens.

## Team

- **Antoine** — Founder, product direction
- **Claude** — AI development assistant (read `CLAUDE.md` before starting any session)

## License

Private / All rights reserved — not open source yet.
