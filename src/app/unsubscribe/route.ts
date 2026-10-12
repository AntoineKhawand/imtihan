import { adminDb } from "@/lib/firebase-admin";
import { verifyUnsubscribeToken } from "@/lib/marketingEmail";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
  "Content-Security-Policy":
    "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
};
function page(content: string, status = 200) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email preferences | Imtihan</title></head><body style="margin:0;background:#faf9f6;color:#17261e;font:16px/1.7 Arial,sans-serif"><main style="max-width:480px;margin:12vh auto;padding:28px"><a href="/" style="color:#1a5e3f">Imtihan</a>${content}</main></body></html>`,
    { status, headers },
  );
}
function tokenFrom(request: Request) {
  return new URL(request.url).searchParams.get("token") ?? "";
}
// GET is read-only: security scanners often open every email link.
export async function GET(request: Request) {
  try {
    const token = tokenFrom(request);
    if (!verifyUnsubscribeToken(token))
      return page(
        "<h1>Invalid link</h1><p>Please use the unsubscribe link in your Imtihan email.</p>",
        400,
      );
    return page(
      `<h1>Email preferences</h1><p>Stop promotional emails from Imtihan. Requested exam deliveries and essential account messages will continue.</p><form method="post" action="/unsubscribe?token=${token}"><button style="border:0;border-radius:12px;background:#1a5e3f;color:white;padding:14px 20px;font:inherit;cursor:pointer">Unsubscribe</button></form>`,
    );
  } catch {
    return page(
      "<h1>Temporarily unavailable</h1><p>Contact admin@imtihan.live to stop promotional emails.</p>",
      503,
    );
  }
}
export async function POST(request: Request) {
  try {
    const id = verifyUnsubscribeToken(tokenFrom(request));
    if (!id)
      return page(
        "<h1>Invalid link</h1><p>Please use the unsubscribe link in your Imtihan email.</p>",
        400,
      );
    await adminDb
      .collection("marketing_preferences")
      .doc(id)
      .set({ unsubscribed: true, updatedAt: Date.now() }, { merge: true });
    return page(
      '<h1>You’re unsubscribed</h1><p>Promotional emails from Imtihan have been stopped. No sign-in is needed.</p><a href="/">Return to Imtihan</a>',
    );
  } catch {
    return page(
      "<h1>Could not save your preference</h1><p>Please try again or email admin@imtihan.live.</p>",
      503,
    );
  }
}
