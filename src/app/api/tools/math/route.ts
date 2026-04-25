import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSecurityHeaders } from "@/lib/security";

export const runtime = "nodejs";

const NEWTON_BASE = "https://newton.vercel.app/api/v2";

const OPERATIONS = [
  "simplify",
  "factor",
  "derive",
  "integrate",
  "zeroes",
  "tangent",
  "area",
  "cos",
  "sin",
  "tan",
  "log",
  "arccos",
  "arcsin",
  "arctan",
  "abs",
] as const;

const RequestSchema = z.object({
  operation: z.enum(OPERATIONS),
  expression: z.string().min(1).max(500),
});

/**
 * POST /api/tools/math
 * Proxies Newton API — free math computation (simplify, factor, derive, integrate, etc.)
 * Newton docs: https://newton.vercel.app/
 *
 * Example: { operation: "derive", expression: "x^2+2x" }
 * Returns:  { operation: "derive", expression: "x^2+2x", result: "2 x + 2" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid operation or expression." },
        { status: 400, headers: createSecurityHeaders() }
      );
    }

    const { operation, expression } = parsed.data;

    // Newton requires URL-encoding of the expression
    const encoded = encodeURIComponent(expression);
    const res = await fetch(`${NEWTON_BASE}/${operation}/${encoded}`, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "Math computation failed. Check your expression." },
        { status: 502, headers: createSecurityHeaders() }
      );
    }

    const data = await res.json();
    return NextResponse.json(
      { success: true, result: data.result, operation: data.operation, expression: data.expression },
      { headers: createSecurityHeaders() }
    );
  } catch (err) {
    console.error("[/api/tools/math]", err);
    return NextResponse.json(
      { success: false, error: "Computation error." },
      { status: 500, headers: createSecurityHeaders() }
    );
  }
}
