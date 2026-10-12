const WORKLOAD = [
  { task: "Teaching", share: 43 },
  { task: "Lesson planning", share: 14 },
  { task: "Marking and correcting", share: 9 },
  { task: "Administration", share: 6 },
];

export function BlogWorkloadEvidence() {
  return (
    <figure className="not-prose my-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8">
      <h2 className="serif text-2xl text-[var(--text)]">
        Teacher workload: context from TALIS 2024
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
        Selected average shares of full-time teachers’ self-reported working
        time in the OECD report.
      </p>
      <ul className="my-6 space-y-5">
        {WORKLOAD.map(({ task, share }) => (
          <li key={task}>
            <div className="mb-2 flex justify-between gap-4 text-sm text-[var(--text)]">
              <span>{task}</span>
              <strong>{share}%</strong>
            </div>
            <div
              aria-hidden="true"
              className="h-2 rounded-full bg-[var(--bg-subtle)]"
            >
              <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${share}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <figcaption className="text-xs leading-relaxed text-[var(--text-secondary)]">
        International survey context, not Lebanon-specific findings or measured
        Imtihan time savings. Selected categories are shown, not a complete
        breakdown. Self-reported task totals may differ from total workload.
        Source:{" "}
        <a
          className="underline underline-offset-2"
          href="https://www.oecd.org/en/publications/results-from-talis-2024_90df6235-en/full-report/the-demands-of-teaching_0e941e2f.html"
        >
          OECD, Results from TALIS 2024, “The demands of teaching”, Table 3.10
        </a>
        .
      </figcaption>
    </figure>
  );
}
