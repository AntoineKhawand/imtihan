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
  ArrowLeft,
  Clock,
  Star,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/ui/Logo";

const MONTHLY_PRICE = 5.99;
const YEARLY_PRICE_PER_MONTH = 3.99;
const YEARLY_TOTAL = 47.88;

const PRO_FEATURES = [
  "100 exams per month",
  "All curricula & subjects",
  "Corrigé included per exam",
  "Word + PDF export",
  "Saved exam library",
  "Community exam library",
];

export default function UpgradePage() {
  const { user } = useAuth();
  const [isYearly, setIsYearly] = useState(false);

  const price = isYearly ? YEARLY_PRICE_PER_MONTH : MONTHLY_PRICE;
  const billing = isYearly ? `$${YEARLY_TOTAL} billed annually` : "Billed monthly";

  function handleWhatsAppClick() {
    if (!user) {
      window.location.href = "/auth/register";
      return;
    }
    const plan = isYearly ? `Yearly ($${YEARLY_TOTAL}/year)` : `Monthly ($${MONTHLY_PRICE}/month)`;
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
    const message = encodeURIComponent(
      `Hello! I would like to upgrade to Imtihan Pro (${plan}).\nMy account email is: ${user.email ?? ""}`
    );
    window.open(`https://wa.me/${number}?text=${message}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] selection:bg-[var(--accent)] selection:text-white flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md sticky top-0 z-50">
        <Logo size={28} />
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors group">
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-10 py-16 md:py-24 space-y-28">

        {/* ── Hero ── */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-[10px] font-bold uppercase tracking-widest mb-6">
            <Zap size={12} className="fill-current" />
            Upgrade to Pro
          </div>
          <h1 className="serif text-display-xl text-[var(--text)] mb-5 tracking-tight max-w-3xl mx-auto leading-[1.1]">
            Generate unlimited exams.<br />
            <span className="italic text-[var(--accent)]">In seconds.</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-xl mx-auto leading-relaxed">
            No subscription traps, no hidden fees. Pay via WhatsApp, get instant access.
            100 exams per month for less than a coffee.
          </p>
        </div>

        {/* ── How it works ── */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-6">How it works</p>
            <h2 className="serif text-display-sm text-[var(--text)] mb-10">Three steps to Pro</h2>
            <div className="space-y-8">
              {[
                {
                  n: "01", icon: <CreditCard size={16} />, title: "Pick your plan",
                  desc: "Monthly at $5.99 or yearly at $3.99/mo — 4 months free.",
                },
                {
                  n: "02", icon: <MessageCircle size={16} />, title: "Message us on WhatsApp",
                  desc: "One tap opens a pre-filled chat. We handle everything personally.",
                },
                {
                  n: "03", icon: <Rocket size={16} />, title: "Instant activation",
                  desc: "Pay via Whish Money, OMT or card. Your account is upgraded immediately.",
                },
              ].map(({ n, icon, title, desc }) => (
                <div key={n} className="flex gap-5 group">
                  <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-xs font-bold text-[var(--text-tertiary)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-all">
                    {n}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-[var(--text)] text-sm">{title}</h4>
                      <span className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">{icon}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp preview */}
          <div className="relative">
            <div className="absolute -inset-4 bg-[var(--accent)]/5 rounded-[40px] blur-2xl pointer-events-none" />
            <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-[28px] shadow-2xl overflow-hidden">
              <div className="bg-[#075e54] px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">I</div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">Imtihan Support</p>
                  <p className="text-white/60 text-[10px]">● Online</p>
                </div>
              </div>
              <div className="p-4 bg-[#e5ddd5] space-y-3 min-h-[280px]">
                <div className="flex justify-end">
                  <div className="bg-[#dcf8c6] p-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm text-[12px] leading-relaxed">
                    Hello! I would like to upgrade to Imtihan Pro (Monthly $5.99).<br />
                    My email: <span className="font-medium">{user?.email || "teacher@school.edu.lb"}</span>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm text-[12px]">
                    Hello! Welcome to Imtihan Pro. 👋
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm text-[12px] leading-relaxed">
                    Please pay $5.99 via Whish or card:<br />
                    <span className="inline-block mt-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-medium border border-blue-100">
                      whish.money/pay/imtihan ↗
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm text-[12px]">
                    ✅ Done! Your account is now Pro.
                  </div>
                </div>
              </div>
              <div className="bg-[#f0f0f0] px-3 py-2.5 flex items-center gap-2">
                <div className="flex-1 bg-white h-9 rounded-full px-3 flex items-center text-gray-400 text-[12px]">Type a message…</div>
                <div className="w-9 h-9 rounded-full bg-[#128c7e] flex items-center justify-center text-white flex-shrink-0">
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Checkout section ── */}
        <div>
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-3">Ready to upgrade?</p>
            <h2 className="serif text-display-md text-[var(--text)]">Complete your order</h2>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className={`text-sm font-medium transition-colors ${!isYearly ? "text-[var(--text)]" : "text-[var(--text-tertiary)]"}`}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${isYearly ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${isYearly ? "translate-x-6" : "translate-x-0"}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium transition-colors ${isYearly ? "text-[var(--text)]" : "text-[var(--text-tertiary)]"}`}>Yearly</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">SAVE 33%</span>
            </div>
          </div>

          {/* Split checkout layout */}
          <div className="grid md:grid-cols-2 gap-6 items-start">

            {/* Left — Order summary */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-1">Your order</p>
                <h3 className="serif text-2xl text-[var(--text)] font-light">Imtihan Pro</h3>
              </div>

              <div className="flex items-end justify-between border-b border-[var(--border)] pb-6">
                <div>
                  <span className="serif text-4xl font-light text-[var(--text)]">${price.toFixed(2)}</span>
                  <span className="text-[var(--text-secondary)] ml-1">/mo</span>
                </div>
                <p className="text-xs text-[var(--text-tertiary)]">{billing}</p>
              </div>

              <ul className="space-y-3">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <span className="w-4 h-4 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                      <Check size={9} className="text-white" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {isYearly && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-sm text-emerald-700">
                  <span className="font-semibold">You save ${(MONTHLY_PRICE * 12 - YEARLY_TOTAL).toFixed(2)}/year</span>
                  {" "}— equivalent to 4 months free.
                </div>
              )}

              {/* Testimonial */}
              <div className="bg-[var(--bg-subtle)] rounded-2xl p-4 border border-[var(--border)]">
                <div className="flex gap-0.5 mb-2">
                  {[0,1,2,3,4].map(i => <Star key={i} size={11} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
                  "Generated a full Physics Terminale exam in under 3 minutes. Worth every cent."
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-2 font-medium">— Prof. Khalil · Lycée Français de Beyrouth</p>
              </div>
            </div>

            {/* Right — Payment panel */}
            <div className="rounded-3xl border border-[var(--accent)]/30 bg-[var(--accent-light)] p-8 space-y-6 shadow-xl shadow-[var(--accent)]/10">
              <div>
                <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-1">Payment</p>
                <h3 className="serif text-2xl text-[var(--text)] font-light">via WhatsApp</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                  We handle every upgrade personally. One message and you&apos;re live.
                </p>
              </div>

              <div className="space-y-2 text-sm border-y border-[var(--accent)]/20 py-5">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Imtihan Pro {isYearly ? "(Yearly)" : "(Monthly)"}</span>
                  <span className="font-semibold text-[var(--text)]">${isYearly ? YEARLY_TOTAL : MONTHLY_PRICE}</span>
                </div>
                {isYearly && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Yearly discount</span>
                    <span>−${(MONTHLY_PRICE * 12 - YEARLY_TOTAL).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-[var(--text)] pt-2 border-t border-[var(--accent)]/20">
                  <span>Total {isYearly ? "/year" : "/month"}</span>
                  <span>${isYearly ? YEARLY_TOTAL : MONTHLY_PRICE}</span>
                </div>
              </div>

              <button
                onClick={handleWhatsAppClick}
                className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl bg-[var(--accent)] text-white font-bold text-base hover:bg-[var(--accent)]/90 active:scale-[0.98] transition-all shadow-lg shadow-[var(--accent)]/25 group"
              >
                <MessageCircle size={20} className="fill-current" />
                Upgrade via WhatsApp
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="space-y-2.5">
                {[
                  { icon: <ShieldCheck size={14} />, text: "Secure via Whish Money or card" },
                  { icon: <Clock size={14} />, text: "Account activated instantly after payment" },
                  { icon: <MessageCircle size={14} />, text: "Personal support — real human, not a bot" },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
                    <span className="text-[var(--accent)] flex-shrink-0">{icon}</span>
                    {text}
                  </div>
                ))}
              </div>

              <p className="text-center text-[10px] text-[var(--text-tertiary)]">
                No credit card form · No auto-renewals · Cancel anytime via WhatsApp
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size={28} />
          <p className="text-xs text-[var(--text-tertiary)] text-center">
            Made for Lebanese teachers · © {new Date().getFullYear()} Imtihan
          </p>
          <div className="flex items-center gap-5 text-xs text-[var(--text-tertiary)]">
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text)] transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-[var(--text)] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
