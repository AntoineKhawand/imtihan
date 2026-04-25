import { NextRequest, NextResponse } from "next/server";
import { createSecurityHeaders } from "@/lib/security";

export const runtime = "nodejs";

const ARXIV_BASE = "https://export.arxiv.org/api/query";

interface ArxivPaper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  published: string;
  url: string;
  categories: string[];
}

/** Extract text between two XML tags (greedy, single-pass) */
function xmlField(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? m[1].trim() : "";
}

function xmlFieldAll(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const results: string[] = [];
  let m;
  while ((m = re.exec(xml)) !== null) results.push(m[1].trim());
  return results;
}

function parseAtom(xml: string): ArxivPaper[] {
  // Split into individual <entry> blocks
  const entries: ArxivPaper[] = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/gi;
  let match;

  while ((match = entryRe.exec(xml)) !== null) {
    const block = match[1];

    // Title — strip newlines and extra whitespace
    const title = xmlField(block, "title").replace(/\s+/g, " ").trim();

    // Abstract
    const abstract = xmlField(block, "summary").replace(/\s+/g, " ").trim();

    // URL — the <id> field is the canonical URL
    const url = xmlField(block, "id");
    const id  = url.split("/abs/").pop() ?? url;

    // Authors
    const authorBlocks = xmlFieldAll(block, "author");
    const authors = authorBlocks
      .map((a) => xmlField(a, "name"))
      .filter(Boolean)
      .slice(0, 4); // cap at 4

    // Published year
    const pubRaw = xmlField(block, "published");
    const published = pubRaw ? pubRaw.slice(0, 4) : ""; // just the year

    // Categories
    const catMatches = [...block.matchAll(/term="([^"]+)"/g)];
    const categories = catMatches.map((m) => m[1]).filter((c) => c.includes(".") || c.length <= 8).slice(0, 3);

    if (title && abstract) {
      entries.push({ id, title, abstract, authors, published, url, categories });
    }
  }

  return entries;
}

/**
 * GET /api/tools/arxiv?q=quantum+mechanics&max=3
 *
 * Searches arXiv and returns the top papers with title, abstract, authors, year.
 * Use the abstract as exercise context for university / IB exams.
 *
 * No API key required. Rate limit: 1 request per 3 seconds (enforced by caller).
 */
export async function GET(request: NextRequest) {
  const q   = request.nextUrl.searchParams.get("q")?.trim();
  const max = Math.min(parseInt(request.nextUrl.searchParams.get("max") ?? "3", 10), 5);

  if (!q) {
    return NextResponse.json(
      { success: false, error: "Provide a search query with ?q=..." },
      { status: 400, headers: createSecurityHeaders() }
    );
  }

  try {
    const url = `${ARXIV_BASE}?search_query=all:${encodeURIComponent(q)}&start=0&max_results=${max}&sortBy=relevance`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Imtihan/1.0 (exam-generator; contact: hello@imtihan.live)" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Research database returned ${res.status}` },
        { status: 502, headers: createSecurityHeaders() }
      );
    }

    const xml = await res.text();
    const papers = parseAtom(xml);

    if (papers.length === 0) {
      return NextResponse.json(
        { success: true, papers: [], message: "No papers found for this query." },
        { headers: createSecurityHeaders() }
      );
    }

    return NextResponse.json(
      { success: true, papers },
      { headers: createSecurityHeaders() }
    );
  } catch (err) {
    console.error("[/api/tools/arxiv]", err);
    return NextResponse.json(
      { success: false, error: "Failed to reach research database." },
      { status: 503, headers: createSecurityHeaders() }
    );
  }
}
