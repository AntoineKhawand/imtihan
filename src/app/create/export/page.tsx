"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, FileDown, Mail, BookOpen, CheckCircle2, Plus, Sparkles, Eye, EyeOff, Save, Shuffle, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";
import { cn, SUBJECT_LABELS, LANGUAGE_LABELS, shortId } from "@/lib/utils";
import {
  getSchoolSettings, saveSchoolSettings,
  saveExam, buildExamTitle,
  type SavedExam,
} from "@/lib/storage";
import { buildVersionB } from "@/lib/variant";
import type { ExamContext, Exercise } from "@/types/exam";
import { StepIndicator, StepLabel } from "@/app/create/page";

export default function ExportPage() {
  const router = useRouter();
  const [context, setContext] = useState<ExamContext | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templateId, setTemplateId] = useState("classic");

  // Header fields — pre-filled from saved school settings
  const [schoolName, setSchoolName] = useState("");
  const [className, setClassName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [examDate, setExamDate] = useState("");

  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [downloading, setDownloading] = useState<"word" | "pdf" | null>(null);
  const [downloaded, setDownloaded] = useState<"word" | "pdf" | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [variant, setVariant] = useState<"A" | "B">("A");
  const [exportLanguage, setExportLanguage] = useState<"french" | "english" | "arabic">("french");
  const [examSeed] = useState(() => shortId());

  // Track whether we've saved to the library
  const [savedToLibrary, setSavedToLibrary] = useState(false);

  useEffect(() => {
    const ctxRaw = sessionStorage.getItem("imtihan_context");
    const exRaw = sessionStorage.getItem("imtihan_exercises");
    const tmpl = sessionStorage.getItem("imtihan_templateId") ?? "classic";
    if (!ctxRaw || !exRaw) { router.replace("/create"); return; }
    try {
      const ctx = JSON.parse(ctxRaw) as ExamContext;
      setContext(ctx);
      setExercises(JSON.parse(exRaw));
      setTemplateId(tmpl);
      setExportLanguage(ctx.language);
    } catch { router.replace("/create"); }

    // Pre-fill school settings from localStorage
    const settings = getSchoolSettings();
    if (settings) {
      setSchoolName(settings.schoolName ?? "");
      setTeacherName(settings.teacherName ?? "");
    }
  }, [router]);

  // Auto-save school settings whenever they change
  useEffect(() => {
    if (schoolName || teacherName) {
      saveSchoolSettings({ schoolName, teacherName });
    }
  }, [schoolName, teacherName]);

  async function handleDownload(format: "word" | "pdf") {
    if (!context || !exercises.length) return;
    setDownloading(format);

    try {
      const exportExercises = variant === "B" ? buildVersionB(exercises, examSeed) : exercises;
      const exportContext = { ...context, language: exportLanguage };

      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: exportContext,
          exercises: exportExercises,
          format,
          includeAnswerKey,
          header: { schoolName, className, teacherName, date: examDate },
        }),
      });

      if (!res.ok) { setDownloading(null); return; }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const subject = SUBJECT_LABELS[context.subject]?.fr ?? context.subject;
      const suffix = variant === "B" ? "_VersionB" : "";
      a.download = `Imtihan_${subject}_${context.levelId}${suffix}.${format === "word" ? "docx" : "pdf"}`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloaded(format);

      // Save to library on first download
      if (!savedToLibrary) {
        saveExamToLibrary();
      }
    } finally {
      setDownloading(null);
    }
  }

  function saveExamToLibrary() {
    if (!context || !exercises.length) return;
    const exam: SavedExam = {
      id: shortId(),
      title: buildExamTitle(context),
      context,
      exercises,
      header: { schoolName, className, teacherName, date: examDate },
      templateId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveExam(exam);
    setSavedToLibrary(true);
  }

  if (!context) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const totalPoints = exercises.reduce((s, e) => s + e.points, 0);
  const subjectLabel = SUBJECT_LABELS[context.subject]?.fr ?? context.subject;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <Link href="/create/generate" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft size={16} />
          <span className="text-sm hidden sm:block">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white text-xs font-serif">إ</span>
          </div>
          <span className="font-semibold text-sm text-[var(--text)] tracking-tight">Imtihan</span>
        </div>
        <StepIndicator current={5} />
      </header>

      <main className="flex-1 px-6 md:px-10 py-12">
        <div className="max-w-2xl mx-auto space-y-6">

          <div>
            <StepLabel step={5} />
            <h1 className="serif text-display-lg text-[var(--text)] mb-2">Export your exam</h1>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Add optional header info, then download as Word or PDF.
            </p>
          </div>

          {/* Exam summary card */}
          <div className="card p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-[var(--accent)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--text)] truncate">
                  {subjectLabel} — {context.levelId}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                  <span className="text-xs text-[var(--text-secondary)]">{exercises.length} exercise{exercises.length !== 1 ? "s" : ""}</span>
                  <span className="text-xs text-[var(--text-tertiary)]">·</span>
                  <span className="text-xs text-[var(--text-secondary)]">{totalPoints} pts</span>
                  <span className="text-xs text-[var(--text-tertiary)]">·</span>
                  <span className="text-xs text-[var(--text-secondary)]">{context.duration} min</span>
                  <span className="text-xs text-[var(--text-tertiary)]">·</span>
                  <span className="text-xs text-[var(--text-secondary)]">{LANGUAGE_LABELS[context.language]}</span>
                </div>
              </div>
              <CheckCircle2 size={18} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
            </div>
          </div>

          {/* Header info */}
          <div className="card p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-[var(--text)] mb-0.5">Exam header</h3>
              <p className="text-xs text-[var(--text-secondary)]">Appears at the top of exported files. School name &amp; teacher are remembered.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="School name" placeholder="École Évangélique du Liban" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
              <Input label="Class" placeholder="Terminale S — Section A" value={className} onChange={(e) => setClassName(e.target.value)} />
              <Input label="Teacher name" placeholder="M. Antoine Khoury" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} />
              <Input label="Date" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
            </div>
          </div>

          {/* Download options */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h3 className="font-semibold text-[var(--text)]">Download</h3>
              {/* Corrigé toggle */}
              <button
                onClick={() => setIncludeAnswerKey(!includeAnswerKey)}
                className={cn(
                  "inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-all",
                  includeAnswerKey
                    ? "bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent-text)]"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                )}
              >
                {includeAnswerKey ? <Eye size={11} /> : <EyeOff size={11} />}
                {includeAnswerKey ? "Includes corrigé" : "Exam only"}
              </button>
            </div>

            {/* Variant + language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shuffle size={12} className="text-[var(--text-secondary)]" />
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Variant</span>
                </div>
                <div className="flex gap-1">
                  {(["A", "B"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setVariant(v)}
                      className={cn(
                        "flex-1 text-xs px-3 py-1.5 rounded-lg border transition-all",
                        variant === v
                          ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                          : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                      )}
                    >
                      Version {v}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5">
                  {variant === "B" ? "Exercises and sub-questions reordered." : "Original exercise order."}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={12} className="text-[var(--text-secondary)]" />
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Language</span>
                </div>
                <select
                  value={exportLanguage}
                  onChange={(e) => setExportLanguage(e.target.value as typeof exportLanguage)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="french">Français</option>
                  <option value="english">English</option>
                  <option value="arabic">العربية</option>
                </select>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5">
                  Headers &amp; labels only. Exercise content stays in its source language.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleDownload("word")}
                disabled={!!downloading}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                  downloaded === "word"
                    ? "border-[var(--accent)] bg-[var(--accent-light)]"
                    : "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-light)]",
                  downloading === "word" && "opacity-60"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text)]">Word (.docx)</p>
                  <p className="text-xs text-[var(--text-secondary)]">Editable, printable</p>
                </div>
                {downloading === "word" && (
                  <div className="ml-auto w-4 h-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin flex-shrink-0" />
                )}
                {downloaded === "word" && downloading !== "word" && (
                  <CheckCircle2 size={16} className="text-[var(--accent)] flex-shrink-0" />
                )}
              </button>

              <button
                onClick={() => handleDownload("pdf")}
                disabled={!!downloading}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                  downloaded === "pdf"
                    ? "border-[var(--accent)] bg-[var(--accent-light)]"
                    : "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-light)]",
                  downloading === "pdf" && "opacity-60"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                  <FileDown size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text)]">PDF</p>
                  <p className="text-xs text-[var(--text-secondary)]">Print-ready, fixed layout</p>
                </div>
                {downloading === "pdf" && (
                  <div className="ml-auto w-4 h-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin flex-shrink-0" />
                )}
                {downloaded === "pdf" && downloading !== "pdf" && (
                  <CheckCircle2 size={16} className="text-[var(--accent)] flex-shrink-0" />
                )}
              </button>
            </div>

            {/* Manual save to library */}
            {!savedToLibrary && (
              <button
                onClick={saveExamToLibrary}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] border border-dashed border-[var(--border)] hover:border-[var(--accent)] rounded-xl transition-colors"
              >
                <Save size={13} />
                Save to my library (without downloading)
              </button>
            )}
            {savedToLibrary && (
              <div className="flex items-center justify-center gap-2 py-2 text-sm text-[var(--accent)]">
                <CheckCircle2 size={14} />
                Saved to your library
              </div>
            )}
          </div>

          {/* Email */}
          <div className="card p-6">
            <button
              onClick={() => setShowEmail(!showEmail)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[var(--text-secondary)]" />
                <span className="text-sm font-semibold text-[var(--text)]">Send to my email</span>
              </div>
              <Plus size={14} className={cn("text-[var(--text-tertiary)] transition-transform duration-200", showEmail && "rotate-45")} />
            </button>
            {showEmail && (
              <div className="mt-4 flex gap-3">
                <Input
                  placeholder="teacher@school.edu.lb"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setEmailSent(true)}
                  disabled={!email || emailSent}
                >
                  {emailSent ? "Sent ✓" : "Send"}
                </Button>
              </div>
            )}
          </div>

          {/* Next actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/dashboard" className="flex-1">
              <Button variant="secondary" size="lg" className="w-full" icon={<BookOpen size={15} />}>
                View my library
              </Button>
            </Link>
            <Link href="/create" className="flex-1">
              <Button size="lg" className="w-full" icon={<Plus size={15} />}>
                New exam
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
