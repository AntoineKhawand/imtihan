"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { 
  Scan, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  Trash2, 
  Sparkles,
  Bookmark,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { UserNav } from "@/components/layout/UserNav";
import { ExerciseCard } from "@/components/ui/ExerciseCard";
import { saveToBank } from "@/lib/storage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ScannerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

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

  async function handleScan() {
    if (!preview) return;
    setLoading(true);
    try {
      const base64 = preview.split(',')[1];
      const res = await fetch("/api/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType: file?.type })
      });
      
      if (!res.ok) throw new Error("Failed to scan image");
      const data = await res.json();
      setResult(data);
      toast.success("Exercise digitized successfully!");
    } catch (error) {
      toast.error("Scanning failed. Please try a clearer photo.");
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

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-[var(--bg-subtle)] rounded-lg transition-colors text-[var(--text-secondary)]">
            <ChevronLeft size={20} />
          </Link>
          <Logo size={24} />
        </div>
        <UserNav />
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-xs font-semibold mb-3">
              <Sparkles size={12} />
              AI-Powered Digitization
            </div>
            <h1 className="serif text-4xl text-[var(--text)] mb-2">AI Scanner</h1>
            <p className="text-[var(--text-secondary)]">Convert paper exams, photos, or screenshots into digital exercises instantly.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div 
              {...getRootProps()} 
              className={cn(
                "relative aspect-[4/3] rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-8 text-center cursor-pointer overflow-hidden group",
                isDragActive ? "border-[var(--accent)] bg-[var(--accent-light)]/50" : "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--surface)]",
                preview ? "border-solid" : ""
              )}
            >
              <input {...getInputProps()} />
              
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <Upload size={20} />
                      Replace photo
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center mb-4 text-[var(--accent)] group-hover:scale-110 transition-transform">
                    <ImageIcon size={32} />
                  </div>
                  <p className="font-semibold text-[var(--text)] mb-1">Upload a photo or drag & drop</p>
                  <p className="text-xs text-[var(--text-tertiary)] max-w-[200px]">Supports JPEG, PNG, WEBP. Clear photos work best.</p>
                </div>
              )}
            </div>

            {preview && !result && (
              <Button 
                onClick={handleScan} 
                className="w-full h-12 text-lg rounded-2xl" 
                loading={loading}
                icon={<Scan size={20} />}
              >
                Start AI Digitization
              </Button>
            )}

            {result && (
              <div className="flex gap-3">
                <Button 
                  onClick={() => { setResult(null); setFile(null); setPreview(null); }} 
                  variant="secondary" 
                  className="flex-1 rounded-2xl h-12"
                  icon={<Trash2 size={18} />}
                >
                  Discard
                </Button>
                <Button 
                  onClick={handleSave} 
                  className="flex-[2] rounded-2xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
                  icon={<Bookmark size={18} />}
                >
                  Save to Question Bank
                </Button>
              </div>
            )}
          </div>

          {/* Result Section */}
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Processing with Gemini...</>
              ) : result ? (
                <><CheckCircle2 size={14} className="text-emerald-500" /> Extraction Preview</>
              ) : (
                "Extraction Result"
              )}
            </h2>

            {loading ? (
              <div className="card aspect-[4/3] flex flex-col items-center justify-center p-12 text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-4 border-[var(--accent-light)] border-t-[var(--accent)] animate-spin" />
                  <Sparkles size={24} className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-[var(--accent)]" />
                </div>
                <h3 className="font-semibold text-[var(--text)] mb-2 text-xl">AI is reading the image...</h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-[250px]">Gemini 1.5 Pro is extracting text, identifying scientific notation, and structuring the exercise.</p>
              </div>
            ) : result ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">High Confidence Extraction</p>
                    <p className="text-xs text-emerald-700">LaTeX notation and sub-questions have been successfully identified.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card aspect-[4/3] flex flex-col items-center justify-center p-12 text-center opacity-50 border-dashed border-2">
                <Scan size={48} className="text-[var(--text-tertiary)] mb-4" />
                <p className="text-[var(--text-secondary)]">Your digitized exercise will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
