import { NextRequest, NextResponse } from "next/server";
import { createSecurityHeaders } from "@/lib/security";

export const runtime = "nodejs";

const NIST_URL = "https://physics.nist.gov/cuu/Constants/Table/allascii.txt";

interface Constant {
  name: string;
  value: string;       // e.g. "6.62607015e-34"
  valueDisplay: string; // e.g. "6.626 070 15 × 10⁻³⁴"
  uncertainty: string;
  unit: string;
}

// In-memory cache — fetched once per serverless instance lifetime
let cache: Constant[] | null = null;
let cacheAt = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/** Convert NIST scientific notation to display form: "6.626 070 15 e-34" → "6.626 070 15 × 10⁻³⁴" */
function displayValue(raw: string): string {
  return raw
    .replace(/\s*e([+-]\d+)/i, (_, exp) => {
      const sign = exp[0] === "-" ? "⁻" : "";
      const digits = exp.slice(1).replace(/^0+/, "") || "0";
      const sup = digits.split("").map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[parseInt(d)]).join("");
      return ` × 10${sign}${sup}`;
    });
}

/** Normalise NIST value string to a parseable number string */
function normaliseValue(raw: string): string {
  return raw.replace(/\s+/g, "").replace(/[×x]/gi, "e").toLowerCase();
}

function parseNist(text: string): Constant[] {
  const constants: Constant[] = [];
  const lines = text.split("\n");

  // Find the separator line (all dashes) — data starts after it
  const sepIdx = lines.findIndex((l) => /^-{40,}/.test(l.trim()));
  if (sepIdx === -1) return constants;

  for (let i = sepIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("---")) continue;

    // Fixed-width columns (measured from the header):
    // name 0-59 | value 60-99 | uncertainty 100-129 | unit 130+
    const name        = line.slice(0, 60).trim();
    const valueRaw    = line.slice(60, 100).trim();
    const uncertainty = line.slice(100, 130).trim();
    const unit        = line.slice(130).trim();

    if (!name || !valueRaw) continue;

    constants.push({
      name,
      value: normaliseValue(valueRaw),
      valueDisplay: displayValue(valueRaw),
      uncertainty: uncertainty || "(exact)",
      unit,
    });
  }

  return constants;
}

async function getConstants(): Promise<Constant[]> {
  if (cache && Date.now() - cacheAt < CACHE_TTL) return cache;

  const res = await fetch(NIST_URL, {
    headers: { "User-Agent": "Imtihan/1.0 (exam-generator; contact: hello@imtihan.live)" },
  });
  if (!res.ok) throw new Error(`NIST returned ${res.status}`);

  const text = await res.text();
  cache = parseNist(text);
  cacheAt = Date.now();
  return cache;
}

/**
 * GET /api/tools/physics?q=speed+of+light
 *
 * Searches NIST 2022 CODATA fundamental physical constants.
 * Returns name, precise value, uncertainty, and unit — ready for "Données :" blocks.
 * Data is cached for 24 hours.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase();

  if (!q) {
    return NextResponse.json(
      { success: false, error: "Provide a search query with ?q=..." },
      { status: 400, headers: createSecurityHeaders() }
    );
  }

  try {
    const all = await getConstants();

    // Score: exact match first, then starts-with, then contains
    const scored = all
      .map((c) => {
        const n = c.name.toLowerCase();
        const score = n === q ? 3 : n.startsWith(q) ? 2 : n.includes(q) ? 1 : 0;
        return { ...c, score };
      })
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    return NextResponse.json(
      { success: true, count: scored.length, constants: scored },
      { headers: createSecurityHeaders() }
    );
  } catch (err) {
    console.error("[/api/tools/physics]", err);
    return NextResponse.json(
      { success: false, error: "Could not reach NIST. Try again." },
      { status: 502, headers: createSecurityHeaders() }
    );
  }
}
