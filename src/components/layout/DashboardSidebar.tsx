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
  Sparkles,
  Settings,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "New Exam", icon: Plus, href: "/create", highlight: true },
  { label: "Question Bank", icon: Bookmark, href: "/bank" },
  { label: "AI Scanner", icon: Search, href: "/scanner", pro: true },
  { label: "AI Grading", icon: CheckCircle2, href: "/grade", pro: true },
  { label: "Analytics", icon: TrendingUp, href: "/analytics", pro: true },
  { label: "Community", icon: Users, href: "/community" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

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
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive 
                  ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20" 
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]",
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
              {item.pro && !isActive && (
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

      <div className="p-4 border-t border-[var(--border)]">
        <Link 
          href="/upgrade"
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-200 hover:scale-[1.02] transition-transform"
        >
          <CreditCard size={18} />
          Upgrade to Pro
        </Link>
      </div>
    </aside>
  );
}
