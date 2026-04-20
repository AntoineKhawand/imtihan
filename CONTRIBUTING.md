# Contributing — Imtihan

Developer workflow, conventions, and process.

---

## Before You Start Any Session

1. **Read `CLAUDE.md`** — the entire file. It's the source of truth.
2. **Check `BUGS.md`** — is what you're about to fix already tracked?
3. **Check `ROADMAP.md`** — is what you're about to build in MVP scope?
4. **Run `npm run type-check`** — make sure the codebase is clean before you start.

---

## Branch Strategy

```
main          → production (Vercel auto-deploys)
dev           → integration (test here before merging to main)
feature/XXX   → individual features
fix/BUG-XXX   → bug fixes (reference the BUGS.md ID)
```

## Commit Convention

```
feat: add step 2 confirm context UI
fix(BUG-003): normalize difficultyMix when sum != 1.0
chore: update curriculum data — add EB10 physics chapters
docs: update ROADMAP — mark Step 1 as done
refactor: extract buildChaptersSummary to curricula/index.ts
```

## Adding a New Curriculum Chapter

1. Open the appropriate file in `src/data/curricula/`
2. Add the chapter under the correct level + subject
3. Include at minimum 3 learning objectives
4. Give it a unique, predictable ID: `{level}-{subject}-{topic}` (e.g. `ter-phys-waves`)
5. Run `npm run type-check` — the Chapter type will catch missing fields
6. Update `ROADMAP.md` if this is part of a tracked feature

## Adding a New Prompt

1. Create or update a file in `src/lib/prompts/`
2. Export a named function: `buildXxxPrompt(input: TypedInput): string`
3. Write a quick test in the comments: example input → expected JSON structure
4. Never hardcode a prompt inside a route handler

## Adding a New API Route

1. Create `src/app/api/your-route/route.ts`
2. Use Zod to validate the request body at the top of the handler
3. Use Zod to validate any AI response before returning it
4. Use `verifyIdToken()` for auth-protected routes
5. Handle all error cases — no unguarded `JSON.parse()` or `.json()` calls
6. Document the route in `ARCHITECTURE.md`

## Definition of Done (repeat from CLAUDE.md)

- [ ] Types in `src/types/` and imported everywhere
- [ ] Prompts in `src/lib/prompts/` with named exports
- [ ] Zod validates all AI and user input
- [ ] UI follows editorial aesthetic (Fraunces + Geist, emerald accent)
- [ ] Light and dark mode work
- [ ] Mobile-responsive (375px, 768px, 1440px)
- [ ] `npm run type-check` → 0 errors
- [ ] CLAUDE.md / ROADMAP.md / BUGS.md updated if needed
