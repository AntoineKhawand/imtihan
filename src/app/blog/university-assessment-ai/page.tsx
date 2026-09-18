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
  title: "Complex Assessments Simplified: AI for University Exams | Imtihan Blog",
  description: "How university professors in Lebanon can streamline the creation of high-level assessments.",
  alternates: { canonical: "/blog/university-assessment-ai" },
};

const FAQ_ITEMS = [
  {
    q: "Does Imtihan use a fixed chapter list for university courses, the way it does for the Lebanese Baccalaureate?",
    a: "No. University is intentionally free-form in Imtihan's data model — there is no fixed university chapter list to pick from. Grounding comes instead from the professor's own course description, any syllabus or lecture notes uploaded, and, for Lebanese university courses, past exam sessions (\"dawrat\") from the same faculty when they're relevant to question style and difficulty.",
  },
  {
    q: "Can I upload my own lecture notes or past exams?",
    a: "Yes. You can upload course material — slides, typed notes, or a past exam — during the description step, and the generated exercises reuse your own notation and terminology instead of generic textbook phrasing.",
  },
  {
    q: "Which subjects does Imtihan support at university level right now?",
    a: "The MVP covers Math, Physics, and Chemistry, generated in French or English. Biology/SVT and Informatique are not yet supported and are planned for a later release, not the current version.",
  },
];

export default function UniversityBlogPage() {
  const title = "Complex Assessments Simplified: AI for University Exams";
  const url = "https://imtihan.live/blog/university-assessment-ai";

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
            author: { "@type": "Person", name: "Dr. Karim Zein" },
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
              University-level assessment in Imtihan works differently from the school curricula it also supports: instead of choosing from a fixed chapter list, a professor describes the course (or uploads a syllabus), and every question Imtihan generates is grounded in that material — plus, for Lebanese university courses, in real past exam sessions from the same faculty where those are relevant.
            </p>

            <h2 id="beyond" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Beyond Multiple Choice</h2>
            <p>
              Drafting open-ended, scenario-based problems is an immense time investment for any professor. A single well-constructed applied-mechanics or organic-chemistry question can take longer to write than to grade — and the marking scheme has to be just as carefully reasoned as the question itself.
            </p>

            <BlogCallout
              title="Professor's Tip"
              content="I upload my lecture notes directly to Imtihan. It generates exam questions that use my exact notation and nomenclature, which prevents student confusion during finals."
            />

            <h2 id="no-fixed-list" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Why There's No Fixed University Chapter List</h2>
            <p>
              For the Lebanese Baccalaureate, the French Baccalaureate, and the IB, Imtihan validates every chapter it references against a curriculum database sourced from each system's official programme — a chapter that isn't in that database simply can't be offered, so the exam can't reference material a student was never taught.
            </p>
            <p>
              University courses don't have one universal programme to check against — a Structural Analysis course at one Lebanese university covers different ground than one at another. Rather than guessing at a generic syllabus and risking a mismatch with what was actually taught, Imtihan keeps university content free-form: your own description and any uploaded material are the source of truth, not an assumed chapter list.
            </p>

            <h2 id="dawrat" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Grounding Style in Real Past Exams</h2>
            <p>
              For Lebanese university courses specifically, past exam papers circulated among students — commonly called <em>dawrat</em> — are a second source of grounding. When your course description points to a specific Lebanese university course, Imtihan favors matching that institution's own exam style and difficulty over generic international conventions — the same principle education researcher John Biggs described in a 1996 paper as{" "}
              <a href="https://link.springer.com/article/10.1007/BF00138871" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-2">constructive alignment</a>: assessment should mirror how a course was actually taught and examined, not a generic template.
            </p>

            <h2 id="streamlining" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">What a Generated University Exam Includes</h2>
            <ul>
              <li>Exercises grounded strictly in your description, uploaded syllabus, or lecture notes — not invented topics.</li>
              <li>A full corrigé with worked methodology alongside each answer, not just a final value.</li>
              <li>Per-exercise controls to regenerate, edit, or adjust difficulty without redoing the whole exam.</li>
              <li>Word and PDF export, formatted for printing.</li>
              <li>Optional Version A/B generation to reduce copying in large lecture halls.</li>
            </ul>

            <h2 id="modernize" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Where the Line Is Today</h2>
            <p>
              In its current release, Imtihan generates university exams in Math, Physics, and Chemistry, in French or English. Arabic-language generation, Biology/SVT, and Informatique aren't part of the current version — they're on the roadmap, not something to expect from today's build. Spend less time on administrative drafting within that scope, and more time on the parts of teaching that actually need a professor.
            </p>
            <BlogFAQ items={FAQ_ITEMS} />
          </article>

          <BlogAuthor
            name="Dr. Karim Zein"
            role="University Professor"
            avatarText="KZ"
            bio="Dr. Zein has been teaching Engineering and Physics at Lebanon's top universities for over a decade. He advocates for AI as a tool to enhance academic rigor."
          />
          <BlogRelated currentSlug="university-assessment-ai" />

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
