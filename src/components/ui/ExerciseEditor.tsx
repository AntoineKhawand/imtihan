"use client";

import { useState } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/types/exam";

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
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)] z-10">
          <h2 className="font-semibold text-[var(--text)]">Edit exercise {exercise.number}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Meta row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Difficulty */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">Difficulty</label>
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
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
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
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
              Statement <span className="text-[var(--text-tertiary)]">(LaTeX: $x^2$, $$\frac&#123;a&#125;&#123;b&#125;$$)</span>
            </label>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text)] leading-relaxed resize-y focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          {/* Sub-questions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Sub-questions</label>
              <button
                onClick={addSubQuestion}
                className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
              >
                <Plus size={11} /> Add
              </button>
            </div>
            {subQuestions.length === 0 && (
              <p className="text-xs text-[var(--text-tertiary)] py-2">No sub-questions. Click Add to create one.</p>
            )}
            <div className="space-y-3">
              {subQuestions.map((sq, i) => (
                <div key={i} className="flex gap-2 items-start p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)]">
                  <input
                    value={sq.label}
                    onChange={(e) => updateSubQuestion(i, "label", e.target.value)}
                    className="w-10 h-8 px-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] text-xs text-center text-[var(--accent)] font-semibold focus:outline-none focus:border-[var(--accent)]"
                  />
                  <textarea
                    value={sq.statement}
                    onChange={(e) => updateSubQuestion(i, "statement", e.target.value)}
                    rows={2}
                    placeholder="Sub-question text…"
                    className="flex-1 px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] resize-none focus:outline-none focus:border-[var(--accent)]"
                  />
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={sq.points}
                    onChange={(e) => updateSubQuestion(i, "points", Number(e.target.value))}
                    className="w-14 h-8 px-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] text-xs text-center focus:outline-none focus:border-[var(--accent)]"
                  />
                  <span className="text-xs text-[var(--text-tertiary)] self-center flex-shrink-0">pts</span>
                  <button
                    onClick={() => removeSubQuestion(i)}
                    className="w-8 h-8 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors flex-shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Solution */}
          <div className="border-t border-[var(--border)] pt-5 space-y-4">
            <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Corrigé</p>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">Final answer</label>
              <textarea
                value={finalAnswer}
                onChange={(e) => setFinalAnswer(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text)] resize-y focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
                Methodology <span className="text-[var(--text-tertiary)]">(step-by-step)</span>
              </label>
              <textarea
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                rows={5}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text)] leading-relaxed resize-y focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          </div>
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
