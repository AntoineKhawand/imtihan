"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { 
  CheckCircle2, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  Plus, 
  ArrowLeft, 
  Trash2, 
  Sparkles,
  ClipboardCheck,
  AlertCircle,
  Award
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { UserNav } from "@/components/layout/UserNav";
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold mb-3">
              <ClipboardCheck size={12} />
              AI Assistant Grading
            </div>
            <h1 className="serif text-4xl text-[var(--text)] mb-2">Paper Grader</h1>
            <p className="text-[var(--text-secondary)]">Automate correction by comparing student work against your marking scheme.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Config Section */}
          <div className="space-y-6 lg:col-span-1">
            <div className="card p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">1. Select Exercise</label>
                <select 
                  value={selectedExamId} 
                  onChange={(e) => {
                    setSelectedExamId(e.target.value);
                    const exam = exams.find(ex => ex.id === e.target.value);
                    if (exam && exam.exercises.length > 0) setSelectedExerciseId(exam.exercises[0].id);
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] mb-3"
                >
                  {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
                
                <select 
                  value={selectedExerciseId} 
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                >
                  {selectedExam?.exercises.map((ex, i) => (
                    <option key={ex.id} value={ex.id}>Exercise {i + 1}: {ex.statement.slice(0, 30)}...</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">2. Upload Student Work</label>
                <div 
                  {...getRootProps()} 
                  className={cn(
                    "relative aspect-square rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer overflow-hidden",
                    isDragActive ? "border-[var(--accent)] bg-[var(--accent-light)]/50" : "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--surface)]",
                    preview ? "border-solid" : ""
                  )}
                >
                  <input {...getInputProps()} />
                  {preview ? (
                    <img src={preview} alt="Student Work" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <ImageIcon size={24} className="text-[var(--text-tertiary)] mb-2" />
                      <p className="text-[11px] text-[var(--text-secondary)] font-medium">Click to upload photo of student answer</p>
                    </div>
                  )}
                </div>
              </div>

              <Button 
                onClick={handleGrade} 
                className="w-full h-11 rounded-xl" 
                loading={loading}
                disabled={!preview || !selectedExerciseId}
                icon={<Sparkles size={16} />}
              >
                Grade with AI
              </Button>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-6">
            {!result && !loading && (
              <div className="card aspect-video flex flex-col items-center justify-center p-12 text-center opacity-50 border-dashed border-2">
                <ClipboardCheck size={48} className="text-[var(--text-tertiary)] mb-4" />
                <h3 className="font-semibold text-[var(--text)] mb-1">Waiting for Submission</h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-sm">Select an exercise and upload a student's answer to start the AI grading process.</p>
              </div>
            )}

            {loading && (
              <div className="card p-12 flex flex-col items-center justify-center text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={32} className="text-indigo-600" />
                  </div>
                </div>
                <h3 className="serif text-2xl text-[var(--text)] mb-3">Analyzing Student Work...</h3>
                <div className="space-y-2 w-full max-w-xs">
                  <div className="h-1.5 w-full bg-indigo-50 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 animate-progress" />
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] uppercase font-bold tracking-widest animate-pulse">Reading handwriting · Comparing to marking scheme</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Score Header */}
                <div className="card p-6 flex items-center justify-between bg-indigo-600 text-white border-none shadow-xl shadow-indigo-200">
                  <div>
                    <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mb-1">Overall Performance</p>
                    <h2 className="serif text-3xl">Grade Result</h2>
                  </div>
                  <div className="text-right">
                    <div className="flex items-end justify-end gap-1">
                      <span className="serif text-5xl font-light">{result.totalScore}</span>
                      <span className="serif text-xl opacity-60 mb-2">/ {result.maxScore}</span>
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card p-6">
                    <h3 className="font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                      <Award size={18} className="text-indigo-600" />
                      Points Breakdown
                    </h3>
                    <div className="space-y-4">
                      {result.breakdown.map((item: any, i: number) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-xs font-medium text-[var(--text)]">{item.criterion}</p>
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full",
                              item.pointsAwarded === item.maxPoints ? "bg-emerald-100 text-emerald-700" : 
                              item.pointsAwarded > 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                            )}>
                              {item.pointsAwarded}/{item.maxPoints}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] italic leading-relaxed pl-3 border-l-2 border-[var(--border)]">{item.feedback}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="card p-6 bg-emerald-50 border-emerald-100">
                      <h3 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                        AI Feedback
                      </h3>
                      <p className="text-xs text-emerald-800 leading-relaxed">{result.generalFeedback}</p>
                    </div>

                    <div className="card p-6 bg-amber-50 border-amber-100">
                      <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                        <AlertCircle size={18} className="text-amber-600" />
                        Tips for Student
                      </h3>
                      <ul className="space-y-2">
                        {result.improvementTips.map((tip: string, i: number) => (
                          <li key={i} className="text-[11px] text-amber-800 flex items-start gap-2">
                            <span className="mt-1 w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
