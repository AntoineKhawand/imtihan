import { describe, it, expect } from "vitest";
import {
  cn,
  formatDuration,
  truncate,
  formatDate,
  shortId,
  slugify,
  FREE_EXAM_LIMIT,
  SUBJECT_LABELS,
  LANGUAGE_LABELS,
  EXAM_TYPE_LABELS,
  DIFFICULTY_LABELS,
} from "@/lib/utils";

describe("cn()", () => {
  it("joins simple class strings", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values (undefined/null/false/empty string)", () => {
    expect(cn("a", undefined, null, false, "", "b")).toBe("a b");
  });

  it("resolves conflicting Tailwind utilities, keeping the last one", () => {
    // tailwind-merge's whole purpose: last conflicting class in the same
    // group wins instead of both being emitted (which would let CSS source
    // order decide instead of call-site intent).
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("supports conditional object syntax", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });

  it("supports arrays of class values", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c");
  });

  it("returns an empty string for no meaningful input", () => {
    expect(cn()).toBe("");
    expect(cn(undefined, null, false)).toBe("");
  });
});

describe("formatDuration()", () => {
  it("formats pure minutes under an hour", () => {
    expect(formatDuration(45)).toBe("45 min");
  });

  it("formats zero minutes", () => {
    expect(formatDuration(0)).toBe("0 min");
  });

  it("formats an exact number of hours with no remainder", () => {
    expect(formatDuration(60)).toBe("1h");
    expect(formatDuration(120)).toBe("2h");
  });

  it("formats hours with a zero-padded minute remainder", () => {
    expect(formatDuration(90)).toBe("1h30");
    expect(formatDuration(65)).toBe("1h05");
  });

  it("handles durations spanning multiple hours with remainder", () => {
    expect(formatDuration(185)).toBe("3h05");
  });
});

describe("truncate()", () => {
  it("returns the original string unchanged when under the limit", () => {
    expect(truncate("short", 10)).toBe("short");
  });

  it("returns the original string unchanged when exactly at the limit", () => {
    expect(truncate("exactly10!", 10)).toBe("exactly10!");
  });

  it("truncates and appends an ellipsis when over the limit", () => {
    expect(truncate("this is a long sentence", 10)).toBe("this is...");
    expect(truncate("this is a long sentence", 10).length).toBe(10);
  });

  it("handles an empty string", () => {
    expect(truncate("", 5)).toBe("");
  });

  it("documents current behavior for a maxLength smaller than the ellipsis (edge case, not a guaranteed contract)", () => {
    // str.slice(0, maxLength - 3) with maxLength < 3 yields a negative end
    // index, which String.slice treats as counting from the end of the
    // string rather than clamping to 0 — so a maxLength of 2 does NOT
    // throw and does NOT produce a short, ~2-char result; the returned
    // string is actually *longer* than the input minus one character.
    // Documented here so a future change to this function has a
    // regression test to flip deliberately, not by accident.
    expect(truncate("hello world", 2)).toBe("hello worl...");
  });
});

describe("formatDate()", () => {
  it("formats a unix timestamp as a short fr-LB date", () => {
    // 2024-01-15T00:00:00Z
    const formatted = formatDate(new Date("2024-01-15T00:00:00Z").getTime());
    expect(formatted).toContain("2024");
    expect(formatted).toMatch(/15/);
  });

  it("produces a non-empty string for epoch zero", () => {
    expect(formatDate(0).length).toBeGreaterThan(0);
  });
});

describe("shortId()", () => {
  it("generates a non-empty alphanumeric string", () => {
    const id = shortId();
    expect(id.length).toBeGreaterThan(0);
    expect(id).toMatch(/^[a-z0-9]+$/);
  });

  it("generates different IDs across calls (not a hardcoded constant)", () => {
    const ids = new Set(Array.from({ length: 20 }, () => shortId()));
    expect(ids.size).toBeGreaterThan(1);
  });
});

describe("slugify()", () => {
  it("lowercases and hyphenates plain ascii text", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("transliterates accented Latin characters instead of dropping them (regression — see BUGS.md)", () => {
    // This is the exact documented real-world bug: before this function
    // existed, accented titles silently lost their accented letters
    // entirely rather than having them transliterated, producing a
    // mangled slug. Asserting the exact documented before/after pair.
    expect(slugify("Générateur d'Examens Bac Français")).toBe(
      "generateur-dexamens-bac-francais"
    );
  });

  it("transliterates ç (cedilla) via its NFD decomposition", () => {
    expect(slugify("Garçon")).toBe("garcon");
  });

  it("strips apostrophes without leaving a stray hyphen", () => {
    expect(slugify("teacher's exam")).toBe("teachers-exam");
  });

  it("collapses multiple consecutive spaces into a single hyphen", () => {
    expect(slugify("too   many    spaces")).toBe("too-many-spaces");
  });

  it("strips punctuation that is not a word character or space", () => {
    expect(slugify("What?! Really...")).toBe("what-really");
  });

  it("handles an empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("preserves digits", () => {
    expect(slugify("Bac 2026 Session 1")).toBe("bac-2026-session-1");
  });
});

describe("static label maps and constants", () => {
  it("FREE_EXAM_LIMIT is 1 per the confirmed free-tier decision (CLAUDE.md §8)", () => {
    expect(FREE_EXAM_LIMIT).toBe(1);
  });

  it("every SUBJECT_LABELS entry has fr/en/ar translations", () => {
    for (const [key, labels] of Object.entries(SUBJECT_LABELS)) {
      expect(labels.fr, `${key}.fr`).toBeTruthy();
      expect(labels.en, `${key}.en`).toBeTruthy();
      expect(labels.ar, `${key}.ar`).toBeTruthy();
    }
  });

  it("LANGUAGE_LABELS covers the three MVP-relevant languages", () => {
    expect(LANGUAGE_LABELS).toMatchObject({
      french: expect.any(String),
      english: expect.any(String),
      arabic: expect.any(String),
    });
  });

  it("every EXAM_TYPE_LABELS and DIFFICULTY_LABELS entry has fr/en/ar translations", () => {
    for (const map of [EXAM_TYPE_LABELS, DIFFICULTY_LABELS]) {
      for (const [key, labels] of Object.entries(map)) {
        expect(labels.fr, `${key}.fr`).toBeTruthy();
        expect(labels.en, `${key}.en`).toBeTruthy();
        expect(labels.ar, `${key}.ar`).toBeTruthy();
      }
    }
  });
});
