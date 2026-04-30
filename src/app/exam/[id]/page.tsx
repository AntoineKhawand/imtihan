"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Clock, Shield, CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { renderContent } from "@/lib/renderContent";

export default function StudentExamPage() {
  const { id } = useParams();
  const router = useRouter();
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Anti-cheating states
  const [warnings, setWarnings] = useState(0);
  const [isTabBlurred, setIsTabBlurred] = useState(false);

  useEffect(() => {
    async function loadExam() {
      try {
        const docRef = doc(db, "live_exams", id as string);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          setError("Exam not found or has been closed by the teacher.");
          return;
        }
        const data = docSnap.data();
        setExam(data);
        setTimeLeft(data.settings.timeLimit * 60);
      } catch (e) {
        setError("Failed to load exam. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [id]);

  // Anti-cheating: Tab Blur Detection
  useEffect(() => {
    if (!started || submitted) return;

    const handleBlur = () => {
      setIsTabBlurred(true);
      setWarnings(prev => prev + 1);
    };

    const handleFocus = () => {
      setIsTabBlurred(false);
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    // Disable right-click and copy
    const preventAction = (e: any) => e.preventDefault();
    document.addEventListener("contextmenu", preventAction);
    document.addEventListener("copy", preventAction);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("contextmenu", preventAction);
      document.removeEventListener("copy", preventAction);
    };
  }, [started, submitted]);

  // Timer logic
  useEffect(() => {
    if (!started || submitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, submitted, timeLeft]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "exam_submissions"), {
        examId: id,
        answers,
        warnings,
        timeSpent: exam.settings.timeLimit * 60 - timeLeft,
        submittedAt: serverTimestamp()
      });
      setSubmitted(true);
    } catch (e) {
      alert("Failed to submit answers. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Logo size={40} className="animate-pulse" /></div>;
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
    <AlertCircle size={48} className="text-red-500 mb-4" />
    <h1 className="text-xl font-bold mb-2">Oops!</h1>
    <p className="text-gray-500">{error}</p>
  </div>;

  if (submitted) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-emerald-50">
      <CheckCircle2 size={64} className="text-emerald-500 mb-6 animate-bounce" />
      <h1 className="text-3xl font-bold text-emerald-900 mb-2">Well Done!</h1>
      <p className="text-emerald-700 mb-8 max-w-sm">Your answers have been securely submitted to your teacher.</p>
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-emerald-100 w-full max-w-xs">
        <div className="flex justify-between text-sm mb-2 text-gray-500">
          <span>Warnings:</span>
          <span className={warnings > 0 ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>{warnings}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Time:</span>
          <span className="font-bold text-gray-900">{Math.floor((exam.settings.timeLimit * 60 - timeLeft) / 60)}m { (exam.settings.timeLimit * 60 - timeLeft) % 60}s</span>
        </div>
      </div>
    </div>
  );

  if (!started) return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full card p-8 text-center space-y-6">
        <Logo size={32} className="mx-auto" />
        <div>
          <h1 className="serif text-3xl text-[var(--text)] mb-2">{exam.title}</h1>
          <p className="text-[var(--text-secondary)]">{exam.context.subject} — {exam.context.levelId}</p>
        </div>

        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center gap-1">
            <Clock size={20} className="text-[var(--accent)]" />
            <span className="text-xs font-bold text-[var(--text-secondary)]">{exam.settings.timeLimit} Minutes</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Shield size={20} className="text-[var(--accent)]" />
            <span className="text-xs font-bold text-[var(--text-secondary)]">Proctor Mode</span>
          </div>
        </div>

        <div className="text-left bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-2">
          <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <Lock size={12} /> ANTI-CHEATING ACTIVE
          </p>
          <ul className="text-[10px] text-amber-800 space-y-1">
            <li>• Tab switching is monitored and reported to your teacher.</li>
            <li>• Right-click and copy-paste are disabled.</li>
            <li>• Re-entering the exam will be logged.</li>
          </ul>
        </div>

        <Button onClick={() => setStarted(true)} className="w-full h-14 rounded-2xl text-lg font-bold">
          Start Exam
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col select-none" onContextMenu={(e) => e.preventDefault()}>
      {/* Header */}
      <nav className="sticky top-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-[var(--border)] px-6 flex items-center justify-between">
        <Logo size={24} />
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold tabular-nums transition-colors",
            timeLeft < 300 ? "bg-red-50 text-red-600 animate-pulse" : "bg-gray-100 text-gray-700"
          )}>
            <Clock size={16} />
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
          <Button onClick={handleSubmit} loading={isSubmitting} size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-10 px-6 rounded-xl shadow-lg shadow-emerald-100">
            Submit
          </Button>
        </div>
      </nav>

      {/* Tab Blur Warning Overlay */}
      {isTabBlurred && (
        <div className="fixed inset-0 z-[100] bg-red-600/90 backdrop-blur-xl flex items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="max-w-sm space-y-6">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto shadow-2xl">
              <Shield size={40} className="text-red-600 animate-bounce" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white mb-2 italic">WARNING!</h2>
              <p className="text-red-50 leading-relaxed font-medium">
                You have left the exam window. This incident has been reported. Repeated violations may lead to disqualification.
              </p>
            </div>
            <Button variant="secondary" onClick={() => setIsTabBlurred(false)} className="w-full h-12 rounded-xl">
              I Understand, Continue
            </Button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 space-y-12">
        {exam.exercises.map((ex: any, idx: number) => (
          <div key={ex.id || idx} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex items-center justify-between">
              <h2 className="serif text-2xl text-[var(--text)]">Exercise {idx + 1}</h2>
              <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">{ex.points} Points</span>
            </div>
            <div className="prose prose-imtihan max-w-none text-[var(--text)] bg-white p-8 rounded-3xl border border-[var(--border)] shadow-sm">
              <div dangerouslySetInnerHTML={{ __html: renderContent(ex.statement) }} />
              
              {ex.subQuestions && ex.subQuestions.length > 0 && (
                <div className="mt-6 space-y-6 pl-4 border-l-2 border-[var(--bg-subtle)]">
                  {ex.subQuestions.map((sq: any, sIdx: number) => (
                    <div key={sIdx} className="space-y-3">
                      <div className="flex gap-2">
                        <span className="font-bold text-[var(--accent)]">{sq.label}</span>
                        <div className="flex-1" dangerouslySetInnerHTML={{ __html: renderContent(sq.statement) }} />
                        <span className="text-[10px] font-bold text-[var(--text-tertiary)] whitespace-nowrap">({sq.points} pts)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 space-y-4">
                <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Your Answer:</p>
                <textarea 
                  value={answers[ex.id] || ""}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [ex.id]: e.target.value }))}
                  placeholder="Type your steps and final answer here..."
                  className="w-full min-h-[160px] p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--accent)] focus:ring-0 text-sm transition-all resize-none"
                />
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
