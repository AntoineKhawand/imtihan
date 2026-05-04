import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, BookOpen, AlertCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const metadata = {
  title: "Contact — Imtihan Support Lebanon",
  description: "Contactez l'équipe Imtihan au Liban via WhatsApp, email ou formulaire. Réponse sous 24h en Français, Anglais ou Arabe.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contacter Imtihan — WhatsApp & Email",
    description: "Joignez l'équipe Imtihan sur WhatsApp pour une réponse rapide, ou par email pour les demandes formelles.",
    url: "https://www.imtihan.live/contact",
  },
};

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "96170542238";

const TOPICS = [
  {
    icon: MessageSquare,
    title: "General question",
    description: "Questions about features, how it works, or anything else.",
    email: "admin@imtihan.live",
    label: "admin@imtihan.live",
  },
  {
    icon: Mail,
    title: "Technical support",
    description: "Having issues? We're here to help.",
    email: "admin@imtihan.live",
    label: "admin@imtihan.live",
  },
  {
    icon: BookOpen,
    title: "School & institution",
    description: "Bulk licenses, Data Processing Agreement, or custom pricing.",
    email: "admin@imtihan.live",
    label: "admin@imtihan.live",
  },
  {
    icon: AlertCircle,
    title: "Legal & Privacy",
    description: "Data requests, GDPR rights, or security disclosures.",
    email: "admin@imtihan.live",
    label: "admin@imtihan.live",
  },
];

export default function ContactPage() {
  const waGeneral = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello! I have a question about Imtihan.")}`;
  const waSchool  = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello! I'd like to discuss Imtihan for our school / institution.")}`;

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
        <div className="max-w-2xl mx-auto space-y-10">

          {/* Heading */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-3">Contact</p>
            <h1 className="serif text-display-lg text-[var(--text)] mb-3">Get in touch</h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-md">
              In Lebanon, the fastest conversation starts on WhatsApp. Email works too — we reply within one business day in French, English, or Arabic.
            </p>
          </div>

          {/* ── WhatsApp — primary warm entry ── */}
          <div className="rounded-2xl border-2 border-[#25D366]/30 bg-[#25D366]/5 p-6 space-y-4">
            <div className="flex items-center gap-3">
              {/* WhatsApp icon */}
              <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[var(--text)]">WhatsApp — fastest response</p>
                <p className="text-xs text-[var(--text-secondary)]">Usually within a few hours · Français, English, العربية</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <a
                href={waGeneral}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-11 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#22c55e] transition-colors shadow-sm"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat with us
              </a>
              <a
                href={waSchool}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-[#25D366]/40 text-[#16a34a] text-sm font-semibold hover:bg-[#25D366]/10 transition-colors"
              >
                <BookOpen size={15} />
                School inquiry
              </a>
            </div>
          </div>

          {/* ── Email topics ── */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-4">Or reach us by email</p>
            <div className="space-y-3">
              {TOPICS.map((topic) => (
                <a
                  key={topic.title}
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
          </div>

          {/* Contact form */}
          <div className="card p-6">
            <h2 className="font-semibold text-[var(--text)] mb-1">Send a message</h2>
            <p className="text-xs text-[var(--text-secondary)] mb-5">
              Prefer a form? Fill this out and we&apos;ll get back to you by email.
            </p>
            <ContactForm />
          </div>

          {/* Footer links */}
          <div className="pt-4 border-t border-[var(--border)] flex flex-wrap gap-6 text-xs text-[var(--text-tertiary)]">
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[var(--text)] transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-[var(--text)] transition-colors">← Back to Imtihan</Link>
          </div>

        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

/* ── Contact Form (client island) ─────────────────────────────────────────── */
import ContactForm from "./ContactForm";
