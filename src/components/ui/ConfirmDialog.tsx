"use client";

import { useEffect } from "react";
import { AlertTriangle, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A small, dependency-free confirmation modal. Custom-built rather than a
 * shadcn/Radix Dialog — CLAUDE.md §10 keeps this codebase on hand-rolled
 * components for the editorial aesthetic, so this follows the same rounded
 * card + Tailwind pattern the rest of /admin already uses instead of pulling
 * in a new primitives library.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const danger = tone === "danger";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => !loading && onCancel()}
      role="presentation"
    >
      <div
        className="w-full max-w-sm bg-[var(--surface)] rounded-[28px] shadow-2xl border border-[var(--border)] p-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0",
            danger ? "bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400" : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
          )}>
            <AlertTriangle size={20} />
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors disabled:opacity-40"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <h2 id="confirm-dialog-title" className="text-lg font-black text-[var(--text)] mb-1.5">{title}</h2>
        <div className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{description}</div>
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="h-10 px-4 rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "h-10 px-5 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all disabled:opacity-60 hover:opacity-90",
              danger ? "bg-[var(--danger)]" : "bg-[var(--accent)]"
            )}
          >
            {loading && <RefreshCw size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
