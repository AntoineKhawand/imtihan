import type { MetadataRoute } from "next";
import { adminDb } from "@/lib/firebase-admin";
import { STATIC_SITEMAP_ROUTES } from "@/lib/seo/static-sitemap-routes";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://imtihan.live";

// The static seed posts also hardcoded as STATIC_ARTICLES in src/app/blog/page.tsx.
// Derived from STATIC_SITEMAP_ROUTES (itself generated from src/app/blog/*/page.tsx
// by scripts/generate-static-routes.mjs) instead of a second hand-maintained list,
// so the two can't drift apart from each other.
const STATIC_BLOG_SLUGS = STATIC_SITEMAP_ROUTES.filter((r) => r.path.startsWith("/blog/")).map((r) =>
  r.path.slice("/blog/".length)
);

// The autonomous blog engine (see /admin's Blog tab) publishes new posts to
// Firestore's blog_posts collection daily — this list only ever covered the
// original static seed set, so every post it has published since was never
// in the sitemap at all (confirmed via Search Console: an indexed post,
// "the-may-marathon-...", isn't in STATIC_BLOG_SLUGS above). Query the same
// collection src/app/blog/page.tsx reads from, so the sitemap always matches
// what's actually browsable at /blog.
async function getDynamicBlogSlugs(): Promise<{ slug: string; lastModified: Date }[]> {
  try {
    const snapshot = await adminDb.collection("blog_posts").orderBy("createdAt", "desc").get();
    return snapshot.docs
      .map((doc) => {
        const data = doc.data();
        const createdAt =
          data.createdAt && typeof data.createdAt.toDate === "function"
            ? data.createdAt.toDate()
            : data.createdAt
              ? new Date(data.createdAt)
              : new Date();
        return { slug: data.slug as string, lastModified: createdAt };
      })
      .filter((p) => !!p.slug && !STATIC_BLOG_SLUGS.includes(p.slug));
  } catch (e) {
    console.error("[sitemap] Firestore blog_posts query failed, sitemap will omit dynamic posts:", e);
    return [];
  }
}

/**
 * Auto-generated sitemap.xml
 * Only public (non-authenticated) pages are included.
 * App pages (/create, /dashboard, /bank, /auth, /community) are excluded.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const dynamicBlogPosts = await getDynamicBlogSlugs();

  // STATIC_SITEMAP_ROUTES is generated from src/app/**/page.tsx by
  // scripts/generate-static-routes.mjs (see that file for the exclusion
  // rules — auth/admin/api/test-only surfaces, dynamic route segments, and
  // the Stripe post-checkout pages are left out) instead of hand-maintained
  // here, so new landing/blog pages can't silently go missing from the
  // sitemap the way they used to.
  const staticEntries: MetadataRoute.Sitemap = STATIC_SITEMAP_ROUTES.map((route) => ({
    url: route.path === "/" ? APP_URL : `${APP_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  return [
    ...staticEntries,
    ...dynamicBlogPosts.map(({ slug, lastModified }) => ({
      url: `${APP_URL}/blog/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
