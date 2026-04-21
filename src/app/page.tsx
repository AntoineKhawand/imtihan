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

const STATS = [
  { value: "4",   label: "Curricula",  sub: "Bac Libanais · Bac Français · IB · Université" },
  { value: "32",  label: "Subjects",   sub: "Sciences · Humanités · Langues · Gestion" },
  { value: "3",   label: "Languages",  sub: "Français · English · العربية" },
  { value: "∞",   label: "Exercises",  sub: "Each one verified & unique" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    Icon: MessageSquare,
    title: "Describe in plain language",
    body: "Type what you need — curriculum, level, subject, chapters, duration. Or just upload your course notes and let Imtihan read them.",
  },
  {
    step: "02",
    Icon: SlidersHorizontal,
    title: "Review & fine-tune",
    body: "Confirm the detected context, adjust the difficulty mix, choose your exam structure and template. Full control, no forms to dig through.",
  },
  {
    step: "03",
    Icon: Sparkles,
    title: "Generate in seconds",
    body: "Imtihan writes every exercise and its full corrigé — with methodology, not just the final answer. Watch it stream live.",
  },
  {
    step: "04",
    Icon: Download,
    title: "Export & teach",
    body: "Download a polished Word or PDF with your school header. Ready to print in one click.",
  },
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-[var(--bg)]/75 backdrop-blur-xl border-b border-[var(--border)]/60 transition-colors">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center shadow-sm">
            <span className="text-white font-serif text-sm font-semibold">إ</span>
          </div>
          <span className="font-semibold text-[var(--text)] tracking-tight">Imtihan</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-[var(--text-secondary)]">
          <Link href="#how" className="hover:text-[var(--text)] transition-colors">How it works</Link>
          <Link href="#subjects" className="hover:text-[var(--text)] transition-colors">Subjects</Link>
          <Link href="#testimonials" className="hover:text-[var(--text)] transition-colors">Reviews</Link>
          <Link href="#pricing" className="hover:text-[var(--text)] transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="hidden md:inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            Try free <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 px-6 md:px-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-[var(--accent)] opacity-[0.045] blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-400 opacity-[0.03] blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          {/* Badge */}
          <div className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-secondary)] mb-8 shadow-sm hover:border-[var(--accent)]/30 hover:bg-[var(--accent)]/5 transition-all duration-300 cursor-default">
            <Star size={10} className="text-[var(--accent)] fill-[var(--accent)] group-hover:rotate-[72deg] transition-transform duration-500" />
            <span>3 free exams — no credit card required</span>
            <ChevronRight size={10} />
          </div>

          {/* Headline */}
          <h1 className="serif text-display-2xl text-[var(--text)] text-balance leading-[0.95] tracking-tighter mb-5">
            Exam generation
            <br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-emerald-400">for Lebanese teachers.</span>
          </h1>

          <p className="max-w-lg text-lg text-[var(--text-secondary)] leading-relaxed mb-2 text-pretty">
            Describe what you want. Upload your notes. Get a polished exam + corrigé in
            minutes — matched to your exact curriculum and syllabus.
          </p>
          <p className="max-w-lg text-sm text-[var(--text-tertiary)] leading-relaxed mb-10">
            32 subjects · Bac Libanais · Bac Français · IB · Université · Français / English / العربية
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/create"
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-16 border-t border-[var(--border)]">
            {STATS.map((stat) => (
              <div key={stat.label} className="group">
                <div className="serif text-4xl font-light text-[var(--accent)] mb-1 group-hover:scale-105 transition-transform origin-left">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-[var(--text)] mb-0.5">{stat.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] leading-relaxed">{stat.sub}</div>
              </div>
            ))}
          </div>
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

          <div className="grid md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {/* connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(100%+0.75rem)] w-6 border-t border-dashed border-[var(--border-strong)]" />
                )}
                <div className="card p-6 h-full bg-[var(--surface)] hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.05] transition-all duration-300 group ring-1 ring-black/[0.02]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <step.Icon size={16} className="text-white" />
                    </div>
                    <span className="serif text-2xl font-light text-[var(--text-tertiary)]">{step.step}</span>
                  </div>
                  <h3 className="font-semibold text-[var(--text)] mb-2 leading-snug text-sm">{step.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
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
                <span className="text-xs text-[var(--text-tertiary)]">imtihan.app/create</span>
              </div>
            </div>
            <div className="p-6 md:p-10 min-h-[340px] flex flex-col gap-5">
              {/* User message */}
              <div className="flex items-start gap-3 justify-end">
                <div className="flex-1 max-w-md bg-[var(--accent)] rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white leading-relaxed">
                  Examen de Philosophie pour Terminale L Bac Libanais, chapitres éthique et épistémologie, 2 exercices, 1h30, en français
                </div>
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 mt-1 text-xs text-[var(--text-secondary)] font-medium">T</div>
              </div>
              {/* AI response */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-serif">إ</span>
                </div>
                <div className="flex-1 bg-[var(--bg-subtle)] rounded-2xl rounded-tl-sm px-4 py-4">
                  <p className="text-xs text-[var(--text-tertiary)] mb-3 font-medium uppercase tracking-wide">Exam context identified</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2.5 mb-4">
                    {[
                      ["Curriculum", "Bac Libanais"],
                      ["Level", "Terminale L"],
                      ["Subject", "Philosophie"],
                      ["Language", "Français"],
                      ["Duration", "1h 30"],
                      ["Exercises", "2"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide">{k}</span>
                        <span className="text-xs font-semibold text-[var(--text)]">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]">
                    <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <span className="text-xs text-[var(--accent)] font-medium">High confidence · Generating exam…</span>
                  </div>
                </div>
              </div>
              {/* Streaming preview */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles size={14} className="text-[var(--accent)]" />
                </div>
                <div className="flex-1 bg-[var(--bg-subtle)] rounded-2xl rounded-tl-sm px-4 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                    <span className="text-xs font-medium text-[var(--accent)]">Exercice 1 — Éthique et liberté</span>
                    <span className="text-[10px] text-[var(--text-tertiary)] ml-auto">8 pts · Moyen</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-[var(--border)] rounded w-full" />
                    <div className="h-2.5 bg-[var(--border)] rounded w-4/5" />
                    <div className="h-2.5 bg-[var(--border)] rounded w-3/5" />
                  </div>
                </div>
              </div>
            </div>
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
      <section id="pricing" className="px-6 md:px-10 py-24 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-4">Pricing</p>
            <h2 className="serif text-display-lg text-[var(--text)]">
              Start free, upgrade when<br />you&apos;re convinced
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5 max-w-2xl">
            {/* Free */}
            <div className="card p-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.03] transition-all duration-300">
              <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-medium mb-4">Free</p>
              <div className="serif text-4xl font-light text-[var(--text)] mb-1">$0</div>
              <p className="text-sm text-[var(--text-secondary)] mb-6">3 exams to try everything</p>
              <ul className="space-y-3 mb-8 text-sm text-[var(--text-secondary)]">
                {[
                  "3 complete exams + corrigés",
                  "All 4 curricula & 32 subjects",
                  "Word + PDF export",
                  "Version A/B generation",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center text-xs flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/create"
                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] active:scale-[0.98] transition-all duration-300"
              >
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative card p-8 border-[var(--accent)]/80 ring-1 ring-[var(--accent)]/10 bg-[var(--accent-light)] shadow-md hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--accent)]/15 transition-all duration-300">
              <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-[var(--accent)] text-white text-xs font-medium shadow-md shadow-[var(--accent)]/20">
                Most popular
              </div>
              <p className="text-xs uppercase tracking-wider text-[var(--accent)] font-medium mb-4">Pro</p>
              <div className="serif text-4xl font-light text-[var(--text)] mb-1">
                $9<span className="text-lg text-[var(--text-secondary)]">/mo</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-6">Unlimited exams for one teacher</p>
              <ul className="space-y-3 mb-8 text-sm text-[var(--text-secondary)]">
                {[
                  "Unlimited exams + corrigés",
                  "All 4 curricula & 32 subjects",
                  "Exam library — saved forever",
                  "Priority AI generation",
                  "Email delivery",
                  "Early access to new features",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/create"
                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent)]/90 active:scale-[0.98] transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-[var(--accent)]/20"
              >
                Start free trial <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="px-6 md:px-10 py-12 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <span className="text-white font-serif text-xs">إ</span>
            </div>
            <span className="font-semibold text-[var(--text)] text-sm tracking-tight">Imtihan</span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] text-center">
            Made for Lebanese teachers · © {new Date().getFullYear()} Imtihan
          </p>
          <div className="flex items-center gap-5 text-xs text-[var(--text-tertiary)]">
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text)] transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-[var(--text)] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
