import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://imtihan.app";

/**
 * Auto-generated robots.txt
 * Marketing pages: indexable
 * App pages (create, dashboard, bank, community, auth, api): blocked
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/contact", "/privacy", "/terms"],
        disallow: [
          "/create",
          "/dashboard",
          "/bank",
          "/community",
          "/auth/",
          "/api/",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
