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
  title: "Reclaiming Your Sundays: 5 Ways Imtihan Automates Tasks | Imtihan Blog",
  description: "Learn how generative AI can save Lebanese teachers 10+ hours a week by automating exam creation.",
};

export default function ProductivityBlogPage() {
  const title = "Reclaiming Your Sundays: 5 Ways Imtihan Automates Tasks";
  const url = "https://imtihan.live/blog/save-time-teaching";

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
              Teaching is a passion, but the administrative burden often feels like a second job.
            </p>

            <h2 id="cost" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The Hidden Cost of Assessment</h2>
            <p>
              When you spend 4 hours on a single assessment, that's 4 hours you aren't spending on lesson planning or student mentorship.
            </p>

            <BlogCallout 
              title="Teacher's Tip" 
              content="I used to spend my entire Sunday morning drafting Math keys. Now, I generate the exam on Saturday night in 10 minutes, and my Sunday is completely free for my family." 
            />

            <h2 id="ways" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">5 Ways to Save Time Today</h2>
            <p>Imtihan automates the most time-consuming parts of your workflow.</p>

            <h3 id="scenario" className="text-xl font-bold text-[var(--text)] mt-8 mb-3 serif">1. Instant Scenario Generation</h3>
            <p>Stop looking for that perfect physics problem. Describe the concept, and Imtihan builds the scenario for you.</p>

            <h3 id="corrige" className="text-xl font-bold text-[var(--text)] mt-8 mb-3 serif">2. Automatic Corrigé Drafting</h3>
            <p>The longest part of exam prep is writing the solution. Imtihan drafts the full, step-by-step key simultaneously.</p>

            <h3 id="variations" className="text-xl font-bold text-[var(--text)] mt-8 mb-3 serif">3. Multi-Section Variations</h3>
            <p>Need Version A and Version B? One click generates a sibling exam with different values but identical difficulty.</p>

            <h2 id="future" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Working Smarter</h2>
            <p>Imtihan gives you the tools to provide high-quality assessments while preserving your mental health.</p>
          </article>

          <BlogAuthor 
            name="Samer Haddad"
            role="Mathematics Teacher"
            avatarText="SH"
            bio="Samer is a dedicated math teacher with 10 years of experience in the Lebanese secondary curriculum. He specializes in integrating technology to improve student outcomes."
          />
          <BlogRelated currentSlug="save-time-teaching" />

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
