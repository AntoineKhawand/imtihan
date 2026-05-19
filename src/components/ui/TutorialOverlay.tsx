"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ChevronRight, ChevronLeft, HelpCircle } from "lucide-react";

const STORAGE_KEY = "imtihan_tour_v1";
const PAD   = 10;   // padding around highlighted element (px)
const GAP   = 16;   // gap between spotlight edge and tooltip (px)
const TOOLTIP_W = 300;

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
    side: "left",
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

interface SpotRect { top: number; left: number; width: number; height: number }

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

function getTooltipStyle(spot: SpotRect | null, side: Step["side"]): React.CSSProperties {
  if (!spot || side === "center") {
    return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)" };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const clampL = (x: number) => clamp(x, 12, vw - TOOLTIP_W - 12);

  if (side === "bottom") {
    return {
      position: "fixed",
      top: clamp(spot.top + spot.height + GAP, 12, vh - 240),
      left: clampL(spot.left + spot.width / 2 - TOOLTIP_W / 2),
    };
  }
  if (side === "top") {
    // Anchor tooltip ABOVE the element — use bottom CSS to stay above it
    const fromBottom = vh - spot.top + GAP;
    return {
      position: "fixed",
      bottom: clamp(fromBottom, 12, vh - 240),
      left: clampL(spot.left + spot.width / 2 - TOOLTIP_W / 2),
    };
  }
  if (side === "left") {
    const leftEdge = spot.left - GAP - TOOLTIP_W;
    if (leftEdge < 12) {
      // Not enough room on left — fall back to bottom
      return {
        position: "fixed",
        top: clamp(spot.top + spot.height + GAP, 12, vh - 240),
        left: clampL(spot.left + spot.width / 2 - TOOLTIP_W / 2),
      };
    }
    return {
      position: "fixed",
      top: clamp(spot.top + spot.height / 2 - 90, 12, vh - 240),
      left: leftEdge,
    };
  }
  if (side === "right") {
    return {
      position: "fixed",
      top: clamp(spot.top + spot.height / 2 - 90, 12, vh - 240),
      left: clamp(spot.left + spot.width + GAP, 12, vw - TOOLTIP_W - 12),
    };
  }
  return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)" };
}

// ─────────────────────────────────────────────────────────────────────────────

export function TutorialOverlay({ isFreeTier, ready }: { isFreeTier: boolean; ready: boolean }) {
  const [active, setActive]               = useState(false);
  const [step, setStep]                   = useState(0);
  const [spot, setSpot]                   = useState<SpotRect | null>(null);
  const [tooltipStyle, setTooltipStyle]   = useState<React.CSSProperties>({});
  const [panelOpacity, setPanelOpacity]   = useState(0);
  const [tooltipOpacity, setTooltipOpacity] = useState(0);

  // Generation counter — incremented on every step change so stale async
  // measurements know they've been superseded and can exit early.
  const gen = useRef(0);

  // Auto-show once for free-tier users after generation finishes
  useEffect(() => {
    if (!isFreeTier || !ready) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setActive(true), 700);
    return () => clearTimeout(t);
  }, [isFreeTier, ready]);

  const measureAndShow = useCallback(async (stepIdx: number) => {
    const myGen = ++gen.current;

    // ── 1. Fade out ──────────────────────────────────────────────────────────
    setPanelOpacity(0);
    setTooltipOpacity(0);
    // Wait for the CSS opacity transition to finish (200ms) + a tiny buffer
    await new Promise(r => setTimeout(r, 220));
    if (gen.current !== myGen) return; // step changed while fading — abort

    // ── 2. Scroll + measure ──────────────────────────────────────────────────
    const def = STEPS[stepIdx];
    let newSpot: SpotRect | null = null;

    if (def.selector) {
      const el = document.querySelector(def.selector);
      if (el) {
        // Instant scroll — the overlay is invisible so there's no jarring effect,
        // and we don't have to guess how long a smooth-scroll animation takes.
        el.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "center" });

        // Two paint frames so layout has settled before we measure
        await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
        if (gen.current !== myGen) return;

        const r = el.getBoundingClientRect();
        newSpot = {
          top:    r.top    - PAD,
          left:   r.left   - PAD,
          width:  r.width  + PAD * 2,
          height: r.height + PAD * 2,
        };
      }
    } else {
      // Center step — no element, short pause for UX
      await new Promise(r => setTimeout(r, 40));
      if (gen.current !== myGen) return;
    }

    // ── 3. Snap panels to new position (still invisible) ─────────────────────
    setSpot(newSpot);
    setTooltipStyle(getTooltipStyle(newSpot, def.side));

    // One frame for the DOM to reflect the new positions
    await new Promise<void>(r => requestAnimationFrame(() => r()));
    if (gen.current !== myGen) return;

    // ── 4. Fade in ───────────────────────────────────────────────────────────
    setPanelOpacity(1);
    setTooltipOpacity(1);
  }, []);

  // Re-measure whenever step or active state changes
  useEffect(() => {
    if (!active) return;
    measureAndShow(step);

    const onResize = () => {
      // On resize snap immediately — no fade needed
      const def = STEPS[step];
      if (!def.selector) return;
      const el = document.querySelector(def.selector);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const s: SpotRect = { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
      setSpot(s);
      setTooltipStyle(getTooltipStyle(s, def.side));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, step, measureAndShow]);

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setPanelOpacity(0);
    setTooltipOpacity(0);
    setTimeout(() => setActive(false), 220);
  }, []);

  const goTo   = (s: number) => setStep(s);
  const next   = () => { step < STEPS.length - 1 ? goTo(step + 1) : dismiss(); };
  const prev   = () => { if (step > 0) goTo(step - 1); };
  const reopen = () => { setStep(0); setActive(true); };

  const cur    = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // Computed panel edges
  const topH   = spot ? Math.max(0, spot.top)          : 0;
  const botT   = spot ? spot.top + spot.height          : 0;
  const leftW  = spot ? Math.max(0, spot.left)          : 0;
  const rightL = spot ? spot.left + spot.width           : 0;

  const panelCss = (extra: React.CSSProperties): React.CSSProperties => ({
    ...extra,
    opacity: panelOpacity,
    transition: "opacity 200ms ease",
  });

  return (
    <>
      {/* ── Help (?) button ── */}
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
              <div className="fixed inset-x-0 top-0 z-[998] bg-black/75" style={panelCss({ height: topH })} />
              {/* Bottom */}
              <div className="fixed inset-x-0 bottom-0 z-[998] bg-black/75" style={panelCss({ top: botT })} />
              {/* Left */}
              <div className="fixed left-0 z-[998] bg-black/75" style={panelCss({ top: spot.top, width: leftW, height: spot.height })} />
              {/* Right */}
              <div className="fixed right-0 z-[998] bg-black/75" style={panelCss({ top: spot.top, left: rightL, height: spot.height })} />
              {/* Glow ring */}
              <div
                className="fixed z-[998] rounded-xl pointer-events-none"
                style={{
                  top: spot.top, left: spot.left, width: spot.width, height: spot.height,
                  boxShadow: "0 0 0 2px rgba(255,255,255,0.5), 0 0 24px 6px rgba(255,255,255,0.08)",
                  opacity: panelOpacity,
                  transition: "opacity 200ms ease",
                }}
              />
            </>
          ) : (
            <div
              className="fixed inset-0 z-[998] bg-black/75"
              style={{ opacity: panelOpacity, transition: "opacity 200ms ease" }}
            />
          )}

          {/* ── Tooltip card ── */}
          <div
            className="fixed z-[999] bg-[var(--bg)] rounded-2xl shadow-2xl border border-[var(--border)] p-5 pointer-events-auto"
            style={{ ...tooltipStyle, width: TOOLTIP_W, opacity: tooltipOpacity, transition: "opacity 200ms ease" }}
          >
            {/* Progress dots (clickable) */}
            <div className="flex items-center gap-1.5 mb-4">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step      ? "w-5 bg-[var(--accent)]"
                    : i < step     ? "w-1.5 bg-[var(--accent)]/50"
                    :                 "w-1.5 bg-[var(--border)]"
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
                    <ChevronLeft size={12} /> Back
                  </button>
                )}
                <button
                  onClick={next}
                  className="flex items-center gap-1 text-[11px] font-semibold bg-[var(--accent)] text-white px-3.5 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {isLast ? "Got it!" : "Next"} {!isLast && <ChevronRight size={12} />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
