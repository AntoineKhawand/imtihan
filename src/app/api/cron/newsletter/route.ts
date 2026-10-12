import { buildNewsletterHtml } from "@/lib/emails/newsletter";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/brevo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://imtihan.live";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!cronSecret || secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  const subject = `📬 Imtihan Update — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  let sent = 0;
  let errors = 0;

  try {
    const snap = await adminDb.collection("users").limit(500).get();

    for (const doc of snap.docs) {
      const data = doc.data();
      const email: string | undefined = data.email;
      if (!email) continue;

      // Skip if sent within the last 13 days (slight buffer for weekly cron)
      const lastNewsletter: number | undefined = data.newsletterSentAt;
      const now = Date.now();
      const THRESHOLD = 13 * 24 * 60 * 60 * 1000;
      if (lastNewsletter && (now - lastNewsletter < THRESHOLD)) continue;

      const firstName = (data.displayName ?? "").split(" ")[0] || "there";
      const displayMonth = new Date().toLocaleString("en-US", { month: "long" });
      const html = buildNewsletterHtml(firstName, displayMonth, APP_URL);

      try {
        const result = await sendEmail({ to: email, toName: data.displayName ?? email, subject, html, purpose: "marketing" });
        if (result.skipped) continue;
        if (result.ok) {
          await doc.ref.update({ newsletterSentAt: now });
          sent++;
        } else {
          console.error(
            "[cron/newsletter] send_rejected",
            JSON.stringify({ uid: doc.id, error: result.error ?? null })
          );
          errors++;
        }
      } catch (err) {
        console.error(
          "[cron/newsletter] send_threw",
          JSON.stringify({ uid: doc.id, error: err instanceof Error ? err.message : String(err) })
        );
        errors++;
      }
    }
  } catch (err) {
    console.error("[cron/newsletter]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  console.log(`[cron/newsletter] sent=${sent} errors=${errors}`);
  return NextResponse.json({ ok: true, sent, errors });
}
