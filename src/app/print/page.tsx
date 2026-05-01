"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SUBJECT_LABELS, LANGUAGE_LABELS, cn } from "@/lib/utils";
import { getSchoolSettings } from "@/lib/storage";
import type { ExamContext, Exercise } from "@/types/exam";
import { renderContent } from "@/lib/renderContent";
import "katex/dist/katex.min.css";

const DIFFICULTY_CONFIG = {
  easy: { label_en: "Easy", label_fr: "Facile", label_ar: "سهل", color: "text-emerald-600 bg-emerald-50 border-emerald-100", dot: "bg-emerald-500" },
  medium: { label_en: "Medium", label_fr: "Moyen", label_ar: "متوسط", color: "text-amber-600 bg-amber-50 border-amber-100", dot: "bg-amber-500" },
  hard: { label_en: "Hard", label_fr: "Difficile", label_ar: "صعب", color: "text-red-600 bg-red-50 border-red-100", dot: "bg-red-500" },
};

export default function PrintPage() {
  const router = useRouter();
  const [context, setContext] = useState<ExamContext | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templateId, setTemplateId] = useState("classic");
  const [schoolSettings, setSchoolSettings] = useState<{ schoolName?: string; teacherName?: string }>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ctxRaw = sessionStorage.getItem("imtihan_context");
    const exRaw = sessionStorage.getItem("imtihan_exercises");
    const tmpl = sessionStorage.getItem("imtihan_templateId") ?? "classic";
    if (!ctxRaw || !exRaw) {
      router.replace("/create");
      return;
    }
    try {
      setContext(JSON.parse(ctxRaw));
      setExercises(JSON.parse(exRaw));
      setTemplateId(tmpl);
      setSchoolSettings(getSchoolSettings() || {});
      setReady(true);
      
      // Give MathJax/KaTeX and DOM a moment to render before triggering print
      setTimeout(() => {
        window.print();
      }, 1000);
    } catch {
      router.replace("/create");
    }
  }, [router]);

  if (!context) return null;

  const isArabic = context.language === "arabic";
  const lang = isArabic ? "ar" : context.language === "french" ? "fr" : "en";
  const subjectName = SUBJECT_LABELS[context.subject]?.[lang === "ar" ? "fr" : lang] ?? context.subject; // fallback to fr for now if ar missing
  
  const durationWord = lang === "ar" ? "المدة" : "Durée";
  const totalWord = lang === "ar" ? "المجموع" : "Total";
  const pointsWord = lang === "ar" ? "نقاط" : "points";
  const professorWord = lang === "ar" ? "الأستاذ" : "Prof";
  const exerciseWord = lang === "ar" ? "تمرين" : "Exercice";
  const corrigWord = lang === "ar" ? "الإجابة النموذجية" : "CORRIGÉ";
  const responseWord = lang === "ar" ? "الإجابة" : "Réponse";
  const baremeWord = lang === "ar" ? "سلم التصحيح" : "Barème de correction";
  const questionWord = lang === "ar" ? "السؤال" : "Question";
  const criterionWord = lang === "ar" ? "المعيار" : "Critère";
  const methodologyWord = lang === "ar" ? "منهجية الحل" : "Méthodologie";
  const stepWord = lang === "ar" ? "الخطوة" : "Étape";
  const observableWord = lang === "ar" ? "المعيار الملاحظ" : "Critère observable";
  const microWord = lang === "ar" ? "الميكرو-باريم" : "Micro-barème";

  const isModern = templateId === "modern";
  const isFormal = templateId === "formal";

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className={cn(
        "bg-[var(--bg)] text-[var(--text)] min-h-screen p-8 mx-auto max-w-[210mm]", // A4 width approx
        isFormal ? "font-serif" : isModern ? "font-sans" : "font-serif"
      )}
    >
      {/* Print-specific CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 20mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: var(--bg) !important; }
          .page-break { page-break-before: always; }
          .no-break { page-break-inside: avoid; }
          /* Hide standard UI elements */
          header, footer, nav, button { display: none !important; }
        }
      `}} />

      {/* Header */}
      <div className={cn("text-center mb-8", isFormal ? "border-b-4 border-double border-black pb-6" : "border-b-2 border-emerald-800 pb-4")}>
        {schoolSettings.schoolName && (
          <h2 className={cn("text-xl font-bold mb-2", isModern ? "text-blue-700" : isFormal ? "text-black" : "text-emerald-800")}>
            {schoolSettings.schoolName}
          </h2>
        )}
        <h1 className={cn("text-3xl font-bold mb-2", isModern ? "text-gray-900" : "text-black")}>
          {subjectName} — {context.levelId}
        </h1>
        <div className={cn("flex justify-center items-center gap-4 text-sm", isModern ? "text-gray-600 font-medium" : "text-gray-800")}>
          <span>{durationWord}: {context.duration} min</span>
          <span>|</span>
          <span>{totalWord}: {context.totalPoints} {pointsWord}</span>
          {schoolSettings.teacherName && (
            <>
              <span>|</span>
              <span>{professorWord}: {schoolSettings.teacherName}</span>
            </>
          )}
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-6">
        {exercises.map((ex, i) => {
          const diff = DIFFICULTY_CONFIG[ex.difficulty] || DIFFICULTY_CONFIG.medium;
          const diffLabel = lang === "fr" ? diff.label_fr : isArabic ? diff.label_ar : diff.label_en;

          return (
            <div key={ex.id} className="no-break card overflow-hidden p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-[var(--text)]">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[var(--text)]">
                      {exerciseWord} {i + 1}
                    </span>
                    <span className="text-sm text-[var(--text-tertiary)]">·</span>
                    <span className={cn("inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider", diff.color)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", diff.dot)} />
                      {diffLabel}
                    </span>
                    <span className="text-sm text-[var(--text-tertiary)]">·</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/20">
                      {ex.points} {pointsWord}
                    </span>
                  </div>
                </div>
              </div>
            
            <div 
              className={cn("text-[15px] leading-relaxed", isFormal ? "text-black" : "text-[var(--text)]")}
              dangerouslySetInnerHTML={{ __html: renderContent(ex.statement) }}
            />

            {ex.subQuestions && ex.subQuestions.length > 0 && (
              <div className="mt-5 space-y-3">
                {ex.subQuestions.map((sq, sqIdx) => (
                  <div key={sqIdx} className="flex gap-3">
                    <span className={cn("text-sm font-semibold text-[var(--accent)] flex-shrink-0", isArabic ? "w-8" : "w-6")}>{sq.label}</span>
                    <div className="flex-1">
                      <span 
                        className="text-sm text-[var(--text)] leading-relaxed inline-block"
                        dangerouslySetInnerHTML={{ __html: renderContent(sq.statement) }}
                      />
                      <span className={cn("text-xs font-medium text-[var(--text-tertiary)]", isArabic ? "mr-2" : "ml-2")}>({sq.points} pts)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          );
        })}
      </div>

      {/* Answer Key / Corrigé */}
      <div className="page-break mt-12 pt-12">
        <h1 className={cn("text-3xl font-bold text-center mb-10", isModern ? "text-[var(--text)]" : "text-black")}>
          {corrigWord}
        </h1>

        <div className="space-y-8">
          {exercises.map((ex, i) => (
            <div key={ex.id} className="no-break card overflow-hidden">
              <div className="bg-[var(--bg-subtle)] p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-[var(--text)]">{i + 1}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text)]">
                    {exerciseWord} {i + 1} - {corrigWord}
                  </h3>
                </div>

                {ex.solution.bareme && ex.solution.bareme.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">{baremeWord}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent)] text-white">
                        {ex.solution.bareme.reduce((s, b) => s + b.points, 0)} pts
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {ex.solution.bareme.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] px-3 py-2.5">
                          <span className="text-xs font-bold text-[var(--accent)] w-24 flex-shrink-0 pt-px leading-tight break-words">{b.label}</span>
                          <span
                            className="flex-1 text-xs text-[var(--text-secondary)] leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: renderContent(b.criterion) }}
                          />
                          <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[28px] h-5 px-1.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] font-bold text-[10px] border border-[var(--accent)]/20">
                            {b.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={cn(ex.solution.bareme ? "" : "pt-2", "mb-6")}>
                  <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">{responseWord}</p>
                  <div className="text-sm text-[var(--text)] font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: renderContent(ex.solution.finalAnswer) }} />
                </div>

                <div className="mb-6">
                  <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">{methodologyWord}</p>
                  <div 
                    className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-1"
                    dangerouslySetInnerHTML={{ 
                      __html: renderContent(
                        (ex.solution.methodology || "").replace(/(?<!^|[\n\r])((?:Étape|Step|خطوة)\s*\d+(?:\s*[:：])?)/gi, "\n\n$1")
                      ) 
                    }}
                  />
                </div>

                {ex.solution.microBareme && ex.solution.microBareme.length > 0 && (
                  <div>
                    <div className={cn("flex items-center justify-between mb-3", isArabic && "flex-row-reverse")}>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                        {microWord ?? "Micro-barème"}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-tertiary)]">
                        {ex.solution.microBareme.reduce((s, mb) => s + mb.points, 0)} pts
                      </span>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] overflow-hidden divide-y divide-[var(--border)] bg-[var(--surface)]">
                      {ex.solution.microBareme.map((mb, mIdx) => (
                        <div key={mIdx} className={cn("flex items-start gap-4 px-4 py-3", isArabic && "flex-row-reverse")}>
                          <span className={cn(
                            "text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest w-28 flex-shrink-0 pt-0.5 leading-tight break-words",
                            isArabic ? "pl-2 border-l border-[var(--border)]/50" : "pr-2 border-r border-[var(--border)]/50"
                          )}>
                            {mb.step}
                          </span>
                          <span
                            className="flex-1 text-xs text-[var(--text-secondary)] leading-relaxed pt-0.5"
                            dangerouslySetInnerHTML={{ __html: renderContent(mb.criterion) }}
                          />
                          <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[32px] h-6 px-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-tertiary)] font-bold text-[10px] shadow-sm">
                            {mb.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
