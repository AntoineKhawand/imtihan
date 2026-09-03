import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  /**
   * Whether Logo renders its own internal <Link href="/">. Set to false when
   * the caller already wraps Logo in its own link/anchor — nesting two <a>
   * tags is invalid HTML and causes a hydration mismatch (React has to
   * discard and remount the whole subtree on the client). Defaults to true
   * for standalone usage.
   */
  asLink?: boolean;
}

export function Logo({ className = "", size = 32, showText = true, asLink = true }: LogoProps) {
  const content = (
    <>
      <div
        className="relative rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow"
        style={{ width: size, height: size }}
      >
        <Image
          src="/Imtihan-logo.png"
          alt="Imtihan Logo"
          fill
          className="object-cover"
          priority
        />
      </div>
      {showText && (
        <span className="font-bold text-[var(--text)] tracking-tight" style={{ fontSize: size * 0.45 }}>
          Imtihan
        </span>
      )}
    </>
  );

  if (!asLink) {
    return (
      <span className={`flex items-center gap-2.5 group transition-all active:scale-95 ${className}`}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 group transition-all active:scale-95 ${className}`}
    >
      {content}
    </Link>
  );
}
