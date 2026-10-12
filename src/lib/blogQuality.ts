import { z } from "zod";

export const GeneratedBlogSchema = z.object({
  title: z.string().trim().min(15).max(100),
  description: z.string().trim().min(80).max(170),
  category: z.enum(["Teaching Strategies", "Exam Techniques", "Productivity", "Resources", "Parental Guides"]),
  content: z.string().trim().min(1).max(40000),
});

function words(text: string) { return text.trim().split(/\s+/u).filter(Boolean); }
function normalized(text: string) { return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim(); }

export function blogQualityIssues(post: z.infer<typeof GeneratedBlogSchema>, keyword: string, link: string, recentTitles: string[]): string[] {
  const issues: string[] = [];
  if (words(post.content).length < 700) issues.push("Article needs at least 700 words of useful content.");
  if ((post.content.match(/^##\s+.+/gm) ?? []).length < 4) issues.push("Article needs at least four H2 sections.");
  if (!/^## Frequently Asked Questions\s*$/m.test(post.content) || (post.content.match(/^\*\*Q:\s*.+\*\*\s*\n\S.+/gm) ?? []).length < 3) issues.push("Article needs three complete FAQ questions and answers.");
  for (const [label, text] of [["title", post.title], ["description", post.description], ["opening", words(post.content).slice(0, 120).join(" ")]]) {
    if (!normalized(text).includes(normalized(keyword))) issues.push(`Primary keyword missing from ${label}.`);
  }
  if (!post.content.includes(`](${link})`) || !post.content.includes("](/create)")) issues.push("Relevant product and create links required.");
  const tokens = new Set(normalized(post.title).split(" "));
  if (recentTitles.some(title => {
    const other = new Set(normalized(title).split(" "));
    const shared = [...tokens].filter(t => other.has(t)).length;
    return shared / new Set([...tokens, ...other]).size >= 0.7;
  })) issues.push("Title is too similar to a recent article.");
  return issues;
}

export function blogReadTime(content: string) { return `${Math.max(1, Math.ceil(words(content).length / 220))} min read`; }
