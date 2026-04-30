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
  title: "Complex Assessments Simplified: AI for University Exams | Imtihan Blog",
  description: "How university professors in Lebanon can streamline the creation of high-level assessments.",
};

export default function UniversityBlogPage() {
  const title = "Complex Assessments Simplified: AI for University Exams";
  const url = "https://imtihan.live/blog/university-assessment-ai";

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
              University exams are complex syntheses of lectures and research.
            </p>

            <h2 id="beyond" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Beyond Multiple Choice</h2>
            <p>
              Drafting open-ended, scenario-based problems is an immense time investment for any professor.
            </p>

            <BlogCallout 
              title="Professor's Tip" 
              content="I upload my LaTeX lecture notes directly to Imtihan. It generates exam questions that use my exact notation and nomenclature, which prevents student confusion during finals." 
            />

            <h2 id="streamlining" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Streamlining Higher Ed</h2>
            <p>Imtihan’s advanced engine allows professors to generate exercises grounded strictly in their provided material.</p>

            <h2 id="modernize" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Modernize Your Teaching</h2>
            <p>Spend less time on administrative drafting and more time on high-level research.</p>
          </article>

          <BlogAuthor 
            name="Dr. Karim Zein"
            role="University Professor"
            avatarText="KZ"
            bio="Dr. Zein has been teaching Engineering and Physics at Lebanon's top universities for over a decade. He advocates for AI as a tool to enhance academic rigor."
          />
          <BlogRelated currentSlug="university-assessment-ai" />
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
