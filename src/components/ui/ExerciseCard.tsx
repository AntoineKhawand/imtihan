"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { renderContent } from "@/lib/renderContent";
import { Button } from "./Button";
import type { Exercise } from "@/types/exam";
import {
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
  TrendingUp,
  TrendingDown,
  Trash2,
  BookOpen,
  Clock,
  Award,
  Pencil,
  Bookmark,
  ClipboardList,
  Loader2,
} from "lucide-react";

const DIFFICULTY_CONFIG = {
  easy: { label: "Easy", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30", dot: "bg-emerald-500" },
  medium: { label: "Medium", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30", dot: "bg-amber-500" },
  hard: { label: "Hard", color: "text-red-600 bg-red-50 dark:bg-red-950/30", dot: "bg-red-500" },
};

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: "MCQ",
  short_answer: "Short answer",
  problem_solving: "Problem",
  proof: "Proof",
  calculation: "Calculation",
  lab_analysis: "Lab analysis",
};

export interface RubricCriterion {
  label: string;
  description: string;
  points: number;
  markType: "method" | "answer" | "presentation";
}
export interface Rubric {
  totalPoints: number;
  criteria: RubricCriterion[];
  partialCredit: Array<{ scenario: string; award: string }>;
  commonErrors: Array<{ error: string; penalty: string }>;
}

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  language: "french" | "english" | "arabic";
  onRegenerate: (id: string, targetDifficulty?: "easy" | "medium" | "hard") => Promise<void>;
  onRemove: (id: string) => void;
  onEdit?: (exercise: Exercise) => void;
  onSaveToBank?: (exercise: Exercise) => void;
  isRegenerating?: boolean;
  savedToBank?: boolean;
}

export function ExerciseCard({
  exercise,
  index,
  language,
  onRegenerate,
  onRemove,
  onEdit,
  onSaveToBank,
  isRegenerating = false,
  savedToBank = false,
}: ExerciseCardProps) {
  const [showSolution, setShowSolution] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [rubricLoading, setRubricLoading] = useState(false);
  const [rubricError, setRubricError] = useState<string | null>(null);
  const [showRubric, setShowRubric] = useState(false);

  async function loadRubric() {
    if (rubric) { setShowRubric((v) => !v); return; }
    setRubricLoading(true);
    setRubricError(null);
    try {
      const res = await fetch("/api/rubric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercise, language }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.errors?.[0] ?? "Failed to generate rubric");
      setRubric(data.rubric);
      setShowRubric(true);
    } catch (err) {
      setRubricError(err instanceof Error ? err.message : "Rubric generation failed");
    } finally {
      setRubricLoading(false);
    }
  }

  const difficulty = DIFFICULTY_CONFIG[exercise.difficulty];
  const exerciseLabel = language === "french" ? "Exercice" : "Exercise";

  return (
    <div
      className={cn(
        "card overflow-hidden transition-all duration-300",
        isRegenerating && "opacity-60 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-6 pb-4 gap-4">
        <div className="flex items-center gap-3">
          {/* Number badge */}
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-[var(--text)]">{index + 1}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {exerciseLabel} {index + 1}
              </span>
              <span className="text-xs text-[var(--text-tertiary)]">·</span>
              <span className="text-xs text-[var(--text-secondary)]">
                {TYPE_LABELS[exercise.type] ?? exercise.type}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {/* Difficulty badge */}
              <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium", difficulty.color)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", difficulty.dot)} />
                {difficulty.label}
              </span>
              {/* Points */}
              <span className="inline-flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                <Award size={11} />
                {exercise.points} pts
              </span>
              {/* Time */}
              <span className="inline-flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                <Clock size={11} />
                ~{exercise.estimatedMinutes} min
              </span>
            </div>
          </div>
        </div>

        {/* Action menu trigger */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowActions(!showActions)}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              showActions
                ? "bg-[var(--bg-subtle)] text-[var(--text)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)]"
            )}
          >
            {isRegenerating ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Zap size={14} />
            )}
          </button>

          {showActions && (
            <div className="absolute right-0 top-10 z-10 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden">
              <div className="p-1">
                <button
                  onClick={() => { onRegenerate(exercise.id); setShowActions(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors"
                >
                  <RefreshCw size={13} />
                  Regenerate
                </button>
                <button
                  onClick={() => { onRegenerate(exercise.id, "easy"); setShowActions(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors"
                >
                  <TrendingDown size={13} />
                  Make easier
                </button>
                <button
                  onClick={() => { onRegenerate(exercise.id, "hard"); setShowActions(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors"
                >
                  <TrendingUp size={13} />
                  Make harder
                </button>
                {onEdit && (
                  <button
                    onClick={() => { onEdit(exercise); setShowActions(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                )}
                <button
                  onClick={() => { loadRubric(); setShowActions(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors"
                >
                  <ClipboardList size={13} />
                  {rubric ? "Show rubric" : "Generate rubric"}
                </button>
                {onSaveToBank && (
                  <button
                    onClick={() => { onSaveToBank(exercise); setShowActions(false); }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors",
                      savedToBank
                        ? "text-[var(--accent)] bg-[var(--accent-light)] cursor-default"
                        : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)]"
                    )}
                    disabled={savedToBank}
                  >
                    <Bookmark size={13} className={savedToBank ? "fill-current" : ""} />
                    {savedToBank ? "Saved to bank" : "Save to bank"}
                  </button>
                )}
                <div className="my-1 border-t border-[var(--border)]" />
                <button
                  onClick={() => { onRemove(exercise.id); setShowActions(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--danger)] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                >
                  <Trash2 size={13} />
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statement */}
      <div className="px-6 pb-4">
        <div
          className="text-sm text-[var(--text)] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderContent(exercise.statement) }}
        />

        {/* Sub-questions */}
        {exercise.subQuestions && exercise.subQuestions.length > 0 && (
          <div className="mt-4 space-y-3">
            {exercise.subQuestions.map((sq) => (
              <div key={sq.label} className="flex gap-3">
                <span className="text-sm font-semibold text-[var(--accent)] flex-shrink-0 w-6">
                  {sq.label}
                </span>
                <div className="flex-1">
                  <span
                    className="text-sm text-[var(--text)] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderContent(sq.statement) }}
                  />
                  <span className="ml-2 text-xs text-[var(--text-tertiary)]">({sq.points} pts)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Corrigé toggle */}
      <div className="border-t border-[var(--border)]">
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="w-full flex items-center gap-2 px-6 py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-colors"
        >
          <BookOpen size={13} />
          <span className="flex-1 text-left font-medium">Corrigé</span>
          {showSolution ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {rubricLoading && (
          <div className="px-6 py-3 flex items-center gap-2 text-xs text-[var(--text-secondary)] border-t border-[var(--border)] bg-[var(--bg-subtle)]">
            <Loader2 size={12} className="animate-spin" />
            Generating detailed rubric…
          </div>
        )}
        {rubricError && (
          <div className="px-6 py-3 text-xs text-[var(--danger)] border-t border-[var(--border)] bg-red-50 dark:bg-red-950/20">
            {rubricError}
          </div>
        )}
        {rubric && showRubric && (
          <div className="border-t border-[var(--border)] px-6 py-5 bg-[var(--bg-subtle)] space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
                Grading Rubric · {rubric.totalPoints} pts total
              </p>
              <button
                onClick={() => setShowRubric(false)}
                className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text)]"
              >
                Hide
              </button>
            </div>
            <div className="space-y-1.5">
              {rubric.criteria.map((c, i) => (
                <div key={i} className="flex gap-3 items-start text-sm">
                  <span className="w-14 text-right text-[var(--accent)] font-semibold flex-shrink-0">
                    {c.points} pts
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--text)]">{c.label}</span>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">{c.markType}</span>
                    </div>
                    <div
                      className="text-xs text-[var(--text-secondary)]"
                      dangerouslySetInnerHTML={{ __html: renderContent(c.description) }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {rubric.partialCredit.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Partial credit</p>
                <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
                  {rubric.partialCredit.map((p, i) => (
                    <li key={i}><strong>{p.scenario}:</strong> {p.award}</li>
                  ))}
                </ul>
              </div>
            )}
            {rubric.commonErrors.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[var(--warning)] uppercase tracking-wider mb-1.5">Common errors</p>
                <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
                  {rubric.commonErrors.map((e, i) => (
                    <li key={i}><strong>{e.error}:</strong> {e.penalty}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {showSolution && (
          <div className="px-6 pb-5 space-y-4 bg-[var(--bg-subtle)]">
            {/* Final answer */}
            <div className="pt-4">
              <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">
                Answer
              </p>
              <div
                className="text-sm text-[var(--text)] font-medium leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderContent(exercise.solution.finalAnswer) }}
              />
            </div>

            {/* Methodology */}
            <div>
              <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Methodology
              </p>
              <div
                className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-1"
                dangerouslySetInnerHTML={{ __html: renderContent(exercise.solution.methodology) }}
              />
            </div>

            {/* Common mistakes */}
            {exercise.solution.commonMistakes && exercise.solution.commonMistakes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[var(--warning)] uppercase tracking-wider mb-2">
                  Common mistakes
                </p>
                <ul className="space-y-1">
                  {exercise.solution.commonMistakes.map((m, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                      <span className="text-[var(--warning)] flex-shrink-0">⚠</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

