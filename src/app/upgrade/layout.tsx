import type { Metadata } from "next";
import { SchemaOrg } from "@/components/SchemaOrg";
import { LandingFAQ, buildFaqSchema } from "@/components/landing/LandingFAQ";

export const metadata: Metadata = {
  title: "Upgrade to Imtihan Pro — Pricing for Lebanese Teachers",
  description: "Unlock 100 exams per month. Pay via WHISH Money in Lebanon. Instant activation for Bac Libanais, Brevet, and school exams.",
  alternates: { canonical: "/upgrade" },
  robots: { index: true, follow: true },
};

const UPGRADE_FAQ_ITEMS = [
  {
    q: "How much does upgrading to Imtihan Pro cost?",
    a: "$5.99 per month, or $3.99 per month billed yearly ($47.88 total for the year).",
  },
  {
    q: "How many exams do I get with Imtihan Pro?",
    a: "10 exams per month on the monthly plan, or 20 exams per month on the yearly plan — each with its corrigé included.",
  },
  {
    q: "How do I pay for the upgrade?",
    a: "Via WHISH Money transfer in Lebanon, sent directly to our number. Confirmation and account activation happen right after payment.",
  },
  {
    q: "Do I need to enter a credit card?",
    a: "No. No card details are stored — payment instructions are sent by email or WhatsApp and confirmed manually.",
  },
  {
    q: "Can I cancel after upgrading?",
    a: "Yes, at any time. There are no auto-renewals.",
  },
];

export default function UpgradeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SchemaOrg schema={buildFaqSchema(UPGRADE_FAQ_ITEMS)} />
      <LandingFAQ items={UPGRADE_FAQ_ITEMS} />
    </>
  );
}
