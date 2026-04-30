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
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">
        &ldquo;{content}&rdquo;
      </p>
    </div>
  );
}
