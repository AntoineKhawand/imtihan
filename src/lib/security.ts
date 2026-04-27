import { z } from "zod";

const dangerousPatterns = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<applet/gi,
  /<link/gi,
  /<base\s/gi,
  /<meta\s+http-equiv/gi,
  /\.exec\s*\(/gi,
  /\.eval\s*\(/gi,
  /<img\s+src\s*=\s*["']?\s*javascript:/gi,
  /expression\s*\(/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
];

export function sanitizeHTML(input: string): string {
  let sanitized = input;
  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, "");
  }
  return sanitized;
}

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

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeHTML(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === "string" ? sanitizeHTML(item) : item
      );
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
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
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
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
  corsOrigins: ["http://localhost:3000", "https://imtihan.live"],
};

export function createSecurityHeaders(): Record<string, string> {
  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://*.firebaseapp.com https://*.google.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: blob: https://*.googleusercontent.com; frame-src 'self' https://*.firebaseapp.com; connect-src 'self' https://generativelanguage.googleapis.com https://generativelanguage.googleapis.xyz https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://va.vercel-scripts.com",
  };
}

export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    return "An error occurred. Please try again.";
  }
  return "An unexpected error occurred.";
}