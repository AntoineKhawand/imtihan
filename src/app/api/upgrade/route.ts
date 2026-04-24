import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSecurityHeaders } from "@/lib/security";

const BodySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(5).max(30),
  plan: z.enum(["monthly", "yearly"]),
  paymentMethod: z.enum(["whish", "omt", "other"]),
});

// ─────────────────────────────────────────────────────────────────────────────
// Customize the email template here.
// Change subject, payment instructions, amounts, contacts — all in one place.
// ─────────────────────────────────────────────────────────────────────────────
function buildAdminEmail(data: z.infer<typeof BodySchema>): { subject: string; html: string } {
  const planLabel = data.plan === "yearly"
    ? "Yearly — $47.88/year ($3.99/mo)"
    : "Monthly — $5.99/month";

  const subject = `New Pro Upgrade Request — ${data.name}`;

  const html = `
<!doctype html>
<html>
<body style="font-family:system-ui,sans-serif;font-size:15px;color:#111;padding:24px;max-width:560px;margin:0 auto">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #e5e7eb">
    <div style="width:32px;height:32px;border-radius:8px;background:#1a5e3f;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px">إ</div>
    <strong style="font-size:16px;color:#1a5e3f">Imtihan — New Upgrade Request</strong>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
    <tr><td style="padding:8px 0;color:#6b7280;width:140px">Name</td><td style="padding:8px 0;font-weight:600">${data.name}</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0;font-weight:600"><a href="mailto:${data.email}">${data.email}</a></td></tr>
    <tr><td style="padding:8px 0;color:#6b7280">Phone</td><td style="padding:8px 0;font-weight:600">${data.phone}</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280">Plan</td><td style="padding:8px 0;font-weight:600">${planLabel}</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280">Payment</td><td style="padding:8px 0;font-weight:600;text-transform:capitalize">${data.paymentMethod}</td></tr>
  </table>

  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:20px">
    <p style="margin:0;font-weight:600;color:#166534">Action required</p>
    <p style="margin:8px 0 0;color:#166534;font-size:14px">Contact this teacher and send them the payment link / reference.</p>
  </div>

  <p style="color:#9ca3af;font-size:12px;margin-top:24px">Imtihan · Automated upgrade notification</p>
</body>
</html>`;

  return { subject, html };
}

function buildConfirmationEmail(data: z.infer<typeof BodySchema>): { subject: string; html: string } {
  const planLabel = data.plan === "yearly"
    ? "Yearly — $47.88/year"
    : "Monthly — $5.99/month";

  // ── CUSTOMIZE PAYMENT INSTRUCTIONS BELOW ──────────────────────────────────
  const paymentInstructions: Record<string, string> = {
    whish: "Send via <strong>Whish Money</strong> to <strong>+961 70 542 238</strong> (Antoine Khawand). Use your email as the reference.",
    omt:   "Send via <strong>OMT</strong> to <strong>+961 70 542 238</strong> (Antoine Khawand). Use your email as the reference.",
    other: "Reply to this email and we'll share the best option for you.",
  };
  // ── END CUSTOMIZATION ──────────────────────────────────────────────────────

  const instructions = paymentInstructions[data.paymentMethod] ?? paymentInstructions.other;

  const subject = "Your Imtihan Pro upgrade request — next steps";

  const html = `
<!doctype html>
<html>
<body style="font-family:system-ui,sans-serif;font-size:15px;color:#111;padding:24px;max-width:560px;margin:0 auto">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #e5e7eb">
    <div style="width:32px;height:32px;border-radius:8px;background:#1a5e3f;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px">إ</div>
    <strong style="font-size:16px">Imtihan</strong>
  </div>

  <p style="margin:0 0 8px">Hi <strong>${data.name}</strong>,</p>
  <p style="margin:0 0 20px;color:#374151">We received your request to upgrade to <strong>Imtihan Pro (${planLabel})</strong>.</p>

  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px">
    <p style="margin:0 0 10px;font-weight:600;font-size:14px;color:#374151">Payment instructions</p>
    <p style="margin:0;font-size:14px;color:#374151;line-height:1.6">${instructions}</p>
  </div>

  <p style="font-size:14px;color:#374151;margin:0 0 8px">Once we confirm your payment, your account will be upgraded <strong>instantly</strong>.</p>
  <p style="font-size:14px;color:#374151;margin:0 0 20px">Questions? Just reply to this email.</p>

  <p style="color:#9ca3af;font-size:12px;margin-top:24px">Imtihan · Made for Lebanese teachers</p>
</body>
</html>`;

  return { subject, html };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request" },
        { status: 400, headers: createSecurityHeaders() }
      );
    }

    const data = parsed.data;
    const apiKey = process.env.RESEND_API_KEY;

    if (apiKey) {
      const from = process.env.RESEND_FROM ?? "Imtihan <noreply@imtihan.live>";
      const adminEmail = buildAdminEmail(data);
      const confirmEmail = buildConfirmationEmail(data);

      // Send notification to admin
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          from,
          to: ["hello@imtihan.live"],
          subject: adminEmail.subject,
          html: adminEmail.html,
        }),
      });

      // Send confirmation to user
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          from,
          to: [data.email],
          subject: confirmEmail.subject,
          html: confirmEmail.html,
        }),
      });
    } else {
      // Log to server console so you can see requests even without Resend
      console.log("[/api/upgrade] New upgrade request (Resend not configured):", data);
    }

    return NextResponse.json({ success: true }, { headers: createSecurityHeaders() });
  } catch (err) {
    console.error("[/api/upgrade]", err);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500, headers: createSecurityHeaders() }
    );
  }
}
