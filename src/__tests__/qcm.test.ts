import { describe, it, expect } from "vitest";
import type { Exercise, McqOption } from "@/types/exam";

// ---------------------------------------------------------------------------
// Inline copies of the pure helpers from generate/route.ts so tests run
// without Next.js server-side imports (firebase-admin, etc.)
// ---------------------------------------------------------------------------

function extractJSON(raw: string): string {
  const stripped = raw.replace(/```[\w]*\n?/g, "").replace(/```/g, "").trim();
  let start = -1;
  for (let i = 0; i < stripped.length; i++) {
    if (stripped[i] === "[" || stripped[i] === "{") { start = i; break; }
  }
  if (start === -1) return stripped;
  const open = stripped[start];
  const close = open === "[" ? "]" : "}";
  let depth = 0, inString = false, escaped = false;
  for (let i = start; i < stripped.length; i++) {
    const ch = stripped[i];
    if (escaped) { escaped = false; continue; }
    if (ch === "\\" && inString) { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === open) depth++;
    else if (ch === close && --depth === 0) return stripped.slice(start, i + 1);
  }
  return stripped.slice(start);
}

function sanitizeJSON(input: string): string {
  let text = input
    .replace(/[“”„]/g, '"')
    .replace(/[‘’‚]/g, "'")
    .replace(/ /g, " ");

  let out = "";
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (!inString) {
      if (ch === '"') { inString = true; out += ch; continue; }
      if (ch === ",") {
        let j = i + 1;
        while (j < text.length && /\s/.test(text[j])) j++;
        if (text[j] === "}" || text[j] === "]") continue;
      }
      out += ch;
      continue;
    }
    if (ch === "\\") {
      const next = text[i + 1];
      const validEscapes = '"\\/bfnrtu';
      if (next !== undefined && validEscapes.includes(next)) {
        out += ch + next; i++;
      } else {
        out += "\\\\";
      }
      continue;
    }
    if (ch === '"') { inString = false; out += ch; continue; }
    if (ch === "\n") { out += "\\n"; continue; }
    if (ch === "\r") { out += "\\r"; continue; }
    if (ch === "\t") { out += "\\t"; continue; }
    const code = ch.charCodeAt(0);
    if (code < 0x20) continue;
    out += ch;
  }
  if (inString) out += '"';
  let depthObj = 0, depthArr = 0, inStr = false, esc = false;
  for (let i = 0; i < out.length; i++) {
    const c = out[i];
    if (esc) { esc = false; continue; }
    if (c === "\\" && inStr) { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === "{") depthObj++;
    else if (c === "}") depthObj--;
    else if (c === "[") depthArr++;
    else if (c === "]") depthArr--;
  }
  while (depthObj-- > 0) out += "}";
  while (depthArr-- > 0) out += "]";
  return out;
}

function robustParse(text: string): unknown {
  try { return JSON.parse(text); } catch { /* */ }
  try { return JSON.parse(sanitizeJSON(text)); } catch { /* */ }
  throw new Error("All JSON parse strategies failed");
}

// ---------------------------------------------------------------------------
// MCQ domain helpers
// ---------------------------------------------------------------------------

function getCorrectOption(options: McqOption[]): McqOption | undefined {
  return options.find((o) => o.isCorrect);
}

function validateMcqOptions(options: McqOption[]): string[] {
  const errors: string[] = [];
  const correctCount = options.filter((o) => o.isCorrect).length;
  if (correctCount !== 1) errors.push(`Expected exactly 1 correct option, got ${correctCount}`);
  const labels = options.map((o) => o.label);
  const unique = new Set(labels);
  if (unique.size !== labels.length) errors.push("Duplicate option labels detected");
  return errors;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("McqOption type", () => {
  it("has required fields", () => {
    const opt: McqOption = { label: "A", text: "Paris", isCorrect: true };
    expect(opt.label).toBe("A");
    expect(opt.text).toBe("Paris");
    expect(opt.isCorrect).toBe(true);
  });
});

describe("validateMcqOptions", () => {
  const validOptions: McqOption[] = [
    { label: "A", text: "4 m/s",  isCorrect: false },
    { label: "B", text: "9 m/s",  isCorrect: true  },
    { label: "C", text: "12 m/s", isCorrect: false },
    { label: "D", text: "3 m/s",  isCorrect: false },
  ];

  it("passes for a well-formed set of 4 options", () => {
    expect(validateMcqOptions(validOptions)).toHaveLength(0);
  });

  it("fails when no option is correct", () => {
    const none = validOptions.map((o) => ({ ...o, isCorrect: false }));
    expect(validateMcqOptions(none)).toContain("Expected exactly 1 correct option, got 0");
  });

  it("fails when multiple options are correct", () => {
    const two = validOptions.map((o) => ({ ...o, isCorrect: true }));
    const errs = validateMcqOptions(two);
    expect(errs.some((e) => e.includes("got 4"))).toBe(true);
  });

  it("fails when labels are duplicated", () => {
    const dupe: McqOption[] = [
      { label: "A", text: "foo", isCorrect: true  },
      { label: "A", text: "bar", isCorrect: false },
      { label: "C", text: "baz", isCorrect: false },
      { label: "D", text: "qux", isCorrect: false },
    ];
    expect(validateMcqOptions(dupe)).toContain("Duplicate option labels detected");
  });
});

describe("getCorrectOption", () => {
  it("returns the correct option", () => {
    const options: McqOption[] = [
      { label: "A", text: "Wrong",   isCorrect: false },
      { label: "B", text: "Correct", isCorrect: true  },
      { label: "C", text: "Wrong",   isCorrect: false },
      { label: "D", text: "Wrong",   isCorrect: false },
    ];
    expect(getCorrectOption(options)?.label).toBe("B");
    expect(getCorrectOption(options)?.text).toBe("Correct");
  });

  it("returns undefined when no option is correct", () => {
    const options: McqOption[] = [
      { label: "A", text: "foo", isCorrect: false },
      { label: "B", text: "bar", isCorrect: false },
    ];
    expect(getCorrectOption(options)).toBeUndefined();
  });
});

describe("Exercise type with QCM options", () => {
  it("accepts an exercise with options", () => {
    const ex: Partial<Exercise> = {
      type: "multiple_choice",
      options: [
        { label: "A", text: "Hydrogen", isCorrect: false },
        { label: "B", text: "Oxygen",   isCorrect: true  },
        { label: "C", text: "Carbon",   isCorrect: false },
        { label: "D", text: "Nitrogen", isCorrect: false },
      ],
    };
    expect(ex.options).toHaveLength(4);
    expect(ex.options?.filter((o) => o.isCorrect)).toHaveLength(1);
  });

  it("options field is optional (non-MCQ exercises need no options)", () => {
    const ex: Partial<Exercise> = { type: "calculation" };
    expect(ex.options).toBeUndefined();
  });
});

describe("extractJSON", () => {
  it("strips markdown fences and extracts array", () => {
    const raw = "```json\n[{\"type\":\"multiple_choice\"}]\n```";
    expect(extractJSON(raw)).toBe('[{"type":"multiple_choice"}]');
  });

  it("handles trailing prose after the closing bracket", () => {
    const raw = '[{"id":"1"}] Here is some extra text';
    expect(extractJSON(raw)).toBe('[{"id":"1"}]');
  });

  it("handles object input (single exercise)", () => {
    const raw = '{"type":"multiple_choice","points":2}';
    expect(extractJSON(raw)).toBe('{"type":"multiple_choice","points":2}');
  });
});

describe("sanitizeJSON", () => {
  it("removes trailing commas before ]", () => {
    const input = '[{"a":1,}]';
    expect(() => JSON.parse(sanitizeJSON(input))).not.toThrow();
  });

  it("removes trailing commas before }", () => {
    const input = '{"a":1,"b":2,}';
    expect(() => JSON.parse(sanitizeJSON(input))).not.toThrow();
  });

  it("normalises smart quotes", () => {
    const input = '{“a”:1}';
    const result = sanitizeJSON(input);
    expect(result).toBe('{"a":1}');
  });

  it("closes unclosed arrays at end of truncated response", () => {
    const truncated = '[{"type":"multiple_choice","options":[{"label":"A"';
    const fixed = sanitizeJSON(truncated);
    expect(fixed.endsWith("]")).toBe(true);
  });
});

describe("robustParse with MCQ JSON", () => {
  it("parses a valid MCQ exercise array", () => {
    const json = JSON.stringify([{
      id: "1", number: 1, type: "multiple_choice", difficulty: "easy",
      points: 2, statement: "What is H2O?",
      options: [
        { label: "A", text: "Water",  isCorrect: true  },
        { label: "B", text: "Salt",   isCorrect: false },
        { label: "C", text: "Sugar",  isCorrect: false },
        { label: "D", text: "Oxygen", isCorrect: false },
      ],
      subQuestions: null,
      solution: { finalAnswer: "A — Water", methodology: "", commonMistakes: [], bareme: [], microBareme: [] },
      chapterIds: [], estimatedMinutes: 2,
    }]);
    const result = robustParse(extractJSON(json)) as any[];
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("multiple_choice");
    expect(result[0].options).toHaveLength(4);
    expect(result[0].options[0].isCorrect).toBe(true);
  });

  it("parses MCQ with trailing comma (common AI output artifact)", () => {
    const dirty = '[{"type":"multiple_choice","options":[{"label":"A","text":"foo","isCorrect":true,}],}]';
    const result = robustParse(extractJSON(dirty)) as any[];
    expect(result[0].options[0].isCorrect).toBe(true);
  });

  it("parses MCQ with LaTeX in option text", () => {
    const json = JSON.stringify([{
      type: "multiple_choice",
      options: [
        { label: "A", text: "$v = 12\\\\text{ m/s}$", isCorrect: false },
        { label: "B", text: "$v = 9\\\\text{ m/s}$",  isCorrect: true  },
        { label: "C", text: "$v = 6\\\\text{ m/s}$",  isCorrect: false },
        { label: "D", text: "$v = 3\\\\text{ m/s}$",  isCorrect: false },
      ],
    }]);
    const result = robustParse(extractJSON(json)) as any[];
    expect(result[0].options.find((o: McqOption) => o.isCorrect)?.label).toBe("B");
  });
});

describe("QCM quota guard logic", () => {
  it("counts as enough when generated >= 50% of requested", () => {
    const exerciseCount = 6;
    const generated = 4;
    const minAcceptable = Math.max(1, Math.ceil(exerciseCount * 0.5));
    expect(generated >= minAcceptable).toBe(true);
  });

  it("does not count when generated < 50% of requested", () => {
    const exerciseCount = 10;
    const generated = 3;
    const minAcceptable = Math.max(1, Math.ceil(exerciseCount * 0.5));
    expect(generated >= minAcceptable).toBe(false);
  });

  it("always counts when only 1 exercise was requested and 1 was generated", () => {
    const exerciseCount = 1;
    const generated = 1;
    const minAcceptable = Math.max(1, Math.ceil(exerciseCount * 0.5));
    expect(generated >= minAcceptable).toBe(true);
  });
});
