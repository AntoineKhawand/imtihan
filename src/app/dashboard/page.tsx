"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Clock, Award, Search, Sparkles, FileText, Copy, Trash2, ChevronRight, Zap, X, Users, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SkeletonList } from "@/components/ui/Skeleton";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { RenewalBanner } from "@/components/ui/RenewalBanner";
import { cn, formatDate, FREE_EXAM_LIMIT, shortId } from "@/lib/utils";
import { isProActive, isInGracePeriod } from "@/lib/subscription";
import { getSavedExams, deleteExam, saveExam, type SavedExam } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { UserNav } from "@/components/layout/UserNav";
import { Logo } from "@/components/ui/Logo";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

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
  const { user: currentUser, profile } = useAuth();

  const isPro = isProActive(profile) || isInGracePeriod(profile);
  const quotaUsed = isPro ? (profile?.monthlyExamsGenerated ?? 0) : (profile?.examsGenerated ?? 0);
  const extraQuota = profile?.extraExamsQuota ?? 0;
  const proLimit = profile?.planType === "yearly" ? 20 : 10;
  const baseLimit = isPro ? proLimit : FREE_EXAM_LIMIT;
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

  function handleDelete(id: string) {
    deleteExam(id);
    setExams((prev) => prev.filter((e) => e.id !== id));
  }

  function handleDuplicate(exam: SavedExam) {
    const newExam = { ...exam, id: shortId(), title: `${exam.title} (Copy)`, createdAt: Date.now() };
    saveExam(newExam);
    setExams((prev) => [newExam, ...prev]);
  }

  const [requestingRenewal, setRequestingRenewal] = useState(false);
  const [renewalRequested, setRenewalRequested] = useState(profile?.renewalRequested ?? false);
  const [resetRequested, setResetRequested] = useState(profile?.resetRequested ?? false);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [bundleSize, setBundleSize] = useState<number>(10);

  const BUNDLE_PRICES: Record<number, number> = {
    10: 4.99,
    20: 8.99,
    30: 11.99,
    40: 14.99,
    50: 16.99
  };

  const handleBuyBundle = () => {
    const price = BUNDLE_PRICES[bundleSize];
    const msg = `Hello! I need to buy the Extra Exams Bundle for my Imtihan Pro account. I would like +${bundleSize} extra exams for $${price}.`;
    const url = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "96170542238"}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsBundleModalOpen(false);
  };

  async function handleRequestReset() {
    setRequestingRenewal(true);
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch("/api/user/reset-request", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to request reset");
      setResetRequested(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setRequestingRenewal(false);
    }
  }

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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
          <Logo size={26} />
        </nav>
        <div className="flex">
          <aside className="hidden lg:block w-64 border-r border-[var(--border)] h-[calc(100vh-64px)] sticky top-16" />
          <main className="flex-1 max-w-4xl mx-auto px-6 md:px-10 py-12 space-y-6">
            {/* Stat skeleton */}
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card p-4 text-center space-y-2">
                  <div className="skeleton h-7 w-10 rounded-md mx-auto" />
                  <div className="skeleton h-3 w-20 rounded-md mx-auto" />
                </div>
              ))}
            </div>
            {/* List skeleton */}
            <SkeletonList count={4} variant="exam" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <RenewalBanner />
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <Logo size={26} />
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            <Link href="/create">
              <Button size="sm" icon={<Plus size={13} />} className="shadow-sm shadow-[var(--accent)]/20">New exam</Button>
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
            <h1 className="heading text-3xl text-[var(--text)] mb-1">My Library</h1>
            <p className="text-[var(--text-secondary)] text-sm">Your generated exams and professional tools.</p>
          </div>
          <Link href="/create">
            <Button icon={<Plus size={16} />} className="shadow-lg shadow-[var(--accent)]/25">New exam</Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Exams created",   value: examsGenerated,                         accent: "text-[var(--accent)]",  bg: "bg-[var(--accent-light)]"  },
            { label: "Total exercises", value: totalExercises,                         accent: "text-[var(--accent)]",  bg: "bg-[var(--accent-light)]"  },
            { label: "Hours saved",     value: Math.round(examsGenerated * 1.5),       accent: "text-[var(--orange)]",  bg: "bg-[var(--orange-light)]"  },
          ].map((stat) => (
            <div key={stat.label} className={`card p-4 text-center hover:-translate-y-0.5 transition-transform duration-200 ${stat.bg}`}>
              <div className={`heading text-3xl ${stat.accent} mb-0.5 tabular-nums`}>{stat.value}</div>
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
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-[var(--text)]">Pro plan</p>
                  {quotaRemaining <= 5 && quotaRemaining > 0 && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 animate-pulse">
                      {quotaRemaining} EXAMS LEFT
                    </span>
                  )}
                  {quotaRemaining === 0 && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                      LIMIT REACHED
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-tertiary)]">{quotaUsed}/{totalLimit} exams this month</p>
                {extraQuota > 0 && <p className="text-[10px] text-blue-500 font-medium mt-0.5">Includes +{extraQuota} extra exams</p>}
              </div>
              <div className="flex items-center gap-2">
                {quotaRemaining === 0 ? (
                  resetRequested ? (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 uppercase">
                      Reset Pending
                    </span>
                  ) : (
                    <button
                      onClick={handleRequestReset}
                      disabled={requestingRenewal}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
                    >
                      {requestingRenewal ? "..." : "Reset Month"}
                    </button>
                  )
                ) : renewalRequested ? (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                    RENEWAL PENDING
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      const msg = `Hello! I would like to request a renewal for my Imtihan account (${profile?.email}).`;
                      window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "96170542238"}?text=${encodeURIComponent(msg)}`, "_blank");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Request Renewal
                  </button>
                )}
                <button
                  onClick={() => setIsBundleModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--accent-light)] text-[var(--accent)] hover:opacity-90 transition-opacity ml-2"
                >
                  <Plus size={12} /> Buy Extra
                </button>
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
                  Upgrade to Pro for 10 exams/month (20 with yearly plan) and advanced AI tools.
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
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200"
          />
        </div>

        {/* Exam list */}
        {filtered.length === 0 && query ? (
          <div className="card p-10 flex flex-col items-center justify-center text-center">
            <Search size={24} className="text-[var(--text-tertiary)] mb-3" />
            <p className="font-medium text-[var(--text)] mb-1">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-sm text-[var(--text-secondary)]">Try a different subject or curriculum name.</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="card p-10 md:p-14 flex flex-col items-center justify-center text-center">
            {/* Illustrated SVG placeholder */}
            <div className="mb-6 animate-float">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                {/* Paper stack shadow */}
                <rect x="22" y="30" width="76" height="96" rx="10" fill="var(--accent)" opacity="0.08" />
                {/* Back paper */}
                <rect x="16" y="24" width="76" height="90" rx="10" fill="var(--accent-light)" stroke="var(--accent)" strokeWidth="1.5" strokeOpacity="0.25" />
                {/* Front paper */}
                <rect x="24" y="16" width="76" height="90" rx="10" fill="white" stroke="var(--accent)" strokeWidth="1.5" strokeOpacity="0.30" />
                {/* Lines representing text */}
                <rect x="38" y="34" width="48" height="5" rx="2.5" fill="var(--accent)" opacity="0.18" />
                <rect x="38" y="46" width="40" height="4" rx="2" fill="var(--text-tertiary, #a3a3a3)" opacity="0.25" />
                <rect x="38" y="56" width="44" height="4" rx="2" fill="var(--text-tertiary, #a3a3a3)" opacity="0.20" />
                <rect x="38" y="66" width="36" height="4" rx="2" fill="var(--text-tertiary, #a3a3a3)" opacity="0.18" />
                {/* Sparkles top-right */}
                <circle cx="88" cy="22" r="5" fill="var(--orange)" opacity="0.70" />
                <circle cx="100" cy="14" r="3" fill="var(--accent)" opacity="0.50" />
                <circle cx="96" cy="32" r="2" fill="var(--orange)" opacity="0.40" />
                {/* Plus badge */}
                <circle cx="88" cy="88" r="14" fill="var(--accent)" />
                <rect x="82" y="87" width="12" height="2.5" rx="1.25" fill="white" />
                <rect x="86.75" y="82" width="2.5" height="12" rx="1.25" fill="white" />
              </svg>
            </div>
            <h2 className="heading text-xl text-[var(--text)] mb-2">No exams yet</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-xs leading-relaxed">
              Describe your first exam in plain language and Imtihan generates it in seconds — with a full answer key.
            </p>
            <Link href="/create">
              <Button icon={<Plus size={14} />} className="shadow-lg shadow-[var(--accent)]/25">Create your first exam</Button>
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

      {/* Bundle Modal */}
      {isBundleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsBundleModalOpen(false)} />
          <div className="relative bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsBundleModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center mx-auto mb-3">
                <Plus size={24} />
              </div>
              <h3 className="serif text-2xl font-bold text-[var(--text)]">Buy Extra Exams</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Select how many exams you want to add to your account.</p>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-end mb-4">
                <span className="serif text-3xl font-black text-[var(--text)] tabular-nums">+{bundleSize} <span className="text-sm font-medium text-[var(--text-secondary)]">exams</span></span>
                <span className="serif text-2xl font-bold text-[var(--accent)] tabular-nums">${BUNDLE_PRICES[bundleSize]}</span>
              </div>
              
              <input
                type="range"
                min="10"
                max="50"
                step="10"
                value={bundleSize}
                onChange={(e) => setBundleSize(Number(e.target.value))}
                className="w-full h-2 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] font-medium mt-2 px-1">
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40</span>
                <span>50</span>
              </div>
            </div>

            <Button onClick={handleBuyBundle} className="w-full h-12 text-base font-semibold shadow-lg shadow-[var(--accent)]/20">
              Purchase via WHISH
            </Button>
            <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-3 font-medium uppercase tracking-wider">No auto-renewals</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Student results helpers ────────────────────────────────────────────────────

interface StudentResult {
  userId: string;
  displayName: string;
  email: string;
  latestAttempt: number;
  totalAttempts: number;
  correctCount: number;
}

async function fetchStudentResultsForExam(exerciseIds: string[]): Promise<StudentResult[]> {
  if (!db || exerciseIds.length === 0) return [];
  try {
    // Firestore `in` supports max 30 items; chunk if needed
    const chunks: string[][] = [];
    for (let i = 0; i < exerciseIds.length; i += 30) {
      chunks.push(exerciseIds.slice(i, i + 30));
    }
    const allDocs: any[] = [];
    for (const chunk of chunks) {
      const q = query(
        collection(db, "student_attempts"),
        where("exerciseId", "in", chunk)
      );
      const snap = await getDocs(q);
      snap.docs.forEach((d) => allDocs.push({ id: d.id, ...d.data() }));
    }

    // Group by userId
    const byUser = new Map<string, { attempts: any[] }>();
    for (const attempt of allDocs) {
      if (!byUser.has(attempt.userId)) byUser.set(attempt.userId, { attempts: [] });
      byUser.get(attempt.userId)!.attempts.push(attempt);
    }

    // Fetch student profiles in parallel
    const results: StudentResult[] = await Promise.all(
      [...byUser.entries()].map(async ([userId, { attempts }]) => {
        let displayName = "Unknown Student";
        let email = "";
        try {
          const profileSnap = await getDoc(doc(db, "student_profiles", userId));
          if (profileSnap.exists()) {
            const p = profileSnap.data();
            displayName = p.displayName ?? displayName;
            email = p.email ?? "";
          }
        } catch {}
        const timestamps = attempts.map((a: any) =>
          typeof a.timestamp === "number" ? a.timestamp : (a.timestamp?.toMillis?.() ?? 0)
        );
        return {
          userId,
          displayName,
          email,
          latestAttempt: Math.max(...timestamps),
          totalAttempts: attempts.length,
          correctCount: attempts.filter((a: any) => a.isCorrect).length,
        };
      })
    );

    return results.sort((a, b) => b.latestAttempt - a.latestAttempt);
  } catch (err) {
    console.error("[dashboard] fetchStudentResultsForExam:", err);
    return [];
  }
}

// ── ExamRow ────────────────────────────────────────────────────────────────────

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
  const [showStudentResults, setShowStudentResults] = useState(false);
  const [studentResults, setStudentResults] = useState<StudentResult[] | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  const diffCount = exam.exercises.reduce(
    (acc, e) => { acc[e.difficulty] = (acc[e.difficulty] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );
  const totalEx = exam.exercises.length;

  async function handleToggleStudentResults() {
    if (showStudentResults) {
      setShowStudentResults(false);
      return;
    }
    setShowStudentResults(true);
    if (studentResults !== null) return; // already loaded
    setLoadingResults(true);
    const exerciseIds = exam.exercises.map((e) => e.id).filter(Boolean);
    const results = await fetchStudentResultsForExam(exerciseIds);
    setStudentResults(results);
    setLoadingResults(false);
  }

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
    <div className="card overflow-hidden hover:-translate-y-0.5 transition-transform duration-200">
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
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0",
            open
              ? "bg-[var(--accent-light)] text-[var(--accent)] rotate-90"
              : "text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)]"
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
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] hover:bg-[var(--accent-light)] active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
              {downloading === "word" ? <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" /> : <FileText size={11} />}
              Download Word
            </button>
            <button
              onClick={() => handleDownload("pdf")}
              disabled={!!downloading}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] hover:bg-[var(--accent-light)] active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
              {downloading === "pdf" ? <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" /> : <FileText size={11} />}
              Download PDF
            </button>
            <button
              onClick={() => onDuplicate(exam)}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] hover:bg-[var(--accent-light)] active:scale-95 transition-all duration-200"
            >
              <Copy size={11} /> Duplicate
            </button>
            <button
              onClick={() => onDelete(exam.id)}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 active:scale-95 transition-all duration-200 ml-auto"
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>

          {/* Student Results */}
          <div className="border-t border-[var(--border)] pt-4">
            <button
              onClick={handleToggleStudentResults}
              className={cn(
                "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors",
                showStudentResults
                  ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-light)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text)]"
              )}
            >
              <Users size={11} />
              Student Results
              {studentResults && studentResults.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-md bg-[var(--accent)] text-white text-[9px] font-bold">
                  {studentResults.length}
                </span>
              )}
            </button>

            {showStudentResults && (
              <div className="mt-4">
                {loadingResults ? (
                  <div className="flex items-center gap-2 py-4 text-xs text-[var(--text-tertiary)]">
                    <div className="w-4 h-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
                    Loading student results…
                  </div>
                ) : !studentResults || studentResults.length === 0 ? (
                  <div className="py-4 text-center text-xs text-[var(--text-tertiary)] bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                    <Users size={20} className="mx-auto mb-2 opacity-40" />
                    No students have attempted exercises from this exam yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                          <th className="text-left px-4 py-2.5 font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Student</th>
                          <th className="text-left px-4 py-2.5 font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Last Attempt</th>
                          <th className="text-center px-4 py-2.5 font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Attempts</th>
                          <th className="text-center px-4 py-2.5 font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Correct</th>
                          <th className="text-center px-4 py-2.5 font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentResults.map((r, i) => {
                          const pct = r.totalAttempts > 0 ? Math.round((r.correctCount / r.totalAttempts) * 100) : 0;
                          return (
                            <tr key={r.userId} className={cn("border-b border-[var(--border)] last:border-0", i % 2 === 0 ? "bg-white" : "bg-[var(--bg-subtle)]/40")}>
                              <td className="px-4 py-3">
                                <p className="font-medium text-[var(--text)]">{r.displayName}</p>
                                {r.email && <p className="text-[10px] text-[var(--text-tertiary)]">{r.email}</p>}
                              </td>
                              <td className="px-4 py-3 text-[var(--text-secondary)]">
                                {r.latestAttempt > 0 ? formatDate(r.latestAttempt) : "—"}
                              </td>
                              <td className="px-4 py-3 text-center text-[var(--text)]">{r.totalAttempts}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center gap-1">
                                  {r.correctCount > 0 ? (
                                    <CheckCircle2 size={11} className="text-emerald-500" />
                                  ) : (
                                    <XCircle size={11} className="text-red-400" />
                                  )}
                                  {r.correctCount}/{r.totalAttempts}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={cn(
                                  "font-bold text-xs px-2 py-0.5 rounded-full",
                                  pct >= 70 ? "bg-emerald-50 text-emerald-700" : pct >= 40 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600"
                                )}>
                                  {pct}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
