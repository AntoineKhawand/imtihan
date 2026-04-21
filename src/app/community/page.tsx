"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Users, Heart, Download, BookOpen, Eye, X, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, SUBJECT_LABELS } from "@/lib/utils";

// ─── Featured / example community exams ────────────────────────────────────
// In a real deployment these would come from a Supabase table.
const FEATURED_EXAMS = [
  {
    id: "f1",
    title: "Physique — Mécanique et Électromagnétisme",
    subject: "physics",
    curriculum: "Bac Libanais",
    level: "Terminale S",
    language: "Français",
    exerciseCount: 3,
    totalPoints: 20,
    duration: 120,
    difficulty: { easy: 1, medium: 1, hard: 1 },
    author: "M. Sami Khoury",
    school: "Lycée Verdun International",
    likes: 47,
    downloads: 124,
    tags: ["mécanique", "électromagnétisme", "loi d'Ohm"],
    preview: "Exercice 1 — Un corps de masse m = 2 kg est lancé sur un plan incliné à θ = 30°...",
  },
  {
    id: "f2",
    title: "IB Chemistry HL — Organic & Equilibria",
    subject: "chemistry",
    curriculum: "IB Diploma",
    level: "DP Year 2 (HL)",
    language: "English",
    exerciseCount: 4,
    totalPoints: 50,
    duration: 90,
    difficulty: { easy: 1, medium: 2, hard: 1 },
    author: "Ms. Lara Abi Nader",
    school: "International College Beirut",
    likes: 82,
    downloads: 203,
    tags: ["organic chemistry", "equilibria", "SN2", "Le Chatelier"],
    preview: "Q1 — Draw the structural formula of 2-methylpropan-1-ol and classify it as primary, secondary, or tertiary...",
  },
  {
    id: "f3",
    title: "Mathématiques — Analyse et Fonctions",
    subject: "mathematics",
    curriculum: "Bac Français",
    level: "Première",
    language: "Français",
    exerciseCount: 4,
    totalPoints: 20,
    duration: 60,
    difficulty: { easy: 1, medium: 2, hard: 1 },
    author: "Mme. Hana Mansour",
    school: "Collège des Frères",
    likes: 61,
    downloads: 178,
    tags: ["dérivation", "fonctions", "limites", "tableau de variation"],
    preview: "Exercice 1 — Soit f(x) = x³ − 3x + 2. Calculer f′(x) et dresser le tableau de variation...",
  },
  {
    id: "f4",
    title: "Histoire — Première Guerre Mondiale",
    subject: "history",
    curriculum: "Bac Libanais",
    level: "Troisième",
    language: "Français",
    exerciseCount: 2,
    totalPoints: 20,
    duration: 90,
    difficulty: { easy: 0, medium: 1, hard: 1 },
    author: "M. Georges Rahme",
    school: "Lycée des Cèdres",
    likes: 29,
    downloads: 87,
    tags: ["WWI", "traité de Versailles", "totalitarisme"],
    preview: "Sujet 1 — Analysez les causes principales de la Première Guerre Mondiale en vous appuyant sur les documents...",
  },
  {
    id: "f5",
    title: "Biology HL — Cell Division & Genetics",
    subject: "biology",
    curriculum: "IB Diploma",
    level: "DP Year 1 (HL)",
    language: "English",
    exerciseCount: 3,
    totalPoints: 30,
    duration: 60,
    difficulty: { easy: 1, medium: 1, hard: 1 },
    author: "Dr. Maya Frem",
    school: "Wellspring Learning Community",
    likes: 55,
    downloads: 142,
    tags: ["mitosis", "meiosis", "Mendelian genetics", "inheritance"],
    preview: "Q1 — Describe the stages of mitosis using annotated diagrams. Include the key events in each phase...",
  },
  {
    id: "f6",
    title: "Philosophie — Conscience et Liberté",
    subject: "philosophy",
    curriculum: "Bac Libanais",
    level: "Terminale L",
    language: "Français",
    exerciseCount: 2,
    totalPoints: 20,
    duration: 180,
    difficulty: { easy: 0, medium: 1, hard: 1 },
    author: "Prof. Antoine Gemayel",
    school: "Université Saint-Joseph",
    likes: 38,
    downloads: 96,
    tags: ["conscience", "liberté", "Sartre", "Descartes"],
    preview: "Dissertation — Peut-on être libre sans en avoir conscience ? Vous développerez votre réflexion...",
  },
];

const SUBJECT_ICONS: Record<string, string> = {
  physics: "⚛", mathematics: "∑", chemistry: "⚗", biology: "🧬",
  philosophy: "💭", history: "📜", english: "📖", french: "📝",
  arabic: "ع", informatics: "💻", economics: "📈", svt: "🌿",
};

type SortKey = "popular" | "recent" | "downloads";

export default function CommunityPage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const filtered = FEATURED_EXAMS.filter((e) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.curriculum.toLowerCase().includes(q) ||
      e.subject.toLowerCase().includes(q) ||
      (SUBJECT_LABELS[e.subject]?.fr ?? "").toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }).sort((a, b) => {
    if (sort === "popular") return b.likes - a.likes;
    if (sort === "downloads") return b.downloads - a.downloads;
    return 0; // "recent" keeps original order
  });

  function toggleLike(id: string) {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const previewExam = previewId ? FEATURED_EXAMS.find((e) => e.id === previewId) : null;

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
        <Link href="/create">
          <Button size="sm" icon={<Plus size={13} />}>New exam</Button>
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 md:px-10 py-12">

        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent)]/20 text-xs font-medium text-[var(--accent)] mb-5">
            <Users size={12} />
            Community exams
          </div>
          <h1 className="serif text-display-xl text-[var(--text)] mb-3 text-balance">
            Browse exams from the community
          </h1>
          <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto leading-relaxed">
            Exams shared by teachers across Lebanon and beyond. Use them as inspiration, adapt them, or generate a similar one in seconds.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { value: "120+", label: "Shared exams" },
            { value: "850+", label: "Downloads" },
            { value: "4 curricula", label: "Covered" },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <div className="serif text-2xl font-light text-[var(--accent)] mb-0.5">{s.value}</div>
              <div className="text-xs text-[var(--text-tertiary)]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Share your exam CTA */}
        <ShareCTA />

        {/* Search & sort */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by subject, curriculum, keywords…"
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
          <div className="flex gap-1 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl p-1">
            {(["popular", "recent", "downloads"] as SortKey[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg capitalize transition-colors",
                  sort === s
                    ? "bg-[var(--surface)] text-[var(--text)] font-medium shadow-sm"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Exams grid */}
        {filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <Search size={20} className="text-[var(--text-tertiary)] mx-auto mb-3" />
            <p className="text-sm font-medium text-[var(--text)]">No exams match &quot;{query}&quot;</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((exam) => {
              const liked = likedIds.has(exam.id);
              const totalDiff = exam.difficulty.easy + exam.difficulty.medium + exam.difficulty.hard;
              const icon = SUBJECT_ICONS[exam.subject] ?? "📄";

              return (
                <div key={exam.id} className="card overflow-hidden flex flex-col">
                  {/* Card header */}
                  <div className="p-5 flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0 text-xl">
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[var(--text)] text-sm leading-tight mb-1 line-clamp-2">{exam.title}</p>
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-[var(--text-tertiary)]">
                          <span>{exam.curriculum}</span>
                          <span>·</span>
                          <span>{exam.level}</span>
                          <span>·</span>
                          <span>{exam.language}</span>
                        </div>
                      </div>
                    </div>

                    {/* Difficulty bar */}
                    <div className="flex h-1.5 rounded-full overflow-hidden gap-px mb-3">
                      {exam.difficulty.easy > 0 && <div className="bg-emerald-500" style={{ width: `${(exam.difficulty.easy / totalDiff) * 100}%` }} />}
                      {exam.difficulty.medium > 0 && <div className="bg-amber-500" style={{ width: `${(exam.difficulty.medium / totalDiff) * 100}%` }} />}
                      {exam.difficulty.hard > 0 && <div className="bg-red-500" style={{ width: `${(exam.difficulty.hard / totalDiff) * 100}%` }} />}
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-3 text-xs text-[var(--text-secondary)] mb-3">
                      <span>{exam.exerciseCount} exercises</span>
                      <span>·</span>
                      <span>{exam.totalPoints} pts</span>
                      <span>·</span>
                      <span>{exam.duration} min</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {exam.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-tertiary)] border border-[var(--border)]">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Author */}
                    <p className="text-xs text-[var(--text-tertiary)]">
                      by <span className="text-[var(--text-secondary)] font-medium">{exam.author}</span>
                      {exam.school && <> · {exam.school}</>}
                    </p>
                  </div>

                  {/* Card footer */}
                  <div className="border-t border-[var(--border)] px-5 py-3 flex items-center gap-2">
                    {/* Like */}
                    <button
                      onClick={() => toggleLike(exam.id)}
                      className={cn(
                        "inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors",
                        liked
                          ? "text-red-500 bg-red-50"
                          : "text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50"
                      )}
                    >
                      <Heart size={11} className={liked ? "fill-current" : ""} />
                      {exam.likes + (liked ? 1 : 0)}
                    </button>

                    {/* Downloads count */}
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                      <Download size={11} />
                      {exam.downloads}
                    </span>

                    <div className="flex-1" />

                    {/* Preview */}
                    <button
                      onClick={() => setPreviewId(exam.id)}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text)] transition-colors"
                    >
                      <Eye size={11} />
                      Preview
                    </button>

                    {/* Use as inspiration */}
                    <Link
                      href={`/create?inspiration=${exam.id}`}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
                    >
                      <BookOpen size={11} />
                      Use
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Preview modal */}
      {previewExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPreviewId(null)} />
          <div className="relative w-full max-w-lg bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <h3 className="font-semibold text-[var(--text)] text-sm">{previewExam.title}</h3>
              <button
                onClick={() => setPreviewId(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Preview</p>
              <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
                <p className="text-sm text-[var(--text)] leading-relaxed italic">&quot;{previewExam.preview}&quot;</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-[var(--text-secondary)]">
                <div><span className="text-[var(--text-tertiary)]">Author</span><br /><span className="font-medium text-[var(--text)]">{previewExam.author}</span></div>
                <div><span className="text-[var(--text-tertiary)]">School</span><br /><span className="font-medium text-[var(--text)]">{previewExam.school}</span></div>
                <div><span className="text-[var(--text-tertiary)]">Curriculum</span><br /><span className="font-medium text-[var(--text)]">{previewExam.curriculum}</span></div>
                <div><span className="text-[var(--text-tertiary)]">Duration</span><br /><span className="font-medium text-[var(--text)]">{previewExam.duration} min · {previewExam.totalPoints} pts</span></div>
              </div>
              <Link
                href={`/create?inspiration=${previewExam.id}`}
                onClick={() => setPreviewId(null)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
              >
                <BookOpen size={14} />
                Use as inspiration
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Share CTA component ─────────────────────────────────────────────────────

function ShareCTA() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyEmail() {
    navigator.clipboard.writeText("share@imtihan.app").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="card p-5 mb-8 border-dashed">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0">
            <Users size={15} className="text-[var(--accent)]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[var(--text)]">Share your exam with the community</p>
            <p className="text-xs text-[var(--text-secondary)]">Help other teachers — your exams can inspire hundreds.</p>
          </div>
        </div>
        <Plus size={14} className={cn("text-[var(--text-tertiary)] flex-shrink-0 transition-transform duration-200", open && "rotate-45")} />
      </button>

      {open && (
        <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-3">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            To share an exam, send it to us and we&apos;ll review it before publishing. We&apos;ll display your name and school (optional).
          </p>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
            <p className="flex-1 text-sm font-medium text-[var(--text)]">share@imtihan.app</p>
            <button
              onClick={copyEmail}
              className={cn(
                "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors",
                copied
                  ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-light)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              )}
            >
              {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            Attach your .docx file and include your name, school, and subject. All content is reviewed before publishing.
          </p>
        </div>
      )}
    </div>
  );
}
