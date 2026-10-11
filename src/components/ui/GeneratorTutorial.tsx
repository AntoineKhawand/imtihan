"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { HelpCircle, X } from "lucide-react";
import { guideSpot } from "@/lib/guide-geometry";

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

const STORAGE = "imtihan_generator_guide_v3";
const READY_TARGETS: Record<string, string> = {
  "/create": '[data-guide="describe"]',
  "/create/confirm": '[data-guide="context"]',
  "/create/generate": '[data-guide="review-export"]',
  "/create/export": '[data-guide="header"]',
};
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

  const start = useCallback(() => {
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
      localStorage.setItem(`${STORAGE}:${pathname}`, "seen");
    } catch {
      /* Help remains usable without storage. */
    }
  }, [pathname]);
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
    const selector = READY_TARGETS[pathname];
    if (!selector) return;
    const storageKey = `${STORAGE}:${pathname}`;
    try {
      if (localStorage.getItem(storageKey)) return;
    } catch {
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new MutationObserver(checkReady);
    function checkReady() {
      const target = document.querySelector<HTMLElement>(selector);
      if (!target?.getClientRects().length || timer !== undefined) return;
      timer = setTimeout(() => {
        timer = undefined;
        try {
          if (localStorage.getItem(storageKey)) {
            observer.disconnect();
            return;
          }
        } catch {
          observer.disconnect();
          return;
        }
        if (!document.querySelector<HTMLElement>(selector)?.getClientRects().length) return;
        observer.disconnect();
        start();
      }, 700);
    }
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    checkReady();
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [pathname, start]);
  useEffect(() => {
    if (!active || !current) return;
    const target = document.querySelector<HTMLElement>(current.selector);
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingBottom;
    document.body.style.overflow = "hidden";
    target?.scrollIntoView({ block: "center", behavior: "instant" });
    const measure = () => {
      const compact = window.innerWidth < 640 || window.innerHeight < 500;
      // Provide scroll room even for the last button at the end of a page.
      document.body.style.paddingBottom = compact
        ? `calc(${previousPadding || "0px"} + ${(dialog.current?.offsetHeight ?? 0) + 32}px)`
        : previousPadding;
      let rect = target?.getBoundingClientRect();
      // On phones the guide is a bottom sheet: scroll the target into the
      // remaining space rather than centering it underneath the instructions.
      const sheetTop = dialog.current?.getBoundingClientRect().top ?? window.innerHeight;
      const bottom = compact ? sheetTop - 12 : window.innerHeight;
      if (rect && compact) {
        const top = Math.max(16, (document.querySelector("header")?.getBoundingClientRect().bottom ?? 0) + 12);
        const available = Math.max(0, bottom - top);
        const desiredTop = top + Math.max(0, (available - rect.height) / 2);
        const shift = rect.top - desiredTop;
        if (Math.abs(shift) > 1) window.scrollBy({ top: shift, behavior: "instant" });
        rect = target?.getBoundingClientRect();
      }
      setSpot(rect ? guideSpot(rect, window.innerWidth, bottom) : null);
    };
    const frame = requestAnimationFrame(measure);
    dialog.current?.focus({ preventScroll: true });
    const observer = new ResizeObserver(measure);
    if (dialog.current) observer.observe(dialog.current);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingBottom = previousPadding;
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
          className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-[990] flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-3 text-sm text-white shadow-lg"
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
            className="fixed bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-2 right-2 z-[999] flex max-h-[48dvh] flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--text)] shadow-2xl sm:bottom-4 sm:left-auto sm:right-4 sm:max-h-[70dvh] sm:w-[360px] sm:p-5 [@media(max-height:500px)]:max-h-[48dvh]"
          >
            <div className="flex shrink-0 items-center justify-between">
              <p className="text-xs text-[var(--text-tertiary)]">
                Guide · {index + 1} of {steps.length}
              </p>
              <button
                type="button"
                onClick={close}
                aria-label="Close tutorial"
                className="flex min-h-11 min-w-11 items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto overscroll-contain break-words">
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
            </div>
            <div className="mt-3 flex shrink-0 justify-between gap-2">
              <button
                type="button"
                onClick={close}
                className="min-h-11 px-3 py-2 text-sm"
              >
                Skip
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => setIndex((value) => value - 1)}
                  className="min-h-11 rounded-xl border border-[var(--border)] px-3 py-2 text-sm disabled:opacity-40"
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
                  className="min-h-11 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm text-white"
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
