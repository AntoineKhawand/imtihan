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
  title: "Reclaiming Your Evenings: AI Exam Generators in Lebanon | Imtihan Blog",
  description: "Explore how Lebanese educators are overcoming preparation fatigue and grading overhead using local-curriculum AI assessment tools.",
};

export default function LebaneseTeachersBlogPage() {
  const title = "Reclaiming Your Evenings: The Power of AI Exam Generators for Lebanese Teachers";
  const url = "https://imtihan.live/blog/lebanese-teachers-ai-exam-generator";

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
              Teaching in Lebanon has always been a labor of love, but the overhead of administrative duties, preparation work, and trilingual curriculum adaptations has reached an all-time high.
            </p>

            <h2 id="burnout" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The Reality of Teacher Burnout</h2>
            <p>
              In Lebanon, educators frequently teach across multiple sections, grade levels, and even different curricula simultaneously. It is not uncommon for a high school physics teacher to teach Lebanese Baccalaureate classes in French in the morning, and International Baccalaureate (IB) classes in English in the afternoon.
            </p>
            <p>
              Every new assessment requires hours of planning. Coordinating exam difficulty across classes, translating official terms, and typing out equations manually cuts deep into evenings and weekends.
            </p>

            <BlogCallout 
              title="Time Management Tip" 
              content="Instead of starting your exam drafts from a blank document, use AI-generated baselines to establish structure. It is 10x faster to refine and edit a generated exercise than to compose it from scratch." 
            />

            <h2 id="ai-rescue" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">How AI Restores Balance</h2>
            <p>
              Imtihan was designed specifically to address this friction. By leveraging AI models optimized for local Lebanese and international frameworks, teachers can automate the heavy lifting of assessment drafting.
            </p>
            <p>
              Rather than searching through physical copies of past *Dawrat*, teachers can instruct the AI to build questions on kinetics or probability matching those standards. The platform's ability to generate Version A & B prevents cheating in overcrowded classrooms without doubling the prep workload.
            </p>

            <h2 id="local-affordability" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Affordable and Accessible Locally</h2>
            <p>
              We understand the financial constraints facing Lebanese educators. That is why Imtihan does not require international credit cards. With local integrations like <strong>WHISH Money</strong>, teachers can easily upgrade to Pro and get instant, unlimited access to exam templates and MS Word exports.
            </p>
          </article>

          <BlogAuthor 
            name="Jean-Pierre Saadeh"
            role="Director of Academics"
            avatarText="JS"
            bio="Jean-Pierre has led academic departments in prestigious Beirut schools for over 20 years. He focuses on institutional quality and teacher empowerment through technology."
          />
          <BlogRelated currentSlug="lebanese-teachers-ai-exam-generator" />

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
