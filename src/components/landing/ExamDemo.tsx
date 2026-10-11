"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const STEPS = ["Describe", "Confirm", "Review", "Export"];
export function ExamDemo() {
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const completed = useRef(false);
  const step = Math.min(3, Math.floor(elapsed / 5));
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setElapsed((value) => Math.min(20, value + 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [playing]);
  useEffect(() => {
    if (elapsed < 20) return;
    setPlaying(false);
    if (!completed.current) {
      completed.current = true;
      trackEvent("demo_complete", { placement: "homepage_hero" });
    }
  }, [elapsed]);
  function play() {
    if (elapsed === 20) {
      setElapsed(0);
      completed.current = false;
    }
    if (!playing) trackEvent("demo_start", { placement: "homepage_hero" });
    setPlaying(!playing);
  }
  return (
    <section
      id="demo"
      aria-label="20-second exam generator demo"
      className="scroll-mt-24 rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xl shadow-black/5 overflow-hidden"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-3">
        <span className="text-xs font-semibold text-[var(--text)]">
          Example walkthrough · 20 sec
        </span>
        <button
          type="button"
          onClick={play}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white"
          aria-label={
            playing
              ? "Pause demo"
              : elapsed === 20
                ? "Replay demo"
                : "Play 20-second demo"
          }
        >
          {playing ? (
            <Pause size={13} />
          ) : elapsed === 20 ? (
            <RotateCcw size={13} />
          ) : (
            <Play size={13} />
          )}{" "}
          {playing ? "Pause" : elapsed === 20 ? "Replay" : "Play demo"}
        </button>
      </div>
      <div className="flex gap-1 p-3" aria-label="Demo steps">
        {STEPS.map((label, index) => (
          <button
            key={label}
            type="button"
            aria-pressed={step === index}
            onClick={() => {
              setPlaying(false);
              setElapsed(index * 5);
            }}
            className={`flex-1 rounded-lg py-2 text-[11px] font-medium ${step === index ? "bg-[var(--accent-light)] text-[var(--accent)]" : "text-[var(--text-tertiary)] hover:bg-[var(--bg-subtle)]"}`}
          >
            {index + 1}. {label}
          </button>
        ))}
      </div>
      <div
        className="min-h-[190px] px-5 pb-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="mb-2 text-xs text-[var(--text-tertiary)]">
          {
            [
              "Tell Imtihan what your class needs",
              "Check the settings before generating",
              "Read the questions and solutions",
              "Download, edit and print",
            ][step]
          }
        </p>
        {step === 0 && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
            <p className="text-sm leading-relaxed text-[var(--text)]">
              “Create an IB maths exam on derivatives, 60 minutes, in English,
              with worked solutions.”
            </p>
            <p className="mt-3 text-xs text-[var(--accent)]">
              Your curriculum. Your chapters. Your language.
            </p>
          </div>
        )}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Curriculum", "IB"],
              ["Subject", "Maths"],
              ["Duration", "60 minutes"],
              ["Difficulty", "Hard (editable)"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3"
              >
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  {label}
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm text-[var(--text)]">
            <p className="font-semibold">Example exercise</p>
            <p className="mt-2">
              Find and classify the stationary points of f(x) = x³ − 3x.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              Solution: f′(x) = 3x² − 3 = 0 gives x = ±1. Since f″(x) = 6x, (−1,
              2) is a local maximum and (1, −2) a local minimum.
            </p>
          </div>
        )}
        {step === 3 && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
            <p className="text-sm font-semibold text-[var(--text)]">
              Ready for your classroom
            </p>
            {[
              "Editable Word or print-ready PDF",
              "Choose whether to include solutions",
              "Review before sharing with students",
            ].map((text) => (
              <p
                key={text}
                className="mt-3 flex gap-2 text-xs text-[var(--text-secondary)]"
              >
                <Check size={14} className="shrink-0 text-[var(--accent)]" />
                {text}
              </p>
            ))}
          </div>
        )}
      </div>
      <div
        role="progressbar"
        aria-label="Demo progress"
        aria-valuemin={0}
        aria-valuemax={20}
        aria-valuenow={elapsed}
        className="h-1 bg-[var(--border)]"
      >
        <div
          className="h-full bg-[var(--accent)] transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${elapsed * 5}%` }}
        />
      </div>
      <p className="px-4 py-2 text-[10px] text-[var(--text-tertiary)]">
        Illustrative example. This demo does not generate an exam or use your
        allowance.
      </p>
    </section>
  );
}
