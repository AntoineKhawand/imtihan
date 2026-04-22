import type { MetadataRoute } from "next";

/**
 * Web App Manifest — enables PWA behaviour and "Add to Home Screen"
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Imtihan — Générateur d'examens IA",
    short_name: "Imtihan",
    description:
      "Créez des examens Bac Libanais, Bac Français, IB et Université en quelques secondes avec l'IA.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f3",
    theme_color: "#1a5e3f",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["education", "productivity"],
    lang: "fr",
    dir: "ltr",
  };
}
