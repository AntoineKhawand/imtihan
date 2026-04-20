"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TOPIC_OPTIONS = [
  { value: "general", label: "General question" },
  { value: "bug", label: "Bug or issue" },
  { value: "school", label: "School or institution" },
  { value: "legal", label: "Privacy or legal" },
  { value: "other", label: "Other" },
];

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("general");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const isReady = name.trim().length > 0 && email.includes("@") && message.trim().length >= 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isReady || status === "sending") return;
    setStatus("sending");

    // Simulate sending — replace with your email API (Resend, EmailJS, etc.)
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center text-center py-8 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center">
          <CheckCircle2 size={22} className="text-[var(--accent)]" />
        </div>
        <div>
          <p className="font-semibold text-[var(--text)] mb-1">Message sent!</p>
          <p className="text-sm text-[var(--text-secondary)]">
            We&apos;ll get back to you at <strong>{email}</strong> within one business day.
          </p>
        </div>
        <button
          onClick={() => { setName(""); setEmail(""); setMessage(""); setTopic("general"); setStatus("idle"); }}
          className="text-xs text-[var(--accent)] hover:underline mt-1"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Your name" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Antoine Khoury"
            className={inputCls}
            required
          />
        </Field>
        <Field label="Email address" required>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="antoine@school.edu.lb"
            className={inputCls}
            required
          />
        </Field>
      </div>

      {/* Topic */}
      <Field label="Topic">
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={inputCls}
        >
          {TOPIC_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Field>

      {/* Message */}
      <Field label="Message" required>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your question, issue, or request in detail…"
          rows={5}
          className={cn(inputCls, "resize-none")}
          required
        />
        <div className="flex justify-end mt-1">
          <span className={cn(
            "text-xs tabular-nums",
            message.length < 10 ? "text-[var(--text-tertiary)]" : "text-[var(--accent)]"
          )}>
            {message.length} chars
          </span>
        </div>
      </Field>

      {/* Error */}
      {status === "error" && (
        <p className="text-sm text-[var(--danger)]">
          Something went wrong. Please email us directly at{" "}
          <a href="mailto:hello@imtihan.app" className="underline">hello@imtihan.app</a>.
        </p>
      )}

      <button
        type="submit"
        disabled={!isReady || status === "sending"}
        className={cn(
          "w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-medium transition-all",
          isReady && status !== "sending"
            ? "bg-[var(--accent)] text-white hover:opacity-90"
            : "bg-[var(--bg-subtle)] text-[var(--text-tertiary)] cursor-not-allowed"
        )}
      >
        {status === "sending" ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send size={14} />
            Send message
          </>
        )}
      </button>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-[var(--text)]">
        {label}
        {required && <span className="text-[var(--accent)] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full h-10 px-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors";
