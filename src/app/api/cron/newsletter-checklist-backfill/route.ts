import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/brevo";
import { CHECKLIST_SUBJECT, CHECKLIST_HTML } from "@/lib/emails/newsletterChecklist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Retries the checklist email for any newsletter_subscribers doc missing
// checklistSentAt — i.e. every signup whose first send (in
// /api/newsletter/subscribe) failed. Same dual-auth pattern as
// /api/cron/blog-auto-publish: the Vercel cron secret, or an admin clicking
// "Resend failed" in /admin.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  let isAuthorized = false;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    isAuthorized = true;
  }
  if (!isAuthorized && authHeader?.startsWith("Bearer ")) {
    try {
      const decoded = await adminAuth.verifyIdToken(authHeader.split(" ")[1]);
      if (decoded) isAuthorized = true;
    } catch (e) {
      console.error("[/api/cron/newsletter-checklist-backfill] Auth verify error:", e);
    }
  }
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let sent = 0;
  let errors = 0;
  const MAX_PER_RUN = 50;

  try {
    // Firestore can't query "field does not exist" directly, and
    // /api/newsletter/subscribe only ever sets checklistSentAt on success
    // (never writes it as null) — so a plain scan + JS filter for "field
    // absent" is both correct and simpler than working around that in
    // Firestore query syntax. Subscriber volume is small enough that this
    // doesn't need pagination yet.
    const snap = await adminDb.collection("newsletter_subscribers").limit(200).get();
    const targets = snap.docs.filter((d) => !d.data().checklistSentAt);

    for (const docSnap of targets) {
      if (sent >= MAX_PER_RUN) break;
      const email: string | undefined = docSnap.data().email;
      if (!email) continue;

      try {
        const result = await sendEmail({ to: email, subject: CHECKLIST_SUBJECT, html: CHECKLIST_HTML });
        if (result.ok) {
          await docSnap.ref.update({ checklistSentAt: Date.now() });
          sent++;
        } else {
          errors++;
        }
      } catch {
        errors++;
      }
    }
  } catch (err) {
    console.error("[/api/cron/newsletter-checklist-backfill]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sent, errors });
}
