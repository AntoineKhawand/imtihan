import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Clock, Share2, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { UserNav } from "@/components/layout/UserNav";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Are Your Students Bored of the Same Recycled Exams? | Imtihan Blog",
  description: "Why using past papers (Dawrat) is hurting your students' engagement in Lebanon, and how AI can instantly solve the problem with fresh, unique exercises.",
  openGraph: {
    title: "Are Your Students Bored of the Same Recycled Exams?",
    description: "Why using past papers (Dawrat) is hurting your students' engagement in Lebanon, and how AI can instantly solve the problem.",
    url: "https://imtihan.live/blog/stop-recycled-exams",
    type: "article",
  }
};

export default async function BlogPostPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session");
  const isAuthenticated = !!session;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-[var(--bg)]/75 backdrop-blur-xl border-b border-[var(--border)]/60 transition-colors">
        <Logo size={26} />
        <div className="hidden md:flex items-center gap-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
          <Link href="/blog" className="hover:text-[var(--text)] transition-colors">Blog</Link>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <UserNav />
          ) : (
            <>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
              >
                Try Imtihan <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── ARTICLE HEADER ──────────────────────────────────────────── */}
      <header className="relative pt-20 pb-12 px-6 md:px-10 border-b border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors mb-8">
            <ArrowLeft size={14} /> Back to Blog
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--accent)] bg-[var(--accent-light)] px-2.5 py-1 rounded-md">
              Teaching Strategies
            </span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-tertiary)]">
              <Clock size={12} /> 4 min read
            </span>
          </div>

          <h1 className="serif text-display-lg text-[var(--text)] leading-[1.1] mb-6 text-balance">
            Are Your Students Bored of the Same Recycled Exams?
          </h1>
          
          <div className="flex items-center justify-between py-4 border-y border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                IM
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text)] leading-tight">Imtihan Team</p>
                <p className="text-xs text-[var(--text-tertiary)]">April 30, 2026</p>
              </div>
            </div>
            <button className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] rounded-lg transition-colors">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── ARTICLE CONTENT ─────────────────────────────────────────── */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 md:px-10 py-12 md:py-16">
        <article className="prose prose-imtihan max-w-none text-[var(--text)] text-[1.05rem] leading-relaxed">
          
          {/* PROBLEM */}
          <p className="text-xl text-[var(--text-secondary)] leading-relaxed mb-10 font-medium">
            You know the drill. You spend hours compiling an exam for your Terminale class, carefully selecting exercises from 2018, 2019, and 2021 past papers. You print them, hand them out, and watch your students breeze through them in half the time. 
          </p>

          <h2 className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The "Dawrat" Dilemma</h2>
          <p>
            Why did they finish so fast? Because they've seen it all before. In Lebanon, the reliance on <em>as'ilat dawrat</em> (past official exams) is both a blessing and a curse. While it prepares them for the format of the Bac Libanais or Brevet, it completely destroys the core purpose of an assessment: <strong>measuring actual understanding</strong>.
          </p>
          <p>
            Students aren't solving physics problems anymore; they are pattern-matching. They memorize the methodology for a specific free-fall question from 2019, and the moment you change a variable, they freeze. They are bored, and worse, they are unprepared for unseen challenges.
          </p>

          {/* AGITATION */}
          <h2 className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">The Teacher's Burnout</h2>
          <p>
            So, what is the alternative? Writing an exam entirely from scratch.
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex gap-3"><CheckCircle2 className="text-[var(--accent)] shrink-0 mt-0.5" size={18} /> <span>You have to invent a completely new scenario that makes physical or mathematical sense.</span></li>
            <li className="flex gap-3"><CheckCircle2 className="text-[var(--accent)] shrink-0 mt-0.5" size={18} /> <span>You have to carefully balance the difficulty so it matches official standards.</span></li>
            <li className="flex gap-3"><CheckCircle2 className="text-[var(--accent)] shrink-0 mt-0.5" size={18} /> <span>You have to manually draft the <em>corrigé</em> (grading key), showing every single step and formula.</span></li>
          </ul>
          <p>
            For a standard 4-exercise exam, this takes upwards of <strong>3 to 4 hours</strong>. When you are teaching 5 different classes across different sections (SG, SE, SV), this is a mathematical impossibility. The result? Burnout, and a reluctant return to recycling old exams.
          </p>

          {/* SOLUTION */}
          <div className="my-14 p-8 bg-[var(--accent-light)] border border-[var(--border)] rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-5 rounded-full blur-2xl"></div>
            <h3 className="serif text-2xl font-bold text-[var(--accent-text)] mb-3">The Imtihan Solution</h3>
            <p className="text-[var(--text-secondary)] mb-6 text-base">
              What if you could generate a completely unique, never-before-seen exam, perfectly aligned with the Lebanese curriculum, in under 30 seconds?
            </p>
            <Link 
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[var(--accent)] text-white text-base font-semibold hover:bg-[var(--accent)]/90 transition-all shadow-md"
            >
              Generate a free exam now <ArrowRight size={16} />
            </Link>
          </div>

          <p>
            This is why we built <strong>Imtihan</strong>. It is not a database of old questions. It is a generative AI engine built specifically for educators in Lebanon. 
          </p>
          <p>
            You simply type what you want: <em>"Generate a Terminale SG Physics exam about RC circuits and projectile motion. Make it slightly harder than average."</em>
          </p>
          <p>
            Within seconds, Imtihan generates fresh, unique exercises. It doesn't just give you the questions; it generates the full <strong>step-by-step corrigé</strong>, highlighting the methodology required by the Lebanese Ministry of Education.
          </p>

          <h2 className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Stop Recycling. Start Teaching.</h2>
          <p>
            When students face an exam they can't Google, they are forced to actually engage with the material. They use critical thinking instead of their memory of a 2018 past paper. 
          </p>
          <p>
            You get your Sunday afternoons back. Your students get a real, engaging challenge. It's a win-win.
          </p>
        </article>
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="px-6 md:px-10 py-12 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size={24} />
          <p className="text-xs text-[var(--text-tertiary)] text-center">
            Made for Lebanese teachers · © {new Date().getFullYear()} Imtihan
          </p>
        </div>
      </footer>
    </div>
  );
}
