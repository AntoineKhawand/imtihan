"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

const STORAGE_KEY = "imtihan_tour_v1";
const PAD = 10;          // extra space around the highlighted element (px)
const GAP = 18;          // gap between spotlight edge and tooltip card (px)
const SCROLL_SETTLE = 360; // ms to wait after scrollIntoView before measuring
const TOOLTIP_W = 308;   // fixed tooltip width (px)

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
    body: "Let me walk you through the key features so you can get the most out of Imtihan.",
    side: "center",
  },
  {
    selector: '[data-tutorial="exercise-card"]',
    title: "Your AI-generated exercise",
    body: "Each exercise is crafted for your curriculum, level, and selected chapters — with difficulty level, points, and estimated duration already set.",
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
    body: "Every exercise comes with a detailed solution, mark scheme, and common mistakes — ready for your answer key.",
    side: "top",
  },
  {
    selector: '[data-tutorial="export-button"]',
    title: "Download your exam",
    body: "Export as Word (.docx) or PDF — formatted and print-ready for your students.",
    side: "top",
  },
];

interface SpotRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

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

  // Show once for free-tier users after generation completes
  useEffect(() => {
    if (!isFreeTier || !ready) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setActive(true), 700);
    return () => clearTimeout(t);
  }, [isFreeTier, ready]);

  const measure = useCallback((stepIdx: number) => {
    const def = STEPS[stepIdx];
    if (!def.selector) {
      setSpot(null);
      return;
    }
    const el = document.querySelector(def.selector);
    if (!el) {
      setSpot(null);
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      const r = el.getBoundingClientRect();
      setSpot({
        top: r.top - PAD,
        left: r.left - PAD,
        width: r.width + PAD * 2,
        height: r.height + PAD * 2,
      });
    }, SCROLL_SETTLE);
  }, []);

  useEffect(() => {
    if (!active) return;
    measure(step);
    const onResize = () => measure(step);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, step, measure]);

  // Compute tooltip position whenever spot changes
  useEffect(() => {
    if (!active) return;
    if (!spot) {
      setTooltipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
      return;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const def = STEPS[step];
    const style: React.CSSProperties = { position: "fixed" };

    const clampLeft = (ideal: number) =>
      Math.max(12, Math.min(ideal, vw - TOOLTIP_W - 12));

    if (def.side === "bottom") {
      style.top = Math.min(spot.top + spot.height + GAP, vh - 220);
      style.left = clampLeft(spot.left + spot.width / 2 - TOOLTIP_W / 2);
    } else if (def.side === "top") {
      // position above the element — use `bottom` from viewport bottom
      const distFromBottom = vh - spot.top + GAP;
      style.bottom = Math.min(distFromBottom, vh - 220);
      style.left = clampLeft(spot.left + spot.width / 2 - TOOLTIP_W / 2);
    } else if (def.side === "left") {
      style.top = Math.max(12, spot.top + spot.height / 2 - 90);
      const rightEdge = vw - spot.left + GAP;
      // If tooltip would go off-screen to the left, flip to right side
      if (rightEdge + TOOLTIP_W > vw - 12) {
        style.left = spot.left + spot.width + GAP;
      } else {
        style.right = rightEdge;
      }
    } else if (def.side === "right") {
      style.top = Math.max(12, spot.top + spot.height / 2 - 90);
      style.left = spot.left + spot.width + GAP;
    }

    setTooltipStyle(style);
  }, [spot, step, active]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setActive(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      dismiss();
    }
  };

  const prev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  if (!active) return null;

  const cur = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <>
      {/* ── Spotlight overlay ── */}
      {spot ? (
        <>
          {/* Top strip */}
          <div
            className="fixed inset-x-0 top-0 z-[998] bg-black/75"
            style={{ height: Math.max(0, spot.top) }}
          />
          {/* Bottom strip */}
          <div
            className="fixed inset-x-0 bottom-0 z-[998] bg-black/75"
            style={{ top: spot.top + spot.height }}
          />
          {/* Left strip */}
          <div
            className="fixed left-0 z-[998] bg-black/75"
            style={{
              top: spot.top,
              width: Math.max(0, spot.left),
              height: spot.height,
            }}
          />
          {/* Right strip */}
          <div
            className="fixed right-0 z-[998] bg-black/75"
            style={{
              top: spot.top,
              left: spot.left + spot.width,
              height: spot.height,
            }}
          />
          {/* Glow ring around highlighted element */}
          <div
            className="fixed z-[998] rounded-xl pointer-events-none transition-all duration-300"
            style={{
              top: spot.top,
              left: spot.left,
              width: spot.width,
              height: spot.height,
              boxShadow: "0 0 0 2px rgba(255,255,255,0.35), 0 0 0 4px rgba(255,255,255,0.08)",
            }}
          />
        </>
      ) : (
        /* Full overlay for the welcome step */
        <div className="fixed inset-0 z-[998] bg-black/75" />
      )}

      {/* ── Tooltip card ── */}
      <div
        className="fixed z-[999] bg-[var(--bg)] rounded-2xl shadow-2xl border border-[var(--border)] p-5 pointer-events-auto"
        style={{ ...tooltipStyle, width: TOOLTIP_W }}
      >
        {/* Step progress dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-5 bg-[var(--accent)]"
                  : i < step
                  ? "w-1.5 bg-[var(--accent)]/40"
                  : "w-1.5 bg-[var(--border)]"
              }`}
            />
          ))}
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] mb-1.5">
          {step + 1} / {STEPS.length}
        </p>
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
            Skip tour
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
  );
}
