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
const YEARLY_TOTAL  = 47.88;
const YEARLY_PER_MO = 3.99;
const SAVINGS_YEARLY = (MONTHLY_PRICE * 12 - YEARLY_TOTAL).toFixed(2);

const PRO_FEATURES = [
  "100 exams per month",
  "All curricula & subjects",
  "Corrigé included per exam",
  "Word + PDF export",
  "Saved exam library",
  "Community exam library",
];

type Plan = "monthly" | "yearly";
type PaymentMethod = "whish" | "other";

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; sub: string }[] = [
  { id: "whish", label: "WHISH Money", sub: "Send directly to our number — details shared on WhatsApp." },
  { id: "other", label: "Other",       sub: "Credit card or alternative — we'll guide you on WhatsApp." },
];

export default function UpgradePage() {
  const { user } = useAuth();
  const [plan, setPlan]       = useState<Plan>("monthly");
  const [payment, setPayment] = useState<PaymentMethod>("whish");

  const price   = plan === "yearly" ? YEARLY_PER_MO : MONTHLY_PRICE;
  const total   = plan === "yearly" ? YEARLY_TOTAL  : MONTHLY_PRICE;
  const billing = plan === "yearly" ? `$${YEARLY_TOTAL} billed annually` : "Billed monthly";

  function handleWhatsApp() {
    if (!user) { window.location.href = "/auth/register"; return; }
    const planLabel = plan === "yearly"
      ? `Yearly ($${YEARLY_TOTAL}/year — $${YEARLY_PER_MO}/mo)`
      : `Monthly ($${MONTHLY_PRICE}/month)`;
    const number  = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
    const message = encodeURIComponent(
      `Hello! I would like to upgrade to Imtihan Pro.\nPlan: ${planLabel}\nPayment method: ${payment === "whish" ? "WHISH Money" : "Other"}\nMy account email: ${user.email ?? ""}`
    );
    window.open(`https://wa.me/${number}?text=${message}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md sticky top-0 z-50">
        <Logo size={28} />
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors group">
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-10 py-12 md:py-20 space-y-24">

        {/* ── Hero ── */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-[10px] font-bold uppercase tracking-widest">
            <Zap size={12} className="fill-current" />
            Upgrade to Pro
          </div>
          <h1 className="serif text-display-xl text-[var(--text)] tracking-tight max-w-2xl mx-auto leading-[1.1]">
            Generate unlimited exams.<br />
            <span className="italic text-[var(--accent)]">In seconds.</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
            100 exams per month. Pay once via WhatsApp, get instant access. No auto-renewals.
          </p>
        </div>

        {/* ── How it works + WhatsApp mockup ── */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-5">How it works</p>
            <h2 className="serif text-display-sm text-[var(--text)] mb-10">Three steps to Pro</h2>
            <div className="space-y-8">
              {[
                { n: "01", icon: <CreditCard size={15} />, title: "Pick your plan", desc: "Monthly at $5.99 or yearly at $3.99/mo — 4 months free." },
                { n: "02", icon: <MessageCircle size={15} />, title: "Message us on WhatsApp", desc: "One tap opens a pre-filled chat. We handle everything personally." },
                { n: "03", icon: <Rocket size={15} />, title: "Instant activation", desc: "Pay via WHISH Money or card. Your account is upgraded immediately." },
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

          {/* WhatsApp chat mockup */}
          <div className="relative hidden md:block">
            <div className="absolute -inset-4 bg-[var(--accent)]/5 rounded-[40px] blur-2xl pointer-events-none" />
            <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-[28px] shadow-2xl overflow-hidden">
              <div className="bg-[#075e54] px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">I</div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">Imtihan Support</p>
                  <p className="text-white/60 text-[10px]">● Online</p>
                </div>
              </div>
              <div className="p-4 bg-[#e5ddd5] space-y-3 min-h-[260px]">
                <div className="flex justify-end">
                  <div className="bg-[#dcf8c6] p-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm text-[12px] leading-relaxed">
                    Hello! I'd like to upgrade to Imtihan Pro (Monthly $5.99).<br />
                    Email: <span className="font-medium">{user?.email || "teacher@school.edu.lb"}</span>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm text-[12px]">Welcome! 👋 Here&apos;s your WHISH link:</div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm text-[12px]">
                    <span className="inline-block px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-medium border border-blue-100">
                      whish.money/pay/imtihan ↗
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm text-[12px]">✅ Done! Your account is now Pro.</div>
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

        {/* ── Checkout — split layout inspired by standard checkout UI ── */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text)] mb-8">Complete your order</h2>

          <div className="grid md:grid-cols-[1fr_1.5fr] gap-6 items-start">

            {/* Left — Order Summary */}
            <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] space-y-5">
              <h3 className="font-semibold text-[var(--text)]">Order Summary</h3>

              {/* Plan selector */}
              <div className="flex gap-2">
                {(["monthly", "yearly"] as Plan[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlan(p)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      plan === p
                        ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    {p === "monthly" ? "Monthly" : (
                      <span className="flex items-center justify-center gap-1.5">
                        Yearly
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">-33%</span>
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Product row */}
              <div className="flex items-start gap-3 py-4 border-y border-[var(--border)]">
                <div className="w-11 h-11 rounded-xl bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-serif">إ</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[var(--text)] text-sm">Imtihan Pro</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{plan === "yearly" ? "12 months" : "1 month"} · Qty: 1</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[var(--text)] text-sm">${total.toFixed(2)}</p>
                  {plan === "yearly" && (
                    <p className="text-xs text-[var(--text-tertiary)] line-through">${(MONTHLY_PRICE * 12).toFixed(2)}</p>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
                    <Check size={10} className="text-[var(--accent)] flex-shrink-0" strokeWidth={3} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Totals */}
              <div className="space-y-2 pt-3 border-t border-[var(--border)] text-sm">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Delivery</span>
                  <span className="font-medium text-[var(--accent)]">FREE</span>
                </div>
                {plan === "yearly" && (
                  <div className="flex justify-between font-medium text-emerald-600">
                    <span>You save</span>
                    <span>${SAVINGS_YEARLY}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-[var(--text)] text-base pt-2 border-t border-[var(--border)]">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)]">{billing}</p>
              </div>

              {/* Testimonial */}
              <div className="bg-[var(--bg-subtle)] rounded-xl p-4 border border-[var(--border)]">
                <div className="flex gap-0.5 mb-2">
                  {[0,1,2,3,4].map(i => <Star key={i} size={10} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] italic leading-relaxed">
                  "Generated a full Terminale Physics exam in under 3 minutes. Worth every cent."
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5 font-medium">— Prof. Khalil · Lycée Français de Beyrouth</p>
              </div>
            </div>

            {/* Right — Payment + CTA */}
            <div className="space-y-5">
              {/* Payment method */}
              <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] space-y-3">
                <h3 className="font-semibold text-[var(--text)]">Payment Method</h3>
                {PAYMENT_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      payment === opt.id
                        ? "border-[var(--accent)] bg-[var(--accent-light)]"
                        : "border-[var(--border)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.id}
                      checked={payment === opt.id}
                      onChange={() => setPayment(opt.id)}
                      className="mt-0.5 flex-shrink-0 accent-[#1a5e3f]"
                    />
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">{opt.label}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{opt.sub}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* CTA card */}
              <div className="border border-[var(--accent)]/30 rounded-2xl p-6 bg-[var(--accent-light)] space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Order total</span>
                  <div>
                    <span className="serif text-3xl font-light text-[var(--text)]">${price.toFixed(2)}</span>
                    <span className="text-sm text-[var(--text-secondary)] ml-1">/mo</span>
                  </div>
                </div>

                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-3 h-13 py-4 rounded-xl bg-[var(--accent)] text-white font-semibold text-base hover:bg-[var(--accent)]/90 active:scale-[0.98] transition-all shadow-lg shadow-[var(--accent)]/20 group"
                >
                  <MessageCircle size={20} className="fill-current" />
                  Complete Order via WhatsApp
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="space-y-2">
                  {[
                    { icon: <ShieldCheck size={13} />, text: "Secure via WHISH Money" },
                    { icon: <Clock size={13} />,       text: "Account activated instantly after payment" },
                    { icon: <MessageCircle size={13}/>, text: "Personal support — real human, not a bot" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <span className="text-[var(--accent)] flex-shrink-0">{icon}</span>
                      {text}
                    </div>
                  ))}
                </div>

                <p className="text-center text-[10px] text-[var(--text-tertiary)]">
                  No auto-renewals · Cancel anytime via WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size={26} />
          <p className="text-xs text-[var(--text-tertiary)]">© {new Date().getFullYear()} Imtihan — Made for Lebanese teachers</p>
          <div className="flex items-center gap-5 text-xs text-[var(--text-tertiary)]">
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-[var(--text)] transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-[var(--text)] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
