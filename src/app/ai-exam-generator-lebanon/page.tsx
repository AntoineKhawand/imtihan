import Link from "next/link";
import { ArrowRight, Check, Sparkles, BookOpen, Clock, Copy, Layers } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { SchemaOrg } from "@/components/SchemaOrg";
import { LandingFAQ, buildFaqSchema } from "@/components/landing/LandingFAQ";

export const metadata = {
  title: "AI Exam Generator Lebanon | Imtihan",
  description: "The leading AI exam generator tailored for teachers and schools in Lebanon. Generate curriculum-aligned exams, Brevet / Bac mock tests, and full corrigés in seconds.",
  alternates: { canonical: "/ai-exam-generator-lebanon" },
  openGraph: {
    title: "AI Exam Generator Lebanon — Imtihan",
    description: "Create customized exams in English, French, or Arabic aligned to Lebanese, French, and IB standards. Perfect for Lebanese schools and tutors.",
    url: "https://imtihan.live/ai-exam-generator-lebanon",
  },
};

const BENEFITS = [
  {
    icon: Sparkles,
    title: "Designed for Lebanon's Education System",
    body: "Unlike generic AI models, Imtihan understands the trilingual and multi-curriculum demands of schools in Lebanon. Whether you teach in Arabic, French, or English, it adapts perfectly."
  },
  {
    icon: Clock,
    title: "Save 10+ Hours Every Week",
    body: "Drafting questions, drawing diagrams, writing full step-by-step correction keys (corrigés), and adjusting difficulty distributions now takes under 30 seconds."
  },
  {
    icon: Copy,
    title: "Version A & B Cheating Prevention",
    body: "Instantly clone any generated assessment into a parallel version with different numerical values and scenarios, but with the exact same level of difficulty."
  },
  {
    icon: Layers,
    title: "Class Notes Integration",
    body: "Upload your classroom slides, PDFs, or textbook chapters. Imtihan's AI will parse your sources and write questions matching what your students actually studied."
  }
];

const LEBANON_FAQ_ITEMS = [
  {
    q: "What makes this AI exam generator different for Lebanon specifically?",
    a: "Imtihan understands Lebanon's trilingual, multi-curriculum reality natively — Bac Libanais, Bac Français, and IB — and generates exams in Arabic, French, or English depending on what you teach, not a generic translation of one template.",
  },
  {
    q: "How much time does it actually save teachers?",
    a: "Most teachers report saving 10+ hours a week. Drafting questions, formatting diagrams, and writing a full step-by-step corrigé — work that normally takes an evening — takes under 30 seconds.",
  },
  {
    q: "What is Version A/B and how does it prevent cheating?",
    a: "Version A/B instantly clones a generated exam into a second version with different numbers or scenarios but identical difficulty, so students seated next to each other get different papers.",
  },
  {
    q: "Can I generate exams from my own class notes?",
    a: "Yes. Upload your slides, PDFs, or textbook chapters and Imtihan's AI reads them to write questions matched to exactly what you covered in class, instead of generic textbook content.",
  },
  {
    q: "Which schools and curricula does Imtihan support in Lebanon?",
    a: "Imtihan supports the Lebanese Baccalaureate and Brevet (EB9), the French Baccalaureate, the International Baccalaureate, and university-level courses — covering the curricula actually taught in Lebanese schools.",
  },
];

export default function LebanonAiLanding() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <SchemaOrg
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Imtihan — AI Exam Generator Lebanon",
            "url": "https://imtihan.live/ai-exam-generator-lebanon",
            "description": "The leading AI exam generator tailored for teachers and schools in Lebanon. Generate curriculum-aligned exams, Brevet / Bac mock tests, and full corrigés in seconds.",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0.00",
              "priceCurrency": "USD",
              "category": "FreeTrial"
            },
            "educationalAlignment": [
              {
                "@type": "AlignmentObject",
                "alignmentType": "educationalSubject",
                "educationalFramework": "Lebanese Educational System",
                "targetName": "Lebanese School Curriculum",
                "targetUrl": "https://imtihan.live/ai-exam-generator-lebanon"
              }
            ]
          },
          buildFaqSchema(LEBANON_FAQ_ITEMS),
        ]}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-[var(--bg)]/75 backdrop-blur-xl border-b border-[var(--border)]/60 transition-colors">
        <Logo size={26} />
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
            Sign In <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      <main className="flex-grow pt-24">
        {/* Hero */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-6 md:px-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[var(--accent)] opacity-[0.045] blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          
          <div className="relative max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--accent)] font-bold uppercase tracking-widest mx-auto">
              <Sparkles size={12} className="fill-[var(--accent)]" /> No. 1 AI Exam Builder in Lebanon
            </div>

            <h1 className="serif text-display-xl text-[var(--text)] leading-tight tracking-tight max-w-2xl mx-auto">
              The premier <span className="italic text-[var(--accent)]">AI exam generator in Lebanon</span> for educators.
            </h1>

            <p className="text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
              Tailored specifically to the academic realities of Lebanese schools. Generate high-quality test sheets and detailed corrigés aligned to Bac Libanais, Bac Français, and IB Diploma programs.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-[var(--accent)] text-white font-medium hover:opacity-95 shadow-lg shadow-[var(--accent)]/15">
                Generate Your First Exam <ArrowRight size={16} />
              </Link>
              <Link href="/pricing" className="inline-flex items-center justify-center h-12 px-7 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium hover:bg-[var(--surface)] transition-all">
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="px-6 md:px-10 py-20 bg-[var(--bg-subtle)] border-t border-b border-[var(--border)]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="serif text-display-md text-[var(--text)]">Why Lebanese educators choose Imtihan</h2>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest mt-2 font-semibold">Engineered for quality, speed, and syllabus accuracy</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {BENEFITS.map((benefit, i) => (
                <div key={i} className="card p-8 bg-[var(--surface)] space-y-4 hover:-translate-y-0.5 hover:shadow-md transition-all border border-[var(--border)]/45">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
                    <benefit.icon size={20} />
                  </div>
                  <h3 className="font-semibold text-sm text-[var(--text)]">{benefit.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{benefit.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Curricula overview */}
        <section className="max-w-4xl mx-auto px-6 py-20 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="serif text-display-md text-[var(--text)]">Multi-Curricula support in one platform</h2>
            <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
              Lebanon's schools are diverse. Imtihan is built to accommodate every major educational framework taught in Lebanese institutions.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] space-y-3">
              <h3 className="font-serif text-lg font-bold text-[var(--text)]">Lebanese Curriculum</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Brevet (EB9) & Terminale (SG, SV, SE, LH) exams. Perfect alignment with official CRDP syllabi, terminology, and assessment criteria.
              </p>
            </div>
            <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] space-y-3">
              <h3 className="font-serif text-lg font-bold text-[var(--text)]">French Curriculum</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                French Baccalaureate assessments from Seconde to Terminale. Built to support AEFE network grading standards and specialities (Maths, Physique-Chimie, SVT).
              </p>
            </div>
            <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] space-y-3">
              <h3 className="font-serif text-lg font-bold text-[var(--text)]">IB Diploma Program</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                International Baccalaureate (IB) MYP & DP HL/SL assessments. Specific focus on science and humanities question matrices.
              </p>
            </div>
          </div>

          {/* Call to Action banner */}
          <div className="card p-8 border-[var(--accent)]/40 border bg-[var(--accent-light)] flex flex-col md:flex-row items-center justify-between gap-6 shadow-md shadow-[var(--accent)]/5 rounded-3xl mt-12">
            <div className="space-y-2">
              <h3 className="serif text-xl text-[var(--text)] font-semibold">Join 1,000+ Lebanese teachers</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm">
                Get started today and draft custom exams in English, French, or Arabic in seconds.
              </p>
            </div>
            <Link href="/auth/register" className="inline-flex items-center gap-1.5 h-11 px-6 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-95 shadow-sm whitespace-nowrap self-stretch md:self-auto justify-center">
              Get Started Free <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        <LandingFAQ items={LEBANON_FAQ_ITEMS} />
      </main>

      <PublicFooter />
    </div>
  );
}
