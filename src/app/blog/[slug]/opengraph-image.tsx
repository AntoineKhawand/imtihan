import { ImageResponse } from "next/og";
import { getPost } from "./page";

// Image metadata
export const alt = "Imtihan Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Per-post Open Graph image for /blog/[slug].
 * Falls back to a generic "Imtihan Blog" card if the post can't be
 * resolved (e.g. Firestore lookup fails at build/request time) so a
 * broken fetch never results in a missing og:image.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let title = "Imtihan Blog";
  let category = "Imtihan";
  try {
    const post = await getPost(slug);
    if (post) {
      title = post.title;
      category = post.category || "Imtihan";
    }
  } catch {
    // Keep the generic fallback above.
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "#faf8f3",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top: Logo + Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "#1a5e3f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              color: "white",
              fontWeight: "600",
            }}
          >
            إ
          </div>
          <span
            style={{ fontSize: "32px", fontWeight: "700", color: "#0a0a0a", letterSpacing: "-0.5px" }}
          >
            Imtihan
          </span>
        </div>

        {/* Middle: Post title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "920px" }}>
          <span
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#1a5e3f",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            {category}
          </span>
          <div
            style={{
              fontSize: title.length > 60 ? "48px" : "58px",
              fontWeight: "300",
              color: "#0a0a0a",
              lineHeight: "1.15",
              letterSpacing: "-1.5px",
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom: tag */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div
            style={{
              padding: "8px 18px",
              borderRadius: "100px",
              border: "1.5px solid rgba(0,0,0,0.10)",
              fontSize: "16px",
              color: "#5c5c5c",
              background: "white",
            }}
          >
            Imtihan Blog
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
