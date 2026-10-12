"use client";

import { useState } from "react";
import { CheckCircle2, Clock, RefreshCw, Search } from "lucide-react";
import { ReportMetric, ReportState } from "./ReportUI";

interface Subscriber {
  id: string;
  email: string;
  source: string;
  createdAt: number;
  checklistSentAt: number | null;
}

function DeliveryBadge({ sent }: { sent: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${sent ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300"}`}
    >
      {sent ? <CheckCircle2 size={13} /> : <Clock size={13} />}
      {sent ? "Delivered" : "Pending"}
    </span>
  );
}

export function NewsletterSubscribers({
  subscribers,
  loading,
  resending,
  onResend,
}: {
  subscribers: Subscriber[];
  loading: boolean;
  resending: boolean;
  onResend: () => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const pending = subscribers.filter((s) => !s.checklistSentAt).length;
  const filtered = subscribers.filter(
    (s) =>
      `${s.email} ${s.source}`.toLowerCase().includes(search.toLowerCase()) &&
      (status === "all" ||
        (status === "delivered" ? !!s.checklistSentAt : !s.checklistSentAt)),
  );
  const date = (ts: number) =>
    ts
      ? new Date(ts).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";
  return (
    <div className="min-w-0 space-y-5">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-xl font-black tracking-tight">
          Newsletter subscribers
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
          People who requested the exam-writing checklist. Track checklist
          delivery and find subscribers by email or signup source.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
          This list is separate from the teacher accounts selected in Email.
          Delivery status does not indicate current promotional email
          preferences.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ReportMetric label="Subscribers" count={subscribers.length} />
        <ReportMetric
          label="Checklist delivered"
          count={subscribers.length - pending}
        />
        <ReportMetric label="Awaiting delivery" count={pending} />
      </div>
      {pending > 0 && (
        <div className="flex flex-col gap-4 rounded-3xl border border-amber-500/25 bg-amber-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-bold">
              {pending} checklist{pending === 1 ? "" : "s"} awaiting delivery
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              Retry pending deliveries. Promotional opt-outs and delivery
              safeguards still apply.
            </p>
          </div>
          <button
            onClick={onResend}
            disabled={resending || loading}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--surface)] px-4 text-sm font-bold ring-1 ring-[var(--border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50"
          >
            <RefreshCw size={14} className={resending ? "animate-spin" : ""} />
            {resending ? "Retrying…" : "Retry delivery"}
          </button>
        </div>
      )}
      <section
        className="min-w-0 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]"
        aria-label="Subscriber directory"
      >
        <div className="space-y-4 border-b border-[var(--border)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold">Subscriber directory</h3>
            <p className="text-xs text-[var(--text-secondary)]" role="status">
              {filtered.length} of {subscribers.length} shown
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search subscribers</span>
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-3.5 text-[var(--text-tertiary)]"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search email or source"
                className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              />
            </label>
            <label>
              <span className="sr-only">Checklist delivery status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:w-auto"
              >
                <option value="all">All delivery statuses</option>
                <option value="delivered">Delivered</option>
                <option value="pending">Pending</option>
              </select>
            </label>
          </div>
        </div>
        {loading ? (
          <ReportState title="Loading subscribers…" kind="loading" />
        ) : filtered.length === 0 ? (
          <ReportState
            title={
              subscribers.length
                ? "No matching subscribers"
                : "No subscribers yet"
            }
          >
            {subscribers.length
              ? "Try a different search or delivery status."
              : "Checklist signups will appear here."}
          </ReportState>
        ) : (
          <>
            <ul className="divide-y divide-[var(--border)] xl:hidden">
              {filtered.map((s) => (
                <li key={s.id} className="space-y-3 p-5">
                  <p className="break-all text-sm font-bold">{s.email}</p>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 text-xs leading-relaxed text-[var(--text-secondary)]">
                      <p className="break-all">Source: {s.source || "—"}</p>
                      <p>Signed up {date(s.createdAt)}</p>
                    </div>
                    <DeliveryBadge sent={!!s.checklistSentAt} />
                  </div>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="bg-[var(--bg-subtle)] text-xs text-[var(--text-secondary)]">
                  <tr>
                    <th scope="col" className="w-[40%] p-5">
                      Email
                    </th>
                    <th scope="col" className="w-[20%] p-5">
                      Source
                    </th>
                    <th scope="col" className="w-[20%] p-5">
                      Signed up
                    </th>
                    <th scope="col" className="w-[20%] p-5">
                      Checklist
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-[var(--bg-subtle)]">
                      <td className="break-all p-5 font-semibold">{s.email}</td>
                      <td className="break-all p-5 text-xs text-[var(--text-secondary)]">
                        {s.source || "—"}
                      </td>
                      <td className="p-5 text-xs text-[var(--text-secondary)]">
                        {date(s.createdAt)}
                      </td>
                      <td className="p-5">
                        <DeliveryBadge sent={!!s.checklistSentAt} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
