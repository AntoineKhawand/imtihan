import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/react";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://imtihan.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  applicationName: "Imtihan",
  title: {
    default: "Imtihan — Générateur d'examens IA pour enseignants au Liban",
    template: "%s — Imtihan",
  },
  description:
    "Créez des examens alignés sur le Bac Libanais, Bac Français, IB et l'Université en quelques secondes. Corrigé complet inclus. 2 examens gratuits, sans carte bancaire.",
  keywords: [
    "générateur examen bac libanais",
    "examen IA professeur liban",
    "créer examen physique terminale S",
    "corrigé automatique bac français",
    "AI exam generator Lebanon",
    "IB exam generator",
    "Imtihan",
    "امتحان",
  ],
  authors: [{ name: "Imtihan", url: APP_URL }],
  creator: "Imtihan",
  publisher: "Imtihan",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    type: "website",
    locale: "fr_LB",
    alternateLocale: "en_US",
    url: APP_URL,
    siteName: "Imtihan",
    title: "Imtihan — Générateur d'examens IA pour enseignants au Liban",
    description:
      "Créez des examens alignés sur le Bac Libanais, Bac Français, IB et l'Université en quelques secondes. Corrigé complet inclus.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Imtihan — Générateur d'examens IA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Imtihan — Générateur d'examens IA pour enseignants au Liban",
    description:
      "Créez des examens Bac Libanais, Bac Français, IB ou Université en quelques secondes avec l'IA. Corrigé complet inclus.",
    images: ["/opengraph-image"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a5e3f",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Google Fonts performance: preconnect before @import in CSS */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}