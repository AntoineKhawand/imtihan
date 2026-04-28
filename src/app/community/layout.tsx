import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Library — Exams for Lebanese Curriculum",
  description: "Browse and remix thousands of exams shared by teachers in Lebanon. Cover Bac Libanais, Brevet, and more.",
  robots: { index: true, follow: true },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
