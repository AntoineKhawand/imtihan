"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, Search, Bookmark, Trash2, BookOpen, Award, Clock,
  ChevronDown, ChevronUp, Building2, Share2, Download,
  ShieldCheck, X, Mail, Copy, Send, Zap, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { renderContent } from "@/lib/renderContent";
import { cn, SUBJECT_LABELS } from "@/lib/utils";
import { getBankExercises, removeFromBank, type BankExercise } from "@/lib/storage";
import { UserNav } from "@/components/layout/UserNav";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { isProActive } from "@/lib/subscription";
import { db } from "@/lib/firebase";
import {
  collection, addDoc, getDocs, query, where, serverTimestamp, orderBy,
} from "firebase/firestore";

const DIFFICULTY_CONFIG = {
  easy:   { label: "Easy",   color: "text-emerald-600 bg-emerald-50", dot: "bg-emerald-500" },
  medium: { label: "Medium", color: "text-amber-600 bg-amber-50",     dot: "bg-amber-500"   },
  hard:   { label: "Hard",   color: "text-red-600 bg-red-50",         dot: "bg-red-500"     },
};

// ── Firestore helpers ──────────────────────────────────────────────────────────

function schoolSlugFrom(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

async function getSchoolBankExercises(schoolName: string) {
  if (!schoolName) return [];
  try {
    const slug = schoolSlugFrom(schoolName);
    const q = query(
      collection(db, "schoolBank"),
      where("schoolSlug", "==", slug),
      orderBy("sharedAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("[Bank] getSchoolBankExercises:", err);
    return [];
  }
}

async function shareToSchoolBank(
  entry: BankExercise,
  schoolName: string,
  contributorName: string,
) {
  const slug = schoolSlugFrom(schoolName);
  await addDoc(collection(db, "schoolBank"), {
    schoolSlug: slug,
    schoolName,
    contributor: contributorName,
    subject: entry.subject,
    tags: entry.tags ?? [],
    exercise: {
      statement: entry.exercise.statement,
      difficulty: entry.exercise.difficulty,
      points: entry.exercise.points,
      estimatedMinutes: entry.exercise.estimatedMinutes,
      solution: {
        finalAnswer: entry.exercise.solution.finalAnswer,
        methodology: entry.exercise.solution.methodology,
      },
    },
    sharedAt: serverTimestamp(),
  });
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function BankPage() {
  const { user, profile } = useAuth();
  const isPro = isProActive(profile);

  const [entries, setEntries]           = useState<BankExercise[]>([]);
  const [schoolEntries, setSchoolEntries] = useState<any[]>([]);
  const [tab, setTab]                   = useState<"personal" | "school">("personal");
  const [query, setQuery]               = useState("");
  const [mounted, setMounted]           = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [loadingSchool, setLoadingSchool] = useState(false);
  const [inviteEmail, setInviteEmail]   = useState("");
  const [copied, setCopied]             = useState(false);

  const userSchool = profile?.school ?? "";
  const slug       = schoolSlugFrom(userSchool);
  const inviteLink = `https://www.imtihan.live/join/${slug}`;

  useEffect(() => {
    setEntries(getBankExercises());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (tab === "school" && isPro && userSchool) {
      loadSchool();
    }
  }, [tab, isPro, userSchool]);

  async function loadSchool() {
    setLoadingSchool(true);
    const data = await getSchoolBankExercises(userSchool);
    setSchoolEntries(data);
    setLoadingSchool(false);
  }

  async function handleShare(entry: BankExercise) {
    if (!userSchool) {
      toast.error("Set your school name in account settings first.");
      return;
    }
    const promise = shareToSchoolBank(entry, userSchool, profile?.displayName ?? "Educator");
    toast.promise(promise, {
      loading: "Sharing with your school bank…",
      success: "Shared! Your colleagues can now see it.",
      error:   "Share failed — please try again.",
    });
    try { await promise; if (tab === "school") loadSchool(); } catch {}
  }

  function handleRemove(id: string) {
    removeFromBank(id);
    setEntries((prev) => prev.filter((b) => b.id !== id));
  }

  function copyInvite() {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function sendInvite() {
    if (!inviteEmail.includes("@")) { toast.error("Enter a valid email."); return; }
    // Opens a pre-filled mailto — no server needed
    const subject = encodeURIComponent(`Join ${userSchool}'s question bank on Imtihan`);
    const body    = encodeURIComponent(
      `Hi,\n\nI'd like you to join our shared question bank on Imtihan.\n\nJoin here: ${inviteLink}\n\nSee you there!`
    );
    window.open(`mailto:${inviteEmail}?subject=${subject}&body=${body}`);
    toast.success("Your email app opened with the invitation.");
    setIsInviteOpen(false);
    setInviteEmail("");
  }

  const currentList = tab === "personal" ? entries : schoolEntries;

  const filtered = currentList.filter((b) => {
    if (!query.trim()) return true;
    const q2 = query.toLowerCase();
    const ex  = b.exercise ?? b;
    return (
      (SUBJECT_LABELS[b.subject]?.fr ?? b.subject).toLowerCase().includes(q2) ||
      (ex.statement ?? "").toLowerCase().includes(q2) ||
      (b.tags ?? []).some((t: string) => t.toLowerCase().includes(q2))
    );
  });

  if (!mounted) return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-[var(--bg-subtle)] rounded-lg transition-colors text-[var(--text-secondary)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
          </Link>
          <Logo size={26} />
        </div>
        <div className="flex items-center gap-4">
          <Link href="/create"><Button size="sm" icon={<Plus size={13} />}>New exam</Button></Link>
          <UserNav />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 md:px-10 py-12">

        {/* Header + tab toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
                <Bookmark size={14} className="text-[var(--accent)]" />
              </div>
              <h1 className="serif text-display-lg text-[var(--text)]">Question Bank</h1>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">
              {tab === "personal"
                ? `${entries.length} personal questions saved.`
                : `${currentList.length} shared exercises from ${userSchool || "your school"}.`}
            </p>
          </div>

          <div className="flex bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)] shadow-sm">
            <button
              onClick={() => setTab("personal")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2",
                tab === "personal" ? "bg-[var(--accent)] text-white shadow-sm" : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
              )}
            >
              <Bookmark size={12} /> My Bank
            </button>
            <button
              onClick={() => setTab("school")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 relative",
                tab === "school" ? "bg-[var(--accent)] text-white shadow-sm" : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
              )}
            >
              <Building2 size={12} /> My School
              {!isPro && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                  <Zap size={8} className="text-white fill-white" />
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── My Bank tab ── */}
        {tab === "personal" && (
          <>
            {entries.length === 0 ? (
              <div className="card p-14 flex flex-col items-center justify-center text-center opacity-60">
                <Bookmark size={32} className="text-[var(--text-tertiary)] mb-4" />
                <p className="text-[var(--text)] font-medium mb-1">Your bank is empty</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  While reviewing generated exercises, click the bookmark icon to save any question here.
                </p>
              </div>
            ) : (
              <>
                <div className="relative mb-6">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search your private questions…"
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div className="space-y-4">
                  {filtered.map((entry) => (
                    <BankCard
                      key={entry.id}
                      entry={entry}
                      onRemove={handleRemove}
                      onShare={isPro ? () => handleShare(entry) : undefined}
                      isSchool={false}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── My School tab ── */}
        {tab === "school" && (
          <>
            {/* Pro gate */}
            {!isPro ? (
              <div className="card p-10 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto">
                  <Building2 size={24} className="text-amber-500" />
                </div>
                <h2 className="serif text-xl text-[var(--text)]">Pro feature</h2>
                <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                  The School Bank lets Pro teachers share exercises with colleagues at the same school — building a private, institution-level question repository.
                </p>
                <Link href="/upgrade">
                  <Button className="bg-[var(--accent)] mx-auto">Upgrade to Pro — $5.99/mo</Button>
                </Link>
              </div>
            ) : !userSchool ? (
              /* No school set */
              <div className="card p-10 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center mx-auto">
                  <Building2 size={24} className="text-[var(--accent)]" />
                </div>
                <h2 className="serif text-xl text-[var(--text)]">Set your school first</h2>
                <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                  Add your school name in your account settings. Your colleagues who use the same school name will automatically share the same bank.
                </p>
                <Link href="/account">
                  <Button variant="secondary">Go to Settings</Button>
                </Link>
              </div>
            ) : (
              /* School bank — Pro + school set */
              <>
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-emerald-200 flex-shrink-0">
                      <Globe size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">{userSchool}</p>
                      <p className="text-[11px] text-emerald-700">Share exercises with colleagues at your school.</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white border-emerald-200 text-emerald-600 flex-shrink-0"
                    icon={<Share2 size={12} />}
                    onClick={() => setIsInviteOpen(true)}
                  >
                    Invite Colleagues
                  </Button>
                </div>

                <div className="relative mb-6">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Search ${userSchool}'s bank…`}
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {loadingSchool ? (
                  <div className="py-20 flex flex-col items-center gap-4 opacity-40">
                    <div className="w-6 h-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                    <p className="text-xs font-medium">Fetching shared questions…</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="card p-14 text-center opacity-60 space-y-2">
                    <Building2 size={28} className="text-[var(--text-tertiary)] mx-auto mb-3" />
                    <p className="font-medium text-[var(--text)]">No shared exercises yet</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Go to <strong>My Bank</strong>, hover any exercise, and click the share icon to add it here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filtered.map((entry) => (
                      <BankCard key={entry.id} entry={entry} isSchool />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsInviteOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Building2 size={22} />
                </div>
                <button onClick={() => setIsInviteOpen(false)} className="w-9 h-9 rounded-xl hover:bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-tertiary)] transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div>
                <h3 className="serif text-2xl text-[var(--text)] mb-1">Invite Colleagues</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Colleagues who register with school name <strong className="text-emerald-600">{userSchool}</strong> will automatically join your bank.
                </p>
              </div>

              {/* Invite link */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Invitation Link</label>
                <div className="flex gap-2">
                  <div className="flex-1 h-11 px-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl flex items-center text-xs text-[var(--text-secondary)] truncate">
                    {inviteLink}
                  </div>
                  <button
                    onClick={copyInvite}
                    className={cn(
                      "h-11 w-11 rounded-xl border flex items-center justify-center transition-all",
                      copied ? "border-emerald-400 text-emerald-600 bg-emerald-50" : "border-[var(--border)] text-[var(--text-secondary)] hover:border-emerald-400 hover:text-emerald-600"
                    )}
                  >
                    <Copy size={16} />
                  </button>
                </div>
                {copied && <p className="text-[10px] text-emerald-600 font-medium">Copied!</p>}
              </div>

              {/* Email invite */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Email a Colleague</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendInvite()}
                    placeholder="colleague@school.edu.lb"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <Button
                className="w-full h-12 rounded-2xl bg-emerald-700 hover:bg-emerald-800"
                icon={<Send size={16} />}
                onClick={sendInvite}
              >
                Send Invitation
              </Button>
            </div>

            <div className="bg-slate-50 px-8 py-4 border-t border-[var(--border)]">
              <p className="text-[10px] text-[var(--text-tertiary)] leading-relaxed text-center">
                Exercises shared here are private to your school. Only teachers who register with <strong>{userSchool}</strong> can see them.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Exercise card ──────────────────────────────────────────────────────────────

function BankCard({
  entry,
  onRemove,
  onShare,
  isSchool = false,
}: {
  entry: any;
  onRemove?: (id: string) => void;
  onShare?: () => void;
  isSchool?: boolean;
}) {
  const [showSolution, setShowSolution] = useState(false);
  const ex   = entry.exercise ?? entry;
  const diff = DIFFICULTY_CONFIG[ex.difficulty as keyof typeof DIFFICULTY_CONFIG] ?? DIFFICULTY_CONFIG.medium;
  const subjectLabel = SUBJECT_LABELS[entry.subject]?.fr ?? entry.subject;

  return (
    <div className="card overflow-hidden group">
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">{subjectLabel}</span>
              <span className="text-xs text-[var(--text-tertiary)]">·</span>
              <span className={cn("inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase", diff.color)}>
                {diff.label}
              </span>
            </div>
            {isSchool && entry.contributor && (
              <p className="text-[10px] text-[var(--text-tertiary)]">
                Shared by <span className="font-semibold text-[var(--text-secondary)]">{entry.contributor}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isSchool && onShare && (
              <button onClick={onShare} title="Share with School"
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                <Share2 size={14} />
              </button>
            )}
            {isSchool ? (
              <button title="Save to My Bank"
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors">
                <Bookmark size={14} />
              </button>
            ) : onRemove && (
              <button onClick={() => onRemove(entry.id)} title="Remove"
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="text-[15px] text-[var(--text)] leading-relaxed mb-4"
          dangerouslySetInnerHTML={{ __html: renderContent(ex.statement) }} />

        <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><Award size={12} className="text-[var(--accent)]" /> {ex.points} pts</span>
          <span className="flex items-center gap-1.5"><Clock size={12} className="text-[var(--accent)]" /> {ex.estimatedMinutes} min</span>
          {isSchool && <span className="flex items-center gap-1.5 text-emerald-600"><ShieldCheck size={12} /> School</span>}
        </div>
      </div>

      <div className="border-t border-[var(--border)] bg-[var(--bg-subtle)]/50">
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="w-full flex items-center gap-2 px-5 py-3 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors"
        >
          <BookOpen size={13} />
          <span className="flex-1 text-left font-semibold">View Corrigé</span>
          {showSolution ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        {showSolution && (
          <div className="px-5 pb-5 pt-2 space-y-3">
            <div>
              <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest mb-1.5">Answer</p>
              <div className="text-sm text-[var(--text)] font-medium bg-white p-3 rounded-xl border border-[var(--border)]"
                dangerouslySetInnerHTML={{ __html: renderContent(ex.solution.finalAnswer) }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Methodology</p>
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderContent(ex.solution.methodology) }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
