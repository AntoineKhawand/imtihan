import { Sparkles } from "lucide-react";

interface BlogCalloutProps {
  title: string;
  content: string;
}

export function BlogCallout({ title, content }: BlogCalloutProps) {
  return (
    <div className="relative my-10 p-6 rounded-2xl bg-gradient-to-br from-[var(--surface-raised)] to-[var(--bg)] border border-[var(--border)] shadow-sm group">
      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
        <Sparkles size={16} className="fill-white" />
      </div>
      <h4 className="font-bold text-[var(--text)] mb-2 flex items-center gap-2">
        {title}
      </h4>
      {/* Semantic <blockquote> (not just a styled <p>) so this quoted
          testimonial is machine-readable as a quotation — AI answer engines
          and the GEO audit both look for real <blockquote> markup, not just
          italic text, per scripts/geo-audit.mjs's "quotations" signal. */}
      <blockquote className="text-sm text-[var(--text-secondary)] leading-relaxed italic m-0 p-0 border-0">
        &ldquo;{content}&rdquo;
      </blockquote>
    </div>
  );
}
