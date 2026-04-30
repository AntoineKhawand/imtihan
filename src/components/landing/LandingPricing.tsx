"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const MONTHLY_PRICE = 5.99;
const YEARLY_PRICE_PER_MONTH = 3.99;
const YEARLY_TOTAL = +(YEARLY_PRICE_PER_MONTH * 12).toFixed(2);
const YEARLY_SAVING_PCT = Math.round((1 - YEARLY_PRICE_PER_MONTH / MONTHLY_PRICE) * 100);

export function LandingPricing({ isAuthenticated }: { isAuthenticated?: boolean }) {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="relative px-6 md:px-10 py-32 border-t border-[var(--border)] bg-[var(--bg-subtle)] overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[var(--accent)] opacity-[0.03] blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-400 opacity-[0.02] blur-[120px] rounded-full translate-y-1/2 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent)]/10 text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--accent)] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            Pricing Plans
          </div>
          <h2 className="serif text-display-lg text-[var(--text)] text-balance mb-6 leading-[1.1]">
            Start free, upgrade when<br />you&apos;re convinced
          </h2>
          <p className="text-sm md:text-base text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed text-pretty">
            Transparent pricing designed for individual teachers and institutions. 
            No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-5 mb-16">
          <button 
            onClick={() => setYearly(false)}
            className={`text-sm font-semibold transition-all ${!yearly ? "text-[var(--text)] scale-105" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"}`}
          >
            Monthly
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={yearly}
            onClick={() => setYearly(!yearly)}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 shadow-inner group ${
              yearly ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 group-hover:scale-110 ${
                yearly ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setYearly(true)}
              className={`text-sm font-semibold transition-all ${yearly ? "text-[var(--text)] scale-105" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"}`}
            >
              Yearly
            </button>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold tracking-wider ring-1 ring-emerald-500/20">
              SAVE {YEARLY_SAVING_PCT}%
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {/* Free Tier */}
          <div className="group relative flex flex-col p-8 md:p-10 rounded-[2rem] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all duration-500 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)]">
            <div className="mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-4 block">Free Plan</span>
              <div className="flex items-baseline gap-1">
                <span className="serif text-5xl font-normal text-[var(--text)]">Free</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-3">Perfect for testing the waters</p>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {[
                "2 complete exams + corrigés",
                "All curricula & subjects",
                "Word + PDF export",
                "Version A/B generation",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                  <div className="mt-1 w-4 h-4 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                    <Check size={10} strokeWidth={3} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href={isAuthenticated ? "/create" : "/auth/login"}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--bg-subtle)] hover:border-[var(--border-strong)] active:scale-[0.98] transition-all duration-300"
            >
              Get started free
            </Link>
          </div>

          {/* Pro Tier (Featured) */}
          <div className="group relative flex flex-col p-8 md:p-10 rounded-[2rem] bg-[var(--accent-light)] border-[1.5px] border-[var(--accent)] shadow-[0_20px_50px_-20px_rgba(26,94,63,0.15)] lg:scale-105 z-10 hover:shadow-[0_30px_70px_-20px_rgba(26,94,63,0.25)] transition-all duration-500">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[var(--accent)]/20">
              Most Popular
            </div>

            <div className="mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-4 block">Pro Teacher</span>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold text-[var(--text)] opacity-40">$</span>
                  <span className="serif text-5xl font-normal text-[var(--text)]">
                    {yearly ? YEARLY_PRICE_PER_MONTH.toFixed(2) : MONTHLY_PRICE.toFixed(2)}
                  </span>
                  <span className="text-lg text-[var(--text-secondary)] font-medium">/mo</span>
                </div>
                {yearly && (
                  <span className="text-xs font-semibold text-emerald-600 animate-in fade-in slide-in-from-top-1">
                    Billed annually ($ {YEARLY_TOTAL})
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-3">Full access for serious educators</p>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {[
                "100 exams per month",
                "All curricula & subjects",
                "Corrigé included per exam",
                "Word + PDF export",
                "Saved exam library",
                "Community exam library",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                  <div className="mt-1 w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-[var(--accent)]/20">
                    <Check size={10} strokeWidth={3} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href={isAuthenticated ? "/upgrade" : "/auth/login"}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-[var(--accent)] text-white text-sm font-bold hover:bg-[var(--accent)]/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-[var(--accent)]/20"
            >
              Get Pro Access <ArrowRight size={16} />
            </Link>
          </div>

          {/* School Tier */}
          <div className="group relative flex flex-col p-8 md:p-10 rounded-[2rem] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all duration-500 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)]">
            <div className="mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-4 block">Institutions</span>
              <div className="flex items-baseline gap-1">
                <span className="serif text-5xl font-normal text-[var(--text)]">Custom</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-3">Tailored for entire schools</p>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {[
                "Bulk teacher licenses",
                "Centralized administration",
                "Custom school headers",
                "Shared question database",
                "Onboarding & training",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                  <div className="mt-1 w-4 h-4 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-tertiary)] flex items-center justify-center flex-shrink-0">
                    <Check size={10} strokeWidth={3} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/contact"
              className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--bg-subtle)] hover:border-[var(--border-strong)] active:scale-[0.98] transition-all duration-300"
            >
              Contact Sales
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
