import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://imtihan.live",
  "https://www.imtihan.live",
];

const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 100;

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW * 1000;
  
  const record = rateLimitMap.get(key);
  
  if (!record || record.timestamp < windowStart) {
    rateLimitMap.set(key, { count: 1, timestamp: now });
    return false;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }
  
  record.count++;
  rateLimitMap.set(key, record);
  return false;
}

function sanitizeInput(input: string): string {
  return input
    .replace(/[\x00-\x1F\x7F]/g, "")
    .replace(/<script/gi, "&lt;script")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const response = NextResponse.next();
  
  const origin = request.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.some(o => origin.includes(o.replace("https://", "").replace("http://", "")))) {
    if (!origin.includes("localhost")) {
      response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGINS[0]);
    }
  }
  
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("Content-Security-Policy", 
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https:;"
  );
  
  if (pathname.startsWith("/api/")) {
    const rateLimitKey = getRateLimitKey(request);
    
    if (isRateLimited(rateLimitKey)) {
      return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json") && !contentType.includes("multipart/form-data")) {
      return new NextResponse(JSON.stringify({ error: "Invalid content type" }), {
        status: 415,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
      return new NextResponse(JSON.stringify({ error: "Payload too large" }), {
        status: 413,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};