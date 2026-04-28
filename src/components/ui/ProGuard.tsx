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
      <div className="relative w-full max-w-lg p-8 md:p-10 bg-white/80 backdrop-blur-3xl border border-white/60 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] rounded-[3rem] text-center animate-in zoom-in-95 fade-in duration-1000">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-[0.25em] mb-8 border border-emerald-100/50 shadow-sm">
          <Zap size={12} className="fill-emerald-500" />
          Pro Exclusive
        </div>

        <div className="relative w-28 h-28 mx-auto mb-8">
          <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative w-full h-full bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-[2rem] shadow-[0_15px_30px_-5px_rgba(5,150,105,0.4)] flex items-center justify-center text-white animate-float border border-white/20">
            <Lock size={40} strokeWidth={1.5} />
          </div>
          <div className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-emerald-600 border border-emerald-50">
            <Sparkles size={20} />
          </div>
        </div>

        <h2 className="serif text-4xl text-[var(--text)] mb-4 tracking-tight">Unlock {featureName}</h2>
        <p className="text-[var(--text-secondary)] text-base mb-10 leading-relaxed font-light max-w-sm mx-auto">
          {featureDescription}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10 text-left">
          {[
            { name: "AI Vision Analysis", icon: <ShieldCheck size={12} /> },
            { name: "Advanced Pedagogy", icon: <Zap size={12} /> },
            { name: "Syllabus Tracking", icon: <Sparkles size={12} /> },
            { name: "Unlimited Exports", icon: <ArrowRight size={12} /> }
          ].map((feat, i) => (
            <div 
              key={feat.name} 
              className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)] bg-emerald-50/30 p-2.5 rounded-xl border border-emerald-100/30 transition-all hover:bg-emerald-50/50"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-5 h-5 rounded-lg bg-emerald-100/50 text-emerald-700 flex items-center justify-center flex-shrink-0 shadow-inner">
                {feat.icon}
              </div>
              <span className="font-semibold tracking-tight">{feat.name}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-5">
          <Link href="/upgrade">
            <Button className="w-full h-16 text-lg rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 shadow-[0_15px_30px_-5px_rgba(5,150,105,0.3)] group relative overflow-hidden">
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine" />
              
              <span className="font-bold">Get Pro Access</span>
              <span className="mx-2 opacity-50 font-light">—</span>
              <span className="font-medium">$5.99</span>
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1.5 transition-transform" />
            </Button>
          </Link>
          <Link href="/dashboard" className="text-[10px] font-bold text-[var(--text-tertiary)] hover:text-emerald-700 transition-colors uppercase tracking-[0.2em]">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
