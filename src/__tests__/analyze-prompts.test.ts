import { describe, it, expect } from "vitest";
import {
  buildAnalyzeSystemPrompt,
  buildAnalyzeUserPrompt,
} from "@/lib/prompts/analyze";

// Note: `buildCurriculaReference()` (also exported from this module) is not
// covered here. It does `require("@/data/curricula")` at call time — a
// deliberate choice per its own "Import here to avoid circular deps" comment
// — and under Vitest's module runner, unlike Next.js/webpack's build-time
// alias resolution, a bare `require("@/...")` does not resolve the `@` path
// alias (confirmed by reproduction: both an aliased and a relative
// extension-less `require()` from a test file fail to resolve, while the
// exact same specifier resolves fine as a static `import`). Testing it would
// require either changing that `require()` to a static import (an
// application-code behavior change, out of scope here — its own comment
// says it's there deliberately to avoid a circular dependency) or adding a
// Node-level module-resolution hook to the test runner. Flagging this as a
// real gap for engineering rather than a unit test to skip silently.

// ---------------------------------------------------------------------------
// buildAnalyzeSystemPrompt
// ---------------------------------------------------------------------------

describe("buildAnalyzeSystemPrompt", () => {
  it("declares the full ExamContext JSON schema", () => {
    const prompt = buildAnalyzeSystemPrompt();
    for (const field of [
      '"curriculumId"',
      '"levelId"',
      '"subject"',
      '"chapterIds"',
      '"language"',
      '"examType"',
      '"duration"',
      '"exerciseCount"',
      '"totalPoints"',
      '"difficultyMix"',
      '"teacherNotes"',
      '"generateVersionB"',
      '"warnings"',
      '"confidence"',
      '"layoutPreferences"',
      '"visualPreference"',
      '"geographicContext"',
    ]) {
      expect(prompt).toContain(field);
    }
  });

  it("instructs the model to return ONLY JSON, never prose", () => {
    const prompt = buildAnalyzeSystemPrompt();
    expect(prompt).toMatch(/ONLY a valid JSON object/i);
  });

  // Regression test: an earlier version of this prompt (commit 46a385b) told
  // the model to invent its own kebab-case chapterIds from the teacher's
  // wording instead of matching real curriculum data. That's exactly the
  // hallucination CLAUDE.md §4 forbids ("Any curriculum chapter the AI
  // references MUST exist in src/data/curricula/ ... otherwise we're
  // hallucinating exam content"). The rule was tightened to forbid inventing
  // ids — this locks that fix in place.
  it("forbids inventing/kebab-casing chapterIds when real CHAPTER_ID values are listed", () => {
    const prompt = buildAnalyzeSystemPrompt();
    expect(prompt).toMatch(/MUST select chapterIds ONLY from those exact real CHAPTER_ID strings/i);
    expect(prompt).toMatch(/never invent your own slug/i);
    expect(prompt).toMatch(/never kebab-case the teacher's own wording/i);
  });

  it("only allows a free-form kebab-case fallback when no CHAPTER_ID values exist for the subject, and requires a warning", () => {
    const prompt = buildAnalyzeSystemPrompt();
    expect(prompt).toMatch(/Only fall back to inferring a short kebab-case identifier.*when NO CHAPTER_ID values are listed/i);
    expect(prompt).toMatch(/add a note to "warnings"/i);
  });

  it("always returns an empty chapterIds array for university", () => {
    const prompt = buildAnalyzeSystemPrompt();
    expect(prompt).toMatch(/For university, always return \[\]\./);
  });

  it("requires difficultyMix to sum to exactly 1.0 with the documented default", () => {
    const prompt = buildAnalyzeSystemPrompt();
    expect(prompt).toMatch(/sum to exactly 1\.0/);
    expect(prompt).toContain("easy: 0.20, medium: 0.45, hard: 0.35");
  });
});

// ---------------------------------------------------------------------------
// buildAnalyzeUserPrompt
// ---------------------------------------------------------------------------

describe("buildAnalyzeUserPrompt", () => {
  it("wraps the teacher description and curriculum reference in their own tags", () => {
    const prompt = buildAnalyzeUserPrompt({
      teacherDescription: "Un examen de maths sur les suites, niveau terminale S",
      hasUploadedDocument: false,
      availableCurricula: "CURRICULUM: bac-libanais",
    });
    expect(prompt).toContain("<teacher_description>\nUn examen de maths sur les suites, niveau terminale S\n</teacher_description>");
    expect(prompt).toContain("<curriculum_reference>\nCURRICULUM: bac-libanais\n</curriculum_reference>");
  });

  it("omits the uploaded_document block and its trailing clause when no document was uploaded", () => {
    const prompt = buildAnalyzeUserPrompt({
      teacherDescription: "desc",
      hasUploadedDocument: false,
      availableCurricula: "ref",
    });
    expect(prompt).not.toContain("<uploaded_document>");
    expect(prompt).not.toContain("and the uploaded document");
    expect(prompt).toMatch(/Based on the teacher's description, extract the exam specification as JSON\.$/);
  });

  it("includes the uploaded_document block and its trailing clause when a document was uploaded", () => {
    const prompt = buildAnalyzeUserPrompt({
      teacherDescription: "desc",
      hasUploadedDocument: true,
      availableCurricula: "ref",
    });
    expect(prompt).toContain("<uploaded_document>A document has been uploaded.");
    expect(prompt).toMatch(/Based on the teacher's description and the uploaded document, extract the exam specification as JSON\.$/);
  });
});
