"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { BookOpen, BarChart2, LogOut, GraduationCap } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { StudentAuthProvider, useStudentAuth } from "@/lib/studentAuth";
import { cn } from "@/lib/utils";

// ─── Inner layout (needs access to StudentAuth hook) ──────────────────────────

function StudentLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, studentProfile, loading, signOut } = useStudentAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect unauthenticated users to student login
  // (except on the login page itself)
  useEffect(() => {
    if (loading) return;
    const isLoginPage = pathname === "/student/login";
    if (!isLoginPage && (!user || !studentProfile)) {
      router.replace("/student/login");
    }
  }, [loading, user, studentProfile, pathname, router]);

  const isLoginPage = pathname === "/student/login";

  // Show bare layout for the login page (no nav needed)
  if (isLoginPage) return <>{children}</>;

  // Show spinner while checking auth
  if (loading || !studentProfile) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const navLinks = [
    { href: "/student/practice", label: "Practice", icon: BookOpen },
    { href: "/student/dashboard", label: "Dashboard", icon: BarChart2 },
  ];

  const initials = studentProfile.displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleLogout() {
    await signOut();
    router.replace("/student/login");
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Top nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between h-14 px-6 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Logo size={26} />

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  pathname.startsWith(href)
                    ? "bg-[var(--accent-light)] text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]"
                )}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-xs font-semibold text-[var(--text)]">
              {studentProfile.displayName}
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide flex items-center gap-0.5">
              <GraduationCap size={9} /> Student
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Sign out"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-[var(--border)] bg-[var(--surface)]">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] font-semibold transition-colors",
              pathname.startsWith(href)
                ? "text-[var(--accent)]"
                : "text-[var(--text-tertiary)]"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </div>

      {/* Page content */}
      <main className="flex-1 pb-20 sm:pb-8">{children}</main>
    </div>
  );
}

// ─── Outer layout (provides StudentAuth context) ───────────────────────────────

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentAuthProvider>
      <StudentLayoutInner>{children}</StudentLayoutInner>
    </StudentAuthProvider>
  );
}
