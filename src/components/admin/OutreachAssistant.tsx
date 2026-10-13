"use client";
import { useState } from "react";
import { OutreachSequenceSchema, outreachIssues, type OutreachMessage } from "@/lib/outreach";

type Props = {
  user: { getIdToken: () => Promise<string> } | null;
  message: OutreachMessage;
  onChange: (message: OutreachMessage) => void;
  reviewed: boolean;
  onReviewed: (reviewed: boolean) => void;
};
const fieldClass = "mt-2 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]";
export function OutreachAssistant({ user, message, onChange, reviewed, onReviewed }: Props) {
  const [audience, setAudience] = useState("");
  const [context, setContext] = useState("");
  const [language, setLanguage] = useState("french");
  const [messages, setMessages] = useState<OutreachMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const issues = outreachIssues(message);
  async function generate() {
    if (!user || busy) return;
    setBusy(true); setError(""); setMessages([]);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/outreach-drafts", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ audience, context, language }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Unable to generate drafts.");
      const parsed = OutreachSequenceSchema.safeParse(data);
      if (!parsed.success) throw new Error("Unable to read the generated drafts. Try again.");
      setMessages(parsed.data.messages);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to generate drafts."); }
    finally { setBusy(false); }
  }
  function edit(next: OutreachMessage) { onChange(next); onReviewed(false); }
  return <section aria-label="Outreach assistant" className="min-w-0 space-y-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
    <header>
      <h3 className="font-bold">School and teacher outreach assistant</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">Create three short drafts, review one, then choose registered teacher accounts below. Each message is sent manually. Drafts stay on this page; copy anything you want to keep before leaving.</p>
      <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">Harvey content checks adapted for Imtihan. Public context is sent to OpenAI when you generate drafts. Leave out private contact details. The assistant does not discover prospects, read replies or schedule follow-ups.</p>
    </header>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium">Audience<input maxLength={250} value={audience} onChange={e => setAudience(e.target.value)} placeholder="Maths teachers using Bac Français" className={fieldClass} /></label>
      <label className="text-sm font-medium">Draft language<select value={language} onChange={e => setLanguage(e.target.value)} className={fieldClass}><option value="french">Français</option><option value="english">English</option></select></label>
    </div>
    <label className="block text-sm font-medium">Public context<textarea maxLength={1500} rows={3} value={context} onChange={e => setContext(e.target.value)} placeholder="Relevant curriculum, subject and the practical need to address. Use verified public facts only." className={fieldClass} /></label>
    <button type="button" disabled={busy || !user || audience.trim().length < 3 || context.trim().length < 10} onClick={generate} className="min-h-11 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "Preparing drafts…" : "Generate outreach drafts"}</button>
    {error && <p role="alert" className="break-words text-sm text-red-700 dark:text-red-300">{error}</p>}
    <div aria-live="polite" className="grid gap-3 lg:grid-cols-3">{messages.map((draft, index) => <article key={index} className="min-w-0 rounded-xl border border-[var(--border)] p-4">
      <p className="text-xs text-[var(--text-secondary)]">{index === 0 ? "Introduction" : `Optional follow-up ${index}`}</p>
      <h4 className="mt-2 break-words text-sm font-bold">{draft.subject}</h4>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{draft.body}</p>
      <button type="button" onClick={() => edit(draft)} className="mt-3 min-h-11 rounded-lg border border-[var(--border)] px-3 text-sm font-bold">Review draft {index + 1}</button>
    </article>)}</div>
    <div className="space-y-4 border-t border-[var(--border)] pt-5">
      <h4 className="text-sm font-bold">Message to review and send</h4>
      <label className="block text-sm font-medium">Outreach subject<input maxLength={90} value={message.subject} onChange={e => edit({ ...message, subject: e.target.value })} className={fieldClass} /></label>
      <label className="block text-sm font-medium">Plain-text message<textarea rows={7} maxLength={3000} value={message.body} onChange={e => edit({ ...message, body: e.target.value })} className={fieldClass} /></label>
      <p className="text-xs text-[var(--text-secondary)]">{message.body.trim() ? message.body.trim().split(/\s+/u).length : 0} / 220 words. The mail service adds the required postal address and unsubscribe footer.</p>
      {!!message.body && !!issues.length && <ul aria-label="Content checks" className="list-disc space-y-1 pl-5 text-xs text-red-700 dark:text-red-300">{issues.map(issue => <li key={issue}>{issue}</li>)}</ul>}
      <label className="flex items-start gap-3 text-sm leading-relaxed"><input type="checkbox" checked={reviewed} disabled={!!issues.length} onChange={e => onReviewed(e.target.checked)} className="mt-1 h-5 w-5 shrink-0" />I reviewed the facts and wording and will check the selected recipients before sending.</label>
    </div>
  </section>;
}
