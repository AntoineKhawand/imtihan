const BREVO_API = "https://api.brevo.com/v3/smtp/email";
const SENDER = { name: "Imtihan", email: "billing@imtihan.live" };

export interface BrevoAttachment {
  name: string;
  content: string; // base64
}

export interface BrevoPayload {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  attachment?: BrevoAttachment;
}

/**
 * Send a transactional email via Brevo.
 * Returns { ok: true } on success, { ok: false, error } on failure.
 * If BREVO_API_KEY is not set, logs to console and returns ok:true (dev mode).
 */
export async function sendEmail(payload: BrevoPayload): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey || apiKey === "your_brevo_api_key_here") {
    console.log("[brevo] No valid BREVO_API_KEY — email not sent:", payload.subject, "→", payload.to);
    return { ok: false, error: "Email service not configured (missing API key)." };
  }

  const body: Record<string, unknown> = {
    sender: SENDER,
    to: [{ email: payload.to, name: payload.toName ?? payload.to }],
    subject: payload.subject,
    htmlContent: payload.html,
  };

  if (payload.attachment) {
    body.attachment = [{ name: payload.attachment.name, content: payload.attachment.content }];
  }

  const res = await fetch(BREVO_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: `Brevo ${res.status}: ${text.slice(0, 200)}` };
  }

  return { ok: true };
}
