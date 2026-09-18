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
import { BlogFAQ } from "@/components/blog/BlogFAQ";
import { SchemaOrg } from "@/components/SchemaOrg";
import { buildFaqSchema } from "@/components/landing/LandingFAQ";

export const metadata: Metadata = {
  title: "Reclaiming Your Sundays: 5 Ways Imtihan Automates Tasks | Imtihan Blog",
  description: "Learn how generative AI can save Lebanese teachers 10+ hours a week by automating exam creation.",
  alternates: { canonical: "/blog/save-time-teaching" },
};

const FAQ_ITEMS = [
  {
    q: "How much of a teacher's week actually goes to admin work like exam drafting?",
    a: "The OECD's 2024 TALIS survey — the largest international survey of teachers — found that teaching itself makes up only around 43% of a teacher's self-reported working time; the rest is planning, grading, administration, and related tasks. Assessment drafting is one of the largest single pieces of that non-teaching time.",
  },
  {
    q: "Does Imtihan replace a teacher's own judgment on what to include?",
    a: "No. It drafts a baseline — questions, scenarios, and a corrigé — that you review and edit exercise by exercise. Every generated chapter is checked against the actual curriculum, but the final call on what ships to students stays with the teacher.",
  },
  {
    q: "What exactly do I get back after generating an exam?",
    a: "A complete exam with a matching corrigé that includes worked methodology (not just final answers), exportable to Word and PDF, with the option to generate a second version (Version A/B) and to regenerate, edit, or re-difficulty any single exercise afterward.",
  },
];

export default function ProductivityBlogPage() {
  const title = "Reclaiming Your Sundays: 5 Ways Imtihan Automates Tasks";
  const url = "https://imtihan.live/blog/save-time-teaching";

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <BlogProgressBar />
      <SchemaOrg
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description: metadata.description,
            author: { "@type": "Person", name: "Samer Haddad" },
            publisher: {
              "@type": "Organization",
              name: "Imtihan",
              logo: { "@type": "ImageObject", url: "https://imtihan.live/logo.png" },
            },
          },
          buildFaqSchema(FAQ_ITEMS),
        ]}
      />
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
              Imtihan automates the five slowest parts of writing an exam — finding a scenario, formatting it, writing the corrigé, building a second version, and checking curriculum alignment — so a draft that used to take 3–4 hours on a Sunday takes closer to 10 minutes to generate and review.
            </p>

            <h2 id="cost" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The Hidden Cost of Assessment</h2>
            <p>
              When you spend 4 hours on a single assessment, that&apos;s 4 hours you aren&apos;t spending on lesson planning or student mentorship. Internationally, the OECD&apos;s{" "}
              <a href="https://www.oecd.org/en/publications/results-from-talis-2024_90df6235-en/full-report/the-demands-of-teaching_0e941e2f.html" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-2">2024 TALIS survey</a>{" "}
              found teachers report spending only about 43% of their working time on actual instruction — the rest goes to planning, grading, and administration, and exam drafting sits squarely inside that non-teaching share.
            </p>

            <BlogCallout
              title="Teacher's Tip"
              content="I used to spend my entire Sunday morning drafting Math keys. Now, I generate the exam on Saturday night in 10 minutes, and my Sunday is completely free for my family."
            />

            <h2 id="ways" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">5 Ways to Save Time Today</h2>
            <p>Imtihan automates the most time-consuming parts of your workflow. In order, a typical 4-hour Sunday prep session usually breaks down like this:</p>
            <ul>
              <li>Roughly 1 hour hunting for a scenario that fits the chapter without repeating last term&apos;s numbers.</li>
              <li>Roughly 1.5 hours writing the corrigé, step by step, after the questions are already finished.</li>
              <li>30–45 minutes building a second version so two sections can&apos;t compare answers.</li>
              <li>The remaining time reformatting equations, tables, and spacing so the file actually prints cleanly.</li>
            </ul>
            <p>Each of those four steps maps to one of the automations below.</p>

            <h3 id="scenario" className="text-xl font-bold text-[var(--text)] mt-8 mb-3 serif">1. Instant Scenario Generation</h3>
            <p>Stop looking for that perfect physics problem. Describe the concept, and Imtihan builds the scenario for you, grounded in the chapter you specify.</p>

            <h3 id="corrige" className="text-xl font-bold text-[var(--text)] mt-8 mb-3 serif">2. Automatic Corrigé Drafting</h3>
            <p>The longest part of exam prep is writing the solution. Imtihan drafts the full, step-by-step key simultaneously, with methodology shown at every step — not just the final number.</p>

            <h3 id="variations" className="text-xl font-bold text-[var(--text)] mt-8 mb-3 serif">3. Multi-Section Variations</h3>
            <p>Need Version A and Version B? One click generates a sibling exam with different values but identical difficulty, so adjacent sections can&apos;t copy off each other.</p>

            <h3 id="granular" className="text-xl font-bold text-[var(--text)] mt-8 mb-3 serif">4. Granular Per-Exercise Edits</h3>
            <p>Not happy with one exercise out of five? Regenerate, tighten, loosen, or hand-edit that single question instead of restarting the whole exam.</p>

            <h3 id="export" className="text-xl font-bold text-[var(--text)] mt-8 mb-3 serif">5. Print-Ready Export</h3>
            <p>Download the finished exam and corrigé as a formatted Word document or PDF, ready to print — no re-formatting equations or tables by hand.</p>

            <h2 id="future" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Working Smarter</h2>
            <p>
              None of this replaces your judgment as a teacher — Imtihan drafts a baseline you still review, edit, and approve exercise by exercise, and every chapter it can reference is checked against the actual curriculum so it can&apos;t quietly drift off-syllabus. What it removes is the blank-page problem: the hour spent staring at an empty document before you&apos;ve even started drafting the first question.
            </p>
            <p>Imtihan gives you the tools to provide high-quality assessments while preserving your mental health — your first exam is free to try, with no card required, before any paywall applies.</p>
            <BlogFAQ items={FAQ_ITEMS} />
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
