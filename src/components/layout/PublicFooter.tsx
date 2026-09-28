import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function PublicFooter() {
  return (
    <footer className="px-6 md:px-10 py-16 border-t border-[var(--border)] bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
          <div className="md:w-1/4">
            <Logo size={26} />
          </div>

          <p className="text-[11px] text-[var(--text-tertiary)] text-center font-bold uppercase tracking-widest md:flex-1">
            Made for Lebanese teachers · © {new Date().getFullYear()} Imtihan
          </p>

          <div className="flex items-center justify-end gap-5 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest md:w-1/4">
            <Link href="/about" className="hover:text-[var(--text)] transition-colors">About</Link>
            <Link href="/pricing" className="hover:text-[var(--text)] transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-[var(--text)] transition-colors">Blog</Link>
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text)] transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-[var(--text)] transition-colors">Contact</Link>
          </div>
        </div>

        {/* Curricula/exam-generator landing pages — these are otherwise only
            linked once, from the homepage hero strip (added 2026-09-18), which
            GSC URL Inspection shows isn't enough internal-link signal for 3 of
            the 4 to get indexed at all (2026-09-27/2026-09-28 findings, see
            SEO_STRATEGY.md). Rendering here puts a real crawlable link on
            every marketing/blog page (currently 12+, including every one of
            the 37 blog posts) instead of just the homepage. */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-8 border-t border-[var(--border)]/60 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">
          <span className="text-[var(--text-tertiary)]/60 normal-case font-bold tracking-normal">Exam generators:</span>
          <Link href="/generateur-examen-bac-libanais" className="hover:text-[var(--text)] transition-colors">Bac Libanais</Link>
          <Link href="/bac-francais-exam-generator" className="hover:text-[var(--text)] transition-colors">Bac Français</Link>
          <Link href="/ib-exam-generator" className="hover:text-[var(--text)] transition-colors">IB Diploma</Link>
          <Link href="/ai-exam-generator-lebanon" className="hover:text-[var(--text)] transition-colors">Lebanon AI Generator</Link>
        </div>
      </div>
    </footer>
  );
}
