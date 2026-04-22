import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col selection:bg-[var(--accent)]/10 selection:text-[var(--accent)]">
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft size={16} aria-label="Back to home page" />
          <span className="text-sm hidden sm:block">Back</span>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white text-xs font-serif">إ</span>
          </div>
          <span className="font-semibold text-sm text-[var(--text)] tracking-tight">Imtihan</span>
        </Link>
        <div className="w-20" /> {/* Spacer to center the logo */}
      </header>
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        {children}
      </main>
    </div>
  );
}
