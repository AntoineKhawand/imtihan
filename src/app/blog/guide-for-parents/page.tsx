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
  title: "Is Your Child Ready for the Brevet? Mock Exams at Home | Imtihan Blog",
  description: "How Lebanese parents can use AI to create curriculum-aligned mock exams for their kids.",
};

export default function ParentsBlogPage() {
  const title = "Is Your Child Ready for the Brevet? Mock Exams at Home";
  const url = "https://imtihan.live/blog/guide-for-parents";

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
              In Lebanon, the "Official Exam Season" is a time of high stress for parents.
            </p>

            <h2 id="trap" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The Tutoring Trap</h2>
            <p>
              Private tutoring in Lebanon has become a necessity rather than a luxury.
            </p>

            <BlogCallout 
              title="Parent's Tip" 
              content="I used Imtihan to generate a practice Physics exam for my son in Grade 9. He realized he didn't actually understand RC circuits as well as he thought—it was much better to find out at home than in the real exam!" 
            />

            <h2 id="standards" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Bring the Official Standards Home</h2>
            <p>Imtihan allows parents to generate exams that mirror the exact difficulty of the Lebanese Official Exams.</p>

            <h2 id="success" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Empower Your Child's Success</h2>
            <p>Your child will develop the critical thinking skills needed to handle "unseen" questions.</p>
          </article>

          <BlogAuthor 
            name="Rima Kabbara"
            role="Educational Consultant & Parent"
            avatarText="RK"
            bio="Rima is a former school principal and a mother of three. she helps parents navigate the complexities of the Lebanese educational system with modern tools."
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
