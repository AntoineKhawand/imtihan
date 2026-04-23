"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LogOut, LayoutDashboard, Plus } from "lucide-react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function UserNav() {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] animate-pulse" />;
  if (!user) {
    return (
      <Link href="/auth/login" className="text-sm font-medium text-[var(--accent)] hover:underline">
        Sign in
      </Link>
    );
  }

  const initials = profile?.displayName
    ? profile.displayName.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() || "U";

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-end hidden sm:flex">
        <span className="text-xs font-semibold text-[var(--text)]">{profile?.displayName || user.email?.split("@")[0]}</span>
        <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">{profile?.subscription?.tier || "Free"} tier</span>
      </div>
      <div className="relative group">
        <button className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
          {initials}
        </button>
        
        {/* Dropdown */}
        <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1">
          <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
            <p className="text-xs font-medium text-[var(--text-tertiary)] truncate">{user.email}</p>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)] transition-colors">
            <LayoutDashboard size={14} /> Dashboard
          </Link>
          <Link href="/create" className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)] transition-colors">
            <Plus size={14} /> New Exam
          </Link>
          <div className="h-px bg-[var(--border)] my-1" />
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
