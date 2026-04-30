import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { BlogProgressBar } from "@/components/blog/BlogProgressBar";
import { BlogCalculator } from "@/components/blog/BlogCalculator";
import { BlogAuthor } from "@/components/blog/BlogAuthor";
import { BlogShare } from "@/components/blog/BlogShare";
import { BlogTableOfContents } from "@/components/blog/BlogTableOfContents";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { BlogRelated } from "@/components/blog/BlogRelated";

export const metadata: Metadata = {
  title: "The Coordinator’s Secret: Standardizing Exam Quality | Imtihan Blog",
  description: "How educational coordinators in Lebanon can use AI to ensure consistent, high-quality assessments.",
};

export default function CoordinatorsBlogPage() {
  const title = "The Coordinator’s Secret: Standardizing Exam Quality";
  const url = "https://imtihan.live/blog/exam-standardization";

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <BlogProgressBar />
      <nav className="sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-[var(--bg)]/75 backdrop-blur-xl border-b border-[var(--border)]/60 transition-colors">
        <Logo size={26} />
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
            Try Imtihan <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-[1fr_300px] gap-12 px-6 md:px-10 py-16 md:py-24">
        <main>
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors mb-8">
            <ArrowLeft size={14} /> Back to Blog
          </Link>
          <h1 className="serif text-display-lg text-[var(--text)] leading-[1.1] mb-8 text-balance">{title}</h1>

          <article className="prose prose-imtihan max-w-none text-[var(--text)] text-[1.1rem] leading-relaxed">
            <p className="text-xl text-[var(--text-secondary)] leading-relaxed mb-10 font-medium">
              Educational coordination is about more than just managing schedules.
            </p>

            <h2 id="inconsistency" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The Inconsistency Problem</h2>
            <p>
              One of the biggest challenges for coordinators is the variation in assessments between different teachers in the same grade.
            </p>

            <BlogCallout 
              title="Coordinator's Tip" 
              content="I implemented Imtihan for all Grade 12 sections. Now, when I review exams, I know the difficulty is uniform across all 4 sections of Terminale SE. It saved me 5 hours of 'balancing' sessions every month." 
            />

            <h2 id="standardization" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Standardization Through AI</h2>
            <p>Imtihan acts as a 'Gold Standard' for your department.</p>

            <h2 id="reputation" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Academic Reputation</h2>
            <p>Standardizing ensures that every grade given is a true reflection of the student's mastery.</p>
          </article>

          <BlogAuthor 
            name="Jean-Pierre Saadeh"
            role="Director of Academics"
            avatarText="JS"
            bio="Jean-Pierre has led academic departments in prestigious Beirut schools for over 20 years. He focuses on institutional quality and teacher empowerment through technology."
          />
          <BlogRelated currentSlug="exam-standardization" />

          {/* MOBILE WIDGETS */}
          <div className="lg:hidden mt-12 space-y-10 border-t border-[var(--border)] pt-12">
            <BlogCalculator />
            <BlogShare title={title} url={url} />
          </div>
        </main>

        <aside className="hidden lg:flex flex-col gap-10 sticky top-24 self-start">
          <BlogTableOfContents />
          <BlogCalculator />
          <BlogShare title={title} url={url} />
        </aside>
      </div>

      <footer className="px-6 md:px-10 py-12 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size={24} />
          <p className="text-xs text-[var(--text-tertiary)] text-center">© {new Date().getFullYear()} Imtihan</p>
        </div>
      </footer>
    </div>
  );
}
