import { BlogArticleDates } from "@/components/blog/BlogArticleDates";
import { BlogWorkloadEvidence } from "@/components/blog/BlogWorkloadEvidence";
import { BLOG_EDITORIAL, BLOG_REFRESH_DATE, blogFigurePath } from "@/data/blogEditorial";
import { staticBlogMetadata } from "@/lib/blogMetadata";
import { buildBlogArticleSchema, buildBlogBreadcrumbSchema } from "@/lib/blogSchema";
import { BlogArticleFigure } from "@/components/blog/BlogArticleFigure";
import { BlogPracticalExample } from "@/components/blog/BlogPracticalExample";
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

export const metadata = staticBlogMetadata("save-time-teaching");

const FAQ_ITEMS = [
  {
    q: "How much of a teacher's week actually goes to admin work like exam drafting?",
    a: "The OECD’s TALIS 2024 report distinguishes classroom instruction from planning, marking and administration. These international findings explain why preparation deserves attention, but do not measure Imtihan’s time savings or the workload of Lebanese teachers specifically.",
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
  const editorial = BLOG_EDITORIAL["save-time-teaching"];
  const title = editorial.title;
  const url = "https://imtihan.live/blog/save-time-teaching";

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <BlogProgressBar />
      <SchemaOrg
        schema={[
          buildBlogArticleSchema({ slug: "save-time-teaching", title, description: editorial.description, published: editorial.published, modified: BLOG_REFRESH_DATE, language: editorial.language, image: blogFigurePath(editorial.figure) }),
          buildBlogBreadcrumbSchema("save-time-teaching", title),
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

          <BlogArticleDates published={editorial.published} french={editorial.language === "fr"} />
          <BlogArticleFigure kind={editorial.figure} french={editorial.language === "fr"} />

          <article className="prose prose-imtihan max-w-none text-[var(--text)] text-[1.1rem] leading-relaxed">
            <p className="text-xl text-[var(--text-secondary)] leading-relaxed mb-10 font-medium">
              AI exam preparation can help with drafting questions, worked solutions and editable documents. The practical goal is to reduce repeated work while leaving time to solve the paper, check its difficulty and review every answer before students receive it.
            </p>

            <h2 id="cost" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The Hidden Cost of Assessment</h2>
            <BlogWorkloadEvidence />

            <BlogCallout
              title="Teacher's Tip"
              content="Draft the questions and worked solutions together. Then solve the paper independently before reviewing the generated corrigé; this makes errors and missing assumptions easier to spot."
            />

            <h2 id="ways" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">5 Ways to Save Time Today</h2>
            <p>Start by identifying which parts of your own preparation are repetitive. The steps below are a workflow to try, not a measured claim about how many hours every teacher saves.</p>

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
            <BlogPracticalExample slug="save-time-teaching" />
            <BlogFAQ items={FAQ_ITEMS} />
          </article>

          <BlogAuthor
            name="Imtihan Editorial Team"
            role="Imtihan"
            avatarText="IM"
            bio="Written by the Imtihan editorial team, grounded in the Lebanese, French, and IB curricula the product is built around."
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
