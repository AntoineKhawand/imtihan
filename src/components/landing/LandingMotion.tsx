"use client";

/**
 * LandingMotion.tsx — thin client wrappers for Framer Motion animations
 * on the landing page.
 *
 * The landing page (page.tsx) is a server component for SEO.
 * All animation code lives here so it can be "use client" without
 * pulling the entire page into the client bundle.
 */

import { m, LazyMotion, domAnimation } from "framer-motion";
import { Sparkles, MessageSquare, SlidersHorizontal, Download } from "lucide-react";

// ── Hero badge + heading animation ──────────────────────────────────────────

export function MotionHero({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

// ── Stats grid animation ─────────────────────────────────────────────────────

interface StatItem {
  value: string;
  label: string;
  sub: string;
}

export function MotionStats({ stats }: { stats: StatItem[] }) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-16 border-t border-[var(--border)]"
      >
        {stats.map((stat, i) => (
          <m.div
            key={stat.label}
            className="group"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
          >
            <dl>
              <dt className="serif text-4xl font-light text-[var(--accent)] mb-1 group-hover:scale-105 transition-transform origin-left">
                {stat.value}
              </dt>
              <dd className="text-sm font-medium text-[var(--text)] mb-0.5">{stat.label}</dd>
              <dd className="text-xs text-[var(--text-tertiary)] leading-relaxed">{stat.sub}</dd>
            </dl>
          </m.div>
        ))}
      </m.div>
    </LazyMotion>
  );
}

// ── How It Works cards animation ─────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: MessageSquare,
    title: "Describe in plain language",
    body: "Type what you need — curriculum, level, subject, chapters, duration. Or just upload your course notes and let Imtihan read them.",
  },
  {
    step: "02",
    icon: SlidersHorizontal,
    title: "Review & fine-tune",
    body: "Confirm the detected context, adjust the difficulty mix, choose your exam structure and template. Full control, no forms to dig through.",
  },
  {
    step: "03",
    icon: Sparkles,
    title: "Generate in seconds",
    body: "Imtihan writes every exercise and its full corrigé — with methodology, not just the final answer. Watch it stream live.",
  },
  {
    step: "04",
    icon: Download,
    title: "Export & teach",
    body: "Download a polished Word or PDF with your school header. Ready to print in one click.",
  },
];

export function MotionHowItWorks() {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="grid md:grid-cols-4 gap-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {HOW_IT_WORKS.map((step, i) => (
          <m.div
            key={step.step}
            className="relative"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
          >
            {i < HOW_IT_WORKS.length - 1 && (
              <div className="hidden md:block absolute top-5 left-full w-6 border-t border-dashed border-[var(--border-strong)]" />
            )}
            <div className="card p-6 h-full bg-[var(--surface)] hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.05] transition-all duration-300 group ring-1 ring-black/[0.02]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <step.icon size={16} className="text-white" />
                </div>
                <span className="serif text-2xl font-light text-[var(--text-tertiary)]">{step.step}</span>
              </div>
              <h3 className="font-semibold text-[var(--text)] mb-2 leading-snug text-sm">{step.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{step.body}</p>
            </div>
          </m.div>
        ))}
      </m.div>
    </LazyMotion>
  );
}

// ── Demo streaming preview ────────────────────────────────────────────────────

export function MotionStreamingPreview() {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="p-6 md:p-10 min-h-[340px] flex flex-col gap-5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={{ visible: { transition: { staggerChildren: 0.8 } } }}
      >
        {/* User message */}
        <m.div
          className="flex items-start gap-3 justify-end"
          variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div className="flex-1 max-w-md bg-[var(--accent)] rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white leading-relaxed shadow-lg">
            Examen de Philosophie pour Terminale L Bac Libanais, chapitres éthique et épistémologie, 2
            exercices, 1h30, en français
          </div>
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 mt-1 text-xs text-[var(--text-secondary)] font-medium">
            T
          </div>
        </m.div>

        {/* AI context response */}
        <m.div
          className="flex items-start gap-3"
          variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center flex-shrink-0 mt-1">
            <span className="text-white text-xs font-serif">إ</span>
          </div>
          <div className="flex-1 bg-[var(--bg-subtle)] rounded-2xl rounded-tl-sm px-4 py-4 shadow-lg">
            <p className="text-xs text-[var(--text-tertiary)] mb-3 font-medium uppercase tracking-wide">
              Exam context identified
            </p>
            <m.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2.5 mb-4"
            >
              {[
                ["Curriculum", "Bac Libanais"],
                ["Level", "Terminale L"],
                ["Subject", "Philosophie"],
                ["Language", "Français"],
                ["Duration", "1h 30"],
                ["Exercises", "2"],
              ].map(([k, v]) => (
                <m.div
                  key={k}
                  className="flex flex-col gap-0.5"
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                >
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide">{k}</span>
                  <span className="text-xs font-semibold text-[var(--text)]">{v}</span>
                </m.div>
              ))}
            </m.div>
            <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]">
              <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-xs text-[var(--accent)] font-medium">High confidence · Generating exam…</span>
            </div>
          </div>
        </m.div>

        {/* Streaming skeleton */}
        <m.div
          className="flex items-start gap-3"
          variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0 mt-1">
            <Sparkles size={14} className="text-[var(--accent)]" />
          </div>
          <div className="flex-1 bg-[var(--bg-subtle)] rounded-2xl rounded-tl-sm px-4 py-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-xs font-medium text-[var(--accent)]">Exercice 1 — Éthique et liberté</span>
              <span className="text-[10px] text-[var(--text-tertiary)] ml-auto">8 pts · Moyen</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-2.5 bg-[var(--border)] rounded w-full animate-pulse" style={{ animationDelay: "0.1s" }} />
              <div className="h-2.5 bg-[var(--border)] rounded w-4/5 animate-pulse" style={{ animationDelay: "0.2s" }} />
              <div className="h-2.5 bg-[var(--border)] rounded w-3/5 animate-pulse" style={{ animationDelay: "0.3s" }} />
            </div>
          </div>
        </m.div>
      </m.div>
    </LazyMotion>
  );
}
