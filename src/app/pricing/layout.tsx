import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Imtihan Pro",
  description: "Imtihan Pro à partir de $5.99/mois. 100 examens par mois, toutes les matières, corrigé inclus. Paiement via WhatsApp. Commencez gratuitement avec 2 examens.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Tarifs Imtihan — Générateur d'examens IA au Liban",
    description: "$5.99/mois ou $47.88/an pour générer 100 examens par mois. Sans carte bancaire, paiement WhatsApp.",
    url: "https://www.imtihan.live/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
