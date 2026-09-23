#!/usr/bin/env node
// Walks src/app for page.tsx files and (re)generates
// src/lib/generated/static-sitemap-routes.ts — the static (non-Firestore)
// portion of the URL list sitemap.ts publishes. Run automatically by the
// "prebuild"/"predev" npm scripts (see package.json) before every build and
// dev server start, so this list can't quietly drift the way the old
// hand-maintained array in sitemap.ts did. Run
// `npm run generate:sitemap-routes` any time you want to refresh it without
// starting a full build/dev server.
//
// Why generate a file instead of having sitemap.ts call fs.readdirSync on
// src/app directly at request time: Next.js serverless bundles are built
// from the module graph (via file tracing), not the raw repo tree, so a
// request-time fs walk over source files is not guaranteed to see them once
// deployed. Generating a plain, statically-imported TS array at build/dev
// time keeps sitemap.ts simple and safe at runtime everywhere, while still
// removing the hand-maintenance burden that caused this script to be written.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.join(__dirname, "..", "src", "app");
// NOTE: deliberately NOT under src/lib/generated/ — .gitignore's bare
// "generated/" rule (added for local test-exam output) matches any
// directory named "generated" anywhere in the tree and would silently
// swallow this file, which needs to be committed so `tsc`/`next dev` work
// without requiring the generator to run first.
const OUT_FILE = path.join(__dirname, "..", "src", "lib", "seo", "static-sitemap-routes.ts");

// Whole subtrees that are authenticated/private app surfaces, admin/API
// internals, or dev-only test pages — never public marketing/content pages.
// Mirrors robots.ts's disallow list, plus a couple of (app)-only routes that
// live outside it (student/, exam/[id] is also caught by the dynamic-segment
// check below, create/, dashboard/, bank/, etc.).
const EXCLUDED_TOP_SEGMENTS = new Set([
  "admin",
  "analytics",
  "api",
  "auth",
  "bank",
  "community",
  "create",
  "dashboard",
  "exam",
  "print",
  "scanner",
  "student",
  "teacher",
  "test-auth",
  "test-wysiwyg",
  "account",
]);

// Individual routes excluded case-by-case rather than by whole subtree: the
// Stripe post-checkout redirect pages. Client-only, no metadata of their
// own, not evergreen content — same "not for indexing" category as the
// segments above, just not a whole subtree, and were never in the
// hand-maintained sitemap.ts array either.
const EXCLUDED_ROUTES = new Set(["/pricing/cancel", "/pricing/success"]);

// Per-route overrides matching exactly what the old hand-maintained array
// assigned. Anything discovered on disk that isn't listed here (i.e. a
// genuinely new page added later) falls back to BLOG_POST_META (for
// "/blog/*") or DEFAULT_META — this fallback is what makes the sitemap
// self-updating instead of drifting again.
const ROUTE_META = {
  "/": { changeFrequency: "weekly", priority: 1.0 },
  "/upgrade": { changeFrequency: "monthly", priority: 0.8 },
  "/pricing": { changeFrequency: "monthly", priority: 0.8 },
  "/about": { changeFrequency: "monthly", priority: 0.7 },
  "/generateur-examen-bac-libanais": { changeFrequency: "monthly", priority: 0.8 },
  "/ai-exam-generator-lebanon": { changeFrequency: "monthly", priority: 0.8 },
  "/ib-exam-generator": { changeFrequency: "monthly", priority: 0.8 },
  "/bac-francais-exam-generator": { changeFrequency: "monthly", priority: 0.8 },
  "/blog": { changeFrequency: "weekly", priority: 0.8 },
  "/contact": { changeFrequency: "monthly", priority: 0.5 },
  "/privacy": { changeFrequency: "yearly", priority: 0.3 },
  "/terms": { changeFrequency: "yearly", priority: 0.3 },
};
const BLOG_POST_META = { changeFrequency: "monthly", priority: 0.7 };
const DEFAULT_META = { changeFrequency: "monthly", priority: 0.6 };

function metaFor(route) {
  if (ROUTE_META[route]) return ROUTE_META[route];
  if (route.startsWith("/blog/")) return BLOG_POST_META;
  return DEFAULT_META;
}

function discoverRoutes(dir, segments) {
  const routes = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const isRouteGroup = /^\(.*\)$/.test(entry.name);
      const isDynamic = entry.name.startsWith("[");
      // Dynamic segments need runtime data to enumerate (e.g. blog/[slug] —
      // the Firestore-backed posts are added separately in sitemap.ts;
      // exam/[id] is a private per-user view, never public either way).
      if (isDynamic) continue;
      if (segments.length === 0 && !isRouteGroup && EXCLUDED_TOP_SEGMENTS.has(entry.name)) continue;
      const nextSegments = isRouteGroup ? segments : [...segments, entry.name];
      routes.push(...discoverRoutes(path.join(dir, entry.name), nextSegments));
    } else if (entry.isFile() && entry.name === "page.tsx") {
      const route = segments.length === 0 ? "/" : `/${segments.join("/")}`;
      if (!EXCLUDED_ROUTES.has(route)) routes.push(route);
    }
  }
  return routes;
}

const routes = discoverRoutes(APP_DIR, []).sort();

const body = routes
  .map((route) => {
    const { changeFrequency, priority } = metaFor(route);
    return `  { path: ${JSON.stringify(route)}, changeFrequency: "${changeFrequency}", priority: ${priority} },`;
  })
  .join("\n");

const output = `// AUTO-GENERATED by scripts/generate-static-routes.mjs — do not hand-edit.
// Regenerated automatically by the "prebuild"/"predev" npm scripts before
// every build and dev server start (see package.json), so this list tracks
// src/app's actual page.tsx files instead of drifting like the old
// hand-maintained sitemap.ts array did. Run
// \`npm run generate:sitemap-routes\` to refresh it manually.
//
// Excludes: authenticated/private app surfaces, /admin, /api, dev-only test
// pages (mirrors robots.ts's disallow list), Next.js dynamic route segments
// (e.g. blog/[slug], exam/[id] — the Firestore-backed blog posts are added
// separately in sitemap.ts), and the Stripe post-checkout redirect pages
// (/pricing/cancel, /pricing/success — client-only, no metadata, not
// evergreen content, never in the old hand-maintained list either).

export interface StaticSitemapRoute {
  path: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

export const STATIC_SITEMAP_ROUTES: StaticSitemapRoute[] = [
${body}
];
`;

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, output);
console.log(`[generate-static-routes] wrote ${routes.length} static routes -> ${path.relative(process.cwd(), OUT_FILE)}`);
