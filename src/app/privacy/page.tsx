import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Imtihan",
  description: "How Imtihan collects, uses, and protects your data.",
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
                Imtihan (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is an AI-powered exam generation tool designed for teachers. We are committed to protecting your personal data and being transparent about how we use it.
              </p>
            </Section>

            <Section title="2. What data we collect">
              <ul>
                <li><strong className="text-[var(--text)]">Account data</strong> — name, email address, and hashed password when you register.</li>
                <li><strong className="text-[var(--text)]">Exam data</strong> — descriptions, uploaded documents, generated exercises, and export history that you create within the app.</li>
                <li><strong className="text-[var(--text)]">Usage data</strong> — pages visited, features used, error logs, and session timestamps for analytics and debugging.</li>
                <li><strong className="text-[var(--text)]">Device data</strong> — browser type, operating system, and IP address.</li>
              </ul>
            </Section>

            <Section title="3. How we use your data">
              <ul>
                <li>To provide, operate, and improve the Imtihan service.</li>
                <li>To process your exam generation requests via the Google Gemini API.</li>
                <li>To save your exam history to your personal library.</li>
                <li>To send transactional emails (password reset, export delivery) if you request them.</li>
                <li>To detect and prevent abuse or fraudulent activity.</li>
              </ul>
              <p>We do not sell your personal data to any third party.</p>
            </Section>

            <Section title="4. Third-party services">
              <p>We use the following third-party providers to operate Imtihan:</p>
              <ul>
                <li><strong className="text-[var(--text)]">Google Gemini API</strong> — exam generation. Your description and uploaded documents are sent to Google&apos;s servers to produce the exam. Refer to Google&apos;s privacy policy for their data handling practices.</li>
                <li><strong className="text-[var(--text)]">Firebase (Google)</strong> — authentication and database storage.</li>
                <li><strong className="text-[var(--text)]">Vercel</strong> — hosting and edge functions.</li>
              </ul>
            </Section>

            <Section title="5. Uploaded documents">
              <p>
                When you upload a document (PDF, image, etc.) to assist exam generation, it is sent to the Google Gemini API within your request and is not stored on our servers beyond the duration of that request. We do not retain uploaded document content after the API call completes.
              </p>
            </Section>

            <Section title="6. Data retention">
              <p>
                Account data is retained as long as your account is active. You may delete your account at any time by contacting us, after which your data will be permanently removed within 30 days. Exam history stored in your library remains associated with your account and is deleted along with it.
              </p>
            </Section>

            <Section title="7. Your rights">
              <p>Depending on your location, you may have the right to:</p>
              <ul>
                <li>Access the personal data we hold about you.</li>
                <li>Correct inaccurate data.</li>
                <li>Request deletion of your data.</li>
                <li>Object to or restrict certain processing.</li>
                <li>Data portability.</li>
              </ul>
              <p>To exercise any of these rights, contact us at the email below.</p>
            </Section>

            <Section title="8. Cookies">
              <p>
                We use essential session cookies to keep you logged in. We do not use third-party advertising or tracking cookies.
              </p>
            </Section>

            <Section title="9. Security">
              <p>
                We use industry-standard measures including HTTPS encryption, hashed passwords, and access-controlled databases. No system is completely secure, and we cannot guarantee absolute security.
              </p>
            </Section>

            <Section title="10. Changes to this policy">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page with an updated date. Continued use of Imtihan after changes constitutes acceptance of the revised policy.
              </p>
            </Section>

            <Section title="11. Contact">
              <p>
                Questions or requests regarding your privacy can be sent to:{" "}
                <a href="mailto:privacy@imtihan.app" className="text-[var(--accent)] hover:underline">
                  privacy@imtihan.app
                </a>
              </p>
            </Section>

          </div>

          <div className="mt-16 pt-8 border-t border-[var(--border)] flex flex-wrap gap-6 text-xs text-[var(--text-tertiary)]">
            <Link href="/terms" className="hover:text-[var(--text)] transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-[var(--text)] transition-colors">← Back to Imtihan</Link>
          </div>
        </div>
      </main>
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
