import Link from "next/link";
import { ArrowLeft, CheckCircle2, Shield, Heart, Zap, BookOpen } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const metadata = {
  title: "About Us — Imtihan | AI Exam Generator for Teachers",
  description: "Discover the story and mission behind Imtihan. We empower Lebanese and international educators by automating exam creation (Bac Libanais, Bac Français, IB) to save hours of prep time.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Imtihan — Empowering Teachers with AI",
    description: "Learn how Imtihan is solving teacher burnout in Lebanon by automating curriculum-aligned exam drafts and marking keys.",
    url: "https://imtihan.live/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Navigation */}
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft size={16} />
          <span className="text-sm hidden sm:block">Back</span>
        </Link>
        <Logo size={28} />
        <div className="w-20" />
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 px-6 md:px-10 overflow-hidden border-b border-[var(--border)]/60 mesh-gradient">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--accent)] opacity-[0.03] blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          <div className="relative max-w-3xl mx-auto text-center">
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-bold mb-4">Our Mission</p>
            <h1 className="serif text-display-xl text-[var(--text)] mb-6 leading-tight">
              Giving teachers their <span className="italic text-[var(--accent)]">Sundays back.</span>
            </h1>
            <p className="text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
              Imtihan was born out of a simple observation: teachers spend hours formatting, translating, and drafting assessments instead of doing what they do best—teaching.
            </p>
          </div>
        </section>

        {/* Narrative Section */}
        <section className="max-w-3xl mx-auto px-6 py-16 md:py-24 space-y-16">
          <div className="space-y-6 text-sm text-[var(--text-secondary)] leading-relaxed">
            <h2 className="serif text-2xl text-[var(--text)] font-semibold mb-4">The Story Behind Imtihan</h2>
            <p>
              In Arabic, <strong>Imtihan (إمتحان)</strong> means assessment or exam. For educators teaching in the Lebanese curriculum, the French Lycée system, or international schools following the International Baccalaureate, creating high-quality exams is a high-stakes, time-consuming task.
            </p>
            <p>
              Traditional workflows often involve manually scouring decades of past papers (known in Lebanon as *Dawrat*), copying text, translating physical curriculum handouts, and hand-writing full correction guides. If a coordinator rejects an exercise, or if a teacher wants to make Version A and Version B to prevent student cheating, the cycle starts all over again.
            </p>
            <p>
              We built Imtihan to bridge this gap. By utilizing advanced, curriculum-aligned artificial intelligence, Imtihan allows teachers to describe what they want in plain French, English, or Arabic. The system generates high-fidelity questions, formatted matrices, and step-by-step marking schemes (*corrigés*) in under 30 seconds.
            </p>
          </div>

          {/* Core Values Grid */}
          <div className="space-y-6">
            <h2 className="serif text-2xl text-[var(--text)] font-semibold mb-6">Our Core Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6 space-y-3 bg-[var(--surface)] hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
                <h3 className="font-semibold text-[var(--text)] text-sm">Curriculum Rigor</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  We verify our models against official frameworks (CRDP Liban, AEFE, IB DP/MYP). No generic, hallucinated syllabus questions.
                </p>
              </div>

              <div className="card p-6 space-y-3 bg-[var(--surface)] hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Shield size={16} />
                </div>
                <h3 className="font-semibold text-[var(--text)] text-sm">Teacher Control First</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  AI is the assistant, not the decider. Imtihan generates starting drafts and editable exports. The teacher remains the final expert.
                </p>
              </div>

              <div className="card p-6 space-y-3 bg-[var(--surface)] hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Zap size={16} />
                </div>
                <h3 className="font-semibold text-[var(--text)] text-sm">Efficiency Without Friction</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  No complex training required. Plain text prompt input, document upload capability, and exports to Microsoft Word in one click.
                </p>
              </div>

              <div className="card p-6 space-y-3 bg-[var(--surface)] hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                  <Heart size={16} />
                </div>
                <h3 className="font-semibold text-[var(--text)] text-sm">Lebanese Rooted</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Specifically tailored to support the unique constraints of Lebanese schools, local subjects, trilingual demands, and offline printing requirements.
                </p>
              </div>
            </div>
          </div>

          {/* Quick CTA */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] p-8 text-center space-y-5">
            <h3 className="serif text-xl text-[var(--text)] font-semibold">Join thousands of educators transforming their workload</h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
              Register for free today, generate your first fully-structured exam with its correction key, and export it directly to Word.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/auth/register" className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-95 transition-opacity">
                Create Free Account
              </Link>
              <Link href="/pricing" className="inline-flex items-center justify-center h-10 px-5 rounded-xl border border-[var(--border)] text-xs text-[var(--text-secondary)] font-medium hover:bg-[var(--surface)] transition-all">
                View Pricing Plans
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
