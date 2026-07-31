"use client";

import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { UserNav } from "@/components/layout/UserNav";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <Logo size={26} />
        <div className="flex items-center gap-4">
          <Link href="/create">
            <Button size="sm" icon={<Plus size={13} />}>New exam</Button>
          </Link>
          <UserNav />
        </div>
      </nav>
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
