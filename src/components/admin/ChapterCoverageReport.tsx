"use client";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { z } from "zod";
import {
  ReportHeader,
  ReportMetric,
  ReportState,
  REPORT_CARD,
  REPORT_TH,
} from "@/components/admin/ReportUI";

const schema = z.object({
  startDay: z.string(),
  endDay: z.string(),
  totalChapters: z.number(),
  firstSampleDay: z.string().nullable(),
  misses: z.array(
    z.object({
      id: z.string(),
      chapterName: z.string(),
      chapterId: z.string(),
      curriculumId: z.string(),
      levelName: z.string(),
      subject: z.string(),
      selectionCount: z.number().positive(),
      missCount: z.number().nonnegative(),
      missRate: z.number().min(0).max(1).nullable(),
      lastMissedAt: z.number().nullable(),
    }),
  ),
});

export function ChapterCoverageReport({
  user,
}: {
  user: Pick<User, "getIdToken"> | null;
}) {
  const [days, setDays] = useState("28");
  const [revision, setRevision] = useState(0);
  const [report, setReport] = useState<z.infer<typeof schema> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    setReport(null);
    const currentUser = user;
    async function load() {
      try {
        const token = await currentUser.getIdToken();
        const response = await fetch(
          `/api/admin/chapter-coverage-misses?days=${days}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
            signal: controller.signal,
          },
        );
        if (!response.ok) throw new Error("Unavailable");
        const data = schema.parse(await response.json());
        if (!controller.signal.aborted) setReport(data);
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [user, days, revision]);

  return (
    <section
      className="min-w-0 space-y-6 pb-8"
      aria-label="Chapter coverage report"
    >
      <ReportHeader
        title="Chapter coverage"
        description="Find selected chapters that received no tagged exercises, then review the affected exams."
        period="coverage"
        days={days}
        onDaysChange={setDays}
        loading={loading}
        onRefresh={() => setRevision((value) => value + 1)}
        error={error}
      >
        <details className="text-xs leading-relaxed text-[var(--text-secondary)]">
          <summary className="w-fit cursor-pointer font-semibold text-[var(--accent-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
            How to read this report
          </summary>
          <div className="mt-3 max-w-3xl space-y-2">
            <p>
              A miss means a selected chapter had no exercises tagged to it. It
              can indicate missing content or missing tags; inspect the exam
              before changing objectives or prompts. These counts never change
              prompts automatically.
            </p>
            <p>
              Tracks up to 20 distinct, valid selected chapters per completed
              fresh generation. Adjustments, university exams and severely
              truncated generations are excluded. Older miss-only counters are
              excluded because their selection totals are unknown. Recording
              failures can leave gaps.
            </p>
            <p>
              Compare misses with selections. A large count alone does not imply
              poor coverage; fewer than 10 selections is a small sample.
            </p>
          </div>
        </details>
      </ReportHeader>
      {loading && (
        <ReportState kind="loading" title="Loading coverage report…" />
      )}
      {error && (
        <ReportState kind="error" title="Coverage report unavailable">
          Retry to check the data. A loading failure does not mean there were no
          misses.
        </ReportState>
      )}
      {report && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ReportMetric
              label="Tracked chapters"
              count={report.totalChapters}
              hint="Across the selected period"
            />
            <ReportMetric
              label="Recorded selections"
              count={report.misses.reduce(
                (sum, row) => sum + row.selectionCount,
                0,
              )}
              hint="Shown chapters only"
            />
            <ReportMetric
              label="Coverage misses"
              count={report.misses.reduce((sum, row) => sum + row.missCount, 0)}
              hint="Shown chapters only"
            />
          </div>
          <div className={`${REPORT_CARD} overflow-hidden`}>
            <div className="flex flex-col gap-2 border-b border-[var(--border)] p-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--text)]">
                  Chapter breakdown
                </h3>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Showing {report.misses.length} of {report.totalChapters}{" "}
                  chapters, ordered by misses.
                </p>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                {report.startDay} – {report.endDay}
                <span className="mt-0.5 block sm:text-right">
                  UTC · including today
                </span>
              </p>
            </div>
            {report.misses.length === 0 ? (
              <div className="space-y-1 p-6 text-sm text-[var(--text-secondary)]">
                <p className="font-semibold text-[var(--text)]">
                  No tracked chapter selections
                </p>
                <p>
                  No selections were recorded for this period. This does not
                  confirm that recording is working or that every chapter was
                  covered.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs text-[var(--text)]">
                  <caption className="sr-only">
                    Chapter coverage by curriculum, level and subject
                  </caption>
                  <thead className="bg-[var(--bg-subtle)]">
                    <tr>
                      {[
                        "Chapter",
                        "Curriculum / level",
                        "Subject",
                        "Selections",
                        "Misses",
                        "Miss rate",
                        "Last missed (UTC)",
                      ].map((label) => (
                        <th key={label} scope="col" className={REPORT_TH}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {report.misses.map((row) => (
                      <tr
                        key={row.id}
                        className="transition-colors hover:bg-[var(--bg-subtle)]/50"
                      >
                        <th
                          scope="row"
                          className="max-w-xs px-5 py-4 text-left font-semibold"
                        >
                          <span className="block">{row.chapterName}</span>
                          <span className="mt-1 block break-all text-[10px] font-normal text-[var(--text-secondary)]">
                            {row.chapterId}
                          </span>
                        </th>
                        <td className="px-5 py-4">
                          <span className="font-semibold">
                            {(
                              {
                                "bac-libanais": "Bac Libanais",
                                "bac-francais": "Bac Français",
                                ib: "IB Diploma",
                              } as Record<string, string>
                            )[row.curriculumId] ?? row.curriculumId}
                          </span>
                          <span className="mt-1 block text-[var(--text-secondary)]">
                            {row.levelName}
                          </span>
                        </td>
                        <td className="px-5 py-4 capitalize">{row.subject}</td>
                        <td className="px-5 py-4 font-semibold tabular-nums">
                          {row.selectionCount.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 font-semibold tabular-nums">
                          {row.missCount.toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-lg px-2 py-1 font-bold tabular-nums ${row.missCount > 0 ? "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300" : "bg-[var(--bg-subtle)] text-[var(--text-secondary)]"}`}
                          >
                            {row.missRate === null
                              ? "—"
                              : `${(row.missRate * 100).toFixed(1)}%`}
                          </span>
                          {row.selectionCount < 10 && (
                            <span className="mt-1 block text-[10px] text-[var(--text-secondary)]">
                              Small sample
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-[var(--text-secondary)]">
                          {row.lastMissedAt === null
                            ? "—"
                            : new Date(row.lastMissedAt)
                                .toISOString()
                                .slice(0, 10)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {report.firstSampleDay && (
              <p className="border-t border-[var(--border)] px-5 py-3 text-xs text-[var(--text-secondary)]">
                First sample in this period: {report.firstSampleDay}.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
