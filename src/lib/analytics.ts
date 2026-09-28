/**
 * Thin wrapper around the gtag() global set up in src/app/layout.tsx.
 * Guards against gtag not being loaded yet (ad blockers, slow script load,
 * or running before the afterInteractive <Script> tag executes) so a
 * tracking call never throws and breaks the actual user-facing action it's
 * attached to.
 */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== "function") return;
  try {
    gtag("event", name, params);
  } catch {
    // Never let analytics break the real feature it's attached to.
  }
}
