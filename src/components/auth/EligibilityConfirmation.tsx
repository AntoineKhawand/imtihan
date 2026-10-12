"use client";
import Link from "next/link";

export function EligibilityConfirmation({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="space-y-2 text-xs leading-relaxed text-[var(--text-secondary)]">
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] p-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
        />
        <span>I confirm that I am at least 18 years old.</span>
      </label>
      <p>
        Accounts are for adults. By creating an account, you agree to the{" "}
        <Link href="/terms" className="underline">
          Terms
        </Link>{" "}
        and acknowledge the{" "}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
        . No date of birth is requested.
      </p>
    </div>
  );
}
