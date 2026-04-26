"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle2, Info, X, Layout, FileText, Wand2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/FormElements";
import { cn, SUBJECT_LABELS, LANGUAGE_LABELS, EXAM_TYPE_LABELS } from "@/lib/utils";
import { CURRICULA, SUBJECT_GROUPS, GEOGRAPHIC_SUBJECTS } from "@/data/curricula";
import { Globe } from "lucide-react";
import type { ExamContext } from "@/types/exam";
import type { CurriculumId, Subject } from "@/types/curriculum";
import { StepIndicator, StepLabel } from "@/app/create/page";
import { Logo } from "@/components/ui/Logo";
import { Input, Toggle } from "@/components/ui/StructureFormElements";
import { useAuth } from "@/contexts/AuthContext";
import { isProActive } from "@/lib/subscription";

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
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const { profile } = useAuth();
  const isFreeTier = !isProActive(profile);

  useEffect(() => {
    const raw = sessionStorage.getItem("imtihan_context");
    if (!raw) { router.replace("/create"); return; }
    try { 
      const parsed = JSON.parse(raw);
      const fileRaw = sessionStorage.getItem("imtihan_uploaded_file");
      let fileName: string | null = null;
      if (fileRaw) {
        const file = JSON.parse(fileRaw);
        fileName = file.name;
        setUploadedFileName(fileName);
      }

      setContext({
        ...parsed,
        // If they uploaded a file, default to 'uploaded' template mode if not already chosen
        templateType: parsed.templateType ?? (fileName ? "uploaded" : "modern"),
        totalPoints: parsed.totalPoints ?? 20,
        exerciseCount: parsed.exerciseCount ?? 3,
        generateVersionB: parsed.generateVersionB ?? false,
        // Pre-fill instructions if they chose uploaded but have no prefs yet
        layoutPreferences: parsed.layoutPreferences ?? (fileName ? `Mimic the header, logo, and general visual layout of the uploaded document "${fileName}".` : ""),
      }); 
    }
    catch { router.replace("/create"); }
    finally { setLoading(false); }
  }, [router]);

  // Auto-persist edits so navigating back doesn't wipe in-progress changes.
  useEffect(() => {
    if (context) sessionStorage.setItem("imtihan_context", JSON.stringify(context));
  }, [context]);

  function update<K extends keyof ExamContext>(key: K, value: ExamContext[K]) {
    setContext((prev) => prev ? { ...prev, [key]: value } : prev);
  }

  function handleContinue() {
    if (!context) return;
    sessionStorage.setItem("imtihan_context", JSON.stringify(context));
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

            {/* Blueprint Extension */}
            <div className="pt-4 border-t border-[var(--border)] space-y-5">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-[var(--text-tertiary)]" />
                <p className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide">Exam Blueprint</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" label="Total Points" value={context.totalPoints} onChange={(e) => update("totalPoints", parseInt(e.target.value, 10))} />
                <Input type="number" label="Exercises" value={context.exerciseCount} onChange={(e) => update("exerciseCount", parseInt(e.target.value, 10))} />
              </div>
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
              <Layout size={16} className="text-[var(--text-tertiary)]" />
              Document Template
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => update("templateType", "modern")}
                className={cn(
                  "flex flex-col items-start p-4 rounded-2xl border transition-all text-left group",
                  context.templateType === "modern"
                    ? "bg-[var(--accent-light)] border-[var(--accent)] ring-1 ring-[var(--accent)]"
                    : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)]"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-colors",
                  context.templateType === "modern" ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-subtle)] text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]"
                )}>
                  <CheckCircle2 size={16} />
                </div>
                <p className="text-sm font-semibold text-[var(--text)] mb-1">Modern (Standard)</p>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Clean, professional Imtihan layout optimized for readability and printing.
                </p>
              </button>

              <button
                onClick={() => update("templateType", "uploaded")}
                className={cn(
                  "flex flex-col items-start p-4 rounded-2xl border transition-all text-left group relative",
                  context.templateType === "uploaded"
                    ? "bg-[var(--accent-light)] border-[var(--accent)] ring-1 ring-[var(--accent)]"
                    : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)]"
                )}
              >
                {uploadedFileName && (
                  <div className="absolute top-3 right-3 bg-[var(--accent)] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    Recommended
                  </div>
                )}
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-colors",
                  context.templateType === "uploaded" ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-subtle)] text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]"
                )}>
                  <Wand2 size={16} />
                </div>
                <p className="text-sm font-semibold text-[var(--text)] mb-1">Extract Template</p>
                <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {uploadedFileName ? (
                    <div className="flex items-center gap-1 text-[var(--accent)] font-medium">
                      <FileText size={10} />
                      <span className="truncate max-w-[140px]">{uploadedFileName}</span>
                    </div>
                  ) : (
                    "Describe a custom layout or upload a template file in Step 1."
                  )}
                </div>
              </button>
            </div>

            {context.templateType === "uploaded" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-[var(--accent)]" />
                    <p className="text-xs font-semibold text-[var(--text)]">Extraction Instructions</p>
                  </div>
                  <textarea
                    value={context.layoutPreferences || ""}
                    onChange={(e) => update("layoutPreferences", e.target.value)}
                    placeholder="e.g. Replicate the school header from the PDF, use the same grading table at the end, keep the specific logo on the top right..."
                    className="w-full min-h-[80px] p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                  />
                  <p className="text-[10px] text-[var(--text-tertiary)] leading-relaxed">
                    The AI will analyze the visual structure of your document and attempt to replicate it.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Exam Variants */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--text-tertiary)]" />
              Exam Variants
            </h3>
            <Toggle
              label="Generate Version B"
              description={isFreeTier ? "Available on the Pro plan" : "Shuffles question order and regenerates numerical values."}
              checked={!!context.generateVersionB}
              onChange={(checked) => {
                if (!isFreeTier) {
                  update("generateVersionB", checked);
                }
              }}
              locked={isFreeTier}
            />
          </div>

          <Button
            onClick={handleContinue}
            disabled={context.chapterIds.length === 0}
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
