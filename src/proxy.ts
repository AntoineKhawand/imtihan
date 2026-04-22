import { NextRequest, NextResponse } from "next/server";

/**
 * Auth proxy — protects /dashboard, /library routes.
 * Renamed from middleware.ts → proxy.ts for Next.js 16.
 */

const PROTECTED_PATHS = ["/dashboard", "/library", "/account", "/create"];
const AUTH_PATHS = ["/auth/login", "/auth/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // Check for session cookie (set on login via our api route)
  const session = request.cookies.get("__session");

  if (isProtected && !session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if trying to access login/register while already authenticated
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
