import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Clock, Zap, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { UserNav } from "@/components/layout/UserNav";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Reclaiming Your Sundays: How Imtihan Automates Teacher Tasks | Imtihan Blog",
  description: "Learn how generative AI can save Lebanese teachers 10+ hours a week by automating exam creation and grading key generation.",
};

export default async function TeacherProductivityBlogPage() {
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
            <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--accent)] bg-[var(--accent-light)] px-2.5 py-1 rounded-md">Productivity</span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-tertiary)]"><Clock size={12} /> 4 min read</span>
          </div>
          <h1 className="serif text-display-lg text-[var(--text)] leading-[1.1] mb-6 text-balance">
            Reclaiming Your Sundays: 5 Ways Imtihan Automates the Boring Parts of Teaching
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 md:px-10 py-12 md:py-16">
        <article className="prose prose-imtihan max-w-none text-[var(--text)] text-[1.05rem] leading-relaxed">
          <p className="text-xl text-[var(--text-secondary)] leading-relaxed mb-10 font-medium">
            Teaching is a passion, but the administrative burden often feels like a second job. For many teachers in Lebanon, Sundays are not for resting—they are for drafting exams, solving problems, and writing grading keys.
          </p>

          <h2 className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The Hidden Cost of Assessment</h2>
          <p>
            When you spend 4 hours on a single assessment, that's 4 hours you aren't spending on lesson planning, student mentorship, or your own personal life. Imtihan was designed to flip this ratio, giving you professional results in seconds.
          </p>

          <h2 className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">5 Ways to Save Time Today</h2>
          <ul className="space-y-6 my-10">
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center shrink-0 font-bold">1</div>
              <div>
                <h4 className="font-bold mb-1">Instant Scenario Generation</h4>
                <p className="text-sm">Stop looking for that perfect physics problem. Describe the concept, and Imtihan builds the scenario for you.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center shrink-0 font-bold">2</div>
              <div>
                <h4 className="font-bold mb-1">Automatic Corrigé Drafting</h4>
                <p className="text-sm">The longest part of exam prep is writing the solution. Imtihan drafts the full, step-by-step key simultaneously.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center shrink-0 font-bold">3</div>
              <div>
                <h4 className="font-bold mb-1">Multi-Section Variations</h4>
                <p className="text-sm">Need Version A and Version B? Don't rewrite the exam. One click generates a sibling exam with different values but identical difficulty.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center shrink-0 font-bold">4</div>
              <div>
                <h4 className="font-bold mb-1">Export-Ready Documents</h4>
                <p className="text-sm">Exams are formatted perfectly into PDFs or Word docs, ready for the school's printer. No more wrestling with Word tables.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center shrink-0 font-bold">5</div>
              <div>
                <h4 className="font-bold mb-1">Curriculum Specificity</h4>
                <p className="text-sm">No more general AI hallucinations. The output is grounded in the specific standards of the Bac Libanais or French Bac.</p>
              </div>
            </li>
          </ul>

          <div className="my-14 p-8 bg-[var(--accent-light)] border border-[var(--border)] rounded-2xl relative overflow-hidden text-center">
            <Zap size={32} className="mx-auto text-[var(--accent)] mb-4" />
            <h3 className="serif text-2xl font-bold text-[var(--accent-text)] mb-3">Reclaim Your Time</h3>
            <p className="text-[var(--text-secondary)] mb-6 text-base">Join thousands of teachers who have automated their exam prep.</p>
            <Link href="/auth/login" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[var(--accent)] text-white text-base font-semibold hover:bg-[var(--accent)]/90 transition-all shadow-md">
              Try Imtihan for Free <ArrowRight size={16} />
            </Link>
          </div>

          <p>
            The future of teaching isn't about working more hours—it's about working smarter. Imtihan gives you the tools to provide high-quality assessments while preserving your mental health and passion for the classroom.
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
