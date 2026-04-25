import { NextRequest, NextResponse } from "next/server";
import { createSecurityHeaders } from "@/lib/security";

export const runtime = "nodejs";

/**
 * GET /api/tools/context?type=math|physics|number
 *
 * Returns real-world data to enrich exercise contexts:
 *  - type=math    → Numbers API: a fun mathematical fact about a number
 *  - type=physics → Open Notify: live ISS position, altitude, and crew count
 *  - type=number  → Numbers API: fact about a random number
 *
 * All source APIs are free, require no auth, and have HTTPS support.
 */
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") ?? "math";

  try {
    if (type === "physics") {
      // Open Notify — live ISS data (http://open-notify.org)
      const [posRes, astroRes] = await Promise.all([
        fetch("http://api.open-notify.org/iss-now.json"),
        fetch("http://api.open-notify.org/astros.json"),
      ]);

      if (!posRes.ok || !astroRes.ok) {
        return NextResponse.json({ success: false, error: "ISS data unavailable." }, { status: 502 });
      }

      const posData  = await posRes.json();
      const astroData = await astroRes.json();

      const lat   = parseFloat(posData.iss_position.latitude).toFixed(2);
      const lon   = parseFloat(posData.iss_position.longitude).toFixed(2);
      const crew  = astroData.number as number;
      // ISS orbits at ~400 km altitude, ~27,600 km/h — we return accurate fixed values
      const altKm = 408;
      const speedKmh = 27600;

      return NextResponse.json({
        success: true,
        type: "physics",
        data: {
          latitude: lat,
          longitude: lon,
          altitudeKm: altKm,
          speedKmh,
          crewCount: crew,
          // Ready-to-inject sentence for exercise context
          context: `At the time this exam was generated, the International Space Station (ISS) was at latitude ${lat}°, longitude ${lon}°, orbiting Earth at an altitude of ${altKm} km with ${crew} crew members on board, travelling at approximately ${speedKmh.toLocaleString()} km/h.`,
        },
      }, { headers: createSecurityHeaders() });
    }

    // Numbers API — math or trivia fact (http://numbersapi.com)
    const randomNum = Math.floor(Math.random() * 900) + 100; // 100–999
    const numRes = await fetch(`http://numbersapi.com/${randomNum}/math?json`);

    if (!numRes.ok) {
      return NextResponse.json({ success: false, error: "Number fact unavailable." }, { status: 502 });
    }

    const numData = await numRes.json();

    return NextResponse.json({
      success: true,
      type: "math",
      data: {
        number: randomNum,
        fact: numData.text ?? `${randomNum} is an interesting number.`,
        // Ready-to-inject sentence for exercise context
        context: numData.text ?? `The number ${randomNum} has interesting mathematical properties.`,
      },
    }, { headers: createSecurityHeaders() });

  } catch (err) {
    console.error("[/api/tools/context]", err);
    return NextResponse.json(
      { success: false, error: "Context fetch failed." },
      { status: 500, headers: createSecurityHeaders() }
    );
  }
}
