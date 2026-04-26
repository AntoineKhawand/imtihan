"use client";

import { useState } from "react";
import { X, Plus, Trash2, Save, Eye, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/types/exam";
import { renderContent } from "@/lib/renderContent";
import { useEffect, useRef } from "react";

interface ExerciseEditorProps {
  exercise: Exercise;
  onSave: (updated: Exercise) => void;
  onClose: () => void;
}

export function ExerciseEditor({ exercise, onSave, onClose }: ExerciseEditorProps) {
  const [statement, setStatement] = useState(exercise.statement);
  const [points, setPoints] = useState(exercise.points);
  const [difficulty, setDifficulty] = useState(exercise.difficulty);
  const [subQuestions, setSubQuestions] = useState(
    exercise.subQuestions ? exercise.subQuestions.map((sq) => ({ ...sq })) : []
  );
  const [finalAnswer, setFinalAnswer] = useState(exercise.solution.finalAnswer);
  const [methodology, setMethodology] = useState(exercise.solution.methodology);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  
  const previewRef = useRef<HTMLDivElement>(null);

  function handleSave() {
    onSave({
      ...exercise,
      statement: statement.trim() || exercise.statement,
      points,
      difficulty,
      subQuestions: subQuestions.length > 0 ? subQuestions : undefined,
      solution: {
        ...exercise.solution,
        finalAnswer: finalAnswer.trim() || exercise.solution.finalAnswer,
        methodology: methodology.trim() || exercise.solution.methodology,
      },
    });
  }

  function addSubQuestion() {
    const labels = ["a)", "b)", "c)", "d)", "e)", "f)"];
    setSubQuestions((prev) => [
      ...prev,
      { label: labels[prev.length] ?? `${prev.length + 1}.`, statement: "", points: 1 },
    ]);
  }

  function updateSubQuestion(i: number, field: "label" | "statement" | "points", value: string | number) {
    setSubQuestions((prev) => prev.map((sq, idx) => idx === i ? { ...sq, [field]: value } : sq));
  }

  function removeSubQuestion(i: number) {
    setSubQuestions((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)] z-30">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-[var(--text)]">Edit exercise {exercise.number}</h2>
            <div className="flex p-1 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border)]">
              <button
                onClick={() => setViewMode("edit")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 text-xs rounded-md transition-all",
                  viewMode === "edit" ? "bg-white shadow-sm text-[var(--accent)] font-medium" : "text-[var(--text-tertiary)] hover:text-[var(--text)]"
                )}
              >
                <Edit3 size={12} /> Edit
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 text-xs rounded-md transition-all",
                  viewMode === "preview" ? "bg-white shadow-sm text-[var(--accent)] font-medium" : "text-[var(--text-tertiary)] hover:text-[var(--text)]"
                )}
              >
                <Eye size={12} /> Visual Preview
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {viewMode === "edit" ? (
            <>
              {/* Meta row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 text-uppercase tracking-wider">Difficulty</label>
                  <div className="flex gap-2">
                    {(["easy", "medium", "hard"] as const).map((d) => (
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

                {/* Points */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 text-uppercase tracking-wider">
                    Points <span className="text-[var(--text-tertiary)]">({points} pts)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={points}
                    onChange={(e) => setPoints(Math.max(1, Math.min(50, Number(e.target.value))))}
                    className="w-full h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>
              </div>

              {/* Statement */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 text-uppercase tracking-wider">
                  Exercise Statement
                </label>
                <textarea
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  rows={4}
                  placeholder="Enter the main question text here..."
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text)] leading-relaxed resize-y focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
                />
              </div>

              {/* Sub-questions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-[var(--text-secondary)] text-uppercase tracking-wider">Sub-questions</label>
                  <button
                    onClick={addSubQuestion}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:underline px-2 py-1 rounded-md hover:bg-[var(--accent)]/5"
                  >
                    <Plus size={14} /> Add Sub-question
                  </button>
                </div>
                {subQuestions.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-[var(--border)] rounded-xl">
                    <p className="text-xs text-[var(--text-tertiary)]">No sub-questions. Add one to break down the exercise.</p>
                  </div>
                )}
                <div className="space-y-4">
                  {subQuestions.map((sq, i) => (
                    <div key={i} className="flex gap-3 items-start p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] transition-shadow hover:shadow-sm">
                      <input
                        value={sq.label}
                        onChange={(e) => updateSubQuestion(i, "label", e.target.value)}
                        className="w-12 h-9 px-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-center text-[var(--accent)] font-bold focus:outline-none focus:border-[var(--accent)]"
                      />
                      <div className="flex-1 space-y-2">
                        <textarea
                          value={sq.statement}
                          onChange={(e) => updateSubQuestion(i, "statement", e.target.value)}
                          rows={2}
                          placeholder="Sub-question text..."
                          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] resize-none focus:outline-none focus:border-[var(--accent)]"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={sq.points}
                            onChange={(e) => updateSubQuestion(i, "points", Number(e.target.value))}
                            className="w-16 h-8 px-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-center focus:outline-none focus:border-[var(--accent)]"
                          />
                          <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">Points</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeSubQuestion(i)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solution */}
              <div className="border-t border-[var(--border)] pt-6 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                  <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Correction (Corrigé)</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">Final Answer</label>
                  <textarea
                    value={finalAnswer}
                    onChange={(e) => setFinalAnswer(e.target.value)}
                    rows={2}
                    placeholder="The short, final result..."
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">Methodology (Step-by-step)</label>
                  <textarea
                    value={methodology}
                    onChange={(e) => setMethodology(e.target.value)}
                    rows={6}
                    placeholder="Explain the solution steps..."
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text)] leading-relaxed focus:outline-none focus:border-[var(--accent)] transition-all"
                  />
                </div>
              </div>
            </>
          ) : (
            /* PREVIEW MODE */
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                   <h3 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Statement</h3>
                   <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-bold">{points} PTS</span>
                </div>
                <div className="prose-clean" dangerouslySetInnerHTML={{ __html: renderContent(statement) }} />
                
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
                 <h3 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Correction</h3>
                 
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
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--border-strong)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            <Save size={13} />
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
