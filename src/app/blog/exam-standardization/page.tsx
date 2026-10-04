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
  title: "The Coordinator’s Secret: Standardizing Exam Quality | Imtihan Blog",
  description: "How educational coordinators in Lebanon can use AI to ensure consistent, high-quality assessments.",
  alternates: { canonical: "/blog/exam-standardization" },
};

const FAQ_ITEMS = [
  {
    q: "Does “standardizing” exam quality mean every teacher gives an identical exam?",
    a: "No — Imtihan generates a distinct exam per teacher or section, but grounds every one in the same chapter objectives, difficulty distribution, and points allocation, so the exams differ in content while staying comparable in rigor. Sections aren't forced onto one shared paper; they're built from one shared baseline.",
  },
  {
    q: "How is this different from just agreeing on a shared rubric at a department meeting?",
    a: "A rubric agreement only holds as long as every teacher applies it the same way when actually writing questions — which is exactly where inter-rater consistency tends to break down. Imtihan enforces the baseline at generation time, in every exam, instead of relying on teachers to self-apply a shared standard after the fact.",
  },
  {
    q: "Does standardized difficulty mean questions get easier for weaker sections?",
    a: "No — the goal is comparable rigor, not a curve. Imtihan generates each section's exam against the same chapter coverage and difficulty mix a coordinator sets, so a grade reflects mastery of the material rather than which teacher happened to write that particular version.",
  },
];

export default function CoordinatorsBlogPage() {
  const title = "The Coordinator’s Secret: Standardizing Exam Quality";
  const url = "https://imtihan.live/blog/exam-standardization";

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
            author: { "@type": "Organization", name: "Imtihan" },
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
              Standardizing exam quality across a department means giving every teacher the same baseline — chapter coverage, difficulty distribution, and points allocation — so an exam written by one teacher is comparably rigorous to one written by another, without forcing everyone onto an identical paper. Imtihan gives coordinators that shared baseline in minutes instead of a manual review meeting.
            </p>

            <h2 id="inconsistency" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The Inconsistency Problem</h2>
            <p>
              One of the biggest challenges for coordinators is the variation in assessments between different teachers in the same grade. Two Terminale SE sections can sit exams with the same title and duration yet cover different depths of a chapter, use different command-term phrasing, or weight a hard question at 2 points in one classroom and 4 in another.
            </p>
            <p>
              This isn&apos;t a discipline problem — it&apos;s what researchers call inter-rater (or inter-marker) reliability: how consistently different people apply the same standard when working independently. The Council for the Accreditation of Educator Preparation (CAEP), a U.S. body that accredits teacher-training programs, defines it as the degree to which raters reach the same or very similar decisions when assessing the same material, and notes that low consistency directly undermines how credible and valid an assessment&apos;s results are (
              <a href="https://caepnet.org/terms/inter-rater-reliability/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-2">CAEP</a>
              ). A department where each teacher independently decides what &quot;hard enough&quot; means for Terminale SE has exactly the ingredients for low inter-rater reliability, at the level of writing the exam rather than just grading it.
            </p>

            <BlogCallout
              title="Coordinator's Tip"
              content="Using the same generated baseline across every parallel section — rather than each teacher drafting independently — is what actually keeps difficulty uniform, without a manual 'balancing' pass afterward."
            />

            <h2 id="standardization" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Standardization Through AI</h2>
            <p>
              Imtihan acts as a shared &quot;Gold Standard&quot; for your department. Instead of every teacher starting from a blank document and their own sense of what the chapter requires, each exam is generated against the same validated chapter objectives — the same curriculum data every other teacher&apos;s exam draws from — with the difficulty mix and points distribution the coordinator sets applied consistently across every section.
            </p>
            <p>Without a shared baseline, this is what tends to drift between teachers in the same department, even when everyone means well:</p>
            <ul>
              <li>Which sub-objectives of a chapter actually get tested, versus quietly skipped.</li>
              <li>How many points a &quot;hard&quot; question is worth relative to an &quot;easy&quot; one.</li>
              <li>How much partial-credit reasoning the corrigé actually documents step by step.</li>
              <li>Whether the exam matches the official exam&apos;s command-term vocabulary or each teacher&apos;s own phrasing.</li>
            </ul>

            <h2 id="reputation" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Academic Reputation</h2>
            <p>
              Standardizing ensures that every grade given is a true reflection of the student&apos;s mastery, not of which section they happened to be assigned to. Parents and students who compare notes across sections notice a mismatch in difficulty quickly — and once one section&apos;s grades are seen as &quot;easier,&quot; the coordinator&apos;s job becomes defending every subsequent grade, not just fixing the original gap.
            </p>
            <p>
              A shared baseline solves that at the source: instead of reviewing four teachers&apos; drafts after the fact and asking for revisions, a coordinator sets the standard once, and every section&apos;s exam is generated against it directly, with a matching corrigé produced alongside each version.
            </p>
            <BlogFAQ items={FAQ_ITEMS} />
          </article>

          <BlogAuthor
            name="Imtihan Editorial Team"
            role="Imtihan"
            avatarText="IM"
            bio="Written by the Imtihan editorial team, grounded in the Lebanese, French, and IB curricula the product is built around."
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
