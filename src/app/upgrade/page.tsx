"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check, MessageCircle, Zap, ShieldCheck, ArrowRight,
  ArrowLeft, Clock, Star, Mail, Phone, User, CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/ui/Logo";

const MONTHLY_PRICE = 5.99;
const YEARLY_TOTAL  = 47.88;
const YEARLY_PER_MO = 3.99;
const SAVINGS       = (MONTHLY_PRICE * 12 - YEARLY_TOTAL).toFixed(2);
const WHISH_NUMBER  = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "96170542238";

const PRO_FEATURES = [
  "10 exams per month",
  "All curricula & subjects",
  "Corrigé included per exam",
  "Word + PDF export",
  "Saved exam library",
  "Community exam library",
];

type Plan    = "monthly" | "yearly";
type Payment = "whish" | "other";
type Contact = "email" | "whatsapp";

export default function UpgradePage() {
  const { user } = useAuth();

  /* ── form state ── */
  const [plan,    setPlan]    = useState<Plan>("monthly");
  const [payment, setPayment] = useState<Payment>("whish");
  const [contact, setContact] = useState<Contact>("email");
  const [name,    setName]    = useState(user?.displayName ?? "");
  const [email,   setEmail]   = useState(user?.email ?? "");
  const [phone,   setPhone]   = useState("");

  /* ── submit state ── */
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const price     = plan === "yearly" ? YEARLY_PER_MO : MONTHLY_PRICE;
  const total     = plan === "yearly" ? YEARLY_TOTAL   : MONTHLY_PRICE;
  const planLabel = plan === "yearly" ? `Yearly — $${YEARLY_TOTAL}/year` : `Monthly — $${MONTHLY_PRICE}/month`;
  const isReady   = name.trim().length > 0 && email.includes("@");

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!isReady || loading) return;

    if (contact === "whatsapp") {
      const msg = encodeURIComponent(
        `Hello! I'd like to upgrade to Imtihan Pro.\nPlan: ${planLabel}\nPayment: ${payment === "whish" ? "WHISH Money" : "Other"}\nEmail: ${email}`
      );
      window.open(`https://wa.me/${WHISH_NUMBER}?text=${msg}`, "_blank");
      setDone(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), plan, paymentMethod: payment }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? "Failed");
      setDone(true);
    } catch {
      setError("Something went wrong. Email us directly at hello@imtihan.live.");
    } finally {
      setLoading(false);
    }
  }

  /* ── success screen ── */
  if (done) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col">
        <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)]">
          <Logo size={28} />
        </nav>
        <main className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h1 className="serif text-display-md text-[var(--text)] mb-3">
              {contact === "email" ? "Check your inbox!" : "WhatsApp is open!"}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8">
              {contact === "email"
                ? <>We sent payment instructions to <strong>{email}</strong>. Your account activates instantly once confirmed.</>
                : <>Send the pre-filled message and we&apos;ll guide you through the payment.</>}
            </p>
            <Link href="/" className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent)]/90 transition-colors">
              Back to Homepage <ArrowRight size={14} />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>
          <div className="w-px h-6 bg-[var(--border)] hidden md:block" />
          <Logo size={28} />
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-10 py-12 md:py-16 space-y-20">

        {/* ── Hero ── */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-[10px] font-bold uppercase tracking-widest">
            <Zap size={12} className="fill-current" /> Upgrade to Pro
          </div>
          <h1 className="serif text-display-xl text-[var(--text)] tracking-tight max-w-2xl mx-auto leading-[1.1]">
            Generate high-quality exams.<br />
            <span className="italic text-[var(--accent)]">In seconds.</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed text-sm">
            10 exams/mo (Monthly plan) or 20 exams/mo (Yearly plan). Pay via WHISH Money, get instant access. No auto-renewals.
          </p>
        </div>

        {/* ── Checkout split ── */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text)] mb-8">Confirm your upgrade</h2>

          <div className="grid md:grid-cols-[1fr_1.5fr] gap-6 items-start">

            {/* ── Left: Order Summary ── */}
            <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] space-y-5">
              <h3 className="font-semibold text-[var(--text)]">Plan Summary</h3>

              <div className="flex gap-2">
                {(["monthly","yearly"] as Plan[]).map((p) => (
                  <button key={p} onClick={() => setPlan(p)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      plan === p ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                    }`}>
                    {p === "yearly" ? <span className="flex items-center justify-center gap-1.5">Yearly <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">-33%</span></span> : "Monthly"}
                  </button>
                ))}
              </div>

              <div className="flex items-start gap-3 py-4 border-y border-[var(--border)]">
                <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--border)]">
                  <Image src="/Imtihan-logo.png" alt="Imtihan" width={44} height={44} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[var(--text)] text-sm">Imtihan Pro</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{plan === "yearly" ? "12 months" : "1 month"} · Qty: 1</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[var(--text)] text-sm">${total.toFixed(2)}</p>
                  {plan === "yearly" && <p className="text-xs text-[var(--text-tertiary)] line-through">${(MONTHLY_PRICE * 12).toFixed(2)}</p>}
                </div>
              </div>

              <ul className="space-y-2">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
                    <Check size={10} className="text-[var(--accent)] flex-shrink-0" strokeWidth={3} />{f}
                  </li>
                ))}
              </ul>

              <div className="space-y-2 pt-3 border-t border-[var(--border)] text-sm">
                <div className="flex justify-between text-[var(--text-secondary)]"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                <div className="flex justify-between text-[var(--text-secondary)]"><span>Platform Fee</span><span className="font-medium text-[var(--accent)]">INCLUDED</span></div>
                {plan === "yearly" && <div className="flex justify-between font-medium text-emerald-600"><span>You save</span><span>${SAVINGS}</span></div>}
                <div className="flex justify-between font-bold text-[var(--text)] text-base pt-2 border-t border-[var(--border)]">
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)]">{plan === "yearly" ? `$${YEARLY_TOTAL} billed annually` : "Billed monthly"}</p>
              </div>

              <div className="bg-[var(--bg-subtle)] rounded-xl p-4 border border-[var(--border)]">
                <div className="flex gap-0.5 mb-2">{[0,1,2,3,4].map(i => <Star key={i} size={10} className="text-amber-400 fill-amber-400" />)}</div>
                <p className="text-[11px] text-[var(--text-secondary)] italic leading-relaxed">"Generated a full Terminale Physics exam in under 3 minutes. Worth every cent."</p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5 font-medium">— Prof. Khalil · Lycée Français de Beyrouth</p>
              </div>
            </div>

            {/* ── Right: Form + Preview ── */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Customer info */}
              <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] space-y-4">
                <h3 className="font-semibold text-[var(--text)] flex items-center gap-2"><User size={15} className="text-[var(--text-tertiary)]" /> Customer Information</h3>
                <Field label="Full Name" required>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Teacher Name" className={inp} required />
                </Field>
                <Field label="Email Address" required>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@school.edu.lb" className={`${inp} pl-9`} required />
                  </div>
                </Field>
                <Field label="Phone Number (optional)">
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 h-10 px-3 border border-[var(--border)] rounded-xl bg-[var(--bg-subtle)] text-sm text-[var(--text-secondary)] flex-shrink-0 select-none">
                      <Phone size={12} /> +961
                    </div>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="70 123 456" className={`${inp} flex-1`} />
                  </div>
                </Field>
              </div>

              {/* Payment method */}
              <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] space-y-3">
                <h3 className="font-semibold text-[var(--text)]">Payment Method</h3>
                {([
                  { id: "whish" as Payment, label: "WHISH Money", sub: "Send directly to our number — instant confirmation." },
                  { id: "other" as Payment, label: "Other",        sub: "Credit card or alternative — we'll guide you." },
                ]).map((opt) => (
                  <label key={opt.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${payment === opt.id ? "border-[var(--accent)] bg-[var(--accent-light)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"}`}>
                    <input type="radio" name="payment" value={opt.id} checked={payment === opt.id} onChange={() => setPayment(opt.id)} className="mt-0.5 flex-shrink-0 accent-[#1a5e3f]" />
                    <div><p className="text-sm font-medium text-[var(--text)]">{opt.label}</p><p className="text-xs text-[var(--text-secondary)] mt-0.5">{opt.sub}</p></div>
                  </label>
                ))}
              </div>

              {/* Contact preference */}
              <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] space-y-3">
                <h3 className="font-semibold text-[var(--text)]">Receive instructions by</h3>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { id: "email" as Contact,    icon: <Mail size={16} />,           label: "Email",    sub: "We email you the steps" },
                    { id: "whatsapp" as Contact, icon: <MessageCircle size={16} />,  label: "WhatsApp", sub: "We chat directly with you" },
                  ]).map((opt) => (
                    <button type="button" key={opt.id} onClick={() => setContact(opt.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${contact === opt.id ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"}`}>
                      {opt.icon}
                      <span className="text-sm font-semibold">{opt.label}</span>
                      <span className="text-[10px] leading-tight">{opt.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Live preview ── */}
              <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
                <div className="px-4 py-2.5 bg-[var(--bg-subtle)] border-b border-[var(--border)] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-[10px] text-[var(--text-tertiary)] ml-2 font-medium uppercase tracking-wider">
                    {contact === "email" ? "Email preview — what you'll receive" : "WhatsApp preview"}
                  </span>
                </div>

                {contact === "email" ? (
                  /* Email mockup */
                  <div className="p-5 space-y-4 text-[12px]">
                    <div className="space-y-1.5 pb-4 border-b border-[var(--border)]">
                      <div className="flex gap-2"><span className="text-[var(--text-tertiary)] w-14 flex-shrink-0">From</span><span className="font-medium text-[var(--text)]">Imtihan &lt;hello@imtihan.live&gt;</span></div>
                      <div className="flex gap-2"><span className="text-[var(--text-tertiary)] w-14 flex-shrink-0">To</span><span className="text-[var(--text)]">{email || "your@email.com"}</span></div>
                      <div className="flex gap-2"><span className="text-[var(--text-tertiary)] w-14 flex-shrink-0">Subject</span><span className="font-semibold text-[var(--text)]">Your Imtihan Pro upgrade — payment instructions</span></div>
                    </div>
                    <div className="space-y-3 text-[var(--text-secondary)] leading-relaxed">
                      <p>Hi <span className="font-semibold text-[var(--text)]">{name || "there"}</span>,</p>
                      <p>Thank you for choosing <strong className="text-[var(--text)]">Imtihan Pro ({plan === "yearly" ? `Yearly — $${YEARLY_TOTAL}/year` : `Monthly — $${MONTHLY_PRICE}/month`})</strong>.</p>
                      <div className="bg-[var(--bg-subtle)] rounded-xl p-4 border border-[var(--border)] space-y-2">
                        <p className="font-semibold text-[var(--text)] text-[11px] uppercase tracking-wider">Payment Instructions</p>
                        {payment === "whish" ? (
                          <>
                            <p>Send <strong className="text-[var(--text)]">${total.toFixed(2)}</strong> via <strong className="text-[var(--text)]">WHISH Money</strong> to:</p>
                            <p className="font-mono bg-white border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] inline-block">+{WHISH_NUMBER}</p>
                            <p className="text-[11px]">Use your email address as the payment reference.</p>
                          </>
                        ) : (
                          <p>Our team will send you a secure payment link shortly. Accepted: credit card, PayPal, or any local transfer.</p>
                        )}
                      </div>
                      <p>Your account will be upgraded <strong className="text-[var(--text)]">instantly</strong> after we confirm your payment.</p>
                      <p className="text-[11px] text-[var(--text-tertiary)]">Questions? Just reply to this email.<br />— The Imtihan Team</p>
                    </div>
                  </div>
                ) : (
                  /* WhatsApp mockup */
                  <div>
                    <div className="bg-[#075e54] px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">I</div>
                      <div><p className="text-white font-semibold text-xs">Imtihan Support</p><p className="text-white/60 text-[10px]">● Online</p></div>
                    </div>
                    <div className="p-4 bg-[#e5ddd5] space-y-3 min-h-[200px]">
                      <div className="flex justify-end">
                        <div className="bg-[#dcf8c6] p-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm text-[11px] leading-relaxed">
                          Hello! I'd like to upgrade to Imtihan Pro ({plan === "yearly" ? `Yearly — $${YEARLY_TOTAL}/year` : `Monthly — $${MONTHLY_PRICE}/month`}).<br />
                          Email: <span className="font-medium">{email || "your@email.com"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-2">
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm text-[11px]">Hi {name || "there"}! Welcome 👋</div>
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm text-[11px] leading-relaxed">
                          {payment === "whish"
                            ? <>Send <strong>${total.toFixed(2)}</strong> via WHISH to +{WHISH_NUMBER} and you&apos;re all set!</>
                            : <>We&apos;ll send you a payment link right away.</>}
                        </div>
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm text-[11px]">✅ Account upgraded instantly after payment!</div>
                      </div>
                    </div>
                    <div className="bg-[#f0f0f0] px-3 py-2 flex items-center gap-2">
                      <div className="flex-1 bg-white h-8 rounded-full px-3 flex items-center text-gray-400 text-[11px]">Type a message…</div>
                      <div className="w-8 h-8 rounded-full bg-[#128c7e] flex items-center justify-center text-white flex-shrink-0"><ArrowRight size={14} /></div>
                    </div>
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}

              {/* CTA */}
              <div className="border border-[var(--accent)]/30 rounded-2xl p-5 bg-[var(--accent-light)] space-y-4">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Order total</span>
                  <div><span className="serif text-3xl font-light text-[var(--text)]">${price.toFixed(2)}</span><span className="text-[var(--text-secondary)] ml-1">/mo</span></div>
                </div>

                <button type="submit" disabled={!isReady || loading}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-[var(--accent)] text-white font-semibold text-base hover:bg-[var(--accent)]/90 active:scale-[0.98] transition-all shadow-lg shadow-[var(--accent)]/20 disabled:opacity-50 disabled:cursor-not-allowed group">
                  {loading
                    ? <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    : contact === "email"
                      ? <><Mail size={18} /> Send me payment instructions <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>
                      : <><MessageCircle size={18} className="fill-current" /> Continue on WhatsApp <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>}
                </button>

                <div className="space-y-2">
                  {[
                    { icon: <ShieldCheck size={12} />, text: "Secure — no card details stored" },
                    { icon: <Clock size={12} />,        text: "Account activated instantly after payment" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                      <span className="text-[var(--accent)]">{icon}</span>{text}
                    </div>
                  ))}
                </div>
                <p className="text-center text-[10px] text-[var(--text-tertiary)]">No auto-renewals · Cancel anytime</p>
              </div>

            </form>
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-[var(--text-secondary)]">
        {label}{required && <span className="text-[var(--accent)] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inp = "w-full h-10 px-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors";
