import { describe, it, expect } from "vitest";
import { ScientificService } from "@/lib/scientific";

// ScientificService (src/lib/scientific.ts) is a pure, local Math.js wrapper
// with no network or Firebase dependency — used by the unauthenticated
// /api/tools/stats route (src/app/api/tools/stats/route.ts) to compute
// descriptive statistics for numbers a teacher pastes in. It was previously
// completely untested even though it's real, user-facing computational logic
// (not just a prompt string), and its two `try { ... } catch { return null }`
// wrappers around `evaluate`/`convert` are exactly the kind of "does this
// actually fail closed instead of throwing" behavior worth locking down.

describe("ScientificService.evaluate", () => {
  it("evaluates a simple arithmetic expression", () => {
    expect(ScientificService.evaluate("2 + 2")).toBe(4);
  });

  it("evaluates an expression with functions", () => {
    expect(ScientificService.evaluate("sqrt(16)")).toBe(4);
  });

  it("returns null (not throw) for a malformed expression", () => {
    expect(ScientificService.evaluate("2 + * /")).toBeNull();
  });

  it("does not throw on a completely empty expression (Math.js returns undefined, not an error)", () => {
    // Note: unlike a malformed expression (caught by the try/catch and
    // normalized to null), an empty string doesn't throw at all — Math.js's
    // parser silently evaluates it to `undefined`. Documented here so a
    // future refactor doesn't assume every non-numeric result is `null`.
    expect(ScientificService.evaluate("")).toBeUndefined();
  });

  it("returns null instead of executing arbitrary unsafe input", () => {
    // Math.js's expression parser is sandboxed — it has no `import`/`require`
    // keyword, so this should fail to parse rather than doing anything.
    expect(ScientificService.evaluate("import('fs')")).toBeNull();
  });
});

describe("ScientificService.convert", () => {
  it("converts between compatible units (km -> m)", () => {
    expect(ScientificService.convert(10, "km", "m")).toBe(10000);
  });

  it("accepts a numeric value passed as a string", () => {
    expect(ScientificService.convert("5", "kg", "g")).toBe(5000);
  });

  it("converts temperature units correctly (not just linear scale)", () => {
    expect(ScientificService.convert(0, "celsius", "fahrenheit")).toBeCloseTo(32, 5);
  });

  it("returns null for a nonexistent unit", () => {
    expect(ScientificService.convert(10, "km", "bogusUnit")).toBeNull();
  });

  it("returns null when converting between incompatible dimensions (length -> mass)", () => {
    expect(ScientificService.convert(10, "km", "kg")).toBeNull();
  });
});

describe("ScientificService.stats", () => {
  const data = [1, 2, 3, 4, 5];

  it("computes mean", () => {
    expect(ScientificService.stats.mean(data)).toBe(3);
  });

  it("computes median", () => {
    expect(ScientificService.stats.median(data)).toBe(3);
  });

  it("computes max and min", () => {
    expect(ScientificService.stats.max(data)).toBe(5);
    expect(ScientificService.stats.min(data)).toBe(1);
  });

  it("computes sample variance and std dev", () => {
    // Sample (n-1) variance/std, matching Math.js's default — verified
    // against a plain Math.js call, not hand-derived, so this test would
    // catch an accidental switch to population variance.
    expect(ScientificService.stats.variance(data)).toBeCloseTo(2.5, 5);
    expect(ScientificService.stats.std(data)).toBeCloseTo(1.5811388, 5);
  });

  it("does not throw on a single-element array; variance/std collapse to 0", () => {
    expect(ScientificService.stats.mean([5])).toBe(5);
    expect(ScientificService.stats.variance([5])).toBe(0);
    expect(ScientificService.stats.std([5])).toBe(0);
  });

  it("handles negative numbers and decimals", () => {
    const mixed = [-4.5, 0, 4.5, 10];
    expect(ScientificService.stats.mean(mixed)).toBeCloseTo(2.5, 5);
    expect(ScientificService.stats.min(mixed)).toBe(-4.5);
    expect(ScientificService.stats.max(mixed)).toBe(10);
  });
});

describe("ScientificService.trig", () => {
  it("computes sin/cos/tan in radians by default", () => {
    expect(ScientificService.trig.sin(Math.PI / 2)).toBeCloseTo(1, 10);
    expect(ScientificService.trig.cos(0)).toBeCloseTo(1, 10);
    expect(ScientificService.trig.tan(0)).toBeCloseTo(0, 10);
  });

  it("computes sin/cos/tan in degrees when isDeg=true", () => {
    expect(ScientificService.trig.sin(30, true)).toBeCloseTo(0.5, 10);
    expect(ScientificService.trig.cos(60, true)).toBeCloseTo(0.5, 10);
    expect(ScientificService.trig.tan(45, true)).toBeCloseTo(1, 10);
  });

  it("computes inverse trig in radians by default", () => {
    expect(ScientificService.trig.asin(1)).toBeCloseTo(Math.PI / 2, 10);
    expect(ScientificService.trig.acos(1)).toBeCloseTo(0, 10);
    expect(ScientificService.trig.atan(1)).toBeCloseTo(Math.PI / 4, 10);
  });

  it("converts inverse trig results to degrees when toDeg=true", () => {
    expect(ScientificService.trig.asin(0.5, true)).toBeCloseTo(30, 5);
    expect(ScientificService.trig.acos(0.5, true)).toBeCloseTo(60, 5);
    expect(ScientificService.trig.atan(1, true)).toBeCloseTo(45, 5);
  });
});

describe("ScientificService.constants", () => {
  it("exposes pi and e matching native Math", () => {
    expect(ScientificService.constants.pi).toBeCloseTo(Math.PI, 10);
    expect(ScientificService.constants.e).toBeCloseTo(Math.E, 10);
  });

  it("exposes fixed physical constants used in exam generation prompts", () => {
    // These specific values are also hardcoded independently in
    // src/lib/physics.ts's PHYSICS_CONSTANTS — a mismatch between the two
    // would mean the AI-facing prompt and this on-demand calculator tool
    // disagree on g/c/G for the same exam.
    expect(ScientificService.constants.c).toBe(299792458);
    expect(ScientificService.constants.g).toBe(9.80665);
    expect(ScientificService.constants.G).toBeCloseTo(6.6743e-11, 15);
  });
});

describe("ScientificService.format", () => {
  it("formats to the default precision of 3 significant figures", () => {
    expect(ScientificService.format(3.14159265)).toBe("3.14");
  });

  it("formats to a custom precision", () => {
    expect(ScientificService.format(1 / 3, 6)).toBe("0.333333");
  });

  it("formats whole numbers without a spurious decimal", () => {
    expect(ScientificService.format(10)).toBe("10");
  });
});
