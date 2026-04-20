import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Imtihan — Générateur d'examens intelligent pour enseignants",
    template: "%s | Imtihan",
  },
  description:
    "Créez des examens professionnels en minutes. Bac Libanais, Bac Français, IB, et université. Mathématiques, Physique, Chimie. Corrigé inclus.",
  keywords: [
    "générateur examen",
    "bac libanais",
    "bac français",
    "IB",
    "enseignant liban",
    "exam generator",
    "physique chimie maths",
    "corrigé",
  ],
  authors: [{ name: "Imtihan" }],
  openGraph: {
    title: "Imtihan — Générateur d'examens intelligent",
    description: "Examens professionnels en minutes pour enseignants au Liban.",
    locale: "fr_LB",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="grain antialiased">
        {children}
      </body>
    </html>
  );
}
