import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Clock, GraduationCap, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { UserNav } from "@/components/layout/UserNav";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Complex Assessments Simplified: Bringing AI to University Exams | Imtihan Blog",
  description: "How university professors in Lebanon can streamline the creation of high-level assessments from complex course notes using specialized AI.",
};

export default async function UniversityBlogPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session");
  const isAuthenticated = !!session;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <nav className="sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-[var(--bg)]/75 backdrop-blur-xl border-b border-[var(--border)]/60 transition-colors">
        <Logo size={26} />
        <div className="hidden md:flex items-center gap-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
          <Link href="/blog" className="hover:text-[var(--text)] transition-colors">Blog</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
            Try Imtihan <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      <header className="relative pt-20 pb-12 px-6 md:px-10 border-b border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors mb-8">
            <ArrowLeft size={14} /> Back to Blog
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--accent)] bg-[var(--accent-light)] px-2.5 py-1 rounded-md">Higher Ed</span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-tertiary)]"><Clock size={12} /> 5 min read</span>
          </div>
          <h1 className="serif text-display-lg text-[var(--text)] leading-[1.1] mb-6 text-balance">
            Complex Assessments Simplified: Bringing AI to University-Level Exams
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 md:px-10 py-12 md:py-16">
        <article className="prose prose-imtihan max-w-none text-[var(--text)] text-[1.05rem] leading-relaxed">
          <p className="text-xl text-[var(--text-secondary)] leading-relaxed mb-10 font-medium">
            University exams are more than just tests; they are complex syntheses of lectures, research, and practical application. For professors, the challenge is creating questions that probe the depths of a student's knowledge while remaining objective and gradable.
          </p>

          <h2 className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Moving Beyond Multiple Choice</h2>
          <p>
            At the university level (whether in Engineering, Medicine, or Humanities), multiple-choice questions often fail to capture the nuances of professional thinking. Professors need to design open-ended, scenario-based problems. However, drafting these scenarios and their exhaustive solutions is an immense time investment.
          </p>

          <h2 className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">From Course Notes to Assessment</h2>
          <p>
            Imtihan’s advanced engine allows professors to upload their specific course notes and research papers. The AI then "reads" the content and generates exercises that are grounded strictly in the provided material.
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex gap-3"><CheckCircle2 className="text-[var(--accent)] shrink-0 mt-0.5" size={18} /> <span><strong>Technical Accuracy:</strong> Imtihan handles complex formulas, chemical notations (LaTeX), and multi-step derivations with ease.</span></li>
            <li className="flex gap-3"><CheckCircle2 className="text-[var(--accent)] shrink-0 mt-0.5" size={18} /> <span><strong>Custom Rubrics:</strong> Generate detailed grading rubrics that match university accreditation standards.</span></li>
            <li className="flex gap-3"><CheckCircle2 className="text-[var(--accent)] shrink-0 mt-0.5" size={18} /> <span><strong>Multi-Language:</strong> Support for English and French instruction, essential for the diverse university landscape in Lebanon.</span></li>
          </ul>

          <div className="my-14 p-8 bg-sky-50 border border-sky-100 rounded-2xl text-center">
            <GraduationCap size={40} className="mx-auto text-sky-600 mb-4" />
            <h3 className="serif text-2xl font-bold text-sky-900 mb-3">Modernize Your Teaching</h3>
            <p className="text-sky-700/80 mb-6 text-base">Spend less time on administrative drafting and more time on high-level research and mentorship.</p>
            <Link href="/auth/login" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-sky-600 text-white text-base font-semibold hover:bg-sky-700 transition-all shadow-md">
              Start Generating for Free <ArrowRight size={16} />
            </Link>
          </div>

          <p>
            By integrating Imtihan into the academic workflow, professors at institutions like AUB, LAU, and USJ can ensure their assessments remain rigorous, fresh, and perfectly aligned with their unique teaching materials.
          </p>
        </article>
      </main>

      <footer className="px-6 md:px-10 py-12 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size={24} />
          <p className="text-xs text-[var(--text-tertiary)] text-center">© {new Date().getFullYear()} Imtihan</p>
        </div>
      </footer>
    </div>
  );
}
