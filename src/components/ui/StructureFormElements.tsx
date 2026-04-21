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
}

export function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
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
    </div>
  );
}

interface TemplateCardProps {
  label: string;
  id: string;
  selected: boolean;
  onSelect: () => void;
}

export function TemplateCard({ label, id, selected, onSelect }: TemplateCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative w-full aspect-[3/4] rounded-xl border-2 flex items-center justify-center text-center p-4 transition-all",
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
      <span className="text-sm font-medium text-[var(--text)]">{label}</span>
    </button>
  );
}