import { z } from "zod";

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, "").slice(0, 255);
}

export function sanitizePath(path: string): string {
  return path.replace(/\.\./g, "").replace(/[^a-zA-Z0-9/\-._]/g, "");
}

export const InputSchema = z.object({
  description: z.string().max(10000).optional(),

  curriculumId: z.string().max(50).optional(),
  levelId: z.string().max(50).optional(),
  subject: z.string().max(50).optional(),
  chapterIds: z.array(z.string().max(50)).max(20).optional(),
  language: z.enum(["french", "english", "arabic"]).optional(),
  examType: z.enum(["quiz", "midterm", "final", "bac"]).optional(),

  pointsTotal: z.number().min(0).max(100).optional(),
  difficultyEasy: z.number().min(0).max(100).optional(),
  difficultyMedium: z.number().min(0).max(100).optional(),
  difficultyHard: z.number().min(0).max(100).optional(),
  exerciseCount: z.number().min(1).max(20).optional(),

  format: z.enum(["word", "pdf"]).optional(),
  includeAnswerKey: z.boolean().optional(),

  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(32000).optional(),
});

export function validateInput<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> | null {
  try {
    return schema.parse(data);
  } catch {
    return null;
  }
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidIp(ip: string): boolean {
  // IPv4: each octet must be bounded to 0-255 (rejects e.g. "999.999.999.999"
  // or "256.1.1.1", which the old unbounded `\d{1,3}` regex incorrectly
  // accepted — see BUG-058).
  const octet = "(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)";
  const ipv4Regex = new RegExp(`^(${octet}\\.){3}${octet}$`);

  // IPv6: supports the standard "::" zero-compression shorthand (e.g. "::1",
  // "::", "2001:db8::1") as well as the fully-expanded 8-group form — the
  // old regex only matched the latter, rejecting the loopback address and
  // virtually every real-world IPv6 address (see BUG-058).
  //
  // Deliberately NOT supported (scope chosen for a rate-limiting/logging
  // use case validating a raw client IP, not a general-purpose IPv6
  // parser): embedded IPv4 (e.g. "::ffff:192.168.1.1") and zone IDs (e.g.
  // "fe80::1%eth0"). Full RFC-correct IPv6 validation covering those is
  // substantially more complex; whoever wires this up to a real caller
  // (e.g. rateLimit.ts's getClientIp()) should confirm neither form shows
  // up in practice before assuming full coverage.
  const ipv6Regex = new RegExp(
    "^(" +
      "([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|" + // fully expanded, 8 groups
      "([0-9a-fA-F]{1,4}:){1,7}:|" + // trailing "::" (1 to 7 groups then "::")
      "([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|" +
      "([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|" +
      "([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|" +
      "([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|" +
      "([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|" +
      "[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|" + // 1 group then "::" + up to 6 groups
      ":((:[0-9a-fA-F]{1,4}){1,7}|:)" + // leading "::" (covers "::" alone too)
      ")$"
  );

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

export interface SecurityConfig {
  maxRequestSize: number;
  allowedContentTypes: string[];
  rateLimitWindow: number;
  rateLimitMax: number;
  corsOrigins: string[];
}

export const defaultSecurityConfig: SecurityConfig = {
  maxRequestSize: 5 * 1024 * 1024,
  allowedContentTypes: ["application/json", "multipart/form-data"],
  rateLimitWindow: 60,
  rateLimitMax: 100,
  corsOrigins: ["http://localhost:3000", "https://imtihan.live", "https://www.imtihan.live"],
};

export function createSecurityHeaders(): Record<string, string> {
  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://*.firebaseapp.com https://*.google.com https://va.vercel-scripts.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: blob: https://*.googleusercontent.com; frame-src 'self' https://*.firebaseapp.com; connect-src 'self' https://generativelanguage.googleapis.com https://generativelanguage.googleapis.xyz https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://va.vercel-scripts.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com",
  };
}

export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    return "An error occurred. Please try again.";
  }
  return "An unexpected error occurred.";
}