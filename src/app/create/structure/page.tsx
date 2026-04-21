"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Toggle, TemplateCard } from "@/components/ui/StructureFormElements";
import { StepIndicator, StepLabel } from "@/app/create/page";
import type { ExamContext } from "@/types/exam";

type StructureContext = ExamContext & {
  header?: {
    schoolName?: string;
    className?: string;
    teacherName?: string;
    date?: string;
  };
  templateId?: string;
};

const TEMPLATES = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "formal", label: "Formal" },
];

export default function StructurePage() {
  const router = useRouter();
  const [context, setContext] = useState<StructureContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem("imtihan_context");
    if (!raw) {
      router.replace("/create");
      return;
    }
    try {
      const parsedContext = JSON.parse(raw);
      // Initialize structure-specific fields if they don't exist
      parsedContext.header ??= { schoolName: "", className: "", teacherName: "", date: "" };
      parsedContext.templateId ??= "classic";
      parsedContext.generateVersionB ??= false;
      setContext(parsedContext);
    } catch {
      router.replace("/create");
    } finally {
      setLoading(false);
    }
  }, [router]);

  function update<K extends keyof StructureContext>(key: K, value: StructureContext[K]) {
    setContext((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function updateHeader(key: keyof NonNullable<StructureContext["header"]>, value: string) {
    setContext((prev) => {
      if (!prev) return prev;
      return { ...prev, header: { ...prev.header, [key]: value } };
    });
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
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <Link href="/create/confirm" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft size={16} />
          <span className="text-sm hidden sm:block">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white text-xs font-serif">إ</span>
          </div>
          <span className="font-semibold text-sm text-[var(--text)] tracking-tight">Imtihan</span>
        </div>
        <StepIndicator current={3} />
      </header>

      <main className="flex-1 flex flex-col items-center px-6 md:px-10 py-12">
        <div className="w-full max-w-2xl space-y-10">
          <div>
            <StepLabel step={3} />
            <h1 className="serif text-display-lg text-[var(--text)] mb-2">Structure & Style</h1>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Customize the exam header, layout, and other generation options.
            </p>
          </div>

          {/* School Header Customization */}
          <div className="card p-6">
            <h2 className="text-base font-semibold text-[var(--text)] mb-1">Exam Header</h2>
            <p className="text-xs text-[var(--text-secondary)] mb-5">Add school and class details to the exported document.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="School Name" value={context.header?.schoolName} onChange={(e) => updateHeader("schoolName", e.target.value)} placeholder="e.g. Lycée Franco-Libanais" />
              <Input label="Class Name" value={context.header?.className} onChange={(e) => updateHeader("className", e.target.value)} placeholder="e.g. Terminale S" />
              <Input label="Teacher Name" value={context.header?.teacherName} onChange={(e) => updateHeader("teacherName", e.target.value)} placeholder="Your name" />
              <Input label="Date" value={context.header?.date} onChange={(e) => updateHeader("date", e.target.value)} placeholder="e.g. Fall 2026 Final" />
            </div>
          </div>

          {/* Style & Variants */}
          <div className="space-y-6">
             <div>
                <h2 className="text-base font-semibold text-[var(--text)] mb-1">Document Template</h2>
                <p className="text-xs text-[var(--text-secondary)] mb-4">Choose a visual style for the exported exam.</p>
                <div className="grid grid-cols-3 gap-4">
                  {TEMPLATES.map(template => (
                    <TemplateCard
                      key={template.id}
                      id={template.id}
                      label={template.label}
                      selected={context.templateId === template.id}
                      onSelect={() => update("templateId", template.id)}
                    />
                  ))}
                </div>
             </div>

            <div>
              <h2 className="text-base font-semibold text-[var(--text)] mb-1">Exam Variants</h2>
              <p className="text-xs text-[var(--text-secondary)] mb-4">Generate a second version to help prevent cheating.</p>
              <Toggle
                label="Generate Version B"
                description="Shuffles question order and regenerates numerical values."
                checked={!!context.generateVersionB}
                onChange={(checked) => update("generateVersionB", checked)}
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