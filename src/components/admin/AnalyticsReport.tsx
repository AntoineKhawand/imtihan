"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import {
  ReportHeader,
  ReportMetric,
  ReportState,
  REPORT_CARD,
  REPORT_TH,
} from "@/components/admin/ReportUI";
import type { User } from "firebase/auth";
import type { AnalyticsSummaryResult } from "@/types/analytics-reporting";

const reportSchema = z.discriminatedUnion("configured", [
  z.object({ configured: z.literal(false), reason: z.string() }),
  z.object({
    configured: z.literal(true),
    startDate: z.string(),
    endDate: z.string(),
    totalSessions: z.number().nonnegative(),
    totalUsers: z.number().nonnegative(),
    sessionsByChannel: z.array(
      z.object({ channel: z.string(), sessions: z.number().nonnegative() }),
    ),
    conversionEvents: z.array(
      z.object({
        eventName: z.enum(["sign_up", "exam_generated"]),
        count: z.number().nonnegative(),
      }),
    ),
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
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok)
          throw new Error(
            "Analytics unavailable. Check GA4 configuration and property access, then retry.",
          );
        const result = reportSchema.parse(await response.json());
        if (!controller.signal.aborted) setReport(result);
      } catch {
        if (!controller.signal.aborted)
          setError(
            "Analytics unavailable. Check GA4 configuration and property access, then retry.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [user, days, revision]);

  return (
    <section className="min-w-0 space-y-6 pb-8" aria-label="Growth analytics">
      <ReportHeader
        title="Growth insights"
        description="Understand where visits come from and how often teachers sign up or generate exams."
        period="analytics"
        days={days}
        onDaysChange={setDays}
        loading={loading}
        onRefresh={() => setRevision((value) => value + 1)}
        error={!!error}
      >
        <div className="flex flex-col gap-2 text-xs leading-relaxed text-[var(--text-secondary)] sm:flex-row sm:justify-between">
          <p>
            GA4 · completed days through yesterday, in the property’s time zone.
          </p>
          {report?.configured && (
            <p className="shrink-0">
              {report.startDate} – {report.endDate}
            </p>
          )}
        </div>
      </ReportHeader>
      {loading && <ReportState kind="loading" title="Loading insights…" />}
      {error && (
        <ReportState kind="error" title="Insights unavailable">
          {error}
        </ReportState>
      )}
      {report && !report.configured && (
        <ReportState title="Connect GA4 reporting">
          GA4 reporting needs setup. Configure the GA4 property and read-only
          reporting credentials using the project’s GA4 setup guide. No traffic
          numbers are available yet.
        </ReportState>
      )}
      {report?.configured && (
        <>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <ReportMetric label="Sessions" count={report.totalSessions} />
            <ReportMetric label="Users" count={report.totalUsers} />
            {report.conversionEvents.map((event) => (
              <ReportMetric
                key={event.eventName}
                label={
                  event.eventName === "sign_up"
                    ? "Sign-up events"
                    : "Exam-generated events"
                }
                count={event.count}
              />
            ))}
          </div>
          <div className={`${REPORT_CARD} overflow-hidden`}>
            <div className="border-b border-[var(--border)] p-5">
              <h3 className="text-sm font-black text-[var(--text)]">
                Sessions by channel
              </h3>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Traffic sources for the selected period.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[var(--text)]">
                <caption className="sr-only">Sessions by channel</caption>
                <thead className="bg-[var(--bg-subtle)]">
                  <tr>
                    <th scope="col" className={REPORT_TH}>
                      Channel
                    </th>
                    <th scope="col" className={`${REPORT_TH} text-right`}>
                      Sessions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {report.sessionsByChannel.map((channel) => (
                    <tr
                      key={channel.channel}
                      className="transition-colors hover:bg-[var(--bg-subtle)]/50"
                    >
                      <th
                        scope="row"
                        className="px-5 py-4 text-left font-semibold"
                      >
                        {channel.channel}
                      </th>
                      <td className="px-5 py-4 text-right font-semibold tabular-nums">
                        {channel.sessions.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {report.sessionsByChannel.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-5 py-6 text-sm text-[var(--text-secondary)]"
                      >
                        No channel data for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <details
            className={`${REPORT_CARD} p-5 text-xs leading-relaxed text-[var(--text-secondary)]`}
          >
            <summary className="w-fit cursor-pointer font-semibold text-[var(--accent-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
              About these numbers
            </summary>
            <div className="mt-3 space-y-2">
              <p>
                Event counts measure occurrences, not unique teachers or a
                conversion rate. Marking an event as a GA4 key event is a
                separate GA4 setting.
              </p>
              <p>
                Analytics requires visitor acceptance. People who reject
                analytics are not included in these traffic and event counts.
              </p>
            </div>
          </details>
        </>
      )}
    </section>
  );
}
