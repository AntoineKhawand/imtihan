import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/brevo";

const RequestSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().optional(),
  fileBase64: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
});

/**
 * POST /api/email — delivers a generated exam as an attachment via Brevo.
 * Requires env: BREVO_API_KEY (set in Vercel).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { to, subject, message, fileBase64, fileName } = parsed.data;

    const result = await sendEmail({
      to,
      subject,
      html: buildHtmlBody(message ?? ""),
      attachment: { name: fileName, content: fileBase64 },
    });

    if (!result.ok) {
      console.error("[/api/email] Brevo error:", result.error);
      return NextResponse.json(
        { success: false, error: result.error ?? "Email send failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
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
  const intro = safe ? `<p style="margin:0 0 12px 0;white-space:pre-wrap;">${safe}</p>` : "";
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
