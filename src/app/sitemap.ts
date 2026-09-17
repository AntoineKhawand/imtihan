import type { MetadataRoute } from "next";
import { adminDb } from "@/lib/firebase-admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://imtihan.live";

// The static seed posts also hardcoded as STATIC_ARTICLES in src/app/blog/page.tsx.
// Kept as a fixed list here (not queried) since they aren't Firestore documents.
const STATIC_BLOG_SLUGS = [
  "stop-recycled-exams",
  "save-time-teaching",
  "guide-for-parents",
  "exam-standardization",
  "university-assessment-ai",
  "generate-bac-libanais-chemistry",
  "ib-mark-scheme-generator",
  "generate-bac-francais-devoir",
  "lebanese-teachers-ai-exam-generator",
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

  return [
    {
      url: APP_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${APP_URL}/upgrade`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/generateur-examen-bac-libanais`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/ai-exam-generator-lebanon`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/ib-exam-generator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/bac-francais-exam-generator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/blog/stop-recycled-exams`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/blog/save-time-teaching`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/blog/guide-for-parents`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/blog/exam-standardization`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/blog/university-assessment-ai`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/blog/generate-bac-libanais-chemistry`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/blog/ib-mark-scheme-generator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/blog/generate-bac-francais-devoir`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/blog/lebanese-teachers-ai-exam-generator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...dynamicBlogPosts.map(({ slug, lastModified }) => ({
      url: `${APP_URL}/blog/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${APP_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${APP_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
