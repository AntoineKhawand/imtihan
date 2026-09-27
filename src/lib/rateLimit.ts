import { adminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

/**
 * Minimal per-IP daily rate limit, backed by Firestore rather than in-memory
 * state — this app runs on Vercel serverless functions, so a process-memory
 * counter (e.g. express-rate-limit/rate-limiter-flexible, both removed from
 * package.json as unused dead deps earlier — BUG-034) would not actually
 * limit anything: each cold invocation gets its own empty memory. Reuses the
 * same adminDb the rest of the app already uses for quota counters.
 *
 * One doc per (ip, route, day) under `rateLimits/{key}`, incremented
 * atomically. Not exact under heavy concurrency (a short TOCTOU window,
 * same class of imprecision already accepted elsewhere in this codebase's
 * quota checks), but sufficient to bound cost from casual/scripted abuse of
 * an unauthenticated route — the actual goal here (FOUNDER_DECISIONS.md #8).
 */
export async function checkAndIncrementDailyLimit(
  route: string,
  ip: string,
  limit: number
): Promise<{ allowed: boolean; count: number }> {
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD, UTC
  const key = `${route}:${ip}:${day}`;
  const ref = adminDb.collection("rateLimits").doc(key);

  const result = await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists ? (snap.data()?.count ?? 0) : 0;
    if (current >= limit) return current;
    tx.set(
      ref,
      { count: admin.firestore.FieldValue.increment(1), route, day, updatedAt: Date.now() },
      { merge: true }
    );
    return current + 1;
  });

  return { allowed: result <= limit, count: result };
}

/** Best-effort client IP from standard proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
