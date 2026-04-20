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

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  language: "french" | "english" | "arabic";
  onRegenerate: (id: string, targetDifficulty?: "easy" | "medium" | "hard") => Promise<void>;
  onRemove: (id: string) => void;
  isRegenerating?: boolean;
}

export function ExerciseCard({
  exercise,
  index,
  language,
  onRegenerate,
  onRemove,
  isRegenerating = false,
}: ExerciseCardProps) {
  const [showSolution, setShowSolution] = useState(false);
  const [showActions, setShowActions] = useState(false);

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

