"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { 
  CheckCircle2, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  Plus, 
  Trash2, 
  Sparkles,
  ClipboardCheck,
  AlertCircle,
  Award,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Zap,
  Target,
  FileText
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { UserNav } from "@/components/layout/UserNav";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { getSavedExams, type SavedExam } from "@/lib/storage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function GradePage() {
  const [exams, setExams] = useState<SavedExam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const saved = getSavedExams();
    setExams(saved);
    if (saved.length > 0) {
      setSelectedExamId(saved[0].id);
      if (saved[0].exercises.length > 0) {
        setSelectedExerciseId(saved[0].exercises[0].id);
      }
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false
  });

  async function handleGrade() {
    if (!preview || !selectedExerciseId) return;
    
    const exam = exams.find(e => e.id === selectedExamId);
    const exercise = exam?.exercises.find(ex => ex.id === selectedExerciseId);
    
    if (!exercise) return;

    setLoading(true);
    try {
      const base64 = preview.split(',')[1];
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          studentImage: base64, 
          mimeType: file?.type,
          markingScheme: exercise.solution.bareme || exercise.solution.microBareme || [],
          exerciseStatement: exercise.statement
        })
      });
      
      if (!res.ok) throw new Error("Failed to grade student work");
      const data = await res.json();
      setResult(data);
      toast.success("Grading complete!");
    } catch (error) {
      toast.error("Grading failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const selectedExam = exams.find(e => e.id === selectedExamId);
  const selectedExercise = selectedExam?.exercises.find(ex => ex.id === selectedExerciseId);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl sticky top-0 z-40">
        <Logo size={24} />
        <UserNav />
      </nav>

      <div className="flex flex-1">
        <DashboardSidebar />
        
        <main className="flex-1 max-w-6xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-4 border border-indigo-100">
              <ClipboardCheck size={12} />
              AI Examiner Assistant
            </div>
            <h1 className="serif text-5xl text-[var(--text)] mb-3 tracking-tight">Automated Grading</h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl font-light">
              Grade student work instantly by comparing their handwritten answers against your official marking schemes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Configuration */}
            <div className="lg:col-span-4 space-y-6">
              <div className="card p-8 space-y-8 bg-white border-none shadow-2xl shadow-black/5 rounded-[2rem]">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-4">1. Targeted Exercise</label>
                  <div className="space-y-3">
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 group-hover:scale-110 transition-transform">
                        <FileText size={16} />
                      </div>
                      <select 
                        value={selectedExamId} 
                        onChange={(e) => {
                          setSelectedExamId(e.target.value);
                          const exam = exams.find(ex => ex.id === e.target.value);
                          if (exam && exam.exercises.length > 0) setSelectedExerciseId(exam.exercises[0].id);
                        }}
                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                      >
                        {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 group-hover:scale-110 transition-transform">
                        <Target size={16} />
                      </div>
                      <select 
                        value={selectedExerciseId} 
                        onChange={(e) => setSelectedExerciseId(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                      >
                        {selectedExam?.exercises.map((ex, i) => (
                          <option key={ex.id} value={ex.id}>Exercise {i + 1}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-4">2. Student Work</label>
                  <div 
                    {...getRootProps()} 
                    className={cn(
                      "relative aspect-[4/3] rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer overflow-hidden group",
                      isDragActive ? "border-indigo-500 bg-indigo-50" : "border-[var(--border)] hover:border-indigo-400 bg-[var(--bg)]",
                      preview ? "border-solid border-white/20" : ""
                    )}
                  >
                    <input {...getInputProps()} />
                    {preview ? (
                      <>
                        <img src={preview} alt="Student Work" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-bold">Replace Photo</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Upload size={24} />
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] font-semibold leading-relaxed max-w-[140px]">Upload student's answer photo</p>
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={handleGrade} 
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-700 shadow-xl shadow-indigo-200" 
                  loading={loading}
                  disabled={!preview || !selectedExerciseId || loading}
                  icon={<Sparkles size={20} />}
                >
                  Grade Submission
                </Button>
              </div>

              {selectedExercise && (
                <div className="card p-6 bg-indigo-50/50 border-indigo-100/50">
                  <h4 className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Info size={12} /> Marking Scheme Loaded
                  </h4>
                  <p className="text-xs text-indigo-900/70 italic leading-relaxed">
                    AI will use the built-in {selectedExercise.solution.bareme?.length || selectedExercise.solution.microBareme?.length || 0} grading criteria for this exercise.
                  </p>
                </div>
              )}
            </div>

            {/* Right: Results / Analyzing */}
            <div className="lg:col-span-8">
              {!result && !loading && (
                <div className="card h-full p-12 flex flex-col items-center justify-center text-center opacity-60 bg-[var(--surface)] border-none shadow-inner border-2 border-dashed border-[var(--border)] rounded-[2rem]">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                    <ClipboardCheck size={40} className="text-[var(--text-tertiary)]" />
                  </div>
                  <h3 className="serif text-2xl text-[var(--text)] mb-2">Ready for Grading</h3>
                  <p className="text-sm text-[var(--text-tertiary)] max-w-sm">
                    Once you upload a photo, Imtihan AI will analyze the handwriting and evaluate it against your criteria.
                  </p>
                </div>
              )}

              {loading && (
                <div className="card h-full p-12 flex flex-col items-center justify-center text-center bg-white border-none shadow-2xl shadow-black/5 rounded-[2rem] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-100 overflow-hidden">
                    <div className="h-full bg-indigo-600 animate-loading-bar" />
                  </div>
                  
                  <div className="relative mb-10">
                    <div className="w-24 h-24 rounded-full border-4 border-indigo-50 border-t-indigo-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap size={40} className="text-indigo-600 fill-indigo-600 animate-pulse" />
                    </div>
                  </div>
                  
                  <h2 className="serif text-4xl text-[var(--text)] mb-3">Analyzing Response</h2>
                  <div className="space-y-3 w-full max-w-xs">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em] animate-pulse">Scanning Handwriting</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                      Detecting intent and comparing against the marking scheme...
                    </p>
                  </div>
                </div>
              )}

              {result && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-700 space-y-8">
                  {/* Score Header */}
                  <div className="card p-10 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-800 text-white border-none shadow-2xl shadow-indigo-300 rounded-[2.5rem] relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Award size={160} />
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest mb-6 border border-white/30">
                          <CheckCircle2 size={12} />
                          Final Grade Report
                        </div>
                        <h2 className="serif text-5xl mb-2">Grade: {result.totalScore} <span className="opacity-50 text-3xl">/ {result.maxScore}</span></h2>
                        <p className="text-indigo-100 font-light text-lg">Detailed AI evaluation complete.</p>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center min-w-[140px]">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Percentage</p>
                        <p className="serif text-4xl font-light">{Math.round((result.totalScore / result.maxScore) * 100)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Points Breakdown */}
                    <div className="card p-8 bg-white border-none shadow-2xl shadow-black/5 rounded-[2rem]">
                      <h3 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Award size={16} className="text-indigo-600" />
                        Criteria Analysis
                      </h3>
                      <div className="space-y-6">
                        {result.breakdown.map((item: any, i: number) => (
                          <div key={i} className="group">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <p className="text-sm font-semibold text-[var(--text)] group-hover:text-indigo-600 transition-colors">{item.criterion}</p>
                              <span className={cn(
                                "text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap",
                                item.pointsAwarded === item.maxPoints ? "bg-emerald-100 text-emerald-700" : 
                                item.pointsAwarded > 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                              )}>
                                {item.pointsAwarded} / {item.maxPoints} pts
                              </span>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed pl-4 border-l-2 border-indigo-100 group-hover:border-indigo-500 transition-colors">
                              {item.feedback}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Feedback & Tips */}
                    <div className="space-y-8">
                      <div className="card p-8 bg-emerald-50 border-none shadow-xl shadow-emerald-100/50 rounded-[2rem]">
                        <h3 className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <Zap size={16} className="fill-emerald-500 text-emerald-500" />
                          Teacher's Summary
                        </h3>
                        <p className="text-sm text-emerald-900/80 leading-relaxed font-medium">
                          &quot;{result.generalFeedback}&quot;
                        </p>
                      </div>

                      <div className="card p-8 bg-amber-50 border-none shadow-xl shadow-amber-100/50 rounded-[2rem]">
                        <h3 className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <Plus size={16} className="text-amber-500" />
                          Improvement Tips
                        </h3>
                        <div className="space-y-3">
                          {result.improvementTips.map((tip: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 bg-white/50 p-3 rounded-xl border border-amber-200/50">
                              <div className="w-5 h-5 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0 text-[10px] font-bold">
                                {i + 1}
                              </div>
                              <p className="text-xs text-amber-900/80 font-medium">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 2s linear infinite;
        }
      `}</style>
    </div>
  );
}

const Info = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
  </svg>
);


