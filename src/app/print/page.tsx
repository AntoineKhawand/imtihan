"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SUBJECT_LABELS } from "@/lib/utils";
import { getSchoolSettings } from "@/lib/storage";
import type { ExamContext, Exercise } from "@/types/exam";
import { renderContent } from "@/lib/renderContent";
import "katex/dist/katex.min.css";

export default function PrintPage() {
  const router = useRouter();
  const [context, setContext] = useState<ExamContext | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templateId, setTemplateId] = useState("classic");
  const [schoolSettings, setSchoolSettings] = useState<{ schoolName?: string; teacherName?: string; schoolLogo?: string }>({});

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
  const subjectName = SUBJECT_LABELS[context.subject]?.[lang === "ar" ? "fr" : lang] ?? context.subject;

  const durationWord = lang === "ar" ? "المدة" : "Durée";
  const totalWord = lang === "ar" ? "المجموع" : "Total";
  const pointsWord = lang === "ar" ? "نقاط" : "points";
  const professorWord = lang === "ar" ? "الأستاذ" : "Prof";
  const exerciseWord = lang === "ar" ? "تمرين" : "Exercice";
  const corrigWord = lang === "ar" ? "الإجابة النموذجية" : "CORRIGÉ";
  const responseWord = lang === "ar" ? "الإجابة" : "Réponse";
  const baremeWord = lang === "ar" ? "سلم التصحيح" : "Barème de correction";
  const methodologyWord = lang === "ar" ? "منهجية الحل" : "Méthodologie";
  const microWord = lang === "ar" ? "سلم تنقيط تفصيلي" : "Micro-barème";
  const stepLabel = lang === "ar" ? "الخطوة" : "Étape";
  const noteWord = lang === "ar" ? "العلامة" : "Note";
  const maxWord = lang === "ar" ? "الأقصى" : "Max";

  const isModern = templateId === "modern";
  const isFormal = templateId === "formal";

  const primaryColor = isFormal ? "#000000" : "#1a5e3f";
  const borderColor = isFormal ? "#000000" : isModern ? "#2563eb" : "#1a5e3f";
  const fontFamily = isFormal ? "Times New Roman, serif" : isModern ? "Arial, sans-serif" : "Georgia, serif";

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="bg-white text-black min-h-screen p-8 mx-auto max-w-[210mm]"
      style={{ fontFamily }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 20mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { page-break-before: always; }
          .no-break { page-break-inside: avoid; }
          header, footer, nav, button { display: none !important; }
        }
        table.score-table { width: 100%; border-collapse: collapse; margin: 12px 0 24px 0; font-size: 11px; }
        table.score-table th, table.score-table td { border: 1px solid #d1d5db; padding: 6px 10px; text-align: center; }
        table.score-table th { background: #effaf4; font-weight: 700; }
        table.score-table .bg-subtle { background: #f3f0e8; }
        table.bareme-table { width: 100%; border-collapse: collapse; margin: 8px 0 16px 0; font-size: 11px; }
        table.bareme-table th { padding: 5px 8px; text-align: left; background: #f3f0e8; font-weight: 700; border: 1px solid #d1d5db; }
        table.bareme-table td { padding: 5px 8px; border: 1px solid #d1d5db; vertical-align: top; }
        table.bareme-table td.pts { text-align: center; font-weight: 700; }
        .step-badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; color: white; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
      `}} />

      {/* ── HEADER ── */}
      <div className="text-center mb-6" style={isFormal ? { borderBottom: "3px double black", paddingBottom: 20 } : { borderBottom: `2px solid ${borderColor}`, paddingBottom: 14 }}>
        {schoolSettings.schoolLogo && (
          <img
            src={schoolSettings.schoolLogo}
            alt="School logo"
            className="mx-auto mb-2"
            style={{ width: 70, height: 70, objectFit: "contain" }}
          />
        )}
        {schoolSettings.schoolName && (
          <h2 className="text-lg font-bold mb-1" style={{ color: primaryColor }}>
            {schoolSettings.schoolName}
          </h2>
        )}
        <h1 className="text-2xl font-bold mb-1">
          {subjectName} — {context.levelId}
        </h1>
        <div className="flex justify-center items-center gap-3 text-xs text-gray-600">
          {schoolSettings.teacherName && <span>{professorWord}: {schoolSettings.teacherName}</span>}
          {schoolSettings.teacherName && <span>|</span>}
          <span>{durationWord}: {context.duration} min</span>
          <span>|</span>
          <span>{totalWord}: {context.totalPoints} {pointsWord}</span>
        </div>
      </div>

      {/* ── SCORE SUMMARY TABLE (matching Word export) ── */}
      <table className="score-table">
        <thead>
          <tr>
            <th style={{ width: "28%", textAlign: "left", background: "#effaf4" }}>{exerciseWord}</th>
            {exercises.map((ex) => (
              <th key={ex.id} style={{ width: `${56 / exercises.length}%`, textAlign: "center" }}>{ex.number}</th>
            ))}
            <th style={{ width: "16%", textAlign: "center", background: "#effaf4" }}>{totalWord}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="bg-subtle" style={{ fontWeight: 700, textAlign: "left" }}>{maxWord}</td>
            {exercises.map((ex) => (
              <td key={ex.id} style={{ fontWeight: 600 }}>{ex.points}</td>
            ))}
            <td className="bg-subtle" style={{ fontWeight: 700 }}>{context.totalPoints}</td>
          </tr>
          <tr>
            <td className="bg-subtle" style={{ fontWeight: 700, textAlign: "left" }}>{noteWord}</td>
            {exercises.map((ex) => (
              <td key={ex.id}></td>
            ))}
            <td className="bg-subtle"></td>
          </tr>
        </tbody>
      </table>

      {/* ── EXERCISES ── */}
      <div className="space-y-6">
        {exercises.map((ex, i) => (
          <div key={ex.id} className="no-break">
            <h2 className="text-base font-bold mb-2" style={{ color: primaryColor }}>
              {exerciseWord} {ex.number} <span className="text-xs font-normal" style={{ color: "#5c5c5c" }}>({ex.points} {pointsWord})</span>
            </h2>
            <div
              className="text-sm leading-relaxed mb-3"
              dangerouslySetInnerHTML={{ __html: renderContent(ex.statement) }}
            />

            {ex.subQuestions && ex.subQuestions.length > 0 && (
              <div className="ml-8 space-y-2 mb-3">
                {ex.subQuestions.map((sq, sqIdx) => (
                  <div key={sqIdx} className="flex gap-2 text-sm">
                    <span className="font-semibold flex-shrink-0" style={{ color: primaryColor }}>{sq.label}</span>
                    <span dangerouslySetInnerHTML={{ __html: renderContent(sq.statement) }} />
                    <span className="text-xs text-gray-400 flex-shrink-0">({sq.points} pts)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── CORRIGÉ ── */}
      <div className="page-break mt-8 pt-8">
        <h1 className="text-2xl font-bold text-center mb-8" style={{ color: primaryColor }}>
          {corrigWord}
        </h1>

        {exercises.map((ex, i) => (
          <div key={ex.id} className="no-break mb-8">
            <h2 className="text-base font-bold mb-4" style={{ color: primaryColor }}>
              {exerciseWord} {ex.number} — {corrigWord}
            </h2>

            {/* Barème table */}
            {ex.solution.bareme && ex.solution.bareme.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold mb-1" style={{ color: primaryColor }}>{baremeWord}</p>
                <table className="bareme-table">
                  <thead>
                    <tr>
                      <th style={{ width: "15%" }}>{lang === "ar" ? "السؤال" : "Question"}</th>
                      <th style={{ width: "10%", textAlign: "center" }}>{lang === "ar" ? "النقاط" : "Points"}</th>
                      <th style={{ width: "75%" }}>{lang === "ar" ? "معيار التصحيح" : "Critère"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ex.solution.bareme.map((b, bIdx) => (
                      <tr key={bIdx}>
                        <td style={{ fontWeight: 700, width: "15%" }}>{b.label}</td>
                        <td className="pts" style={{ width: "10%" }}>{b.points}</td>
                        <td style={{ width: "75%" }} dangerouslySetInnerHTML={{ __html: renderContent(b.criterion) }} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Final answer */}
            <div className="mb-4">
              <p className="text-xs font-bold mb-1" style={{ color: primaryColor }}>{responseWord}</p>
              <div className="text-sm font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: renderContent(ex.solution.finalAnswer) }} />
            </div>

            {/* Methodology */}
            <div className="mb-4">
              <p className="text-xs font-bold mb-1" style={{ color: primaryColor }}>{methodologyWord}</p>
              <div
                className="text-sm leading-relaxed space-y-1"
                dangerouslySetInnerHTML={{
                  __html: renderContent(
                    (ex.solution.methodology || "").replace(/(?<!^|[\n\r])((?:Étape|Step|خطوة)\s*\d+(?:\s*[:：])?)/gi, "\n\n$1")
                  )
                }}
              />
            </div>

            {/* Micro-barème table */}
            {ex.solution.microBareme && ex.solution.microBareme.length > 0 && (
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: primaryColor }}>{microWord}</p>
                <table className="bareme-table">
                  <thead>
                    <tr>
                      <th style={{ width: "18%" }}>{stepLabel}</th>
                      <th style={{ width: "10%", textAlign: "center" }}>Pts</th>
                      <th style={{ width: "72%" }}>{lang === "ar" ? "المعيار الملاحظ" : "Critère observable"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ex.solution.microBareme.map((mb, mIdx) => (
                      <tr key={mIdx}>
                        <td style={{ fontWeight: 700, width: "18%" }}>{mb.step}</td>
                        <td className="pts" style={{ width: "10%" }}>{mb.points}</td>
                        <td style={{ width: "72%" }} dangerouslySetInnerHTML={{ __html: renderContent(mb.criterion) }} />
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
  );
}
