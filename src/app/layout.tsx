import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://imtihan.live";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  applicationName: "Imtihan",
  title: {
    default: "Imtihan — AI Exam Generator for Teachers in Lebanon",
    template: "%s — Imtihan",
  },
  description:
    "Create exams aligned with Bac Libanais, Bac Français, IB, and University curricula in seconds. Full answer key included. 2 free exams, no credit card required.",
  keywords: [
    "AI exam generator Lebanon",
    "générateur d'examens IA Liban",
    "Bac Libanais examens IA",
    "Bac Français examens générateur",
    "IB exam generator Lebanon",
    "Brevet Libanais examens",
    "Terminale SG SE LH Liban",
    "Lebanese curriculum AI",
    "corrigé automatique Liban",
    "exam creator for teachers Lebanon",
    "générateur examen physique mathématiques",
    "logiciel création examen Liban",
    "Imtihan",
    "امتحان لبنان",
    "توليد امتحانات لبنان",
    "مركز الامتحانات اللبنانية",
    "اسئلة دورات لبناني",
    "شهادة البريفيه",
    "البكالوريا اللبنانية",
    "دليل المعلم لبنان",
    "prevent student cheating AI",
    "Beirut",
    "Tripoli",
    "Mount Lebanon",
    "Zahlé",
    "Sidon",
    "Lebanese academic coordination",
    "exam prep for kids Lebanon",
    "mock exam generator for parents",
    "school coordination software",
    "university professor productivity",
    "AUB LAU USJ assessments",
    "تجهيز امتحانات للاولاد",
    "تنسيق تعليمي",
    "تحضير مسابقات",
    "دليل المعلم اللبناني",
  ],
  authors: [{ name: "Imtihan", url: APP_URL }],
  creator: "Imtihan",
  publisher: "Imtihan",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  other: {
    "geo.region": "LB",
    "geo.placename": "Beirut, Lebanon",
    "geo.position": "33.8938;35.5018",
    "ICBM": "33.8938, 35.5018",
    "DC.title": "Imtihan — AI Exam Generator for Teachers in Lebanon",
    "geo.country": "LB",
  },
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    type: "website",
    locale: "fr_LB",
    alternateLocale: ["en_US", "ar_LB"],
    url: APP_URL,
    siteName: "Imtihan",
    title: "Imtihan — AI Exam Generator for Teachers in Lebanon",
    description:
      "Create exams aligned with Bac Libanais, Bac Français, IB, and University curricula in seconds. Full answer key included.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Imtihan — AI Exam Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Imtihan — AI Exam Generator for Teachers in Lebanon",
    description:
      "Generate Bac Libanais, Bac Français, IB, or University exams in seconds with AI. Full answer key included.",
    images: ["/opengraph-image"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/Imtihan-logo.png",
    apple: "/Imtihan-logo.png",
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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Resource Hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        
        {/* KaTeX - Preload for performance, but load normally to avoid hydration issues in SSR */}
        <link 
          rel="preload" 
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" 
          as="style" 
        />
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" 
        />
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