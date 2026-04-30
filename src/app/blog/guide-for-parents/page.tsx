import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Clock, Share2, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { UserNav } from "@/components/layout/UserNav";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Is Your Child Ready for the Brevet? Create Realistic Mock Exams at Home | Imtihan Blog",
  description: "How Lebanese parents can use AI to create curriculum-aligned mock exams for their kids, saving on private tutoring and ensuring official exam readiness.",
};

export default async function ParentsBlogPage() {
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
            <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--accent)] bg-[var(--accent-light)] px-2.5 py-1 rounded-md">Parental Guides</span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-tertiary)]"><Clock size={12} /> 5 min read</span>
          </div>
          <h1 className="serif text-display-lg text-[var(--text)] leading-[1.1] mb-6 text-balance">
            Is Your Child Ready for the Brevet? Create Realistic Mock Exams at Home
          </h1>
          <div className="flex items-center justify-between py-4 border-y border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm shadow-sm">IM</div>
              <div>
                <p className="text-sm font-semibold text-[var(--text)] leading-tight">Imtihan Team</p>
                <p className="text-xs text-[var(--text-tertiary)]">April 30, 2026</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 md:px-10 py-12 md:py-16">
        <article className="prose prose-imtihan max-w-none text-[var(--text)] text-[1.05rem] leading-relaxed">
          <p className="text-xl text-[var(--text-secondary)] leading-relaxed mb-10 font-medium">
            In Lebanon, the "Official Exam Season" is a time of high stress for parents. We spend thousands on private tutors just to make sure our kids have seen enough "Dawrat" to pass. But are they actually learning, or just memorizing?
          </p>

          <h2 className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The Tutoring Trap</h2>
          <p>
            Private tutoring in Lebanon has become a necessity rather than a luxury. Many parents feel they have no choice but to hire help for Brevet (EB9) or Terminale preparation. However, much of this tutoring time is spent simply looking for exercises and solving old ones.
          </p>
          <p>
            What if you could provide your child with fresh, curriculum-aligned practice without the heavy price tag of an hourly tutor?
          </p>

          <h2 className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Bring the Official Standards Home</h2>
          <p>
            Imtihan allows parents to generate exams that mirror the exact difficulty and style of the Lebanese Official Exams. Whether it's <strong>Maths, Physics, or SVT</strong>, you can produce a mock exam in seconds.
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex gap-3"><CheckCircle2 className="text-[var(--accent)] shrink-0 mt-0.5" size={18} /> <span><strong>Instant Verification:</strong> Every exam comes with a step-by-step <em>Corrigé</em> so you can help your child understand their mistakes.</span></li>
            <li className="flex gap-3"><CheckCircle2 className="text-[var(--accent)] shrink-0 mt-0.5" size={18} /> <span><strong>Infinite Practice:</strong> Unlike past papers which are limited, you can generate hundreds of unique variations.</span></li>
            <li className="flex gap-3"><CheckCircle2 className="text-[var(--accent)] shrink-0 mt-0.5" size={18} /> <span><strong>Curriculum Alignment:</strong> Imtihan is built specifically for the Lebanese, French, and IB frameworks.</span></li>
          </ul>

          <div className="my-14 p-8 bg-[var(--accent-light)] border border-[var(--border)] rounded-2xl relative overflow-hidden text-center">
            <h3 className="serif text-2xl font-bold text-[var(--accent-text)] mb-3">Empower Your Child's Success</h3>
            <p className="text-[var(--text-secondary)] mb-6 text-base">Stop relying on recycled past papers. Give your child a fresh challenge today.</p>
            <Link href="/auth/login" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[var(--accent)] text-white text-base font-semibold hover:bg-[var(--accent)]/90 transition-all shadow-md">
              Start Your Free Trial <ArrowRight size={16} />
            </Link>
          </div>

          <p>
            By using Imtihan, you turn study time into active learning. Your child will develop the critical thinking skills needed to handle "unseen" questions in the official exams, giving them a massive advantage on the big day.
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
