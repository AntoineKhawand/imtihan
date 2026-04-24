import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bg)]">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative flex-col justify-between p-14 overflow-hidden bg-[#0a0a0a]">

        {/* Gradient blobs */}
        <div className="absolute top-[-120px] left-[-80px] w-[500px] h-[500px] rounded-full bg-[var(--accent)] opacity-[0.18] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-60px] w-[400px] h-[400px] rounded-full bg-violet-500 opacity-[0.12] blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.06),transparent_60%)] pointer-events-none" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo size={36} showText={false} />
            <span className="text-white font-bold text-lg tracking-tight">Imtihan</span>
          </Link>
        </div>

        {/* Middle: Hero copy */}
        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Trusted by Lebanese educators
            </div>
            <h2 className="serif text-4xl xl:text-5xl font-normal text-white leading-[1.1] tracking-tight">
              Generate exams<br />
              in <span className="italic text-[var(--accent)]">seconds</span>,<br />
              not hours.
            </h2>
            <p className="text-sm text-white/50 leading-relaxed max-w-[280px]">
              Curriculum-aligned AI for Bac Libanais, Bac Français, IB, and university teachers across Lebanon.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              "Aligned to Lebanese & French curricula",
              "Export to Word in one click",
              "2 free exams — no credit card",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30 flex items-center justify-center">
                  <svg viewBox="0 0 10 10" className="w-3 h-3 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[13px] text-white/60">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Testimonial */}
        <div className="relative z-10">
          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
            <div className="flex gap-0.5 mb-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} viewBox="0 0 12 12" className="w-3 h-3 text-amber-400 fill-amber-400">
                  <path d="M6 1l1.3 2.7 3 .4-2.2 2.1.5 3L6 7.8 3.4 9.2l.5-3L1.7 4.1l3-.4z" />
                </svg>
              ))}
            </div>
            <p className="text-[13px] text-white/60 leading-relaxed italic mb-4">
              "Imtihan saved me hours every week. The questions match exactly what my students need for the Bac."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-[10px]">
                PK
              </div>
              <div>
                <p className="text-[12px] font-semibold text-white/80">Prof. Khalil</p>
                <p className="text-[11px] text-white/30">Lycée Français de Beyrouth</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col min-h-screen">

        <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-[var(--border)]/40">
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors duration-200 text-sm font-medium"
          >
            <ArrowLeft size={15} />
            Back to site
          </Link>
          <div className="w-24" />
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-3 duration-700">
            {children}
          </div>
        </main>

        <footer className="py-6 text-center text-[11px] text-[var(--text-tertiary)]">
          © {new Date().getFullYear()} Imtihan — Built for Education
        </footer>
      </div>
    </div>
  );
}
