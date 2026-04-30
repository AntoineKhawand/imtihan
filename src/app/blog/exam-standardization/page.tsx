import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { UserNav } from "@/components/layout/UserNav";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "The Coordinator’s Secret: Standardizing Exam Quality | Imtihan Blog",
  description: "How educational coordinators in Lebanon can use AI to ensure consistent, high-quality assessments across their entire department.",
};

export default async function CoordinatorsBlogPage() {
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
            Contact Sales <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      <header className="relative pt-20 pb-12 px-6 md:px-10 border-b border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors mb-8">
            <ArrowLeft size={14} /> Back to Blog
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--accent)] bg-[var(--accent-light)] px-2.5 py-1 rounded-md">Leadership</span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-tertiary)]"><Clock size={12} /> 6 min read</span>
          </div>
          <h1 className="serif text-display-lg text-[var(--text)] leading-[1.1] mb-6 text-balance">
            The Coordinator’s Secret: Standardizing Exam Quality Across Your Entire Department
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 md:px-10 py-12 md:py-16">
        <article className="prose prose-imtihan max-w-none text-[var(--text)] text-[1.05rem] leading-relaxed">
          <p className="text-xl text-[var(--text-secondary)] leading-relaxed mb-10 font-medium">
            Educational coordination is about more than just managing schedules. It's about ensuring that every student in a grade, regardless of who their teacher is, faces an assessment of the same rigor, quality, and curriculum alignment.
          </p>

          <h2 className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The Inconsistency Problem</h2>
          <p>
            One of the biggest challenges for coordinators in Lebanese schools is the variation in assessments. Teacher A might create a Physics exam that is too easy, while Teacher B creates one that is excessively difficult for the same grade level. This leads to grade inflation, parent complaints, and inaccurate data on student performance.
          </p>

          <h2 className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Standardization Through Generative AI</h2>
          <p>
            Imtihan acts as a "Gold Standard" for your department. By setting department-wide criteria in the AI generator, you ensure that every teacher is pulling from the same high-quality scenarios and methodologies.
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex gap-3"><CheckCircle2 className="text-[var(--accent)] shrink-0 mt-0.5" size={18} /> <span><strong>Unified Methodology:</strong> Ensure that all <em>Corrigés</em> follow the official Lebanese or French methodology consistently.</span></li>
            <li className="flex gap-3"><CheckCircle2 className="text-[var(--accent)] shrink-0 mt-0.5" size={18} /> <span><strong>Rapid Review:</strong> Coordinators can review exams in minutes because the format and quality are standardized.</span></li>
            <li className="flex gap-3"><CheckCircle2 className="text-[var(--accent)] shrink-0 mt-0.5" size={18} /> <span><strong>Anti-Cheating Control:</strong> Generate Version A and Version B for every exam with identical difficulty but different values.</span></li>
          </ul>

          <div className="my-14 p-8 bg-[var(--surface-raised)] border border-[var(--border)] rounded-2xl text-center shadow-lg">
            <ShieldCheck size={40} className="mx-auto text-[var(--accent)] mb-4" />
            <h3 className="serif text-2xl font-bold text-[var(--text)] mb-3">Empower Your Department</h3>
            <p className="text-[var(--text-secondary)] mb-6 text-base">Bring transparency and quality to every classroom in your school.</p>
            <Link href="/auth/login" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[var(--accent)] text-white text-base font-semibold hover:bg-[var(--accent)]/90 transition-all shadow-md">
              Learn about School Licenses <ArrowRight size={16} />
            </Link>
          </div>

          <p>
            Transitioning to Imtihan doesn't just save your teachers time—it protects the academic reputation of your institution by ensuring that every grade given is a true reflection of the student's mastery of the curriculum.
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
