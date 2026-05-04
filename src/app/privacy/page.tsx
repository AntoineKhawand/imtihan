import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicFooter } from "@/components/layout/PublicFooter";

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
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white text-xs font-serif">إ</span>
          </div>
          <span className="font-semibold text-sm text-[var(--text)] tracking-tight">Imtihan</span>
        </Link>
        <div className="w-20" />
      </header>

      <main className="flex-1 px-6 md:px-10 py-16">
        <div className="max-w-2xl mx-auto">

          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-3">Legal</p>
            <h1 className="serif text-display-lg text-[var(--text)] mb-3">Privacy Policy</h1>
            <p className="text-sm text-[var(--text-tertiary)]">Last updated: April 2025</p>
          </div>

          <div className="prose-imtihan space-y-10 text-sm leading-relaxed text-[var(--text-secondary)]">

            <Section title="1. Who we are">
              <p>
                Imtihan is an AI-powered exam generation service for teachers in Lebanon and internationally. We are operated by an independent developer based in Beirut, Lebanon. We are committed to protecting your personal data and being transparent about how we use it.
              </p>
              <p>
                <strong className="text-[var(--text)]">No student data.</strong> Imtihan is a tool for teachers only. We do not collect, process, or store any data about students. Student exam papers are generated as documents and delivered to the teacher — we never see the student results.
              </p>
            </Section>

            <Section title="2. What data we collect">
              <ul>
                <li><strong className="text-[var(--text)]">Account data</strong> — your name, email address, and authentication credentials when you register. Passwords are never stored in plain text (Firebase handles authentication with bcrypt hashing).</li>
                <li><strong className="text-[var(--text)]">Exam data</strong> — the exam descriptions and parameters you enter (subject, level, duration, etc.), and the exercises generated for your library.</li>
                <li><strong className="text-[var(--text)]">Uploaded documents</strong> — course notes or past exams you upload to ground AI generation. These are processed in memory and <strong className="text-[var(--text)]">never stored on our servers</strong> after the request completes.</li>
                <li><strong className="text-[var(--text)]">Usage data</strong> — anonymised analytics (pages visited, feature usage, error logs) for debugging and product improvement.</li>
                <li><strong className="text-[var(--text)]">Device data</strong> — browser type, OS, and IP address for security logging.</li>
              </ul>
            </Section>

            <Section title="3. How we use your data">
              <ul>
                <li>To generate, save, and export your exams.</li>
                <li>To send transactional emails (password reset, subscription renewal reminders).</li>
                <li>To detect and prevent abuse, fraud, or API quota violations.</li>
                <li>To improve the product based on aggregated, anonymised usage patterns.</li>
              </ul>
              <p><strong className="text-[var(--text)]">We never sell your data.</strong> We do not share your personal data with advertisers, data brokers, or any third party for commercial purposes.</p>
            </Section>

            <Section title="4. Where data is stored">
              <p>All data is stored on servers in the <strong className="text-[var(--text)]">European Union and United States</strong> via the following infrastructure providers:</p>
              <ul>
                <li><strong className="text-[var(--text)]">Firebase / Google Cloud</strong> (EU/US) — user accounts, exam library, subscription data. Google Cloud is GDPR-compliant and ISO 27001 certified.</li>
                <li><strong className="text-[var(--text)]">Vercel</strong> (US/Edge) — application hosting and serverless functions. Vercel is SOC 2 Type II certified.</li>
                <li><strong className="text-[var(--text)]">AI providers</strong> (US) — your exam description and any uploaded document are sent to our AI provider during generation only. They are not retained by the AI provider after the response is returned. Refer to their respective privacy policies for details.</li>
              </ul>
              <p>No data is stored locally in Lebanon in a way that would be subject to Lebanese data access requests beyond what Lebanese law already permits for any internet service.</p>
            </Section>

            <Section title="5. School & institutional data">
              <p>
                For schools using Imtihan as an institution, we process only the teacher account data described above. We do not require, collect, or process any student personal data (names, grades, ID numbers). The exams generated are Word/PDF documents delivered to the teacher — no student data passes through our systems at any point.
              </p>
              <p>
                Schools can request a Data Processing Agreement (DPA) by emailing <strong className="text-[var(--text)]">admin@imtihan.live</strong>. We will co-sign a DPA that clarifies our role as a data processor under GDPR Article 28.
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
                We use only <strong className="text-[var(--text)]">essential session cookies</strong> to keep you signed in. We do not use advertising cookies, tracking pixels, or third-party analytics cookies. The only cookie we set is <code>__session</code> (a secure, HttpOnly, SameSite=Lax Firebase session token).
              </p>
            </Section>

            <Section title="9. Security">
              <p>
                All data is transmitted over HTTPS/TLS. Passwords are managed by Firebase Authentication (bcrypt). Our database uses Firebase Security Rules to ensure users can only access their own data. We conduct periodic security audits using GitHub&apos;s CodeQL static analysis.
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
