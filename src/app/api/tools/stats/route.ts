import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ScientificService } from "@/lib/scientific";
import { createSecurityHeaders } from "@/lib/security";

export const runtime = "nodejs";

const RequestSchema = z.object({
  numbers: z.array(z.number()).min(1).max(200),
});

/**
 * POST /api/tools/stats
 * Computes descriptive statistics for a list of numbers using Math.js.
 * Returns mean, median, std dev (population), variance, min, max in one call.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Accept either { numbers: [1,2,3] } or { numbers: "1, 2, 3" }
    if (typeof body.numbers === "string") {
      body.numbers = body.numbers
        .split(/[,;\s]+/)
        .map((s: string) => parseFloat(s.trim()))
        .filter((n: number) => !isNaN(n));
    }

    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Provide at least one valid number." },
        { status: 400, headers: createSecurityHeaders() }
      );
    }

    const data = parsed.data.numbers;
    const s = ScientificService.stats;
    const fmt = (v: unknown) => ScientificService.format(Number(v), 6);

    return NextResponse.json({
      success: true,
      count: data.length,
      results: {
        mean:     fmt(s.mean(data)),
        median:   fmt(s.median(data)),
        std:      fmt(s.std(data)),
        variance: fmt(s.variance(data)),
        min:      fmt(s.min(data)),
        max:      fmt(s.max(data)),
        range:    fmt(s.max(data) - s.min(data)),
      },
    }, { headers: createSecurityHeaders() });
  } catch (err) {
    console.error("[/api/tools/stats]", err);
    return NextResponse.json(
      { success: false, error: "Computation error." },
      { status: 500, headers: createSecurityHeaders() }
    );
  }
}
