import type { Metadata } from "next";
import { SchemaOrg } from "@/components/SchemaOrg";
import { LandingFAQ, buildFaqSchema } from "@/components/landing/LandingFAQ";

export const metadata: Metadata = {
  title: "Pricing — Imtihan Pro",
  description: "Imtihan Pro à partir de $5.99/mois. 100 examens par mois, toutes les matières, corrigé inclus. Paiement via WhatsApp. Commencez gratuitement avec 1 examen.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Tarifs Imtihan — Générateur d'examens IA au Liban",
    description: "$5.99/mois ou $47.88/an pour générer 100 examens par mois. Sans carte bancaire, paiement WhatsApp.",
    url: "https://imtihan.live/pricing",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Imtihan — AI Exam Generator" }],
  },
};

const PRICING_FAQ_ITEMS = [
  {
    q: "What's included in Imtihan's free plan?",
    a: "1 complete exam with its corrigé, access to every curriculum and subject, Word and PDF export, and Version A/B generation — no credit card required.",
  },
  {
    q: "How much does Imtihan Pro cost?",
    a: "$5.99 per month, or $3.99 per month billed yearly ($47.88/year). Both plans include 100 exams per month with corrigés included.",
  },
  {
    q: "How do I pay for Imtihan Pro?",
    a: "Payment is handled personally via WhatsApp — no credit card forms. You message us your plan choice and we confirm payment directly.",
  },
  {
    q: "Is the free exam really free forever?",
    a: "Yes. The free plan gives every teacher 1 exam to try the full workflow, with no time limit and no recurring charge.",
  },
  {
    q: "Can I cancel my Pro subscription anytime?",
    a: "Yes. There are no long-term contracts or auto-renewal surprises — you can stop at any time.",
  },
];

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SchemaOrg schema={buildFaqSchema(PRICING_FAQ_ITEMS)} />
      <LandingFAQ items={PRICING_FAQ_ITEMS} />
    </>
  );
}
