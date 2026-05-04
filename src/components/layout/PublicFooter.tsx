import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function PublicFooter() {
  return (
    <footer className="px-6 md:px-10 py-16 border-t border-[var(--border)] bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
        <div className="md:w-1/4">
          <Logo size={26} />
        </div>
        
        <p className="text-[11px] text-[var(--text-tertiary)] text-center font-bold uppercase tracking-widest md:flex-1">
          Made for Lebanese teachers · © {new Date().getFullYear()} Imtihan
        </p>

        <div className="flex items-center justify-end gap-5 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest md:w-1/4">
          <Link href="/blog" className="hover:text-[var(--text)] transition-colors">Blog</Link>
          <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-[var(--text)] transition-colors">Terms</Link>
          <Link href="/contact" className="hover:text-[var(--text)] transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
