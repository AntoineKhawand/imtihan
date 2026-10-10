"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import type { User } from "firebase/auth";
import type { AnalyticsSummaryResult } from "@/types/analytics-reporting";

const reportSchema = z.discriminatedUnion("configured", [
  z.object({ configured: z.literal(false), reason: z.string() }),
  z.object({
    configured: z.literal(true), startDate: z.string(), endDate: z.string(),
    totalSessions: z.number().nonnegative(), totalUsers: z.number().nonnegative(),
    sessionsByChannel: z.array(z.object({ channel: z.string(), sessions: z.number().nonnegative() })),
    conversionEvents: z.array(z.object({ eventName: z.enum(["sign_up", "exam_generated"]), count: z.number().nonnegative() })),
  }),
]);

export function AnalyticsReport({ user }: { user: User | null }) {
  const [days, setDays] = useState("28");
  const [revision, setRevision] = useState(0);
  const [report, setReport] = useState<AnalyticsSummaryResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    setLoading(true);
    setReport(null);
    setError("");
    async function load() {
      try {
        const token = await user!.getIdToken();
        const response = await fetch(`/api/admin/analytics?days=${days}`, {
          headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: controller.signal,
        });
        if (!response.ok) throw new Error("Analytics unavailable. Check GA4 configuration and property access, then retry.");
        const result = reportSchema.parse(await response.json());
        if (!controller.signal.aborted) setReport(result);
      } catch {
        if (!controller.signal.aborted) setError("Analytics unavailable. Check GA4 configuration and property access, then retry.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [user, days, revision]);

  return (
    <section className="space-y-5 pb-16" aria-label="Growth analytics">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)]">Growth analytics</h2>
          <p className="text-sm text-[var(--text-tertiary)]">GA4 · completed days through yesterday, in the property’s time zone.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select aria-label="Analytics period" value={days} onChange={(e) => setDays(e.target.value)} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)]">
            <option value="7">Last 7 completed days</option><option value="28">Last 28 completed days</option>
          </select>
          <button onClick={() => setRevision((value) => value + 1)} disabled={loading} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)] disabled:opacity-50">Refresh</button>
        </div>
      </div>
      {loading && <p role="status" className="text-[var(--text-tertiary)]">Loading analytics…</p>}
      {error && <p role="alert" className="text-red-700 dark:text-red-300">{error}</p>}
      {report && !report.configured && <p className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--text-secondary)]">GA4 reporting needs setup. Configure the GA4 property and read-only reporting credentials as described in the project’s GA4 setup guide. No traffic numbers are available yet.</p>}
      {report?.configured && <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[{ label: "Sessions", count: report.totalSessions }, { label: "Users", count: report.totalUsers }, ...report.conversionEvents.map((event) => ({ label: event.eventName === "sign_up" ? "Sign-up events" : "Exam-generated events", count: event.count }))].map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><p className="text-sm text-[var(--text-tertiary)]">{metric.label}</p><p className="mt-2 text-3xl font-bold text-[var(--text)]">{metric.count.toLocaleString()}</p></div>
          ))}
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">Event counts measure occurrences, not unique teachers or a conversion rate. Marking an event as a GA4 key event is a separate GA4 setting.</p>
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-left text-sm text-[var(--text)]"><caption className="p-4 text-left font-bold">Sessions by channel</caption><thead><tr className="border-y border-[var(--border)]"><th scope="col" className="p-4">Channel</th><th scope="col" className="p-4 text-right">Sessions</th></tr></thead><tbody>
            {report.sessionsByChannel.map((channel) => <tr key={channel.channel} className="border-b border-[var(--border)]"><td className="p-4">{channel.channel}</td><td className="p-4 text-right">{channel.sessions.toLocaleString()}</td></tr>)}
            {report.sessionsByChannel.length === 0 && <tr><td colSpan={2} className="p-4 text-[var(--text-tertiary)]">No channel data for this period.</td></tr>}
          </tbody></table>
        </div>
      </>}
    </section>
  );
}
