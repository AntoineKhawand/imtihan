import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, BookOpen, AlertCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export const metadata = {
  title: "Contact — Imtihan",
  description: "Get in touch with the Imtihan team.",
  alternates: { canonical: "/contact" },
};

const TOPICS = [
  {
    icon: MessageSquare,
    title: "General question",
    description: "Questions about features, how it works, or anything else.",
    email: "hello@imtihan.live",
    label: "hello@imtihan.live",
  },
  {
    icon: Mail,
    title: "Technical support",
    description: "Having issues? We're here to help.",
    email: "support@imtihan.live",
    label: "support@imtihan.live",
  },
  {
    icon: BookOpen,
    title: "School & institution",
    description: "For schools, universities, or bulk licensing.",
    email: "schools@imtihan.live",
    label: "schools@imtihan.live",
  },
  {
    icon: AlertCircle,
    title: "Legal & Privacy",
    description: "For legal inquiries or data requests.",
    email: "legal@imtihan.live",
    label: "legal@imtihan.live",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft size={16} />
          <span className="text-sm hidden sm:block">Back</span>
        </Link>
        <Logo size={28} />
        <div className="w-20" />
      </header>

      <main className="flex-1 px-6 md:px-10 py-16">
        <div className="max-w-2xl mx-auto">

          {/* Heading */}
          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-3">Contact</p>
            <h1 className="serif text-display-lg text-[var(--text)] mb-3">Get in touch</h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-md">
              We typically reply within one business day. Choose the right address below and we&apos;ll route your message to the right person.
            </p>
          </div>

          {/* Topic cards */}
          <div className="space-y-3 mb-12">
            {TOPICS.map((topic) => (
              <a
                key={topic.email}
                href={`mailto:${topic.email}`}
                className="group card p-5 flex items-start gap-4 hover:border-[var(--accent)] hover:shadow-md hover:shadow-black/[0.04] transition-all block"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                  <topic.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--text)] mb-0.5">{topic.title}</p>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-2">
                    {topic.description}
                  </p>
                  <span className="text-xs font-medium text-[var(--accent)] group-hover:underline">
                    {topic.label}
                  </span>
                </div>
                <ArrowLeft size={14} className="text-[var(--text-tertiary)] rotate-180 flex-shrink-0 mt-1 group-hover:text-[var(--accent)] transition-colors" />
              </a>
            ))}
          </div>

          {/* Contact form */}
          <div className="card p-6">
            <h2 className="font-semibold text-[var(--text)] mb-1">Send us a message</h2>
            <p className="text-xs text-[var(--text-secondary)] mb-5">
              Prefer a form? Fill this out and we&apos;ll get back to you.
            </p>
            <ContactForm />
          </div>

          {/* Footer links */}
          <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-wrap gap-6 text-xs text-[var(--text-tertiary)]">
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[var(--text)] transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-[var(--text)] transition-colors">← Back to Imtihan</Link>
          </div>

        </div>
      </main>
    </div>
  );
}

/* ── Contact Form (client island) ─────────────────────────────────────────── */

import ContactForm from "./ContactForm";
