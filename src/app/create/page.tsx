"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Lightbulb, Upload, X, BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dropzone } from "@/components/ui/Dropzone";
import { cn, shortId } from "@/lib/utils";
import {
  getClassProfiles, saveClassProfile, deleteClassProfile,
  type ClassProfile,
} from "@/lib/storage";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  base64: string;
}

const EXAMPLE_PROMPTS = [
  { label: "Physics · Terminale S", text: "Examen de Physique pour Terminale S Bac Libanais, chapitres mécanique et électromagnétisme, 3 exercices en français, 2 heures, total 20 points" },
  { label: "IB Chemistry HL", text: "IB Chemistry HL exam on organic chemistry and equilibria, 4 questions, 90 minutes, in English" },
  { label: "Math Quiz · Première", text: "Quiz de Mathématiques pour Première Bac Français, dérivation et fonctions, 30 minutes, niveau moyen" },
  { label: "Philo · Terminale L", text: "Devoir de Philosophie Terminale L Bac Libanais, éthique et épistémologie, 2 sujets au choix, 1h30, en français" },
];

const CHAR_MAX = 1000;

export default function CreatePage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeExample, setActiveExample] = useState<number | null>(null);

  // Class profiles (saved curriculum+level+subject combos)
  const [profiles, setProfiles] = useState<ClassProfile[]>([]);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  useEffect(() => {
    setProfiles(getClassProfiles());
    // Restore description + uploaded file if the user navigated back here
    const savedDesc = sessionStorage.getItem("imtihan_description");
    if (savedDesc) setDescription(savedDesc);
    const savedFileRaw = sessionStorage.getItem("imtihan_uploaded_file");
    if (savedFileRaw) {
      try { setUploadedFile(JSON.parse(savedFileRaw) as UploadedFile); } catch { /* ignore */ }
    }
  }, []);

  // Persist the draft as the user types so nothing is lost on back-navigation.
  useEffect(() => {
    if (description) sessionStorage.setItem("imtihan_description", description);
  }, [description]);

  useEffect(() => {
    if (uploadedFile) sessionStorage.setItem("imtihan_uploaded_file", JSON.stringify(uploadedFile));
    else sessionStorage.removeItem("imtihan_uploaded_file");
  }, [uploadedFile]);

  const charCount = description.length;
  const isReady = description.trim().length >= 20;

  function applyProfile(p: ClassProfile) {
    const text = `Examen pour ${p.name}, curriculum ${p.curriculumId.replace("-", " ")}, niveau ${p.levelId}, en ${p.language === "french" ? "français" : p.language === "english" ? "anglais" : "arabe"}. `;
    setDescription(text);
    setActiveExample(null);
  }

  function addProfileFromCurrent() {
    if (!newProfileName.trim()) return;
    const profile: ClassProfile = {
      id: shortId(),
      name: newProfileName.trim(),
      curriculumId: "bac-libanais",
      levelId: "terminale-s",
      subject: "mathematics",
      language: "french",
      createdAt: Date.now(),
    };
    saveClassProfile(profile);
    setProfiles([profile, ...profiles]);
    setNewProfileName("");
    setShowProfileForm(false);
  }

  function removeProfile(id: string) {
    deleteClassProfile(id);
    setProfiles(profiles.filter((p) => p.id !== id));
  }

  async function handleAnalyze() {
    if (!isReady) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const body: Record<string, unknown> = { description };
      if (uploadedFile) {
        body.documentBase64 = uploadedFile.base64;
        body.documentMimeType = uploadedFile.type;
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.errors?.[0] ?? "Something went wrong. Please try again.");
        return;
      }

      sessionStorage.setItem("imtihan_context", JSON.stringify(data.context));
      sessionStorage.setItem("imtihan_description", description);
      router.push("/create/confirm");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function useExample(i: number) {
    setDescription(EXAMPLE_PROMPTS[i].text);
    setActiveExample(i);
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)]/60 bg-[var(--bg)]/75 backdrop-blur-xl sticky top-0 z-40 transition-colors">
        <Link href="/" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft size={16} aria-label="Back to home page" />
          <span className="text-sm hidden sm:block">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white text-xs font-serif">إ</span>
          </div>
          <span className="font-semibold text-sm text-[var(--text)] tracking-tight">Imtihan</span>
        </div>
        {/* Step progress */}
        <StepIndicator current={1} />
      </header>

      <main className="flex-1 flex flex-col items-center px-6 md:px-10 py-12">
        <div className="w-full max-w-2xl">

          {/* Heading */}
          <div className="mb-8">
            <StepLabel step={1} />
            <h1 className="serif text-display-lg text-[var(--text)] mb-3 text-balance tracking-tight">
              Describe your exam
            </h1>
            <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
              Write what you need in plain language — curriculum, level, subject, chapters, duration. The more detail, the better.
            </p>
          </div>

          {/* Textarea */}
          <div className="mb-5 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent)]/0 via-[var(--accent)]/10 to-[var(--accent)]/0 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className={cn(
              "relative rounded-2xl border bg-[var(--surface)]/80 backdrop-blur-sm transition-all duration-300 shadow-sm focus-within:ring-4 focus-within:ring-[var(--accent)]/15 focus-within:border-[var(--accent)]/70",
              description.length > 0
                ? "border-[var(--accent)] shadow-[0_0_20px_rgba(26,94,63,0.08)]"
                : "border-[var(--border)] hover:border-[var(--border-strong)] hover:shadow-md"
            )}>
              <textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value.slice(0, CHAR_MAX)); setActiveExample(null); }}
                placeholder="Ex: Examen de Physique pour Terminale S Bac Libanais, chapitres mécanique et électromagnétisme, 3 exercices en français, 2 heures, 20 points…"
                className="w-full min-h-[180px] p-5 bg-transparent text-[var(--text)] placeholder:text-[var(--text-tertiary)] text-sm leading-relaxed resize-none focus:outline-none rounded-2xl"
                autoFocus
              />
              <div className="flex items-center justify-between px-5 pb-4">
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                  <Lightbulb size={11} />
                  <span>curriculum · level · subject · chapters · language · duration</span>
                </div>
                <span className={cn(
                  "text-xs tabular-nums",
                  charCount > CHAR_MAX * 0.9 ? "text-[var(--warning)]" : "text-[var(--text-tertiary)]"
                )}>
                  {charCount}/{CHAR_MAX}
                </span>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div className="mb-6">
            <p className="text-xs text-[var(--text-tertiary)] mb-2.5">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => useExample(i)}
                  className={cn( // role="button" is implicit for <button>
                    "text-xs px-3 py-1.5 rounded-full border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                    activeExample === i
                      ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-light)] shadow-sm"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text)] hover:shadow-sm hover:bg-[var(--bg-subtle)]"
                  )}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Saved class profiles */}
          {(profiles.length > 0 || showProfileForm) && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs text-[var(--text-tertiary)] inline-flex items-center gap-1.5">
                  <BookOpen size={10} /> Your saved classes
                </p>
                <button
                  onClick={() => setShowProfileForm(!showProfileForm)}
                  className="text-xs text-[var(--accent)] hover:underline"
                  aria-label={showProfileForm ? "Cancel adding new class profile" : "Add new class profile"}
                >
                  {showProfileForm ? "Cancel" : "+ Add class"}
                </button>
              </div>

              {showProfileForm && (
                <div className="mb-3 flex gap-2">
                  <input
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="e.g. Terminale S · Physique"
                    className="flex-1 h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    onClick={addProfileFromCurrent}
                    disabled={!newProfileName.trim()}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50" aria-label="Save class profile"
                  >
                    Save
                  </button>
                </div>
              )}

              {profiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profiles.map((p) => (
                    <div
                      key={p.id}
                      className="group inline-flex items-center gap-1 border border-[var(--border)] rounded-full bg-[var(--bg-subtle)] hover:border-[var(--border-strong)] transition-colors"
                    >
                      <button
                        onClick={() => applyProfile(p)}
                        className="text-xs pl-3 pr-2 py-1.5 text-[var(--text-secondary)] hover:text-[var(--text)]" aria-label={`Apply profile ${p.name}`}
                      >
                        {p.name}
                      </button>
                      <button
                        onClick={() => removeProfile(p.id)}
                        className="pr-2.5 py-1.5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 hover:text-[var(--danger)] transition-all" aria-label={`Remove profile ${p.name}`}
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add first profile hint (when empty) */}
          {profiles.length === 0 && !showProfileForm && (
            <div className="mb-6">
              <button
                onClick={() => setShowProfileForm(true)}
                className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] inline-flex items-center gap-1.5 transition-colors"
                aria-label="Save a class profile"
              >
                <BookOpen size={11} />
                + Save a class profile for quick reuse next time
              </button>
            </div>
          )}

          {/* Upload */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Upload size={13} className="text-[var(--text-tertiary)]" />
              <p className="text-sm font-medium text-[var(--text)]">Attach a document</p>
              <span className="text-[10px] text-[var(--text-tertiary)] px-2 py-0.5 rounded-full border border-[var(--border)]">Optional</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
              Textbook chapter, course notes, or past exam PDF. Imtihan reads it to make exercises more relevant.
            </p>
            <Dropzone value={uploadedFile} onChange={setUploadedFile} />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              <X size={14} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* CTA */}
          <div className="pt-4 pb-8">
            <Button
              onClick={handleAnalyze}
              disabled={!isReady}
              loading={isAnalyzing}
              size="lg"
              className="w-full shadow-md shadow-[var(--accent)]/10 ring-1 ring-inset ring-white/20"
              icon={isAnalyzing ? undefined : <Sparkles size={15} />}
              iconPosition="right"
            >
              {isAnalyzing ? "Analyzing…" : "Analyze & continue"}
            </Button>

            {isReady && !isAnalyzing && (
              <p className="text-center text-xs text-[var(--text-tertiary)] mt-3">
                Imtihan will detect curriculum, level, subject and chapters automatically
              </p>
            )}
            {!isReady && description.length > 0 && (
              <p className="text-center text-xs text-[var(--text-tertiary)] mt-3">
                Add a bit more detail to continue (min. 20 characters)
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Bottom curriculum hints */}
      <div className="flex flex-wrap items-center justify-center pb-6 px-6 gap-x-5 gap-y-2">
        {["Bac Libanais", "Bac Français", "IB", "Université"].map((c) => (
          <span key={c} className="text-xs text-[var(--text-tertiary)]">{c}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── Shared step components ──────────────────────────────────────────────── */

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((step) => (
        <div
          key={step}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            step < current  ? "w-4 bg-[var(--accent)] opacity-40" :
            step === current ? "w-6 bg-[var(--accent)]" :
                               "w-1.5 bg-[var(--border)]"
          )}
        />
      ))}
    </div>
  );
}

export function StepLabel({ step }: { step: number }) {
  return (
    <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-3">
      Step {step} of 5
    </p>
  );
}
