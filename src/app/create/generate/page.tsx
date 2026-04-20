"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ExerciseCard } from "@/components/ui/ExerciseCard";
import { cn, shortId } from "@/lib/utils";
import type { ExamContext, Exercise } from "@/types/exam";
import { StepIndicator, StepLabel } from "@/app/create/page";

type GenerationStatus = "idle" | "generating" | "done" | "error";

export default function GeneratePage() {
  const router = useRouter();
  const [context, setContext] = useState<ExamContext | null>(null);
  const [templateId, setTemplateId] = useState("classic");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("imtihan_context");
    const tmpl = sessionStorage.getItem("imtihan_templateId") ?? "classic";
    if (!raw) { router.replace("/create"); return; }
    try {
      const ctx = JSON.parse(raw) as ExamContext;
      setContext(ctx);
      setTemplateId(tmpl);
    } catch { router.replace("/create"); }
  }, [router]);

  useEffect(() => {
    if (context && status === "idle") {
      generateExam();
    }
  }, [context]); // eslint-disable-line react-hooks/exhaustive-deps

  async function generateExam() {
    if (!context) return;
    setStatus("generating");
    setStreamText("");
    setExercises([]);
    setError(null);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, templateId }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.errors?.[0] ?? "Generation failed.");
        setStatus("error");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setError("Stream unavailable."); setStatus("error"); return; }

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.chunk) {
              accumulated += data.chunk;
              setStreamText(accumulated);
            }
            if (data.done) {
              if (data.error) {
                setError(data.error);
                setStatus("error");
              } else {
                const withIds = (data.exercises as Exercise[]).map((ex, i) => ({
                  ...ex,
                  id: ex.id ?? shortId(),
                  number: i + 1,
                }));
                setExercises(withIds);
                sessionStorage.setItem("imtihan_exercises", JSON.stringify(withIds));
                setStatus("done");
              }
            }
          } catch { /* skip malformed SSE lines */ }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Network error. Please try again.");
        setStatus("error");
      }
    }
  }

  async function handleRegenerate(id: string, targetDifficulty?: "easy" | "medium" | "hard") {
    setRegeneratingId(id);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            ...context,
            exerciseCount: 1,
            ...(targetDifficulty ? {
              difficultyMix: {
                easy: targetDifficulty === "easy" ? 1 : 0,
                medium: targetDifficulty === "medium" ? 1 : 0,
                hard: targetDifficulty === "hard" ? 1 : 0,
              }
            } : {}),
          },
          templateId,
        }),
      });

      if (!res.ok) return;

      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done && data.exercises?.[0]) {
              const newExercise: Exercise = { ...data.exercises[0], id: shortId() };
              setExercises((prev) => {
                const idx = prev.findIndex((e) => e.id === id);
                if (idx === -1) return prev;
                const next = [...prev];
                next[idx] = { ...newExercise, number: idx + 1 };
                sessionStorage.setItem("imtihan_exercises", JSON.stringify(next));
                return next;
              });
            }
          } catch { /* skip */ }
        }
      }
    } finally {
      setRegeneratingId(null);
    }
  }

  function handleRemove(id: string) {
    setExercises((prev) => {
      const next = prev.filter((e) => e.id !== id).map((e, i) => ({ ...e, number: i + 1 }));
      sessionStorage.setItem("imtihan_exercises", JSON.stringify(next));
      return next;
    });
  }

  const streamProgress = streamText.length;

  // Difficulty breakdown for analytics
  const difficultyCount = exercises.reduce(
    (acc, ex) => { acc[ex.difficulty] = (acc[ex.difficulty] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );
  const totalEx = exercises.length;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <Link href="/create/structure" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft size={16} />
          <span className="text-sm hidden sm:block">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white text-xs font-serif">إ</span>
          </div>
          <span className="font-semibold text-sm text-[var(--text)] tracking-tight hidden sm:block">Imtihan</span>
        </div>
        <StepIndicator current={4} />
      </header>

      <main className="flex-1 px-6 md:px-10 py-12">
        <div className="max-w-2xl mx-auto">

          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <StepLabel step={4} />
              <h1 className="serif text-display-lg text-[var(--text)] mb-2">Your exam</h1>
              {status === "done" && (
                <p className="text-[var(--text-secondary)] text-sm">
                  {exercises.length} exercise{exercises.length !== 1 ? "s" : ""} generated. Regenerate, adjust, or remove any before exporting.
                </p>
              )}
              {status === "generating" && (
                <p className="text-[var(--text-secondary)] text-sm">Generating {context?.exerciseCount ?? "…"} exercises…</p>
              )}
            </div>
            {status === "done" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={generateExam}
                icon={<RotateCcw size={13} />}
              >
                Regenerate all
              </Button>
            )}
          </div>

          {/* Generating state */}
          {status === "generating" && (
            <div className="space-y-4">
              {/* Progress banner */}
              <div className="flex items-center gap-3 p-5 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent)]/30">
                <div className="relative flex-shrink-0">
                  <Sparkles size={16} className="text-[var(--accent)]" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--accent-text)]">Generating your exam…</p>
                  <p className="text-xs text-[var(--accent-text)]/60 mt-0.5">This usually takes 15–30 seconds</p>
                </div>
                {streamProgress > 0 && (
                  <span className="text-xs font-mono text-[var(--accent)]/60 tabular-nums flex-shrink-0">
                    {streamProgress} chars
                  </span>
                )}
              </div>

              {/* Skeleton cards */}
              {[...Array(context?.exerciseCount ?? 3)].map((_, i) => (
                <div
                  key={i}
                  className="card p-6"
                  style={{ opacity: 1 - i * 0.15 }}
                >
                  <div className="flex gap-3 mb-5">
                    <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0" />
                    <div className="space-y-2 flex-1 pt-1">
                      <div className="skeleton h-3 w-28 rounded-full" />
                      <div className="skeleton h-2.5 w-16 rounded-full" />
                    </div>
                    <div className="skeleton w-12 h-6 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="skeleton h-3 w-full rounded-full" />
                    <div className="skeleton h-3 w-[90%] rounded-full" />
                    <div className="skeleton h-3 w-[75%] rounded-full" />
                    <div className="skeleton h-3 w-[60%] rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {status === "error" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-5 rounded-2xl bg-red-50 border border-red-200">
                <X size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700 mb-0.5">Generation failed</p>
                  <p className="text-xs text-red-600 leading-relaxed">{error}</p>
                </div>
              </div>
              <Button onClick={generateExam} icon={<RotateCcw size={14} />}>Try again</Button>
            </div>
          )}

          {/* Done — analytics bar */}
          {status === "done" && exercises.length > 0 && (
            <div className="card p-4 mb-6 flex items-center gap-5 flex-wrap">
              {/* Difficulty bar */}
              <div className="flex-1 min-w-[160px]">
                <div className="flex h-2 rounded-full overflow-hidden gap-px mb-2">
                  {difficultyCount.easy > 0 && (
                    <div className="bg-emerald-500 transition-all" style={{ width: `${(difficultyCount.easy / totalEx) * 100}%` }} />
                  )}
                  {difficultyCount.medium > 0 && (
                    <div className="bg-amber-500 transition-all" style={{ width: `${(difficultyCount.medium / totalEx) * 100}%` }} />
                  )}
                  {difficultyCount.hard > 0 && (
                    <div className="bg-red-500 transition-all" style={{ width: `${(difficultyCount.hard / totalEx) * 100}%` }} />
                  )}
                </div>
                <div className="flex gap-3 text-[11px] text-[var(--text-tertiary)]">
                  {difficultyCount.easy > 0 && (
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{difficultyCount.easy} easy</span>
                  )}
                  {difficultyCount.medium > 0 && (
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{difficultyCount.medium} medium</span>
                  )}
                  {difficultyCount.hard > 0 && (
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{difficultyCount.hard} hard</span>
                  )}
                </div>
              </div>
              {/* Stats */}
              <div className="flex gap-5 text-xs text-[var(--text-secondary)] flex-shrink-0">
                <span><strong className="text-[var(--text)]">{exercises.reduce((s, e) => s + e.points, 0)}</strong> pts total</span>
                <span><strong className="text-[var(--text)]">{exercises.reduce((s, e) => s + (e.estimatedMinutes ?? 0), 0)}</strong> min est.</span>
              </div>
            </div>
          )}

          {/* Done — exercises list */}
          {status === "done" && (
            <div className="space-y-4">
              {exercises.map((exercise, i) => (
                <div
                  key={exercise.id}
                  className="opacity-0-start animate-fade-up"
                  style={{ animationFillMode: "forwards", animationDelay: `${i * 80}ms` }}
                >
                  <ExerciseCard
                    exercise={exercise}
                    index={i}
                    language={context?.language ?? "french"}
                    onRegenerate={handleRegenerate}
                    onRemove={handleRemove}
                    isRegenerating={regeneratingId === exercise.id}
                  />
                </div>
              ))}

              <div className="pt-4">
                <Button
                  onClick={() => router.push("/create/export")}
                  size="lg"
                  className="w-full"
                  icon={<ArrowRight size={16} />}
                  iconPosition="right"
                >
                  Export exam
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
