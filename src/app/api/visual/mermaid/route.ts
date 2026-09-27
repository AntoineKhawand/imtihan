import { NextRequest, NextResponse } from "next/server";

// CodeQL js/request-forgery (alerts #27, #28): the diagram code was base64-encoded
// straight into the request URL, and neither destination host is an allowlist
// CodeQL can see is fixed. Both fetch targets ARE hardcoded literals below (no part
// of the code parameter can change which host is contacted — no attacker-controlled
// SSRF to an internal address is actually possible here), but the base64 alphabet
// includes "+", "/" and "=", which are meaningful URL characters; passed unescaped
// they could still confuse a path parser or intermediary proxy in front of the
// third-party service. encodeURIComponent() closes that off and is the pattern
// CodeQL recognizes as sanitizing a tainted URL segment.
const MERMAID_INK_HOST = "https://mermaid.ink/img/";
const KROKI_HOST = "https://kroki.io/mermaid/png/";
const MAX_CODE_LENGTH = 20_000; // generous for any real diagram; blocks abuse of this unauthenticated route

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return new NextResponse("Missing mermaid code", { status: 400 });
  }
  if (code.length > MAX_CODE_LENGTH) {
    return new NextResponse("Diagram code too large", { status: 413 });
  }

  try {
    // 1. Try Mermaid.ink (Fastest)
    try {
      const config = {
        code: code.trim(),
        mermaid: { theme: "neutral" }
      };
      const b64 = Buffer.from(JSON.stringify(config)).toString("base64");
      const res = await fetch(`${MERMAID_INK_HOST}${encodeURIComponent(b64)}`, { next: { revalidate: 3600 } });
      if (res.ok) {
        const blob = await res.blob();
        return new NextResponse(blob, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" } });
      }
    } catch (e) {
      console.warn("Mermaid.ink failed, falling back to Kroki:", e);
    }

    // 2. Fallback to Kroki (Most Reliable for complex diagrams)
    try {
      const kb64 = Buffer.from(code.trim()).toString("base64url");
      const res = await fetch(`${KROKI_HOST}${encodeURIComponent(kb64)}`);
      if (res.ok) {
        const blob = await res.blob();
        return new NextResponse(blob, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" } });
      }
    } catch (e) {
      console.error("Kroki failed:", e);
    }

    return new NextResponse("Failed to render diagram", { status: 500 });
  } catch (error) {
    return new NextResponse("Server error", { status: 500 });
  }
}
