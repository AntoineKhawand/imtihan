"use client";

import { PaperCompositionReview } from "@/components/ui/PaperCompositionReview";
import { applyPaper, paperContextIssues } from "@/lib/paperComposition";
import { PaperCompositionSchema } from "@/lib/schemas/sourceDocument";
import { compatiblePaperProfiles } from "@/data/paperProfiles";
import { DIFFICULTY_PRESETS, difficultyPreset, normalizeDifficulty } from "@/lib/difficulty";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle2, Info, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/FormElements";
import { cn, SUBJECT_LABELS, LANGUAGE_LABELS, EXAM_TYPE_LABELS } from "@/lib/utils";
import { CURRICULA, SUBJECT_GROUPS, GEOGRAPHIC_SUBJECTS } from "@/data/curricula";
import { Globe } from "lucide-react";
import type { ExamContext, ExamContextWarning } from "@/types/exam";
import type { CurriculumId, Subject } from "@/types/curriculum";
import { StepIndicator, StepLabel } from "@/app/create/page";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/StructureFormElements";

/** Even split of `total` points across `count` exercises, e.g. (20, 3) → [7, 7, 6] — extra points land on the earliest exercises. */
function evenPointSplit(total: number, count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
}

const DURATION_OPTIONS = [
  { value: "20",  label: "20 min" },
  { value: "30",  label: "30 min" },
  { value: "45",  label: "45 min" },
  { value: "60",  label: "1 hour" },
  { value: "90",  label: "1h 30min" },
  { value: "120", label: "2 hours" },
  { value: "180", label: "3 hours" },
  { value: "240", label: "4 hours" },
];

export default function ConfirmPage() {
  const router = useRouter();
  const [context, setContext] = useState<(ExamContext & { warnings?: ExamContextWarning[]; confidence?: number }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissedWarnings, setDismissedWarnings] = useState<number[]>([]);
  /** Snapshot of the AI's original field values, taken once on load — lets us
   *  detect "teacher reverted this field back" vs. "still different" so a
   *  dismissed warning can reappear if they undo their edit. */
  const [originalValues, setOriginalValues] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("imtihan_context");
    if (!raw) { router.replace("/create"); return; }
    try { 
      const parsed = JSON.parse(raw);
      let initial = {
        ...parsed,
        difficultyMix: normalizeDifficulty(parsed.difficultyMix),
        templateType: "modern" as const,
        totalPoints: parsed.totalPoints ?? 20,
        exerciseCount: parsed.exerciseCount ?? 3,
        layoutPreferences: "",
      };
      const source = initial.sourceDocument;
      if (!initial.paperCompositionReviewed && !initial.paperComposition && source?.intent?.purposes?.includes("structure") && source.structure?.sections?.length) {
        const paper = PaperCompositionSchema.safeParse({ origin: "uploaded", ...source.structure, footerText: source.intent.purposes.includes("branding") ? source.structure.footerText : "" });
        if (paper.success) initial = { ...initial, ...applyPaper(initial, paper.data) };
      }
      setContext(initial);
      setOriginalValues(initial);
    }
    catch { router.replace("/create"); }
    finally { setLoading(false); }
  }, [router]);

  // Auto-persist edits so navigating back doesn't wipe in-progress changes.
  useEffect(() => {
    if (context) sessionStorage.setItem("imtihan_context", JSON.stringify(context));
  }, [context]);

  /** Auto-dismiss a field's AI note when the teacher edits that field away from
   *  the AI's original value, and bring it back if they revert the edit. */
  function reconcileWarningsForField(field: string, newValue: unknown) {
    setDismissedWarnings((prevDismissed) => {
      if (!context?.warnings || !originalValues) return prevDismissed;
      let next = prevDismissed;
      context.warnings.forEach((w, i) => {
        if (w.field !== field) return;
        const original = originalValues[field];
        const changed = JSON.stringify(newValue) !== JSON.stringify(original);
        if (changed && !next.includes(i)) next = [...next, i];
        else if (!changed && next.includes(i)) next = next.filter((idx) => idx !== i);
      });
      return next;
    });
  }

  function update<K extends keyof ExamContext>(key: K, value: ExamContext[K]) {
    setContext((prev) => prev ? { ...prev, [key]: value, ...((key === "subject" || key === "levelId") ? { chapterIds: [] } : {}) } : prev);
    reconcileWarningsForField(key as string, value);
  }

  /** The points-per-exercise values to actually display: the teacher's own edited breakdown when it still matches exerciseCount, otherwise a fresh even split. */
  const displayPoints = context
    ? (context.pointsPerExercise && context.pointsPerExercise.length === context.exerciseCount
        ? context.pointsPerExercise
        : evenPointSplit(context.totalPoints, context.exerciseCount))
    : [];
  const displayPointsSum = displayPoints.reduce((a, b) => a + (b || 0), 0);
  const compositionIssues = context ? paperContextIssues(context) : [];
  const incompatibleProfile = context?.paperComposition?.profileId && !compatiblePaperProfiles(context).some(p => p.id === context.paperComposition?.profileId);
  const pointsMismatch = context ? (context.paperComposition ? compositionIssues.length > 0 : displayPointsSum !== context.totalPoints || displayPoints.some(points => !Number.isFinite(points) || points <= 0)) : false;

  function updateExercisePoints(index: number, value: number) {
    const next = [...displayPoints];
    next[index] = value;
    update("pointsPerExercise", next);
  }

  function handleContinue() {
    if (!context || pointsMismatch || incompatibleProfile) return;
    sessionStorage.setItem("imtihan_context", JSON.stringify({ ...context, pointsPerExercise: context.paperComposition ? context.pointsPerExercise : displayPoints }));
    router.push("/create/generate");
  }

  if (loading || !context) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const curriculum    = CURRICULA[context.curriculumId as CurriculumId];
  const level         = curriculum?.levels.find((l) => l.id === context.levelId);
  const availableChapters = level?.chapters[context.subject as Subject] ?? [];

  const curriculumOptions = Object.entries(CURRICULA).map(([id, c]) => ({ value: id, label: c.name.fr }));
  const levelOptions      = (curriculum?.levels ?? []).map((l) => ({ value: l.id, label: l.name.fr }));
  const subjectOptions    = (curriculum?.subjects ?? []).map((s) => ({ value: s, label: SUBJECT_LABELS[s]?.fr ?? s }));
  const languageOptions   = (curriculum?.languages ?? []).map((l) => ({ value: l, label: LANGUAGE_LABELS[l] ?? l }));
  const examTypeOptions   = Object.entries(EXAM_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l.fr }));

  const conf = context.confidence ?? 1;
  const highConf = conf >= 0.8;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="grid grid-cols-3 items-center px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center">
          <Link href="/create" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm hidden sm:block font-medium">Back</span>
          </Link>
        </div>
        
        <div className="flex justify-center">
          <Logo size={28} />
        </div>

        <div className="flex justify-end">
          <StepIndicator current={2} />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 md:px-10 py-12">
        <div className="w-full max-w-2xl space-y-6">

          <div>
            <StepLabel step={2} />
            <h1 className="serif text-display-lg text-[var(--text)] mb-2">Confirm & Configure</h1>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Review detection results and define your exam blueprint before generation.
            </p>
          </div>

          {/* Confidence banner */}
          <div className={cn(
            "flex items-center gap-3 px-4 py-3.5 rounded-2xl border",
            highConf
              ? "bg-[var(--accent-light)] border-[var(--accent)]/30"
              : "bg-[var(--bg-subtle)] border-[var(--border)]"
          )}>
            {highConf
              ? <CheckCircle2 size={15} className="text-[var(--accent)] flex-shrink-0" />
              : <Info size={15} className="text-[var(--text-secondary)] flex-shrink-0" />}
            <span className="text-xs font-medium text-[var(--text)]">
              {highConf
                ? "Everything looks well-identified — review and continue."
                : "Some details were inferred from your description. Review the fields below before continuing."}
            </span>
            <span className={cn(
              "ml-auto text-xs font-semibold tabular-nums flex-shrink-0",
              highConf ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"
            )}>
              {Math.round(conf * 100)}%
            </span>
          </div>

          {/* AI notes — dismissible hints, not errors */}
          {context.warnings && context.warnings.filter((_, i) => !dismissedWarnings.includes(i)).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1.5">
                <Info size={11} />
                AI notes — these are suggestions, not errors. Dismiss any you&apos;re happy with.
              </p>
              {context.warnings.map((w, i) => (
                dismissedWarnings.includes(i) ? null : (
                  <div key={i} className="flex items-start gap-3 px-3.5 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
                    <AlertTriangle size={13} className="text-[var(--warning)] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed flex-1">{w.message}</p>
                    <button
                      onClick={() => setDismissedWarnings((prev) => [...prev, i])}
                      className="text-[var(--text-tertiary)] hover:text-[var(--text)] transition-colors flex-shrink-0 mt-0.5"
                      title="Dismiss"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Form card */}
          <div data-guide="context" className="card p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="Curriculum" value={context.curriculumId} options={curriculumOptions}
                onChange={(e) => {
                  const newCurrId = e.target.value as CurriculumId;
                  const newCurr = CURRICULA[newCurrId];
                  const firstLevel = newCurr?.levels?.[0]?.id ?? "";
                  setContext((prev) => prev ? { ...prev, curriculumId: newCurrId, levelId: firstLevel, chapterIds: [] } : prev);
                  reconcileWarningsForField("curriculumId", newCurrId);
                  reconcileWarningsForField("levelId", firstLevel);
                  reconcileWarningsForField("chapterIds", []);
                }} />
              <Select label="Level" value={context.levelId} options={levelOptions}
                onChange={(e) => update("levelId", e.target.value)} />
              <Select label="Subject" value={context.subject} options={subjectOptions}
                onChange={(e) => update("subject", e.target.value as Subject)} />
              <Select label="Language" value={context.language} options={languageOptions}
                onChange={(e) => update("language", e.target.value as "french" | "english" | "arabic")} />
              <Select label="Exam type" value={context.examType} options={examTypeOptions}
                onChange={(e) => update("examType", e.target.value as ExamContext["examType"])} />
              <Select label="Duration" value={String(context.duration)} options={DURATION_OPTIONS}
                onChange={(e) => update("duration", Number(e.target.value))} />
            </div>

            {/* Geographic Context (Relevant subjects only) */}
            {GEOGRAPHIC_SUBJECTS.includes(context.subject as any) && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-[var(--text-tertiary)]" />
                  <p className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide">Geographic Context</p>
                </div>
                <div className="relative group">
                  <input
                    type="text"
                    value={context.geographicContext || "Global"}
                    onChange={(e) => update("geographicContext", e.target.value)}
                    placeholder="e.g. Lebanon, France, Japan..."
                    className="w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-all"
                  />
                  <div className="mt-2 flex items-center gap-1.5 px-1">
                    <CheckCircle2 size={10} className="text-[var(--accent)]" />
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      Accurate data (GDP, inflation, population) will be injected automatically for {context.geographicContext || "this region"}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chapters */}
            {availableChapters.length > 0 && (
              <div data-guide="chapters" className="pt-1">
                <p className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide mb-3">Chapters</p>
                <div className="flex flex-wrap gap-2">
                  {availableChapters.map((ch) => {
                    const selected = context.chapterIds.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        onClick={() => {
                          const next = selected
                            ? context.chapterIds.filter((id) => id !== ch.id)
                            : [...context.chapterIds, ch.id];
                          update("chapterIds", next);
                        }}
                        className={cn(
                          "text-xs px-3 py-1.5 rounded-full border transition-all",
                          selected
                            ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm"
                            : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text)]"
                        )}
                      >
                        {ch.name.fr}
                      </button>
                    );
                  })}
                </div>
                {context.chapterIds.length === 0 && (
                  <p className="text-xs text-[var(--danger)] mt-2">Select at least one chapter.</p>
                )}
              </div>
            )}

            {/* University notice */}
            {context.curriculumId === "university" && (
              <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs text-[var(--text-secondary)] leading-relaxed">
                University mode: chapters are inferred from your description and uploaded documents. The AI uses your course content directly.
              </div>
            )}

            <div data-guide="difficulty" className="space-y-2 border-t border-[var(--border)] pt-4">
              <label htmlFor="exam-difficulty" className="text-xs font-semibold text-[var(--text)]">Difficulty</label>
              <select id="exam-difficulty" value={difficultyPreset(context.difficultyMix)}
                onChange={(event) => update("difficultyMix", { ...DIFFICULTY_PRESETS[event.target.value as keyof typeof DIFFICULTY_PRESETS] })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)]">
                <option value="hard">Hard (default)</option><option value="medium">Medium</option><option value="easy">Easy</option><option value="mixed">Mixed</option><option value="custom" disabled>Custom mix from description</option>
              </select>
              <p className="text-xs text-[var(--text-tertiary)]">{Math.round(context.difficultyMix.easy * 100)}% easy · {Math.round(context.difficultyMix.medium * 100)}% medium · {Math.round(context.difficultyMix.hard * 100)}% hard. Difficulty stays within the selected syllabus.</p>
            </div>

            {/* Blueprint Extension */}
            <div data-guide="blueprint" className="pt-4 border-t border-[var(--border)] space-y-5">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-[var(--text-tertiary)]" />
                <p className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide">Exam Blueprint</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" label="Total Points" disabled={!!context.paperComposition} min={1} max={200} value={context.totalPoints} onChange={(e) => update("totalPoints", parseInt(e.target.value, 10))} />
                <Input type="number" label="Exercises" disabled={!!context.paperComposition} min={1} max={20} value={context.exerciseCount} onChange={(e) => update("exerciseCount", parseInt(e.target.value, 10))} />
              </div>

              {/* Per-exercise point breakdown — defaults to an even split, editable to
                  set e.g. Exercise 1 = 5, Exercise 2 = 10, Exercise 3 = 5 instead of
                  leaving the distribution entirely to the model. */}
              {context.exerciseCount > 0 && !context.paperComposition && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide">Points per Exercise</p>
                    <span className={cn("text-xs font-mono", pointsMismatch ? "text-[var(--danger)]" : "text-[var(--text-tertiary)]")}>
                      {displayPointsSum} / {context.totalPoints}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayPoints.map((pts, i) => (
                      <div key={i} className="w-20">
                        <Input
                          type="number"
                          label={`Ex. ${i + 1}`}
                          value={pts}
                          onChange={(e) => updateExercisePoints(i, parseInt(e.target.value, 10) || 0)}
                        />
                      </div>
                    ))}
                  </div>
                  {pointsMismatch && (
                    <p className="text-xs text-[var(--danger)]">
                      Points must add up to {context.totalPoints} (currently {displayPointsSum}).
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <PaperCompositionReview context={context} onChange={next => setContext(prev => prev ? { ...prev, ...next } : prev)} />

          <Button
            data-guide="generate"
            onClick={handleContinue}
            disabled={(context.curriculumId !== "university" && availableChapters.length > 0 && !context.chapterIds.some(id => availableChapters.some(ch => ch.id === id))) || pointsMismatch || !!incompatibleProfile || !Number.isFinite(context.totalPoints) || context.totalPoints <= 0 || !Number.isInteger(context.exerciseCount) || context.exerciseCount < 1 || context.exerciseCount > 20}
            size="lg"
            className="w-full"
            icon={<ArrowRight size={16} />}
            iconPosition="right"
          >
            Generate Exam
          </Button>
        </div>
      </main>
    </div>
  );
}
