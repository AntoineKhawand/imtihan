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
  title: "IB Mark Scheme Generator: Free Tool for IB Teachers | Imtihan Blog",
  description: "Find out how to automatically generate detailed IB-compliant mark schemes for DP Physics and Chemistry using Imtihan's free AI tool.",
};

export default function IbMarkSchemeBlogPage() {
  const title = "IB mark scheme generator: free tool for IB teachers";
  const url = "https://imtihan.live/blog/ib-mark-scheme-generator";

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
              Creating a science assessment for the International Baccalaureate (IB) Diploma Programme is only half the battle. The real time sink is writing the detailed mark scheme.
            </p>

            <h2 id="importance" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Why IB Mark Schemes Are Crucial</h2>
            <p>
              In the IB DP Chemistry and Physics syllabi, mark schemes are highly structured. They aren't just lists of numbers; they are rubrics that reward specific logical steps. A single question might assign separate marks for identifying a formula, substituting values, using correct state symbols, and writing the final value with appropriate significant figures.
            </p>
            <p>
              When teachers write tests, compiling these criteria manually takes an enormous amount of effort. If a question is slightly modified, the entire calculation chain must be updated.
            </p>

            <BlogCallout 
              title="Grading Secret" 
              content="When grading Chemistry Paper 2, remember that students are awarded marks for showing their work even if a previous calculation was wrong (Error Carried Forward - ECF). Your marking keys must clearly map these steps so that you can grade fairly." 
            />

            <h2 id="ai-generation" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Generating Compliant Mark Schemes</h2>
            <p>
              Imtihan's built-in <strong>IB mark scheme generator</strong> automates this workflow. When you prompt the AI to generate a question, the platform simultaneously builds a matching correction grid.
            </p>
            <p>
              The system recognizes key IB Command Terms (e.g., <em>Deduce, Outline, Explain, Annotate</em>) and allocates marks accordingly. For quantitative problems in Physics (like mechanics or quantum fields), the generator produces full calculations in LaTeX format, documenting every step from raw formula to final uncertainty bounds.
            </p>

            <h2 id="getting-started" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Get Started for Free</h2>
            <p>
              IB teachers can sign up on Imtihan and generate their first mock exam and mark scheme completely for free. After generation, you can edit individual questions, add custom prompts, and export the entire test and grading key to Microsoft Word or PDF for easy grading.
            </p>
          </article>

          <BlogAuthor 
            name="David Vance"
            role="IB Science Coordinator"
            avatarText="DV"
            bio="David Vance has taught IB DP Physics and Chemistry in international schools for 12 years. He specializes in designing modern classroom assessment systems."
          />
          <BlogRelated currentSlug="ib-mark-scheme-generator" />

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
