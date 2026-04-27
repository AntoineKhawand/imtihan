"use client";

import { ReactNode } from "react";
import { Zap, Sparkles, ShieldCheck, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { isProActive, isInGracePeriod } from "@/lib/subscription";

interface ProGuardProps {
  children: ReactNode;
  featureName: string;
  featureDescription: string;
}

export function ProGuard({ children, featureName, featureDescription }: ProGuardProps) {
  const { profile, loading } = useAuth();
  const isPro = isProActive(profile) || isInGracePeriod(profile);

  if (loading) return null;

  if (isPro) return <>{children}</>;

  return (
    <div className="relative min-h-[600px] flex items-center justify-center overflow-hidden rounded-[3rem]">
      {/* Background Blur of Content */}
      <div className="absolute inset-0 opacity-10 grayscale pointer-events-none blur-xl scale-110">
        {children}
      </div>
      
      {/* Premium Upgrade Card */}
      <div className="relative w-full max-w-xl p-10 bg-white/80 backdrop-blur-2xl border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[3.5rem] text-center animate-in zoom-in-95 fade-in duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-widest mb-8 border border-amber-100">
          <Zap size={12} className="fill-amber-500" />
          Premium Feature
        </div>

        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl shadow-xl flex items-center justify-center text-white rotate-6 hover:rotate-0 transition-transform duration-500">
            <Lock size={40} strokeWidth={1.5} />
          </div>
          <Sparkles className="absolute -top-4 -right-4 text-amber-400 animate-bounce" size={32} />
        </div>

        <h2 className="serif text-4xl text-[var(--text)] mb-4 tracking-tight">Unlock {featureName}</h2>
        <p className="text-[var(--text-secondary)] text-lg mb-10 leading-relaxed font-light">
          {featureDescription}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
          {[
            "AI Vision Analysis",
            "Advanced Pedagogy AI",
            "Official Curriculum Tracking",
            "Unlimited PDF Exports",
            "School Collaboration",
            "Priority Support"
          ].map((feat) => (
            <div key={feat} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={12} />
              </div>
              {feat}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/upgrade">
            <Button className="w-full h-16 text-lg rounded-2xl bg-emerald-700 hover:bg-emerald-800 shadow-xl shadow-emerald-200 group">
              Upgrade to Pro — $5.99/mo
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/dashboard" className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
            Maybe later
          </Link>
        </div>
      </div>
    </div>
  );
}
