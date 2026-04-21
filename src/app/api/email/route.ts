import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const RequestSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().optional(),
  fileBase64: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
});

/**
 * POST /api/email — delivers a generated exam as an attachment via Resend.
 * Requires env: RESEND_API_KEY and (optionally) RESEND_FROM (defaults to onboarding@resend.dev).
 * Resend free tier: 100 emails/day, 3000/month.
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Email sending is not configured. Add RESEND_API_KEY to .env.local — get a free key at https://resend.com/api-keys",
      },
      { status: 501 }
    );
  }

  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { to, subject, message, fileBase64, fileName, mimeType } = parsed.data;
    const from = process.env.RESEND_FROM ?? "Imtihan <onboarding@resend.dev>";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html: buildHtmlBody(message ?? ""),
        attachments: [{ filename: fileName, content: fileBase64 }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[/api/email] Resend error:", res.status, errBody);
      return NextResponse.json(
        { success: false, error: `Resend rejected the request (${res.status}). ${errBody.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error("[/api/email]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Email send failed" },
      { status: 500 }
    );
  }
}

function buildHtmlBody(message: string): string {
  const safe = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const intro = safe
    ? `<p style="margin:0 0 12px 0;white-space:pre-wrap;">${safe}</p>`
    : "";
  return `<!doctype html>
<html><body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#111;font-size:15px;line-height:1.5;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
      <div style="width:32px;height:32px;border-radius:8px;background:#1a5e3f;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:600;">إ</div>
      <strong style="font-size:16px;">Imtihan</strong>
    </div>
    ${intro}
    <p style="color:#555;margin:0 0 8px 0;">Your exam is attached. It includes the full corrigé with methodology and answers.</p>
    <p style="color:#777;font-size:12px;margin-top:24px;">— Imtihan · AI exam generator for Lebanese teachers</p>
  </div>
</body></html>`;
}
