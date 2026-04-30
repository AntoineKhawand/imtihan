import { CheckCircle2 } from "lucide-react";

interface BlogAuthorProps {
  name: string;
  role: string;
  bio: string;
  avatarText: string;
}

export function BlogAuthor({ name, role, bio, avatarText }: BlogAuthorProps) {
  return (
    <div className="py-8 border-t border-b border-[var(--border)] my-12">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent)] to-emerald-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
          {avatarText}
        </div>
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <h4 className="font-bold text-[var(--text)]">{name}</h4>
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold border border-blue-100">
              <CheckCircle2 size={10} className="fill-blue-600 text-white" />
              VERIFIED EDUCATOR
            </div>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] font-medium mb-3 uppercase tracking-wider">{role}</p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
            {bio}
          </p>
        </div>
      </div>
    </div>
  );
}
