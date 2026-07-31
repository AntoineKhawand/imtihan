"use client";

import { useEffect, useState } from "react";
import {
  collection, query, where, getDocs, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { cn, SUBJECT_LABELS, formatDate } from "@/lib/utils";
import {
  Users, Search, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, BookOpen, Clock, BarChart2,
} from "lucide-react";
import type { StudentProfile, StudentAttempt } from "@/types/student";

// ── Types ──────────────────────────────────────────────────────────────────────

interface StudentRow {
  profile: StudentProfile;
  totalAttempts: number;
  correctCount: number;
  lastActive: number;
  bySubject: Record<string, { total: number; correct: number }>;
}

// ── Firestore helpers ──────────────────────────────────────────────────────────

async function fetchStudentProfiles(schoolName?: string): Promise<StudentProfile[]> {
  if (!db) return [];
  try {
    const ref = collection(db, "student_profiles");
    const q = schoolName
      ? query(ref, where("schoolName", "==", schoolName), orderBy("createdAt", "desc"))
      : query(ref, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data() } as StudentProfile));
  } catch (err) {
    console.error("[students] fetchStudentProfiles:", err);
    return [];
  }
}

async function fetchAttemptsForStudent(userId: string): Promise<StudentAttempt[]> {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "student_attempts"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        timestamp:
          typeof data.timestamp === "number"
            ? data.timestamp
            : (data.timestamp?.toMillis?.() ?? 0),
      } as StudentAttempt;
    });
  } catch {
    return [];
  }
}

// ── Subject breakdown sub-component ───────────────────────────────────────────

function SubjectBreakdown({ bySubject }: { bySubject: Record<string, { total: number; correct: number }> }) {
  const subjects = Object.entries(bySubject).sort((a, b) => b[1].total - a[1].total);
  if (subjects.length === 0) return (
    <p className="text-xs text-[var(--text-tertiary)] py-2">No attempts yet.</p>
  );
  return (
    <div className="mt-3 space-y-2">
      {subjects.map(([subject, stats]) => {
        const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
        const label = SUBJECT_LABELS[subject]?.en ?? subject;
        return (
          <div key={subject}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[var(--text)] capitalize">{label}</span>
              <span className="text-[10px] text-[var(--text-tertiary)]">
                {stats.correct}/{stats.total} correct · {pct}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-400"
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── StudentCard ────────────────────────────────────────────────────────────────

function StudentCard({ row }: { row: StudentRow }) {
  const [expanded, setExpanded] = useState(false);
  const pct = row.totalAttempts > 0 ? Math.round((row.correctCount / row.totalAttempts) * 100) : 0;

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-center gap-4 hover:bg-[var(--bg-subtle)] transition-colors group"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0 text-[var(--accent)] font-bold text-sm">
          {(row.profile.displayName ?? "?")[0].toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--text)] truncate">{row.profile.displayName ?? "Unknown"}</p>
          <p className="text-xs text-[var(--text-tertiary)] truncate">{row.profile.email}</p>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-6 text-xs text-[var(--text-secondary)] mr-2">
          <span className="flex items-center gap-1">
            <BookOpen size={11} className="text-[var(--accent)]" />
            {row.totalAttempts} attempts
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={11} className="text-emerald-500" />
            {row.correctCount} correct
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {row.lastActive > 0 ? formatDate(row.lastActive) : "Never"}
          </span>
          <span className={cn(
            "font-bold px-2 py-0.5 rounded-full text-[10px]",
            pct >= 70 ? "bg-emerald-50 text-emerald-700" : pct >= 40 ? "bg-amber-50 text-amber-700" : row.totalAttempts === 0 ? "bg-[var(--bg-subtle)] text-[var(--text-tertiary)]" : "bg-red-50 text-red-600"
          )}>
            {row.totalAttempts === 0 ? "—" : `${pct}%`}
          </span>
        </div>

        <div className="text-[var(--text-tertiary)] group-hover:text-[var(--text)] transition-colors">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-subtle)]/50 px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={13} className="text-[var(--accent)]" />
            <p className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
              Per-Subject Performance
            </p>
          </div>
          <SubjectBreakdown bySubject={row.bySubject} />

          {/* Mobile stats */}
          <div className="sm:hidden mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-4 text-xs text-[var(--text-secondary)]">
            <span>{row.totalAttempts} attempts</span>
            <span>{row.correctCount} correct</span>
            <span>{row.lastActive > 0 ? formatDate(row.lastActive) : "Never"}</span>
            <span className="font-bold">{row.totalAttempts === 0 ? "—" : `${pct}%`}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function StudentsPage() {
  const { profile } = useAuth();
  const teacherSchool = profile?.school ?? "";

  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function load() {
      setLoading(true);
      try {
        const profiles = await fetchStudentProfiles(teacherSchool || undefined);

        const rowData: StudentRow[] = await Promise.all(
          profiles.map(async (p) => {
            const attempts = await fetchAttemptsForStudent(p.uid);
            const bySubject: Record<string, { total: number; correct: number }> = {};
            for (const a of attempts) {
              if (!bySubject[a.category]) bySubject[a.category] = { total: 0, correct: 0 };
              bySubject[a.category].total++;
              if (a.isCorrect) bySubject[a.category].correct++;
            }
            const timestamps = attempts.map((a) => a.timestamp as number).filter(Boolean);
            return {
              profile: p,
              totalAttempts: attempts.length,
              correctCount: attempts.filter((a) => a.isCorrect).length,
              lastActive: timestamps.length > 0 ? Math.max(...timestamps) : 0,
              bySubject,
            };
          })
        );

        setRows(rowData.sort((a, b) => b.lastActive - a.lastActive));
      } catch (err) {
        console.error("[students] load error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [mounted, teacherSchool]);

  const filtered = searchQuery.trim()
    ? rows.filter((r) => {
        const q = searchQuery.toLowerCase();
        return (
          (r.profile.displayName ?? "").toLowerCase().includes(q) ||
          (r.profile.email ?? "").toLowerCase().includes(q)
        );
      })
    : rows;

  if (!mounted) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-10 py-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
              <Users size={14} className="text-[var(--accent)]" />
            </div>
            <h1 className="serif text-display-lg text-[var(--text)]">Students</h1>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">
            {teacherSchool
              ? `Students registered at ${teacherSchool}.`
              : "All registered students."}
            {!loading && ` ${rows.length} student${rows.length !== 1 ? "s" : ""} found.`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      {/* Stats summary */}
      {rows.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total students", value: rows.length },
            { label: "Total attempts", value: rows.reduce((s, r) => s + r.totalAttempts, 0) },
            {
              label: "Avg. accuracy",
              value: (() => {
                const totalA = rows.reduce((s, r) => s + r.totalAttempts, 0);
                const totalC = rows.reduce((s, r) => s + r.correctCount, 0);
                return totalA > 0 ? `${Math.round((totalC / totalA) * 100)}%` : "—";
              })(),
            },
          ].map((stat) => (
            <div key={stat.label} className="card p-4 text-center">
              <div className="serif text-2xl font-light text-[var(--accent)] mb-0.5 tabular-nums">{stat.value}</div>
              <div className="text-xs text-[var(--text-tertiary)]">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4 opacity-50">
          <div className="w-7 h-7 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <p className="text-sm text-[var(--text-secondary)]">Loading students…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="card p-14 flex flex-col items-center justify-center text-center opacity-60">
          <Users size={32} className="text-[var(--text-tertiary)] mb-4" />
          <p className="font-medium text-[var(--text)] mb-1">No students yet</p>
          <p className="text-sm text-[var(--text-secondary)]">
            {teacherSchool
              ? `Students who register with school "${teacherSchool}" will appear here.`
              : "Students will appear here once they register."}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 flex flex-col items-center justify-center text-center opacity-60">
          <Search size={24} className="text-[var(--text-tertiary)] mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">No students match your search.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((row) => (
            <StudentCard key={row.profile.uid} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}
