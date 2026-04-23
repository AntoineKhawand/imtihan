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
    "bac libanais exam generator",
    "IB exam generator",
    "physics exam generator",
    "math exam generator",
    "exam creator for teachers",
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
    locale: "en_US",
    alternateLocale: "fr_LB",
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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
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