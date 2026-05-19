import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un examen — Imtihan",
  description: "Générez un examen personnalisé conforme aux programmes scolaires libanais, français ou IB en quelques minutes. Ajoutez des corrigés détaillés et des variantes.",
  alternates: { canonical: "/create" },
  robots: { index: false, follow: false },
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
