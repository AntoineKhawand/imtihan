"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, ...props }: InputProps) {
  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-[var(--text)] uppercase tracking-wide mb-2">
        {label}
      </label>
      <input
        {...props}
        className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors"
      />
    </div>
  );
}

interface ToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  locked?: boolean;
}

export function Toggle({ label, description, checked, onChange, disabled, locked }: ToggleProps) {
  return (
    <div
      onClick={() => !disabled && !locked && onChange(!checked)}
      className={cn(
        "relative flex items-center justify-between p-4 rounded-xl border border-[var(--border)] transition-colors",
        (disabled || locked)
          ? "opacity-60 cursor-not-allowed bg-[var(--bg-subtle)]"
          : "hover:border-[var(--border-strong)] cursor-pointer"
      )}
    >
      <div>
        <p className="text-sm font-medium text-[var(--text)]">{label}</p>
        <p className="text-xs text-[var(--text-secondary)] mt-1">{description}</p>
      </div>
      <div
        className={cn(
          "w-10 h-6 rounded-full flex items-center p-1 transition-colors flex-shrink-0",
          checked ? "bg-[var(--accent)]" : "bg-[var(--bg-subtle)]"
        )}
      >
        <div
          className={cn(
            "w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </div>
      {locked && (
        <span className="absolute top-2 right-2 text-[10px] uppercase tracking-wider font-bold text-[var(--accent)] px-2 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent)]/20">
          Pro
        </span>
      )}
    </div>
  );
}

interface TemplateCardProps {
  label: string;
  id: string;
  selected: boolean;
  onSelect: () => void;
  children?: import("react").ReactNode;
}

export function TemplateCard({ label, selected, onSelect, children }: TemplateCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative w-full aspect-[3/4] rounded-xl border-2 flex flex-col items-center justify-between text-center p-3 transition-all",
        selected
          ? "border-[var(--accent)] shadow-lg"
          : "border-[var(--border)] hover:border-[var(--border-strong)]"
      )}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
          <Check size={12} className="text-white" />
        </div>
      )}
      {children && <div className="flex-1 w-full flex items-center justify-center">{children}</div>}
      <span className="text-sm font-medium text-[var(--text)] mt-2">{label}</span>
    </button>
  );
}