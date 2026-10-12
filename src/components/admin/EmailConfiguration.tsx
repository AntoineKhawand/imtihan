"use client";

import { useEffect, useState } from "react";

export function EmailConfiguration({ user }: { user: { getIdToken: () => Promise<string> } | null }) {
  const [issues, setIssues] = useState<string[] | null>(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!user) return;
    let active = true;
    setIssues(null); setError(false);
    (async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/admin/send-email", { cache: "no-store", headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error("Unavailable");
        const data = await response.json();
        if (!Array.isArray(data.issues) || !data.issues.every((issue: unknown) => typeof issue === "string")) throw new Error("Invalid response");
        if (active) setIssues(data.issues);
      } catch {
        if (active) setError(true);
      }
    })();
    return () => { active = false; };
  }, [user, revision]);
  return (
    <section aria-label="Email configuration" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold text-[var(--text)]">Email configuration</p>
        <button onClick={() => setRevision(value => value + 1)} className="min-h-10 rounded-lg border border-[var(--border)] px-3 text-[var(--text-secondary)]">Check configuration</button>
      </div>
      <div role="status" className="mt-2 text-[var(--text-secondary)]">
        {error ? "Configuration check unavailable. No email was sent. Try again." : issues === null ? "Checking required settings…" : issues.length ? (
          <><p className="font-medium text-amber-600">Promotional email configuration is incomplete:</p><ul className="mt-2 list-disc space-y-1 pl-5 [overflow-wrap:anywhere]">{issues.map(issue => <li key={issue}>{issue}</li>)}</ul><p className="mt-2">After updating Production variables, redeploy Imtihan and check again.</p></>
        ) : "Required settings are present. This check does not verify Brevo credentials, sender approval or delivery. No email was sent."}
      </div>
    </section>
  );
}
