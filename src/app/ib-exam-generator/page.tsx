import { GeneratorLandingHero, GeneratorLandingNav } from "@/components/landing/GeneratorLandingHero";
import Link from "next/link";
import { ArrowRight, Check, Award, Compass, Calculator, BookOpen, Layers, Printer } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { SchemaOrg } from "@/components/SchemaOrg";
import { LandingFAQ, buildFaqSchema } from "@/components/landing/LandingFAQ";

export const metadata = {
  title: { absolute: "IB Test Maker – Free AI Exam Generator | Imtihan" },
  description: "Create IB maths, physics and chemistry exams with worked solutions and mark schemes. Try your first exam free, then export to Word or PDF.",
  alternates: { canonical: "/ib-exam-generator" },
  openGraph: {
    type: "website",
    title: "IB Test Maker – Free AI Exam Generator | Imtihan",
    description: "Create IB maths, physics and chemistry exams with worked solutions and mark schemes. Try your first exam free, then export to Word or PDF.",
    url: "https://imtihan.live/ib-exam-generator",
    images: [{ url: "/opengraph-image?v=20261016", width: 1200, height: 630, alt: "Imtihan — AI Exam Generator" }],
  },
};

const IB_FEATURES = [
  {
    icon: Compass,
    title: "Syllabus-Aligned Exercises",
    body: "Choose topics in mathematics, physics or chemistry. Review the selected syllabus and SL/HL level before generating questions."
  },
  {
    icon: Award,
    title: "Clear IB-style command terms",
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
    a: "Imtihan prompts the AI to use IB-style command terms such as Explain, Deduce, Determine and Evaluate. Review the wording and marks before using a generated practice paper with students.",
  },
  {
    q: "Can I generate both SL and HL exams?",
    a: "Yes. You choose Standard Level (SL) or Higher Level (HL) difficulty when describing your exam, and Imtihan adjusts both question depth and the mark scheme accordingly.",
  },
  {
    q: "Does the mark scheme match IB grading conventions?",
    a: "Generated solutions include worked reasoning and mark-by-mark criteria. You can review and edit them; they are practice mark schemes rather than official IB assessment material.",
  },
  {
    q: "Which IB subjects are supported?",
    a: "You can generate mathematics, physics and chemistry assessments from the available chapters. Dated paper-structure references currently cover Mathematics AA SL/HL Papers 1 and 2; other subjects can use a classroom or teacher-defined structure.",
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
            "name": "Imtihan — IB Mathematics, Physics & Chemistry Exam Generator",
            "url": "https://imtihan.live/ib-exam-generator",
            "description": "Create IB maths, physics and chemistry exams with worked solutions and mark schemes. Try your first exam free, then export to Word or PDF.",
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

      <GeneratorLandingNav french={false} />
      <main className="flex-grow pt-16">
        <GeneratorLandingHero {...{
  "french": false,
  "eyebrow": "IB Diploma · Mathematics, Physics & Chemistry",
  "title": "Build your next IB assessment.",
  "accent": "Keep your teaching judgement.",
  "description": "Turn your selected topics into challenging practice questions with worked solutions and mark schemes. Review SL or HL scope, section structure and marks before exporting to Word or PDF.",
  "cta": "Create a free IB exam",
  "preview": {
    "title": "Mathematics AA · Paper 1",
    "level": "DP Standard Level · First-assessment-2021 guide",
    "duration": "90 minutes",
    "marks": "80 marks",
    "instructions": "A practice composition: all questions compulsory, no calculator. Individual question allocations can be edited.",
    "sections": [
      {
        "title": "Section A",
        "detail": "Short-response questions · about 40 marks."
      },
      {
        "title": "Section B",
        "detail": "Extended-response questions · about 40 marks."
      },
      {
        "title": "Separate mark scheme",
        "detail": "Worked solutions and marks for the reasoning shown."
      }
    ]
  }
}} />

        {/* Features */}
        <section className="px-6 md:px-10 py-20 bg-[var(--bg-subtle)] border-t border-b border-[var(--border)]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="serif text-display-md text-[var(--text)]">From syllabus topics to a reviewed assessment</h2>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest mt-2 font-semibold">Questions, worked solutions and marks in one workflow</p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {IB_FEATURES.map((feature, i) => (
                <div key={i} className="card p-6 sm:p-8 bg-[var(--surface)] space-y-4 hover:-translate-y-0.5 hover:shadow-md transition-all border border-[var(--border)]/45">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
                    <feature.icon size={20} />
                  </div>
                  <h3 className="font-semibold text-sm text-[var(--text)]">{feature.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subject coverage */}
        <section className="max-w-4xl mx-auto px-6 py-20 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="serif text-display-md text-[var(--text)]">Maths, physics and chemistry in one workspace</h2>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
              Choose the syllabus and level you teach. Paper-structure references show their assessment year and scope.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="border border-[var(--border)] rounded-2xl p-7 bg-[var(--surface)] space-y-4">
              <h3 className="font-serif text-xl font-bold text-[var(--accent)]">IB Mathematics AA SL / HL</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Functions, calculus, geometry, probability and proof. Review sections A and B, calculator rules and marks using the dated Paper 1 or Paper 2 reference.</p>
              <p className="text-xs text-[var(--accent)]">Short responses & extended reasoning</p>
            </div>
            <div className="border border-[var(--border)] rounded-2xl p-7 bg-[var(--surface)] space-y-4">
              <h3 className="font-serif text-xl font-bold text-[var(--accent)]">IB Chemistry DP SL / HL</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
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
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
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
                Create your first IB practice assessment, then review its questions and mark scheme.
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
