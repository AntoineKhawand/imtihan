import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft size={16} />
          <span className="text-sm hidden sm:block">Back to home</span>
        </Link>
        <Logo size={28} />
        <div className="w-20" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-8 w-20 h-20 rounded-3xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center">
          <FileQuestion size={32} className="text-[var(--text-tertiary)]" />
        </div>

        <p className="serif text-7xl font-light text-[var(--accent)] mb-4 tabular-nums">404</p>
        <h1 className="serif text-display-lg text-[var(--text)] mb-3">Page not found</h1>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-sm mb-10">
          This page doesn&apos;t exist or has been moved. Go back to the homepage or start generating a new exam.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-colors"
          >
            <ArrowLeft size={14} />
            Go home
          </Link>
          <Link
            href="/create"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Create an exam
          </Link>
        </div>
      </main>
    </div>
  );
}
