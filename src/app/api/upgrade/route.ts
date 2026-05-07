import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSecurityHeaders } from "@/lib/security";
import { sendEmail } from "@/lib/brevo";

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
<head>
  <style>
    @media screen and (max-width: 560px) {
      .email-body { width: 100% !important; padding: 16px !important; }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .admin-cta:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 16px rgba(26,94,63,0.3) !important; }
    .admin-cta { transition: all 0.3s ease; display: inline-block; }
    .fade-in { animation: fadeIn 0.5s ease-out; }
  </style>
</head>
<body style="font-family:system-ui,sans-serif;font-size:15px;color:#111;padding:24px;max-width:560px;margin:0 auto;background:#f8fafc">
  <div class="email-body fade-in" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);border:1px solid #eef2f6">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0d3d27 0%,#1a5e3f 100%);padding:32px">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle">
            <img src="https://imtihan.live/Imtihan-logo.png" width="40" height="40" style="border-radius:10px;display:block;box-shadow:0 4px 12px rgba(0,0,0,0.2)" alt="Imtihan" />
          </td>
          <td style="vertical-align:middle;padding-left:14px">
            <strong style="font-size:18px;color:#fff">Imtihan — New Upgrade Request</strong>
          </td>
        </tr>
      </table>

    <!-- Content -->
    <div style="padding:32px">
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#f8fafc;border-radius:12px;padding:20px">
        <tr><td style="padding:10px 0;color:#6b7280;width:140px;border-bottom:1px solid #e5e7eb">Name</td><td style="padding:10px 0;font-weight:600;border-bottom:1px solid #e5e7eb">${data.name}</td></tr>
        <tr><td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #e5e7eb">Email</td><td style="padding:10px 0;font-weight:600;border-bottom:1px solid #e5e7eb"><a href="mailto:${data.email}" style="color:#1a5e3f;text-decoration:none">${data.email}</a></td></tr>
        <tr><td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #e5e7eb">Phone</td><td style="padding:10px 0;font-weight:600;border-bottom:1px solid #e5e7eb">${data.phone}</td></tr>
        <tr><td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #e5e7eb">Plan</td><td style="padding:10px 0;font-weight:600;border-bottom:1px solid #e5e7eb">${planLabel}</td></tr>
        <tr><td style="padding:10px 0;color:#6b7280">Payment</td><td style="padding:10px 0;font-weight:600;text-transform:capitalize">${data.paymentMethod}</td></tr>
      </table>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:20px">
        <p style="margin:0 0 8px;font-weight:700;color:#166534;font-size:14px">⚡ Action required</p>
        <p style="margin:0;color:#166534;font-size:14px;line-height:1.6">Contact this teacher and send them the payment link / reference.</p>
      </div>

      <a href="mailto:${data.email}" class="admin-cta" style="display:inline-block;background:#1a5e3f;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px;box-shadow:0 4px 12px rgba(26,94,63,0.25)">Reply to teacher →</a>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:24px 32px;border-top:1px solid #e5e7eb;text-align:center">
      <p style="color:#9ca3af;font-size:12px;margin:0">Imtihan · Automated upgrade notification</p>
    </div>
  </div>
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
    whish: "Send via <strong>Whish Money</strong> to <strong>+961 70 542 238</strong>. Use your email as the reference.",
    omt:   "Send via <strong>OMT</strong> to <strong>+961 70 542 238</strong>. Use your email as the reference.",
    other: "Reply to this email and we'll share the best option for you.",
  };
  // ── END CUSTOMIZATION ──────────────────────────────────────────────────────

  const instructions = paymentInstructions[data.paymentMethod] ?? paymentInstructions.other;

  const subject = "Your Imtihan Pro upgrade request — next steps";

  const html = `
<!doctype html>
<html>
<head>
  <style>
    @media screen and (max-width: 560px) {
      .email-body { width: 100% !important; }
      .content-padding { padding: 24px !important; }
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
    .payment-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 20px rgba(26,94,63,0.35) !important; }
    .payment-box:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 18px rgba(0,0,0,0.08) !important; border-color: #1a5e3f !important; }
    .payment-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: inline-block; }
    .payment-box { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .slide-up { animation: slideUp 0.6s ease-out both; }
  </style>
</head>
<body style="font-family:system-ui,sans-serif;font-size:15px;color:#111;padding:24px;max-width:560px;margin:0 auto;background:#f8fafc">
  <div class="email-body slide-up" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);border:1px solid #eef2f6">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0d3d27 0%,#1a5e3f 100%);padding:36px;position:relative;overflow:hidden">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
        <img src="https://imtihan.live/Imtihan-logo.png" width="36" height="36" style="border-radius:10px;display:block;box-shadow:0 4px 12px rgba(0,0,0,0.2)" alt="Imtihan" />
        <strong style="font-size:20px;color:#fff">Imtihan</strong>
      </div>
      <div style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:100px;display:inline-block;padding:6px 14px">
        <span style="font-size:12px;color:#fff;font-weight:700;letter-spacing:0.5px">UPGRADE REQUEST RECEIVED</span>
      </div>
      <h1 style="margin:16px 0 8px;font-size:26px;font-weight:800;color:#fff;line-height:1.2">Hi ${data.name}!</h1>
      <p style="margin:0;color:rgba(255,255,255,0.8);font-size:15px;line-height:1.6">Your request to upgrade to <strong>Imtihan Pro (${planLabel})</strong> is being processed.</p>
    </div>

    <!-- Content -->
    <div class="content-padding" style="padding:36px">
      <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7">Complete your payment to activate Pro. Here's how:</p>

      <div class="payment-box" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:24px;margin-bottom:24px">
        <p style="margin:0 0 12px;font-weight:700;font-size:14px;color:#1e293b;text-transform:uppercase;letter-spacing:0.5px">Payment instructions</p>
        <p style="margin:0;font-size:15px;color:#374151;line-height:1.7">${instructions}</p>
      </div>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
        <p style="margin:0;font-weight:700;color:#166534;font-size:14px">After payment</p>
        <p style="margin:8px 0 0;color:#166534;font-size:14px;line-height:1.6">Your account will be upgraded <strong>instantly</strong> once we confirm payment.</p>
      </div>

      <div style="text-align:center">
        <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "96170542238"}" class="payment-btn" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 4px 16px rgba(37,211,102,0.3)">💬 Need help on WhatsApp?</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:28px 36px;border-top:1px solid #e5e7eb;text-align:center">
      <p style="margin:0 0 8px;color:#64748b;font-size:14px">Questions? Just reply to this email.</p>
      <p style="color:#9ca3af;font-size:12px;margin:0">Imtihan · Made for Lebanese teachers</p>
    </div>
  </div>
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
    const adminEmail   = buildAdminEmail(data);
    const confirmEmail = buildConfirmationEmail(data);

    // Notify admin
    await sendEmail({ to: "hello@imtihan.live", toName: "Imtihan Admin", subject: adminEmail.subject, html: adminEmail.html });

    // Confirm to user
    await sendEmail({ to: data.email, toName: data.name, subject: confirmEmail.subject, html: confirmEmail.html });

    return NextResponse.json({ success: true }, { headers: createSecurityHeaders() });
  } catch (err) {
    console.error("[/api/upgrade]", err);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500, headers: createSecurityHeaders() }
    );
  }
}
