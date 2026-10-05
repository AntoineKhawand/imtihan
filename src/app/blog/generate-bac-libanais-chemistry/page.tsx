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
import { buildFaqSchema, buildHowToSchema } from "@/components/landing/LandingFAQ";

export const metadata: Metadata = {
  title: "How to generate a Bac Libanais chemistry exam in 5 minutes | Imtihan Blog",
  description: "Learn how chemistry teachers in Lebanon can write comprehensive, curriculum-aligned Bac Libanais exam drafts and step-by-step correction keys using AI.",
  alternates: { canonical: "/blog/generate-bac-libanais-chemistry" },
};

const HOW_TO_STEPS = [
  {
    name: "Select the Curriculum",
    text: "Go to the Imtihan wizard and select Bac Libanais, Grade 12 (Terminale SV or SG), and Chemistry as your subject.",
  },
  {
    name: "Input Your Syllabus Topics",
    text: 'Type the specific concepts you want covered. For example: "kinetics of a reaction with a catalyst, and calculation of pH of a weak base during titration".',
  },
  {
    name: "Upload Notes (Optional)",
    text: "Paste your classroom summary or textbook text so the AI knows the exact notations you used in class.",
  },
  {
    name: "Generate",
    text: "Click generate. The AI will output a beautifully formatted test sheet featuring chemical equations rendered in LaTeX, accompanied by a comprehensive step-by-step corrigé.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Does this replace using the real CRDP Dawrat for exam-day questions?",
    a: "No — Dawrat stay the reference for official format and grading conventions. Imtihan generates a fresh exercise at matching difficulty on the same chapter, so students face a question they can't have already seen or memorized from a previous session, while the official past papers remain the best resource for earlier revision and practice.",
  },
  {
    q: "Which Bac Libanais chemistry topics can Imtihan generate questions for?",
    a: "Chemical kinetics at Première, and acid-base titration/pH plus organic chemistry at Terminale SV and SG — the topics that are actually part of the CRDP chemistry programme at those levels, validated against Imtihan's curriculum data before generation.",
  },
  {
    q: "Does the generated exam include a step-by-step corrigé, or just final answers?",
    a: "A full step-by-step corrigé is generated alongside the exam itself, documenting the reasoning and calculation at each step — not just the final numeric answer — so it's ready to use for grading or for a student reviewing their mistakes.",
  },
];

export default function BacLibanaisChemistryBlogPage() {
  const title = "How to generate a Bac Libanais chemistry exam in 5 minutes";
  const url = "https://imtihan.live/blog/generate-bac-libanais-chemistry";

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
          buildHowToSchema(
            "How to generate a Bac Libanais chemistry exam",
            "A step-by-step guide to creating a curriculum-aligned chemistry exam using Imtihan",
            HOW_TO_STEPS
          ),
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
              The fastest way to draft a curriculum-aligned Bac Libanais chemistry exam is to describe your topics — kinetics, pH titration, organic reactions — to Imtihan and let it generate a print-ready test with LaTeX-formatted equations and a full step-by-step corrigé in about five minutes, instead of manually retyping problems from old CRDP sessions.
            </p>

            <h2 id="challenges" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The Challenges of Bac Libanais Chemistry</h2>
            <p>
              In the Lebanese official curriculum, chemistry isn&apos;t just about selecting multiple-choice answers. Students are expected to solve detailed quantitative problems, explain reactions, and draft step-by-step justifications. Across Première and Terminale, the core topics are dense: chemical kinetics — reaction rate and the factors that affect it — acid-base titration and pH calculation, and organic chemistry, covering IUPAC nomenclature and reaction mechanisms.
            </p>
            <p>
              Educators usually find themselves scanning old official exam papers (<em>Dawrat</em>) — publicly archived by{" "}
              <a href="https://www.crdp.org/official-exams-corrections-lebanon" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-2">CRDP</a>, Lebanon&apos;s national curriculum body, going back to 2006 — manually cropping molecules, rewriting formulas, and typing calculations in MS Word. This manual workflow eats up precious weekends.
            </p>

            <BlogCallout
              title="Syllabus Tip"
              content="Make sure your exam questions clearly distinguish between chemical kinetics (reaction rate and the factors that influence it) and acid-base titration. The Lebanese official exam grading schemes heavily penalize improper explanations of the equivalence point and weak justification of acid/base couples."
            />

            <h2 id="automating" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Automating the Draft in 5 Minutes</h2>
            <p>
              Imtihan solves this by training AI on the exact structure of official Lebanese exam modules. Here is how you can build a complete, print-ready chemistry assessment in under 5 minutes:
            </p>
            <ol className="list-decimal pl-6 space-y-3 mt-4 text-xs text-[var(--text-secondary)]">
              <li><strong>Select the Curriculum:</strong> Go to the Imtihan wizard and select <em>Bac Libanais</em>, Grade 12 (Terminale SV or SG), and Chemistry as your subject.</li>
              <li><strong>Input Your Syllabus Topics:</strong> Type the specific concepts you want covered. For example: <em>&quot;kinetics of a reaction with a catalyst, and calculation of pH of a weak base during titration&quot;</em>.</li>
              <li><strong>Upload Notes (Optional):</strong> Paste your classroom summary or textbook text so the AI knows the exact notations you used in class.</li>
              <li><strong>Generate:</strong> Click generate. The AI will output a beautifully formatted test sheet featuring chemical equations rendered in LaTeX, accompanied by a comprehensive step-by-step corrigé.</li>
            </ol>

            <h2 id="exporting" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Customizing and Exporting</h2>
            <p>
              Once generated, you can review the questions directly in Imtihan. If an exercise is too difficult, you can regenerate it or edit the text. Finally, click <strong>Export to Word</strong>. The file exports with proper columns, clean margin styling, and editable formula blocks, ready to print and distribute to your classroom.
            </p>

            <h2 id="grounded" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Staying Grounded in the Real CRDP Programme</h2>
            <p>
              Imtihan validates every chapter you select against Lebanon&apos;s official CRDP programme before generating a single question. If a topic isn&apos;t part of the Terminale SV or SG chemistry syllabus, it simply isn&apos;t offered as an option, so an exam can&apos;t quietly drift into content your students were never actually taught.
            </p>
            <BlogFAQ items={FAQ_ITEMS} />
          </article>

          <BlogAuthor
            name="Imtihan Editorial Team"
            role="Imtihan"
            avatarText="IM"
            bio="Written by the Imtihan editorial team, grounded in the Lebanese Baccalaureate curriculum the product is built around."
          />
          <BlogRelated currentSlug="generate-bac-libanais-chemistry" />

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
