import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SchemaOrg } from "@/components/SchemaOrg";

export const metadata: Metadata = {
  title: "Imtihan — AI Exam Generator for Teachers in Lebanon",
  description: "Create curriculum-aligned exams for Bac Libanais, Bac Français, IB, and University in seconds. Full answer key included. 2 free exams, no credit card required.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Imtihan — AI Exam Generator for Teachers in Lebanon",
    description: "Describe your exam in French, English, or Arabic. Imtihan generates questions and a full corrigé in seconds. Bac Libanais · Bac Français · IB · University.",
    url: "https://www.imtihan.live",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Imtihan — AI Exam Generator" }],
  },
};
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Zap,
  Shield,
  Globe2,
  ChevronRight,
  Star,
  FlaskConical,
  BookMarked,
  TrendingUp,
  GraduationCap,
  MessageSquare,
  SlidersHorizontal,
  Sparkles,
  Download,
} from "lucide-react";
import { MotionHero, MotionStats, MotionHowItWorks, MotionStreamingPreview } from "@/components/landing/LandingMotion";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { UserNav } from "@/components/layout/UserNav";
import { Logo } from "@/components/ui/Logo";

const STATS = [
  { value: "4",   label: "Curricula",  sub: "Bac Libanais · Bac Français · IB · Université" },
  { value: "32",  label: "Subjects",   sub: "Sciences · Humanités · Langues · Gestion" },
  { value: "3",   label: "Languages",  sub: "Français · English · العربية" },
  { value: "∞",   label: "Exercises",  sub: "Each one verified & unique" },
];

const SUBJECT_CATEGORIES = [
  {
    Icon: FlaskConical,
    label: "Sciences",
    color: "text-emerald-600 bg-emerald-50",
    subjects: ["Mathématiques", "Physique", "Chimie", "Biologie", "SVT", "Informatique", "NSI", "Environnement"],
  },
  {
    Icon: BookMarked,
    label: "Humanités & Langues",
    color: "text-violet-600 bg-violet-50",
    subjects: ["Histoire-Géo", "Philosophie", "Arabe", "Français", "Anglais", "Espagnol", "Allemand"],
  },
  {
    Icon: TrendingUp,
    label: "Sciences sociales",
    color: "text-amber-600 bg-amber-50",
    subjects: ["Économie", "SES", "Psychologie", "Sociologie", "Droit", "Politique mondiale"],
  },
  {
    Icon: GraduationCap,
    label: "Université & Gestion",
    color: "text-sky-600 bg-sky-50",
    subjects: ["Comptabilité", "Management", "Commerce", "Médecine", "Ingénierie", "Architecture"],
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Describe, don't click through forms",
    body: "Write what you want in plain language. Upload your course notes. Imtihan reads both and builds your exam automatically.",
  },
  {
    icon: BookOpen,
    title: "32 subjects across all curricula",
    body: "Sciences, humanities, languages, economics, philosophy — every subject from Bac Libanais, Bac Français, IB, and University is covered. No hallucinated content outside your syllabus.",
  },
  {
    icon: Globe2,
    title: "French, English & Arabic",
    body: "The exam language follows the course. Physics in French for Terminale S, Economics in English for IB, Arabic grammar for Bac Libanais Littéraire. All three handled natively.",
  },
  {
    icon: Shield,
    title: "Corrigé with full methodology",
    body: "Not just the final answer — every step, every formula, every common student mistake flagged. Grading is part of teaching.",
  },
];

const TESTIMONIALS = [
  {
    quote: "J'ai généré un contrôle complet de physique Terminale en 4 minutes. Le corrigé était aussi bon que ce que j'aurais écrit moi-même.",
    name: "Professeur de Physique",
    school: "Lycée français de Beyrouth",
  },
  {
    quote: "The Version A/B feature is exactly what I needed. My students can't share answers between sections anymore.",
    name: "Math Teacher",
    school: "International College, Beirut",
  },
  {
    quote: "أخيراً أداة تفهم المنهج اللبناني بشكل صحيح. الأسئلة دقيقة ومطابقة للمستوى.",
    name: "أستاذ رياضيات",
    school: "المدرسة الإنجيلية اللبنانية",
  },
];

const FAQ_ITEMS = [
  {
    q: "Which curricula are supported?",
    a: "Imtihan is designed specifically for the Lebanese Baccalaureate (EB9 to Terminale), the French Baccalaureate (Seconde to Terminale), the International Baccalaureate (IB), as well as university courses."
  },
  {
    q: "Is the grading key (corrigé) included?",
    a: "Yes. For every generated exam, Imtihan produces a detailed grading key. This includes not just the final answer, but a step-by-step methodology."
  },
  {
    q: "How long does it take to generate an exam?",
    a: "Thanks to our AI engine, generating a complete exam (2 to 4 exercises) and its grading key usually takes under 30 seconds."
  },
  {
    q: "Can I export the exam for printing?",
    a: "Yes, all exams and grading keys can be exported as PDFs or Word documents (.docx), ready to be distributed to your students."
  },
  {
    q: "Is it free?",
    a: "You can generate your first 2 complete exams for free (no credit card required). After that, the Pro subscription unlocks 100 exams per month."
  }
];

export default async function LandingPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session");
  const isAuthenticated = !!session;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Imtihan",
    "applicationCategory": "EducationApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "2 free exams"
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <SchemaOrg schema={[softwareSchema, faqSchema]} />

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-[var(--bg)]/75 backdrop-blur-xl border-b border-[var(--border)]/60 transition-colors">
        <Logo />
        <div className="hidden md:flex items-center gap-6 text-sm text-[var(--text-secondary)]">
          <Link href="#how" className="hover:text-[var(--text)] transition-colors">How it works</Link>
          <Link href="#subjects" className="hover:text-[var(--text)] transition-colors">Subjects</Link>
          <Link href="#testimonials" className="hover:text-[var(--text)] transition-colors">Reviews</Link>
          <Link href="#pricing" className="hover:text-[var(--text)] transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <UserNav />
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden md:inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
              >
                Try free <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 px-6 md:px-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-[var(--accent)] opacity-[0.045] blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-400 opacity-[0.03] blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          <MotionHero>
            <div className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-secondary)] mb-8 shadow-sm hover:border-[var(--accent)]/30 hover:bg-[var(--accent)]/5 transition-all duration-300 cursor-default" aria-label="2 free exams — no credit card required">
              <Star size={10} className="text-[var(--accent)] fill-[var(--accent)] group-hover:rotate-[72deg] transition-transform duration-500" />
              <span>2 free exams — no credit card required</span>
              <ChevronRight size={10} />
            </div>

            {/* Headline */}
            <h1 className="serif text-display-2xl text-[var(--text)] text-balance leading-[0.95] tracking-tighter mb-5">
              The exam you imagined,
              <br />
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-emerald-400">built in minutes.</span>
            </h1>
          </MotionHero>

          <p className="max-w-lg text-lg text-[var(--text-secondary)] leading-relaxed mb-2 text-pretty">
            Describe what you need in plain language. Imtihan generates a complete, curriculum-aligned exam with detailed solutions in seconds.
          </p>
          <p className="max-w-lg text-sm text-[var(--text-tertiary)] leading-relaxed mb-10">
            Supports Bac Libanais · Bac Français · IB · University courses.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={isAuthenticated ? "/create" : "/auth/register"}
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-[var(--accent)] text-white text-base font-medium hover:bg-[var(--accent)]/90 active:scale-[0.98] transition-all duration-300 shadow-[0_0_15px_rgba(26,94,63,0.2)] hover:shadow-[0_0_25px_rgba(26,94,63,0.35)] ring-1 ring-inset ring-white/20"
            >
              Create your first exam <ArrowRight size={16} />
            </Link>
            <Link
              href="#how"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl border border-[var(--border)] text-[var(--text)] text-base font-medium hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] transition-all"
            >
              See how it works
            </Link>
          </div>

          {/* Stats */}
          <MotionStats stats={STATS} />
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section id="how" className="px-6 md:px-10 py-24 border-t border-[var(--border)] bg-[var(--bg-subtle)]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-4">How it works</p>
              <h2 className="serif text-display-lg text-[var(--text)] text-balance">
                From description<br />to printed exam
              </h2>
            </div>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity self-start md:self-auto"
            >
              Try it now <ArrowRight size={14} />
            </Link>
          </div>

          <MotionHowItWorks />
        </div>
      </section>

      {/* ── DEMO PREVIEW ─────────────────────────────────────────────── */}
      <section className="px-6 md:px-10 py-24 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-4">See it in action</p>
            <h2 className="serif text-display-lg text-[var(--text)]">One sentence.<br />A complete exam.</h2>
          </div>

          <div className="relative rounded-3xl border border-[var(--border)]/80 bg-[var(--surface)] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.03]">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 h-10 border-b border-[var(--border)] bg-[var(--bg-subtle)]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/80 shadow-sm" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80 shadow-sm" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/80 shadow-sm" />
              <div className="flex-1 mx-3 h-6 rounded-md bg-[var(--bg)] shadow-inner flex items-center px-3 border border-[var(--border)]/50">
                <span className="text-xs text-[var(--text-tertiary)]">imtihan.live/create</span>
              </div>
            </div>
            <MotionStreamingPreview />
          </div>
        </div>
      </section>

      {/* ── SUBJECT CATEGORIES ──────────────────────────────────────── */}
      <section id="subjects" className="px-6 md:px-10 py-24 border-t border-[var(--border)] bg-[var(--bg-subtle)]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-4">What you can generate</p>
            <h2 className="serif text-display-lg text-[var(--text)] text-balance">
              Every subject.<br />Every curriculum.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SUBJECT_CATEGORIES.map((cat) => (
              <div key={cat.label} className="card p-5 flex flex-col gap-4 bg-[var(--surface)] hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.05] transition-all duration-300 ring-1 ring-black/[0.02]">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                    <cat.Icon size={16} />
                  </div>
                  <span className="text-sm font-semibold text-[var(--text)]">{cat.label}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.subjects.map((s) => (
                    <span
                      key={s}
                      className="inline-block px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border)] text-[10px] text-[var(--text-secondary)] leading-5"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section id="features" className="px-6 md:px-10 py-24 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-4">Why Imtihan</p>
            <h2 className="serif text-display-lg text-[var(--text)] text-balance">
              Built for how Lebanese<br />teachers actually work
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="card p-8 group hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.05] transition-all duration-300 ring-1 ring-black/[0.02]"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <f.icon size={20} />
                </div>
                <h3 className="font-semibold text-[var(--text)] mb-2 leading-snug">{f.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CURRICULA STRIP ──────────────────────────────────────────── */}
      <section className="relative px-6 md:px-10 py-16 bg-gradient-to-br from-[var(--accent)] to-[#0d3422] overflow-hidden border-y border-emerald-900/30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/15 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="relative z-10">
            <p className="text-emerald-200 text-xs uppercase tracking-widest font-medium mb-2">Supported curricula</p>
            <h3 className="serif text-2xl text-white font-light leading-snug">
              One tool for every<br />school in Lebanon
            </h3>
          </div>
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
            {[
              { name: "Bac Libanais", sub: "EB9 → Terminale · 3 tracks" },
              { name: "Bac Français", sub: "Seconde → Terminale" },
              { name: "IB Diploma", sub: "MYP5 · DP SL / HL" },
              { name: "Université", sub: "L1 → M2 · All majors" },
            ].map((c) => (
              <div key={c.name} className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 hover:bg-white/20 transition-colors duration-300 cursor-default">
                <p className="text-white text-sm font-semibold leading-snug">{c.name}</p>
                <p className="text-emerald-200 text-xs mt-0.5 leading-relaxed">{c.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section id="testimonials" className="px-6 md:px-10 py-24 bg-[var(--bg-subtle)] border-t border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-12">What teachers say</p>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card bg-[var(--surface)] p-7 flex flex-col justify-between gap-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.04] transition-all duration-300 ring-1 ring-black/[0.02]">
                <div>
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="text-[var(--accent)] fill-[var(--accent)]" />
                    ))}
                  </div>
                  <p className="text-sm text-[var(--text)] leading-relaxed text-pretty">&ldquo;{t.quote}&rdquo;</p>
                </div>
                <div className="pt-4 border-t border-[var(--border)]">
                  <p className="text-xs font-semibold text-[var(--text)]">{t.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{t.school}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────── */}
      <LandingPricing isAuthenticated={isAuthenticated} />

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-10 py-24 border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-4">Frequently Asked Questions</p>
            <h2 className="serif text-display-lg text-[var(--text)]">Everything you need to know</h2>
          </div>
          
          <div className="space-y-6">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="card p-6 bg-[var(--surface)] hover:shadow-md transition-shadow">
                <h3 className="text-[var(--text)] font-semibold mb-2">{item.q}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="px-6 md:px-10 py-16 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6">
          <Logo size={28} />
          <p className="text-xs text-[var(--text-tertiary)] text-center order-3 md:order-2">
            Made for Lebanese teachers · © {new Date().getFullYear()} Imtihan
          </p>
          <div className="flex items-center justify-center gap-5 text-xs text-[var(--text-tertiary)] order-2 md:order-3">
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text)] transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-[var(--text)] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
