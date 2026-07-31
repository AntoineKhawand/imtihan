import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds backdrop-blur and glass effect — good for overlaid surfaces */
  elevated?: boolean;
  /** Extra horizontal+vertical padding preset */
  padded?: boolean;
}

/**
 * Claymorphism card component.
 * Applies: rounded-[20px], layered soft shadow, subtle white/20 border.
 * Use `elevated` for glass-blur variant (modals, overlays).
 */
export function Card({ elevated = false, padded = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        elevated ? "card-elevated" : "card",
        padded && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
