import { BlogArticleDates } from "@/components/blog/BlogArticleDates";
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

export const metadata = staticBlogMetadata("stop-recycled-exams");

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
  const editorial = BLOG_EDITORIAL["stop-recycled-exams"];
  const title = editorial.title;
  const url = "https://imtihan.live/blog/stop-recycled-exams";

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <BlogProgressBar />
      <SchemaOrg
        schema={[
          buildBlogArticleSchema({ slug: "stop-recycled-exams", title, description: editorial.description, published: editorial.published, modified: BLOG_REFRESH_DATE, language: editorial.language, image: blogFigurePath(editorial.figure) }),
          buildBlogBreadcrumbSchema("stop-recycled-exams", title),
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

          <BlogArticleDates published={editorial.published} french={editorial.language === "fr"} />
          <BlogArticleFigure kind={editorial.figure} french={editorial.language === "fr"} />

          <article className="prose prose-imtihan max-w-none text-[var(--text)] text-[1.1rem] leading-relaxed">
            <p className="text-xl text-[var(--text-secondary)] leading-relaxed mb-10 font-medium">
              Recycling the same past papers (Dawrat) year after year trains students to recognize questions instead of solving them — and the fix isn&apos;t writing a whole new exam from scratch, it&apos;s generating one fresh, same-difficulty &quot;sibling&quot; exercise for every past-paper question you&apos;d otherwise reuse unchanged.
            </p>

            <h2 id="dilemma" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The &quot;Dawrat&quot; Dilemma</h2>
            <p>
              In Lebanon, the reliance on <em>as&apos;ilat dawrat</em> (past official exams, published by CRDP for every branch of the Bac) is both a blessing and a curse. Past papers are valuable for understanding the format. If students already know the answers, add unfamiliar questions to check whether they can apply the method independently.
            </p>
            <p>
              A useful classroom distinction is whether students can reproduce a remembered solution or explain a method in an unfamiliar context. Keep official past papers for format practice, and use fresh questions to ask students why a method works, which assumptions it needs and how the conclusion changes when the evidence changes.
            </p>

            <BlogCallout
              title="Teacher's Tip"
              content="Mixing one freshly generated scenario in among past-paper questions is a quick way to tell whether students actually understand the method, rather than having memorized the steps to one recycled problem."
            />

            <h2 id="burnout" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The Teacher's Burnout</h2>
            <p>
              So, what is the alternative? Writing an exam entirely from scratch. The work includes choosing contexts, checking values, solving the paper and preparing a marking guide. The time required depends on the topic and the review needed.
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
            <BlogPracticalExample slug="stop-recycled-exams" />
            <BlogFAQ items={FAQ_ITEMS} />
          </article>

          <BlogAuthor
            name="Imtihan Editorial Team"
            role="Imtihan"
            avatarText="IM"
            bio="Written by the Imtihan editorial team, grounded in the Lebanese, French, and IB curricula the product is built around."
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
