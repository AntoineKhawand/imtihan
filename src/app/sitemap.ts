import type { MetadataRoute } from "next";
import { adminDb } from "@/lib/firebase-admin";
import { STATIC_BLOG_POSTS } from "./blog/static-posts";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://imtihan.live";

// The 9 hardcoded static blog posts (src/app/blog/<slug>/page.tsx) now come from
// a single shared registry (src/app/blog/static-posts.ts) also used by the /blog
// index page, instead of being a second hand-maintained slug list here that could
// silently drift from the one in blog/page.tsx — see that file's header comment.
const STATIC_BLOG_SLUGS = STATIC_BLOG_POSTS.map((p) => p.slug);

// Static, non-blog marketing/utility pages. Hand-maintained by necessity (each
// has its own priority/changeFrequency and there's no shared registry elsewhere
// in the app to derive these from) but centralized here as one small array —
// adding a new public page is a one-line addition instead of pasting a new
// object into the sitemap's return array.
const STATIC_PAGES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "/upgrade", changeFrequency: "monthly", priority: 0.8 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/generateur-examen-bac-libanais", changeFrequency: "monthly", priority: 0.8 },
  { path: "/ai-exam-generator-lebanon", changeFrequency: "monthly", priority: 0.8 },
  { path: "/ib-exam-generator", changeFrequency: "monthly", priority: 0.8 },
  { path: "/bac-francais-exam-generator", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

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

  const staticPageEntries: MetadataRoute.Sitemap = STATIC_PAGES.map(({ path, changeFrequency, priority }) => ({
    url: `${APP_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const staticBlogEntries: MetadataRoute.Sitemap = STATIC_BLOG_SLUGS.map((slug) => ({
    url: `${APP_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const dynamicBlogEntries: MetadataRoute.Sitemap = dynamicBlogPosts.map(({ slug, lastModified }) => ({
    url: `${APP_URL}/blog/${slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPageEntries, ...staticBlogEntries, ...dynamicBlogEntries];
}
