"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Users, Heart, Download, BookOpen, Eye, X, Copy, CheckCircle2, Send, FileText, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { cn, SUBJECT_LABELS } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { isProActive } from "@/lib/subscription";
import { UserNav } from "@/components/layout/UserNav";
import { FEATURED_EXAMS } from "@/data/communityExams";
import { renderContent } from "@/lib/renderContent";
import { useRouter } from "next/navigation";

const SUBJECT_ICONS: Record<string, string> = {
  physics: "fa-solid fa-atom",
  physique: "fa-solid fa-atom",
  mathematics: "fa-solid fa-square-root-variable",
  mathématiques: "fa-solid fa-square-root-variable",
  maths: "fa-solid fa-square-root-variable",
  chemistry: "fa-solid fa-flask-vial",
  chimie: "fa-solid fa-flask-vial",
  biology: "fa-solid fa-dna",
  biologie: "fa-solid fa-dna",
  philosophy: "fa-solid fa-brain",
  philosophie: "fa-solid fa-brain",
  history: "fa-solid fa-scroll",
  histoire: "fa-solid fa-scroll",
  english: "fa-solid fa-language",
  anglais: "fa-solid fa-language",
  french: "fa-solid fa-pen-nib",
  français: "fa-solid fa-pen-nib",
  arabic: "fa-solid fa-font",
  arabe: "fa-solid fa-font",
  informatics: "fa-solid fa-laptop-code",
  informatique: "fa-solid fa-laptop-code",
  economics: "fa-solid fa-chart-line",
  économie: "fa-solid fa-chart-line",
  svt: "fa-solid fa-leaf",
  geography: "fa-solid fa-earth-americas",
  géographie: "fa-solid fa-earth-americas",
  accounting: "fa-solid fa-file-invoice-dollar",
  comptabilité: "fa-solid fa-file-invoice-dollar",
  management: "fa-solid fa-chart-bar",
  law: "fa-solid fa-scale-balanced",
};

const CURRICULUM_LABELS: Record<string, string> = {
  "bac-libanais": "Bac Libanais",
  "bac-francais": "Bac Français",
  "ib": "IB",
  "university": "Université",
};

type SortKey = "popular" | "recent" | "downloads";

export default function CommunityPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadStats, setDownloadStats] = useState<Record<string, number>>(() =>
    Object.fromEntries(FEATURED_EXAMS.map((e) => [e.id, e.downloads]))
  );

  const filtered = FEATURED_EXAMS.filter((e) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const subject = e.subject ?? e.context.subject;
    return (
      e.title.toLowerCase().includes(q) ||
      (e.curriculum ?? e.context.curriculumId).toLowerCase().includes(q) ||
      subject.toLowerCase().includes(q) ||
      (SUBJECT_LABELS[subject]?.fr ?? "").toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }).sort((a, b) => {
    if (sort === "popular") return b.likes - a.likes;
    if (sort === "downloads") return downloadStats[b.id] - downloadStats[a.id];
    return 0;
  });

  function toggleLike(id: string) {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleDownload(exam: typeof FEATURED_EXAMS[0]) {
    setDownloadingId(exam.id);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: exam.context,
          exercises: exam.exercises,
          format: "word",
          includeAnswerKey: true,
          header: { schoolName: exam.school || "Imtihan Community" },
        }),
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exam.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadStats((prev) => ({ ...prev, [exam.id]: prev[exam.id] + 1 }));
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  }

  function handleUse(exam: typeof FEATURED_EXAMS[0]) {
    sessionStorage.setItem("imtihan_context", JSON.stringify(exam.context));
    sessionStorage.setItem("imtihan_exercises", JSON.stringify(exam.exercises));
    sessionStorage.setItem("imtihan_exercises_key", JSON.stringify({ c: exam.context }));
    sessionStorage.setItem("imtihan_remix_source", exam.title);
    router.push("/create/generate");
  }

  const previewExam = previewId ? FEATURED_EXAMS.find((e) => e.id === previewId) : null;
  const totalExams = FEATURED_EXAMS.length;
  const totalDownloads = Object.values(downloadStats).reduce((a, v) => a + v, 0);

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6 text-center gap-4">
      <Logo size={40} showText={false} />
      <h1 className="serif text-2xl text-[var(--text)]">Sign in to access the library</h1>
      <p className="text-sm text-[var(--text-secondary)] max-w-xs">
        The community library is available to all registered teachers.
      </p>
      <Link href="/auth/login"><Button>Sign in</Button></Link>
    </div>
  );

  const isFree = !isProActive(profile);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <Logo size={28} />
        <div className="flex items-center gap-4">
          <Link href="/create"><Button size="sm" icon={<Plus size={13} />}>New exam</Button></Link>
          <UserNav />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 md:px-10 py-10">

        {/* Pro gate */}
        {isFree && (
          <div className="mb-8 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent-light)] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold text-[var(--text)] mb-1">Pro feature — Community Library</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Upgrade to Pro to browse, download, and remix exams shared by teachers across Lebanon.
              </p>
            </div>
            <Link href="/upgrade" className="flex-shrink-0">
              <Button className="bg-[var(--accent)]">Upgrade to Pro — $5.99/mo</Button>
            </Link>
          </div>
        )}

        <div className={cn("space-y-8", isFree && "opacity-40 blur-sm pointer-events-none select-none")}>

          {/* Header */}
          <div>
            <h1 className="serif text-display-lg text-[var(--text)] mb-2">Community Library</h1>
            <p className="text-sm text-[var(--text-secondary)] max-w-xl">
              Exams shared by teachers across Lebanon. Download the Word file, preview the questions, or remix the structure to generate your own version.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-sm">
            <span className="text-[var(--text-secondary)]"><strong className="text-[var(--text)]">{totalExams}</strong> exams</span>
            <span className="text-[var(--text-secondary)]"><strong className="text-[var(--text)]">{totalDownloads}</strong> downloads</span>
          </div>

          {/* How sharing works */}
          <HowToShare />

          {/* Search + sort */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by subject, curriculum, level…"
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            <div className="flex gap-1 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl p-1">
              {(["popular", "recent", "downloads"] as SortKey[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg capitalize transition-colors",
                    sort === s ? "bg-[var(--surface)] text-[var(--text)] font-medium shadow-sm" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <Search size={20} className="text-[var(--text-tertiary)] mx-auto mb-3" />
              <p className="text-sm font-medium text-[var(--text)]">No exams match &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((exam) => {
                const liked = likedIds.has(exam.id);
                const icon = SUBJECT_ICONS[exam.context.subject] ?? "📄";
                const curriculum = CURRICULUM_LABELS[exam.curriculum ?? exam.context.curriculumId] ?? exam.context.curriculumId;

                return (
                  <div key={exam.id} className="card flex flex-col hover:shadow-md transition-shadow duration-200">
                    {/* Card body */}
                    <div className="p-5 flex-1 space-y-3">
                      {/* Title row */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0 text-[var(--accent)] text-lg">
                          {icon.startsWith("fa-") ? (
                            <i className={cn(icon, "text-base")} />
                          ) : (
                            <span>{icon}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div 
                            className="font-semibold text-[var(--text)] text-sm leading-snug line-clamp-2 mb-1"
                            dangerouslySetInnerHTML={{ __html: renderContent(exam.title) }}
                          />
                          <p className="text-xs text-[var(--text-tertiary)]">
                            {curriculum} · {exam.context.levelId} · {exam.context.language}
                          </p>
                        </div>
                      </div>

                      {/* Key info pills */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-secondary)]">
                          {exam.context.exerciseCount} exercises
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-secondary)]">
                          {exam.context.totalPoints} pts
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-secondary)]">
                          {exam.context.duration} min
                        </span>
                        {exam.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/20">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Author */}
                      <p className="text-xs text-[var(--text-tertiary)]">
                        By <span className="font-medium text-[var(--text-secondary)]">{exam.author}</span>
                        {exam.school && <span> · {exam.school}</span>}
                      </p>
                    </div>

                    {/* Card actions */}
                    <div className="border-t border-[var(--border)] px-4 py-3 flex items-center gap-2">
                      {/* Like */}
                      <button
                        onClick={() => toggleLike(exam.id)}
                        title="Like this exam"
                        className={cn(
                          "inline-flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-colors",
                          liked ? "text-red-500 bg-red-50" : "text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50"
                        )}
                      >
                        <Heart size={12} className={liked ? "fill-current" : ""} />
                        <span>{exam.likes + (liked ? 1 : 0)}</span>
                      </button>

                      <div className="flex-1" />

                      {/* Preview */}
                      <button
                        onClick={() => setPreviewId(exam.id)}
                        title="Preview exam questions"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text)] transition-colors"
                      >
                        <Eye size={11} />
                        Preview
                      </button>

                      {/* Download */}
                      <button
                        onClick={() => handleDownload(exam)}
                        disabled={downloadingId === exam.id}
                        title="Download as Word document (with answer key)"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors disabled:opacity-50"
                      >
                        {downloadingId === exam.id ? (
                          <div className="w-3 h-3 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
                        ) : (
                          <Download size={11} />
                        )}
                        {downloadingId === exam.id ? "…" : `Word (${downloadStats[exam.id]})`}
                      </button>

                      {/* Use / Remix */}
                      <button
                        onClick={() => handleUse(exam)}
                        title="Generate a similar exam using this structure"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent)]/90 transition-colors"
                      >
                        <ArrowRight size={11} />
                        Remix
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Preview modal */}
      {previewExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPreviewId(null)} />
          <div className="relative w-full max-w-xl bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-[var(--border)] flex-shrink-0">
              <div>
                <h3 className="font-semibold text-[var(--text)] text-sm leading-snug">{previewExam.title}</h3>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {CURRICULUM_LABELS[previewExam.context.curriculumId]} · {previewExam.context.levelId} · {previewExam.context.duration} min · {previewExam.context.totalPoints} pts
                </p>
              </div>
              <button
                onClick={() => setPreviewId(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-colors flex-shrink-0 ml-3"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div className="flex gap-4 text-xs">
                <div>
                  <span className="text-[var(--text-tertiary)] block mb-0.5">Author</span>
                  <span className="font-medium text-[var(--text)]">{previewExam.author}</span>
                </div>
                {previewExam.school && (
                  <div>
                    <span className="text-[var(--text-tertiary)] block mb-0.5">School</span>
                    <span className="font-medium text-[var(--text)]">{previewExam.school}</span>
                  </div>
                )}
                <div>
                  <span className="text-[var(--text-tertiary)] block mb-0.5">Exercises</span>
                  <span className="font-medium text-[var(--text)]">{previewExam.exercises.length}</span>
                </div>
              </div>

              {previewExam.exercises.length === 0 ? (
                <div className="p-6 text-center text-sm text-[var(--text-tertiary)] border border-dashed rounded-xl">
                  Full preview not available for this exam.
                </div>
              ) : (
                <div className="space-y-3">
                  {previewExam.exercises.map((ex, i) => (
                    <div key={ex.id} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wide">
                          Exercise {i + 1}
                        </span>
                        <span className="text-xs text-[var(--text-tertiary)]">{ex.points} pts</span>
                      </div>
                      <div 
                        className="text-sm text-[var(--text)] leading-relaxed line-clamp-4"
                        dangerouslySetInnerHTML={{ __html: renderContent(ex.statement) }}
                      />
                      {ex.subQuestions && ex.subQuestions.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-[var(--border)]">
                          {ex.subQuestions.map((sq, j) => (
                            <div key={j} className="flex gap-2 text-xs text-[var(--text-secondary)]">
                              <span className="font-semibold text-[var(--accent)] flex-shrink-0">{sq.label}</span>
                              <span 
                                className="leading-relaxed line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: renderContent(sq.statement) }}
                              />
                              <span className="flex-shrink-0 text-[var(--text-tertiary)]">({sq.points})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-[var(--border)] flex gap-3 flex-shrink-0">
              <button
                onClick={() => handleDownload(previewExam)}
                disabled={downloadingId === previewExam.id}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors disabled:opacity-50"
              >
                {downloadingId === previewExam.id ? (
                  <div className="w-4 h-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
                ) : <Download size={14} />}
                Download Word
              </button>
              <button
                onClick={() => { setPreviewId(null); handleUse(previewExam); }}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent)]/90 transition-colors"
              >
                <ArrowRight size={14} />
                Remix this exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── How to share section ───────────────────────────────────────────────────── */
function HowToShare() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyEmail() {
    navigator.clipboard.writeText("share@imtihan.live").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[var(--bg-subtle)] transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0">
          <Send size={14} className="text-[var(--accent)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text)]">Share your exam with the community</p>
          <p className="text-xs text-[var(--text-secondary)]">Help other teachers — click to see how</p>
        </div>
        <Plus size={14} className={cn("text-[var(--text-tertiary)] flex-shrink-0 transition-transform duration-200", open && "rotate-45")} />
      </button>

      {open && (
        <div className="border-t border-[var(--border)] px-5 py-5 space-y-4 bg-[var(--bg-subtle)]">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            To publish an exam in this library, follow these steps. All exams are reviewed by the Imtihan team before going live.
          </p>

          <div className="space-y-3">
            {[
              { icon: <FileText size={14} />, step: "1", title: "Generate & export your exam", desc: 'Create an exam in Imtihan, then export it as a Word file using the "Export" button.' },
              { icon: <Send size={14} />, step: "2", title: "Send it to us by email", desc: "Attach the .docx file and include your name, school (optional), and subject." },
              { icon: <Star size={14} />, step: "3", title: "We review and publish", desc: "We check the quality and curriculum alignment, then publish it with your name credited." },
            ].map(({ icon, step, title, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  {step}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[var(--accent)]">{icon}</span>
                    <p className="text-xs font-semibold text-[var(--text)]">{title}</p>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <span className="text-sm font-semibold text-[var(--text)] flex-1 truncate">share@imtihan.live</span>
            <button
              onClick={copyEmail}
              className={cn(
                "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors flex-shrink-0",
                copied
                  ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-light)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              )}
            >
              {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
