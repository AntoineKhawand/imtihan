import { z } from "zod";

// Adapted from ethanplusai/harvey's deterministic gate.py (MIT).
// See THIRD_PARTY_NOTICES.md for the pinned source and full license.
const BANNED_PHRASES = [
  "act now", "buy now", "click here", "click below", "limited time",
  "limited offer", "exclusive deal", "special offer", "risk-free",
  "no obligation", "100% free", "make money", "double your",
  "guaranteed results", "winner", "congratulations",
  "i hope this finds you well", "hope this email finds you well",
  "i hope this email finds you", "picture this", "what if i told you",
  "in today's fast-paced world", "game-changer", "game changer",
  "cutting-edge solution", "revolutionize your", "unlock your",
  "supercharge your", "as an ai", "i'm an ai", "i am an ai",
  "as a language model",
];
export const OutreachBriefSchema = z.object({
  audience: z.string().trim().min(3).max(250),
  language: z.enum(["english", "french"]),
  context: z.string().trim().min(10).max(1500),
}).strict();
export type OutreachBrief = z.infer<typeof OutreachBriefSchema>;
export const OutreachMessageSchema = z.object({
  subject: z.string().trim().min(1).max(90),
  body: z.string().trim().min(1).max(3000),
}).strict();
export type OutreachMessage = z.infer<typeof OutreachMessageSchema>;
export const OutreachSequenceSchema = z.object({ messages: z.array(OutreachMessageSchema).length(3) }).strict();

export function outreachIssues(message: OutreachMessage, maxWords = 220): string[] {
  const reasons: string[] = [];
  const subject = message.subject.trim();
  const body = message.body.trim();
  if (!subject || subject.length > 90 || /[\r\n]/.test(subject)) reasons.push("Use a one-line subject of 1–90 characters.");
  const words = body ? body.split(/\s+/u).length : 0;
  if (!words || words > maxWords) reasons.push(`Use a message of 1–${maxWords} words.`);
  if (/\{\{[^}]*\}\}|\{\s*\w+\s*\}/u.test(subject + " " + body)) reasons.push("Replace all merge placeholders.");
  if (BANNED_PHRASES.some(phrase => (subject + " " + body).toLowerCase().includes(phrase))) reasons.push("Remove generic sales or spam phrases.");
  if ((body.match(/https?:\/\/\S+/gi) ?? []).length > 1) reasons.push("Keep at most one link in the message.");
  if (/<\s*\/?[a-z][^>]*>/i.test(body + subject)) reasons.push("Use plain text without HTML markup.");
  return reasons;
}

export function outreachHtml(body: string): string {
  const escaped = body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  return `<div style="font-family:Arial,sans-serif;line-height:1.6;white-space:pre-wrap">${escaped}</div>`;
}
