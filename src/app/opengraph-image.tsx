import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Imtihan — Générateur d'examens IA pour enseignants au Liban";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Auto-generated Open Graph image served at /opengraph-image
 * Used for social media sharing (Twitter, LinkedIn, WhatsApp, iMessage)
 */
export default function Image() {
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

        {/* Middle: Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "820px" }}>
          <div
            style={{
              fontSize: "64px",
              fontWeight: "300",
              color: "#0a0a0a",
              lineHeight: "1",
              letterSpacing: "-2px",
            }}
          >
            Générez un examen complet
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: "300",
              color: "#1a5e3f",
              lineHeight: "1",
              letterSpacing: "-2px",
              fontStyle: "italic",
            }}
          >
            en quelques secondes.
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#5c5c5c",
              fontWeight: "400",
              marginTop: "8px",
              lineHeight: "1.4",
            }}
          >
            Bac Libanais · Bac Français · IB · Université — Corrigé complet inclus
          </div>
        </div>

        {/* Bottom: Social proof chips */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {["2 examens gratuits", "Bac Libanais", "Bac Français", "IB"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "8px 18px",
                borderRadius: "100px",
                border: "1.5px solid rgba(0,0,0,0.10)",
                fontSize: "16px",
                color: "#5c5c5c",
                background: "white",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
