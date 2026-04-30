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
  title: "Are Your Students Bored of the Same Recycled Exams? | Imtihan Blog",
  description: "Why using past papers (Dawrat) is hurting your students' engagement in Lebanon, and how AI can instantly solve the problem with fresh, unique exercises.",
};

export default function BlogPostPage() {
  const title = "Are Your Students Bored of the Same Recycled Exams?";
  const url = "https://imtihan.live/blog/stop-recycled-exams";

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
        {/* ── MAIN CONTENT ───────────────────────────────────────────── */}
        <main>
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors mb-8">
            <ArrowLeft size={14} /> Back to Blog
          </Link>
          
          <h1 className="serif text-display-lg text-[var(--text)] leading-[1.1] mb-8 text-balance">
            {title}
          </h1>

          <article className="prose prose-imtihan max-w-none text-[var(--text)] text-[1.1rem] leading-relaxed">
            <p className="text-xl text-[var(--text-secondary)] leading-relaxed mb-10 font-medium">
              You know the drill. You spend hours compiling an exam for your Terminale class, carefully selecting exercises from 2018, 2019, and 2021 past papers. 
            </p>

            <h2 id="dilemma" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The "Dawrat" Dilemma</h2>
            <p>
              In Lebanon, the reliance on <em>as'ilat dawrat</em> (past official exams) is both a blessing and a curse. While it prepares them for the format, it completely destroys the core purpose of an assessment: <strong>measuring actual understanding</strong>.
            </p>
            
            <BlogCallout 
              title="Teacher's Tip" 
              content="I started mixing one AI-generated scenario with one past paper question. The results were shocking—students who usually aced the past papers struggled with the fresh scenario, proving they were just memorizing steps." 
            />

            <h2 id="burnout" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The Teacher's Burnout</h2>
            <p>
              So, what is the alternative? Writing an exam entirely from scratch. For a standard 4-exercise exam, this takes upwards of 3 to 4 hours.
            </p>

            <h2 id="solution" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The Imtihan Solution</h2>
            <p>
              Within seconds, Imtihan generates fresh, unique exercises. It doesn't just give you the questions; it generates the full <strong>step-by-step corrigé</strong>.
            </p>

            <h2 id="conclusion" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Stop Recycling. Start Teaching.</h2>
            <p>
              When students face an exam they can't Google, they are forced to actually engage with the material. They use critical thinking instead of their memory of a 2018 past paper.
            </p>
          </article>

          <BlogAuthor 
            name="Layla Mansour"
            role="Head of Science Department"
            avatarText="LM"
            bio="Layla has over 15 years of experience coordinating Physics and Chemistry departments across Lebanon's top private schools. She is an early adopter of AI in the classroom."
          />

          <BlogRelated currentSlug="stop-recycled-exams" />
        </main>

        {/* ── SIDEBAR ────────────────────────────────────────────────── */}
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
