import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activer Imtihan Pro",
  description: "Passez à Imtihan Pro en quelques minutes via WhatsApp. 100 examens par mois, activation instantanée après paiement.",
  alternates: { canonical: "/upgrade" },
  robots: { index: false, follow: false },
};

export default function UpgradeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
