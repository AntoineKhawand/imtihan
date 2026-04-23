import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function Logo({ className = "", size = 32, showText = true }: LogoProps) {
  return (
    <Link 
      href="/" 
      className={`flex items-center gap-2.5 group transition-all active:scale-95 ${className}`}
    >
      <div 
        className="relative rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow"
        style={{ width: size, height: size }}
      >
        <Image 
          src="/logo.png" 
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
    </Link>
  );
}
