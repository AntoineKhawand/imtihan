"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

const SESSION_KEY = "imtihan_visit_counted";

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k+";
  return n.toString();
}

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const alreadyCounted = sessionStorage.getItem(SESSION_KEY);
        let res: Response;

        if (alreadyCounted) {
          res = await fetch("/api/visit", { method: "GET" });
        } else {
          res = await fetch("/api/visit", { method: "POST" });
          sessionStorage.setItem(SESSION_KEY, "1");
        }

        if (!cancelled && res.ok) {
          const data = await res.json();
          setCount(data.total);
          setAnimating(true);
          setTimeout(() => setAnimating(false), 600);
        }
      } catch {
        // silently fail — the counter is decorative
      }
    }

    run();
    return () => { cancelled = true; };
  }, []);

  if (count === null) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 text-xs text-[var(--text-tertiary)] transition-opacity duration-500 ${
        animating ? "opacity-0" : "opacity-100"
      }`}
    >
      <Users size={12} className="text-[var(--accent)] opacity-70" />
      <span>
        <span className="font-semibold text-[var(--text-secondary)]">{formatCount(count)}</span>
        {" "}educators have discovered Imtihan
      </span>
    </div>
  );
}
