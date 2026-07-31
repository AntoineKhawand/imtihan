"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { UserNav } from "@/components/layout/UserNav";

interface LandingNavProps {
  isAuthenticated: boolean;
}

const NAV_LINKS = [
  { href: "#how",          label: "How it works" },
  { href: "#subjects",     label: "Subjects"      },
  { href: "#testimonials", label: "Reviews"       },
  { href: "#pricing",      label: "Pricing"       },
];

export function LandingNav({ isAuthenticated }: LandingNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]/60 transition-colors">
      <div className="flex items-center justify-between px-6 md:px-10 h-16">
        <Logo size={26} />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-[var(--text-secondary)]">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative hover:text-[var(--accent)] transition-colors duration-200 group"
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-[var(--accent)] rounded-full transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <UserNav />
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden md:inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors duration-200"
              >
                Sign in
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-[0_4px_16px_rgba(79,70,229,0.30)]"
              >
                Try free <ArrowRight size={14} />
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--accent)] transition-all duration-200"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-xl px-6 py-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center h-10 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] rounded-xl px-3 transition-all duration-150"
            >
              {link.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <div className="pt-2 border-t border-[var(--border)]">
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 h-10 w-full rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all duration-200"
              >
                Sign in or try free <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
