"use client";

import { Share2, MessageCircle, Twitter, Linkedin, Link2 } from "lucide-react";
import { useState } from "react";

interface BlogShareProps {
  title: string;
  url: string;
}

export function BlogShare({ title, url }: BlogShareProps) {
  const [copied, setCopied] = useState(false);

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: "hover:text-[#25D366] hover:bg-[#25D366]/10",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:text-[#0077b5] hover:bg-[#0077b5]/10",
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: "hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10",
    },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      <h5 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Share article</h5>
      <div className="flex items-center gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] transition-all duration-300 ${link.color}`}
            title={`Share on ${link.name}`}
          >
            <link.icon size={18} />
          </a>
        ))}
        <button
          onClick={copyToClipboard}
          className={`w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] transition-all duration-300 hover:text-[var(--accent)] hover:bg-[var(--accent-light)] ${
            copied ? "text-[var(--accent)] bg-[var(--accent-light)] border-[var(--accent)]/30" : ""
          }`}
          title="Copy link"
        >
          {copied ? <Link2 size={18} className="animate-pulse" /> : <Link2 size={18} />}
        </button>
      </div>
    </div>
  );
}
