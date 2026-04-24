"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function PricingSuccessPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)]">
        <Logo size={28} />
      </nav>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          
          <h1 className="serif text-display-md text-[var(--text)] mb-4">Welcome to Pro!</h1>
          <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
            Your subscription is active. You now have unlimited access to all Imtihan features. Start creating exams!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <Button icon={<Sparkles size={14} />}>Go to Dashboard</Button>
            </Link>
            <Link href="/create">
              <Button variant="secondary" icon={<ArrowRight size={14} />}>Create your first exam</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}