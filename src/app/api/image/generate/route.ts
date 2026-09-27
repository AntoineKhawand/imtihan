import { NextRequest, NextResponse } from "next/server";

// FOUNDER_DECISIONS.md #8 covered this route too, but it's a different shape
// than the routes that call a paid AI API: it proxies to pollinations.ai, a
// free third-party service — no direct $ cost to the founder from abuse, and
// it's embedded via <img src> in rendered exam content across authenticated
// AND public-ish pages (renderContent.ts renders it for students on
// /student/practice and possibly shared /exam/[id] links, neither of which
// require a teacher session — see src/proxy.ts's PROTECTED_PATHS), so gating
// it behind login isn't viable without breaking legitimate rendering. Kept
// public; added only an input-length cap, same treatment as the other
// hardcoded-host proxy fixed today (src/app/api/visual/mermaid/route.ts).
const MAX_PROMPT_LENGTH = 2000;

/**
 * Robust Image Generation Proxy
 * Centralizes visual generation logic and provides a reliable endpoint.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get("prompt");
  const width = searchParams.get("width") || "800";
  const height = searchParams.get("height") || "450";
  const seed = searchParams.get("seed") || Math.random().toString();

  if (!prompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({ error: "Prompt too long" }, { status: 413 });
  }

  // We use the FLUX model which is currently the best 'open' model for scientific diagrams.
  // By proxying through our own API, we can add caching or switch providers (OpenAI/Stability) 
  // without changing the frontend code.
  const cleanPrompt = encodeURIComponent(prompt);
  const fluxUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&nologo=true&seed=${seed}&model=flux`;
  const turboUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&nologo=true&seed=${seed}&model=turbo`;

  async function fetchImage(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch image");
    return res;
  }

  try {
    let res;
    try {
      res = await fetchImage(fluxUrl);
    } catch (err) {
      console.warn("[ImageProxy] Flux failed, trying Turbo...", err);
      res = await fetchImage(turboUrl);
    }
    
    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[ImageProxy] Final failure:", err);
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
}
