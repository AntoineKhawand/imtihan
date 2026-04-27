"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Bookmark, 
  Trash2, 
  BookOpen, 
  Award, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Users,
  Building2,
  Globe,
  Share2,
  Download,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { renderContent } from "@/lib/renderContent";
import { cn, SUBJECT_LABELS, formatDate } from "@/lib/utils";
import { getBankExercises, removeFromBank, type BankExercise } from "@/lib/storage";
import { UserNav } from "@/components/layout/UserNav";
import { Logo } from "@/components/ui/Logo";

const DIFFICULTY_CONFIG = {
  easy:   { label: "Easy",   color: "text-emerald-600 bg-emerald-50", dot: "bg-emerald-500" },
  medium: { label: "Medium", color: "text-amber-600 bg-amber-50",     dot: "bg-amber-500"   },
  hard:   { label: "Hard",   color: "text-red-600 bg-red-50",         dot: "bg-red-500"     },
};

// Mock data for School Bank
const MOCK_SCHOOL_BANK: any[] = [
  {
    id: "school-1",
    subject: "mathematics",
    contributor: "M. El Khoury",
    school: "Lycée Franco-Libanais Verdun",
    exercise: {
      statement: "Étudier la convergence de la suite $(u_n)$ définie par $u_0=1$ et $u_{n+1} = \\sqrt{u_n + 2}$.",
      difficulty: "medium",
      points: 5,
      estimatedMinutes: 15,
      solution: {
        finalAnswer: "La suite converge vers 2.",
        methodology: "1. Montrer par récurrence que $0 \\le u_n \\le 2$.\n2. Montrer que la suite est croissante.\n3. Utiliser le théorème de la limite monotone."
      }
    },
    tags: ["Suites", "Récurrence", "Bac Libanais"],
    savedAt: Date.now() - 86400000 * 2
  },
  {
    id: "school-2",
    subject: "physics",
    contributor: "Mme. Haddad",
    school: "Lycée Franco-Libanais Verdun",
    exercise: {
      statement: "Un condensateur de capacité $C = 100\\mu F$ est chargé sous une tension $E = 12V$. Calculer l'énergie emmagasinée.",
      difficulty: "easy",
      points: 3,
      estimatedMinutes: 10,
      solution: {
        finalAnswer: "$W = 7.2 \\times 10^{-3} J$",
        methodology: "Appliquer la formule $W = \\frac{1}{2}CE^2$."
      }
    },
    tags: ["Électricité", "Énergie", "Condensateur"],
    savedAt: Date.now() - 86400000 * 5
  }
];

export default function BankPage() {
  const [entries, setEntries] = useState<BankExercise[]>([]);
  const [tab, setTab] = useState<"personal" | "school">("personal");
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

  const currentList = tab === "personal" ? entries : MOCK_SCHOOL_BANK;

  const filtered = currentList.filter((b) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const ex = b.exercise || b; // Handle slightly different mock structure
    return (
      (SUBJECT_LABELS[b.subject]?.fr ?? b.subject).toLowerCase().includes(q) ||
      (ex.statement || "").toLowerCase().includes(q) ||
      (b.tags || []).some((t: string) => t.toLowerCase().includes(q))
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
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-[var(--bg-subtle)] rounded-lg transition-colors text-[var(--text-secondary)]">
            <ArrowLeft size={20} />
          </Link>
          <Logo size={24} />
        </div>
        <div className="flex items-center gap-4">
          <Link href="/create">
            <Button size="sm" icon={<Plus size={13} />}>New exam</Button>
          </Link>
          <UserNav />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 md:px-10 py-12">
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
                : `${MOCK_SCHOOL_BANK.length} exercises shared by your colleagues.`}
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
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2",
                tab === "school" ? "bg-[var(--accent)] text-white shadow-sm" : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
              )}
            >
              <Building2 size={12} /> My School
            </button>
          </div>
        </div>

        {tab === "school" && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-indigo-200">
                <Globe size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Verdun Shared Bank</p>
                <p className="text-[11px] text-indigo-700">Collaborating with 14 other teachers.</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="bg-white border-indigo-200 text-indigo-600" icon={<Share2 size={12} />}>
              Invite Colleagues
            </Button>
          </div>
        )}

        <div className="relative mb-6">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === "personal" ? "Search your private questions..." : "Search Verdun's shared repository..."}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="card p-14 flex flex-col items-center justify-center text-center opacity-60">
            <Search size={32} className="text-[var(--text-tertiary)] mb-4" />
            <p className="text-[var(--text-secondary)]">No results found in {tab === "personal" ? "your bank" : "the school bank"}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((entry) => (
              <BankCard 
                key={entry.id} 
                entry={entry} 
                onRemove={tab === "personal" ? handleRemove : undefined}
                isSchool={tab === "school"}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function BankCard({ entry, onRemove, isSchool }: { entry: any; onRemove?: (id: string) => void; isSchool?: boolean }) {
  const [showSolution, setShowSolution] = useState(false);
  const ex = entry.exercise || entry;
  const diff = DIFFICULTY_CONFIG[ex.difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG.medium;
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
            {isSchool && (
              <p className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
                Shared by <span className="font-semibold text-[var(--text-secondary)]">{entry.contributor}</span>
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isSchool ? (
              <button className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors">
                <Download size={14} />
              </button>
            ) : (
              <button onClick={() => onRemove?.(entry.id)} className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="text-[15px] text-[var(--text)] leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: renderContent(ex.statement) }} />

        <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><Award size={12} className="text-[var(--accent)]" /> {ex.points} Points</span>
          <span className="flex items-center gap-1.5"><Clock size={12} className="text-[var(--accent)]" /> {ex.estimatedMinutes} Min</span>
          {isSchool && <span className="flex items-center gap-1.5 text-emerald-600"><ShieldCheck size={12} /> Verified</span>}
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
          <div className="px-5 pb-5 pt-2 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div>
              <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest mb-1.5">Answer</p>
              <div className="text-sm text-[var(--text)] font-medium bg-white p-3 rounded-xl border border-[var(--border)] shadow-sm" dangerouslySetInnerHTML={{ __html: renderContent(ex.solution.finalAnswer) }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Methodology</p>
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed" dangerouslySetInnerHTML={{ __html: renderContent(ex.solution.methodology) }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const ArrowLeft = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);
