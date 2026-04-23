import Link from "next/link";
import { ArrowLeft, Quote, Star } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col md:flex-row selection:bg-[var(--accent)]/10 selection:text-[var(--accent)] relative overflow-hidden font-sans">
      {/* Background blobs for depth */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-[var(--accent)] opacity-[0.03] blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-violet-400 opacity-[0.02] blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="grain absolute inset-0 opacity-[0.015] pointer-events-none" />

      {/* Left side - Visual & Branding (Desktop only) */}
      <div className="hidden lg:flex w-[40%] bg-[var(--bg-subtle)] border-r border-[var(--border)]/60 relative flex-col justify-between p-12 overflow-hidden">
        {/* Subtle mesh gradient background for the side panel */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_50%_-20%,var(--accent),transparent),radial-gradient(circle_at_100%_100%,var(--accent),transparent)]" />
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-24 hover:opacity-80 transition-opacity">
            <Logo size={32} />
          </Link>

          <div className="max-w-xs space-y-6">
            <div className="w-12 h-1 bg-[var(--accent)] rounded-full opacity-30" />
            <h2 className="serif text-display-md text-[var(--text)] leading-[1.1]">
              Empowering teachers with <span className="italic text-[var(--accent)]">precise</span> AI.
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Join thousands of Lebanese educators building curriculum-aligned exams in seconds.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="p-6 rounded-3xl bg-[var(--surface)]/50 backdrop-blur-md border border-[var(--border)]/40 shadow-sm">
            <Quote size={20} className="text-[var(--accent)] opacity-20 mb-4" />
            <p className="text-sm italic text-[var(--text-secondary)] leading-relaxed mb-4">
              "Imtihan has saved me hours of formatting. The physics problems are exactly what my Terminale students need."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[var(--accent)] font-bold text-[10px]">
                PK
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[var(--text)]">Prof. Khalil</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">Lycée Français de Beyrouth</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] font-bold">
            <div className="flex items-center gap-1.5">
              <Star size={10} className="text-[var(--accent)] fill-[var(--accent)]" />
              <span>Certified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star size={10} className="text-[var(--accent)] fill-[var(--accent)]" />
              <span>Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Forms */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        <header className="flex items-center justify-between px-6 md:px-10 h-16 bg-transparent">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-all duration-200"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Back to site</span>
          </Link>
          <div className="lg:hidden">
            <Logo size={28} />
          </div>
          <div className="w-20" />
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-12 md:py-20">
          <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
            {children}
          </div>
        </main>

        <footer className="py-8 text-center text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.2em] font-bold opacity-40">
          Imtihan &copy; {new Date().getFullYear()} — Built for Education
        </footer>
      </div>
    </div>
  );
}
