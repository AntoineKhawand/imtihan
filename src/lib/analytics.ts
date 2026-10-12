import { hasAnalyticsConsent } from "@/lib/analyticsConsent";
type AnalyticsParams = Record<string, unknown>;
type PendingEvent = { name: string; params?: AnalyticsParams };
type AnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  imtihanPendingEvents?: PendingEvent[];
};

/** Queue early events until GA is configured; tracking must never break a real action. */
export function trackEvent(name: string, params?: AnalyticsParams): void {
  if (!hasAnalyticsConsent()) return;
  const target = window as AnalyticsWindow;
  try {
    if (typeof target.gtag === "function") target.gtag("event", name, params);
    else {
      target.imtihanPendingEvents ??= [];
      if (target.imtihanPendingEvents.length < 20)
        target.imtihanPendingEvents.push({ name, params });
    }
  } catch {
    /* Ad blockers must not break the app. */
  }
}

/** Give a conversion time to dispatch before a full auth-page navigation. */
export function trackEventAndWait(
  name: string,
  params?: AnalyticsParams,
): Promise<void> {
  if (!hasAnalyticsConsent()) return Promise.resolve();
  return new Promise((resolve) => {
    const finish = () => {
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(finish, 1200);
    trackEvent(name, {
      ...params,
      transport_type: "beacon",
      event_callback: finish,
      event_timeout: 1000,
    });
  });
}
