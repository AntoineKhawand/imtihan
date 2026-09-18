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
  title: "Is Your Child Ready for the Brevet? Mock Exams at Home | Imtihan Blog",
  description: "How Lebanese parents can use AI to create curriculum-aligned mock exams for their kids.",
  alternates: { canonical: "/blog/guide-for-parents" },
};

const FAQ_ITEMS = [
  {
    q: "Can I generate a Brevet (grade 9) mock exam with Imtihan, not just Baccalaureate exams?",
    a: "Yes — Imtihan covers the Lebanese Baccalaureate, French Baccalaureate, and IB curricula across the grade levels each system publishes chapters for, in Math, Physics, and Chemistry, so a Brevet-track parent and a Terminale-track parent can both generate a chapter-aligned mock exam.",
  },
  {
    q: "Is a fresh AI-generated exam actually harder or easier than a real official exam?",
    a: "Imtihan targets matching difficulty and format to the curriculum's own past exams, not an easier or harder substitute — the goal is a realistic dry run, not a confidence-inflating easy version.",
  },
  {
    q: "Why not just give my child last year's official past paper (Dawrat) again?",
    a: "A past paper your child has already seen, or one that's widely circulated among classmates, tests recognition more than understanding. Cognitive science's well-documented \"testing effect\" shows that recalling material under fresh, unfamiliar conditions produces far better retention than re-solving a familiar question — which is why a new, curriculum-matched exercise is more diagnostic than a repeated one.",
  },
];

export default function ParentsBlogPage() {
  const title = "Is Your Child Ready for the Brevet? Mock Exams at Home";
  const url = "https://imtihan.live/blog/guide-for-parents";

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
            author: { "@type": "Person", name: "Rima Kabbara" },
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
              The best way to know if your child is ready for the Brevet or Baccalaureate is a fresh, curriculum-matched mock exam taken under real conditions at home — not another pass through a past paper they've already half-memorized. Imtihan lets a parent generate one in minutes.
            </p>

            <h2 id="trap" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The Tutoring Trap</h2>
            <p>
              Private tutoring in Lebanon has become a necessity rather than a luxury for many families preparing for the Brevet (grade 9) and Baccalaureate. But tutoring hours are expensive, and a weekly session doesn&apos;t always tell you where your child actually stands before the official exam.
            </p>

            <BlogCallout
              title="Parent's Tip"
              content="I used Imtihan to generate a practice Physics exam for my son in Grade 9. He realized he didn't actually understand RC circuits as well as he thought—it was much better to find out at home than in the real exam!"
            />

            <h2 id="standards" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Bring the Official Standards Home</h2>
            <p>
              Imtihan allows parents to generate exams that mirror the difficulty of Lebanon's official exams, which for the Baccalaureate are published and archived by{" "}
              <a href="https://www.crdp.org/official-exams-corrections-lebanon" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-2">CRDP</a>{" "}
              (the Centre de Recherche et de Développement Pédagogiques, Lebanon&apos;s national curriculum body) going back to 2006. Rather than reusing one of those same archived papers — which your child, or their classmates, may have already seen — Imtihan generates a new exercise at matching difficulty on the same chapter.
            </p>
            <p>
              This matters because familiarity quietly inflates confidence. A student who recognizes a question from last year&apos;s Dawrat can often produce the right answer from memory, without re-deriving the reasoning that got them there — which tells a parent nothing about whether the underlying chapter is actually understood.
            </p>

            <h2 id="checklist" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">A Simple At-Home Mock Exam Checklist</h2>
            <ul>
              <li>Pick the chapters already covered in class — don&apos;t test material not yet taught.</li>
              <li>Time it under real exam conditions, no notes, no interruptions.</li>
              <li>Use a fresh exercise, not a past paper your child has already seen once.</li>
              <li>Review the corrigé together afterward, focusing on where the reasoning broke down, not just the final score.</li>
              <li>Repeat on the weakest chapter a week later, with a new exercise each time.</li>
            </ul>

            <h2 id="success" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Empower Your Child's Success</h2>
            <p>
              Your child will develop the critical thinking skills needed to handle &quot;unseen&quot; questions — the kind the official exam will actually ask, not a memorized variant of one they solved last month. Each Imtihan account starts with one free generated exam, so you can try this before deciding it&apos;s worth doing regularly.
            </p>
            <p>
              A generated exam also comes with a full, step-by-step corrigé, so you don&apos;t need to be a physics or chemistry teacher yourself to walk through where your child&apos;s reasoning went wrong — the methodology is laid out alongside the final answer, not just a bare numeric key.
            </p>
            <p>
              You can download the exam and its corrigé as a formatted Word document or PDF, print them, and run the mock exam at the kitchen table exactly like exam day — no separate app, no login required for your child, just paper and a timer.
            </p>
            <BlogFAQ items={FAQ_ITEMS} />
          </article>

          <BlogAuthor
            name="Rima Kabbara"
            role="Educational Consultant & Parent"
            avatarText="RK"
            bio="Rima is a former school principal and a mother of three. She helps parents navigate the complexities of the Lebanese educational system with modern tools."
          />
          <BlogRelated currentSlug="guide-for-parents" />

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
