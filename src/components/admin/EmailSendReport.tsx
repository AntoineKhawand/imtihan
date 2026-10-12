import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { EmailSendResult } from "@/types/admin-email";

export function EmailSendReport({ result, onDismiss }: { result: EmailSendResult; onDismiss: () => void }) {
  const hasFailures = result.failed > 0;
  const Icon = hasFailures ? AlertTriangle : CheckCircle2;
  return (
    <section role="status" aria-label="Email send result" className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Icon size={22} className={`shrink-0 ${hasFailures ? "text-amber-600" : "text-emerald-600"}`} />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[var(--text)]">{result.sent} accepted by email provider · {result.failed} failed · {result.skipped} skipped</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Provider acceptance does not confirm inbox delivery. Successful recipients are not retried automatically.</p>
        </div>
        <button aria-label="Dismiss send result" onClick={onDismiss} className="shrink-0 p-2 text-[var(--text-tertiary)]"><XCircle size={18} /></button>
      </div>
      {result.results.some(item => !item.success) && (
        <ul aria-label="Recipients not sent" className="mt-4 max-h-80 space-y-3 overflow-y-auto border-t border-[var(--border)] pt-4 text-sm">
          {result.results.filter(item => !item.success).map(item => (
            <li key={item.uid} className="break-words [overflow-wrap:anywhere]">
              <p className="font-semibold text-[var(--text)]">{item.email || "Recipient account"} · {item.skipped ? "Skipped" : "Failed"}</p>
              <p className="text-[var(--text-secondary)]">{item.error || "No reason returned. Check the email provider logs before retrying."}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
