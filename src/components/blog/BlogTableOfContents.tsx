"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function BlogTableOfContents() {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll("h2, h3"))
      .filter(h => h.id)
      .map(h => ({
        id: h.id,
        text: h.textContent || "",
        level: parseInt(h.tagName.substring(1))
      }));
    
    setItems(headings);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0% -35% 0%" }
    );

    headings.forEach((h) => {
      const element = document.getElementById(h.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
        <List size={14} />
        Table of contents
      </div>
      <nav className="flex flex-col gap-1.5">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`text-xs leading-relaxed transition-all duration-300 hover:text-[var(--accent)] ${
              activeId === item.id 
                ? "text-[var(--accent)] font-bold translate-x-1" 
                : "text-[var(--text-tertiary)]"
            } ${item.level === 3 ? "ml-4" : ""}`}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
