"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  BookOpen, 
  Target, 
  BarChart3, 
  ChevronRight, 
  Sparkles, 
  ArrowLeft,
  PieChart,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { UserNav } from "@/components/layout/UserNav";
import { getSavedExams, type SavedExam } from "@/lib/storage";
import { bacLibanais } from "@/data/curricula/bac-libanais";
import { bacFrancais } from "@/data/curricula/bac-francais";
import { ib } from "@/data/curricula/ib";
import { SUBJECT_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";

const CURRICULA_DATA: Record<string, any> = {
  "bac-libanais": bacLibanais,
  "bac-francais": bacFrancais,
  "ib": ib
};

export default function AnalyticsPage() {
  const [exams, setExams] = useState<SavedExam[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    const saved = getSavedExams();
    setExams(saved);
    if (saved.length > 0) {
      setSelectedSubject(saved[0].context.subject);
    }
  }, []);

  if (!mounted) return null;

  // Calculate coverage
  const subjects = Array.from(new Set(exams.map(e => e.context.subject)));
  const currentSubject = selectedSubject || subjects[0];
  
  const subjectExams = exams.filter(e => e.context.subject === currentSubject);
  const coveredChapterIds = new Set(subjectExams.flatMap(e => e.exercises.flatMap(ex => ex.chapterIds || [])));

  // Find curriculum for the current subject (guessing from first exam)
  const firstExam = subjectExams[0];
  const curriculumId = firstExam?.context.curriculumId || "bac-libanais";
  const curriculum = CURRICULA_DATA[curriculumId];
  const level = curriculum?.levels.find((l: any) => l.id === firstExam?.context.levelId);
  const allChapters = level?.chapters?.[currentSubject] || [];
  
  const coveragePercent = allChapters.length > 0 
    ? Math.round((coveredChapterIds.size / allChapters.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-[var(--bg-subtle)] rounded-lg transition-colors text-[var(--text-secondary)]">
            <ArrowLeft size={20} />
          </Link>
          <Logo size={24} />
        </div>
        <UserNav />
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-xs font-semibold mb-3">
              <TrendingUp size={12} />
              Curriculum Tracking
            </div>
            <h1 className="serif text-4xl text-[var(--text)] mb-2">Teaching Analytics</h1>
            <p className="text-[var(--text-secondary)]">Monitor your curriculum coverage and exam difficulty trends.</p>
          </div>

          <div className="flex items-center gap-3 bg-[var(--surface)] p-1.5 rounded-2xl border border-[var(--border)]">
            {subjects.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                  selectedSubject === s 
                    ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20" 
                    : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)]"
                )}
              >
                {SUBJECT_LABELS[s]?.fr || s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Coverage Card */}
          <div className="card p-6 flex flex-col items-center text-center">
            <div className="relative w-32 h-32 mb-6">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-[var(--border)]"
                  strokeDasharray="100, 100"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[var(--accent)] transition-all duration-1000"
                  strokeDasharray={`${coveragePercent}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="serif text-3xl font-light text-[var(--text)]">{coveragePercent}%</span>
                <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider">Coverage</span>
              </div>
            </div>
            <h3 className="font-semibold text-[var(--text)] mb-1">Syllabus Progress</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              You have covered {coveredChapterIds.size} out of {allChapters.length} core chapters for {level?.name?.en || "this level"}.
            </p>
          </div>

          {/* Difficulty Trends */}
          <div className="card p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-[var(--text)] flex items-center gap-2">
                <BarChart3 size={18} className="text-[var(--accent)]" />
                Difficulty Distribution
              </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-tertiary)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> EASY
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-tertiary)]">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> MEDIUM
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-tertiary)]">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> HARD
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {subjectExams.slice(0, 5).map((exam, i) => {
                const easy = exam.exercises.filter(e => e.difficulty === 'easy').length;
                const medium = exam.exercises.filter(e => e.difficulty === 'medium').length;
                const hard = exam.exercises.filter(e => e.difficulty === 'hard').length;
                const total = exam.exercises.length;
                
                return (
                  <div key={exam.id} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{exam.title}</span>
                      <span className="text-[10px] text-[var(--text-tertiary)]">{new Date(exam.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-[var(--bg-subtle)]">
                      <div className="bg-emerald-500 transition-all" style={{ width: `${(easy / total) * 100}%` }} />
                      <div className="bg-amber-500 transition-all" style={{ width: `${(medium / total) * 100}%` }} />
                      <div className="bg-red-500 transition-all" style={{ width: `${(hard / total) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Chapter Breakdown */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)]">
            <h3 className="font-semibold text-[var(--text)] flex items-center gap-2">
              <BookOpen size={18} className="text-[var(--accent)]" />
              Syllabus Chapters — {level?.name?.en || curriculumId}
            </h3>
            {coveragePercent < 100 && (
              <div className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold flex items-center gap-1.5">
                <AlertCircle size={12} />
                {allChapters.length - coveredChapterIds.size} CHAPTERS REMAINING
              </div>
            )}
          </div>
          
          <div className="divide-y divide-[var(--border)]">
            {allChapters.map((chapter: any) => {
              const isCovered = coveredChapterIds.has(chapter.id);
              return (
                <div key={chapter.id} className="p-6 flex items-start justify-between gap-6 hover:bg-[var(--bg-subtle)]/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className={cn("font-medium text-sm", isCovered ? "text-[var(--text)]" : "text-[var(--text-secondary)]")}>
                        {chapter.name.en}
                      </h4>
                      {isCovered && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-wider">
                          Covered
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {chapter.objectives.map((obj: string) => (
                        <div key={obj} className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                          <div className={cn("w-1 h-1 rounded-full", isCovered ? "bg-emerald-400" : "bg-[var(--border)]")} />
                          {obj}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 pt-1">
                    {isCovered ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 size={18} />
                      </div>
                    ) : (
                      <Link href={`/create?chapter=${chapter.id}&subject=${currentSubject}&level=${firstExam?.context.levelId}&curriculum=${curriculumId}`}>
                        <button className="h-8 px-3 rounded-lg border border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-xs font-semibold transition-all flex items-center gap-2">
                          Generate <ChevronRight size={12} />
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
