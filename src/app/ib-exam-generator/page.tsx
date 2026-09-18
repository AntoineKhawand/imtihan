import Link from "next/link";
import { ArrowRight, Check, Award, Compass, Calculator, BookOpen, Layers, Printer } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { SchemaOrg } from "@/components/SchemaOrg";
import { LandingFAQ, buildFaqSchema } from "@/components/landing/LandingFAQ";

export const metadata = {
  title: "IB Exam Generator: Chemistry & Physics | Imtihan",
  description: "Create IB Diploma Programme (DP) and MYP Chemistry & Physics exams in seconds. Automatically generate detailed mark schemes matching IB Command Terms and rubrics.",
  alternates: { canonical: "/ib-exam-generator" },
  openGraph: {
    title: "IB Exam Generator Chemistry & Physics — Imtihan",
    description: "The professional assessment tool for IB science teachers. Draft curriculum-aligned worksheets and full mark schemes instantly.",
    url: "https://imtihan.live/ib-exam-generator",
  },
};

const IB_FEATURES = [
  {
    icon: Compass,
    title: "Syllabus-Aligned Exercises",
    body: "Fully covers DP Chemistry (Stoichiometry, organic, bonding, energetics) and DP Physics (Mechanics, waves, electricity, atomic). Tailored to match SL and HL difficulty levels."
  },
  {
    icon: Award,
    title: "IB Command Terms Compliance",
    body: "Questions are formulated using official IB command terms like 'Explain', 'Deduce', 'Determine', 'Evaluate', and 'State' to ensure your students are prepared for official grading standards."
  },
  {
    icon: Calculator,
    title: "Auto-Generated Mark Schemes",
    body: "Get comprehensive step-by-step marking rubrics containing exact calculations, formula substitutions, state symbols, and alternative methods. Saves hours of grading preparation."
  },
  {
    icon: Printer,
    title: "Ready to print (Word/PDF)",
    body: "Export all created exams and mark schemes as editable .docx files or clean PDFs. All mathematical equations are rendered in professional, print-ready LaTeX formatting."
  }
];

const IB_FAQ_ITEMS = [
  {
    q: "Does Imtihan follow official IB command terms?",
    a: "Yes. Every generated question uses official IB command terms — Explain, Deduce, Determine, Evaluate, State — matched to the correct mark allocation, so questions read exactly like an official DP paper.",
  },
  {
    q: "Can I generate both SL and HL exams?",
    a: "Yes. You choose Standard Level (SL) or Higher Level (HL) difficulty when describing your exam, and Imtihan adjusts both question depth and the mark scheme accordingly.",
  },
  {
    q: "Does the mark scheme match IB grading conventions?",
    a: "Yes. Each mark scheme includes exact calculations, formula substitutions, state symbols, alternative accepted methods, and mark-by-mark breakdowns — the same structure IB examiners use.",
  },
  {
    q: "Which IB subjects are supported?",
    a: "IB DP and MYP Chemistry and Physics are fully supported today, covering the complete SL/HL syllabus for both subjects. Additional IB subjects are on the roadmap.",
  },
  {
    q: "Can I export IB exams to Word or PDF?",
    a: "Yes. Every exam and its mark scheme export as an editable .docx file or a print-ready PDF, with all mathematical notation rendered in proper LaTeX formatting.",
  },
];

export default function IbLandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <SchemaOrg
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Imtihan — IB Chemistry & Physics Exam Generator",
            "url": "https://imtihan.live/ib-exam-generator",
            "description": "Create IB Diploma Programme (DP) and MYP Chemistry & Physics exams in seconds. Automatically generate detailed mark schemes matching IB Command Terms and rubrics.",
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
                "educationalFramework": "International Baccalaureate (IB DP / MYP)",
                "targetName": "IB DP Chemistry (SL/HL)",
                "targetUrl": "https://imtihan.live/ib-exam-generator"
              },
              {
                "@type": "AlignmentObject",
                "alignmentType": "educationalSubject",
                "educationalFramework": "International Baccalaureate (IB DP / MYP)",
                "targetName": "IB DP Physics (SL/HL)",
                "targetUrl": "https://imtihan.live/ib-exam-generator"
              }
            ]
          },
          buildFaqSchema(IB_FAQ_ITEMS),
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
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[var(--accent)] opacity-[0.04] blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          
          <div className="relative max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--accent)] font-bold uppercase tracking-widest mx-auto">
              <BookOpen size={12} className="fill-[var(--accent)]" /> Designed for IB DP & MYP Science Teachers
            </div>

            <h1 className="serif text-display-xl text-[var(--text)] leading-tight tracking-tight max-w-2xl mx-auto">
              The professional <span className="italic text-[var(--accent)]">IB exam generator</span> for chemistry & physics.
            </h1>

            <p className="text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
              No more spending hours formatting complex worksheets. Simply describe the topics, choose SL or HL difficulty, and generate tailored assessments with full mark schemes.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-[var(--accent)] text-white font-medium hover:opacity-95 shadow-lg shadow-[var(--accent)]/15">
                Start Generating Now <ArrowRight size={16} />
              </Link>
              <Link href="/pricing" className="inline-flex items-center justify-center h-12 px-7 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium hover:bg-[var(--surface)] transition-all">
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 md:px-10 py-20 bg-[var(--bg-subtle)] border-t border-b border-[var(--border)]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="serif text-display-md text-[var(--text)]">Streamlined assessment building for IB Science</h2>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest mt-2 font-semibold">Aligning technology with the International Baccalaureate standards</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {IB_FEATURES.map((feature, i) => (
                <div key={i} className="card p-8 bg-[var(--surface)] space-y-4 hover:-translate-y-0.5 hover:shadow-md transition-all border border-[var(--border)]/45">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
                    <feature.icon size={20} />
                  </div>
                  <h3 className="font-semibold text-sm text-[var(--text)]">{feature.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{feature.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subject coverage */}
        <section className="max-w-4xl mx-auto px-6 py-20 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="serif text-display-md text-[var(--text)]">Built specifically for IB Chemistry & Physics</h2>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
              Generate questions aligned with the latest syllabus updates and assessment criteria.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border border-[var(--border)] rounded-2xl p-7 bg-[var(--surface)] space-y-4">
              <h3 className="font-serif text-xl font-bold text-[var(--accent)]">IB Chemistry DP SL / HL</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Generate paper-style questions for Stoichiometric Relationships, Atomic Structure, Periodicity, Chemical Bonding, Energetics/Thermodynamics, Chemical Kinetics, Equilibrium, Acids & Bases, Redox Processes, Organic Chemistry, and Measurement & Data Processing.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Stoichiometry", "Organic Chem", "Energetics", "Acids & Bases", "Redox"].map((t) => (
                  <span key={t} className="inline-block px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[10px] text-[var(--text-secondary)] border border-[var(--border)]">{t}</span>
                ))}
              </div>
            </div>
            <div className="border border-[var(--border)] rounded-2xl p-7 bg-[var(--surface)] space-y-4">
              <h3 className="font-serif text-xl font-bold text-[var(--accent)]">IB Physics DP SL / HL</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Generate mathematical and conceptual problems in Measurements and Uncertainties, Mechanics, Thermal Physics, Waves, Electricity and Magnetism, Circular Motion and Gravitation, Atomic, Nuclear and Particle Physics, Energy Production, Wave Phenomena, Fields, Electromagnetic Induction, and Quantum Physics.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Mechanics", "Waves", "Electricity", "Nuclear Physics", "Fields"].map((t) => (
                  <span key={t} className="inline-block px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[10px] text-[var(--text-secondary)] border border-[var(--border)]">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* CTA banner */}
          <div className="card p-8 border-[var(--accent)]/40 border bg-[var(--accent-light)] flex flex-col md:flex-row items-center justify-between gap-6 shadow-md shadow-[var(--accent)]/5 rounded-3xl mt-12">
            <div className="space-y-2">
              <h3 className="serif text-xl text-[var(--text)] font-semibold">Join IB Teachers worldwide</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm">
                Get started today and draft custom IB Chemistry and Physics exams in seconds.
              </p>
            </div>
            <Link href="/auth/register" className="inline-flex items-center gap-1.5 h-11 px-6 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-95 shadow-sm whitespace-nowrap self-stretch md:self-auto justify-center">
              Generate for Free <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        <LandingFAQ items={IB_FAQ_ITEMS} />
      </main>

      <PublicFooter />
    </div>
  );
}
