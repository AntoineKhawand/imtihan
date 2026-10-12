"use client";

import { useState } from "react";
import { buildNewsletterHtml } from "@/lib/emails/newsletter";
import { cn } from "@/lib/utils";

export function NewsletterPreview() {
  const [mobile, setMobile] = useState(true);
  return (
    <details className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
      <summary className="cursor-pointer px-5 py-4 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
        Preview newsletter
      </summary>
      <div className="border-t border-[var(--border)] p-3 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
            Sample content. Delivery adds the postal address and personal
            unsubscribe link.
          </p>
          <div
            className="inline-flex rounded-xl border border-[var(--border)] p-1"
            role="group"
            aria-label="Preview width"
          >
            {[true, false].map((value) => (
              <button
                key={String(value)}
                type="button"
                aria-pressed={mobile === value}
                onClick={() => setMobile(value)}
                className={cn(
                  "min-h-10 rounded-lg px-3 text-xs font-bold focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                  mobile === value
                    ? "bg-[var(--bg-subtle)] text-[var(--text)]"
                    : "text-[var(--text-secondary)]",
                )}
              >
                {value ? "Phone" : "Desktop"}
              </button>
            ))}
          </div>
        </div>
        <iframe
          title="Newsletter email preview"
          sandbox=""
          referrerPolicy="no-referrer"
          srcDoc={buildNewsletterHtml("Alex", "Monthly edition")}
          className="mx-auto block h-[640px] max-w-full rounded-xl border border-[var(--border)] bg-white"
          style={{ width: mobile ? 375 : 640 }}
        />
        <p className="mt-3 text-xs text-[var(--text-secondary)]">
          Preview adapts to available space. Email clients may render fonts and
          colours differently.
        </p>
      </div>
    </details>
  );
}
