"use client";

import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, type SelectHTMLAttributes, forwardRef } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { useState } from "react";

// ─── Input ───────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, id, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const isPassword = type === "password";
    const currentType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--text)]">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={currentType}
            className={cn(
              "h-10 px-3.5 rounded-xl border bg-[var(--surface)] text-[var(--text)] text-sm w-full",
              "placeholder:text-[var(--text-tertiary)]",
              "transition-all duration-150 focus:outline-none",
              isPassword && "pr-10",
              error
                ? "border-[var(--danger)] focus:ring-2 focus:ring-[var(--danger)]/20"
                : "border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text)] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {hint && !error && <p className="text-xs text-[var(--text-tertiary)]">{hint}</p>}
        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// ─── Select ──────────────────────────────────────────────────────────────────

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[var(--text)]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full h-10 pl-3.5 pr-9 rounded-xl border bg-[var(--surface)] text-[var(--text)] text-sm",
              "appearance-none cursor-pointer transition-all duration-150 focus:outline-none",
              error
                ? "border-[var(--danger)] focus:ring-2 focus:ring-[var(--danger)]/20"
                : "border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none"
          />
        </div>
        {hint && !error && <p className="text-xs text-[var(--text-tertiary)]">{hint}</p>}
        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

// ─── Toggle ──────────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <label className={cn("flex items-center gap-3 cursor-pointer group", disabled && "opacity-50 cursor-not-allowed")}>
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0",
          checked ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
        )}
      >
        <div
          className={cn(
            "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-1"
          )}
        />
      </div>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-[var(--text)]">{label}</p>}
          {description && <p className="text-xs text-[var(--text-secondary)]">{description}</p>}
        </div>
      )}
    </label>
  );
}

// ─── Slider ──────────────────────────────────────────────────────────────────

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  formatValue?: (v: number) => string;
}

export function Slider({ value, onChange, min = 0, max = 100, step = 1, label, formatValue }: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--text)]">{label}</span>
          <span className="text-sm font-medium text-[var(--accent)]">
            {formatValue ? formatValue(value) : value}
          </span>
        </div>
      )}
      <div className="relative h-5 flex items-center">
        <div className="w-full h-1.5 rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-pointer w-full"
        />
        <div
          className="absolute w-4 h-4 rounded-full bg-white border-2 border-[var(--accent)] shadow-sm transition-all"
          style={{ left: `calc(${percent}% - 8px)` }}
        />
      </div>
    </div>
  );
}
