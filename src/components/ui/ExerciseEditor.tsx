"use client";

import { useState, useRef, useCallback } from "react";
import { Columns, Eye, Edit3, X, Plus, Trash2, Save, LineChart, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Exercise, McqOption } from "@/types/exam";
import { renderContent } from "@/lib/renderContent";
import { MathPlot } from "./MathPlot";

interface ExerciseEditorProps {
  exercise: Exercise;
  onSave: (updated: Exercise) => void;
  onClose: () => void;
}

// Click-to-edit field: renders KaTeX/rich content when idle, raw textarea when focused
function RichField({
  value,
  onChange,
  rows = 4,
  placeholder = "Click to edit...",
  mono = false,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  mono?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleClick = useCallback(() => {
    setFocused(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, []);

  const rendered = value
    ? renderContent(value)
    : `<span style="color:var(--text-tertiary);font-style:italic">${placeholder}</span>`;

  return (
    <div
      className={cn(
        "relative rounded-xl border transition-all group",
        focused
          ? "border-[var(--accent)] ring-1 ring-[var(--accent)]"
          : "border-[var(--border)] hover:border-[var(--border-strong)] cursor-text"
      )}
    >
      {focused ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={() => setFocused(false)}
          rows={rows}
          placeholder={placeholder}
          className={cn(
            "w-full px-4 py-3 bg-[var(--bg-subtle)] text-sm text-[var(--text)] leading-relaxed resize-y focus:outline-none rounded-xl",
            mono && "font-mono"
          )}
        />
      ) : (
        <div
          onClick={handleClick}
          className="px-4 py-3 bg-[var(--bg-subtle)] text-sm text-[var(--text)] leading-relaxed rounded-xl prose-clean overflow-hidden"
          style={{ minHeight: `${rows * 1.6 + 1.5}rem` }}
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
      )}
      {/* Edit hint — only shown when idle and non-empty */}
      {!focused && value && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/80 border border-[var(--border)] text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider shadow-sm">
            <Pencil size={8} /> edit
          </div>
        </div>
      )}
    </div>
  );
}

// Compact inline version for sub-question statements (no min-height)
function RichFieldInline({
  value,
  onChange,
  placeholder = "Sub-question text...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleClick = useCallback(() => {
    setFocused(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, []);

  const rendered = value
    ? renderContent(value)
    : `<span style="color:var(--text-tertiary);font-style:italic">${placeholder}</span>`;

  return (
    <div
      className={cn(
        "relative rounded-lg border transition-all group",
        focused
          ? "border-[var(--accent)] ring-1 ring-[var(--accent)]"
          : "border-[var(--border)] hover:border-[var(--border-strong)] cursor-text"
      )}
    >
      {focused ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={() => setFocused(false)}
          rows={2}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-[var(--surface)] text-sm text-[var(--text)] resize-none focus:outline-none rounded-lg"
        />
      ) : (
        <div
          onClick={handleClick}
          className="px-3 py-2 bg-[var(--surface)] text-sm text-[var(--text)] leading-relaxed rounded-lg prose-clean min-h-[2.75rem] overflow-hidden"
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
      )}
      {!focused && value && (
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-white/80 border border-[var(--border)] text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider shadow-sm">
            <Pencil size={7} /> edit
          </div>
        </div>
      )}
    </div>
  );
}

export function ExerciseEditor({ exercise, onSave, onClose }: ExerciseEditorProps) {
  const [statement, setStatement] = useState(exercise.statement);
  const [points, setPoints] = useState(exercise.points);
  const [difficulty, setDifficulty] = useState(exercise.difficulty);
  const [subQuestions, setSubQuestions] = useState(
    exercise.subQuestions ? exercise.subQuestions.map(sq => ({ ...sq })) : []
  );
  const [mathPlots, setMathPlots] = useState<string[]>(exercise.mathPlots || []);
  const [finalAnswer, setFinalAnswer] = useState(exercise.solution.finalAnswer);
  const [methodology, setMethodology] = useState(exercise.solution.methodology);
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("split");
  const [options, setOptions] = useState<McqOption[]>(exercise.options ?? []);

  const isMcq = exercise.type === "multiple_choice";

  function handleSave() {
    onSave({
      ...exercise,
      statement: statement.trim() || exercise.statement,
      points,
      difficulty,
      options: isMcq && options.length > 0 ? options : undefined,
      subQuestions: subQuestions.length > 0 ? subQuestions : undefined,
      mathPlots: mathPlots.length > 0 ? mathPlots : undefined,
      solution: {
        ...exercise.solution,
        finalAnswer: finalAnswer.trim() || exercise.solution.finalAnswer,
        methodology: methodology.trim() || exercise.solution.methodology,
      },
    });
  }

  function setCorrectOption(label: string) {
    setOptions(prev => prev.map(o => ({ ...o, isCorrect: o.label === label })));
  }

  function updateOptionText(label: string, text: string) {
    setOptions(prev => prev.map(o => o.label === label ? { ...o, text } : o));
  }

  function addSubQuestion() {
    const labels = ["a)", "b)", "c)", "d)", "e)", "f)"];
    setSubQuestions(prev => [
      ...prev,
      { label: labels[prev.length] ?? `${prev.length + 1}.`, statement: "", points: 1 },
    ]);
  }

  function updateSubQuestion(i: number, field: "label" | "statement" | "points", value: string | number) {
    setSubQuestions(prev => prev.map((sq, idx) => idx === i ? { ...sq, [field]: value } : sq));
  }

  function removeSubQuestion(i: number) {
    setSubQuestions(prev => prev.filter((_, idx) => idx !== i));
  }

  function addPlot() { setMathPlots(prev => [...prev, "x"]); }
  function updatePlot(idx: number, val: string) { setMathPlots(prev => prev.map((p, i) => i === idx ? val : p)); }
  function removePlot(idx: number) { setMathPlots(prev => prev.filter((_, i) => i !== idx)); }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={cn(
        "relative w-full max-h-[90vh] overflow-y-auto bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-2xl transition-all duration-300",
        viewMode === "split" ? "max-w-6xl" : "max-w-2xl"
      )}>
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)] z-40">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-[var(--text)]">Edit exercise {exercise.number}</h2>
            <div className="flex p-1 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border)]">
              {([
                { mode: "edit" as const, icon: <Edit3 size={12} />, label: "Edit" },
                { mode: "split" as const, icon: <Columns size={12} />, label: "Split" },
                { mode: "preview" as const, icon: <Eye size={12} />, label: "Visual Preview" },
              ]).map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 text-xs rounded-md transition-all",
                    viewMode === mode ? "bg-white shadow-sm text-[var(--accent)] font-medium" : "text-[var(--text-tertiary)] hover:text-[var(--text)]"
                  )}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className={cn("p-6", viewMode === "split" && "grid grid-cols-2 gap-8")}>
          {/* ── Edit Column ── */}
          {(viewMode === "edit" || viewMode === "split") && (
            <div className="space-y-6">
              {/* Meta row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Difficulty</label>
                  <div className="flex gap-2">
                    {(["easy", "medium", "hard"] as const).map(d => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={cn(
                          "flex-1 text-xs py-1.5 px-2 rounded-lg border capitalize transition-colors",
                          difficulty === d
                            ? d === "easy" ? "bg-emerald-50 border-emerald-400 text-emerald-700 font-medium"
                              : d === "medium" ? "bg-amber-50 border-amber-400 text-amber-700 font-medium"
                              : "bg-red-50 border-red-400 text-red-700 font-medium"
                            : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                    Points <span className="text-[var(--text-tertiary)]">({points} pts)</span>
                  </label>
                  <input
                    type="number" min={1} max={50} value={points}
                    onChange={e => setPoints(Math.max(1, Math.min(50, Number(e.target.value))))}
                    className="w-full h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>
              </div>

              {/* Math Plots */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Mathematical Graphs (SVG)</label>
                  <button onClick={addPlot} className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:underline px-2 py-1 rounded-md hover:bg-[var(--accent)]/5">
                    <Plus size={14} /> Add Plot
                  </button>
                </div>
                <div className="space-y-3">
                  {mathPlots.map((plot, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
                        <LineChart size={14} className="text-[var(--accent)]" />
                      </div>
                      <input
                        value={plot} onChange={e => updatePlot(i, e.target.value)}
                        placeholder="e.g. sin(x) or x^2"
                        className="flex-1 h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                      />
                      <button onClick={() => removePlot(i)} className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {mathPlots.length === 0 && (
                    <p className="text-[10px] text-[var(--text-tertiary)] italic">No graphs attached to this exercise.</p>
                  )}
                </div>
              </div>

              {/* Statement — rendered field */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Exercise Statement</label>
                <RichField
                  value={statement}
                  onChange={setStatement}
                  rows={viewMode === "split" ? 10 : 5}
                  placeholder="Enter the main question text here..."
                />
                <p className="mt-2 text-[10px] text-[var(--text-tertiary)] italic">Supports KaTeX ($x^2$), Mermaid charts, and AI image tags ([IMAGE: ...])</p>
              </div>

              {/* MCQ Options (edit) */}
              {isMcq && options.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
                    Answer Options — click a radio to change the correct answer
                  </label>
                  <div className="space-y-2">
                    {options.map(opt => (
                      <div key={opt.label} className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors",
                        opt.isCorrect
                          ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
                          : "border-[var(--border)] bg-[var(--bg-subtle)]"
                      )}>
                        <button
                          type="button"
                          onClick={() => setCorrectOption(opt.label)}
                          className={cn(
                            "flex-shrink-0 w-4 h-4 rounded-full border-2 transition-colors",
                            opt.isCorrect
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-[var(--border)] hover:border-emerald-400"
                          )}
                          title="Mark as correct"
                        />
                        <span className={cn(
                          "flex-shrink-0 w-5 text-xs font-bold",
                          opt.isCorrect ? "text-emerald-700" : "text-[var(--text-secondary)]"
                        )}>
                          {opt.label}
                        </span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={e => updateOptionText(opt.label, e.target.value)}
                          className="flex-1 bg-transparent text-sm text-[var(--text)] focus:outline-none placeholder:text-[var(--text-tertiary)]"
                          placeholder={`Option ${opt.label}…`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-[var(--text-tertiary)] italic">
                    Options support LaTeX ($…$). The filled circle marks the correct answer.
                  </p>
                </div>
              )}

              {/* Sub-questions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Sub-questions</label>
                  <button onClick={addSubQuestion} className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:underline px-2 py-1 rounded-md hover:bg-[var(--accent)]/5">
                    <Plus size={14} /> Add Sub-question
                  </button>
                </div>
                <div className="space-y-4">
                  {subQuestions.map((sq, i) => (
                    <div key={i} className="flex gap-3 items-start p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] transition-shadow hover:shadow-sm">
                      <input
                        value={sq.label}
                        onChange={e => updateSubQuestion(i, "label", e.target.value)}
                        className="w-12 h-9 px-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-center text-[var(--accent)] font-bold focus:outline-none focus:border-[var(--accent)] shrink-0"
                      />
                      <div className="flex-1 space-y-2 min-w-0">
                        <RichFieldInline
                          value={sq.statement}
                          onChange={v => updateSubQuestion(i, "statement", v)}
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="number" min={1} max={20} value={sq.points}
                            onChange={e => updateSubQuestion(i, "points", Number(e.target.value))}
                            className="w-16 h-8 px-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-center focus:outline-none focus:border-[var(--accent)]"
                          />
                          <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">Points</span>
                        </div>
                      </div>
                      <button onClick={() => removeSubQuestion(i)} className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Correction */}
              <div className="border-t border-[var(--border)] pt-6 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                  <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Correction (Corrigé)</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">Final Answer</label>
                  <RichField
                    value={finalAnswer}
                    onChange={setFinalAnswer}
                    rows={2}
                    placeholder="The short, final result..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">Methodology (Step-by-step)</label>
                  <RichField
                    value={methodology}
                    onChange={setMethodology}
                    rows={6}
                    placeholder="Explain the solution steps..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Preview Column ── */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div className={cn(
              "space-y-8 animate-in fade-in duration-300",
              viewMode === "split" && "sticky top-20 max-h-[calc(90vh-120px)] overflow-y-auto pr-2 custom-scrollbar"
            )}>
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                  <h3 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Live Visual Preview</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-bold uppercase tracking-wider">{difficulty} · {points} PTS</span>
                </div>

                {mathPlots.length > 0 && (
                  <div className="space-y-4">
                    {mathPlots.map((plot, i) => <MathPlot key={i} equation={plot} />)}
                  </div>
                )}

                <div className="prose-clean overflow-hidden" dangerouslySetInnerHTML={{ __html: renderContent(statement) }} />

                {/* MCQ Options (preview) */}
                {isMcq && options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {options.map(opt => (
                      <div
                        key={opt.label}
                        className={cn(
                          "flex items-start gap-2.5 px-3 py-2.5 rounded-xl border text-sm",
                          opt.isCorrect
                            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800"
                            : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                        )}
                      >
                        <span className={cn(
                          "flex-shrink-0 w-5 h-5 rounded-full border text-[11px] font-bold flex items-center justify-center mt-0.5",
                          opt.isCorrect
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-[var(--border)] text-[var(--text-secondary)]"
                        )}>
                          {opt.label}
                        </span>
                        <span
                          className="leading-relaxed flex-1"
                          dangerouslySetInnerHTML={{ __html: renderContent(opt.text) }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {subQuestions.length > 0 && (
                  <div className="mt-6 space-y-4 pl-4 border-l-2 border-[var(--border)]">
                    {subQuestions.map((sq, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-[var(--accent)]">{sq.label}</span>
                          <div className="text-sm flex-1" dangerouslySetInnerHTML={{ __html: renderContent(sq.statement) }} />
                          <span className="text-[10px] text-[var(--text-tertiary)] font-mono">[{sq.points} pts]</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-6 border-t border-[var(--border)]">
                <h3 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Correction Preview</h3>
                <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
                  <p className="text-[10px] font-bold text-[var(--accent)] uppercase mb-2">Final Result</p>
                  <div className="text-sm font-medium" dangerouslySetInnerHTML={{ __html: renderContent(finalAnswer) }} />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase mb-2">Detailed Steps</p>
                  <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: renderContent(methodology) }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border)] bg-[var(--surface)]">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--border-strong)] transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors">
            <Save size={13} /> Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
