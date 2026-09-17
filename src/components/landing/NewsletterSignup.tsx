"use client";

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, honeypot }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        toast.error(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="px-6 md:px-10 py-24 border-t border-[var(--border)] bg-[var(--bg-subtle)]">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-4">Free resource</p>
        <h2 className="serif text-display-lg text-[var(--text)] mb-3">Get the Exam-Writing Checklist</h2>
        <p className="text-[var(--text-secondary)] mb-8">
          Ten checks we run on every generated exam — curriculum coverage, barème math, realistic
          duration. Free, sent once, no spam.
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-2 text-[var(--accent)] font-medium">
            <CheckCircle2 size={20} />
            Check your inbox — the checklist is on its way.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            {/* Honeypot — hidden from real visitors via CSS, bots that fill every field trip it */}
            <input
              type="text"
              name="company"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full h-12 pl-11 pr-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all"
              />
            </div>
            <Button type="submit" size="lg" loading={submitting}>
              Send it to me
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
