"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, BookOpen, Clock, Award, Search, Sparkles, FileText, Copy, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, formatDate, SUBJECT_LABELS } from "@/lib/utils";
import { FREE_EXAM_LIMIT } from "@/lib/utils";

// Stub data — replace with Firestore in production
const STUB_EXAMS = [
  {
    id: "1",
    title: "Physique — Terminale S",
    subject: "physics",
    curriculum: "Bac Libanais",
    level: "terminale-s",
    exerciseCount: 3,
    totalPoints: 20,
    duration: 120,
    language: "french",
    createdAt: Date.now() - 86400000,
    difficulty: { easy: 1, medium: 1, hard: 1 },
  },
  {
    id: "2",
    title: "Mathématiques — Première",
    subject: "mathematics",
    curriculum: "Bac Français",
    level: "premiere-fr",
    exerciseCount: 4,
    totalPoints: 20,
    duration: 60,
    language: "french",
    createdAt: Date.now() - 86400000 * 3,
    difficulty: { easy: 1, medium: 2, hard: 1 },
  },
  {
    id: "3",
    title: "IB Chemistry HL — Organic",
    subject: "chemistry",
    curriculum: "IB Diploma",
    level: "dp-hl",
    exerciseCount: 5,
    totalPoints: 50,
    duration: 90,
    language: "english",
    createdAt: Date.now() - 86400000 * 7,
    difficulty: { easy: 1, medium: 2, hard: 2 },
  },
];

const SUBJECT_ICONS: Record<string, string> = {
  physics: "⚛",
  mathematics: "∑",
  chemistry: "⚗",
  biology: "🧬",
  philosophy: "💭",
  history: "📜",
  english: "📖",
  french: "📝",
};

export default function DashboardPage() {
  const [query, setQuery] = useState("");

  const examsGenerated = STUB_EXAMS.length;
  const isFreeTier = true;
  const quotaUsed = examsGenerated;
  const quotaRemaining = Math.max(0, FREE_EXAM_LIMIT - quotaUsed);

  const filtered = STUB_EXAMS.filter((e) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.curriculum.toLowerCase().includes(q) ||
      (SUBJECT_LABELS[e.subject]?.fr ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white font-serif text-xs">إ</span>
          </div>
          <span className="font-semibold text-[var(--text)] text-sm tracking-tight">Imtihan</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/create">
            <Button size="sm" icon={<Plus size={13} />}>New exam</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 md:px-10 py-12">

        {/* Header */}
        <div className="mb-8">
          <h1 className="serif text-display-lg text-[var(--text)] mb-1">My Library</h1>
          <p className="text-[var(--text-secondary)] text-sm">Your generated exams, ready to download anytime.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Exams created", value: examsGenerated },
            { label: "Total exercises", value: STUB_EXAMS.reduce((s, e) => s + e.exerciseCount, 0) },
            { label: "Hours saved", value: Math.round(examsGenerated * 1.5) },
          ].map((stat) => (
            <div key={stat.label} className="card p-4 text-center">
              <div className="serif text-2xl font-light text-[var(--accent)] mb-0.5 tabular-nums">{stat.value}</div>
              <div className="text-xs text-[var(--text-tertiary)]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Free tier quota */}
        {isFreeTier && (
          <div className="card p-4 mb-6 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text)] mb-2">
                Free plan — <span className="text-[var(--accent)]">{quotaRemaining} exam{quotaRemaining !== 1 ? "s" : ""}</span> remaining
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-[var(--border)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all"
                    style={{ width: `${(quotaUsed / FREE_EXAM_LIMIT) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--text-tertiary)] tabular-nums flex-shrink-0">{quotaUsed}/{FREE_EXAM_LIMIT}</span>
              </div>
            </div>
            <Button variant="secondary" size="sm">Upgrade to Pro</Button>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-5">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by subject, curriculum, title…"
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        {/* Exam list */}
        {filtered.length === 0 && query ? (
          <div className="card p-10 flex flex-col items-center justify-center text-center">
            <Search size={24} className="text-[var(--text-tertiary)] mb-3" />
            <p className="font-medium text-[var(--text)] mb-1">No results for &quot;{query}&quot;</p>
            <p className="text-sm text-[var(--text-secondary)]">Try a different subject or curriculum name.</p>
          </div>
        ) : STUB_EXAMS.length === 0 ? (
          <div className="card p-14 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center mb-5">
              <Sparkles size={24} className="text-[var(--accent)]" />
            </div>
            <h2 className="serif text-xl text-[var(--text)] mb-2">No exams yet</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-xs">
              Describe your first exam in plain language and Imtihan will generate it in seconds.
            </p>
            <Link href="/create">
              <Button icon={<Plus size={14} />}>Create your first exam</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((exam) => (
              <ExamRow key={exam.id} exam={exam} />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

function ExamRow({ exam }: { exam: typeof STUB_EXAMS[0] }) {
  const [open, setOpen] = useState(false);
  const icon = SUBJECT_ICONS[exam.subject] ?? "📄";
  const totalDiff = exam.difficulty.easy + exam.difficulty.medium + exam.difficulty.hard;

  return (
    <div className="card overflow-hidden">
      {/* Main row */}
      <div className="flex items-center gap-4 p-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0 text-lg">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--text)] truncate">{exam.title}</p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-xs text-[var(--text-tertiary)]">{exam.curriculum}</span>
            <span className="text-xs text-[var(--text-tertiary)]">·</span>
            <span className="text-xs text-[var(--text-tertiary)] inline-flex items-center gap-1">
              <Award size={10} /> {exam.totalPoints} pts
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">·</span>
            <span className="text-xs text-[var(--text-tertiary)] inline-flex items-center gap-1">
              <Clock size={10} /> {formatDate(exam.createdAt)}
            </span>
          </div>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0",
            open ? "bg-[var(--bg-subtle)] text-[var(--text)] rotate-90" : "text-[var(--text-tertiary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)]"
          )}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Expanded details */}
      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-subtle)] p-4 space-y-4">
          {/* Difficulty bar */}
          <div>
            <p className="text-xs text-[var(--text-tertiary)] mb-2">Difficulty breakdown</p>
            <div className="flex h-2 rounded-full overflow-hidden gap-px mb-1.5">
              {exam.difficulty.easy > 0 && (
                <div className="bg-emerald-500" style={{ width: `${(exam.difficulty.easy / totalDiff) * 100}%` }} />
              )}
              {exam.difficulty.medium > 0 && (
                <div className="bg-amber-500" style={{ width: `${(exam.difficulty.medium / totalDiff) * 100}%` }} />
              )}
              {exam.difficulty.hard > 0 && (
                <div className="bg-red-500" style={{ width: `${(exam.difficulty.hard / totalDiff) * 100}%` }} />
              )}
            </div>
            <div className="flex gap-3 text-[11px] text-[var(--text-tertiary)]">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{exam.difficulty.easy} easy</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{exam.difficulty.medium} medium</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{exam.difficulty.hard} hard</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text)] transition-colors">
              <FileText size={11} /> Download Word
            </button>
            <button className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text)] transition-colors">
              <FileText size={11} /> Download PDF
            </button>
            <button className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text)] transition-colors">
              <Copy size={11} /> Duplicate
            </button>
            <button className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors ml-auto">
              <Trash2 size={11} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
