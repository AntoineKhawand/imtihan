import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  
  if (!code) {
    return new NextResponse("Missing mermaid code", { status: 400 });
  }

  try {
    // We use mermaid.ink as the reliable backend for rendering.
    // By doing this on the server, we avoid client-side base64 issues and 
    // can easily swap the provider (e.g., to Kroki) later if needed.
    const config = {
      code: code.trim(),
      mermaid: { 
        theme: "neutral",
        fontFamily: "var(--font-geist), system-ui, sans-serif"
      }
    };

    const json = JSON.stringify(config);
    const b64 = Buffer.from(json).toString("base64");
    
    // Redirect to the rendering service
    return NextResponse.redirect(`https://mermaid.ink/img/${b64}`, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      }
    });
  } catch (error) {
    console.error("Mermaid rendering error:", error);
    return new NextResponse("Failed to process diagram", { status: 500 });
  }
}
