import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // serverActions.bodySizeLimit was removed in Next.js 16 (now unlimited by default for route handlers)
  turbopack: {
    // Pin root to project dir so Turbopack doesn't pick up stray lockfiles in parent directories
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
