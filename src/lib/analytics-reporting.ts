/**
 * GA4 Data API (read-only) — server-side only.
 *
 * Standalone library. Nothing in the app imports this yet, and this task
 * deliberately does not add an API route, admin-page surface, or nightly-ops
 * wiring for it — see the task note this file was built against. It exists
 * so a future task can read real GA4 numbers (sessions, traffic sources,
 * `sign_up`/`exam_generated` conversion counts) the same way `seo-growth`
 * already reads real Search Console data.
 *
 * Auth follows the exact pattern already used for Firebase Admin in
 * `src/lib/firebase-admin.ts` (see CLAUDE.md §12's documented gotcha): a
 * service-account private key from an env var needs its literal `\n`
 * sequences turned into real newlines before use.
 *
 * GA4 access is not yet granted (no service account exists yet — see
 * `docs/GA4_SETUP.md`), so this module MUST NOT throw a raw error or crash
 * anything when `GA4_PROPERTY_ID` / `GA4_SERVICE_ACCOUNT_EMAIL` /
 * `GA4_SERVICE_ACCOUNT_PRIVATE_KEY` are unset. `getAnalyticsSummary()` checks
 * for that up front and returns `{ configured: false, reason }` instead.
 */
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { z } from "zod";
import type {
  AnalyticsConversionEventName,
  AnalyticsSummary,
  AnalyticsSummaryResult,
} from "@/types/analytics-reporting";

const CONVERSION_EVENT_NAMES: readonly AnalyticsConversionEventName[] = [
  "sign_up",
  "exam_generated",
];

/** Thrown only once GA4 access is confirmed configured but the API call itself fails
 * (bad/expired credentials, GA4 property access not granted to the service account,
 * network failure, etc). Catchable and distinct from a raw googleapis/gRPC error,
 * which can be a large, hard-to-read object. */
export class AnalyticsReportingError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = "AnalyticsReportingError";
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

/** ISO date (YYYY-MM-DD) or a GA4 relative date keyword, e.g. "7daysAgo", "today", "yesterday". */
const ga4DateSchema = z
  .string()
  .regex(
    /^(\d{4}-\d{2}-\d{2}|today|yesterday|\d+daysAgo)$/,
    "must be an ISO date (YYYY-MM-DD) or a GA4 relative date string (e.g. '7daysAgo', 'today', 'yesterday')"
  );

const analyticsSummarySchema = z.object({
  configured: z.literal(true),
  startDate: z.string(),
  endDate: z.string(),
  totalSessions: z.number().nonnegative(),
  totalUsers: z.number().nonnegative(),
  sessionsByChannel: z.array(
    z.object({
      channel: z.string(),
      sessions: z.number().nonnegative(),
    })
  ),
  conversionEvents: z.array(
    z.object({
      eventName: z.enum(["sign_up", "exam_generated"]),
      count: z.number().nonnegative(),
    })
  ),
});

interface Ga4Config {
  propertyId: string;
  clientEmail: string;
  privateKey: string;
}

/** Returns null (never throws) when any of the 3 required env vars is missing. */
function getConfig(): Ga4Config | null {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();
  const clientEmail = process.env.GA4_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawKey = process.env.GA4_SERVICE_ACCOUNT_PRIVATE_KEY;
  const privateKey = rawKey
    ?.replace(/^["']|["']$/g, "") // Strip leading/trailing quotes
    .replace(/\\n/g, "\n");

  if (!propertyId || !clientEmail || !privateKey) return null;
  return { propertyId, clientEmail, privateKey };
}

function missingConfigReason(): string {
  const missing: string[] = [];
  if (!process.env.GA4_PROPERTY_ID?.trim()) missing.push("GA4_PROPERTY_ID");
  if (!process.env.GA4_SERVICE_ACCOUNT_EMAIL?.trim()) missing.push("GA4_SERVICE_ACCOUNT_EMAIL");
  if (!process.env.GA4_SERVICE_ACCOUNT_PRIVATE_KEY) missing.push("GA4_SERVICE_ACCOUNT_PRIVATE_KEY");
  return `GA4 reporting is not configured — missing env var(s): ${missing.join(", ")}. See docs/GA4_SETUP.md.`;
}

let _client: BetaAnalyticsDataClient | null = null;
let _clientKey: string | null = null;

/** Lazily constructs (and caches) the GA4 Data API client for a given config. */
function getClient(config: Ga4Config): BetaAnalyticsDataClient {
  // Re-create if the credentials changed (e.g. hot-reload in dev with edited .env.local).
  const key = `${config.clientEmail}:${config.propertyId}`;
  if (_client && _clientKey === key) return _client;

  _client = new BetaAnalyticsDataClient({
    credentials: {
      client_email: config.clientEmail,
      private_key: config.privateKey,
    },
  });
  _clientKey = key;
  return _client;
}

function toNumber(value: string | null | undefined): number {
  const n = Number(value ?? "0");
  return Number.isFinite(n) ? n : 0;
}

/**
 * Query the GA4 Data API for a summary of the given date range: total
 * sessions, total users, sessions broken down by GA4's default channel
 * grouping (the same breakdown manually reported in `METRICS.md`), and
 * counts for the two real conversion events already instrumented client-side
 * (`sign_up`, `exam_generated` — see `src/lib/analytics.ts`).
 *
 * `startDate`/`endDate` accept either an ISO date (`"2026-09-01"`) or a GA4
 * relative date keyword (`"7daysAgo"`, `"yesterday"`, `"today"`).
 *
 * **Never throws for missing configuration.** If `GA4_PROPERTY_ID`,
 * `GA4_SERVICE_ACCOUNT_EMAIL`, or `GA4_SERVICE_ACCOUNT_PRIVATE_KEY` is unset —
 * the expected state until the founder completes `docs/GA4_SETUP.md` — this
 * resolves to `{ configured: false, reason }` instead of calling Google's API
 * at all. Once configured, a real API failure (bad credentials, GA4 property
 * access not granted, network error) throws a catchable
 * `AnalyticsReportingError`, not a raw googleapis/gRPC error. Malformed
 * `startDate`/`endDate` input throws a `ZodError` (a caller bug, not a config
 * state).
 *
 * **Test coverage note** (`src/__tests__/analytics-reporting.test.ts`): only
 * the not-configured path and input-shape sanity checks are tested — there is
 * no real GA4 service account yet, so the actual API-calling path cannot be
 * exercised, and this module deliberately does not mock the whole
 * `@google-analytics/data` client to fake a success response. Treat the
 * API-calling branch as unverified until real credentials exist.
 */
export async function getAnalyticsSummary(
  startDate: string,
  endDate: string
): Promise<AnalyticsSummaryResult> {
  const parsedStartDate = ga4DateSchema.parse(startDate);
  const parsedEndDate = ga4DateSchema.parse(endDate);

  const config = getConfig();
  if (!config) {
    return { configured: false, reason: missingConfigReason() };
  }

  const client = getClient(config);
  const dateRanges = [{ startDate: parsedStartDate, endDate: parsedEndDate }];

  let response;
  try {
    [response] = await client.batchRunReports({
      property: `properties/${config.propertyId}`,
      requests: [
        // 0: overall totals (no dimensions)
        {
          dateRanges,
          metrics: [{ name: "sessions" }, { name: "totalUsers" }],
        },
        // 1: sessions by default channel group
        {
          dateRanges,
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
          metrics: [{ name: "sessions" }],
        },
        // 2: the two tracked conversion events
        {
          dateRanges,
          dimensions: [{ name: "eventName" }],
          metrics: [{ name: "eventCount" }],
          dimensionFilter: {
            filter: {
              fieldName: "eventName",
              inListFilter: { values: [...CONVERSION_EVENT_NAMES] },
            },
          },
        },
      ],
    });
  } catch (err) {
    throw new AnalyticsReportingError(
      "GA4 Data API request failed. Check that the service account has Viewer " +
        "access on the GA4 property (see docs/GA4_SETUP.md) and that GA4_PROPERTY_ID is correct.",
      { cause: err }
    );
  }

  const [totalsReport, channelReport, eventsReport] = response.reports ?? [];

  const totalsRow = totalsReport?.rows?.[0];
  const totalSessions = toNumber(totalsRow?.metricValues?.[0]?.value);
  const totalUsers = toNumber(totalsRow?.metricValues?.[1]?.value);

  const sessionsByChannel = (channelReport?.rows ?? []).map((row) => ({
    channel: row.dimensionValues?.[0]?.value ?? "(not set)",
    sessions: toNumber(row.metricValues?.[0]?.value),
  }));

  const eventCounts = new Map<AnalyticsConversionEventName, number>(
    CONVERSION_EVENT_NAMES.map((name) => [name, 0])
  );
  for (const row of eventsReport?.rows ?? []) {
    const name = row.dimensionValues?.[0]?.value;
    if (name === "sign_up" || name === "exam_generated") {
      eventCounts.set(name, toNumber(row.metricValues?.[0]?.value));
    }
  }
  const conversionEvents = CONVERSION_EVENT_NAMES.map((eventName) => ({
    eventName,
    count: eventCounts.get(eventName) ?? 0,
  }));

  const summary: AnalyticsSummary = {
    configured: true,
    startDate: parsedStartDate,
    endDate: parsedEndDate,
    totalSessions,
    totalUsers,
    sessionsByChannel,
    conversionEvents,
  };

  return analyticsSummarySchema.parse(summary);
}
