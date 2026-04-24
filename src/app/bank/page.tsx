"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Bookmark, Trash2, BookOpen, Award, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { renderContent } from "@/lib/renderContent";
import { cn, SUBJECT_LABELS, formatDate } from "@/lib/utils";
import { getBankExercises, removeFromBank, type BankExercise } from "@/lib/storage";
import { UserNav } from "@/components/layout/UserNav";

const DIFFICULTY_CONFIG = {
  easy:   { label: "Easy",   color: "text-emerald-600 bg-emerald-50", dot: "bg-emerald-500" },
  medium: { label: "Medium", color: "text-amber-600 bg-amber-50",     dot: "bg-amber-500"   },
  hard:   { label: "Hard",   color: "text-red-600 bg-red-50",         dot: "bg-red-500"     },
};

export default function BankPage() {
  const [entries, setEntries] = useState<BankExercise[]>([]);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEntries(getBankExercises());
    setMounted(true);
  }, []);

  function handleRemove(id: string) {
    removeFromBank(id);
    setEntries((prev) => prev.filter((b) => b.id !== id));
  }

  const filtered = entries.filter((b) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      (SUBJECT_LABELS[b.subject]?.fr ?? b.subject).toLowerCase().includes(q) ||
      b.exercise.statement.toLowerCase().includes(q) ||
      b.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white font-serif text-xs">إ</span>
          </div>
          <span className="font-semibold text-[var(--text)] text-sm tracking-tight">Imtihan</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/create">
            <Button size="sm" icon={<Plus size={13} />}>New exam</Button>
          </Link>
          <UserNav />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 md:px-10 py-12">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
                <Bookmark size={14} className="text-[var(--accent)]" />
              </div>
              <h1 className="serif text-display-lg text-[var(--text)]">Question Bank</h1>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">
              {entries.length} saved question{entries.length !== 1 ? "s" : ""} — bookmark the best ones from any generated exam.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by subject, chapter, keywords…"
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        {/* Empty state */}
        {entries.length === 0 && (
          <div className="card p-14 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center mb-5">
              <Bookmark size={24} className="text-[var(--accent)]" />
            </div>
            <h2 className="serif text-xl text-[var(--text)] mb-2">Your bank is empty</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-xs">
              When generating an exam, click the ⚡ menu on any exercise and choose <strong>Save to bank</strong>.
            </p>
            <Link href="/create">
              <Button icon={<Plus size={14} />}>Generate an exam</Button>
            </Link>
          </div>
        )}

        {/* No results */}
        {entries.length > 0 && filtered.length === 0 && (
          <div className="card p-10 flex flex-col items-center text-center">
            <Search size={20} className="text-[var(--text-tertiary)] mb-3" />
            <p className="text-sm font-medium text-[var(--text)]">No matches for &quot;{query}&quot;</p>
          </div>
        )}

        {/* Questions list */}
        {filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((entry) => (
              <BankCard key={entry.id} entry={entry} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function BankCard({ entry, onRemove }: { entry: BankExercise; onRemove: (id: string) => void }) {
  const [showSolution, setShowSolution] = useState(false);
  const ex = entry.exercise;
  const diff = DIFFICULTY_CONFIG[ex.difficulty];
  const subjectLabel = SUBJECT_LABELS[entry.subject]?.fr ?? entry.subject;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[var(--text-secondary)]">{subjectLabel}</span>
            <span className="text-xs text-[var(--text-tertiary)]">·</span>
            <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium", diff.color)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", diff.dot)} />
              {diff.label}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
              <Award size={10} /> {ex.points} pts
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
              <Clock size={10} /> ~{ex.estimatedMinutes} min
            </span>
          </div>
          <button
            onClick={() => onRemove(entry.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-red-50 transition-colors flex-shrink-0"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Statement */}
        <div
          className="text-sm text-[var(--text)] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderContent(ex.statement) }}
        />

        {/* Sub-questions */}
        {ex.subQuestions && ex.subQuestions.length > 0 && (
          <div className="mt-3 space-y-2">
            {ex.subQuestions.map((sq) => (
              <div key={sq.label} className="flex gap-2.5">
                <span className="text-sm font-semibold text-[var(--accent)] flex-shrink-0 w-6">{sq.label}</span>
                <div className="flex-1">
                  <span
                    className="text-sm text-[var(--text)] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderContent(sq.statement) }}
                  />
                  <span className="ml-1.5 text-xs text-[var(--text-tertiary)]">({sq.points} pts)</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {entry.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-tertiary)] border border-[var(--border)]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Corrigé toggle */}
      <div className="border-t border-[var(--border)]">
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="w-full flex items-center gap-2 px-5 py-2.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-colors"
        >
          <BookOpen size={12} />
          <span className="flex-1 text-left font-medium">Corrigé</span>
          {showSolution ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {showSolution && (
          <div className="px-5 pb-4 pt-3 space-y-3 bg-[var(--bg-subtle)]">
            <div>
              <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-1">Answer</p>
              <div className="text-sm text-[var(--text)] font-medium" dangerouslySetInnerHTML={{ __html: renderContent(ex.solution.finalAnswer) }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Methodology</p>
              <div className="text-sm text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: renderContent(ex.solution.methodology) }} />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-3 pt-1">
        <p className="text-[10px] text-[var(--text-tertiary)]">Saved {formatDate(entry.savedAt)}</p>
      </div>
    </div>
  );
}
