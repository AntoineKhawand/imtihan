"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { HelpCircle, X } from "lucide-react";

type Step = { selector: string; title: string; body: string };
const guide = (id: string, title: string, body: string): Step => ({
  selector: `[data-guide="${id}"]`,
  title,
  body,
});
export const GENERATOR_TOURS: Record<string, Step[]> = {
  "/create": [
    guide(
      "describe",
      "Describe the exam you need",
      "Enter the curriculum, class level, subject, chapters, language and time available. Hard is the default; ask for a different difficulty here or change it on the next screen.",
    ),
    guide(
      "examples",
      "Start with an example",
      "Click an example to fill the description, then edit it for your class. It does not generate an exam.",
    ),
    guide(
      "upload",
      "Add your teaching material (optional)",
      "Upload course notes or a past paper to ground the exam. Remove clears your attachment; you can also describe the exam without a file.",
    ),
    guide(
      "profiles",
      "Reuse a class (optional)",
      "Save a class profile, give it a name, then use its button next time to fill your description. The remove button deletes that saved shortcut.",
    ),
    guide(
      "research",
      "Find a research paper (optional)",
      "Enter a topic and click Search. Add a result's abstract to the description when relevant. This is useful for university or IB tasks; it is not required.",
    ),
    guide(
      "analyze",
      "Analyse before generating",
      "This button reads your description and attachment and opens the settings for review. Add a description or upload first. You will review the chapters, difficulty and marks before creating exercises.",
    ),
  ],
  "/create/confirm": [
    guide(
      "context",
      "Check the detected settings",
      "Choose the correct curriculum, level, subject, language, exam type and duration. Review any warning: the AI may have guessed a field.",
    ),
    guide(
      "chapters",
      "Choose your chapters",
      "Click a chapter to include or remove it. School exams need at least one chapter. University exams use your description and uploaded course material instead.",
    ),
    guide(
      "difficulty",
      "Choose the difficulty",
      "Hard requests challenging exercises within the selected syllabus. Choose Medium, Easy or Mixed if needed. A custom mix from your description is preserved until you choose another preset.",
    ),
    guide(
      "blueprint",
      "Set the marks and exercise count",
      "Enter total marks and number of exercises. Adjust each exercise's marks; they must add up to the total before you can continue.",
    ),
    guide(
      "template",
      "Choose a document layout",
      "Modern uses the standard layout. Extract Template uses an uploaded document or your layout instructions. Tell it which header, logo or grading table to follow.",
    ),
    guide(
      "generate",
      "Generate your exam",
      "Check all required choices, selected chapters and marks first. This starts AI generation and can use your exam allowance. The tutorial never clicks it for you.",
    ),
  ],
  "/create/generate": [
    {
      selector: "main",
      title: "Generation and review",
      body: "Wait for generation to finish before editing. If it fails, read the error and use Try again. When exercises appear, reopen this guide to see their review and editing controls.",
    },
    {
      selector: '[data-tutorial="exercise-card"]',
      title: "Review each exercise",
      body: "Check the statement, marks, difficulty and mathematics before using the exam with students. AI output needs a teacher's review.",
    },
    {
      selector: '[data-tutorial="exercise-actions"]',
      title: "Refine the exercise",
      body: "Open the action menu to regenerate, change difficulty, edit or remove an exercise. Regeneration rewrites content; manual editing lets you correct it yourself.",
    },
    guide(
      "visuals",
      "Add or remove visuals",
      "Table formats data; Math Plot adds a function graph; Diagram adds a schematic; AI Illustration creates an image. Enter the requested details, then apply. Clear visuals removes the exercise's visuals.",
    ),
    {
      selector: '[data-tutorial="solution-toggle"]',
      title: "Read the solution and mark scheme",
      body: "Expand the solution to check the reasoning, answer and marking guidance. Verify it matches the question before exporting.",
    },
    guide(
      "coverage",
      "Check chapter coverage",
      "A warning means no exercise is tagged to a selected chapter. Inspect the content and tags, then revise the exam if needed; a tag warning alone is not proof the topic is absent.",
    ),
    guide(
      "review-export",
      "Continue to export",
      "When the exercises and solutions are ready, continue to choose the document header, answer-key options and download format.",
    ),
  ],
  "/create/export": [
    guide(
      "header",
      "Personalise the document",
      "Fill in the school and exam header details you want printed. Review any logo or watermark options; availability can depend on your plan.",
    ),
    guide(
      "export-options",
      "Choose what to include",
      "Select the answer key and document options for the intended audience. Check student copies carefully so they do not include solutions by mistake.",
    ),
    guide(
      "download-layout",
      "Classic or Modern",
      "Choose the document style before downloading. Classic is available on the free plan; Modern may require Pro. Check the target language shown below before exporting.",
    ),
    guide(
      "variant",
      "Version A or B",
      "A is the original exam. Pro's B option makes a real second AI version with different values and wording, using the same structure and marks. It can consume your allowance; review B before downloading.",
    ),
    guide(
      "word",
      "Download editable Word",
      "Word downloads a .docx file you can edit and print. Wait for any selected Version B to finish first.",
    ),
    guide(
      "pdf",
      "Print or save as PDF",
      "PDF opens the print-ready document in a new tab. Use the browser's print dialog to save as PDF, and check the preview before sharing.",
    ),
    guide(
      "save",
      "Save without downloading",
      "Save to my library keeps the exam for later. Downloading may also save it; look for the saved confirmation.",
    ),
    guide(
      "email",
      "Send only when ready",
      "Open this panel to send the exam to your account email. Check whether the answer key is included before sending. The tutorial does not send anything.",
    ),
  ],
};

const STORAGE = "imtihan_generator_guide_v2";
export function GeneratorTutorial() {
  const pathname = usePathname();
  const [steps, setSteps] = useState<Step[]>([]);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);
  const [spot, setSpot] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const helpButton = useRef<HTMLButtonElement>(null);
  const wasActive = useRef(false);
  const current = steps[index];

  function start() {
    const available = (GENERATOR_TOURS[pathname] ?? []).filter((step) => {
      const target = document.querySelector<HTMLElement>(step.selector);
      return target && target.getClientRects().length > 0;
    });
    if (!available.length) return;
    previousFocus.current = document.activeElement as HTMLElement;
    setSteps(available);
    setIndex(0);
    setActive(true);
    try {
      localStorage.setItem(STORAGE, "seen");
    } catch {
      /* Help remains usable without storage. */
    }
  }
  function close() {
    setActive(false);
  }

  useEffect(() => {
    if (wasActive.current && !active) {
      const target = previousFocus.current;
      if (target?.isConnected) target.focus();
      else helpButton.current?.focus();
    }
    wasActive.current = active;
  }, [active]);

  useEffect(() => {
    setActive(false);
    setSpot(null);
  }, [pathname]);
  useEffect(() => {
    if (pathname !== "/create") return;
    const timer = setTimeout(() => {
      try {
        if (localStorage.getItem(STORAGE)) return;
      } catch {
        return;
      }
      start();
    }, 700);
    return () => clearTimeout(timer);
    // Start once on entering the description page; other stages are replayable on demand.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  useEffect(() => {
    if (!active || !current) return;
    const target = document.querySelector<HTMLElement>(current.selector);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    target?.scrollIntoView({ block: "center", behavior: "instant" });
    const measure = () => {
      const rect = target?.getBoundingClientRect();
      setSpot(
        rect
          ? {
              top: Math.max(4, rect.top - 6),
              left: Math.max(4, rect.left - 6),
              width: Math.min(rect.width + 12, window.innerWidth - 8),
              height: Math.min(rect.height + 12, window.innerHeight - 8),
            }
          : null,
      );
    };
    const frame = requestAnimationFrame(measure);
    dialog.current?.focus();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [active, current]);

  if (!GENERATOR_TOURS[pathname]) return null;
  return (
    <>
      {!active && (
        <button
          ref={helpButton}
          type="button"
          onClick={start}
          aria-label="Open exam generator tutorial"
          className="fixed bottom-5 right-5 z-[990] flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-3 text-sm text-white shadow-lg"
        >
          <HelpCircle size={18} /> How to use
        </button>
      )}
      {active && current && (
        <>
          <div className="fixed inset-0 z-[998]" aria-hidden="true" />
          {spot ? (
            <div
              aria-hidden="true"
              className="pointer-events-none fixed z-[998] rounded-xl border-2 border-emerald-400"
              style={{ ...spot, boxShadow: "0 0 0 9999px rgba(0,0,0,.7)" }}
            />
          ) : (
            <div
              aria-hidden="true"
              className="fixed inset-0 z-[998] bg-black/70"
            />
          )}
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="generator-guide-title"
            aria-describedby="generator-guide-body"
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                close();
              }
              if (event.key === "Tab") {
                const buttons = [
                  ...(dialog.current?.querySelectorAll<HTMLButtonElement>(
                    "button:not(:disabled)",
                  ) ?? []),
                ];
                const first = buttons[0],
                  last = buttons[buttons.length - 1];
                if (
                  event.shiftKey &&
                  (document.activeElement === first ||
                    document.activeElement === dialog.current)
                ) {
                  event.preventDefault();
                  last?.focus();
                } else if (
                  !event.shiftKey &&
                  (document.activeElement === last ||
                    document.activeElement === dialog.current)
                ) {
                  event.preventDefault();
                  first?.focus();
                }
              }
            }}
            className="fixed bottom-4 left-4 right-4 z-[999] max-h-[55dvh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text)] shadow-2xl sm:left-auto sm:w-[360px]"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--text-tertiary)]">
                Guide · {index + 1} of {steps.length}
              </p>
              <button
                type="button"
                onClick={close}
                aria-label="Close tutorial"
                className="p-2"
              >
                <X size={18} />
              </button>
            </div>
            <h2 id="generator-guide-title" className="my-2 text-lg font-bold">
              {current.title}
            </h2>
            <p
              id="generator-guide-body"
              className="text-sm leading-relaxed text-[var(--text-secondary)]"
            >
              {current.body}
            </p>
            <p className="mt-3 text-xs text-[var(--text-tertiary)]">
              Close the guide to use these controls. Open “How to use” on any
              stage for its walkthrough.
            </p>
            <div className="mt-5 flex justify-between gap-2">
              <button
                type="button"
                onClick={close}
                className="px-3 py-2 text-sm"
              >
                Skip
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => setIndex((value) => value - 1)}
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm disabled:opacity-40"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() =>
                    index === steps.length - 1
                      ? close()
                      : setIndex((value) => value + 1)
                  }
                  className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm text-white"
                >
                  {index === steps.length - 1 ? "Done" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
