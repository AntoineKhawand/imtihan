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
    <div className="relative min-h-[700px] flex items-center justify-center overflow-hidden rounded-[3rem] mesh-gradient p-6">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 -left-10 w-64 h-64 bg-emerald-200/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-10 w-64 h-64 bg-amber-200/20 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Background Blur of Content */}
      <div className="absolute inset-0 opacity-10 grayscale pointer-events-none blur-3xl scale-110">
        {children}
      </div>
      
      {/* Premium Upgrade Card */}
      <div className="relative w-full max-w-xl p-10 md:p-12 bg-white/70 backdrop-blur-3xl border border-white/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[4rem] text-center animate-in zoom-in-95 fade-in duration-1000">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-[11px] font-bold uppercase tracking-[0.2em] mb-10 border border-amber-100/50 shadow-sm">
          <Zap size={14} className="fill-amber-500" />
          Premium Feature
        </div>

        <div className="relative w-32 h-32 mx-auto mb-10">
          <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative w-full h-full bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(5,150,105,0.4)] flex items-center justify-center text-white animate-float border border-white/20">
            <Lock size={48} strokeWidth={1.5} />
          </div>
          <div className="absolute -top-6 -right-6 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-amber-500 border border-amber-50">
            <Sparkles size={24} />
          </div>
        </div>

        <h2 className="serif text-5xl text-[var(--text)] mb-5 tracking-tight">Unlock {featureName}</h2>
        <p className="text-[var(--text-secondary)] text-lg mb-12 leading-relaxed font-light max-w-md mx-auto">
          {featureDescription}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 text-left">
          {[
            { name: "AI Vision Analysis", icon: <ShieldCheck size={14} /> },
            { name: "Advanced Pedagogy AI", icon: <Zap size={14} /> },
            { name: "Syllabus Tracking", icon: <Sparkles size={14} /> },
            { name: "Unlimited Exports", icon: <ArrowRight size={14} /> },
            { name: "School Collaboration", icon: <Lock size={14} /> },
            { name: "Priority Support", icon: <ShieldCheck size={14} /> }
          ].map((feat, i) => (
            <div 
              key={feat.name} 
              className="flex items-center gap-3 text-sm text-[var(--text-secondary)] bg-white/40 p-3 rounded-2xl border border-white/60 transition-all hover:scale-105 hover:bg-white/60"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-inner">
                {feat.icon}
              </div>
              <span className="font-medium tracking-tight">{feat.name}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          <Link href="/upgrade">
            <Button className="w-full h-18 text-xl rounded-3xl bg-emerald-700 hover:bg-emerald-800 shadow-[0_20px_40px_-10px_rgba(5,150,105,0.3)] group py-8">
              <span className="font-bold">Upgrade to Pro</span>
              <span className="mx-2 opacity-50 font-light">—</span>
              <span className="font-medium">$5.99/mo</span>
              <ArrowRight size={22} className="ml-3 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
          <Link href="/dashboard" className="text-sm font-bold text-[var(--text-tertiary)] hover:text-emerald-700 transition-colors uppercase tracking-widest">
            Maybe later
          </Link>
        </div>
      </div>
    </div>
  );
}
