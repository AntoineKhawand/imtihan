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
  AlertCircle,
  Calendar,
  Layers,
  Zap,
  Globe,
  Plus
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { UserNav } from "@/components/layout/UserNav";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
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
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>
          <div className="w-px h-6 bg-[var(--border)] hidden md:block" />
          <Logo size={28} />
        </div>
        <div className="flex items-center gap-4">
          <Link href="/create"><Button size="sm" icon={<Plus size={13} />}>New exam</Button></Link>
          <UserNav />
        </div>
      </nav>
      
      <div className="flex flex-1">
        <DashboardSidebar />
        
        <main className="flex-1 max-w-6xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-4 border border-emerald-100">
                <Target size={12} />
                Syllabus Tracker
              </div>
              <h1 className="serif text-5xl text-[var(--text)] mb-3 tracking-tight">Curriculum Analytics</h1>
              <p className="text-[var(--text-secondary)] text-lg max-w-2xl font-light">
                Monitor your progress through the official {curriculum?.name?.en || curriculumId} syllabus.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[var(--surface)] p-1.5 rounded-2xl border border-[var(--border)] shadow-xl shadow-black/5">
              {subjects.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-xs font-bold transition-all",
                    selectedSubject === s 
                      ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20" 
                      : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)]"
                  )}
                >
                  {SUBJECT_LABELS[s]?.fr || s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            {/* Coverage Hero Card */}
            <div className="lg:col-span-4 card p-10 bg-gradient-to-br from-indigo-700 to-violet-800 text-white border-none shadow-2xl shadow-indigo-300 rounded-[3rem] flex flex-col items-center text-center overflow-hidden relative">
              {/* Background Art - Logo Watermark */}
              <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none scale-150 rotate-12">
                <Logo size={240} showText={false} />
              </div>
              
              <div className="relative w-48 h-48 mb-10 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    strokeDasharray="100, 100"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-white transition-all duration-1000 ease-out"
                    strokeDasharray={`${coveragePercent}, 100`}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                {/* Center dot in circle */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-xl shadow-white/50 z-10" />
                
                <div className="flex flex-col items-center justify-center z-10">
                  <span className="serif text-6xl font-light tracking-tighter leading-none mb-1">{coveragePercent}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70">Complete</span>
                </div>
              </div>
              
              <h3 className="serif text-3xl mb-4 tracking-tight">Teaching Mastery</h3>
              <p className="text-indigo-100/70 text-sm font-light leading-relaxed mb-10 max-w-[240px]">
                You have covered <strong>{coveredChapterIds.size}</strong> out of <strong>{allChapters.length || 0}</strong> core chapters for this level.
              </p>
              
              <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10 mt-auto shadow-inner">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest mb-3">
                  <span className="opacity-70">Current Pace</span>
                  <span className="text-emerald-300">+12% vs last month</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 shadow-sm shadow-emerald-400/50" style={{ width: '70%' }} />
                </div>
              </div>
            </div>

            {/* Distribution Graph */}
            <div className="lg:col-span-8 card p-10 bg-white border-none shadow-2xl shadow-black/5 rounded-[2.5rem]">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="serif text-2xl text-[var(--text)] mb-1">Difficulty Trends</h3>
                  <p className="text-sm text-[var(--text-secondary)] font-light">Distribution of exercise levels across your recent exams.</p>
                </div>
                <div className="hidden md:flex gap-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-tertiary)] tracking-widest">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200" /> EASY
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-tertiary)] tracking-widest">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-200" /> MEDIUM
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-tertiary)] tracking-widest">
                    <span className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-200" /> HARD
                  </div>
                </div>
              </div>
              
              <div className="space-y-10">
                {subjectExams.slice(0, 4).map((exam, i) => {
                  const easy = exam.exercises.filter(e => e.difficulty === 'easy').length;
                  const medium = exam.exercises.filter(e => e.difficulty === 'medium').length;
                  const hard = exam.exercises.filter(e => e.difficulty === 'hard').length;
                  const total = exam.exercises.length;
                  
                  return (
                    <div key={exam.id} className="group relative">
                      <div className="flex items-end justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--accent-light)] group-hover:text-[var(--accent)] transition-all">
                            <Calendar size={18} />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{exam.title}</span>
                            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest mt-0.5">{new Date(exam.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-[var(--text-secondary)]">{total} Exercises</span>
                        </div>
                      </div>
                      <div className="flex h-3 rounded-full overflow-hidden bg-[var(--bg-subtle)] p-0.5 border border-[var(--border)]">
                        <div className="bg-emerald-500 rounded-l-full transition-all duration-1000" style={{ width: `${(easy / total) * 100}%` }} />
                        <div className="bg-amber-500 transition-all duration-1000" style={{ width: `${(medium / total) * 100}%` }} />
                        <div className="bg-red-500 rounded-r-full transition-all duration-1000" style={{ width: `${(hard / total) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="card overflow-hidden bg-white border-none shadow-2xl shadow-black/5 rounded-[2.5rem]">
            <div className="p-8 border-b border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
              <div>
                <h3 className="serif text-2xl text-[var(--text)] mb-1 flex items-center gap-3">
                  <Layers size={24} className="text-indigo-600" />
                  Syllabus Breakdown
                </h3>
                <p className="text-sm text-[var(--text-secondary)] font-light">Chapter-by-chapter coverage for {level?.name?.en || curriculumId}.</p>
              </div>
              {coveragePercent < 100 && (
                <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold flex items-center gap-2 shadow-sm">
                  <AlertCircle size={14} />
                  {allChapters.length - coveredChapterIds.size} CHAPTERS REMAINING
                </div>
              )}
            </div>
            
            <div className="divide-y divide-[var(--border)]">
              {allChapters.map((chapter: any) => {
                const isCovered = coveredChapterIds.has(chapter.id);
                return (
                  <div key={chapter.id} className="p-8 flex items-start justify-between gap-10 hover:bg-slate-50/50 transition-all group">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                          isCovered ? "bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-100" : "bg-slate-100 text-slate-400"
                        )}>
                          {isCovered ? <CheckCircle2 size={20} /> : <BookOpen size={20} />}
                        </div>
                        <div>
                          <h4 className={cn("font-bold text-lg tracking-tight", isCovered ? "text-[var(--text)]" : "text-slate-400")}>
                            {chapter.name.en}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{chapter.id}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 pl-14">
                        {chapter.objectives.map((obj: string) => (
                          <div key={obj} className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <div className={cn("w-1.5 h-1.5 rounded-full", isCovered ? "bg-emerald-400" : "bg-slate-200")} />
                            {obj}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 pt-1">
                      {isCovered ? (
                        <div className="px-4 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100 flex items-center gap-2">
                          <CheckCircle2 size={12} /> COVERED
                        </div>
                      ) : (
                        <Link href={`/create?chapter=${chapter.id}&subject=${currentSubject}&level=${firstExam?.context.levelId}&curriculum=${curriculumId}`}>
                          <button className="h-10 px-5 rounded-xl border border-[var(--border)] text-slate-500 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50/50 text-xs font-bold transition-all flex items-center gap-2 group-hover:scale-105">
                            Generate Exam <ChevronRight size={14} />
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-10 bg-slate-50 text-center">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs font-medium shadow-sm">
                <Globe size={14} className="text-indigo-600" />
                Data sourced from official Ministry of Education & IB guidelines
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
