import Link from "next/link";
import { ArrowRight, Check, FileText } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

type Preview = { title: string; level: string; duration: string; marks: string; instructions: string; sections: { title: string; detail: string }[] };
type Props = { french?: boolean; eyebrow: string; title: string; accent: string; description: string; cta: string; preview: Preview };

export function GeneratorLandingNav({ french = false }: { french?: boolean }) {
  return <nav aria-label={french ? "Navigation principale" : "Main navigation"} className="fixed inset-x-0 top-0 z-50 h-16 border-b border-[var(--border)]/60 bg-[var(--bg)]/90 px-5 backdrop-blur-xl md:px-10">
    <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4">
      <Logo size={26} />
      <div className="flex items-center gap-3 text-sm sm:gap-6">
        <Link href="/pricing" className="hidden text-[var(--text-secondary)] hover:text-[var(--accent)] sm:block">{french ? "Tarifs" : "Pricing"}</Link>
        <Link href="/auth/login" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-[var(--text)] hover:border-[var(--accent)]">{french ? "Se connecter" : "Sign in"}<ArrowRight size={14} /></Link>
      </div>
    </div>
  </nav>;
}

export function GeneratorLandingHero({ french = false, eyebrow, title, accent, description, cta, preview }: Props) {
  const steps = french ? [
    { title: "Décrivez", detail: "Matière, niveau, chapitres. Ajoutez vos cours si nécessaire." },
    { title: "Configurez", detail: "Relisez la structure, la difficulté et le barème." },
    { title: "Affinez", detail: "Vérifiez, modifiez ou régénérez chaque exercice." },
    { title: "Exportez", detail: "Word ou PDF, avec ou sans corrigé." },
  ] : [
    { title: "Describe", detail: "Subject, level and chapters. Add teaching material if needed." },
    { title: "Configure", detail: "Review the structure, difficulty and marks." },
    { title: "Refine", detail: "Check, edit or regenerate individual questions." },
    { title: "Export", detail: "Word or PDF, with or without the answer key." },
  ];
  return <>
    <section className="relative overflow-hidden px-5 py-12 md:px-10 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="min-w-0">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{eyebrow}</p>
          <h1 className="serif text-[clamp(2.25rem,5vw,4rem)] font-light leading-[1.08] tracking-tight text-[var(--text)]">{title}<span className="mt-2 block italic text-[var(--accent)]">{accent}</span></h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--text-secondary)]">{description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/auth/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">{cta}<ArrowRight size={16} className="shrink-0" /></Link>
            <Link href="#workflow" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface)]">{french ? "Comment ça fonctionne" : "How it works"}</Link>
          </div>
          <p className="mt-4 text-xs text-[var(--text-tertiary)]">{french ? "1 examen gratuit · Sans carte bancaire" : "1 free exam · No credit card required"}</p>
        </div>
        <aside aria-label={french ? "Aperçu de la composition d’un examen" : "Example assessment composition"} className="min-w-0 rounded-3xl border border-[var(--border)] bg-[var(--accent-light)] p-4 sm:p-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
              <FileText size={20} className="shrink-0 text-[var(--accent)]" />
              <span className="rounded-full bg-[var(--bg-subtle)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{french ? "Exemple de structure" : "Structure preview"}</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">{preview.level}</p>
            <h2 className="serif mt-2 text-2xl leading-tight text-[var(--text)]">{preview.title}</h2>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-[var(--accent)]"><span>{preview.duration}</span><span>{preview.marks}</span></div>
            <p className="mt-4 text-xs leading-relaxed text-[var(--text-secondary)]">{preview.instructions}</p>
            <div className="mt-5 divide-y divide-[var(--border)]">
              {preview.sections.map(section => <div key={section.title} className="py-3"><p className="text-sm font-semibold text-[var(--text)]">{section.title}</p><p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">{section.detail}</p></div>)}
            </div>
            <p className="mt-5 flex items-start gap-2 border-t border-[var(--border)] pt-4 text-xs text-[var(--text-secondary)]"><Check size={14} className="shrink-0 text-[var(--accent)]" />{french ? "Corrigé séparé · Barème détaillé · Word & PDF" : "Separate answer key · Detailed marks · Word & PDF"}</p>
          </div>
        </aside>
      </div>
    </section>
    <section id="workflow" aria-label={french ? "Les étapes de création" : "The creation workflow"} className="scroll-mt-20 px-5 pb-14 md:px-10 md:pb-20">
      <ol className="mx-auto grid max-w-6xl gap-5 border-t border-[var(--border)] pt-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => <li key={step.title} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-light)] text-xs font-semibold text-[var(--accent)]">{i + 1}</span><div><h2 className="text-sm font-semibold text-[var(--text)]">{step.title}</h2><p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">{step.detail}</p></div></li>)}
      </ol>
    </section>
  </>;
}
