import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Logo } from "@/components/ui/Logo";

export const metadata = {
  title: "Privacy Policy — Imtihan",
  description: "How Imtihan collects, uses, and protects your data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft size={16} />
          <span className="text-sm hidden sm:block">Back</span>
        </Link>
        <Logo size={26} />
        <div className="w-20" />
      </header>

      <main className="flex-1 px-6 md:px-10 py-16">
        <div className="max-w-2xl mx-auto">

          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-3">Legal</p>
            <h1 className="serif text-display-lg text-[var(--text)] mb-3">Privacy Policy</h1>
            <p className="text-sm text-[var(--text-tertiary)]">Last updated: October 12, 2026</p>
          </div>

          <div className="prose-imtihan space-y-10 text-sm leading-relaxed text-[var(--text-secondary)]">

            <Section title="1. Who we are">
              <p>
                Imtihan is an AI-powered exam generation service for teachers in Lebanon and internationally. We are operated by an independent developer based in Beirut, Lebanon. We are committed to protecting your personal data and being transparent about how we use it.
              </p>
              <p>
                <strong className="text-[var(--text)]">Adult accounts.</strong> Account creation requires confirmation that you are at least 18. No date of birth is requested. Teacher generation does not require student identities. If you use the student practice portal, we process its account profile and saved practice attempts.
              </p>
            </Section>

            <Section title="2. What data we collect">
              <ul>
                <li><strong className="text-[var(--text)]">Account data</strong> — your name, email address and profile information. Firebase Authentication manages passwords and sign-in credentials.</li>
                <li><strong className="text-[var(--text)]">Exam data</strong> — the exam descriptions and parameters you enter (subject, level, duration, etc.), and the exercises generated for your library.</li>
                <li><strong className="text-[var(--text)]">Uploaded documents</strong> — course notes or past exams you upload to ground AI generation. These are processed in memory and <strong className="text-[var(--text)]">never stored on our servers</strong> after the request completes.</li>
                <li><strong className="text-[var(--text)]">Usage data</strong> — optional analytics about pages and feature usage when you accept analytics; operational error logs help us maintain the service.</li>
                <li><strong className="text-[var(--text)]">Device data</strong> — browser and network information for security; account creation may use a device fingerprint to prevent repeated free-trial abuse.</li>
              </ul>
            </Section>

            <Section title="3. How we use your data">
              <ul>
                <li>To generate, save, and export your exams.</li>
                <li>To send transactional emails (password reset, subscription renewal reminders).</li>
                <li>To send promotional messages, subject to your email preferences. Promotional emails include an unsubscribe link; preferences apply across our promotional email senders.</li>
                <li>To detect and prevent abuse, fraud, or API quota violations.</li>
                <li>To improve the product based on aggregated, anonymised usage patterns.</li>
              </ul>
              <p><strong className="text-[var(--text)]">We never sell your data.</strong> We do not share your personal data with advertisers, data brokers, or any third party for commercial purposes.</p>
            </Section>

            <Section title="4. Where data is stored">
              <p>We use infrastructure providers that may process data outside Lebanon. Storage and retention depend on the service and configuration:</p>
              <ul>
                <li><strong className="text-[var(--text)]">Firebase / Google Cloud</strong> — authentication, account profiles, exam library and practice data.</li>
                <li><strong className="text-[var(--text)]">Vercel</strong> — hosting and serverless functions.</li>
                <li><strong className="text-[var(--text)]">Anthropic and Google AI</strong> — descriptions and selected source documents during analysis and generation. Provider retention is governed by their service terms and our account configuration; we do not promise immediate provider deletion.</li>
                <li><strong className="text-[var(--text)]">Brevo</strong> — email delivery. Google Analytics, Plausible and Vercel Analytics process optional analytics after acceptance.</li>
              </ul>
            </Section>

            <Section title="5. School & institutional data">
              <p>
                Do not upload identifiable student records or confidential school materials to the generator. The separate adult student practice portal stores profiles and attempts needed for practice features; teacher access is governed by account and school permissions.
              </p>
              <p>
                Schools can discuss data processing requirements by emailing <strong className="text-[var(--text)]">admin@imtihan.live</strong> before submitting institutional data.
              </p>
            </Section>

            <Section title="6. Data retention">
              <ul>
                <li><strong className="text-[var(--text)]">Account data</strong> — retained while your account is active, deleted within 30 days of a deletion request.</li>
                <li><strong className="text-[var(--text)]">Exam library</strong> — retained until you delete individual exams or your account.</li>
                <li><strong className="text-[var(--text)]">Uploaded documents</strong> — not retained; purged from memory immediately after generation completes.</li>
                <li><strong className="text-[var(--text)]">Usage logs</strong> — retained for 90 days for security and debugging, then automatically deleted.</li>
              </ul>
            </Section>

            <Section title="7. Your rights (GDPR & equivalent)">
              <p>As a user, you have the right to:</p>
              <ul>
                <li><strong className="text-[var(--text)]">Access</strong> — request a copy of all personal data we hold about you.</li>
                <li><strong className="text-[var(--text)]">Correction</strong> — correct inaccurate data in your profile.</li>
                <li><strong className="text-[var(--text)]">Erasure</strong> — request deletion of your account and all associated data ("right to be forgotten").</li>
                <li><strong className="text-[var(--text)]">Portability</strong> — receive your exam data in a machine-readable format (JSON/docx).</li>
                <li><strong className="text-[var(--text)]">Restriction</strong> — restrict processing while a dispute is resolved.</li>
                <li><strong className="text-[var(--text)]">Objection</strong> — object to processing based on legitimate interests.</li>
              </ul>
              <p>To exercise any right, email <strong className="text-[var(--text)]">admin@imtihan.live</strong> with subject line "Data Request". We will respond within 30 days.</p>
            </Section>

            <Section title="8. Cookies">
              <p>
                Essential session cookies keep you signed in; a temporary redirect cookie preserves your destination. We store your analytics choice locally in your browser. Optional analytics scripts, including Google Analytics cookies, load only after acceptance. You can reject them or withdraw acceptance using “Privacy choices”. We do not integrate session replay or keystroke recording. Our fonts are served by Imtihan rather than loaded from Google Fonts servers in your browser.
              </p>
            </Section>

            <Section title="9. Security">
              <p>
                Data is transmitted over HTTPS/TLS. Firebase Authentication manages passwords. Firebase Security Rules and server authorization checks control data access. GitHub CodeQL scans help identify code security issues.
              </p>
              <p>If you discover a security vulnerability, please disclose it responsibly to <strong className="text-[var(--text)]">admin@imtihan.live</strong> before public disclosure. We will acknowledge within 48 hours.</p>
            </Section>

            <Section title="10. Changes to this policy">
              <p>
                We will notify registered users by email of any material changes at least 14 days before they take effect. Minor clarifications may be made without notice. The date at the top of this page always reflects the last update.
              </p>
            </Section>

            <Section title="11. Contact">
              <p>
                Questions or requests regarding your privacy can be sent to:{" "}
                <a href="mailto:admin@imtihan.live" className="text-[var(--accent)] hover:underline">
                  admin@imtihan.live
                </a>
              </p>
            </Section>

          </div>

        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold text-[var(--text)] text-base mb-3">{title}</h2>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}
