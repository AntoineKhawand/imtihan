"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { 
  Scan, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Sparkles,
  Bookmark,
  ChevronLeft,
  Zap,
  Info
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { UserNav } from "@/components/layout/UserNav";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { ExerciseCard } from "@/components/ui/ExerciseCard";
import { saveToBank } from "@/lib/storage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ScannerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [scanStep, setScanStep] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
      setResult(null);
      setScanStep(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false
  });

  async function handleScan() {
    if (!preview) return;
    setLoading(true);
    setScanStep(1);
    
    // Artificial delay for premium feel / scanning animation visibility
    const animationTimer = setInterval(() => {
      setScanStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 1500);

    try {
      const base64 = preview.split(',')[1];
      const res = await fetch("/api/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType: file?.type })
      });
      
      if (!res.ok) throw new Error("Failed to scan image");
      const data = await res.json();
      
      // Ensure animation finishes before showing result
      setTimeout(() => {
        clearInterval(animationTimer);
        setResult(data);
        setScanStep(4);
        toast.success("Exercise digitized successfully!");
      }, 2000);
      
    } catch (error) {
      clearInterval(animationTimer);
      toast.error("Scanning failed. Please try a clearer photo.");
      setScanStep(0);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    try {
      saveToBank({
        ...result,
        id: crypto.randomUUID(),
        createdAt: Date.now()
      });
      toast.success("Added to your Question Bank");
      setResult(null);
      setFile(null);
      setPreview(null);
    } catch (error) {
      toast.error("Failed to save exercise");
    }
  }

  const STEPS = [
    "Analyzing handwriting...",
    "Extracting scientific notation...",
    "Structuring exercise object...",
    "Finalizing LaTeX formatting..."
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Logo size={24} />
        </div>
        <UserNav />
      </nav>

      <div className="flex flex-1">
        <DashboardSidebar />
        
        <main className="flex-1 max-w-6xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-widest mb-4 border border-amber-100">
              <Sparkles size={12} />
              AI Vision Powered
            </div>
            <h1 className="serif text-5xl text-[var(--text)] mb-3 tracking-tight">AI Exam Scanner</h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl font-light">
              Transform paper questions into professional digital exercises in seconds. No more retyping.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Upload & Preview */}
            <div className="lg:col-span-5 space-y-6">
              <div 
                {...getRootProps()} 
                className={cn(
                  "relative aspect-[3/4] rounded-[2rem] border-2 border-dashed transition-all overflow-hidden group shadow-2xl shadow-black/5",
                  isDragActive ? "border-[var(--accent)] bg-[var(--accent-light)]/50" : "border-[var(--border)] hover:border-[var(--accent)] bg-[var(--surface)]",
                  preview ? "border-solid border-white/20" : ""
                )}
              >
                <input {...getInputProps()} />
                
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    
                    {/* Scanning Animation */}
                    {loading && (
                      <div className="absolute inset-0 z-10">
                        <div className="w-full h-1 bg-[var(--accent)] absolute animate-scan-line shadow-[0_0_20px_var(--accent)] opacity-80" />
                        <div className="absolute inset-0 bg-[var(--accent)]/10 backdrop-blur-[1px]" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity",
                      loading ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"
                    )}>
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                          <Upload size={24} />
                        </div>
                        <span className="text-white text-sm font-semibold">Change image</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center p-10 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center mb-6 text-amber-500 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <ImageIcon size={40} />
                    </div>
                    <p className="font-semibold text-xl text-[var(--text)] mb-2">Drop your exam photo</p>
                    <p className="text-sm text-[var(--text-tertiary)] max-w-[240px] leading-relaxed">
                      Upload a photo of a handwritten question or a printed textbook page.
                    </p>
                  </div>
                )}
              </div>

              {!result && (
                <Button 
                  onClick={handleScan} 
                  className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-[var(--accent)]/20" 
                  loading={loading}
                  disabled={!preview || loading}
                  icon={<Scan size={24} />}
                >
                  {loading ? "Digitizing..." : "Start Digitization"}
                </Button>
              )}

              {result && (
                <div className="flex gap-4 animate-in fade-in zoom-in-95 duration-500">
                  <Button 
                    onClick={() => { setResult(null); setFile(null); setPreview(null); }} 
                    variant="secondary" 
                    className="flex-1 rounded-2xl h-14 bg-white border-[var(--border)] hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                    icon={<Trash2 size={20} />}
                  >
                    Discard
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    className="flex-[2] rounded-2xl h-14 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-200"
                    icon={<Bookmark size={20} />}
                  >
                    Save to Bank
                  </Button>
                </div>
              )}
            </div>

            {/* Right: Results / Progress */}
            <div className="lg:col-span-7">
              <div className="h-full">
                {loading ? (
                  <div className="card h-full p-12 flex flex-col items-center justify-center text-center bg-white border-none shadow-2xl shadow-black/5 relative overflow-hidden">
                    {/* Background Gradients */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl animate-pulse" />

                    <div className="relative mb-10">
                      <div className="w-24 h-24 rounded-full border-4 border-amber-50 border-t-amber-500 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={40} className="text-amber-500 fill-amber-500 animate-pulse" />
                      </div>
                    </div>
                    
                    <h2 className="serif text-3xl text-[var(--text)] mb-2">Processing with AI</h2>
                    <p className="text-[var(--text-secondary)] mb-8 max-w-sm">
                      Imtihan AI is currently reading your handwriting and converting it to professional LaTeX notation.
                    </p>

                    <div className="w-full max-w-xs space-y-4">
                      {STEPS.map((step, i) => (
                        <div key={i} className={cn(
                          "flex items-center gap-3 transition-all duration-500",
                          scanStep >= i ? "opacity-100 translate-x-0" : "opacity-20 -translate-x-2"
                        )}>
                          {scanStep > i ? (
                            <CheckCircle2 size={16} className="text-emerald-500" />
                          ) : scanStep === i ? (
                            <Loader2 size={16} className="text-amber-500 animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-[var(--border)]" />
                          )}
                          <span className={cn(
                            "text-xs font-bold uppercase tracking-widest",
                            scanStep === i ? "text-amber-600" : "text-[var(--text-tertiary)]"
                          )}>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : result ? (
                  <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        Digital Extraction Result
                      </h2>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <ShieldCheck size={12} />
                        VERIFIED BY AI
                      </div>
                    </div>
                    <ExerciseCard 
                      index={0}
                      language="french"
                      onRegenerate={async () => {}}
                      onRemove={() => {}}
                      exercise={{
                        ...result,
                        id: 'preview',
                        difficulty: result.difficulty || 'medium',
                        points: result.points || 5,
                        tags: [result.subject]
                      }} 
                    />
                    
                    <div className="mt-6 p-5 rounded-3xl bg-amber-50 border border-amber-100 flex gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                        <Info size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-amber-900 mb-1">Double-Check Scientific Notation</p>
                        <p className="text-xs text-amber-800/80 leading-relaxed">
                          The AI has extracted LaTeX formulas. If the handwriting was unclear, you can edit the text after saving it to your bank.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card h-full p-12 flex flex-col items-center justify-center text-center opacity-60 bg-[var(--surface)] border-none shadow-inner border-2 border-dashed border-[var(--border)]">
                    <div className="w-16 h-16 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mb-6">
                      <Scan size={32} className="text-[var(--text-tertiary)]" />
                    </div>
                    <h3 className="font-semibold text-lg text-[var(--text)] mb-2">Live Preview</h3>
                    <p className="text-sm text-[var(--text-tertiary)] max-w-[260px]">
                      Your digitized exercise will appear here as soon as the scan completes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
        @keyframes progress {
          0% { width: 0; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

const ShieldCheck = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);
