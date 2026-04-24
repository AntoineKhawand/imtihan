"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isProActive, getWhatsAppUpgradeLink } from "@/lib/subscription";
import { Logo } from "@/components/ui/Logo";

const FEATURES_FREE = [
  "2 complete exams + corrigés",
  "All curricula & subjects",
  "Word + PDF export",
  "Version A/B generation",
];

const FEATURES_PRO = [
  "100 exams per month",
  "All curricula & subjects",
  "Corrigé included per exam",
  "Word + PDF export",
  "Saved exam library",
  "Community exam library",
];

const MONTHLY_PRICE = 5.99;
const YEARLY_PRICE_PER_MONTH = 3.99;
const YEARLY_TOTAL = +(YEARLY_PRICE_PER_MONTH * 12).toFixed(2);
const YEARLY_SAVING_PCT = Math.round((1 - YEARLY_PRICE_PER_MONTH / MONTHLY_PRICE) * 100);

export default function PricingPage() {
  const { user, profile } = useAuth();
  const [yearly, setYearly] = useState(false);

  const isPro = isProActive(profile);

  function handleUpgrade() {
    if (!user) {
      window.location.href = "/auth/register";
      return;
    }
    const price = yearly ? `$${YEARLY_TOTAL}/year` : `$${MONTHLY_PRICE}/month`;
    const link = getWhatsAppUpgradeLink(user.email ?? "");
    // Append plan type to the WhatsApp message
    const number = link.split("?")[0].replace("https://wa.me/", "");
    const text = encodeURIComponent(
      `Hello! I would like to upgrade to Imtihan Pro (${price}).\nMy account email is: ${user.email ?? ""}`
    );
    window.open(`https://wa.me/${number}?text=${text}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)]">
        <Logo size={28} />
        <Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
          ← Back to home
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 md:px-10 py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-4">Pricing</p>
          <h1 className="serif text-display-lg text-[var(--text)] mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto text-sm leading-relaxed">
            Start free, upgrade when you&apos;re convinced. Pay via WhatsApp — no credit card forms.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className={`text-sm font-medium transition-colors ${!yearly ? "text-[var(--text)]" : "text-[var(--text-tertiary)]"}`}>
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={yearly}
            onClick={() => setYearly(!yearly)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${
              yearly ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${yearly ? "translate-x-6" : "translate-x-0"}`} />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium transition-colors ${yearly ? "text-[var(--text)]" : "text-[var(--text-tertiary)]"}`}>
              Yearly
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
              Save {YEARLY_SAVING_PCT}%
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Free */}
          <div className="card p-8 flex flex-col">
            <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-medium mb-4">Free</p>
            <div className="serif text-4xl font-light text-[var(--text)] mb-1">2 Free</div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">2 exams to try everything</p>
            <ul className="space-y-3 mb-8 flex-1">
              {FEATURES_FREE.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                  <span className="w-4 h-4 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    <Check size={10} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/create"
              className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] transition-all"
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="relative card p-8 border-[var(--accent)]/80 border-[1.5px] bg-[var(--accent-light)] flex flex-col shadow-lg shadow-[var(--accent)]/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--accent)] text-white text-xs font-medium shadow-sm whitespace-nowrap">
              Most popular
            </div>
            <p className="text-xs uppercase tracking-wider text-[var(--accent)] font-medium mb-4">Pro</p>

            <div className="mb-1">
              {yearly ? (
                <div className="flex items-end gap-2">
                  <span className="serif text-4xl font-light text-[var(--text)]">${YEARLY_PRICE_PER_MONTH.toFixed(2)}</span>
                  <span className="text-lg text-[var(--text-secondary)] mb-1">/mo</span>
                  <span className="text-sm text-[var(--text-tertiary)] line-through mb-1.5 ml-1">${MONTHLY_PRICE.toFixed(2)}</span>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <span className="serif text-4xl font-light text-[var(--text)]">${MONTHLY_PRICE.toFixed(2)}</span>
                  <span className="text-lg text-[var(--text-secondary)] mb-1">/mo</span>
                </div>
              )}
            </div>

            <p className="text-sm text-[var(--text-secondary)] mb-1">
              {yearly ? `Billed $${YEARLY_TOTAL}/year — 4 months free` : "Billed monthly via WhatsApp"}
            </p>
            {yearly && (
              <p className="text-xs font-semibold text-emerald-600 mb-5">
                You save ${(MONTHLY_PRICE * 12 - YEARLY_TOTAL).toFixed(2)}/year
              </p>
            )}

            <ul className={`space-y-3 flex-1 ${yearly ? "mb-6" : "mb-8"}`}>
              {FEATURES_PRO.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                  <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    <Check size={10} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {isPro ? (
              <div className="h-10 rounded-xl bg-[var(--accent)]/20 text-[var(--accent)] text-sm font-medium flex items-center justify-center gap-2">
                <Zap size={14} /> Active — Pro plan
              </div>
            ) : (
              <Link
                href="/upgrade"
                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent)]/90 active:scale-[0.98] transition-all shadow-sm"
              >
                Upgrade to Pro — {yearly ? `$${YEARLY_TOTAL}/yr` : `$${MONTHLY_PRICE}/mo`}
              </Link>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[var(--text-tertiary)] mt-8">
          Payment handled personally via WhatsApp · No credit card required
        </p>
      </main>
    </div>
  );
}
