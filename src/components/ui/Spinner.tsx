import { cn } from "@/lib/utils";

type SpinnerSize = "xs" | "sm" | "md" | "lg";

const SIZE_MAP: Record<SpinnerSize, string> = {
  xs: "w-3 h-3 border",
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-[3px]",
};

interface SpinnerProps {
  size?: SpinnerSize;
  /** Overrides the spinner ring color (defaults to var(--accent)) */
  color?: string;
  className?: string;
  label?: string;
}

/**
 * Accessible loading spinner.
 * Defaults to emerald (var(--accent)) ring colour.
 */
export function Spinner({ size = "md", color, className, label = "Loading…" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block rounded-full border-t-transparent animate-spin",
        SIZE_MAP[size],
        className
      )}
      style={{
        borderColor: color ?? "var(--accent)",
        borderTopColor: "transparent",
      }}
    />
  );
}

/** Full-page centred spinner */
export function PageSpinner({ label }: { label?: string }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      {label && <p className="text-sm text-[var(--text-secondary)]">{label}</p>}
    </div>
  );
}
