#!/usr/bin/env node
/**
 * On-page SEO audit for every URL in the live sitemap.xml — an internal
 * equivalent to what a paid crawler (Screaming Frog, or every-app/open-seo's
 * DataForSEO-backed audit) checks for on-page basics, without needing a paid
 * API: title/meta-description presence and length, canonical tags, heading
 * structure, Open Graph tags, image alt text, and internal links that 404.
 *
 * Usage: node scripts/seo-audit.mjs [baseUrl]
 *   Defaults to https://imtihan.live. Pass http://localhost:3005 to
 *   audit a local dev server instead.
 *
 * Writes SEO_AUDIT_REPORT.md (overwritten each run) and exits non-zero if
 * any page has at least one FAIL-severity issue.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchSitemapUrls, fetchPage, textOf, DEFAULT_BASE_URL } from "./lib/site-pages.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REPORT_FILE = path.join(ROOT, "SEO_AUDIT_REPORT.md");

const TITLE_MIN = 10;
const TITLE_MAX = 70;
const DESC_MIN = 50;
const DESC_MAX = 165;

function auditPage({ url, document }) {
  const issues = [];
  if (!document) {
    return [{ severity: "fail", check: "fetch", message: "Page did not load" }];
  }

  const title = textOf(document.querySelector("title"));
  if (!title) {
    issues.push({ severity: "fail", check: "title", message: "Missing <title>" });
  } else if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
    issues.push({
      severity: "warn",
      check: "title",
      message: `Title is ${title.length} chars (ideal ${TITLE_MIN}-${TITLE_MAX}): "${title}"`,
    });
  }

  const descEl = document.querySelector('meta[name="description"]');
  const desc = descEl?.getAttribute("content")?.trim() ?? "";
  if (!desc) {
    issues.push({ severity: "fail", check: "description", message: "Missing meta description" });
  } else if (desc.length < DESC_MIN || desc.length > DESC_MAX) {
    issues.push({
      severity: "warn",
      check: "description",
      message: `Meta description is ${desc.length} chars (ideal ${DESC_MIN}-${DESC_MAX})`,
    });
  }

  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
  if (!canonical) {
    issues.push({ severity: "warn", check: "canonical", message: "Missing <link rel=\"canonical\">" });
  } else {
    const normalize = (u) => u.replace(/\/$/, "");
    if (normalize(canonical) !== normalize(url)) {
      issues.push({
        severity: "warn",
        check: "canonical",
        message: `Canonical "${canonical}" doesn't match page URL "${url}"`,
      });
    }
  }

  const h1s = document.querySelectorAll("h1");
  if (h1s.length === 0) {
    issues.push({ severity: "fail", check: "h1", message: "No <h1> found" });
  } else if (h1s.length > 1) {
    issues.push({ severity: "warn", check: "h1", message: `${h1s.length} <h1> elements found (expected 1)` });
  }

  for (const [prop, label] of [["og:title", "og:title"], ["og:description", "og:description"], ["og:image", "og:image"]]) {
    const el = document.querySelector(`meta[property="${prop}"]`);
    if (!el?.getAttribute("content")?.trim()) {
      issues.push({ severity: "warn", check: "opengraph", message: `Missing ${label}` });
    }
  }

  const imgsMissingAlt = [...document.querySelectorAll("img")].filter(
    (img) => !img.hasAttribute("alt") || img.getAttribute("alt")?.trim() === ""
  );
  if (imgsMissingAlt.length > 0) {
    issues.push({
      severity: "warn",
      check: "alt-text",
      message: `${imgsMissingAlt.length} <img> missing alt text`,
    });
  }

  const hasJsonLd = document.querySelector('script[type="application/ld+json"]') !== null;
  if (!hasJsonLd) {
    issues.push({ severity: "info", check: "schema", message: "No JSON-LD structured data on this page" });
  }

  return issues;
}

function collectInternalLinks(document, baseUrl) {
  const origin = new URL(baseUrl).origin;
  const links = new Set();
  for (const a of document?.querySelectorAll("a[href]") ?? []) {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    try {
      const resolved = new URL(href, baseUrl);
      if (resolved.origin === origin) links.add(resolved.toString());
    } catch {
      // ignore unparsable hrefs
    }
  }
  return links;
}

async function main() {
  const baseUrl = process.argv[2] ?? DEFAULT_BASE_URL;
  console.log(`SEO audit — ${baseUrl}\n`);

  const urls = await fetchSitemapUrls(baseUrl);
  console.log(`${urls.length} URLs in sitemap.xml\n`);

  const pageResults = [];
  const internalLinks = new Set();
  const seenTitles = new Map();

  for (const url of urls) {
    process.stdout.write(`  checking ${url} ... `);
    const page = await fetchPage(url);
    const issues = auditPage(page);
    console.log(issues.length === 0 ? "clean" : `${issues.length} issue(s)`);
    pageResults.push({ url, issues });

    if (page.document) {
      const title = textOf(page.document.querySelector("title"));
      if (title) {
        seenTitles.set(title, [...(seenTitles.get(title) ?? []), url]);
      }
      for (const link of collectInternalLinks(page.document, baseUrl)) internalLinks.add(link);
    }
  }

  // Duplicate titles across otherwise-unrelated pages confuse both search
  // engines and generative answer engines about which page to prefer.
  const dupeTitles = [...seenTitles.entries()].filter(([, pages]) => pages.length > 1);
  for (const [title, pages] of dupeTitles) {
    for (const url of pages) {
      const entry = pageResults.find((p) => p.url === url);
      entry.issues.push({
        severity: "warn",
        check: "duplicate-title",
        message: `Title "${title}" is shared with ${pages.length - 1} other page(s)`,
      });
    }
  }

  console.log(`\nChecking ${internalLinks.size} unique internal links for broken pages...`);
  const brokenLinks = [];
  for (const link of internalLinks) {
    if (urls.includes(link)) continue; // already fetched above as a sitemap page
    try {
      const res = await fetch(link, { method: "HEAD" });
      if (!res.ok) brokenLinks.push({ url: link, status: res.status });
    } catch (err) {
      brokenLinks.push({ url: link, status: `error: ${err.message}` });
    }
  }

  const totalIssues = pageResults.reduce((sum, p) => sum + p.issues.length, 0);
  const failCount = pageResults.reduce((sum, p) => sum + p.issues.filter((i) => i.severity === "fail").length, 0);
  const cleanPages = pageResults.filter((p) => p.issues.length === 0).length;

  const lines = [
    "# SEO Audit Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Base URL: ${baseUrl}`,
    "",
    `**${urls.length} pages audited — ${cleanPages} clean, ${totalIssues} total issue(s), ${failCount} FAIL-severity, ${brokenLinks.length} broken internal link(s).**`,
    "",
    "## Per-page findings",
    "",
  ];
  for (const { url, issues } of pageResults) {
    if (issues.length === 0) continue;
    lines.push(`### ${url}`, "");
    for (const issue of issues) {
      const tag = issue.severity === "fail" ? "FAIL" : issue.severity === "warn" ? "WARN" : "INFO";
      lines.push(`- **${tag}** (${issue.check}): ${issue.message}`);
    }
    lines.push("");
  }

  if (brokenLinks.length > 0) {
    lines.push("## Broken internal links", "");
    for (const { url, status } of brokenLinks) {
      lines.push(`- ${url} — ${status}`);
    }
    lines.push("");
  }

  fs.writeFileSync(REPORT_FILE, lines.join("\n"));
  console.log(`\nWrote ${REPORT_FILE}`);
  console.log(`${cleanPages}/${urls.length} pages clean, ${failCount} FAIL-severity issue(s), ${brokenLinks.length} broken link(s).`);

  if (failCount > 0 || brokenLinks.length > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error("SEO audit failed:", err);
  process.exitCode = 1;
});
