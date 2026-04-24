"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

const FEATURES_FREE = [
  "3 complete exams to try everything",
  "All curricula & subjects",
  "Word + PDF export",
  "Version A/B generation",
];

const FEATURES_PRO = [
  "100 exams per month",
  "All curricula & subjects",
  "Exam library — saved forever",
  "Priority AI generation",
  "Email delivery",
  "Early access to new features",
];

const MONTHLY_PRICE = 5.99;
const YEARLY_PRICE_PER_MONTH = 3.99;
const YEARLY_TOTAL = +(YEARLY_PRICE_PER_MONTH * 12).toFixed(2); // 47.88
const YEARLY_SAVING_PCT = Math.round((1 - YEARLY_PRICE_PER_MONTH / MONTHLY_PRICE) * 100); // 33

export default function PricingPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [yearly, setYearly] = useState(false);

  const isPro = !!(profile?.proExpiresAt && profile.proExpiresAt > Date.now());

  async function handleUpgrade() {
    if (!user) {
      router.push("/auth/register?redirect=/pricing");
      return;
    }

    setLoading(true);
    try {
      const origin = window.location.origin;
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yearly,
          successUrl: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/pricing/cancel`,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to start checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white font-serif text-xs">إ</span>
          </div>
          <span className="font-semibold text-[var(--text)] text-sm tracking-tight">Imtihan</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="secondary" size="sm">Back to home</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 md:px-10 py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-4">Pricing</p>
          <h1 className="serif text-display-lg text-[var(--text)] mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Start free, upgrade when you&apos;re convinced. Cancel anytime.
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
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                yearly ? "translate-x-6" : "translate-x-0"
              }`}
            />
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
            <div className="serif text-4xl font-light text-[var(--text)] mb-1">3 Free</div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">3 exams to try everything</p>
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
          <div className="relative card p-8 border-[var(--accent)]/80 ring-2 ring-[var(--accent)]/20 bg-[var(--accent-light)] flex flex-col">
            <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-[var(--accent)] text-white text-xs font-medium">
              Pro
            </div>
            <p className="text-xs uppercase tracking-wider text-[var(--accent)] font-medium mb-4">Individual</p>

            {/* Price */}
            <div className="mb-1">
              {yearly ? (
                <div className="flex items-end gap-2">
                  <span className="serif text-4xl font-light text-[var(--text)]">
                    ${YEARLY_PRICE_PER_MONTH.toFixed(2)}
                  </span>
                  <span className="text-lg text-[var(--text-secondary)] mb-1">/mo</span>
                  <span className="text-sm text-[var(--text-tertiary)] line-through mb-1.5 ml-1">
                    ${MONTHLY_PRICE.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <span className="serif text-4xl font-light text-[var(--text)]">
                    ${MONTHLY_PRICE.toFixed(2)}
                  </span>
                  <span className="text-lg text-[var(--text-secondary)] mb-1">/mo</span>
                </div>
              )}
            </div>

            <p className="text-sm text-[var(--text-secondary)] mb-1">
              {yearly
                ? `Billed $${YEARLY_TOTAL}/year — 4 months free`
                : "Billed monthly, cancel anytime"}
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
                <Zap size={14} /> Active
              </div>
            ) : (
              <Button
                onClick={handleUpgrade}
                disabled={loading}
                icon={loading ? undefined : <ArrowRight size={14} />}
                className="w-full justify-center"
              >
                {loading ? "Loading..." : `Upgrade to Pro — ${yearly ? `$${YEARLY_TOTAL}/yr` : `$${MONTHLY_PRICE}/mo`}`}
              </Button>
            )}
          </div>
        </div>

        {/* Trust line */}
        <p className="text-center text-xs text-[var(--text-tertiary)] mt-8">
          No credit card required to start · Secure payment via Stripe · Cancel anytime
        </p>
      </main>
    </div>
  );
}
