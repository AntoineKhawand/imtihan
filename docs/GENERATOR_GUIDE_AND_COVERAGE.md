# Generator defaults, walkthrough and coverage reporting

Implemented 2026-10-10; application deployment is required.

New analysis defaults to 100% hard exercises within the chosen syllabus. Explicit easier or mixed requests remain supported. Confirm settings now exposes Hard, Medium, Easy and Mixed; existing custom mixes are preserved. Missing, invalid or zero mixes fall back to Hard.

A replayable **How to use** walkthrough is available at every generator stage for every plan. It opens once per generator stage after its controls appear (the review stage waits until generation completes) and explains visible controls, required choices, quota implications, editing, solutions and exports. It supports Next, Back, Escape, focus trapping and focus restoration. The guide never initiates generation, downloads or email.

## Coverage semantics and rollout

The server records one selection and zero or one tagging miss per distinct valid selected chapter, capped at 20, for fresh generations meeting the existing completion threshold. Adjustments, university exams and severely truncated generations are excluded. Missing tags do not prove missing topic content. Reports are advisory and do not change prompts.

New admin-only chapterCoverageDaily documents are keyed by UTC day plus a SHA-256 hash of curriculum, level, subject and chapter. Each contains the scope, day, selectionCount, missCount and lastMissedAt when applicable. No teacher identifier or exam content is stored. Existing Firestore deny-all rules block direct client reads and writes; the authenticated admin route provides access.

The 7/28-day report includes today in UTC, groups by class level, displays readable names, denominators, rates and small-sample labels, and shows persistent failures with Retry. Rates divide summed misses by summed selections. Reads are capped at 5,001; over 5,000 rows fail rather than display partial rates. No composite index is needed for the single-field day range/order query.

Legacy chapterCoverageMisses data remains untouched and is excluded because its selection totals and dates are unknown. New rates begin accumulating after deployment; there is no historical backfill. Recording is awaited separately from quota accounting; failures are logged and can still leave telemetry gaps. Live authenticated generation/report verification remains to be performed after deployment.

## October 11 correction

Removed the timed 20-second homepage demo and its Watch link. The free-exam CTA remains. Guidance is provided by highlights on actual generator buttons and sections, with Next, Back, Skip and replay on each stage. Visit history is stored separately per stage.
