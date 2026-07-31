"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection, query, where, getDocs, addDoc, orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useStudentAuth } from "@/lib/studentAuth";
import { Button } from "@/components/ui/Button";
import { cn, SUBJECT_LABELS } from "@/lib/utils";
import { renderContent } from "@/lib/renderContent";
import { Search, CheckCircle2, XCircle, ChevronRight, BookOpen, SlidersHorizontal } from "lucide-react";
import type { StudentAttempt } from "@/types/student";

// ── Types ──────────────────────────────────────────────────────────────────────

interface SchoolExercise {
  id: string;
  subject: string;
  schoolSlug?: string;
  schoolName?: string;
  school?: string;
  contributor?: string;
  exercise: {
    statement: string;
    difficulty: string;
    points: number;
    estimatedMinutes: number;
    solution: {
      finalAnswer: string;
      methodology: string;
    };
  };
}

type PhaseState =
  | { phase: "browse" }
  | { phase: "attempt"; exercise: SchoolExercise }
  | { phase: "result"; exercise: SchoolExercise; isCorrect: boolean };

// ── Firestore helpers ──────────────────────────────────────────────────────────

function slugify(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

async function fetchSchoolExercises(schoolName: string): Promise<SchoolExercise[]> {
  if (!db) return [];
  try {
    const slug = slugify(schoolName);
    // Try schoolSlug field first (bank page writes "schoolSlug")
    const q = query(
      collection(db, "schoolBank"),
      where("schoolSlug", "==", slug),
      orderBy("sharedAt", "desc")
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SchoolExercise));
    }
    // Fallback: try "school" field (schoolBank.ts writes "school")
    const q2 = query(
      collection(db, "schoolBank"),
      where("school", "==", schoolName),
      orderBy("sharedAt", "desc")
    );
    const snap2 = await getDocs(q2);
    return snap2.docs.map((d) => ({ id: d.id, ...d.data() } as SchoolExercise));
  } catch (err) {
    console.error("[practice] fetchSchoolExercises:", err);
    return [];
  }
}

async function fetchAllPublicExercises(): Promise<SchoolExercise[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, "schoolBank"), orderBy("sharedAt", "desc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SchoolExercise));
  } catch {
    return [];
  }
}

async function saveAttempt(attempt: Omit<StudentAttempt, "id">): Promise<void> {
  if (!db) return;
  await addDoc(collection(db, "student_attempts"), {
    ...attempt,
    timestamp: serverTimestamp(),
  });
}

// ── Difficulty badge ───────────────────────────────────────────────────────────

const DIFF: Record<string, { label: string; cls: string }> = {
  easy:   { label: "Easy",   cls: "text-emerald-600 bg-emerald-50" },
  medium: { label: "Medium", cls: "text-amber-600 bg-amber-50"     },
  hard:   { label: "Hard",   cls: "text-red-600 bg-red-50"         },
};

// ── Page ───────────────────────────────────────────────────────────────────────

export default function PracticePage() {
  const { user, studentProfile } = useStudentAuth();

  const [exercises, setExercises] = useState<SchoolExercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<SchoolExercise[]>([]);
  const [fetchState, setFetchState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [diffFilter, setDiffFilter] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [state, setState] = useState<PhaseState>({ phase: "browse" });
  const [savingAttempt, setSavingAttempt] = useState(false);

  // Load exercises
  useEffect(() => {
    if (!user) return;
    setFetchState("loading");
    const schoolName = studentProfile?.schoolName ?? "";

    const load = async () => {
      const list = schoolName
        ? await fetchSchoolExercises(schoolName)
        : await fetchAllPublicExercises();
      setExercises(list);
      setFetchState("done");
    };
    load().catch(() => setFetchState("error"));
  }, [user, studentProfile?.schoolName]);

  // Filter exercises
  useEffect(() => {
    let list = exercises;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          (e.exercise?.statement ?? "").toLowerCase().includes(q) ||
          (SUBJECT_LABELS[e.subject]?.en ?? e.subject).toLowerCase().includes(q)
      );
    }
    if (diffFilter !== "all") {
      list = list.filter((e) => e.exercise?.difficulty === diffFilter);
    }
    if (subjectFilter !== "all") {
      list = list.filter((e) => e.subject === subjectFilter);
    }
    setFilteredExercises(list);
  }, [exercises, searchQuery, diffFilter, subjectFilter]);

  const uniqueSubjects = [...new Set(exercises.map((e) => e.subject))];

  // ── Start attempting an exercise ────────────────────────────────────────────

  const startAttempt = useCallback((exercise: SchoolExercise) => {
    setState({ phase: "attempt", exercise });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ── Submit answer ──────────────────────────────────────────────────────────

  const submitAnswer = useCallback(
    async (exercise: SchoolExercise, isCorrect: boolean) => {
      if (!user) return;
      setSavingAttempt(true);
      try {
        const attempt: Omit<StudentAttempt, "id"> = {
          exerciseId: exercise.id,
          userId: user.uid,
          isCorrect,
          score: isCorrect ? 1 : 0,
          timestamp: Date.now(),
          category: exercise.subject,
          exerciseTitle: (exercise.exercise?.statement ?? "").slice(0, 100),
          difficulty: exercise.exercise?.difficulty,
        };
        await saveAttempt(attempt);
      } catch (err) {
        console.error("[practice] saveAttempt:", err);
      }
      setSavingAttempt(false);
      setState({ phase: "result", exercise, isCorrect });
    },
    [user]
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  // Result screen
  if (state.phase === "result") {
    const { exercise, isCorrect } = state;
    const subjectLabel = SUBJECT_LABELS[exercise.subject]?.en ?? exercise.subject;
    const diff = DIFF[exercise.exercise?.difficulty] ?? DIFF.medium;

    return (
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        {/* Result banner */}
        <div
          className={cn(
            "rounded-2xl p-6 flex items-center gap-4",
            isCorrect ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"
          )}
        >
          {isCorrect ? (
            <CheckCircle2 size={40} className="text-emerald-500 flex-shrink-0" />
          ) : (
            <XCircle size={40} className="text-red-400 flex-shrink-0" />
          )}
          <div>
            <p className={cn("text-lg font-bold", isCorrect ? "text-emerald-800" : "text-red-700")}>
              {isCorrect ? "Correct! Well done." : "Incorrect — review the solution."}
            </p>
            <p className={cn("text-sm mt-0.5", isCorrect ? "text-emerald-600" : "text-red-500")}>
              {isCorrect
                ? "This exercise has been added to your progress."
                : "Study the methodology below and try again later."}
            </p>
          </div>
        </div>

        {/* Exercise recap */}
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="p-5 border-b border-[var(--border)] bg-[var(--bg-subtle)]/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">{subjectLabel}</span>
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase", diff.cls)}>
                {diff.label}
              </span>
            </div>
            <div
              className="text-[15px] text-[var(--text)] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderContent(exercise.exercise?.statement ?? "") }}
            />
          </div>

          <div className="p-5 space-y-4">
            <div>
              <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest mb-2">
                Correct Answer
              </p>
              <div
                className="text-sm text-[var(--text)] font-medium bg-[var(--bg-subtle)] p-3 rounded-xl border border-[var(--border)]"
                dangerouslySetInnerHTML={{
                  __html: renderContent(exercise.exercise?.solution?.finalAnswer ?? ""),
                }}
              />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">
                Methodology
              </p>
              <div
                className="text-sm text-[var(--text-secondary)] leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: renderContent(exercise.exercise?.solution?.methodology ?? ""),
                }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setState({ phase: "browse" })}
            className="flex-1"
          >
            Back to exercises
          </Button>
          {filteredExercises.length > 1 && (
            <Button
              icon={<ChevronRight size={15} />}
              iconPosition="right"
              onClick={() => {
                const nextIdx =
                  (filteredExercises.findIndex((e) => e.id === exercise.id) + 1) %
                  filteredExercises.length;
                startAttempt(filteredExercises[nextIdx]);
              }}
              className="flex-1"
            >
              Next exercise
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Attempt screen
  if (state.phase === "attempt") {
    const { exercise } = state;
    const subjectLabel = SUBJECT_LABELS[exercise.subject]?.en ?? exercise.subject;
    const diff = DIFF[exercise.exercise?.difficulty] ?? DIFF.medium;

    return (
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setState({ phase: "browse" })}
            className="p-2 hover:bg-[var(--bg-subtle)] rounded-lg transition-colors text-[var(--text-secondary)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">{subjectLabel}</span>
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase", diff.cls)}>
              {diff.label}
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)]">
              {exercise.exercise?.points} pts · {exercise.exercise?.estimatedMinutes} min
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
          <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-4">
            Question
          </p>
          <div
            className="text-base text-[var(--text)] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderContent(exercise.exercise?.statement ?? "") }}
          />
        </div>

        {/* Answer hint */}
        <div className="bg-[var(--accent-light)] rounded-2xl border border-emerald-100 p-5 text-sm text-[var(--accent)]">
          <p className="font-semibold mb-1">How to answer</p>
          <p className="text-sm leading-relaxed opacity-90">
            Work out your answer mentally or on paper, then mark yourself honestly below.
          </p>
        </div>

        {/* Self-grade buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            disabled={savingAttempt}
            onClick={() => submitAnswer(exercise, false)}
            className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-red-200 bg-red-50 hover:border-red-400 hover:bg-red-100 transition-all disabled:opacity-50"
          >
            <XCircle size={28} className="text-red-400" />
            <span className="font-semibold text-red-700 text-sm">Got it wrong</span>
            <span className="text-xs text-red-400">I need more practice</span>
          </button>
          <button
            disabled={savingAttempt}
            onClick={() => submitAnswer(exercise, true)}
            className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50 hover:border-emerald-400 hover:bg-emerald-100 transition-all disabled:opacity-50"
          >
            <CheckCircle2 size={28} className="text-emerald-500" />
            <span className="font-semibold text-emerald-700 text-sm">Got it right</span>
            <span className="text-xs text-emerald-500">I understood this</span>
          </button>
        </div>

        {savingAttempt && (
          <p className="text-xs text-center text-[var(--text-tertiary)] animate-pulse">
            Saving your attempt…
          </p>
        )}
      </div>
    );
  }

  // Browse screen (default)
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
            <BookOpen size={14} className="text-[var(--accent)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)]">
            Practice
          </h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          {studentProfile?.schoolName
            ? `Exercises from ${studentProfile.schoolName}`
            : "All exercises from the school bank"}
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises…"
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "h-10 px-3 rounded-xl border text-sm font-medium transition-colors flex items-center gap-1.5",
            showFilters
              ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-light)]"
              : "border-[var(--border)] text-[var(--text-secondary)] bg-[var(--surface)] hover:border-[var(--border-strong)]"
          )}
        >
          <SlidersHorizontal size={13} /> Filters
        </button>
      </div>

      {/* Filter row */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-[var(--surface)] rounded-2xl border border-[var(--border)]">
          {/* Difficulty */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mr-1">
              Difficulty
            </span>
            {(["all", "easy", "medium", "hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                  diffFilter === d
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
                )}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>

          {/* Subject */}
          {uniqueSubjects.length > 1 && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mr-1">
                Subject
              </span>
              <button
                onClick={() => setSubjectFilter("all")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                  subjectFilter === "all"
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
                )}
              >
                All
              </button>
              {uniqueSubjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubjectFilter(s)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                    subjectFilter === s
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
                  )}
                >
                  {SUBJECT_LABELS[s]?.en ?? s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Exercise list */}
      {fetchState === "loading" && (
        <div className="py-24 flex flex-col items-center gap-4 opacity-50">
          <div className="w-7 h-7 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <p className="text-sm text-[var(--text-secondary)]">Loading exercises…</p>
        </div>
      )}

      {fetchState === "done" && exercises.length === 0 && (
        <div className="py-24 flex flex-col items-center gap-3 text-center">
          <BookOpen size={32} className="text-[var(--text-tertiary)]" />
          <p className="font-semibold text-[var(--text)]">No exercises found</p>
          <p className="text-sm text-[var(--text-secondary)] max-w-xs">
            {studentProfile?.schoolName
              ? `Your teachers at ${studentProfile.schoolName} haven't shared any exercises yet. Ask them to share exercises from the Question Bank.`
              : "No exercises have been shared yet."}
          </p>
        </div>
      )}

      {fetchState === "done" && exercises.length > 0 && filteredExercises.length === 0 && (
        <div className="py-16 flex flex-col items-center gap-2 text-center opacity-60">
          <Search size={24} className="text-[var(--text-tertiary)]" />
          <p className="text-sm text-[var(--text-secondary)]">No exercises match your filters.</p>
        </div>
      )}

      {fetchState === "done" && filteredExercises.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs text-[var(--text-tertiary)]">
            {filteredExercises.length} exercise{filteredExercises.length !== 1 ? "s" : ""}
            {filteredExercises.length !== exercises.length ? ` (of ${exercises.length})` : ""}
          </p>
          {filteredExercises.map((exercise) => {
            const subjectLabel = SUBJECT_LABELS[exercise.subject]?.en ?? exercise.subject;
            const diff = DIFF[exercise.exercise?.difficulty] ?? DIFF.medium;
            return (
              <div
                key={exercise.id}
                className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden hover:border-[var(--accent)] transition-colors group cursor-pointer"
                onClick={() => startAttempt(exercise)}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
                        {subjectLabel}
                      </span>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase", diff.cls)}>
                        {diff.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-[var(--text-tertiary)] uppercase">
                      <span>{exercise.exercise?.points} pts</span>
                      <span>{exercise.exercise?.estimatedMinutes} min</span>
                    </div>
                  </div>

                  <div
                    className="text-sm text-[var(--text)] leading-relaxed line-clamp-3"
                    dangerouslySetInnerHTML={{
                      __html: renderContent(
                        (exercise.exercise?.statement ?? "").slice(0, 300)
                      ),
                    }}
                  />

                  {exercise.contributor && (
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-3">
                      Shared by <span className="font-semibold">{exercise.contributor}</span>
                    </p>
                  )}
                </div>

                <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--bg-subtle)]/40 flex items-center justify-between">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    Click to practice
                  </span>
                  <ChevronRight
                    size={14}
                    className="text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
