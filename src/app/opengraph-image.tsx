import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Imtihan — Vos examens, simplement. Mathématiques, physique et chimie avec corrigé.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Local assets keep social crawlers independent of remote image/font services.
export default async function Image() {
  const [logo, serif, regular, semibold] = await Promise.all([
    readFile(join(process.cwd(), "public/Imtihan-logo.png")),
    readFile(join(process.cwd(), "src/assets/social/Fraunces-Medium.ttf")),
    readFile(join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf")),
    readFile(join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.ttf")),
  ]);

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#faf8f3", color: "#17241f", fontFamily: "Geist", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -180, top: -160, width: 800, height: 900, borderRadius: "50%", background: "#e8eee4", transform: "rotate(-18deg)", display: "flex" }} />
      <div style={{ display: "flex", flexDirection: "column", padding: "54px 58px", width: 740, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          {/* Same asset as the website's Logo component. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`data:image/png;base64,${logo.toString("base64")}`} alt="" width={62} height={62} style={{ borderRadius: 15 }} />
          <span style={{ fontSize: 34, fontWeight: 600, letterSpacing: -1 }}>Imtihan</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 45, fontFamily: "Fraunces", fontSize: 76, fontWeight: 500, lineHeight: 1.06, letterSpacing: -3 }}>
          <span>Vos examens,</span>
          <span style={{ color: "#1a5e3f" }}>simplement.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 26, fontSize: 24, lineHeight: 1.4, color: "#526158" }}>
          <span>Mathématiques · Physique · Chimie</span>
          <span>Questions, corrigés et export.</span>
        </div>
        <div style={{ display: "flex", gap: 9, marginTop: 30 }}>
          {["Bac Libanais", "Bac Français", "IB", "Université"].map(label => (
            <div key={label} style={{ display: "flex", padding: "9px 13px", border: "1px solid #cad5c9", borderRadius: 22, fontSize: 16, color: "#294b37" }}>{label}</div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: "auto", fontSize: 19, color: "#1a5e3f", fontWeight: 600 }}>imtihan.live</div>
      </div>
      <div style={{ position: "absolute", left: 816, top: 100, width: 316, height: 422, display: "flex", background: "#c6d5c2", borderRadius: 16, transform: "rotate(8deg)" }} />
      <div style={{ position: "absolute", left: 774, top: 83, width: 328, height: 432, display: "flex", flexDirection: "column", padding: "27px 26px", background: "#ffffff", border: "1px solid #d3dbd0", borderRadius: 16, transform: "rotate(-6deg)", boxShadow: "0 18px 35px rgba(23,36,31,0.10)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #1a5e3f", paddingBottom: 15 }}>
          <span style={{ fontSize: 20, fontWeight: 600 }}>Mathématiques</span>
          <span style={{ fontSize: 13, color: "#66746c" }}>20 pts</span>
        </div>
        <span style={{ marginTop: 19, fontSize: 13, color: "#1a5e3f", fontWeight: 600 }}>EXERCICE 01</span>
        <span style={{ marginTop: 10, fontSize: 22 }}>f(x) = x² − 2x + 1</span>
        <div style={{ display: "flex", marginTop: 20, padding: "10px", background: "#f6f8f3", borderRadius: 8 }}>
          <svg width="250" height="137" viewBox="0 0 250 137" fill="none">
            <path d="M20 112H235M55 126V12" stroke="#b6c6ba" strokeWidth="1.5" />
            <path d="M25 25Q110 200 211 22" stroke="#1a5e3f" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="115" cy="111" r="4" fill="#1a5e3f" />
          </svg>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 11, background: "#e8eee4" }}><div style={{ display: "flex", width: 6, height: 10, borderRight: "2px solid #1a5e3f", borderBottom: "2px solid #1a5e3f", transform: "rotate(45deg)", marginTop: -3 }} /></div>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#1a5e3f" }}>Corrigé inclus</span>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: serif, weight: 500, style: "normal" },
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
