import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { sanitizeError, createSecurityHeaders } from "@/lib/security";

/**
 * Creates a secure session cookie from a Firebase ID token.
 * This allows Next.js Edge Middleware to read the auth state without
 * needing the heavy firebase-admin SDK on the edge.
 */
export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) return NextResponse.json({ error: "No token provided" }, { status: 400 });

    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Cookie expires when the ID token expires (max 14 days, but usually 1hr for ID tokens)
    // We'll set a 5-day expiration for the session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    
    const sessionCookie = await adminAuth.createSessionCookie(token, { expiresIn });

    const response = NextResponse.json({ success: true }, { headers: createSecurityHeaders() });
    response.cookies.set("__session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
    return response;
  } catch (error) {
    console.error("Session creation error details:", {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name,
      code: (error as any).code
    });
    return NextResponse.json({ 
      error: sanitizeError(error),
      debug: process.env.NODE_ENV === "development" ? (error as Error).message : undefined
    }, { status: 500, headers: createSecurityHeaders() });
  }
}

/**
 * Clears the session cookie when the user logs out.
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("__session");
  return response;
}
