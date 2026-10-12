import type { ReactNode } from "react";
import { RefreshCw, Loader2, AlertCircle } from "lucide-react";

export const REPORT_CARD =
  "min-w-0 rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm";
export const REPORT_TH =
  "px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap";

export function ReportHeader({
  title,
  description,
  children,
  period,
  days,
  onDaysChange,
  loading,
  onRefresh,
  error = false,
}: {
  title: string;
  description: string;
  children?: ReactNode;
  period: "coverage" | "analytics";
  days: string;
  onDaysChange: (value: string) => void;
  loading: boolean;
  onRefresh: () => void;
  error?: boolean;
}) {
  return (
    <div className={`${REPORT_CARD} p-5 sm:p-6`}>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 max-w-2xl">
          <h2 className="text-base font-black tracking-tight text-[var(--text)]">
            {title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
            {description}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-end gap-2">
          <label className="min-w-0 flex-1 sm:flex-none">
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
              Period
            </span>
            <select
              aria-label={
                period === "coverage" ? "Coverage period" : "Analytics period"
              }
              value={days}
              onChange={(e) => onDaysChange(e.target.value)}
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-3 text-xs font-semibold text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:w-auto"
            >
              <option value="7">
                {period === "coverage"
                  ? "Last 7 days"
                  : "Last 7 completed days"}
              </option>
              <option value="28">
                {period === "coverage"
                  ? "Last 28 days"
                  : "Last 28 completed days"}
              </option>
            </select>
          </label>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-bold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
              aria-hidden="true"
            />
            {error ? "Retry" : "Refresh"}
          </button>
        </div>
      </div>
      {children && (
        <div className="mt-5 border-t border-[var(--border)] pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

export function ReportMetric({
  label,
  count,
  hint,
}: {
  label: string;
  count: number;
  hint?: string;
}) {
  return (
    <div className={`${REPORT_CARD} p-5`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black tabular-nums text-[var(--text)]">
        {count.toLocaleString()}
      </p>
      {hint && (
        <p className="mt-1 text-xs text-[var(--text-secondary)]">{hint}</p>
      )}
    </div>
  );
}

export function ReportState({
  title,
  children,
  kind = "empty",
}: {
  title: string;
  children?: ReactNode;
  kind?: "empty" | "loading" | "error";
}) {
  return (
    <div
      role={
        kind === "error" ? "alert" : kind === "loading" ? "status" : undefined
      }
      className={`${REPORT_CARD} flex items-start gap-3 p-5 sm:p-6`}
    >
      {kind === "loading" ? (
        <Loader2
          size={18}
          className="mt-0.5 shrink-0 animate-spin text-[var(--accent)]"
          aria-hidden="true"
        />
      ) : (
        <AlertCircle
          size={18}
          className={`mt-0.5 shrink-0 ${kind === "error" ? "text-[var(--danger)]" : "text-[var(--text-secondary)]"}`}
          aria-hidden="true"
        />
      )}
      <div>
        <p className="text-sm font-bold text-[var(--text)]">{title}</p>
        {children && (
          <div className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
