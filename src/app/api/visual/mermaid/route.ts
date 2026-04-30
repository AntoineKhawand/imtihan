import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  
  if (!code) {
    return new NextResponse("Missing mermaid code", { status: 400 });
  }

  try {
    // 1. Try Mermaid.ink (Fastest)
    try {
      const config = {
        code: code.trim(),
        mermaid: { theme: "neutral" }
      };
      const b64 = Buffer.from(JSON.stringify(config)).toString("base64");
      const res = await fetch(`https://mermaid.ink/img/${b64}`, { next: { revalidate: 3600 } });
      if (res.ok) {
        const blob = await res.blob();
        return new NextResponse(blob, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" } });
      }
    } catch (e) {
      console.warn("Mermaid.ink failed, falling back to Kroki:", e);
    }

    // 2. Fallback to Kroki (Most Reliable for complex diagrams)
    try {
      // Kroki expects pako compressed or just plain text for some formats, 
      // but simple GET with base64 works for most.
      const kb64 = Buffer.from(code.trim()).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
      const res = await fetch(`https://kroki.io/mermaid/png/${kb64}`);
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
