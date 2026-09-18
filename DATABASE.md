# Database — Imtihan

> Owned by the `database` team. Firestore schema, security rules, and index decisions live here — the reasoning behind them, not just the current state (that's always readable straight from `firestore.rules` / `firestore.indexes.json`).

---

## Collections

| Collection | Owner doc shape | Notes |
|---|---|---|
| `users/{uid}` | `UserProfile` (`src/types/user.ts`) | Teacher/school-admin accounts. Self-owned read/write. |
| `users/{uid}/exams/{examId}` | `Exam` (`src/types/`) | Saved exams. Self-owned. |
| `schoolBank/{id}` | shared exercise | Cross-teacher within a school. Requires the `schoolSlug`+`sharedAt` composite index (BUG-013). |
| `student_profiles/{uid}` | `StudentProfile` (`src/types/student.ts`) | Self-owned by the student. Teachers get school-scoped `list` access (BUG-026, fixed on disk 2026-09-18, not yet deployed). |
| `student_attempts/{attemptId}` | practice-history record | Self-owned by the student (`userId` field). Teachers get access scoped by the *target* student's real school, not their own claim (closes a spoofing hole — see BUG-026). |

## Known gaps / decisions log

- **2026-09-18 — BUG-026**: `firestore.rules` never granted teachers `list` access to `student_profiles`/`student_attempts` at all — the `/teacher/students` feature has been non-functional since it shipped (`51e4c7f`). Fixed on disk: school-scoped `list` rules plus two new composite indexes. **Not yet deployed** — needs `firebase deploy --only firestore:rules,firestore:indexes` and ideally a review/emulator test first, since it's a security-rule change gating real student data.
- **Pattern to watch**: BUG-011 (rules never deployed, 4 months of broken client reads), BUG-013 (missing composite index), BUG-026 (missing rule entirely) are the same underlying failure mode — the deployed Firestore state silently drifts from what the repo assumes. A periodic "does the live project's rules/indexes actually match `firestore.rules`/`firestore.indexes.json`" check is worth doing, not just a code review.
- **Deploy guardrail**: per `CLAUDE.md` §12/§15, actually deploying rules or indexes to Firebase is the founder's action, not something any agent should run.

## Open questions for the founder

- None currently — add here when a schema/rules decision needs a business call (e.g. data-retention policy, cross-school sharing scope) rather than a technical one.
