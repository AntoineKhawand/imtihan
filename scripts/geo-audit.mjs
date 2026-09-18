#!/usr/bin/env node
/**
 * Generative Engine Optimization (GEO) content scorer for every blog post in
 * the live sitemap.xml — applies the actual findings from GEO-optim/GEO's
 * research (citing sources, adding statistics, quotations, and clear
 * scannable structure measurably boost how often content gets cited by
 * generative answer engines) as a checklist against Imtihan's own posts,
 * rather than running their academic benchmark pipeline directly (which
 * needs a GEO-BENCH-style query/results dataset we don't have for our own
 * site, and scores visibility in *someone else's* search results, not the
 * structural signals we can actually act on).
 *
 * Usage: node scripts/geo-audit.mjs [baseUrl]
 *   Defaults to https://imtihan.live. Pass http://localhost:3005 to
 *   audit a local dev server instead.
 *
 * Writes GEO_AUDIT_REPORT.md (overwritten each run), weakest posts first.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchSitemapUrls, fetchPage, textOf, DEFAULT_BASE_URL } from "./lib/site-pages.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REPORT_FILE = path.join(ROOT, "GEO_AUDIT_REPORT.md");

const SIGNALS = [
  {
    id: "depth",
    points: 20,
    label: "Sufficient depth (600+ words)",
    check: ({ wordCount }) => wordCount >= 600,
    detail: ({ wordCount }) => `${wordCount} words`,
  },
  {
    id: "citations",
    points: 15,
    label: "Cites an external source",
    check: ({ externalLinks }) => externalLinks > 0,
    detail: ({ externalLinks }) => `${externalLinks} external link(s)`,
  },
  {
    id: "statistics",
    points: 15,
    label: "Includes a statistic or number",
    check: ({ statCount }) => statCount > 0,
    detail: ({ statCount }) => `${statCount} number(s)/percentage(s) found`,
  },
  {
    id: "quotations",
    points: 15,
    label: "Includes a quotation/blockquote",
    check: ({ blockquotes }) => blockquotes > 0,
    detail: ({ blockquotes }) => `${blockquotes} blockquote(s)`,
  },
  {
    id: "lists",
    points: 15,
    label: "Uses a bullet or numbered list",
    check: ({ lists }) => lists > 0,
    detail: ({ lists }) => `${lists} list(s)`,
  },
  {
    id: "scannable",
    points: 10,
    label: "Scannable (a subheading roughly every 400 words)",
    check: ({ wordCount, headings }) => headings >= Math.max(1, Math.floor(wordCount / 400)),
    detail: ({ headings, wordCount }) => `${headings} subheading(s) for ${wordCount} words`,
  },
  {
    id: "faq-schema",
    points: 10,
    label: "Has FAQPage structured data",
    check: ({ hasFaqSchema }) => hasFaqSchema,
    detail: ({ hasFaqSchema }) => (hasFaqSchema ? "present" : "absent"),
  },
];

function scoreArticle(document) {
  const article = document.querySelector("article") ?? document.querySelector("main") ?? document.body;
  const text = textOf(article);
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

  const origin = new URL(document.baseURI ?? "https://imtihan.live").origin;
  const links = [...article.querySelectorAll("a[href]")];
  const externalLinks = links.filter((a) => {
    try {
      return new URL(a.getAttribute("href"), origin).origin !== origin;
    } catch {
      return false;
    }
  }).length;

  const statCount = (text.match(/\b\d+(?:[.,]\d+)?%?\b/g) ?? []).length;
  const blockquotes = article.querySelectorAll("blockquote").length;
  const lists = article.querySelectorAll("ul, ol").length;
  const headings = article.querySelectorAll("h2, h3").length;

  const jsonLdBlocks = [...document.querySelectorAll('script[type="application/ld+json"]')];
  const hasFaqSchema = jsonLdBlocks.some((block) => {
    try {
      const data = JSON.parse(block.textContent);
      const types = JSON.stringify(data);
      return types.includes('"FAQPage"');
    } catch {
      return false;
    }
  });

  const metrics = { wordCount, externalLinks, statCount, blockquotes, lists, headings, hasFaqSchema };
  const results = SIGNALS.map((signal) => ({
    ...signal,
    passed: signal.check(metrics),
    detail: signal.detail(metrics),
  }));
  const score = results.reduce((sum, r) => sum + (r.passed ? r.points : 0), 0);

  return { metrics, results, score };
}

async function main() {
  const baseUrl = process.argv[2] ?? DEFAULT_BASE_URL;
  console.log(`GEO audit — ${baseUrl}\n`);

  const urls = (await fetchSitemapUrls(baseUrl)).filter((u) => {
    const path = new URL(u).pathname;
    return path.startsWith("/blog/"); // exclude the /blog index itself
  });
  console.log(`${urls.length} blog posts in sitemap.xml\n`);

  const scored = [];
  for (const url of urls) {
    process.stdout.write(`  scoring ${url} ... `);
    const { document } = await fetchPage(url);
    if (!document) {
      console.log("skipped (failed to load)");
      continue;
    }
    const { metrics, results, score } = scoreArticle(document);
    console.log(`${score}/100`);
    scored.push({ url, metrics, results, score });
  }

  scored.sort((a, b) => a.score - b.score); // weakest first

  const avgScore = scored.length > 0 ? Math.round(scored.reduce((sum, p) => sum + p.score, 0) / scored.length) : 0;
  const siteWideMisses = SIGNALS.filter((signal) => scored.every((p) => !p.results.find((r) => r.id === signal.id).passed));

  const lines = [
    "# GEO (Generative Engine Optimization) Audit Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Base URL: ${baseUrl}`,
    "",
    `**${scored.length} blog posts scored — average ${avgScore}/100.**`,
    "",
  ];

  if (siteWideMisses.length > 0) {
    lines.push(
      "## Site-wide gaps",
      "",
      "Every single post is missing these — worth fixing once at the template level rather than post-by-post:",
      "",
      ...siteWideMisses.map((s) => `- **${s.label}** (${s.points} pts) — 0/${scored.length} posts have this`),
      "",
    );
  }

  lines.push("## Posts, weakest first", "");
  for (const { url, score, results } of scored) {
    lines.push(`### ${url} — ${score}/100`, "");
    for (const r of results) {
      lines.push(`- ${r.passed ? "✅" : "❌"} ${r.label} (${r.points} pts) — ${r.detail}`);
    }
    lines.push("");
  }

  fs.writeFileSync(REPORT_FILE, lines.join("\n"));
  console.log(`\nWrote ${REPORT_FILE}`);
  console.log(`Average score: ${avgScore}/100 across ${scored.length} posts.`);
}

main().catch((err) => {
  console.error("GEO audit failed:", err);
  process.exitCode = 1;
});
