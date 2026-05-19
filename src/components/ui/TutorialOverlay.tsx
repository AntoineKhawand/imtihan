"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ChevronRight, ChevronLeft, HelpCircle } from "lucide-react";

const STORAGE_KEY = "imtihan_tour_v1";
const PAD = 10;        // extra padding around the highlighted element (px)
const GAP = 16;        // gap between the spotlight edge and the tooltip card (px)
const TOOLTIP_W = 300; // tooltip card fixed width (px)

const TRANSITION = "all 420ms cubic-bezier(0.4, 0, 0.2, 1)";

interface Step {
  selector: string | null;
  title: string;
  body: string;
  side: "top" | "bottom" | "left" | "right" | "center";
}

const STEPS: Step[] = [
  {
    selector: null,
    title: "Your exam is ready!",
    body: "Let me walk you through the key features so you get the most out of Imtihan.",
    side: "center",
  },
  {
    selector: '[data-tutorial="exercise-card"]',
    title: "Your AI-generated exercise",
    body: "Each exercise is crafted for your curriculum, level, and selected chapters — with difficulty level, points, and duration already set.",
    side: "bottom",
  },
  {
    selector: '[data-tutorial="exercise-actions"]',
    title: "Refine any exercise",
    body: "Click ⚡ to regenerate, make it easier or harder, edit manually, or remove it entirely.",
    side: "bottom",
  },
  {
    selector: '[data-tutorial="solution-toggle"]',
    title: "Full corrigé included",
    body: "Every exercise comes with a complete solution, mark scheme, and common mistakes — ready for your answer key.",
    side: "top",
  },
  {
    selector: '[data-tutorial="export-button"]',
    title: "Download your exam",
    body: "Export as Word (.docx) or PDF — professionally formatted and print-ready for your students.",
    side: "top",
  },
];

interface SpotRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** Wait for the element to be fully visible after a smooth scroll, then measure it. */
function measureAfterScroll(el: Element): Promise<SpotRect> {
  return new Promise((resolve) => {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    // Wait for scroll animation + 2 paint frames to settle
    setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const r = el.getBoundingClientRect();
          resolve({
            top: r.top - PAD,
            left: r.left - PAD,
            width: r.width + PAD * 2,
            height: r.height + PAD * 2,
          });
        });
      });
    }, 380);
  });
}

function computeTooltipStyle(
  spot: SpotRect | null,
  side: Step["side"],
): React.CSSProperties {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (!spot || side === "center") {
    return {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  const clampLeft = (ideal: number) =>
    clamp(ideal, 12, vw - TOOLTIP_W - 12);

  if (side === "bottom") {
    return {
      position: "fixed",
      top: clamp(spot.top + spot.height + GAP, 12, vh - 240),
      left: clampLeft(spot.left + spot.width / 2 - TOOLTIP_W / 2),
    };
  }

  if (side === "top") {
    const spaceAbove = spot.top - GAP;
    return {
      position: "fixed",
      // Anchor the BOTTOM of the tooltip to (spot.top - GAP) from the top
      bottom: clamp(vh - spot.top + GAP, 12, vh - 240),
      left: clampLeft(spot.left + spot.width / 2 - TOOLTIP_W / 2),
    };
  }

  if (side === "left") {
    const tooltipRight = spot.left - GAP;
    if (tooltipRight - TOOLTIP_W < 12) {
      // Not enough space on the left → flip to bottom
      return {
        position: "fixed",
        top: clamp(spot.top + spot.height + GAP, 12, vh - 240),
        left: clampLeft(spot.left + spot.width / 2 - TOOLTIP_W / 2),
      };
    }
    return {
      position: "fixed",
      top: clamp(spot.top + spot.height / 2 - 90, 12, vh - 240),
      left: tooltipRight - TOOLTIP_W,
    };
  }

  if (side === "right") {
    return {
      position: "fixed",
      top: clamp(spot.top + spot.height / 2 - 90, 12, vh - 240),
      left: clamp(spot.left + spot.width + GAP, 12, vw - TOOLTIP_W - 12),
    };
  }

  return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
}

// ─── component ──────────────────────────────────────────────────────────────

export function TutorialOverlay({
  isFreeTier,
  ready,
}: {
  isFreeTier: boolean;
  ready: boolean;
}) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [spot, setSpot] = useState<SpotRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [tooltipOpacity, setTooltipOpacity] = useState(1);
  const measuringRef = useRef(false);

  // Auto-show once for free-tier users after generation finishes
  useEffect(() => {
    if (!isFreeTier || !ready) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setActive(true), 700);
    return () => clearTimeout(t);
  }, [isFreeTier, ready]);

  const applySpot = useCallback((newSpot: SpotRect | null, stepIdx: number) => {
    setSpot(newSpot);
    const style = computeTooltipStyle(newSpot, STEPS[stepIdx].side);
    setTooltipStyle(style);
    setTooltipOpacity(1);
  }, []);

  const measureStep = useCallback(async (stepIdx: number) => {
    if (measuringRef.current) return;
    measuringRef.current = true;

    const def = STEPS[stepIdx];

    // Fade out tooltip while repositioning
    setTooltipOpacity(0);

    if (!def.selector) {
      await new Promise(r => setTimeout(r, 80));
      applySpot(null, stepIdx);
      measuringRef.current = false;
      return;
    }

    const el = document.querySelector(def.selector);
    if (!el) {
      applySpot(null, stepIdx);
      measuringRef.current = false;
      return;
    }

    const measured = await measureAfterScroll(el);
    applySpot(measured, stepIdx);
    measuringRef.current = false;
  }, [applySpot]);

  // Re-measure whenever step or active state changes
  useEffect(() => {
    if (!active) return;
    measureStep(step);

    const onResize = () => measureStep(step);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, step, measureStep]);

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setActive(false);
  }, []);

  const goTo = useCallback((targetStep: number) => {
    setStep(targetStep);
  }, []);

  const next = () => {
    if (step < STEPS.length - 1) goTo(step + 1);
    else dismiss();
  };

  const prev = () => {
    if (step > 0) goTo(step - 1);
  };

  const reopen = () => {
    setStep(0);
    setActive(true);
  };

  const cur = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // ── Panel values (null = full-screen overlay for center step) ──────────────
  const topH    = spot ? Math.max(0, spot.top) : null;
  const bottomT = spot ? spot.top + spot.height : null;
  const leftW   = spot ? Math.max(0, spot.left) : null;
  const rightL  = spot ? spot.left + spot.width : null;

  return (
    <>
      {/* ── Help (?) button — visible when tutorial is not active ── */}
      {!active && isFreeTier && ready && (
        <button
          onClick={reopen}
          title="Replay tutorial"
          className="fixed bottom-6 right-6 z-[990] w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-lg hover:opacity-90 active:scale-95 transition-all"
        >
          <HelpCircle size={18} />
        </button>
      )}

      {/* ── Spotlight overlay ── */}
      {active && (
        <>
          {spot ? (
            <>
              {/* Top */}
              <div
                className="fixed inset-x-0 top-0 z-[998] bg-black/75"
                style={{ height: topH ?? 0, transition: TRANSITION }}
              />
              {/* Bottom */}
              <div
                className="fixed inset-x-0 bottom-0 z-[998] bg-black/75"
                style={{ top: bottomT ?? 0, transition: TRANSITION }}
              />
              {/* Left */}
              <div
                className="fixed top-0 left-0 bottom-0 z-[998] bg-black/75"
                style={{
                  top: spot.top,
                  height: spot.height,
                  width: leftW ?? 0,
                  transition: TRANSITION,
                }}
              />
              {/* Right */}
              <div
                className="fixed top-0 right-0 bottom-0 z-[998] bg-black/75"
                style={{
                  top: spot.top,
                  height: spot.height,
                  left: rightL ?? 0,
                  transition: TRANSITION,
                }}
              />
              {/* Glow ring */}
              <div
                className="fixed z-[998] rounded-xl pointer-events-none"
                style={{
                  top: spot.top,
                  left: spot.left,
                  width: spot.width,
                  height: spot.height,
                  boxShadow: "0 0 0 2px rgba(255,255,255,0.45), 0 0 20px 4px rgba(255,255,255,0.08)",
                  transition: TRANSITION,
                }}
              />
            </>
          ) : (
            <div className="fixed inset-0 z-[998] bg-black/75" style={{ transition: TRANSITION }} />
          )}

          {/* ── Tooltip card ── */}
          <div
            className="fixed z-[999] bg-[var(--bg)] rounded-2xl shadow-2xl border border-[var(--border)] p-5 pointer-events-auto"
            style={{
              ...tooltipStyle,
              width: TOOLTIP_W,
              opacity: tooltipOpacity,
              transition: `top 420ms cubic-bezier(0.4, 0, 0.2, 1), bottom 420ms cubic-bezier(0.4, 0, 0.2, 1), left 420ms cubic-bezier(0.4, 0, 0.2, 1), right 420ms cubic-bezier(0.4, 0, 0.2, 1), opacity 220ms ease`,
            }}
          >
            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mb-4">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step
                      ? "w-5 bg-[var(--accent)]"
                      : i < step
                      ? "w-1.5 bg-[var(--accent)]/50"
                      : "w-1.5 bg-[var(--border)]"
                  }`}
                />
              ))}
              <span className="ml-auto text-[10px] font-medium text-[var(--text-tertiary)]">
                {step + 1} / {STEPS.length}
              </span>
            </div>

            <h3 className="font-display text-[15px] font-semibold text-[var(--text)] mb-2 leading-snug">
              {cur.title}
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              {cur.body}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-5">
              <button
                onClick={dismiss}
                className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                Skip
              </button>
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    onClick={prev}
                    className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text)] px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors"
                  >
                    <ChevronLeft size={12} />
                    Back
                  </button>
                )}
                <button
                  onClick={next}
                  className="flex items-center gap-1 text-[11px] font-semibold bg-[var(--accent)] text-white px-3.5 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {isLast ? "Got it!" : "Next"}
                  {!isLast && <ChevronRight size={12} />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
