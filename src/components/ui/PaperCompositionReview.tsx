"use client";
import { Select } from "@/components/ui/WorkflowSelect";
import { compatiblePaperProfiles, PAPER_PROFILES } from "@/data/paperProfiles";
import { applyPaper, paperContextIssues } from "@/lib/paperComposition";
import { type PaperComposition } from "@/lib/schemas/sourceDocument";
import { useEffect, useState } from "react";
import { UPLOAD_PURPOSES } from "@/lib/sourceDocument";
import type { ExamContext } from "@/types/exam";

function MarksInput({ marks, onChange }: { marks: number[]; onChange: (marks: number[]) => void }) {
  const [draft, setDraft] = useState(marks.join(","));
  const [focused, setFocused] = useState(false);
  const serialized = marks.join(",");
  useEffect(() => { if (!focused) setDraft(serialized); }, [serialized, focused]);
  return <input className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] p-2" value={draft} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onChange={e => {
    setDraft(e.target.value);
    onChange(e.target.value.split(",").map(value => value.trim() ? Number(value) : 0));
  }} />;
}

export function PaperCompositionReview({ context, onChange }: { context: ExamContext; onChange: (context: ExamContext) => void }) {
  const paper = context.paperComposition, source = context.sourceDocument;
  const profiles = compatiblePaperProfiles(context);
  const reference = PAPER_PROFILES.find(p => p.id === paper?.profileId);
  const sourcePaper = source?.structure;
  function edit(next: PaperComposition) { onChange(applyPaper(context, { ...next, origin: next.origin === "profile" ? "custom" : next.origin })); }
  function select(id: string) {
    if (id === "classroom") { onChange({ ...context, paperComposition: undefined, pointsPerExercise: undefined, paperCompositionReviewed: true }); return; }
    if (id === "uploaded" && sourcePaper?.sections.length) {
      onChange(applyPaper(context, { origin: "uploaded", title: sourcePaper.title, instructions: sourcePaper.instructions, sections: sourcePaper.sections, footerText: source?.intent.purposes.includes("branding") ? sourcePaper.footerText : "", answerSpaceLines: 0 })); return;
    }
    const profile = profiles.find(p => p.id === id);
    if (profile) { onChange({ ...applyPaper(context, structuredClone(profile.composition)), duration: profile.duration }); return; }
    if (id === "custom") {
      const count = Math.max(1, Math.min(20, context.exerciseCount));
      const marks = context.pointsPerExercise?.length === count ? context.pointsPerExercise : Array.from({ length: count }, (_, i) => Math.floor(context.totalPoints / count) + (i < context.totalPoints % count ? 1 : 0));
      onChange(applyPaper(context, { origin: "custom", title: "", instructions: [], sections: [{ title: "Questions", marks, answerCount: count, instructions: "" }], footerText: "", answerSpaceLines: 0 }));
    }
  }
  const errors = paperContextIssues(context);
  const invalidProfile = reference && !profiles.some(p => p.id === reference.id);
  return <section data-guide="template" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-4">
    <h3 className="text-sm font-semibold text-[var(--text)]">Document use and paper composition</h3>
    {source && <div className="rounded-xl bg-[var(--bg-subtle)] p-3 space-y-2 text-xs">
      <p className="font-semibold break-words">Source: {source.name}</p>
      <p>Use for: {source.intent.purposes.map(id => UPLOAD_PURPOSES.find(p => p.id === id)?.label).join(", ")}.</p>
      {source.intent.instructions && <p className="whitespace-pre-wrap">Instructions: {source.intent.instructions}</p>}
      {sourcePaper?.uncertainties.map((note, i) => <p key={i} className="text-[var(--warning)]">Review: {note}</p>)}
      {source.intent.purposes.includes("structure") && !sourcePaper?.sections.length && <p role="alert" className="text-[var(--warning)]">The document structure could not be extracted reliably. Define sections below or use classroom mode.</p>}
      {source.intent.purposes.includes("branding") && <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(["schoolName", "className", "teacherName", "date"] as const).map(key => <label key={key} className="block">{{ schoolName: "School", className: "Class", teacherName: "Teacher", date: "Date" }[key]}
          <input className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2" value={sourcePaper?.header?.[key] ?? ""} maxLength={key === "date" ? 100 : 250} onChange={e => onChange({ ...context, sourceDocument: { ...source, structure: { title: "", instructions: [], sections: [], footerText: "", uncertainties: [], ...sourcePaper, header: { ...sourcePaper?.header, [key]: e.target.value } } } })} />
        </label>)}
        <label className="block sm:col-span-2">Source footer text<input className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2" value={sourcePaper?.footerText ?? ""} maxLength={250} onChange={e => onChange({ ...context, sourceDocument: { ...source, structure: { title: "", instructions: [], sections: [], uncertainties: [], ...sourcePaper, footerText: e.target.value } } })} /></label>
      </div>}
      <div className="flex gap-4"><a href="/create" className="underline text-[var(--accent)]">Change document use</a><button type="button" className="underline" onClick={() => onChange({ ...context, sourceDocument: undefined, paperComposition: paper?.origin === "uploaded" ? undefined : paper })}>Remove document reference</button></div>
    </div>}
    <Select label="Paper type" value={!paper ? "classroom" : paper.origin === "uploaded" ? "uploaded" : paper.origin === "custom" ? "custom" : paper.profileId}
      onChange={event => select(event.target.value)} options={[
        { value: "classroom", label: "Classroom exam / quiz — flexible composition" },
        ...profiles.map(profile => ({ value: profile.id, label: profile.label })),
        ...(source?.intent.purposes.includes("structure") && !!sourcePaper?.sections.length ? [{ value: "uploaded", label: "Use the uploaded paper structure" }] : []),
        { value: "custom", label: "Teacher-defined sections and choices" },
        ...(invalidProfile && paper?.profileId ? [{ value: paper.profileId, label: "Incompatible previous profile — change paper type" }] : []),
      ]} />
    {!profiles.length && <p className="text-xs text-[var(--text-secondary)]">No verified official reference is registered for this subject and level yet. Use classroom mode, define your sections, or upload the relevant paper.</p>}
    {reference && <div className="text-xs space-y-1"><a href={reference.sourceUrl} target="_blank" rel="noreferrer" className="underline text-[var(--accent)]">{reference.reference}</a><p>{reference.scope}</p><p>Reference checked {reference.verifiedOn}. {paper?.origin === "custom" ? "You have adapted this reference." : "Practice composition based on this reference."}</p></div>}
    {invalidProfile && <p role="alert" className="text-xs text-[var(--danger)]">This reference does not match the selected curriculum, subject or level. Choose another paper type.</p>}
    {paper && <>
      <label className="block text-xs">Paper title<input className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] p-2" value={paper.title} maxLength={250} onChange={e => edit({ ...paper, title: e.target.value })} /></label>
      <label className="block text-xs">Candidate instructions (one per line, in the exam language)<textarea className="mt-1 w-full min-h-20 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-2" value={paper.instructions.join("\n")} onChange={e => edit({ ...paper, instructions: e.target.value.split("\n").slice(0, 15) })} /></label>
      {paper.sections.map((section, i) => <fieldset key={i} className="rounded-xl border border-[var(--border)] p-3 space-y-2">
        <legend className="px-1 text-xs font-semibold">Section {i + 1}</legend>
        <label className="block text-xs">Heading<input className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] p-2" value={section.title} maxLength={160} onChange={e => edit({ ...paper, sections: paper.sections.map((s, j) => j === i ? { ...s, title: e.target.value } : s) })} /></label>
        <label className="block text-xs">Marks for offered questions (comma-separated)<MarksInput marks={section.marks} onChange={marks => edit({ ...paper, sections: paper.sections.map((s, j) => j === i ? { ...s, marks } : s) })} /></label>
        <label className="block text-xs">Questions the student must answer<input type="number" min={1} max={section.marks.length} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] p-2" value={section.answerCount} onChange={e => edit({ ...paper, sections: paper.sections.map((s, j) => j === i ? { ...s, answerCount: Number(e.target.value) } : s) })} /></label>
        <label className="block text-xs">Question types / section instructions<textarea className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] p-2" value={section.instructions} maxLength={1000} onChange={e => edit({ ...paper, sections: paper.sections.map((s, j) => j === i ? { ...s, instructions: e.target.value } : s) })} /></label>
        {paper.sections.length > 1 && <button type="button" className="text-xs underline" onClick={() => edit({ ...paper, sections: paper.sections.filter((_, j) => j !== i) })}>Remove section</button>}
      </fieldset>)}
      {paper.sections.length < 10 && <button type="button" className="text-xs underline text-[var(--accent)]" onClick={() => edit({ ...paper, sections: [...paper.sections, { title: `Section ${paper.sections.length + 1}`, marks: [5], answerCount: 1, instructions: "" }] })}>Add section</button>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><label className="block text-xs">Footer text<input className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] p-2" value={paper.footerText} maxLength={250} onChange={e => edit({ ...paper, footerText: e.target.value })} /></label><label className="block text-xs">Answer lines after each question<input type="number" min={0} max={12} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] p-2" value={paper.answerSpaceLines} onChange={e => edit({ ...paper, answerSpaceLines: Number(e.target.value) })} /></label></div>
      <p className="text-xs font-medium">{context.exerciseCount} offered questions · maximum candidate mark {context.totalPoints}. Section settings control the marks and count above.</p>
      {errors.map((error, i) => <p key={i} role="alert" className="text-xs text-[var(--danger)]">{error}</p>)}
    </>}
    <p className="text-xs leading-relaxed text-[var(--text-secondary)]">One Imtihan design with the reviewed academic structure, candidate instructions and a separate tabular corrigé. Review translated instructions yourself. Logos can be added at export; uploaded page geometry and embedded logos are not copied automatically.</p>
  </section>;
}
