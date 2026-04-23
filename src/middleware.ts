import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/create", "/bank", "/library", "/account", "/community"];
const AUTH_PATHS = ["/auth/login", "/auth/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("__session");

  // 1. Authentication & Redirects
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const loginUrl = new URL("/auth/login", request.url);
    const res = NextResponse.redirect(loginUrl);
    // Store original destination for client-side redirect after login
    res.cookies.set("__redirect", pathname, {
      path: "/",
      maxAge: 300,
      sameSite: "lax",
    });
    return res;
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. Security Headers & CSP
  const response = NextResponse.next();

  // Allow Firebase Auth frames (needed for some flows)
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // REQUIRED for Firebase Google Auth Popup to communicate with main window
  response.headers.set("Cross-Origin-Opener-Policy", "unsafe-none");

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://*.firebaseapp.com https://*.google.com https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://*.googleusercontent.com https://*.google.com",
    "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
    "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://generativelanguage.googleapis.com https://*.google.com https://*.firebaseapp.com https://*.googleapis.com https://*.firebaseio.com https://accounts.google.com https://va.vercel-scripts.com https://vitals.vercel-insights.com https://v.vercel-analytics.com",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest).*)"],
};
