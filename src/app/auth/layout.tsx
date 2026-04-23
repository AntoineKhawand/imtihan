import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col selection:bg-[var(--accent)]/10 selection:text-[var(--accent)] relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[var(--accent)] opacity-[0.03] blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-400 opacity-[0.02] blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="grain absolute inset-0 opacity-40 pointer-events-none" />

      <header className="relative flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)] bg-[var(--bg)]/50 backdrop-blur-xl sticky top-0 z-40">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-all duration-200"
        >
          <ArrowLeft size={16} />
          <span className="text-sm hidden sm:block font-medium">Back</span>
        </Link>
        <Logo size={28} />
        <div className="w-20 hidden sm:block" />
      </header>

      <main className="relative flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      <footer className="relative py-8 text-center text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest">
        Secure & Certified for Lebanese Curricula
      </footer>
    </div>
  );
}
