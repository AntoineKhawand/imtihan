"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/FormElements";
import { cn, SUBJECT_LABELS, LANGUAGE_LABELS, EXAM_TYPE_LABELS } from "@/lib/utils";
import { CURRICULA } from "@/data/curricula";
import type { ExamContext } from "@/types/exam";
import type { CurriculumId, Subject } from "@/types/curriculum";
import { StepIndicator, StepLabel } from "@/app/create/page";

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
  const [context, setContext] = useState<(ExamContext & { warnings?: string[]; confidence?: number }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissedWarnings, setDismissedWarnings] = useState<number[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem("imtihan_context");
    if (!raw) { router.replace("/create"); return; }
    try { setContext(JSON.parse(raw)); }
    catch { router.replace("/create"); }
    finally { setLoading(false); }
  }, [router]);

  function update<K extends keyof ExamContext>(key: K, value: ExamContext[K]) {
    setContext((prev) => prev ? { ...prev, [key]: value } : prev);
  }

  function handleContinue() {
    if (!context) return;
    sessionStorage.setItem("imtihan_context", JSON.stringify(context));
    router.push("/create/structure");
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
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <Link href="/create" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft size={16} />
          <span className="text-sm hidden sm:block">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white text-xs font-serif">إ</span>
          </div>
          <span className="font-semibold text-sm text-[var(--text)] tracking-tight">Imtihan</span>
        </div>
        <StepIndicator current={2} />
      </header>

      <main className="flex-1 flex flex-col items-center px-6 md:px-10 py-12">
        <div className="w-full max-w-2xl space-y-6">

          <div>
            <StepLabel step={2} />
            <h1 className="serif text-display-lg text-[var(--text)] mb-2">Confirm your context</h1>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Imtihan detected these details. Review and adjust anything before generating.
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
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed flex-1">{w}</p>
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
          <div className="card p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="Curriculum" value={context.curriculumId} options={curriculumOptions}
                onChange={(e) => update("curriculumId", e.target.value as CurriculumId)} />
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

            {/* Chapters */}
            {availableChapters.length > 0 && (
              <div className="pt-1">
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
          </div>

          <Button
            onClick={handleContinue}
            disabled={context.chapterIds.length === 0}
            size="lg"
            className="w-full"
            icon={<ArrowRight size={16} />}
            iconPosition="right"
          >
            Continue to structure
          </Button>
        </div>
      </main>
    </div>
  );
}
