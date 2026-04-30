"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, Clock, Award, Search, Sparkles, FileText, Copy, Trash2, ChevronRight, Bookmark, Users, Zap, CreditCard, CheckCircle2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { RenewalBanner } from "@/components/ui/RenewalBanner";
import { cn, formatDate, SUBJECT_LABELS, FREE_EXAM_LIMIT, shortId } from "@/lib/utils";
import { isProActive, isInGracePeriod, getWhatsAppUpgradeLink } from "@/lib/subscription";
import { getSavedExams, deleteExam, saveExam, type SavedExam } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { UserNav } from "@/components/layout/UserNav";
import { Logo } from "@/components/ui/Logo";

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
  svt: "fa-solid fa-leaf",
  philosophy: "fa-solid fa-brain",
  philosophie: "fa-solid fa-brain",
  history: "fa-solid fa-scroll",
  histoire: "fa-solid fa-scroll",
  geography: "fa-solid fa-earth-americas",
  géographie: "fa-solid fa-earth-americas",
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
  accounting: "fa-solid fa-file-invoice-dollar",
  comptabilité: "fa-solid fa-file-invoice-dollar",
  psychology: "fa-solid fa-comment-medical",
  psychologie: "fa-solid fa-comment-medical",
};

export default function DashboardPage() {
  const [exams, setExams] = useState<SavedExam[]>([]);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const { user: currentUser, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const isPro = isProActive(profile) || isInGracePeriod(profile);
  const quotaUsed = isPro ? (profile?.monthlyExamsGenerated ?? 0) : (profile?.examsGenerated ?? 0);
  const extraQuota = profile?.extraExamsQuota ?? 0;
  const baseLimit = isPro ? 10 : FREE_EXAM_LIMIT;
  const totalLimit = baseLimit + extraQuota;
  const quotaRemaining = Math.max(0, totalLimit - quotaUsed);
  const examsGenerated = exams.length;
  const totalExercises = exams.reduce((acc, exam) => acc + exam.exercises.length, 0);

  useEffect(() => {
    setMounted(true);
    setExams(getSavedExams());
  }, []);

  const filtered = query
    ? exams.filter((exam) => {
        const q = query.toLowerCase();
        return (
          exam.title?.toLowerCase().includes(q) ||
          exam.context.subject.toLowerCase().includes(q) ||
          exam.context.curriculumId.toLowerCase().includes(q)
        );
      })
    : exams;

  async function handleDelete(id: string) {
    try {
      await deleteExam(id);
      setExams((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  }

  async function handleDuplicate(exam: SavedExam) {
    try {
      const newExam = { ...exam, id: shortId(), title: `${exam.title} (Copy)`, createdAt: Date.now() };
      await saveExam(newExam);
      setExams((prev) => [newExam, ...prev]);
    } catch (error) {
      console.error("Duplicate error:", error);
    }
  }

  const [requestingRenewal, setRequestingRenewal] = useState(false);
  const [renewalRequested, setRenewalRequested] = useState(profile?.renewalRequested ?? false);

  async function handleRequestRenewal() {
    setRequestingRenewal(true);
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch("/api/user/request-renewal", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to request renewal");
      setRenewalRequested(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setRequestingRenewal(false);
    }
  }

  function handleUpgrade() {
    const link = getWhatsAppUpgradeLink(profile?.email ?? "");
    window.open(link, "_blank", "noopener,noreferrer");
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <RenewalBanner />
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <Logo size={26} />
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3">
            <Link href="/create">
              <Button size="sm" icon={<Plus size={13} />}>New exam</Button>
            </Link>
          </div>
          <div className="w-px h-6 bg-[var(--border)] hidden md:block" />
          <UserNav />
        </div>
      </nav>

      <div className="flex">
        <DashboardSidebar />
        
        <main className="flex-1 max-w-4xl mx-auto px-6 md:px-10 py-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="serif text-display-lg text-[var(--text)] mb-1">My Library</h1>
            <p className="text-[var(--text-secondary)] text-sm">Your generated exams and professional tools.</p>
          </div>
          <Link href="/create">
            <Button icon={<Plus size={16} />} className="shadow-lg shadow-[var(--accent)]/20">New exam</Button>
          </Link>
        </div>



        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Exams created", value: examsGenerated },
            { label: "Total exercises", value: totalExercises },
            { label: "Hours saved", value: Math.round(examsGenerated * 1.5) },
          ].map((stat) => (
            <div key={stat.label} className="card p-4 text-center">
              <div className="serif text-2xl font-light text-[var(--accent)] mb-0.5 tabular-nums">{stat.value}</div>
              <div className="text-xs text-[var(--text-tertiary)]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Subscription status */}
        <div className="card p-4 mb-6 flex items-center gap-4">
          {isPro ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                <Zap size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text)] mb-1">Pro plan</p>
                <p className="text-xs text-[var(--text-tertiary)]">{quotaUsed}/{totalLimit} exams this month</p>
                {extraQuota > 0 && <p className="text-[10px] text-blue-500 font-medium mt-0.5">Includes +{extraQuota} extra exams</p>}
              </div>
              <div className="flex items-center gap-2">
                {renewalRequested ? (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                    RENEWAL PENDING
                  </span>
                ) : (
                  <button
                    onClick={handleRequestRenewal}
                    disabled={requestingRenewal}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {requestingRenewal ? "..." : "Request Renewal"}
                  </button>
                )}
                <a
                  href={getWhatsAppUpgradeLink(profile?.email ?? "")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text)] transition-colors"
                >
                  <CreditCard size={12} />
                  WhatsApp
                </a>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "96170542238"}?text=${encodeURIComponent("Hello! I need to buy an Extra Exams Bundle for my Imtihan Pro account. What are the options?")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors ml-2"
                >
                  <Plus size={12} /> Buy Extra Bundle
                </a>
              </div>
            </>
          ) : quotaUsed >= totalLimit ? (
            /* Limit reached */
            <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-[var(--text)]">
                    Free limit reached — {quotaUsed}/{totalLimit} exams used
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-subtle)]">
                    <div className="h-full w-full rounded-full bg-[var(--accent)]" />
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                  Upgrade to Pro for 10 exams/month and advanced AI tools.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Link href="/upgrade">
                  <Button size="sm" className="bg-[var(--accent)] shadow-md shadow-[var(--accent)]/20 whitespace-nowrap">
                    Upgrade to Pro — $5.99/mo
                  </Button>
                </Link>
                {renewalRequested ? (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                    REQUEST PENDING
                  </span>
                ) : (
                  <button
                    onClick={handleRequestRenewal}
                    disabled={requestingRenewal}
                    className="text-[10px] font-medium text-[var(--text-secondary)] hover:text-[var(--text)] underline underline-offset-2"
                  >
                    {requestingRenewal ? "..." : "Request in-app"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Still has quota */
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text)] mb-2">
                  Free plan — <span className="text-[var(--accent)]">{quotaRemaining} exam{quotaRemaining !== 1 ? "s" : ""}</span> remaining
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--border)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)] transition-all"
                      style={{ width: `${Math.min(100, (quotaUsed / totalLimit) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--text-tertiary)] tabular-nums flex-shrink-0">{quotaUsed}/{totalLimit}</span>
                </div>
              </div>
              <Link href="/upgrade">
                <Button variant="secondary" size="sm">
                  Upgrade to Pro — $5.99/mo
                </Button>
              </Link>
            </>
          )}
        </div>

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
        ) : exams.length === 0 ? (
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
              <ExamRow
                key={exam.id}
                exam={exam}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}

        </main>
      </div>
    </div>
  );
}

function ExamRow({
  exam,
  onDelete,
  onDuplicate,
}: {
  exam: SavedExam;
  onDelete: (id: string) => void;
  onDuplicate: (exam: SavedExam) => void;
}) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState<"word" | "pdf" | null>(null);

  const diffCount = exam.exercises.reduce(
    (acc, e) => { acc[e.difficulty] = (acc[e.difficulty] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );
  const totalEx = exam.exercises.length;

  async function handleDownload(format: "word" | "pdf") {
    setDownloading(format);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: exam.context,
          exercises: exam.exercises,
          format,
          includeAnswerKey: true,
          header: exam.header ?? {},
        }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exam.title}.${format === "word" ? "docx" : "pdf"}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  }

  const subjectKey = exam.context.subject?.toLowerCase() || "";
  const icon = SUBJECT_ICONS[subjectKey] ?? "📄";
  const isFa = icon.startsWith("fa-");

  return (
    <div className="card overflow-hidden">
      {/* Main row */}
      <div className="flex items-center gap-4 p-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0 text-[var(--accent)]">
          {isFa ? (
            <i className={cn(icon, "text-base")} aria-hidden="true" />
          ) : (
            <span className="text-lg">{icon}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--text)] truncate">{exam.title}</p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-xs text-[var(--text-tertiary)] capitalize">{exam.context.curriculumId.replace("-", " ")}</span>
            <span className="text-xs text-[var(--text-tertiary)]">·</span>
            <span className="text-xs text-[var(--text-tertiary)] inline-flex items-center gap-1">
              <Award size={10} /> {exam.exercises.reduce((s, e) => s + e.points, 0)} pts
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
          {totalEx > 0 && (
            <div>
              <p className="text-xs text-[var(--text-tertiary)] mb-2">Difficulty breakdown</p>
              <div className="flex h-2 rounded-full overflow-hidden gap-px mb-1.5">
                {(diffCount.easy ?? 0) > 0 && <div className="bg-emerald-500" style={{ width: `${((diffCount.easy ?? 0) / totalEx) * 100}%` }} />}
                {(diffCount.medium ?? 0) > 0 && <div className="bg-amber-500" style={{ width: `${((diffCount.medium ?? 0) / totalEx) * 100}%` }} />}
                {(diffCount.hard ?? 0) > 0 && <div className="bg-red-500" style={{ width: `${((diffCount.hard ?? 0) / totalEx) * 100}%` }} />}
              </div>
              <div className="flex gap-3 text-[11px] text-[var(--text-tertiary)]">
                {(diffCount.easy ?? 0) > 0 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{diffCount.easy} easy</span>}
                {(diffCount.medium ?? 0) > 0 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{diffCount.medium} medium</span>}
                {(diffCount.hard ?? 0) > 0 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{diffCount.hard} hard</span>}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleDownload("word")}
              disabled={!!downloading}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text)] transition-colors disabled:opacity-50"
            >
              {downloading === "word" ? <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" /> : <FileText size={11} />}
              Download Word
            </button>
            <button
              onClick={() => handleDownload("pdf")}
              disabled={!!downloading}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text)] transition-colors disabled:opacity-50"
            >
              {downloading === "pdf" ? <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" /> : <FileText size={11} />}
              Download PDF
            </button>
            <button
              onClick={() => onDuplicate(exam)}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text)] transition-colors"
            >
              <Copy size={11} /> Duplicate
            </button>
            <button
              onClick={() => onDelete(exam.id)}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors ml-auto"
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
