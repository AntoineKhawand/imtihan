import { GeneratorLandingHero, GeneratorLandingNav } from "@/components/landing/GeneratorLandingHero";
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
    type: "website",
    title: "AI Exam Generator Lebanon — Imtihan",
    description: "Create customized exams in English or French, aligned to Lebanese, French, and IB standards. Perfect for Lebanese schools and tutors.",
    url: "https://imtihan.live/ai-exam-generator-lebanon",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Imtihan — AI Exam Generator" }],
  },
};

const BENEFITS = [
  {
    icon: Sparkles,
    title: "Designed for Lebanon's Education System",
    body: "Unlike generic AI models, Imtihan understands the bilingual, multi-curriculum demands of schools in Lebanon. Whether you teach Math, Physics, or Chemistry in French or English, it adapts to your syllabus."
  },
  {
    icon: Clock,
    title: "Spend less time preparing",
    body: "Draft questions and worked solutions together, then spend your preparation time reviewing and refining them for your class."
  },
  {
    icon: Copy,
    title: "Version A & B Cheating Prevention",
    body: "Pro teachers can generate a second version with different values and scenarios while preserving the question structure and marks. Review both versions before use."
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
    a: "Imtihan understands Lebanon's bilingual, multi-curriculum reality natively — Bac Libanais, Bac Français, and IB — and generates exams in French or English depending on what you teach, not a generic translation of one template.",
  },
  {
    q: "How much time does it actually save teachers?",
    a: "Imtihan drafts questions and their worked solutions together, reducing repetitive preparation. Generation time depends on the length of the exam; leave time to review the result.",
  },
  {
    q: "What is Version A/B and how does it prevent cheating?",
    a: "Version B is a Pro feature that generates fresh values and scenarios while preserving the assessment structure and marks. It gives neighbouring students different papers; teachers should review both versions.",
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

      <GeneratorLandingNav french={false} />
      <main className="flex-grow pt-16">
        <GeneratorLandingHero {...{
  "french": false,
  "eyebrow": "Built for teachers in Lebanon",
  "title": "Less exam preparation.",
  "accent": "More time with your students.",
  "description": "Create classroom assessments across Lebanese, French and IB curricula. Describe your needs in French, English or Arabic, optionally add teaching material, then review every question and its answer key.",
  "cta": "Create my free exam",
  "preview": {
    "title": "Your next classroom assessment",
    "level": "Your curriculum · Your chapters",
    "duration": "Choose the duration",
    "marks": "Set your own marks",
    "instructions": "A flexible classroom exam, or a reviewed paper structure. You decide what the AI should take from an uploaded document.",
    "sections": [
      {
        "title": "Questions that require reasoning",
        "detail": "Hard by default, with easier or mixed difficulty available."
      },
      {
        "title": "Your teaching material",
        "detail": "Use it for course content, exercise inspiration or paper structure."
      },
      {
        "title": "Ready for your classroom",
        "detail": "Edit questions and export with or without the answer key."
      }
    ]
  }
}} />

        {/* Benefits */}
        <section className="px-6 md:px-10 py-20 bg-[var(--bg-subtle)] border-t border-b border-[var(--border)]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="serif text-display-md text-[var(--text)]">Why Lebanese educators choose Imtihan</h2>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest mt-2 font-semibold">Engineered for quality, speed, and syllabus accuracy</p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {BENEFITS.map((benefit, i) => (
                <div key={i} className="card p-6 sm:p-8 bg-[var(--surface)] space-y-4 hover:-translate-y-0.5 hover:shadow-md transition-all border border-[var(--border)]/45">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
                    <benefit.icon size={20} />
                  </div>
                  <h3 className="font-semibold text-sm text-[var(--text)]">{benefit.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{benefit.body}</p>
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
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Brevet (EB9) & Terminale (SG, SV, SE, LH) exams. Perfect alignment with official CRDP syllabi, terminology, and assessment criteria.
              </p>
            </div>
            <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] space-y-3">
              <h3 className="font-serif text-lg font-bold text-[var(--text)]">French Curriculum</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                French Baccalaureate assessments from Seconde to Terminale. Built to support AEFE network grading standards and specialities (Maths, Physique-Chimie, SVT).
              </p>
            </div>
            <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] space-y-3">
              <h3 className="font-serif text-lg font-bold text-[var(--text)]">IB Diploma Program</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                International Baccalaureate (IB) MYP & DP HL/SL assessments. Specific focus on science and humanities question matrices.
              </p>
            </div>
          </div>

          {/* Call to Action banner */}
          <div className="card p-8 border-[var(--accent)]/40 border bg-[var(--accent-light)] flex flex-col md:flex-row items-center justify-between gap-6 shadow-md shadow-[var(--accent)]/5 rounded-3xl mt-12">
            <div className="space-y-2">
              <h3 className="serif text-xl text-[var(--text)] font-semibold">Built for Lebanese teachers</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm">
                Get started today and draft custom exams in English or French in seconds.
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
