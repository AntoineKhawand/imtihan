"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const MONTHLY_PRICE = 5.99;
const YEARLY_PRICE_PER_MONTH = 3.99;
const YEARLY_TOTAL = +(YEARLY_PRICE_PER_MONTH * 12).toFixed(2);
const YEARLY_SAVING_PCT = Math.round((1 - YEARLY_PRICE_PER_MONTH / MONTHLY_PRICE) * 100);

export function LandingPricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="px-6 md:px-10 py-32 border-t border-[var(--border)] bg-[var(--bg-subtle)]">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-4">Pricing</p>
          <h2 className="serif text-display-lg text-[var(--text)] text-balance mb-4">
            Start free, upgrade when you&apos;re convinced
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            Simple pricing for individuals. For school-wide licenses, get in touch.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-14">
          <span className={`text-sm font-medium transition-colors ${!yearly ? "text-[var(--text)]" : "text-[var(--text-tertiary)]"}`}>
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={yearly}
            onClick={() => setYearly(!yearly)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${
              yearly ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                yearly ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
          <div className="flex items-center gap-2.5">
            <span className={`text-sm font-medium transition-colors ${yearly ? "text-[var(--text)]" : "text-[var(--text-tertiary)]"}`}>
              Yearly
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold tracking-wide">
              Save {YEARLY_SAVING_PCT}%
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">

          {/* Free */}
          <div className="card p-10 flex flex-col bg-[var(--surface)] hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.05] transition-all duration-300">
            <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-5">Free</p>
            <div className="serif text-5xl font-light text-[var(--text)] mb-1">2 Free</div>
            <p className="text-sm text-[var(--text-secondary)] mb-8">2 exams to try everything</p>
            <ul className="space-y-4 mb-10 flex-1">
              {[
                "2 complete exams + corrigés",
                "All curricula & subjects",
                "Word + PDF export",
                "Version A/B generation",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                    <Check size={11} strokeWidth={2.5} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/create"
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] active:scale-[0.98] transition-all duration-300"
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="relative card p-10 pt-12 border-[var(--accent)]/80 ring-2 ring-[var(--accent)]/20 bg-[var(--accent-light)] shadow-lg shadow-[var(--accent)]/10 flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--accent)]/20 transition-all duration-300">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[var(--accent)] text-white text-xs font-semibold shadow-md shadow-[var(--accent)]/30 whitespace-nowrap">
              Most popular
            </div>

            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-5">Pro</p>

            {/* Price */}
            <div className="mb-2">
              {yearly ? (
                <div className="flex items-end gap-2 flex-wrap">
                  <span className="serif text-5xl font-light text-[var(--text)]">${YEARLY_PRICE_PER_MONTH.toFixed(2)}</span>
                  <span className="text-xl text-[var(--text-secondary)] mb-1">/mo</span>
                  <span className="text-sm text-[var(--text-tertiary)] line-through mb-2">${MONTHLY_PRICE.toFixed(2)}</span>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <span className="serif text-5xl font-light text-[var(--text)]">${MONTHLY_PRICE.toFixed(2)}</span>
                  <span className="text-xl text-[var(--text-secondary)] mb-1">/mo</span>
                </div>
              )}
            </div>

            <p className="text-sm text-[var(--text-secondary)] mb-1">
              {yearly ? `Billed $${YEARLY_TOTAL}/year — 4 months free` : "Billed monthly, cancel anytime"}
            </p>
            {yearly ? (
              <p className="text-xs font-semibold text-emerald-600 mb-8">
                You save ${(MONTHLY_PRICE * 12 - YEARLY_TOTAL).toFixed(2)}/year
              </p>
            ) : (
              <div className="mb-8" />
            )}

            <ul className="space-y-4 flex-1 mb-10">
              {[
                "100 exams per month",
                "All curricula & subjects",
                "Exam library — saved forever",
                "Priority AI generation",
                "Email delivery",
                "Early access to new features",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center flex-shrink-0">
                    <Check size={11} strokeWidth={2.5} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/auth/register"
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent)]/90 active:scale-[0.98] transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-[var(--accent)]/20"
            >
              Upgrade to Pro <ArrowRight size={15} />
            </Link>
          </div>

          {/* Schools */}
          <div className="card p-10 flex flex-col bg-[var(--surface)] md:col-span-2 lg:col-span-1 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.05] transition-all duration-300">
            <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-5">Schools</p>
            <div className="serif text-5xl font-light text-[var(--text)] mb-1">Custom</div>
            <p className="text-sm text-[var(--text-secondary)] mb-8">For departments and institutions</p>
            <ul className="space-y-4 mb-10 flex-1">
              {[
                "Everything in Pro",
                "Centralized billing",
                "Multiple teacher accounts",
                "Shared question bank (v2)",
                "Dedicated support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <span className="w-5 h-5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-secondary)] flex items-center justify-center flex-shrink-0">
                    <Check size={11} strokeWidth={2.5} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] active:scale-[0.98] transition-all duration-300"
            >
              Contact sales
            </Link>
          </div>

        </div>

        {/* Trust line */}
        <p className="text-center text-xs text-[var(--text-tertiary)] mt-10">
          No credit card required to start · Secure payment · Cancel anytime
        </p>

      </div>
    </section>
  );
}
