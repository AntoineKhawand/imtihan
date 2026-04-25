"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, ArrowLeft, AlertTriangle, ChevronRight, Zap, ArrowRight } from "lucide-react";
import { UserNav } from "@/components/layout/UserNav";
import { Button } from "@/components/ui/Button";
import { Input, Toggle, TemplateCard } from "@/components/ui/StructureFormElements";
import { StepIndicator, StepLabel } from "@/app/create/page";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/ui/Logo";
import type { ExamContext } from "@/types/exam";

type StructureContext = ExamContext & {
  header?: {
    schoolName?: string;
    className?: string;
    teacherName?: string;
    date?: string;
  };
  totalPoints?: number;
  examType?: "quiz" | "midterm" | "final" | "homework" | "dawrat";
  difficultyLevel?: "remedial" | "standard" | "advanced" | "dawrat";
  templateId?: string;
};

const TEMPLATES = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "formal", label: "Formal" },
];

import { motion } from "framer-motion";

function TemplateSkeleton({ templateId, selected }: { templateId: string; selected: boolean }) {
  const wrapperClasses = `w-full h-[120px] bg-white rounded-md p-3 border shadow-sm group-hover:shadow-md transition-all duration-300 ease-out overflow-hidden flex flex-col ${selected ? 'border-[var(--accent)] scale-[1.02]' : 'border-[var(--border)]'}`;
  
  // Animation variants for the skeleton lines
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const lineColor = selected ? "bg-[var(--accent)]/20" : "bg-black/5";
  const darkLineColor = selected ? "bg-[var(--accent)]/40" : "bg-black/10";
  const primaryColor = selected ? "bg-[var(--accent)]" : "bg-black/20";

  if (templateId === 'modern') {
    return (
      <div className={wrapperClasses}>
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex items-start gap-2.5 h-full">
          {/* Accent side bar */}
          <motion.div variants={itemVariants} className={`w-1.5 h-full rounded-full ${primaryColor} transition-colors duration-300`} />
          <div className="flex-1 space-y-2.5 pt-1">
            <div className="space-y-1">
              <motion.div variants={itemVariants} className={`h-2.5 w-1/2 rounded-sm ${darkLineColor}`} />
              <motion.div variants={itemVariants} className={`h-1.5 w-1/3 rounded-sm ${lineColor}`} />
            </div>
            <div className="space-y-1.5 pt-1">
              <motion.div variants={itemVariants} className="flex items-center gap-1.5">
                <div className={`h-3 w-3 rounded-sm ${primaryColor} opacity-50`} />
                <div className={`h-1.5 w-3/4 rounded-sm ${lineColor}`} />
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center gap-1.5">
                <div className={`h-3 w-3 rounded-sm ${primaryColor} opacity-50`} />
                <div className={`h-1.5 w-2/3 rounded-sm ${lineColor}`} />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (templateId === 'formal') {
    return (
      <div className={wrapperClasses}>
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="h-full flex flex-col gap-2">
          {/* Framed Header */}
          <motion.div variants={itemVariants} className={`w-full border p-1.5 rounded-sm flex justify-between items-center ${selected ? 'border-[var(--accent)]/30' : 'border-black/10'}`}>
            <div className="space-y-1">
              <div className={`h-1.5 w-10 rounded-sm ${darkLineColor}`} />
              <div className={`h-1 w-16 rounded-sm ${lineColor}`} />
            </div>
            <div className="space-y-1">
              <div className={`h-1.5 w-8 rounded-sm ml-auto ${darkLineColor}`} />
              <div className={`h-1 w-12 rounded-sm ml-auto ${lineColor}`} />
            </div>
          </motion.div>
          {/* Body */}
          <div className="space-y-1.5 flex-1 mt-1">
            <motion.div variants={itemVariants} className={`h-1.5 w-1/4 rounded-sm ${primaryColor} opacity-40`} />
            <motion.div variants={itemVariants} className={`h-1 w-full rounded-sm ${lineColor}`} />
            <motion.div variants={itemVariants} className={`h-1 w-[90%] rounded-sm ${lineColor}`} />
            <motion.div variants={itemVariants} className={`h-1 w-3/4 rounded-sm ${lineColor}`} />
          </div>
        </motion.div>
      </div>
    );
  }

  // Classic
  return (
    <div className={wrapperClasses}>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col items-center h-full">
        {/* Centered header */}
        <motion.div variants={itemVariants} className={`h-2 w-1/2 rounded-sm ${darkLineColor} mb-1`} />
        <motion.div variants={itemVariants} className={`h-1.5 w-1/3 rounded-sm ${lineColor} mb-2`} />
        <motion.div variants={itemVariants} className={`h-px w-full ${selected ? 'bg-[var(--accent)]/30' : 'bg-black/10'} mb-2`} />
        
        {/* Left aligned content */}
        <div className="w-full space-y-1.5">
          <motion.div variants={itemVariants} className={`h-1.5 w-1/5 rounded-sm ${primaryColor} opacity-50`} />
          <div className="space-y-1">
            <motion.div variants={itemVariants} className={`h-1 w-full rounded-sm ${lineColor}`} />
            <motion.div variants={itemVariants} className={`h-1 w-4/5 rounded-sm ${lineColor}`} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function StructurePage() {
  const router = useRouter();
  const [context, setContext] = useState<StructureContext | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const isFreeTier = profile?.subscription?.tier === "free";

  // Placeholder for file upload status from Step 1
  const hasUploadedFile = false;

  useEffect(() => {
    const raw = sessionStorage.getItem("imtihan_context");
    if (!raw) {
      router.replace("/create");
      return;
    }
    try {
      const parsedContext = JSON.parse(raw);
      // Initialize structure-specific fields if they don't exist
      parsedContext.templateId ??= "classic";
      parsedContext.generateVersionB ??= false;
      parsedContext.examType ??= "final";
      parsedContext.difficultyLevel ??= "standard";
      parsedContext.totalPoints ??= 20;
      setContext(parsedContext);
    } catch {
      router.replace("/create");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Auto-persist edits so navigating back preserves structure/template selections.
  useEffect(() => {
    if (context) {
      sessionStorage.setItem("imtihan_context", JSON.stringify(context));
      sessionStorage.setItem("imtihan_templateId", context.templateId ?? "classic");
    }
  }, [context]);

  function update<K extends keyof StructureContext>(key: K, value: StructureContext[K]) {
    setContext((prev) => (prev ? { ...prev, [key]: value } : prev));
  }


  function handleContinue() {
    if (!context) return;
    sessionStorage.setItem("imtihan_context", JSON.stringify(context));
    router.push("/create/generate");
  }

  if (loading || !context) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="grid grid-cols-3 items-center px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center">
          <Link href="/create" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm hidden sm:block font-medium">Back</span>
          </Link>
        </div>

        <div className="flex justify-center">
          <Logo size={28} />
        </div>

        <div className="flex items-center justify-end gap-4">
          <StepIndicator current={3} />
          <UserNav />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 md:px-10 pt-12 pb-20">
        <div className="w-full max-w-2xl space-y-10">
          <div>
            <StepLabel step={2} />
            <h1 className="serif text-display-lg text-[var(--text)] mb-2">Define Exam Blueprint</h1>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Confirm the exam structure, difficulty, and style before generation.
            </p>
          </div>

          {/* Contextual Warning Banner */}
          {(context.examType === "final" || context.examType === "dawrat") && !hasUploadedFile && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-semibold mb-1">For best results, attach a past paper.</p>
                <p>You selected '{context.examType}', but didn't attach a document in the previous step. For exact university or final exam formatting, uploading a `dawrat` is highly recommended.</p>
              </div>
            </div>
          )}


          {/* Exam Blueprint Section */}
          <div className="card p-6">
            <h2 className="text-base font-semibold text-[var(--text)] mb-1">Exam Structure</h2>
            <p className="text-xs text-[var(--text-secondary)] mb-5">Define the core parameters of the exam.</p>
            
            {/* Context Summary - show what's already selected */}
            {context && (
              <div className="mb-5 p-3 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border)]">
                <p className="text-xs text-[var(--text-secondary)] mb-2">Your Selection:</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="px-2 py-1 bg-white rounded border border-[var(--border)]">
                    {context.curriculumId === "bac-libanais" ? "Bac Libanais" : context.curriculumId === "bac-francais" ? "Bac Français" : context.curriculumId === "ib" ? "IB" : context.curriculumId}
                  </span>
                  <span className="px-2 py-1 bg-white rounded border border-[var(--border)]">{context.levelId}</span>
                  <span className="px-2 py-1 bg-white rounded border border-[var(--border)] capitalize">{context.subject}</span>
                  <span className="px-2 py-1 bg-white rounded border border-[var(--border)] capitalize">{context.language}</span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input type="number" label="Total Points" value={context.totalPoints} onChange={(e) => update("totalPoints", parseInt(e.target.value, 10))} placeholder="e.g. 20" />
              <Input type="number" label="Number of Exercises" value={context.exerciseCount} onChange={(e) => update("exerciseCount", parseInt(e.target.value, 10))} placeholder="e.g. 2" />
            </div>

          </div>


          {/* Style & Variants */}
          <div className="space-y-6">
             <div>
                <h2 className="text-base font-semibold text-[var(--text)] mb-1">Document Template</h2>
                <p className="text-xs text-[var(--text-secondary)] mb-4">Choose a visual style for the exported exam.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {TEMPLATES.map(template => (
                    <TemplateCard
                      key={template.id}
                      id={template.id}
                      label={template.label}
                      selected={context.templateId === template.id}
                      onSelect={() => update("templateId", template.id)}
                    >
                      <TemplateSkeleton templateId={template.id} selected={context.templateId === template.id} />
                    </TemplateCard>
                  ))}
                </div>
             </div>

            <div>
              <h2 className="text-base font-semibold text-[var(--text)] mb-1">Exam Variants</h2>
              <p className="text-xs text-[var(--text-secondary)] mb-4">Generate a second version to help prevent cheating.</p>
              <Toggle
                label="Generate Version B"
                description={isFreeTier ? "Available on the Pro plan" : "Shuffles question order and regenerates numerical values."}
                checked={!!context.generateVersionB}
                onChange={(checked) => {
                  if (!isFreeTier) {
                    update("generateVersionB", checked);
                  }
                }}
                locked={isFreeTier}
              />
            </div>
          </div>

          <Button
            onClick={handleContinue}
            size="lg"
            className="w-full"
            icon={<ArrowRight size={16} />}
            iconPosition="right"
          >
            Generate Exam
          </Button>
        </div>
      </main>
    </div>
  );
}