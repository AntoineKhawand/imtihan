import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyIdToken } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin";
import { getAnalyticsSummary } from "@/lib/analytics-reporting";

export const dynamic = "force-dynamic";
const periodSchema = z.enum(["7", "28"]);
const headers = { "Cache-Control": "private, no-store" };

export async function GET(request: NextRequest) {
  try {
    const uid = await verifyIdToken(request);
    if (!uid || !(await isAdmin(uid))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
    }
    const period = periodSchema.safeParse(request.nextUrl.searchParams.get("days") ?? "28");
    if (!period.success) {
      return NextResponse.json({ error: "days must be 7 or 28" }, { status: 400, headers });
    }
    // Completed days avoid comparing a partial today with historical full days.
    const result = await getAnalyticsSummary(`${period.data}daysAgo`, "yesterday");
    return NextResponse.json(result, { headers });
  } catch {
    // Never return/log provider errors: they can contain credential/request details.
    return NextResponse.json({ error: "Analytics unavailable. Check GA4 configuration and property access." }, { status: 503, headers });
  }
}
