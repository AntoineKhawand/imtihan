import { NextRequest, NextResponse } from "next/server";
import { createSecurityHeaders } from "@/lib/security";

export const runtime = "nodejs";

const BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name";
const PROPS = "MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES,Charge";

/**
 * GET /api/tools/pubchem?q=ethanol
 *
 * Fetches chemical property data from PubChem (NIH).
 * Returns: molecular formula, molar mass, IUPAC name, SMILES, charge.
 * No API key required. Free, authoritative.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json(
      { success: false, error: "Provide a compound name with ?q=..." },
      { status: 400, headers: createSecurityHeaders() }
    );
  }

  try {
    const url = `${BASE}/${encodeURIComponent(q)}/property/${PROPS}/JSON`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Imtihan/1.0 (exam-generator; contact: hello@imtihan.live)" },
    });

    if (res.status === 404) {
      return NextResponse.json(
        { success: false, error: `"${q}" not found in PubChem. Try the IUPAC name or common name.` },
        { status: 404, headers: createSecurityHeaders() }
      );
    }
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `PubChem returned ${res.status}.` },
        { status: 502, headers: createSecurityHeaders() }
      );
    }

    const data = await res.json();
    const props = data?.PropertyTable?.Properties?.[0];

    if (!props) {
      return NextResponse.json(
        { success: false, error: "No data returned for this compound." },
        { status: 404, headers: createSecurityHeaders() }
      );
    }

    return NextResponse.json({
      success: true,
      compound: {
        name: q,
        formula:    props.MolecularFormula ?? "—",
        molarMass:  props.MolecularWeight  ?? "—",
        iupacName:  props.IUPACName        ?? "—",
        smiles:     props.CanonicalSMILES  ?? "—",
        charge:     props.Charge           ?? 0,
      },
    }, { headers: createSecurityHeaders() });
  } catch (err) {
    console.error("[/api/tools/pubchem]", err);
    return NextResponse.json(
      { success: false, error: "Could not reach PubChem." },
      { status: 503, headers: createSecurityHeaders() }
    );
  }
}
