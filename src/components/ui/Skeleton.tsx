import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Base shimmer skeleton block.
 * Uses the `.skeleton` utility class defined in globals.css.
 */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton", className)} />;
}

/** Skeleton for an exam row card in the dashboard */
export function SkeletonExamRow() {
  return (
    <div className="card p-4 flex items-center gap-4">
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48 rounded-md" />
        <Skeleton className="h-3 w-32 rounded-md" />
      </div>
      <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
    </div>
  );
}

/** Skeleton for a bank card */
export function SkeletonBankCard() {
  return (
    <div className="card overflow-hidden">
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <div className="flex gap-4">
          <Skeleton className="h-3 w-12 rounded-md" />
          <Skeleton className="h-3 w-12 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton for a stat card */
export function SkeletonStatCard() {
  return (
    <div className="card p-4 text-center space-y-2">
      <Skeleton className="h-7 w-12 rounded-md mx-auto" />
      <Skeleton className="h-3 w-20 rounded-md mx-auto" />
    </div>
  );
}

/** Renders N skeleton rows for a list loading state */
export function SkeletonList({ count = 3, variant = "exam" }: { count?: number; variant?: "exam" | "bank" }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) =>
        variant === "bank" ? <SkeletonBankCard key={i} /> : <SkeletonExamRow key={i} />
      )}
    </div>
  );
}
