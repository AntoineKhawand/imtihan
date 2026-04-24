"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function PricingCancelPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)]">
        <Logo size={28} />
      </nav>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="serif text-display-md text-[var(--text)] mb-4">No worries!</h1>
          <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
            Your upgrade was canceled. You can still use your free exams. When you&apos;re ready, you can upgrade anytime from your dashboard.
          </p>

          <Link href="/dashboard">
            <Button variant="secondary" icon={<ArrowLeft size={14} />}>Back to Dashboard</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}