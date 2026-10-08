import { describe, it, expect, beforeAll } from "vitest";
import JSZip from "jszip";
import { generateWordDocument } from "@/app/api/export/route";

// ---------------------------------------------------------------------------
// generateWordDocument() (src/app/api/export/route.ts) is the function that
// actually assembles the exported .docx a teacher downloads — the real
// behavior BUG-051 (real server-side math-plot PNG + fallback), BUG-052/057
// (plot-equation XSS/DoS guards), and the inline "Code Leaks" cleanup
// (backtick-math / nested \ce{\ce{}} repair) all depend on. Before this file
// it had zero committed, automated coverage — BUG-051's own entry says it was
// only ever verified once via a throwaway local script that was deleted
// after inspection ("scratch script and output deleted after inspection, not
// committed"). This file turns that same manual-verification technique
// (generate a real .docx buffer, unzip it with JSZip, read the real
// word/document.xml and word/media/* entries) into a permanent regression
// suite, exactly like BUG-051's note recommended.
//
// No network calls: mermaid-block rendering (the one network-touching branch
// of processContentBlocks, via fetch("https://mermaid.ink/...")) is never
// exercised here — none of the fixtures below contain mermaid syntax.
// `canvas` (used by the real [PLOT:] PNG rendering path) is a local native
// addon, not a network dependency; its availability is probed once in
// beforeAll so the PNG-specific assertions degrade to a weaker but still
// meaningful check on a machine where the native binary isn't installed,
// rather than failing non-deterministically across environments.
// ---------------------------------------------------------------------------

type ExerciseInput = Parameters<typeof generateWordDocument>[2][number];
type ContextInput = Parameters<typeof generateWordDocument>[0];
type HeaderInput = Parameters<typeof generateWordDocument>[3];

function baseContext(overrides: Partial<ContextInput> = {}): ContextInput {
  return {
    curriculumId: "bac-libanais",
    levelId: "Terminale S",
    subject: "mathematics",
    language: "french",
    duration: 120,
    totalPoints: 20,
    examType: "final",
    ...overrides,
  };
}

function baseExercise(overrides: Partial<ExerciseInput> = {}): ExerciseInput {
  return {
    number: 1,
    type: "open_ended",
    difficulty: "medium",
    points: 10,
    statement: "Résoudre l'équation.",
    solution: {
      finalAnswer: "x = 2",
      methodology: "Isoler x.",
    },
    ...overrides,
  };
}

// A real 1x1 PNG, valid enough for docx's own image-size probing.
const TINY_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

async function unzip(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const documentXml = await zip.file("word/document.xml")!.async("string");
  const mediaFiles = Object.keys(zip.files).filter((name) => name.startsWith("word/media/"));
  return { zip, documentXml, mediaFiles };
}

let canvasAvailable = true;
beforeAll(async () => {
  try {
    await import("canvas");
  } catch {
    canvasAvailable = false;
  }
});

describe("generateWordDocument — basic template rendering", () => {
  it("produces a valid, openable docx (real zip with word/document.xml) for a minimal classic exam", async () => {
    const buffer = await generateWordDocument(
      baseContext(),
      "classic",
      [baseExercise()],
      {},
      false
    );
    expect(Buffer.isBuffer(buffer)).toBe(true);
    const { documentXml, mediaFiles } = await unzip(buffer);
    expect(documentXml).toContain("Résoudre");
    expect(documentXml).toContain("Exercice 1.");
    // No logo, no plot ⇒ no embedded media at all.
    expect(mediaFiles).toHaveLength(0);
  });

  it("omits the CORRIGÉ/answer-key section entirely when includeAnswerKey is false", async () => {
    const buffer = await generateWordDocument(
      baseContext(),
      "classic",
      [baseExercise({ solution: { finalAnswer: "SECRET_ANSWER_TEXT", methodology: "SECRET_METHOD_TEXT" } })],
      {},
      false
    );
    const { documentXml } = await unzip(buffer);
    expect(documentXml).not.toContain("CORRIGÉ");
    expect(documentXml).not.toContain("SECRET_ANSWER_TEXT");
    expect(documentXml).not.toContain("SECRET_METHOD_TEXT");
  });

  it("includes the CORRIGÉ section with the final answer and methodology when includeAnswerKey is true (default)", async () => {
    const buffer = await generateWordDocument(
      baseContext(),
      "classic",
      [baseExercise({ solution: { finalAnswer: "x = 2 et x = -2", methodology: "Factoriser puis résoudre." } })],
      {}
    );
    const { documentXml } = await unzip(buffer);
    expect(documentXml).toContain("CORRIGÉ");
    expect(documentXml).toContain("Factoriser");
  });

  it("renders the answer key in English for language: 'english' and in Arabic RTL wording for 'arabic'", async () => {
    const english = await generateWordDocument(
      baseContext({ language: "english" }),
      "classic",
      [baseExercise()],
      {}
    );
    const { documentXml: enXml } = await unzip(english);
    expect(enXml).toContain("ANSWER KEY");
    expect(enXml).toContain("Exercise 1.");

    const arabic = await generateWordDocument(
      baseContext({ language: "arabic" }),
      "classic",
      [baseExercise()],
      {}
    );
    const { documentXml: arXml } = await unzip(arabic);
    expect(arXml).toContain("الإجابة النموذجية");
    expect(arXml).toContain("تمرين");
  });

  it("does not crash on an empty exercises array (boundary case) and still returns a valid docx", async () => {
    const buffer = await generateWordDocument(baseContext(), "classic", [], {}, true);
    const { documentXml } = await unzip(buffer);
    expect(documentXml).toContain("Total");
    expect(documentXml).not.toContain("Exercice 1");
  });

  it("does not crash when header is entirely undefined (missing optional field)", async () => {
    const buffer = await generateWordDocument(baseContext(), "modern", [baseExercise()], undefined, false);
    const { documentXml } = await unzip(buffer);
    // Modern template falls back to the literal "Institution" label when no schoolName is given.
    expect(documentXml).toContain("Institution");
  });
});

describe("generateWordDocument — modern template, header, MCQ, barème, sub-questions", () => {
  it("embeds a real school logo image when header.schoolLogo is a data URL", async () => {
    const header: HeaderInput = {
      schoolName: "Lycée Test",
      teacherName: "M. Dupont",
      schoolLogo: `data:image/png;base64,${TINY_PNG_B64}`,
    };
    const buffer = await generateWordDocument(baseContext(), "modern", [baseExercise()], header, false);
    const { documentXml, mediaFiles } = await unzip(buffer);
    expect(documentXml).toContain("Lycée Test");
    expect(documentXml).toContain("M. Dupont");
    expect(mediaFiles.length).toBeGreaterThanOrEqual(1);
    expect(mediaFiles.some((f) => f.endsWith(".png"))).toBe(true);
  });

  it("renders MCQ options and highlights the correct answer in the answer key", async () => {
    const ex = baseExercise({
      type: "multiple_choice",
      options: [
        { label: "A", text: "2", isCorrect: false },
        { label: "B", text: "4", isCorrect: true },
      ],
    });
    const buffer = await generateWordDocument(baseContext(), "classic", [ex], {}, true);
    const { documentXml } = await unzip(buffer);
    expect(documentXml).toContain("Bonne réponse");
    // Both option texts should be present in the body (the question) ...
    expect(documentXml).toContain("4");
    expect(documentXml).toContain("2");
  });

  it("renders a barème table and a micro-barème table in the answer key when present", async () => {
    const ex = baseExercise({
      solution: {
        finalAnswer: "x = 2",
        methodology: "Isoler x.",
        bareme: [{ label: "Q1", points: 5, criterion: "Équation bien posée" }],
        microBareme: [{ step: "Étape 1", points: 2, criterion: "Isolation correcte" }],
      },
    });
    const buffer = await generateWordDocument(baseContext(), "classic", [ex], {}, true);
    const { documentXml } = await unzip(buffer);
    expect(documentXml).toContain("Barème");
    expect(documentXml).toContain("Équation bien posée");
    expect(documentXml).toContain("Micro-barème");
    expect(documentXml).toContain("Isolation correcte");
  });

  it("renders sub-questions with their label and point value merged onto one line", async () => {
    const ex = baseExercise({
      subQuestions: [
        { label: "a)", statement: "Calculer la dérivée.", points: 3 },
        { label: "b)", statement: "Étudier le signe.", points: 4 },
      ],
    });
    const buffer = await generateWordDocument(baseContext(), "classic", [ex], {}, false);
    const { documentXml } = await unzip(buffer);
    expect(documentXml).toContain("Calculer la dérivée");
    expect(documentXml).toContain("3 pts");
    expect(documentXml).toContain("Étudier le signe");
    expect(documentXml).toContain("4 pts");
  });
});

describe("generateWordDocument — [PLOT:] inline math-plot rendering (BUG-051/052/057)", () => {
  it("embeds a real rendered PNG for a valid, safe equation when canvas is available on this runtime", async () => {
    const ex = baseExercise({ statement: "Étudier la fonction.\n[PLOT: sin(x)]" });
    const buffer = await generateWordDocument(baseContext(), "classic", [ex], {}, false);
    const { documentXml, mediaFiles } = await unzip(buffer);

    if (canvasAvailable) {
      expect(mediaFiles.length).toBeGreaterThanOrEqual(1);
      expect(mediaFiles.some((f) => f.endsWith(".png"))).toBe(true);
      // The rels/content-type registration BUG-051's own manual check relied on.
      const rels = await unzipRels(buffer);
      expect(rels).toContain("image/png");
    } else {
      // canvas truly unavailable on this machine ⇒ must still fail soft to
      // the pre-existing text-box behavior, never a blank/broken document.
      expect(documentXml).toContain("Graph");
    }
  });

  it("falls back to the labelled text box (never a raw [PLOT:] tag, never a crash) for an unsafe/rejected equation (BUG-057 guard)", async () => {
    // "(1:1:100000000)" is the exact, empirically-documented mathjs DoS
    // payload from BUG-057 — isSafePlotExpression() must reject it, which
    // must make renderMathPlotPng() throw and processContentBlocks() must
    // catch that and fall back, exactly like any other bad equation.
    const ex = baseExercise({ statement: "[PLOT: (1:1:100000000)]" });
    const buffer = await generateWordDocument(baseContext(), "classic", [ex], {}, false);
    const { documentXml, mediaFiles } = await unzip(buffer);

    expect(documentXml).not.toContain("[PLOT:");
    expect(documentXml).toContain("Graph");
    expect(documentXml).toContain("(1:1:100000000)");
    expect(mediaFiles).toHaveLength(0);
  });

  it("shows only the graph label (no 'f(x) =' line, no crash) for an empty [PLOT:] tag", async () => {
    const ex = baseExercise({ statement: "[PLOT: ]" });
    const buffer = await generateWordDocument(baseContext(), "classic", [ex], {}, false);
    const { documentXml, mediaFiles } = await unzip(buffer);

    expect(documentXml).toContain("Graph");
    expect(documentXml).not.toContain("f(x) =");
    expect(mediaFiles).toHaveLength(0);
  });
});

describe("generateWordDocument — 'Code Leaks' AI-hallucination cleanup", () => {
  it("never leaks a literal backtick into the exported text, whether or not the backtick content triggers math conversion", async () => {
    const ex = baseExercise({
      statement: "Calculer `x^2+1` puis comparer au mot `plain` isolé.",
    });
    const buffer = await generateWordDocument(baseContext(), "classic", [ex], {}, false);
    const { documentXml } = await unzip(buffer);

    expect(documentXml).not.toContain("`");
    expect(documentXml).toContain("x^2+1");
    expect(documentXml).toContain("plain");
  });

  it("collapses a hallucinated nested \\ce{\\ce{...}} chemistry command instead of leaking raw LaTeX into the document", async () => {
    const ex = baseExercise({
      statement: "Bilan : \\ce{\\ce{H2O}} se forme.",
      type: "chemistry",
    });
    const buffer = await generateWordDocument(baseContext({ subject: "chemistry" }), "classic", [ex], {}, false);
    const { documentXml } = await unzip(buffer);

    // Neither the LaTeX command name nor a doubled/garbled artifact should
    // ever reach the final exported text.
    expect(documentXml).not.toContain("\\ce");
    expect(documentXml).not.toContain("ce{");
    expect(documentXml).toContain("H");
    expect(documentXml).toContain("O");
  });
});

async function unzipRels(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const contentTypes = await zip.file("[Content_Types].xml")!.async("string");
  return contentTypes;
}
