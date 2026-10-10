"use client";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { z } from "zod";

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
    <section className="space-y-5 pb-16" aria-label="Chapter coverage report">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
        <h2 className="font-bold text-[var(--text)]">
          Chapter coverage misses
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          A miss means a selected chapter had no exercises tagged to it. It can
          indicate missing content or missing tags; inspect the exam before
          changing objectives or prompts. These counts never change prompts
          automatically.
        </p>
        <p className="text-xs text-[var(--text-tertiary)]">
          Tracks up to 20 distinct, valid selected chapters per completed fresh
          generation. Adjustments, university exams and severely truncated
          generations are excluded. Rates start with this update; older
          miss-only counters are excluded because their selection totals are
          unknown. Recording failures can leave gaps.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <select
            aria-label="Coverage period"
            value={days}
            onChange={(event) => setDays(event.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2 text-[var(--text)]"
          >
            <option value="7">Last 7 days</option>
            <option value="28">Last 28 days</option>
          </select>
          <button
            onClick={() => setRevision((value) => value + 1)}
            disabled={loading}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-[var(--text)] disabled:opacity-50"
          >
            {error ? "Retry" : "Refresh"}
          </button>
          {report && (
            <span className="text-xs text-[var(--text-tertiary)]">
              {report.startDay} – {report.endDay} · UTC, including today
            </span>
          )}
        </div>
      </div>
      {loading && <p role="status">Loading coverage report…</p>}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-300 p-4 text-red-700 dark:text-red-300"
        >
          Could not load the coverage report. Retry to check the data; this does
          not mean there were no misses.
        </p>
      )}
      {report && (
        <>
          <p className="text-xs text-[var(--text-tertiary)]">
            Showing {report.misses.length} of {report.totalChapters} chapters,
            ordered by misses.{" "}
            {report.firstSampleDay &&
              `First sample in this period: ${report.firstSampleDay}.`}{" "}
            Compare misses with selections; a large count alone does not imply
            poor coverage.
          </p>
          {report.misses.length === 0 ? (
            <p className="rounded-xl border border-[var(--border)] p-5 text-[var(--text-secondary)]">
              No tracked chapter selections in this period. This does not
              confirm that recording is working or that all exams covered every
              chapter.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <table className="w-full text-left text-sm text-[var(--text)]">
                <caption className="sr-only">
                  Chapter coverage by curriculum, level and subject
                </caption>
                <thead>
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
                      <th
                        scope="col"
                        key={label}
                        className="p-4 whitespace-nowrap"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.misses.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-[var(--border)]"
                    >
                      <td className="p-4">
                        {row.chapterName}
                        <span className="block text-xs text-[var(--text-tertiary)]">
                          {row.chapterId}
                        </span>
                      </td>
                      <td className="p-4">
                        {row.curriculumId}
                        <span className="block text-xs">{row.levelName}</span>
                      </td>
                      <td className="p-4">{row.subject}</td>
                      <td className="p-4">{row.selectionCount}</td>
                      <td className="p-4">{row.missCount}</td>
                      <td className="p-4">
                        {row.missRate === null
                          ? "—"
                          : `${(row.missRate * 100).toFixed(1)}%`}
                        {row.selectionCount < 10 && (
                          <span className="block text-xs text-[var(--text-tertiary)]">
                            Small sample
                          </span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
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
        </>
      )}
    </section>
  );
}
