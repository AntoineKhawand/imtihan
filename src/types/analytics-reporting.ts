/**
 * Shapes returned by the read-only GA4 Data API library
 * (`src/lib/analytics-reporting.ts`).
 *
 * This is a standalone library — as of this writing nothing in the app
 * imports it. It exists so the nightly automation (or a future admin
 * surface) can eventually read real GA4 numbers, the same way `seo-growth`
 * already reads real Search Console data via the `gsc` MCP tools. See
 * `docs/GA4_SETUP.md` for how the founder grants the access this needs.
 */

/** The two real conversion events already instrumented via `src/lib/analytics.ts` / gtag. */
export type AnalyticsConversionEventName = "sign_up" | "exam_generated";

export interface AnalyticsChannelSessions {
  /**
   * GA4's "Default channel group" dimension value for a session, e.g.
   * "Direct", "Organic Search", "Referral", "Unassigned". Not a closed enum —
   * GA4 can introduce new channel names, so this is a plain string.
   */
  channel: string;
  sessions: number;
}

export interface AnalyticsConversionEventCount {
  eventName: AnalyticsConversionEventName;
  count: number;
}

/** Successful result of `getAnalyticsSummary()` — GA4 access is configured and the query succeeded. */
export interface AnalyticsSummary {
  configured: true;
  startDate: string;
  endDate: string;
  totalSessions: number;
  totalUsers: number;
  sessionsByChannel: AnalyticsChannelSessions[];
  /** Always has exactly one entry per `AnalyticsConversionEventName`, defaulting to 0 if GA4 reports no rows for it. */
  conversionEvents: AnalyticsConversionEventCount[];
}

/**
 * Returned instead of throwing when `GA4_PROPERTY_ID` / `GA4_SERVICE_ACCOUNT_EMAIL` /
 * `GA4_SERVICE_ACCOUNT_PRIVATE_KEY` are not set — the expected state until the
 * founder completes `docs/GA4_SETUP.md`. This is the common case right now.
 */
export interface AnalyticsNotConfigured {
  configured: false;
  reason: string;
}

export type AnalyticsSummaryResult = AnalyticsSummary | AnalyticsNotConfigured;
