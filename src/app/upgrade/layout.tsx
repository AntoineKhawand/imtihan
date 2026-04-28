import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upgrade to Imtihan Pro — Pricing for Lebanese Teachers",
  description: "Unlock 100 exams per month. Pay via WHISH Money in Lebanon. Instant activation for Bac Libanais, Brevet, and school exams.",
  alternates: { canonical: "/upgrade" },
  robots: { index: true, follow: true },
};

export default function UpgradeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
