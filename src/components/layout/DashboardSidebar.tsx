"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  Bookmark,
  Search,
  CheckCircle2,
  TrendingUp,
  Users,
  Globe,
  Sparkles,
  Settings,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { isProActive, isInGracePeriod } from "@/lib/subscription";

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "New Exam", icon: Plus, href: "/create", highlight: true },
  { label: "Question Bank", icon: Bookmark, href: "/bank" },
  { label: "Students", icon: Users, href: "/teacher/students" },
  { label: "AI Scanner", icon: Search, href: "/scanner", pro: true },
  { label: "Analytics", icon: TrendingUp, href: "/analytics", pro: true },
  { label: "Community", icon: Globe, href: "/community" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();
  const isPro = isProActive(profile) || isInGracePeriod(profile);

  // AuthContext flips `loading` to false as soon as Firebase Auth resolves,
  // without waiting for the Firestore profile onSnapshot to deliver its
  // first payload (see AuthContext.subscribeToProfile). In that window,
  // `user` is set but `profile` is still null — treating that as "not pro"
  // would flash the "Upgrade to Pro" CTA for a genuinely-Pro user before the
  // real profile arrives. Keep waiting instead of guessing (mirrors ProGuard).
  const profileResolving = loading || (!!user && !profile);
  const showUpgradeCta = !profileResolving && !isPro;
  const showProBadge = (item: { pro?: boolean }) => !profileResolving && item.pro && !isPro;

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[var(--border)] bg-[var(--surface)] h-[calc(100vh-64px)] sticky top-16 z-30">
      <div className="flex-1 py-6 px-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/25 scale-[1.01]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]",
                item.highlight && !isActive && "border border-[var(--accent)]/30 bg-[var(--accent-light)]/30 text-[var(--accent)]"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={cn(
                  "transition-transform",
                  isActive ? "scale-110" : "group-hover:scale-110",
                  item.highlight && !isActive && "text-[var(--accent)]"
                )} />
                {item.label}
              </div>
              {!isActive && showProBadge(item) && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 uppercase tracking-wider">
                  Pro
                </span>
              )}
              {item.highlight && !isActive && (
                <Sparkles size={12} className="text-[var(--accent)] animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>

      {showUpgradeCta && (
        <div className="p-4 border-t border-[var(--border)]">
          <Link
            href="/upgrade"
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold bg-gradient-to-br from-[var(--accent)] to-[#185c3f] text-white shadow-lg shadow-[var(--accent)]/25 hover:scale-[1.02] hover:shadow-[var(--accent)]/35 active:scale-[0.99] transition-all duration-200 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine" />
            <CreditCard size={18} />
            Upgrade to Pro
          </Link>
        </div>
      )}
    </aside>
  );
}
