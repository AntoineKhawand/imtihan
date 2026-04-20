"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Slider, Toggle } from "@/components/ui/FormElements";
import { cn } from "@/lib/utils";
import type { ExamContext } from "@/types/exam";
import { StepIndicator, StepLabel } from "@/app/create/page";

const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    description: "Clean header, numbered exercises",
    preview: "Examen · Terminale S · 2h",
  },
  {
    id: "bac-libanais",
    name: "Bac Libanais",
    description: "Official LB style with school header",
    preview: "الاختبار الرسمي · 20 points",
  },
  {
    id: "ib-style",
    name: "IB Style",
    description: "Mark scheme with command terms",
    preview: "IB Exam · Section A / B · [2]",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "No frills, maximum whitespace",
    preview: "—",
  },
];

interface DifficultyMix {
  easy: number;
  medium: number;
  hard: number;
}

export default function StructurePage() {
  const router = useRouter();
  const [context, setContext] = useState<ExamContext | null>(null);
  const [templateId, setTemplateId] = useState("classic");
  const [exerciseCount, setExerciseCount] = useState(3);
  const [totalPoints, setTotalPoints] = useState(20);
  const [difficultyMix, setDifficultyMix] = useState<DifficultyMix>({ easy: 0.3, medium: 0.5, hard: 0.2 });
  const [versionB, setVersionB] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("imtihan_context");
    if (!raw) { router.replace("/create"); return; }
    try {
      const ctx = JSON.parse(raw) as ExamContext;
      setContext(ctx);
      setExerciseCount(ctx.exerciseCount ?? 3);
      setTotalPoints(ctx.totalPoints ?? 20);
      setDifficultyMix(ctx.difficultyMix ?? { easy: 0.3, medium: 0.5, hard: 0.2 });
      setVersionB(ctx.generateVersionB ?? false);
      if (ctx.curriculumId === "bac-libanais") setTemplateId("bac-libanais");
      else if (ctx.curriculumId === "ib") setTemplateId("ib-style");
    } catch { router.replace("/create"); }
  }, [router]);

  function updateDifficulty(key: keyof DifficultyMix, raw: number) {
    const value = raw / 100;
    const remaining = 1 - value;
    const others = Object.keys(difficultyMix).filter((k) => k !== key) as (keyof DifficultyMix)[];
    const currentOtherTotal = others.reduce((s, k) => s + difficultyMix[k], 0);
    const updated = { ...difficultyMix, [key]: value };
    if (currentOtherTotal === 0) {
      others.forEach((k) => { updated[k] = remaining / 2; });
    } else {
      others.forEach((k) => {
        updated[k] = (difficultyMix[k] / currentOtherTotal) * remaining;
      });
    }
    setDifficultyMix(updated);
  }

  function handleContinue() {
    if (!context) return;
    const updated: ExamContext = {
      ...context,
      exerciseCount,
      totalPoints,
      difficultyMix,
      generateVersionB: versionB,
    };
    sessionStorage.setItem("imtihan_context", JSON.stringify(updated));
    sessionStorage.setItem("imtihan_templateId", templateId);
    router.push("/create/generate");
  }

  if (!context) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const pointsPerExercise = Math.round(totalPoints / exerciseCount);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <Link href="/create/confirm" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft size={16} />
          <span className="text-sm hidden sm:block">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white text-xs font-serif">إ</span>
          </div>
          <span className="font-semibold text-sm text-[var(--text)] tracking-tight">Imtihan</span>
        </div>
        <StepIndicator current={3} />
      </header>

      <main className="flex-1 flex flex-col items-center px-6 md:px-10 py-12">
        <div className="w-full max-w-2xl space-y-6">

          <div>
            <StepLabel step={3} />
            <h1 className="serif text-display-lg text-[var(--text)] mb-2">Structure your exam</h1>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Choose how many exercises, how points are distributed, and the difficulty mix.
            </p>
          </div>

          {/* Exercises + Points */}
          <div className="card p-6 space-y-6">
            <Slider
              label="Number of exercises"
              value={exerciseCount}
              onChange={setExerciseCount}
              min={1}
              max={10}
              step={1}
              formatValue={(v) => `${v} exercise${v === 1 ? "" : "s"}`}
            />
            <Slider
              label="Total points"
              value={totalPoints}
              onChange={setTotalPoints}
              min={10}
              max={100}
              step={5}
              formatValue={(v) => `${v} pts`}
            />
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
              <span className="text-sm text-[var(--text-secondary)]">Average per exercise</span>
              <span className="text-sm font-semibold text-[var(--text)]">{pointsPerExercise} pts</span>
            </div>
          </div>

          {/* Difficulty mix */}
          <div className="card p-6 space-y-5">
            <div>
              <h3 className="font-semibold text-[var(--text)] mb-1">Difficulty mix</h3>
              <p className="text-xs text-[var(--text-secondary)]">Adjust how many exercises are easy, medium, or hard.</p>
            </div>

            {/* Visual bar */}
            <div className="flex h-2.5 rounded-full overflow-hidden gap-px">
              <div className="bg-emerald-500 transition-all duration-300 rounded-l-full" style={{ width: `${difficultyMix.easy * 100}%` }} />
              <div className="bg-amber-500 transition-all duration-300" style={{ width: `${difficultyMix.medium * 100}%` }} />
              <div className="bg-red-500 transition-all duration-300 rounded-r-full" style={{ width: `${difficultyMix.hard * 100}%` }} />
            </div>

            <div className="flex gap-5 text-xs text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                Easy <strong className="text-[var(--text)] tabular-nums">{Math.round(difficultyMix.easy * 100)}%</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                Medium <strong className="text-[var(--text)] tabular-nums">{Math.round(difficultyMix.medium * 100)}%</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                Hard <strong className="text-[var(--text)] tabular-nums">{Math.round(difficultyMix.hard * 100)}%</strong>
              </span>
            </div>

            {(["easy", "medium", "hard"] as const).map((d) => (
              <Slider
                key={d}
                label={d.charAt(0).toUpperCase() + d.slice(1)}
                value={Math.round(difficultyMix[d] * 100)}
                onChange={(v) => updateDifficulty(d, v)}
                min={0}
                max={100}
                step={10}
                formatValue={(v) => `${v}%`}
              />
            ))}
          </div>

          {/* Template */}
          <div className="card p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-[var(--text)] mb-1">Template</h3>
              <p className="text-xs text-[var(--text-secondary)]">Choose a visual style for your exported exam.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplateId(t.id)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    templateId === t.id
                      ? "border-[var(--accent)] bg-[var(--accent-light)] shadow-sm"
                      : "border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-[var(--text)]">{t.name}</p>
                    {templateId === t.id && (
                      <div className="w-4 h-4 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mb-2.5">{t.description}</p>
                  <p className="text-xs font-mono text-[var(--text-tertiary)] bg-[var(--bg-subtle)] rounded-lg px-2 py-1.5 truncate">{t.preview}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Version B */}
          <div className="card p-6">
            <Toggle
              checked={versionB}
              onChange={setVersionB}
              label="Generate Version A & B"
              description="Two equivalent exams with different numbers — for anti-cheating across sections."
            />
          </div>

          <Button onClick={handleContinue} size="lg" className="w-full" icon={<ArrowRight size={16} />} iconPosition="right">
            Generate exam
          </Button>
        </div>
      </main>
    </div>
  );
}
