"use client";
import { DOCUMENT_LAYOUT } from "@/lib/documentLayout";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useRouter } from "next/navigation";
import { SUBJECT_LABELS } from "@/lib/utils";
import { getSchoolSettings } from "@/lib/storage";
import type { ExamContext, Exercise } from "@/types/exam";
import { renderContent } from "@/lib/renderContent";
import { MathPlot } from "@/components/ui/MathPlot";
import "katex/dist/katex.min.css";

export default function PrintPage() {
  const router = useRouter();
  const [context, setContext] = useState<ExamContext | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [schoolSettings, setSchoolSettings] = useState<{ schoolName?: string; teacherName?: string; schoolLogo?: string; className?: string; date?: string }>({});
  const printRootRef = useRef<HTMLDivElement>(null);

  // Mounts the real `MathPlot` (function-plot/D3, client-only) component into
  // every `<div data-mathplot="...">` placeholder renderContent() emits for
  // an inline `[PLOT: equation]` tag — same mechanism ExerciseCard.tsx
  // already uses (dangerouslySetInnerHTML only produces a static HTML
  // string, so the interactive plot can't be part of that string; instead
  // each placeholder gets its own React root portaled in here). Scoped to
  // the whole print root rather than per-exercise since this page has no
  // per-exercise component boundary — a `[PLOT:]` tag in either the main
  // exercise statement or the corrigé would be caught by one scan (BUG-051).
  useEffect(() => {
    const container = printRootRef.current;
    if (!container) return;
    const mounts = container.querySelectorAll<HTMLDivElement>("[data-mathplot]");
    const roots: Root[] = [];
    mounts.forEach((el) => {
      const equation = el.getAttribute("data-mathplot") ?? "";
      const root = createRoot(el);
      root.render(<MathPlot equation={equation} />);
      roots.push(root);
    });
    return () => {
      roots.forEach((root) => root.unmount());
    };
  }, [exercises]);

  // Memoized per-exercise so a `[PLOT:]` mount point's DOM subtree is only
  // rebuilt when that exercise's own statement text actually changes — not
  // on every unrelated re-render of this page (e.g. `schoolSettings`
  // loading after the exercises are already set). Without this, a statement
  // that also contains a [IMAGE:]/[GRAPH:]/[VISUAL:] tag (which embeds a
  // fresh random seed on every renderContent() call) would produce a
  // different HTML string on re-render, replacing the subtree via a raw
  // `element.innerHTML =` write and silently orphaning any MathPlot root
  // mounted below it — same mechanism already fixed in ExerciseCard.tsx,
  // extended here to this page's own statement/sub-question rendering
  // (BUG-051's addendum).
  const statementHtmlById = useMemo(() => {
    const map = new Map<string, string>();
    for (const ex of exercises) map.set(ex.id, renderContent(ex.statement));
    return map;
  }, [exercises.map((ex) => `${ex.id}:${ex.statement}`).join("\u0000")]);

  const subQuestionHtmlByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const ex of exercises) {
      (ex.subQuestions ?? []).forEach((sq, sqIdx) => {
        map.set(`${ex.id}:${sqIdx}`, renderContent(sq.statement));
      });
    }
    return map;
  }, [exercises.map((ex) => (ex.subQuestions ?? []).map((sq) => sq.statement).join(",")).join("\u0000")]);

  useEffect(() => {
    const ctxRaw = sessionStorage.getItem("imtihan_context");
    // /create/export can open this page with ?variant=b to print the real,
    // AI-generated Version B (src/app/api/generate/version-b) instead of the
    // default Version A — falls back to Version A if no Version B was ever
    // generated in this session (e.g. a stale/shared link). Read directly
    // from window.location instead of next/navigation's useSearchParams()
    // so this page doesn't need a Suspense boundary just for one query flag.
    const wantsVersionB = new URLSearchParams(window.location.search).get("variant") === "b";
    const versionBRaw = wantsVersionB ? sessionStorage.getItem("imtihan_versionb_exercises") : null;
    const exRaw = versionBRaw ?? sessionStorage.getItem("imtihan_exercises");
    if (wantsVersionB && !versionBRaw) {
      console.warn("[/print] ?variant=b requested but no cached Version B found — falling back to Version A.");
    }
    if (!ctxRaw || !exRaw) {
      router.replace("/create");
      return;
    }
    try {
      setContext(JSON.parse(ctxRaw));
      setExercises(JSON.parse(exRaw));
      const rawSettings = sessionStorage.getItem("imtihan_print_settings");
      const settings = rawSettings ? JSON.parse(rawSettings) : null;
      setSchoolSettings(settings?.header ?? getSchoolSettings() ?? {});
      setIncludeAnswerKey(settings?.includeAnswerKey !== false);

      const printTimer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(printTimer);
    } catch {
      router.replace("/create");
    }
  }, [router]);

  if (!context) return null;

  const isArabic = context.language === "arabic";
  const lang = isArabic ? "ar" : context.language === "french" ? "fr" : "en";
  const subjectName = SUBJECT_LABELS[context.subject]?.[lang] ?? context.subject;

  const durationWord = lang === "ar" ? "المدة" : lang === "en" ? "Duration" : "Durée";
  const totalWord = lang === "ar" ? "المجموع" : "Total";
  const pointsWord = lang === "ar" ? "نقاط" : "points";
  const professorWord = lang === "ar" ? "الأستاذ" : lang === "en" ? "Teacher" : "Prof";
  const exerciseWord = lang === "ar" ? "تمرين" : lang === "en" ? "Exercise" : "Exercice";
  const corrigWord = lang === "ar" ? "الإجابة النموذجية" : lang === "en" ? "ANSWER KEY" : "CORRIGÉ";
  const responseWord = lang === "ar" ? "الإجابة" : lang === "en" ? "Answer" : "Réponse";
  const baremeWord = lang === "ar" ? "سلم التصحيح" : lang === "en" ? "Mark scheme" : "Barème de correction";
  const methodologyWord = lang === "ar" ? "منهجية الحل" : lang === "en" ? "Methodology" : "Méthodologie";
  const microWord = lang === "ar" ? "سلم تنقيط تفصيلي" : lang === "en" ? "Detailed mark scheme" : "Micro-barème";
  const stepLabel = lang === "ar" ? "الخطوة" : lang === "en" ? "Step" : "Étape";
  const noteWord = lang === "ar" ? "العلامة" : lang === "en" ? "Score" : "Note";
  const maxWord = lang === "ar" ? "الأقصى" : "Max";

  const primaryColor = `#${DOCUMENT_LAYOUT.accent}`;
  const borderColor = primaryColor;
  const fontFamily = `${DOCUMENT_LAYOUT.bodyFont}, serif`;

  return (
    <div
      ref={printRootRef}
      dir={isArabic ? "rtl" : "ltr"}
      className="exam-document bg-white text-black min-h-screen p-4 sm:p-8 mx-auto max-w-[210mm]"
      style={{ fontFamily, "--text": `#${DOCUMENT_LAYOUT.ink}`, "--text-secondary": `#${DOCUMENT_LAYOUT.muted}`, "--text-tertiary": "#66746C", "--surface": "#ffffff", "--bg": "#ffffff", "--bg-subtle": `#${DOCUMENT_LAYOUT.soft}`, "--border": `#${DOCUMENT_LAYOUT.rule}`, "--accent": primaryColor, "--accent-light": `#${DOCUMENT_LAYOUT.soft}` } as CSSProperties}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 18mm; size: A4; }
          .exam-document { padding: 0 !important; max-width: none !important; }
          h1, h2, h3 { break-after: avoid; }
          p { orphans: 3; widows: 3; }
          tr { break-inside: avoid; }
          thead { display: table-header-group; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { page-break-before: always; }
          .no-break { page-break-inside: avoid; }
          header, footer, nav, button { display: none !important; }
        }
        .exam-document { font-size: 11pt; line-height: 1.45; }
        .exam-document h1, .exam-document h2, .exam-document h3 { font-family: Arial, sans-serif; }
        table.score-table { width: 100%; border-collapse: collapse; margin: 12px 0 24px 0; font-size: 11px; }
        table.score-table th, table.score-table td { border: 1px solid #d1d5db; padding: 6px 10px; text-align: center; }
        table.score-table th { background: #effaf4; font-weight: 700; }
        table.score-table .bg-subtle { background: #f3f0e8; }
        /* Plain, unshaded, bold-header, full-grid layout — matches a real
           official Bac Libanais answer key ("معايير الاجابة") table exactly,
           verified against an actual exam's barème .docx: no header fill,
           just bold text and single-line borders. Column order (label /
           criterion / points, ~8%/85%/7%) mirrors correctly under the
           page's own dir="rtl" wrapper — no extra logic needed here, unlike
           the Word export where visuallyRightToLeft must be set explicitly. */
        table.bareme-table { width: 100%; border-collapse: collapse; margin: 8px 0 16px 0; font-size: 11px; }
        table.bareme-table th { padding: 5px 8px; text-align: center; background: #fff; font-weight: 700; border: 1px solid #d1d5db; }
        table.bareme-table td { padding: 5px 8px; border: 1px solid #d1d5db; vertical-align: top; text-align: center; }
        table.bareme-table th.crit, table.bareme-table td.crit { text-align: start; }
        table.bareme-table td.pts { text-align: center; font-weight: 700; }
        table.bareme-table td.label { font-weight: 700; }
        .step-badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; color: white; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
      `}} />

      {/* ── HEADER ── */}
      <div className="text-center mb-6" style={{ borderBottom: `2px solid ${borderColor}`, paddingBottom: 14 }}>
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
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-gray-600">
          {schoolSettings.className && <span>{lang === "ar" ? "الصف" : lang === "fr" ? "Classe" : "Class"}: {schoolSettings.className}</span>}
          {schoolSettings.date && <span>{lang === "ar" ? "التاريخ" : "Date"}: {schoolSettings.date}</span>}
          {schoolSettings.teacherName && <span>{professorWord}: {schoolSettings.teacherName}</span>}
          {schoolSettings.teacherName && <span>|</span>}
          <span>{durationWord}: {context.duration} min</span>
          <span>|</span>
          <span>{totalWord}: {context.totalPoints} {pointsWord}</span>
        </div>
      </div>

      <p className="mb-4 text-xs text-gray-600">{lang === "ar" ? "الاسم" : lang === "fr" ? "Nom et prénom" : "Student name"}: ________________________________________</p>
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
          <div key={ex.id} className="exam-exercise">
            <h2 className="text-base font-bold mb-2" style={{ color: primaryColor }}>
              {exerciseWord} {ex.number} <span className="text-xs font-normal" style={{ color: "#5c5c5c" }}>({ex.points} {pointsWord})</span>
            </h2>

            {/* Legacy mathPlots array — rendered as plain JSX (not through
                dangerouslySetInnerHTML), same as ExerciseCard.tsx's own
                fixed-block rendering, so no portal/mounting trick is needed
                here: MathPlot can just be a normal React child. */}
            {ex.mathPlots && ex.mathPlots.length > 0 && (
              <div className="space-y-4 mb-3">
                {ex.mathPlots.map((plot, pIdx) => (
                  <MathPlot key={pIdx} equation={plot} />
                ))}
              </div>
            )}

            <div
              className="text-sm leading-relaxed mb-3"
              dangerouslySetInnerHTML={{ __html: statementHtmlById.get(ex.id) ?? "" }}
            />

            {ex.type === "multiple_choice" && ex.options?.length ? (
              <div className="mb-4 space-y-2">
                {ex.options.map(option => <div key={option.label} className="flex gap-3 text-sm"><span className="font-bold">{option.label}.</span><div dangerouslySetInnerHTML={{ __html: renderContent(option.text) }} /></div>)}
              </div>
            ) : null}

            {ex.subQuestions && ex.subQuestions.length > 0 && (
              <div className="ml-8 space-y-2 mb-3">
                {ex.subQuestions.map((sq, sqIdx) => (
                  <div key={sqIdx} className="flex gap-2 text-sm">
                    <span className="font-semibold flex-shrink-0" style={{ color: primaryColor }}>{sq.label}</span>
                    <span dangerouslySetInnerHTML={{ __html: subQuestionHtmlByKey.get(`${ex.id}:${sqIdx}`) ?? "" }} />
                    <span className="text-xs text-gray-400 flex-shrink-0">({sq.points} pts)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── CORRIGÉ ── */}
      {/* No extra margin/padding here beyond the heading's own spacing —
          `.page-break` already forces this onto a fresh page, so a
          margin-top has nothing above it to separate from, and stacking
          mt-8 + pt-8 on top of the print stylesheet's own `@page { margin:
          20mm }` compounded into a large, empty gap above "CORRIGÉ" on
          every exported PDF (see BUGS.md's Word/PDF export whitespace
          investigation — the same redundant-spacer pattern found and fixed
          in the Word export route). */}
      {includeAnswerKey && <div className="page-break">
        <h1 className="text-2xl font-bold text-center mb-8" style={{ color: primaryColor }}>
          {corrigWord}
        </h1>

        {exercises.map((ex, i) => (
          <div key={ex.id} className="exam-exercise mb-8">
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
                      <th style={{ width: "8%" }}>{lang === "ar" ? "السؤال" : "Question"}</th>
                      <th className="crit" style={{ width: "85%" }}>{lang === "ar" ? "معيار التصحيح" : "Critère"}</th>
                      <th style={{ width: "7%" }}>{lang === "ar" ? "العلامة" : "Points"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ex.solution.bareme.map((b, bIdx) => (
                      <tr key={bIdx}>
                        <td className="label" style={{ width: "8%" }}>{b.label}</td>
                        <td className="crit" style={{ width: "85%" }} dangerouslySetInnerHTML={{ __html: renderContent(b.criterion) }} />
                        <td className="pts" style={{ width: "7%" }}>{b.points}</td>
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
                      <th style={{ width: "8%" }}>{stepLabel}</th>
                      <th className="crit" style={{ width: "85%" }}>{lang === "ar" ? "المعيار الملاحظ" : "Critère observable"}</th>
                      <th style={{ width: "7%" }}>{lang === "ar" ? "العلامة" : "Pts"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ex.solution.microBareme.map((mb, mIdx) => (
                      <tr key={mIdx}>
                        <td className="label" style={{ width: "8%" }}>{mb.step}</td>
                        <td className="crit" style={{ width: "85%" }} dangerouslySetInnerHTML={{ __html: renderContent(mb.criterion) }} />
                        <td className="pts" style={{ width: "7%" }}>{mb.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>}
    </div>
  );
}
