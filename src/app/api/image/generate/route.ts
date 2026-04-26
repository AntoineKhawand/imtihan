import { NextRequest, NextResponse } from "next/server";

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

  // We use the FLUX model which is currently the best 'open' model for scientific diagrams.
  // By proxying through our own API, we can add caching or switch providers (OpenAI/Stability) 
  // without changing the frontend code.
  const cleanPrompt = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&nologo=true&seed=${seed}&model=flux`;

  // Redirecting to the image provider. This is faster than proxying the buffer.
  return NextResponse.redirect(imageUrl);
}
