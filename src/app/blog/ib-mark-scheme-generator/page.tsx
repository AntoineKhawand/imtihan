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
  title: "IB Mark Scheme Generator: Free Tool for IB Teachers | Imtihan Blog",
  description: "Find out how to automatically generate detailed IB-compliant mark schemes for DP Physics and Chemistry using Imtihan's free AI tool.",
  alternates: { canonical: "/blog/ib-mark-scheme-generator" },
};

const FAQ_ITEMS = [
  {
    q: "Does Imtihan's mark scheme use the exact wording IB examiners use?",
    a: "Command terms are harmonized in meaning across Diploma Programme subjects, but the authoritative glossary for exact wording lives inside each subject's own guide. Imtihan generates mark schemes built around the same command-term logic (Deduce, Outline, Explain, Annotate, and others), which you should still check against your specific subject guide before a high-stakes exam.",
  },
  {
    q: "What is Error Carried Forward (ECF) and why does it matter for grading fairness?",
    a: "ECF means a student keeps every mark for correct method and logic in the steps after an early mistake, instead of losing all subsequent marks because one number was wrong. Imtihan's generated mark schemes map out each step separately so ECF can be applied consistently, rather than leaving it to an examiner's memory mid-grading.",
  },
  {
    q: "Can I edit the mark allocation after Imtihan generates it?",
    a: "Yes. Every generated question and its mark scheme can be edited, regenerated, or adjusted for difficulty individually — the AI draft is a starting point, and the final allocation is always the teacher's call.",
  },
];

export default function IbMarkSchemeBlogPage() {
  const title = "IB mark scheme generator: free tool for IB teachers";
  const url = "https://imtihan.live/blog/ib-mark-scheme-generator";

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
            author: { "@type": "Person", name: "David Vance" },
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
              An IB-compliant mark scheme awards separate marks for each distinct step of reasoning — not just the final numeric answer — and applies error carried forward (ECF) so an early mistake doesn&apos;t zero out every mark that follows. Imtihan generates that structured mark scheme automatically alongside every DP Physics or Chemistry question it drafts.
            </p>

            <h2 id="importance" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Why IB Mark Schemes Are Crucial</h2>
            <p>
              In the IB DP Chemistry and Physics syllabi, mark schemes are highly structured. They aren&apos;t just lists of numbers; they are rubrics that reward specific logical steps. A single question might assign separate marks for identifying a formula, substituting values, using correct state symbols, and writing the final value with appropriate significant figures.
            </p>
            <p>
              When teachers write tests, compiling these criteria manually takes an enormous amount of effort. If a question is slightly modified — a different mass, a different angle, a different reagent — the entire calculation chain, and every mark tied to it, has to be reworked by hand, one line at a time.
            </p>
            <p>
              The IB&apos;s own guidance on assessment describes command terms as signalling the expected depth of a response, and notes that the authoritative glossary for each is defined inside the relevant Diploma Programme subject guide rather than in one document covering every subject (
              <a href="https://ibo.org/programmes/diploma-programme/assessment-and-exams/understanding-ib-assessment/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-2">IB Diploma Programme assessment</a>
              ). That&apos;s exactly why a mark scheme has to track which command term a question actually used, not just assign a flat point value.
            </p>

            <BlogCallout
              title="Grading Secret"
              content="When grading Chemistry Paper 2, remember that students are awarded marks for showing their work even if a previous calculation was wrong (Error Carried Forward - ECF). Your marking keys must clearly map these steps so that you can grade fairly."
            />

            <h2 id="ai-generation" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Generating Compliant Mark Schemes</h2>
            <p>
              Imtihan&apos;s built-in <strong>IB mark scheme generator</strong> automates this workflow. When you prompt the AI to generate a question, the platform simultaneously builds a matching correction grid.
            </p>
            <p>
              For quantitative problems in Physics (like mechanics or quantum fields), the generator produces full calculations in LaTeX format, documenting every step from raw formula to final uncertainty bounds. Common command terms and the depth of response Imtihan expects for each include:
            </p>
            <ul>
              <li><strong>Deduce</strong> — reach a conclusion from given information, showing the reasoning step, not just the result.</li>
              <li><strong>Outline</strong> — give a brief account or summary, without extended justification.</li>
              <li><strong>Explain</strong> — give a detailed account including reasons or causes.</li>
              <li><strong>Annotate</strong> — add brief notes to a diagram or graph, identifying key features.</li>
            </ul>

            <h2 id="getting-started" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Get Started for Free</h2>
            <p>
              IB teachers can sign up on Imtihan and generate their first mock exam and mark scheme completely for free, no card required. After generation, you can edit individual questions, add custom prompts, and export the entire test and grading key to Microsoft Word or PDF for easy grading — or regenerate a single question without rebuilding the whole paper.
            </p>
            <BlogFAQ items={FAQ_ITEMS} />
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
