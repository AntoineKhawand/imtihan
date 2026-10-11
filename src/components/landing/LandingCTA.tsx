"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
export function LandingCTA({ href }: { href: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={href}
        onClick={() =>
          trackEvent("create_exam_click", { placement: "homepage_hero" })
        }
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 hover:opacity-90"
      >
        Create a free exam <ArrowRight size={16} />
      </Link>
    </div>
  );
}
