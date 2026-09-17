// Shared helpers for scripts/seo-audit.mjs and scripts/geo-audit.mjs — both
// audit the site by fetching real rendered pages (not by re-deriving page
// lists from Firestore or route source), so what they report always matches
// what a browser or crawler would actually see.
import { JSDOM } from "jsdom";

export const DEFAULT_BASE_URL = "https://www.imtihan.live";

/**
 * Reads the live sitemap.xml and returns every <loc> URL in it. This is the
 * same sitemap teachers' search engines crawl, and the same one
 * src/app/sitemap.ts generates (static pages + curriculum landing pages +
 * every blog post, static and dynamic) — auditing exactly this list means
 * "every page we're telling Google about" and "every page we audit" can
 * never silently drift apart.
 */
export async function fetchSitemapUrls(baseUrl = DEFAULT_BASE_URL) {
  const res = await fetch(`${baseUrl}/sitemap.xml`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${baseUrl}/sitemap.xml: HTTP ${res.status}`);
  }
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
  if (urls.length === 0) {
    throw new Error(`${baseUrl}/sitemap.xml parsed but contained no <loc> entries`);
  }
  return urls;
}

/**
 * Fetches one page and parses it with jsdom. Returns null (with a console
 * warning) on a network/HTTP failure instead of throwing, so one bad page
 * doesn't abort an entire multi-page audit run.
 */
export async function fetchPage(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    if (!res.ok) {
      console.warn(`  ! ${url} → HTTP ${res.status}`);
      return { url, status: res.status, document: null, html };
    }
    const dom = new JSDOM(html, { url });
    return { url, status: res.status, document: dom.window.document, html };
  } catch (err) {
    console.warn(`  ! ${url} → fetch failed: ${err.message}`);
    return { url, status: 0, document: null, html: "" };
  }
}

export function textOf(el) {
  return (el?.textContent ?? "").replace(/\s+/g, " ").trim();
}
