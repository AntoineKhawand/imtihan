import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function PublicFooter() {
  return (
    <footer className="px-6 md:px-10 py-16 border-t border-[var(--border)] bg-[var(--bg)]">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6">
        <Logo size={28} />
        
        <p className="text-xs text-[var(--text-tertiary)] text-center order-3 md:order-2 font-medium">
          Made for Lebanese teachers · © {new Date().getFullYear()} Imtihan
        </p>

        <div className="flex items-center justify-center gap-6 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest order-2 md:order-3">
          <Link href="/blog" className="hover:text-[var(--text)] transition-colors">Blog</Link>
          <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-[var(--text)] transition-colors">Terms</Link>
          <Link href="/contact" className="hover:text-[var(--text)] transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
