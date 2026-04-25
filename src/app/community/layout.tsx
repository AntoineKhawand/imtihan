import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bibliothèque communautaire — Imtihan",
  robots: { index: false, follow: false },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
