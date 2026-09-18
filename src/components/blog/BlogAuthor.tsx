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
          <h4 className="font-bold text-[var(--text)] mb-1">{name}</h4>
          <p className="text-xs text-[var(--text-tertiary)] font-medium mb-3 uppercase tracking-wider">{role}</p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
            {bio}
          </p>
        </div>
      </div>
    </div>
  );
}
