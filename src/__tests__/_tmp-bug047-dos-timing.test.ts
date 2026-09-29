import { describe, it, expect } from "vitest";
import { convertBraceCommands, cleanLatexForWord } from "@/app/api/export/route";

// Empirical DoS-timing verification for BUG-047 (security nightly, 2026-09-29).
// src/__tests__/export-latex-convert.test.ts already has its own bounded-time
// regression assertions for this bug; this file is a superset written to log
// actual elapsed-ms numbers (see SECURITY.md's 2026-09-27 entry, "empirical
// confirmation" addendum) across the specific adversarial shapes this dispatch
// was asked to verify: a 200k-repeat payload well past MAX_CONVERT_LEN, the
// worst case *within* the cap (pre-fix O(n^2) zone), and the realistic
// worst-case full /api/export request (100 exercises x RequestSchema's
// 30,000-char max per string field).
//
// NOTE: this file was originally written as a throwaway scratch script (hence
// the `_tmp-` prefix) meant to be deleted after one run -- this session's Bash
// access denied `rm`/`mv` (same restriction the 2026-09-27 review hit), so it
// was kept and repurposed as a permanent regression file instead of being left
// as dead/orphaned scratch output. Rename (drop the `_tmp-` prefix) at will;
// content and assertions are real and meant to stay.

function time(label: string, fn: () => void) {
  const t0 = Date.now();
  fn();
  const ms = Date.now() - t0;
  console.log(`[BUG-047 timing] ${label}: ${ms}ms`);
  return ms;
}

describe("BUG-047 empirical DoS timing", () => {
  it("200k-char \\frac{ repeated -- well past the 10,000-char MAX_CONVERT_LEN cap", () => {
    const input = "\\frac{".repeat(200_000); // 1,200,000 chars
    const ms = time("convertBraceCommands, 1.2M chars (\\frac{ x200k)", () => {
      const out = convertBraceCommands(input);
      expect(out.length).toBe(input.length); // bail-out path returns input unchanged
    });
    expect(ms).toBeLessThan(1000);
  });

  it("200k-char \\sqrt{ repeated -- well past the cap", () => {
    const input = "\\sqrt{".repeat(200_000);
    const ms = time("convertBraceCommands, 1.2M chars (\\sqrt{ x200k)", () => {
      convertBraceCommands(input);
    });
    expect(ms).toBeLessThan(1000);
  });

  it("worst case WITHIN the cap: unbalanced \\frac{ repeated up to ~9,999 chars (pre-fix O(n^2) zone)", () => {
    const input = "\\frac{".repeat(1_666); // 9,996 chars, just under MAX_CONVERT_LEN
    const ms = time("convertBraceCommands, 9,996 chars (\\frac{ x1666, AT the cap boundary)", () => {
      convertBraceCommands(input);
    });
    expect(ms).toBeLessThan(2000);
  });

  it("worst case WITHIN the cap: unbalanced \\sqrt{ repeated up to ~9,999 chars", () => {
    const input = "\\sqrt{".repeat(1_666);
    const ms = time("convertBraceCommands, 9,996 chars (\\sqrt{ x1666, AT the cap boundary)", () => {
      convertBraceCommands(input);
    });
    expect(ms).toBeLessThan(2000);
  });

  it("full cleanLatexForWord() pipeline at the RequestSchema max string length (30,000 chars)", () => {
    const input = "\\frac{".repeat(5_000); // 30,000 chars -- exact MAX_TEXT_LEN a real request could send
    const ms = time("cleanLatexForWord, 30,000 chars (\\frac{ x5000, RequestSchema.longText max)", () => {
      cleanLatexForWord(input);
    });
    expect(ms).toBeLessThan(2000);
  });

  it("100 exercises x 30,000-char solution.methodology each -- the actual maximum a single /api/export request can carry per RequestSchema (100 exercises cap)", () => {
    const perField = "\\sqrt{".repeat(5_000); // 30,000 chars, MAX_TEXT_LEN
    const ms = time("cleanLatexForWord x100 fields, 30,000 chars each (worst-case full request)", () => {
      for (let i = 0; i < 100; i++) {
        cleanLatexForWord(perField);
      }
    });
    expect(ms).toBeLessThan(5000);
  });
});
