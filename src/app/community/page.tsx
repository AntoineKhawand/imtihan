"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Users, Heart, Download, BookOpen, Eye, X, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, SUBJECT_LABELS } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { UserNav } from "@/components/layout/UserNav";

import { FEATURED_EXAMS } from "@/data/communityExams";

const SUBJECT_ICONS: Record<string, string> = {
  physics: "⚛", mathematics: "∑", chemistry: "⚗", biology: "🧬",
  philosophy: "💭", history: "📜", english: "📖", french: "📝",
  arabic: "ع", informatics: "💻", economics: "📈", svt: "🌿",
};

type SortKey = "popular" | "recent" | "downloads";

import { useRouter } from "next/navigation";

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
    const curriculum = e.curriculum ?? e.context.curriculumId;
    const subject = e.subject ?? e.context.subject;
    return (
      e.title.toLowerCase().includes(q) ||
      curriculum.toLowerCase().includes(q) ||
      subject.toLowerCase().includes(q) ||
      (SUBJECT_LABELS[subject]?.fr ?? "").toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }).sort((a, b) => {
    if (sort === "popular") return b.likes - a.likes;
    if (sort === "downloads") return downloadStats[b.id] - downloadStats[a.id];
    return 0; // "recent" keeps original order
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
      a.download = `${exam.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      
      // Increment downloads locally
      setDownloadStats((prev) => ({ ...prev, [exam.id]: prev[exam.id] + 1 }));
    } catch (err) {
      console.error(err);
      alert("Failed to download exam. Please try again later.");
    } finally {
      setDownloadingId(null);
    }
  }

  function handleUse(exam: typeof FEATURED_EXAMS[0]) {
    sessionStorage.setItem("imtihan_context", JSON.stringify(exam.context));
    sessionStorage.setItem("imtihan_exercises", JSON.stringify(exam.exercises));
    sessionStorage.setItem("imtihan_exercises_key", JSON.stringify({ c: exam.context }));
    // Provide a hint to the user they are remixing
    sessionStorage.setItem("imtihan_remix_source", exam.title);
    router.push("/create/structure");
  }

  const previewExam = previewId ? FEATURED_EXAMS.find((e) => e.id === previewId) : null;

  const totalExams = FEATURED_EXAMS.length;
  const totalDownloads = Object.values(downloadStats).reduce((acc, val) => acc + val, 0);
  const totalCurricula = new Set(FEATURED_EXAMS.map((e) => e.context.curriculumId)).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="serif text-2xl text-[var(--text)] mb-2">Sign in required</h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6">
          You must be signed in to view the community exam library.
        </p>
        <Link href="/auth/login?next=/community">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (profile?.role === "student") {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-6">
          <Users size={24} />
        </div>
        <h1 className="serif text-2xl text-[var(--text)] mb-2">Access Denied</h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6">
          The community exam library is exclusively available for teachers to share and remix exams.
        </p>
        <Link href="/dashboard">
          <Button variant="secondary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const isFree = profile?.subscription?.tier === "free";

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

      <main className="max-w-4xl mx-auto px-6 md:px-10 py-12 relative">
        {/* Pro Overlay for Free Users */}
        {isFree && (
          <div className="absolute inset-0 z-30 flex flex-col items-center pt-40 px-6">
            <div className="sticky top-40 w-full max-w-sm p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-[var(--accent)]/30 shadow-2xl shadow-[var(--accent)]/10 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-6 border border-[var(--accent)]/10 text-[var(--accent)]">
                <BookOpen size={28} />
              </div>
              <h2 className="serif text-2xl text-[var(--text)] mb-3">Community Library</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed">
                Unlock hundreds of exams shared by teachers. Adapt, remix, and download premium content with a Pro plan.
              </p>
              <Link href="/pricing" className="block w-full">
                <Button size="lg" className="w-full bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/20">
                  Upgrade to Pro — $5.99/mo
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className={cn("transition-all duration-700", isFree && "opacity-40 blur-sm pointer-events-none select-none")}>
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
            { value: totalExams.toString(), label: "Shared exams" },
            { value: totalDownloads.toString(), label: "Downloads" },
            { value: `${totalCurricula} curricula`, label: "Covered" },
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
              const totalDiff = (exam.context.difficultyMix.easy + exam.context.difficultyMix.medium + exam.context.difficultyMix.hard) || 1;
              const icon = SUBJECT_ICONS[exam.context.subject] ?? "📄";

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
                          <span>{exam.context.curriculumId}</span>
                          <span>·</span>
                          <span>{exam.context.levelId}</span>
                          <span>·</span>
                          <span>{exam.context.language}</span>
                        </div>
                      </div>
                    </div>

                    {/* Difficulty bar */}
                    <div className="flex h-1.5 rounded-full overflow-hidden gap-px mb-3">
                      {exam.context.difficultyMix.easy > 0 && <div className="bg-emerald-500" style={{ width: `${(exam.context.difficultyMix.easy / totalDiff) * 100}%` }} />}
                      {exam.context.difficultyMix.medium > 0 && <div className="bg-amber-500" style={{ width: `${(exam.context.difficultyMix.medium / totalDiff) * 100}%` }} />}
                      {exam.context.difficultyMix.hard > 0 && <div className="bg-red-500" style={{ width: `${(exam.context.difficultyMix.hard / totalDiff) * 100}%` }} />}
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-3 text-xs text-[var(--text-secondary)] mb-3">
                      <span>{exam.context.exerciseCount} exercises</span>
                      <span>·</span>
                      <span>{exam.context.totalPoints} pts</span>
                      <span>·</span>
                      <span>{exam.context.duration} min</span>
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
                    <button
                      onClick={() => handleDownload(exam)}
                      disabled={downloadingId === exam.id}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors disabled:opacity-50"
                    >
                      {downloadingId === exam.id ? (
                        <div className="w-3 h-3 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
                      ) : (
                        <Download size={11} />
                      )}
                      Download ({downloadStats[exam.id]})
                    </button>

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
                    <button
                      onClick={() => handleUse(exam)}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--accent)] border border-transparent text-white font-medium hover:bg-transparent hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                    >
                      <BookOpen size={11} />
                      Use
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
            <div className="p-0 overflow-y-auto max-h-[60vh]">
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4 text-xs text-[var(--text-secondary)] bg-[var(--bg-subtle)] p-4 rounded-xl border border-[var(--border)]">
                  <div><span className="text-[var(--text-tertiary)]">Author</span><br /><span className="font-medium text-[var(--text)]">{previewExam.author}</span></div>
                  <div><span className="text-[var(--text-tertiary)]">School</span><br /><span className="font-medium text-[var(--text)]">{previewExam.school || '—'}</span></div>
                  <div><span className="text-[var(--text-tertiary)]">Curriculum</span><br /><span className="font-medium text-[var(--text)]">{previewExam.context.curriculumId}</span></div>
                  <div><span className="text-[var(--text-tertiary)]">Details</span><br /><span className="font-medium text-[var(--text)]">{previewExam.context.duration} min · {previewExam.context.totalPoints} pts</span></div>
                </div>

                <div className="space-y-4">
                  {previewExam.exercises.map((ex, i) => (
                    <div key={ex.id} className="p-4 rounded-xl border border-[var(--border)] bg-white shadow-sm space-y-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-[var(--accent)]">Exercise {i + 1}</span>
                        <span className="text-xs text-[var(--text-tertiary)]">{ex.points} pts</span>
                      </div>
                      <p className="text-sm text-[var(--text)] leading-relaxed">{ex.statement}</p>
                      {ex.subQuestions && ex.subQuestions.length > 0 && (
                        <div className="space-y-2 pl-2">
                          {ex.subQuestions.map((sq, j) => (
                            <div key={j} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                              <span className="font-medium flex-shrink-0">{sq.label}</span>
                              <span className="leading-relaxed">{sq.statement}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {previewExam.exercises.length === 0 && (
                    <div className="p-4 text-center text-sm text-[var(--text-tertiary)] border border-dashed rounded-xl">
                      Detailed preview unavailable for this legacy exam.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-subtle)] flex gap-3">
               <button
                  onClick={() => handleDownload(previewExam)}
                  disabled={downloadingId === previewExam.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors disabled:opacity-50"
                >
                  {downloadingId === previewExam.id ? (
                    <div className="w-4 h-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  Download
                </button>
               <button
                  onClick={() => { setPreviewId(null); handleUse(previewExam); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-transparent bg-[var(--accent)] text-white text-sm font-medium hover:bg-transparent hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                >
                  <BookOpen size={14} />
                  Use this exam
                </button>
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
    navigator.clipboard.writeText("share@imtihan.live").then(() => {
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
            <p className="flex-1 text-sm font-medium text-[var(--text)]">share@imtihan.live</p>
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
