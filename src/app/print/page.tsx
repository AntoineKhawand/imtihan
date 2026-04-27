"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SUBJECT_LABELS, LANGUAGE_LABELS, cn } from "@/lib/utils";
import { getSchoolSettings } from "@/lib/storage";
import type { ExamContext, Exercise } from "@/types/exam";
import { renderContent } from "@/lib/renderContent";
import "katex/dist/katex.min.css";

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

  if (!ready || !context) return <div className="p-10 text-center font-mono">Preparing document...</div>;

  const subjectName = SUBJECT_LABELS[context.subject]?.fr ?? context.subject;
  const isModern = templateId === "modern";
  const isFormal = templateId === "formal";

  return (
    <div
      className={cn(
        "bg-white text-black min-h-screen p-8 mx-auto max-w-[210mm]", // A4 width approx
        isFormal ? "font-serif" : isModern ? "font-sans" : "font-serif"
      )}
    >
      {/* Print-specific CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 20mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
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
          <span>Durée: {context.duration} min</span>
          <span>|</span>
          <span>Total: {context.totalPoints} points</span>
          {schoolSettings.teacherName && (
            <>
              <span>|</span>
              <span>Prof: {schoolSettings.teacherName}</span>
            </>
          )}
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-12">
        {exercises.map((ex, i) => (
          <div key={ex.id} className="no-break">
            <div className="flex items-end gap-3 mb-4">
              <h3 className={cn("text-2xl font-bold", isModern ? "text-blue-700" : isFormal ? "text-black" : "text-emerald-800")}>
                Exercice {isFormal ? `${i + 1}.` : i + 1}
              </h3>
              <span className={cn("text-sm font-medium pb-1", isModern ? "text-gray-500" : "text-gray-600")}>
                ({ex.points} points)
              </span>
            </div>
            
            <div 
              className={cn("text-base leading-relaxed mb-4", isFormal ? "text-black" : "text-gray-800")}
              dangerouslySetInnerHTML={{ __html: renderContent(ex.statement) }}
            />

            {ex.subQuestions && ex.subQuestions.length > 0 && (
              <div className="pl-6 space-y-4 mt-4">
                {ex.subQuestions.map((sq, sqIdx) => (
                  <div key={sqIdx} className="flex gap-3">
                    <span className="font-bold flex-shrink-0">{sq.label}</span>
                    <div className="flex-1">
                      <div 
                        className="inline-block"
                        dangerouslySetInnerHTML={{ __html: renderContent(sq.statement) }}
                      />
                      <span className="ml-2 text-sm text-gray-500">({sq.points} pts)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Answer Key / Corrigé */}
      <div className="page-break mt-12 pt-12">
        <h1 className={cn("text-3xl font-bold text-center mb-10", isModern ? "text-gray-900" : "text-black")}>
          CORRIGÉ
        </h1>

        <div className="space-y-12">
          {exercises.map((ex, i) => (
            <div key={ex.id} className="no-break">
              <h3 className={cn("text-xl font-bold mb-4", isModern ? "text-blue-700" : isFormal ? "text-black" : "text-emerald-800")}>
                Exercice {isFormal ? `${i + 1}.` : i + 1}
              </h3>
              
              <div className="mb-4">
                <span className="font-bold">Réponse: </span>
                <span dangerouslySetInnerHTML={{ __html: renderContent(ex.solution.finalAnswer) }} />
              </div>

              {ex.solution.bareme && ex.solution.bareme.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">Barème de correction</h4>
                  <table className="w-full border-collapse border border-gray-300 text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left w-20">Question</th>
                        <th className="border border-gray-300 p-2 text-left w-16">Points</th>
                        <th className="border border-gray-300 p-2 text-left">Critère</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ex.solution.bareme.map((b, bIdx) => (
                        <tr key={bIdx}>
                          <td className="border border-gray-300 p-2 font-bold">{b.label}</td>
                          <td className="border border-gray-300 p-2">{b.points}</td>
                          <td className="border border-gray-300 p-2" dangerouslySetInnerHTML={{ __html: renderContent(b.criterion) }} />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="pl-4 border-l-2 border-gray-300 mb-6">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Méthodologie</p>
                <div 
                  className="text-sm text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderContent(ex.solution.methodology) }}
                />
              </div>

              {ex.solution.microBareme && ex.solution.microBareme.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">Micro-barème détaillé</h4>
                  <table className="w-full border-collapse border border-gray-300 text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left w-24">Étape</th>
                        <th className="border border-gray-300 p-2 text-left w-12">Pts</th>
                        <th className="border border-gray-300 p-2 text-left">Critère observable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ex.solution.microBareme.map((mb, mIdx) => (
                        <tr key={mIdx}>
                          <td className="border border-gray-300 p-2 font-medium">{mb.step}</td>
                          <td className="border border-gray-300 p-2">{mb.points}</td>
                          <td className="border border-gray-300 p-2" dangerouslySetInnerHTML={{ __html: renderContent(mb.criterion) }} />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
