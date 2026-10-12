import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function PublicFooter() {
  return <footer className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-12 md:px-10 md:py-16">
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-10 sm:grid-cols-[1fr_auto] sm:gap-16">
        <div className="max-w-xs space-y-4"><Logo size={28} /><p className="text-sm leading-relaxed text-[var(--text-secondary)]">More time to teach.<br />Thoughtful assessments, made simpler.</p></div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-8 text-sm sm:gap-x-16">
          <div className="space-y-3"><p className="mb-4 text-xs font-semibold text-[var(--text)]">Imtihan</p>
            {[{ href: "/about", label: "About" }, { href: "/pricing", label: "Pricing" }, { href: "/blog", label: "Blog" }].map(link => <Link key={link.href} href={link.href} className="block w-fit py-1 text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]">{link.label}</Link>)}
          </div>
          <div className="space-y-3"><p className="mb-4 text-xs font-semibold text-[var(--text)]">Help & legal</p>
            {[{ href: "/contact", label: "Contact" }, { href: "/privacy", label: "Privacy" }, { href: "/terms", label: "Terms" }, { href: "/copyright", label: "Copyright" }].map(link => <Link key={link.href} href={link.href} className="block w-fit py-1 text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]">{link.label}</Link>)}
          </div>
        </nav>
      </div>
      <div className="mt-10 flex flex-col gap-2 border-t border-[var(--border)]/60 pt-6 text-xs leading-relaxed text-[var(--text-tertiary)] sm:flex-row sm:justify-between"><p>© {new Date().getFullYear()} Imtihan</p><p>Made for teachers in Lebanon</p></div>
    </div>
  </footer>;
}
