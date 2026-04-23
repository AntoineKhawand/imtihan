import { NextRequest, NextResponse } from "next/server";

/**
 * Auth proxy — protects /dashboard, /create, /library, /bank, /community routes.
 */

const PROTECTED_PATHS = ["/dashboard", "/library", "/account", "/create", "/bank", "/community"];
const AUTH_PATHS = ["/auth/login", "/auth/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_PATHS.some((p) => pathname.startsWith(p));

  const session = request.cookies.get("__session");

  if (isProtected && !session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|llms.txt).*)"],
};