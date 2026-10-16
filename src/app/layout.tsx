import { AnalyticsConsent } from "@/components/AnalyticsConsent";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/contexts/AuthContext";
import "katex/dist/katex.min.css";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://imtihan.live";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  applicationName: "Imtihan",
  title: {
    default: "Imtihan — AI Exam Generator for Teachers in Lebanon",
    template: "%s — Imtihan",
  },
  description:
    "Create exams aligned with Bac Libanais, Bac Français, IB, and University curricula in seconds. Full answer key included. 1 free exam, no credit card required.",
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
        url: "/opengraph-image?v=20261016",
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
    images: ["/opengraph-image?v=20261016"],
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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        {/*
          Facebook's Sharing Debugger flags fb:app_id as a required property.
          Next.js's Metadata API has no dedicated field for it (it's not part
          of the openGraph type schema), and metadata.other renders name="..."
          rather than property="...", which Facebook's crawler doesn't
          recognize for its own fb:/og: namespaced tags (confirmed the same
          issue with og:type earlier — see that fix's commit). A raw tag here
          is the only way to get the correct attribute.
        */}
        <meta property="fb:app_id" content="1968562397881054" />
      </head>
      <body>
        <AnalyticsConsent />
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
        {/*
          sonner's <Toaster/> was never mounted anywhere in the app, so every
          `import { toast } from "sonner"` call across the codebase (admin,
          bank, scanner, create/export, and the new dashboard translate
          feature) rendered nothing. Positioned top-right, distinct from the
          app's own bottom-right ToastProvider above, so the two never overlap.
        */}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
