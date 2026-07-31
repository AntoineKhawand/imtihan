"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  collection, query, where, getDocs, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useStudentAuth } from "@/lib/studentAuth";
import { cn, SUBJECT_LABELS } from "@/lib/utils";
import {
  BarChart2, CheckCircle2, XCircle, BookOpen,
  TrendingUp, Target, Clock, Flame,
} from "lucide-react";
import type { StudentAttempt } from "@/types/student";

// ─── Firestore ────────────────────────────────────────────────────────────────

async function fetchAttempts(userId: string): Promise<StudentAttempt[]> {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "student_attempts"),
      where("userId", "==", userId),
      orderBy("timestamp", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      // serverTimestamp returns a Firestore Timestamp object; convert to ms
      timestamp:
        (d.data().timestamp as { toMillis?: () => number })?.toMillis?.() ?? Date.now(),
    })) as StudentAttempt[];
  } catch (err) {
    console.error("[dashboard] fetchAttempts:", err);
    return [];
  }
}

// ─── Spaced repetition helpers ────────────────────────────────────────────────

/**
 * SM-2-lite: returns the review-due date (ms) for an exercise
 * based on its attempt history. Sorted most-due first.
 */
function computeSpacedQueue(attempts: StudentAttempt[]): {
  exerciseId: string;
  exerciseTitle: string;
  category: string;
  dueAt: number;
  streak: number;
}[] {
  // Group by exerciseId
  const byExercise = new Map<
    string,
    { attempts: StudentAttempt[]; title: string; category: string }
  >();
  for (const a of attempts) {
    const existing = byExercise.get(a.exerciseId);
    if (!existing) {
      byExercise.set(a.exerciseId, {
        attempts: [a],
        title: a.exerciseTitle,
        category: a.category,
      });
    } else {
      existing.attempts.push(a);
    }
  }

  const now = Date.now();
  const queue: { exerciseId: string; exerciseTitle: string; category: string; dueAt: number; streak: number }[] = [];

  for (const [exerciseId, { attempts: exAttempts, title, category }] of byExercise) {
    // Sort oldest first
    exAttempts.sort((a, b) => a.timestamp - b.timestamp);

    // Compute current streak of correct answers
    let streak = 0;
    for (let i = exAttempts.length - 1; i >= 0; i--) {
      if (exAttempts[i].isCorrect) streak++;
      else break;
    }

    const lastAttempt = exAttempts[exAttempts.length - 1];
    const lastTime = lastAttempt.timestamp;

    // Interval: 0 streak → 0 days (due now), streak 1→1d, 2→3d, 3→7d, 4→14d, 5+→30d
    const intervals = [0, 1, 3, 7, 14, 30];
    const intervalDays = intervals[Math.min(streak, intervals.length - 1)];
    const dueAt = lastTime + intervalDays * 24 * 60 * 60 * 1000;

    if (dueAt <= now + 24 * 60 * 60 * 1000) {
      // Due within 24 hours
      queue.push({ exerciseId, exerciseTitle: title, category, dueAt, streak });
    }
  }

  // Sort: most overdue first
  queue.sort((a, b) => a.dueAt - b.dueAt);
  return queue;
}

// ─── SVG mini line chart ─────────────────────────────────────────────────────

interface DayPoint {
  dateLabel: string;
  correctRate: number; // 0–1
  total: number;
}

function LineChart({ points }: { points: DayPoint[] }) {
  if (points.length < 2) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-[var(--text-tertiary)]">
        Need at least 2 days of data.
      </div>
    );
  }

  const W = 500;
  const H = 160;
  const PADDING = { top: 16, right: 16, bottom: 32, left: 36 };

  const innerW = W - PADDING.left - PADDING.right;
  const innerH = H - PADDING.top - PADDING.bottom;

  const xStep = innerW / (points.length - 1);
  const toX = (i: number) => PADDING.left + i * xStep;
  const toY = (v: number) => PADDING.top + innerH - v * innerH;

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.correctRate)}`)
    .join(" ");

  const areaD =
    pathD +
    ` L ${toX(points.length - 1)} ${toY(0)} L ${toX(0)} ${toY(0)} Z`;

  // Y-axis labels
  const yLabels = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Grid lines */}
      {yLabels.map((v) => (
        <g key={v}>
          <line
            x1={PADDING.left}
            y1={toY(v)}
            x2={W - PADDING.right}
            y2={toY(v)}
            stroke="var(--border)"
            strokeWidth="1"
          />
          <text
            x={PADDING.left - 6}
            y={toY(v) + 4}
            textAnchor="end"
            fontSize="10"
            fill="var(--text-tertiary)"
          >
            {Math.round(v * 100)}%
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaD} fill="var(--accent)" fillOpacity="0.08" />

      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Dots + x-labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={toX(i)}
            cy={toY(p.correctRate)}
            r="4"
            fill="var(--accent)"
            stroke="white"
            strokeWidth="2"
          />
          {/* X label — only show every Nth to avoid overlap */}
          {(points.length <= 7 || i % Math.ceil(points.length / 7) === 0) && (
            <text
              x={toX(i)}
              y={H - PADDING.bottom + 14}
              textAnchor="middle"
              fontSize="9"
              fill="var(--text-tertiary)"
            >
              {p.dateLabel}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ─── Category bar ─────────────────────────────────────────────────────────────

function CategoryBar({
  label,
  correct,
  total,
}: {
  label: string;
  correct: number;
  total: number;
}) {
  const pct = total > 0 ? (correct / total) * 100 : 0;
  const color =
    pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-400";

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-[var(--text)]">{label}</span>
        <span className="text-xs font-semibold text-[var(--text-secondary)]">
          {correct}/{total}
        </span>
      </div>
      <div className="h-2 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
        {Math.round(pct)}% correct
      </p>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", color)}>
        <Icon size={16} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
      <p className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-[var(--text-tertiary)] mt-1">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentDashboardPage() {
  const { user, studentProfile } = useStudentAuth();
  const [attempts, setAttempts] = useState<StudentAttempt[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "done" | "error">("idle");

  useEffect(() => {
    if (!user) return;
    setLoadState("loading");
    fetchAttempts(user.uid)
      .then((a) => {
        setAttempts(a);
        setLoadState("done");
      })
      .catch(() => setLoadState("error"));
  }, [user]);

  // ── Computed stats ──────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = attempts.length;
    const correct = attempts.filter((a) => a.isCorrect).length;
    const correctRate = total > 0 ? Math.round((correct / total) * 100) : 0;

    // ── Daily chart data (last 30 days) ──────────────────────────────────────
    const dayMap = new Map<string, { correct: number; total: number }>();
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    for (const a of attempts) {
      if (a.timestamp < cutoff) continue;
      const d = new Date(a.timestamp);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      const existing = dayMap.get(label) ?? { correct: 0, total: 0 };
      existing.total++;
      if (a.isCorrect) existing.correct++;
      dayMap.set(label, existing);
    }

    // Build sorted day list
    const dayPoints: DayPoint[] = [...dayMap.entries()]
      .sort((a, b) => {
        // Sort by the actual date embedded in the label
        const [am, ad] = a[0].split("/").map(Number);
        const [bm, bd] = b[0].split("/").map(Number);
        return am !== bm ? am - bm : ad - bd;
      })
      .map(([dateLabel, { correct, total }]) => ({
        dateLabel,
        correctRate: total > 0 ? correct / total : 0,
        total,
      }));

    // ── Category breakdown ────────────────────────────────────────────────────
    const catMap = new Map<string, { correct: number; total: number }>();
    for (const a of attempts) {
      const existing = catMap.get(a.category) ?? { correct: 0, total: 0 };
      existing.total++;
      if (a.isCorrect) existing.correct++;
      catMap.set(a.category, existing);
    }
    const categories = [...catMap.entries()]
      .map(([cat, { correct, total }]) => ({
        cat,
        label: SUBJECT_LABELS[cat]?.en ?? cat,
        correct,
        total,
        rate: total > 0 ? correct / total : 0,
      }))
      .sort((a, b) => a.rate - b.rate); // weakest first

    // ── Unique exercises practiced ────────────────────────────────────────────
    const uniqueExercises = new Set(attempts.map((a) => a.exerciseId)).size;

    // ── Current streak (consecutive days with at least one attempt) ──────────
    let streak = 0;
    {
      const today = new Date();
      let d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      while (true) {
        const dayStart = d.getTime();
        const dayEnd = dayStart + 24 * 60 * 60 * 1000;
        const hasAttempt = attempts.some(
          (a) => a.timestamp >= dayStart && a.timestamp < dayEnd
        );
        if (!hasAttempt) break;
        streak++;
        d = new Date(d.getTime() - 24 * 60 * 60 * 1000);
      }
    }

    // ── Spaced repetition queue ──────────────────────────────────────────────
    const queue = computeSpacedQueue(attempts);

    return { total, correct, correctRate, dayPoints, categories, uniqueExercises, streak, queue };
  }, [attempts]);

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loadState === "loading" || loadState === "idle") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
            <BarChart2 size={14} className="text-[var(--accent)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)]">My Progress</h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Hello, {studentProfile?.displayName?.split(" ")[0] ?? "Student"} 👋
          {studentProfile?.schoolName && (
            <span className="ml-1 text-[var(--text-tertiary)]">· {studentProfile.schoolName}</span>
          )}
        </p>
      </div>

      {/* Empty state */}
      {stats.total === 0 && (
        <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-14 text-center space-y-4">
          <BookOpen size={40} className="text-[var(--text-tertiary)] mx-auto" />
          <p className="font-semibold text-[var(--text)]">No attempts yet</p>
          <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto">
            Head to Practice to attempt your first exercise. Your progress will appear here.
          </p>
          <Link
            href="/student/practice"
            className="inline-flex items-center gap-2 mt-2 h-10 px-5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <BookOpen size={14} /> Start practicing
          </Link>
        </div>
      )}

      {stats.total > 0 && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Total attempts"
              value={stats.total}
              icon={Target}
              color="bg-[var(--accent)]"
            />
            <StatCard
              label="Correct rate"
              value={`${stats.correctRate}%`}
              sub={`${stats.correct} / ${stats.total}`}
              icon={CheckCircle2}
              color={stats.correctRate >= 70 ? "bg-emerald-500" : stats.correctRate >= 50 ? "bg-amber-500" : "bg-red-400"}
            />
            <StatCard
              label="Exercises practiced"
              value={stats.uniqueExercises}
              icon={BookOpen}
              color="bg-indigo-500"
            />
            <StatCard
              label="Day streak"
              value={stats.streak}
              sub={stats.streak > 0 ? "Keep it up!" : "Practice today!"}
              icon={Flame}
              color={stats.streak > 0 ? "bg-orange-500" : "bg-slate-400"}
            />
          </div>

          {/* Correct rate over time */}
          {stats.dayPoints.length > 0 && (
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={15} className="text-[var(--accent)]" />
                <h2 className="text-sm font-bold text-[var(--text)]">Correct rate over time</h2>
                <span className="text-[10px] text-[var(--text-tertiary)] ml-auto">Last 30 days</span>
              </div>
              <div className="h-[160px]">
                <LineChart points={stats.dayPoints} />
              </div>
            </div>
          )}

          {/* Weak topics */}
          {stats.categories.length > 0 && (
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
              <div className="flex items-center gap-2 mb-5">
                <BarChart2 size={15} className="text-[var(--accent)]" />
                <h2 className="text-sm font-bold text-[var(--text)]">Performance by subject</h2>
                <span className="text-[10px] text-[var(--text-tertiary)] ml-auto">Weakest first</span>
              </div>
              <div className="space-y-4">
                {stats.categories.map(({ cat, label, correct, total }) => (
                  <CategoryBar key={cat} label={label} correct={correct} total={total} />
                ))}
              </div>
            </div>
          )}

          {/* Spaced repetition queue */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock size={15} className="text-[var(--accent)]" />
              <h2 className="text-sm font-bold text-[var(--text)]">Review queue</h2>
              <span className="text-[10px] text-[var(--text-tertiary)] ml-auto">
                {stats.queue.length} exercise{stats.queue.length !== 1 ? "s" : ""} due
              </span>
            </div>

            {stats.queue.length === 0 ? (
              <div className="flex items-center gap-3 py-4">
                <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                <p className="text-sm text-[var(--text-secondary)]">
                  You&apos;re all caught up! Come back tomorrow.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.queue.slice(0, 8).map((item) => {
                  const isOverdue = item.dueAt <= Date.now();
                  const subjectLabel =
                    SUBJECT_LABELS[item.category]?.en ?? item.category;
                  return (
                    <Link
                      key={item.exerciseId}
                      href="/student/practice"
                      className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-light)] transition-all group"
                    >
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold",
                          item.streak === 0
                            ? "bg-red-100 text-red-600"
                            : "bg-amber-100 text-amber-600"
                        )}
                      >
                        {item.streak > 0 ? `×${item.streak}` : "!"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[var(--text)] font-medium truncate">
                          {item.exerciseTitle || "Exercise"}
                        </p>
                        <p className="text-[10px] text-[var(--text-tertiary)]">
                          {subjectLabel} ·{" "}
                          {isOverdue
                            ? "Due now"
                            : `Due ${new Date(item.dueAt).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}`}
                        </p>
                      </div>
                      {isOverdue && (
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-wide bg-red-50 px-1.5 py-0.5 rounded flex-shrink-0">
                          Overdue
                        </span>
                      )}
                    </Link>
                  );
                })}
                {stats.queue.length > 8 && (
                  <p className="text-xs text-center text-[var(--text-tertiary)] pt-1">
                    +{stats.queue.length - 8} more
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Attempts summary table (last 10) */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="flex items-center gap-2 p-5 border-b border-[var(--border)]">
              <h2 className="text-sm font-bold text-[var(--text)]">Recent attempts</h2>
              <span className="text-[10px] text-[var(--text-tertiary)] ml-auto">Last 10</span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {[...attempts]
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 10)
                .map((a) => {
                  const subjectLabel =
                    SUBJECT_LABELS[a.category]?.en ?? a.category;
                  const d = new Date(a.timestamp);
                  const dateStr = d.toLocaleDateString("en-GB", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-[var(--bg-subtle)] transition-colors"
                    >
                      {a.isCorrect ? (
                        <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle size={14} className="text-red-400 flex-shrink-0" />
                      )}
                      <span className="flex-1 text-[var(--text)] text-xs truncate">
                        {(a.exerciseTitle || "Exercise").slice(0, 60)}
                        {(a.exerciseTitle || "").length > 60 ? "…" : ""}
                      </span>
                      <span className="text-[10px] text-[var(--text-tertiary)] flex-shrink-0">
                        {subjectLabel}
                      </span>
                      <span className="text-[10px] text-[var(--text-tertiary)] flex-shrink-0 hidden sm:block">
                        {dateStr}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
