"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { renderContent } from "@/lib/renderContent";
import mermaid from "mermaid";
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
  Table,
  Calculator,
  Image as ImageIcon,
  X,
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
  onEdit?: (exercise: Exercise) => void;
  onSaveToBank?: (exercise: Exercise) => void;
  onTransform?: (id: string, type: "table" | "image", prompt?: string) => Promise<void>;
  isRegenerating?: boolean;
  savedToBank?: boolean;
  defaultShowSolution?: boolean;
}

export function ExerciseCard({
  exercise,
  index,
  language,
  onRegenerate,
  onRemove,
  onEdit,
  onSaveToBank,
  onTransform,
  isRegenerating = false,
  savedToBank = false,
  defaultShowSolution = false,
}: ExerciseCardProps) {
  const [showSolution, setShowSolution] = useState(defaultShowSolution);
  const [showActions, setShowActions] = useState(false);

  const [showMathTool, setShowMathTool] = useState(false);
  const [mathTab, setMathTab] = useState<"expr" | "stats" | "chem" | "const">("expr");

  const [showVisualPrompt, setShowVisualPrompt] = useState(false);
  const [visualPrompt, setVisualPrompt] = useState("");

  // Expression checker (symbolic)
  const [mathOp, setMathOp] = useState("simplify");
  const [mathExpr, setMathExpr] = useState("");
  const [mathResult, setMathResult] = useState<string | null>(null);
  const [mathLoading, setMathLoading] = useState(false);
  const [mathError, setMathError] = useState<string | null>(null);

  // Statistics checker (Math.js)
  const [statsInput, setStatsInput] = useState("");
  const [statsResult, setStatsResult] = useState<Record<string, string> | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Chemistry checker
  const [chemFormula, setChemFormula] = useState("");
  const [chemResult, setChemResult] = useState<{ weight: number; unit: string; elements: Record<string, number> } | null>(null);
  const [chemLoading, setChemLoading] = useState(false);
  const [chemError, setChemError] = useState<string | null>(null);

  // Physics constants (NIST)
  const [constQuery, setConstQuery] = useState("");
  const [constResults, setConstResults] = useState<Array<{ name: string; valueDisplay: string; uncertainty: string; unit: string }>>([]);
  const [constLoading, setConstLoading] = useState(false);
  const [constError, setConstError] = useState<string | null>(null);
  const [copiedConst, setCopiedConst] = useState<string | null>(null);

  async function computeMath() {
    if (!mathExpr.trim()) return;
    setMathLoading(true);
    setMathResult(null);
    setMathError(null);
    try {
      const res = await fetch("/api/tools/math", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: mathOp, expression: mathExpr.trim() }),
      });
      const data = await res.json();
      if (data.success) setMathResult(data.result);
      else setMathError(data.error ?? "Computation failed.");
    } catch {
      setMathError("Network error.");
    } finally {
      setMathLoading(false);
    }
  }

  async function computeStats() {
    if (!statsInput.trim()) return;
    setStatsLoading(true);
    setStatsResult(null);
    setStatsError(null);
    try {
      const numbers = statsInput
        .split(/[,;\s]+/)
        .map((s) => parseFloat(s.trim()))
        .filter((n) => !isNaN(n));
      if (numbers.length === 0) { setStatsError("Enter valid numbers."); setStatsLoading(false); return; }
      const res = await fetch("/api/tools/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numbers }),
      });
      const data = await res.json();
      if (data.success) setStatsResult(data.results);
      else setStatsError(data.error ?? "Computation failed.");
    } catch {
      setStatsError("Network error.");
    } finally {
      setStatsLoading(false);
    }
  }

  async function computeChem() {
    if (!chemFormula.trim()) return;
    setChemLoading(true);
    setChemResult(null);
    setChemError(null);
    try {
      const res = await fetch("/api/tools/chemistry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formula: chemFormula.trim() }),
      });
      const data = await res.json();
      if (data.success) setChemResult({ weight: data.weight, unit: data.unit, elements: data.elements });
      else setChemError(data.error ?? "Invalid formula.");
    } catch {
      setChemError("Network error.");
    } finally {
      setChemLoading(false);
    }
  }

  async function searchConst() {
    if (!constQuery.trim()) return;
    setConstLoading(true);
    setConstResults([]);
    setConstError(null);
    try {
      const res = await fetch(`/api/tools/physics?q=${encodeURIComponent(constQuery.trim())}`);
      const data = await res.json();
      if (data.success) setConstResults(data.constants);
      else setConstError(data.error ?? "Search failed.");
    } catch {
      setConstError("Network error.");
    } finally {
      setConstLoading(false);
    }
  }

  function copyConst(c: { name: string; valueDisplay: string; uncertainty: string; unit: string }) {
    const text = `${c.name} = ${c.valueDisplay}${c.unit ? ` ${c.unit}` : ""}${c.uncertainty !== "(exact)" ? ` (± ${c.uncertainty})` : " (exact)"}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedConst(c.name);
      setTimeout(() => setCopiedConst(null), 2000);
    });
  }

  const difficulty = DIFFICULTY_CONFIG[exercise.difficulty];
  const exerciseLabel = language === "french" ? "Exercice" : "Exercise";

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        mermaid.run().catch(err => console.warn("Mermaid run failed:", err));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [exercise.statement, showSolution, isRegenerating]);

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
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onTransform && (
            <div className="flex items-center bg-[var(--bg-subtle)]/50 rounded-lg border border-[var(--border)] p-0.5 mr-1">
              <button
                onClick={() => onTransform(exercise.id, "table")}
                className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-white transition-all"
                title="Format as Table"
              >
                <Table size={13} />
              </button>
              <button
                onClick={() => setShowVisualPrompt(true)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-white transition-all"
                title="Add Visual / Graph"
              >
                <ImageIcon size={13} />
              </button>
            </div>
          )}

          <div className="relative">
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
                {onTransform && (
                  <>
                    <div className="my-1 border-t border-[var(--border)]" />
                    <button
                      onClick={() => { onTransform(exercise.id, "table"); setShowActions(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors"
                    >
                      <Table size={13} />
                      Format as Table
                    </button>
                    <button
                      onClick={() => { setShowVisualPrompt(true); setShowActions(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors"
                    >
                      <ImageIcon size={13} />
                      Add Visual / Graph
                    </button>
                  </>
                )}
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
      </div>

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

      {/* Visual Prompt Input */}
      {showVisualPrompt && (
        <div className="px-6 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-3.5 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-light)]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon size={13} className="text-[var(--accent)]" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">Request a visual</p>
              </div>
              <button 
                onClick={() => setShowVisualPrompt(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text)] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={visualPrompt}
                onChange={(e) => setVisualPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && visualPrompt.trim() && onTransform) {
                    onTransform(exercise.id, "image", visualPrompt.trim());
                    setShowVisualPrompt(false);
                    setVisualPrompt("");
                  }
                }}
                placeholder="e.g. A demand curve, a titration setup, a table of contents..."
                className="flex-1 h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-all"
              />
              <button
                onClick={() => {
                  if (visualPrompt.trim() && onTransform) {
                    onTransform(exercise.id, "image", visualPrompt.trim());
                    setShowVisualPrompt(false);
                    setVisualPrompt("");
                  }
                }}
                disabled={!visualPrompt.trim()}
                className="h-9 px-4 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent)]/90 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <Zap size={13} />
                Generate
              </button>
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] leading-relaxed italic">
              Describe the chart, function, or diagram you want. Imtihan will generate an interactive Mermaid chart (xychart, flowchart, etc.) based on your description.
            </p>
          </div>
        </div>
      )}

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
          <div className="px-6 pb-5 space-y-5 bg-[var(--bg-subtle)]">

            {/* Barème */}
            {exercise.solution.bareme && exercise.solution.bareme.length > 0 && (
              <div className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">Barème de correction</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent)] text-white">
                    {exercise.solution.bareme.reduce((s, b) => s + b.points, 0)} pts
                  </span>
                </div>
                <div className="space-y-1.5">
                  {exercise.solution.bareme.map((b, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] px-3 py-2.5 hover:border-[var(--accent)]/30 transition-colors">
                      <span className="text-xs font-bold text-[var(--accent)] w-10 flex-shrink-0 pt-px">{b.label}</span>
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

            {/* Final answer */}
            <div className={exercise.solution.bareme ? "" : "pt-4"}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">Answer</p>
                <button
                  onClick={() => { setShowMathTool((v) => !v); setMathResult(null); setMathError(null); setStatsResult(null); setStatsError(null); }}
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
                >
                  <Calculator size={11} />
                  {showMathTool ? "Hide checker" : "Check answer"}
                </button>
              </div>
              <div
                className="text-sm text-[var(--text)] font-medium leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderContent(exercise.solution.finalAnswer) }}
              />

              {/* Answer checker — Expression / Statistics / Chemistry tabs */}
              {showMathTool && (
                <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                  {/* Tab bar */}
                  <div className="flex border-b border-[var(--border)]">
                    {([
                      { id: "expr",  label: "Expression" },
                      { id: "stats", label: "Statistics" },
                      { id: "chem",  label: "Chemistry" },
                      { id: "const", label: "Constants" },
                    ] as const).map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => {
                          setMathTab(id);
                          setMathResult(null); setMathError(null);
                          setStatsResult(null); setStatsError(null);
                          setChemResult(null); setChemError(null);
                          setConstResults([]); setConstError(null);
                        }}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                          mathTab === id
                            ? "bg-[var(--accent-light)] text-[var(--accent)] border-b-2 border-[var(--accent)]"
                            : "text-[var(--text-tertiary)] hover:text-[var(--text)]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="p-3 space-y-2">
                    {mathTab === "expr" && (
                      <>
                        <div className="flex gap-2 flex-wrap">
                          <select value={mathOp} onChange={(e) => { setMathOp(e.target.value); setMathResult(null); }}
                            className="h-8 px-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)]">
                            {["simplify","factor","derive","integrate","zeroes","tangent","area","cos","sin","tan","log","abs"].map((op) => (
                              <option key={op} value={op}>{op.charAt(0).toUpperCase() + op.slice(1)}</option>
                            ))}
                          </select>
                          <input type="text" value={mathExpr}
                            onChange={(e) => { setMathExpr(e.target.value); setMathResult(null); }}
                            onKeyDown={(e) => e.key === "Enter" && computeMath()}
                            placeholder="e.g. x^3-6x^2+9x"
                            className="flex-1 min-w-[120px] h-8 px-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
                          />
                          <button onClick={computeMath} disabled={!mathExpr.trim() || mathLoading}
                            className="h-8 px-3 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent)]/90 disabled:opacity-50 transition-colors">
                            {mathLoading ? "…" : "→"}
                          </button>
                        </div>
                        {mathResult !== null && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--accent-light)] border border-[var(--accent)]/20">
                            <span className="text-[10px] text-[var(--accent)] font-semibold uppercase tracking-wider">Result</span>
                            <span className="text-sm font-mono font-semibold text-[var(--text)]">{mathResult}</span>
                          </div>
                        )}
                        {mathError && <p className="text-[11px] text-red-600">{mathError}</p>}
                      </>
                    )}

                    {mathTab === "stats" && (
                      <>
                        <div className="flex gap-2">
                          <input type="text" value={statsInput}
                            onChange={(e) => { setStatsInput(e.target.value); setStatsResult(null); }}
                            onKeyDown={(e) => e.key === "Enter" && computeStats()}
                            placeholder="e.g. 12, 15, 18, 21, 24"
                            className="flex-1 h-8 px-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
                          />
                          <button onClick={computeStats} disabled={!statsInput.trim() || statsLoading}
                            className="h-8 px-3 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent)]/90 disabled:opacity-50 transition-colors">
                            {statsLoading ? "…" : "→"}
                          </button>
                        </div>
                        {statsResult && (
                          <div className="grid grid-cols-2 gap-1.5">
                            {Object.entries(statsResult).map(([key, val]) => (
                              <div key={key} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)]">
                                <span className="text-[10px] text-[var(--text-tertiary)] capitalize font-medium">{key === "std" ? "Std dev" : key}</span>
                                <span className="text-xs font-mono font-bold text-[var(--text)]">{val}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {statsError && <p className="text-[11px] text-red-600">{statsError}</p>}
                        <p className="text-[10px] text-[var(--text-tertiary)]">Separate numbers with commas, spaces, or semicolons.</p>
                      </>
                    )}

                    {mathTab === "chem" && (
                      <>
                        <div className="flex gap-2">
                          <input type="text" value={chemFormula}
                            onChange={(e) => { setChemFormula(e.target.value); setChemResult(null); }}
                            onKeyDown={(e) => e.key === "Enter" && computeChem()}
                            placeholder="e.g. H2O, NaCl, C6H12O6, C2H5OH"
                            className="flex-1 h-8 px-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs font-mono text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
                          />
                          <button onClick={computeChem} disabled={!chemFormula.trim() || chemLoading}
                            className="h-8 px-3 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent)]/90 disabled:opacity-50 transition-colors">
                            {chemLoading ? "…" : "→"}
                          </button>
                        </div>
                        {chemResult && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--accent-light)] border border-[var(--accent)]/20">
                              <span className="text-[10px] text-[var(--accent)] font-semibold uppercase tracking-wider">Molar mass</span>
                              <span className="text-sm font-mono font-bold text-[var(--text)]">{chemResult.weight} {chemResult.unit}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                              {Object.entries(chemResult.elements).map(([el, count]) => (
                                <div key={el} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)]">
                                  <span className="text-xs font-bold text-[var(--text)]">{el}</span>
                                  <span className="text-[10px] text-[var(--text-tertiary)] font-medium">×{count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {chemError && <p className="text-[11px] text-red-600">{chemError}</p>}
                        <p className="text-[10px] text-[var(--text-tertiary)]">Standard element symbols. Subscripts as numbers (H2O, not H₂O).</p>
                        {/* PubChem lookup */}
                        <PubChemLookup />
                      </>
                    )}

                    {mathTab === "const" && (
                      <>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={constQuery}
                            onChange={(e) => { setConstQuery(e.target.value); setConstResults([]); }}
                            onKeyDown={(e) => e.key === "Enter" && searchConst()}
                            placeholder="e.g. speed of light, electron mass, planck…"
                            className="flex-1 h-8 px-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
                          />
                          <button
                            onClick={searchConst}
                            disabled={!constQuery.trim() || constLoading}
                            className="h-8 px-3 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent)]/90 disabled:opacity-50 transition-colors"
                          >
                            {constLoading ? "…" : "→"}
                          </button>
                        </div>

                        {constResults.length > 0 && (
                          <div className="space-y-1.5">
                            {constResults.map((c, i) => (
                              <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 space-y-0.5">
                                <p className="text-[10px] text-[var(--text-tertiary)] leading-snug">{c.name}</p>
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs font-mono font-semibold text-[var(--text)]">{c.valueDisplay}</span>
                                    {c.unit && <span className="text-[10px] text-[var(--text-secondary)] ml-1.5">{c.unit}</span>}
                                  </div>
                                  <button
                                    onClick={() => copyConst(c)}
                                    className="flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                                  >
                                    {copiedConst === c.name ? "✓ Copied" : "Copy"}
                                  </button>
                                </div>
                                <p className="text-[10px] text-[var(--text-tertiary)]">
                                  {c.uncertainty === "(exact)" ? "Exact value (CODATA 2022)" : `Uncertainty: ±${c.uncertainty}`}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                        {constError && <p className="text-[11px] text-red-600">{constError}</p>}
                        <p className="text-[10px] text-[var(--text-tertiary)]">
                          Source: NIST CODATA 2022 · Click Copy to get the formatted value for a Données block.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
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

            {/* Micro-barème */}
            {exercise.solution.microBareme && exercise.solution.microBareme.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Micro-barème</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-tertiary)]">
                    {exercise.solution.microBareme.reduce((s, mb) => s + mb.points, 0)} pts
                  </span>
                </div>
                <div className="rounded-xl border border-[var(--border)] overflow-hidden divide-y divide-[var(--border)]">
                  {exercise.solution.microBareme.map((mb, i) => (
                    <div key={i} className="flex items-start gap-3 px-3 py-2.5 bg-[var(--surface)] hover:bg-[var(--bg-subtle)] transition-colors">
                      <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest w-14 flex-shrink-0 pt-0.5 leading-tight">
                        {mb.step}
                      </span>
                      <span
                        className="flex-1 text-xs text-[var(--text-secondary)] leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: renderContent(mb.criterion) }}
                      />
                      <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[28px] h-5 px-1.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-tertiary)] font-bold text-[10px]">
                        {mb.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                      <span dangerouslySetInnerHTML={{ __html: renderContent(m) }} />
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

/** Inline PubChem compound lookup — shown inside the Chemistry tab */
function PubChemLookup() {
  const [query, setQuery]   = useState("");
  const [result, setResult] = useState<{ formula: string; molarMass: string | number; iupacName: string; smiles: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function search() {
    if (!query.trim()) return;
    setLoading(true); setResult(null); setError(null);
    try {
      const res  = await fetch(`/api/tools/pubchem?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.success) setResult(data.compound);
      else setError(data.error ?? "Not found.");
    } catch { setError("Network error."); }
    finally  { setLoading(false); }
  }

  return (
    <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
        Compound lookup (PubChem)
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setResult(null); }}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="e.g. ethanol, sodium chloride, glucose…"
          className="flex-1 h-8 px-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
        />
        <button
          onClick={search}
          disabled={!query.trim() || loading}
          className="h-8 px-3 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent)]/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "…" : "→"}
        </button>
      </div>

      {result && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2.5 space-y-1.5 text-xs">
          <div className="flex gap-3">
            <span className="text-[var(--text-tertiary)] w-20 flex-shrink-0">Formula</span>
            <span className="font-mono font-semibold text-[var(--text)]">{result.formula}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-[var(--text-tertiary)] w-20 flex-shrink-0">Molar mass</span>
            <span className="font-mono font-semibold text-[var(--text)]">{result.molarMass} g/mol</span>
          </div>
          <div className="flex gap-3">
            <span className="text-[var(--text-tertiary)] w-20 flex-shrink-0">IUPAC name</span>
            <span className="text-[var(--text-secondary)] leading-snug">{result.iupacName}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-[var(--text-tertiary)] w-20 flex-shrink-0">SMILES</span>
            <span className="font-mono text-[10px] text-[var(--text-secondary)] break-all">{result.smiles}</span>
          </div>
        </div>
      )}
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
