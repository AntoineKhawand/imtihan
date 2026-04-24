"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Check, 
  MessageCircle, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  CreditCard,
  Rocket,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getWhatsAppUpgradeLink } from "@/lib/subscription";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

export default function UpgradePage() {
  const { user, profile } = useAuth();
  const [isYearly, setIsYearly] = useState(false);

  const MONTHLY_PRICE = 5.99;
  const YEARLY_PRICE = 47.88; // 3.99 * 12

  function handleWhatsAppClick() {
    if (!user) {
      window.location.href = "/auth/register";
      return;
    }
    const plan = isYearly ? "Yearly ($47.88)" : "Monthly ($5.99)";
    const link = getWhatsAppUpgradeLink(user.email ?? "");
    const number = link.split("?")[0].replace("https://wa.me/", "");
    const message = encodeURIComponent(
      `Hello! I would like to upgrade to Imtihan Pro (${plan}).\nMy account email is: ${user.email ?? ""}`
    );
    window.open(`https://wa.me/${number}?text=${message}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] selection:bg-[var(--accent)] selection:text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md sticky top-0 z-50">
        <Logo size={28} />
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-24">
        
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-xs font-bold uppercase tracking-wider mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap size={14} className="fill-current" />
            Upgrade to Pro
          </div>
          <h1 className="serif text-display-xl text-[var(--text)] mb-6 tracking-tight max-w-3xl mx-auto">
            Take your exam generation to the next level
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
            Join hundreds of teachers using Imtihan Pro to generate high-quality exams in seconds. 
            No subscriptions traps, no hidden fees. Just professional tools.
          </p>
        </div>

        {/* The Process / Steps Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
          <div className="space-y-12">
            <h2 className="serif text-display-sm text-[var(--text)] mb-8">How it works</h2>
            
            <div className="space-y-8">
              <Step 
                number="01" 
                title="Select your plan" 
                description="Choose between our monthly or yearly plan. Yearly users save 33% and get 4 months free."
                icon={<CreditCard className="text-[var(--accent)]" />}
              />
              <Step 
                number="02" 
                title="Connect via WhatsApp" 
                description="Click the button to open a direct chat with us. We use WhatsApp for personal, human support and flexible payment options."
                icon={<MessageCircle className="text-[var(--accent)]" />}
              />
              <Step 
                number="03" 
                title="Instant Activation" 
                description="Send the pre-filled message, complete your payment via Whish Money, OMT, or Credit Card, and your account is upgraded instantly."
                icon={<Rocket className="text-[var(--accent)]" />}
              />
            </div>
          </div>

          {/* Visual Mockup of the process */}
          <div className="relative">
            <div className="absolute -inset-4 bg-[var(--accent)]/5 rounded-[40px] blur-2xl" />
            <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-[32px] shadow-2xl overflow-hidden aspect-[4/5] flex flex-col">
              {/* Phone Header */}
              <div className="bg-[#075e54] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">I</div>
                <div>
                  <p className="text-white font-semibold text-sm">Imtihan Support</p>
                  <p className="text-white/70 text-[10px]">Online</p>
                </div>
              </div>

              {/* Chat Content */}
              <div className="flex-1 p-4 bg-[#e5ddd5] space-y-4 overflow-y-auto">
                <div className="flex flex-col items-end">
                  <div className="bg-[#dcf8c6] p-3 rounded-2xl rounded-tr-none max-w-[80%] shadow-sm text-sm">
                    Hello! I would like to upgrade to Imtihan Pro (Monthly).
                    My account email is: {user?.email || "teacher@example.com"}
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1">10:01 AM</span>
                </div>

                <div className="flex flex-col items-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none max-w-[80%] shadow-sm text-sm">
                    Hello! Welcome to Imtihan Pro. 👋
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1">10:02 AM</span>
                </div>

                <div className="flex flex-col items-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none max-w-[80%] shadow-sm text-sm">
                    Please use this link to pay $5.99 via Whish or Credit Card: 
                    <span className="block mt-2 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 font-medium">whish.money/pay/imtihan...</span>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1">10:02 AM</span>
                </div>

                <div className="flex flex-col items-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none max-w-[80%] shadow-sm text-sm">
                    Once done, your account will be active immediately!
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1">10:02 AM</span>
                </div>
              </div>
              
              {/* Phone Footer */}
              <div className="bg-[#f0f0f0] p-3 flex items-center gap-3">
                <div className="flex-1 bg-white h-10 rounded-full px-4 flex items-center text-gray-400 text-sm">Type a message</div>
                <div className="w-10 h-10 rounded-full bg-[#128c7e] flex items-center justify-center text-white">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Selection & CTA */}
        <div className="bg-[var(--bg-subtle)] rounded-[40px] p-8 md:p-16 border border-[var(--border)] text-center">
          <h3 className="serif text-display-md text-[var(--text)] mb-4">Choose your plan</h3>
          <p className="text-[var(--text-secondary)] mb-10">Start your Pro journey today</p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
            {/* Monthly */}
            <button 
              onClick={() => setIsYearly(false)}
              className={cn(
                "relative group w-full max-w-xs p-8 rounded-3xl border-2 transition-all text-left",
                !isYearly ? "bg-white border-[var(--accent)] shadow-xl scale-105 z-10" : "bg-transparent border-[var(--border)] opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
              )}
            >
              {!isYearly && <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold uppercase tracking-wider">Selected</div>}
              <p className="text-sm font-semibold text-[var(--text-tertiary)] mb-2">Monthly</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="serif text-4xl text-[var(--text)]">${MONTHLY_PRICE}</span>
                <span className="text-[var(--text-secondary)] mb-1">/mo</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><Check size={12} className="text-[var(--accent)]" /> 100 exams per month</li>
                <li className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><Check size={12} className="text-[var(--accent)]" /> Full support via WhatsApp</li>
              </ul>
            </button>

            {/* Yearly */}
            <button 
              onClick={() => setIsYearly(true)}
              className={cn(
                "relative group w-full max-w-xs p-8 rounded-3xl border-2 transition-all text-left",
                isYearly ? "bg-white border-[var(--accent)] shadow-xl scale-105 z-10" : "bg-transparent border-[var(--border)] opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
              )}
            >
              {isYearly && <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold uppercase tracking-wider">Selected</div>}
              <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">SAVE 33%</div>
              <p className="text-sm font-semibold text-[var(--text-tertiary)] mb-2">Yearly</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="serif text-4xl text-[var(--text)]">$3.99</span>
                <span className="text-[var(--text-secondary)] mb-1">/mo</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><Check size={12} className="text-[var(--accent)]" /> 100 exams per month</li>
                <li className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><Check size={12} className="text-[var(--accent)]" /> 4 months free</li>
              </ul>
            </button>
          </div>

          <button
            onClick={handleWhatsAppClick}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-[var(--accent)] text-white rounded-2xl font-bold text-lg hover:bg-[var(--accent)]/90 active:scale-95 transition-all shadow-xl shadow-[var(--accent)]/20"
          >
            <MessageCircle size={24} className="fill-current" />
            Upgrade via WhatsApp
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="mt-8 flex flex-wrap justify-center gap-8 grayscale opacity-50">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
              <ShieldCheck size={18} /> Secure via Whish
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
              <CreditCard size={18} /> All Cards Supported
            </div>
          </div>
        </div>

      </main>

      {/* Footer Branding */}
      <footer className="py-12 border-t border-[var(--border)] text-center">
        <Logo size={24} className="grayscale opacity-50 mx-auto mb-4" />
        <p className="text-sm text-[var(--text-tertiary)]">© {new Date().getFullYear()} Imtihan. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Step({ number, title, description, icon }: { number: string, title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="flex gap-6 group">
      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-sm font-bold text-[var(--text-tertiary)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-all">
        {number}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-[var(--text)]">{title}</h4>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            {icon}
          </div>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
