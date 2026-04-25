import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Formula } from "@chemistry/formula";
import { createSecurityHeaders } from "@/lib/security";

export const runtime = "nodejs";

const RequestSchema = z.object({
  formula: z.string().min(1).max(200),
});

/**
 * POST /api/tools/chemistry
 * Parses a chemical formula and returns:
 *  - element composition (atom count per element)
 *  - molecular weight in g/mol
 *  - formatted formula string
 *
 * Powered by @chemistry/formula.
 * Example: { formula: "C2H5OH" }
 * Returns:  { weight: 46.068, elements: { C: 2, H: 6, O: 1 }, formula: "C₂H₅OH" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Provide a valid chemical formula." },
        { status: 400, headers: createSecurityHeaders() }
      );
    }

    const input = parsed.data.formula.trim();

    const formulaObj = Formula.parse(input);
    const weight = Formula.convertToWeight(formulaObj);

    // Build a human-readable element list
    const elements: Record<string, number> = {};
    for (const [el, count] of Object.entries(formulaObj)) {
      elements[el] = count as number;
    }

    return NextResponse.json({
      success: true,
      input,
      weight: Math.round(weight * 1000) / 1000, // round to 3 decimal places
      unit: "g/mol",
      elements,
      elementCount: Object.keys(elements).length,
    }, { headers: createSecurityHeaders() });

  } catch (err) {
    console.error("[/api/tools/chemistry]", err);
    return NextResponse.json(
      { success: false, error: "Invalid formula. Check element symbols and subscripts (e.g. H2O, NaCl, C6H12O6)." },
      { status: 400, headers: createSecurityHeaders() }
    );
  }
}
