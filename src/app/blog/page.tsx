import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { UserNav } from "@/components/layout/UserNav";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Blog — Imtihan",
  description: "Insights, tips, and strategies for modern educators and parents in Lebanon.",
};

const ARTICLES = [
  {
    slug: "stop-recycled-exams",
    title: "Are Your Students Bored of the Same Recycled Exams?",
    description: "Why using past papers (Dawrat) is hurting your students' engagement, and how AI can instantly solve the problem.",
    date: "April 30, 2026",
    readTime: "4 min read",
    category: "Teaching Strategies"
  },
  {
    slug: "save-time-teaching",
    title: "Reclaiming Your Sundays: How Imtihan Automates Teacher Tasks",
    description: "Learn how generative AI can save Lebanese teachers 10+ hours a week by automating exam creation.",
    date: "April 30, 2026",
    readTime: "4 min read",
    category: "Productivity"
  },
  {
    slug: "guide-for-parents",
    title: "Is Your Child Ready for the Brevet? Create Mock Exams at Home",
    description: "How Lebanese parents can use AI to create curriculum-aligned mock exams for their kids.",
    date: "April 30, 2026",
    readTime: "5 min read",
    category: "Parental Guides"
  },
  {
    slug: "exam-standardization",
    title: "The Coordinator’s Secret: Standardizing Exam Quality",
    description: "How educational coordinators in Lebanon can use AI to ensure consistent, high-quality assessments.",
    date: "April 30, 2026",
    readTime: "6 min read",
    category: "Leadership"
  },
  {
    slug: "university-assessment-ai",
    title: "Complex Assessments Simplified: AI for University Exams",
    description: "How university professors in Lebanon can streamline the creation of high-level assessments.",
    date: "April 30, 2026",
    readTime: "5 min read",
    category: "Higher Ed"
  }
];

export default async function BlogIndexPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session");
  const isAuthenticated = !!session;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <nav className="sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-[var(--bg)]/75 backdrop-blur-xl border-b border-[var(--border)]/60 transition-colors">
        <Logo size={26} />
        <div className="hidden md:flex items-center gap-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
          <Link href="/pricing" className="hover:text-[var(--text)] transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <UserNav />
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden md:inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
              >
                Try free <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </nav>

      <header className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-6 md:px-10 overflow-hidden border-b border-[var(--border)]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[var(--accent)] opacity-[0.03] blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-4">Imtihan Blog</p>
          <h1 className="serif text-display-xl text-[var(--text)] leading-tight mb-4">
            Insights for the entire educational community
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Resources for teachers, parents, coordinators, and professors.
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-10 py-16 md:py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ARTICLES.map((article) => (
            <Link 
              key={article.slug} 
              href={`/blog/${article.slug}`}
              className="group card p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--accent)] bg-[var(--accent-light)] px-2.5 py-1 rounded-md">
                    {article.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-tertiary)]">
                    <Clock size={12} /> {article.readTime}
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-[var(--text)] mb-3 leading-snug group-hover:text-[var(--accent)] transition-colors">
                  {article.title}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                  {article.description}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4">
                <span className="text-xs font-medium text-[var(--text-tertiary)]">{article.date}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
                  Read article <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="px-6 md:px-10 py-12 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size={24} />
          <p className="text-xs text-[var(--text-tertiary)] text-center order-3 md:order-2">
            Made for Lebanese teachers · © {new Date().getFullYear()} Imtihan
          </p>
        </div>
      </footer>
    </div>
  );
}
