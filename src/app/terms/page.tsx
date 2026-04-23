import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Imtihan",
  description: "The terms and conditions for using Imtihan.",
  alternates: { canonical: "/terms" },
};

const SECTIONS = [
  { title: "1. Acceptance of terms", id: "acceptance" },
  { title: "2. Description of service", id: "description" },
  { title: "3. Eligibility", id: "eligibility" },
  { title: "4. Your account", id: "account" },
  { title: "5. Acceptable use", id: "acceptable-use" },
  { title: "6. AI-generated content", id: "ai-content" },
  { title: "7. Intellectual property", id: "ip" },
  { title: "8. Uploaded documents", id: "uploads" },
  { title: "9. Disclaimers", id: "disclaimers" },
  { title: "10. Limitation of liability", id: "liability" },
  { title: "11. Changes to the service", id: "changes" },
  { title: "12. Governing law", id: "governing-law" },
  { title: "13. Contact", id: "contact" },
];

export default function TermsPage() {
  // This is a simplified implementation for active section highlighting.
  // A more robust solution would use IntersectionObserver.
  // For this example, we'll just provide the navigation.
  const activeSectionId = "acceptance"; // Placeholder

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft size={16} aria-label="Back to home page" />
          <span className="text-sm hidden sm:block">Back</span>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white text-xs font-serif">إ</span>
          </div>
          <span className="font-semibold text-sm text-[var(--text)] tracking-tight">Imtihan</span>
        </Link>
        <div className="w-20" />
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 md:px-10 py-16">
        <div className="flex gap-16">
          <aside className="hidden lg:block w-56 sticky top-32 self-start">
            <h3 className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-4">On this page</h3>
            <ul className="space-y-2.5 text-xs">
              {SECTIONS.map(section => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className={`block hover:text-[var(--text)] transition-colors ${activeSectionId === section.id ? 'font-semibold text-[var(--text)]' : 'text-[var(--text-secondary)]'}`}>
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex-1 max-w-2xl">
            <div className="mb-12">
              <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-3">Legal</p>
              <h1 className="serif text-display-lg text-[var(--text)] mb-3">Terms of Service</h1>
              <p className="text-sm text-[var(--text-tertiary)]">Last updated: April 2025</p>
            </div>

            <div className="space-y-10 text-sm leading-relaxed text-[var(--text-secondary)]">

              <Section title="1. Acceptance of terms" id="acceptance">
                <p>
                  By accessing or using Imtihan (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
                </p>
              </Section>

              <Section title="2. Description of service" id="description">
                <p>
                  Imtihan is an AI-powered exam generation tool for educators. It uses large language models to generate exam exercises based on teacher-provided descriptions, and exports them as editable Word or PDF documents.
                </p>
              </Section>

              <Section title="3. Eligibility" id="eligibility">
                <p>
                  You must be at least 18 years old and have the authority to act on behalf of your institution (if applicable) to create an account and use the Service.
                </p>
              </Section>

              <Section title="4. Your account" id="account">
                <ul>
                  <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                  <li>You are responsible for all activity that occurs under your account.</li>
                  <li>Notify us immediately at <a href="mailto:support@imtihan.live" className="text-[var(--accent)] hover:underline">support@imtihan.live</a> if you suspect unauthorized access.</li>
                </ul>
              </Section>

              <Section title="5. Acceptable use" id="acceptable-use">
                <p>You agree not to use Imtihan to:</p>
                <ul>
                  <li>Generate content that is discriminatory, abusive, or violates applicable law.</li>
                  <li>Reproduce or distribute copyrighted curriculum materials without authorization.</li>
                  <li>Attempt to reverse-engineer, scrape, or overload the Service.</li>
                  <li>Resell or sublicense access to the Service without written permission.</li>
                  <li>Submit false, misleading, or malicious content to the AI system.</li>
                </ul>
              </Section>

              <Section title="6. AI-generated content" id="ai-content">
                <p>
                  Imtihan uses AI to generate exam content. By using the Service, you acknowledge that:
                </p>
                <ul>
                  <li>AI-generated content may contain errors. You are responsible for reviewing all exercises before distributing them to students.</li>
                  <li>Imtihan does not guarantee the accuracy, completeness, or pedagogical suitability of generated content.</li>
                  <li>Generated exams are provided as a starting point and should be validated by a qualified educator.</li>
                </ul>
              </Section>

              <Section title="7. Intellectual property" id="ip">
                <p>
                  You retain ownership of the descriptions and documents you provide. The exams generated from your inputs belong to you. Imtihan retains rights to its platform, UI, and underlying systems.
                </p>
                <p>
                  By submitting content, you grant Imtihan a limited, non-exclusive license to process it for the purpose of providing the Service.
                </p>
              </Section>

              <Section title="8. Uploaded documents" id="uploads">
                <p>
                  You may only upload documents that you have the right to use. Do not upload documents containing personal data of students or other individuals, confidential institutional materials, or content you do not have permission to share with third-party AI systems.
                </p>
              </Section>

              <Section title="9. Disclaimers" id="disclaimers">
                <p>
                  The Service is provided &quot;as is&quot; without warranties of any kind. We do not warrant that the Service will be uninterrupted, error-free, or meet your specific educational requirements.
                </p>
              </Section>

              <Section title="10. Limitation of liability" id="liability">
                <p>
                  To the maximum extent permitted by law, Imtihan shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service, including but not to limited to errors in generated exam content.
                </p>
              </Section>

              <Section title="11. Changes to the service" id="changes">
                <p>
                  We reserve the right to modify, suspend, or discontinue any part of the Service at any time. We will provide reasonable notice of material changes where possible.
                </p>
              </Section>

              <Section title="12. Governing law" id="governing-law">
                <p>
                  These Terms are governed by and construed in accordance with applicable law. Any disputes shall be resolved in the competent courts of the jurisdiction in which Imtihan operates.
                </p>
              </Section>

              <Section title="13. Contact" id="contact">
                <p>
                  For questions about these Terms, contact us at:{" "}
                  <a href="mailto:legal@imtihan.live" className="text-[var(--accent)] hover:underline">
                    legal@imtihan.live
                  </a>
                </p>
              </Section>

            </div>

            <div className="mt-16 pt-8 border-t border-[var(--border)] flex flex-wrap gap-6 text-xs text-[var(--text-tertiary)]">
              <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy Policy</Link>
              <Link href="/" className="hover:text-[var(--text)] transition-colors">← Back to Imtihan</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-24">
      <h2 className="font-semibold text-[var(--text)] text-base mb-3">{title}</h2>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}
