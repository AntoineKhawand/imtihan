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
  title: "Are Your Students Bored of the Same Recycled Exams? | Imtihan Blog",
  description: "Why using past papers (Dawrat) is hurting your students' engagement in Lebanon, and how AI can instantly solve the problem with fresh, unique exercises.",
  alternates: { canonical: "/blog/stop-recycled-exams" },
};

const FAQ_ITEMS = [
  {
    q: "Should I stop using official past papers (Dawrat) altogether?",
    a: "No — past papers stay the ground truth for format, command-term vocabulary, and mark distribution. The issue is using them unchanged as the actual test. Imtihan is built to generate a fresh 'sibling' exercise in the same style, not to replace past papers as a study resource.",
  },
  {
    q: "What is the 'testing effect' and why does it matter here?",
    a: "It's the well-documented finding that actively recalling information (being tested on it) produces far better long-term retention than re-reading or re-solving a familiar problem. A student who has already seen a past-paper question is doing recall, not retrieval practice — the fresh scenario is what actually tests understanding.",
  },
  {
    q: "Does a fresh AI-generated exercise still match the official exam's difficulty and format?",
    a: "Yes — Imtihan generates the new scenario at matching difficulty and mark structure, and produces a full step-by-step corrigé alongside it, so the exam stays comparable to a real Dawrat paper in rigor even though the numbers and context are new.",
  },
];

export default function BlogPostPage() {
  const title = "Are Your Students Bored of the Same Recycled Exams?";
  const url = "https://imtihan.live/blog/stop-recycled-exams";

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
            author: { "@type": "Person", name: "Layla Mansour" },
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
              Recycling the same past papers (Dawrat) year after year trains students to recognize questions instead of solving them — and the fix isn&apos;t writing a whole new exam from scratch, it&apos;s generating one fresh, same-difficulty &quot;sibling&quot; exercise for every past-paper question you&apos;d otherwise reuse unchanged.
            </p>

            <h2 id="dilemma" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The &quot;Dawrat&quot; Dilemma</h2>
            <p>
              In Lebanon, the reliance on <em>as&apos;ilat dawrat</em> (past official exams, published by CRDP for every branch of the Bac) is both a blessing and a curse. While it prepares them for the format, it completely destroys the core purpose of an assessment: <strong>measuring actual understanding</strong>.
            </p>
            <p>
              There&apos;s a well-established reason this backfires. Cognitive scientists Henry Roediger and Jeffrey Karpicke found that repeated <em>testing</em> of material produces dramatically better long-term retention than repeated re-reading or re-solving the same problem — a finding known as the{" "}
              <a href="https://www.retrievalpractice.org/strategies/2018/4/26/two-cognitive-scientists-you-need-to-know" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-2">testing effect</a>. In their experiments, one week after studying, students who had been repeatedly tested on new recall attempts remembered 61% of the material, compared to 40% for students who had simply re-read the same passage. A student solving a Dawrat question they&apos;ve already seen isn&apos;t retrieving — they&apos;re recognizing.
            </p>

            <BlogCallout
              title="Teacher's Tip"
              content="I started mixing one AI-generated scenario with one past paper question. The results were shocking—students who usually aced the past papers struggled with the fresh scenario, proving they were just memorizing steps."
            />

            <h2 id="burnout" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The Teacher's Burnout</h2>
            <p>
              So, what is the alternative? Writing an exam entirely from scratch. For a standard 4-exercise exam, this takes upwards of 3 to 4 hours — time most teachers don&apos;t have between correcting the last exam and preparing the next.
            </p>

            <h2 id="signs" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Signs Your Exams Are Too Recycled</h2>
            <ul>
              <li>Students finish unusually fast, but only on questions that match a past paper almost exactly.</li>
              <li>Scores on past-paper-style questions are consistently higher than on anything phrased differently.</li>
              <li>You reuse the same 2–3 past sessions every year because rewriting from scratch takes too long.</li>
              <li>Corrections feel like checking for a memorized sequence of steps, not reasoning.</li>
            </ul>

            <h2 id="solution" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The Imtihan Solution</h2>
            <p>
              Within seconds, Imtihan generates fresh, unique exercises at matching difficulty and mark structure to the Dawrat question you started from. It doesn&apos;t just give you the questions; it generates the full <strong>step-by-step corrigé</strong> alongside them, and lets you regenerate, edit, or adjust the difficulty of any single exercise without rebuilding the whole exam.
            </p>

            <h2 id="conclusion" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Stop Recycling. Start Teaching.</h2>
            <p>
              When students face an exam they can&apos;t Google, they are forced to actually engage with the material. They use critical thinking instead of their memory of a 2018 past paper.
            </p>
            <p>
              This doesn&apos;t mean retiring Dawrat from your teaching entirely — they're still the best reference for what the official exam's format and command-term vocabulary actually look like. The change is in what you hand students under exam conditions: a fresh, same-difficulty exercise for the actual test, with the familiar past paper kept for earlier practice and revision instead.
            </p>
            <BlogFAQ items={FAQ_ITEMS} />
          </article>

          <BlogAuthor
            name="Layla Mansour"
            role="Head of Science Department"
            avatarText="LM"
            bio="Layla has over 15 years of experience coordinating Physics and Chemistry departments across Lebanon's top private schools. She is an early adopter of AI in the classroom."
          />

          <BlogRelated currentSlug="stop-recycled-exams" />

          {/* MOBILE WIDGETS */}
          <div className="lg:hidden mt-12 space-y-10 border-t border-[var(--border)] pt-12">
            <BlogCalculator />
            <BlogShare title={title} url={url} />
          </div>
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
