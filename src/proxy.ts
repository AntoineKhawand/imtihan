import { NextRequest, NextResponse } from "next/server";

/**
 * Auth proxy — protects /dashboard, /library routes.
 * For MVP, we check for a Firebase session cookie.
 * Renamed from middleware.ts → proxy.ts for Next.js 16.
 */

const PROTECTED_PATHS = ["/dashboard", "/library", "/account"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Check for session cookie (set on login)
  const session = request.cookies.get("imtihan_session");
  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/library/:path*", "/account/:path*"],
};
