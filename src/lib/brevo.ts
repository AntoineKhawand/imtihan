import { adminDb } from "@/lib/firebase-admin";
import { marketingFooter, marketingPreferenceId } from "@/lib/marketingEmail";
const BREVO_API = "https://api.brevo.com/v3/smtp/email";
const SENDER = { name: "Imtihan", email: "admin@imtihan.live" };

export interface BrevoAttachment {
  name: string;
  content: string; // base64
}

export interface BrevoPayload {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  purpose: "transactional" | "marketing";
  attachment?: BrevoAttachment;
}

/**
 * Send email via Brevo. Promotional callers must use purpose: "marketing".
 * Returns { ok: true } on success, { ok: false, error } on failure.
 * Missing API keys, address or preference storage fail closed; no real sends in tests.
 */
export async function sendEmail(
  payload: BrevoPayload,
): Promise<{ ok: boolean; error?: string; skipped?: boolean }> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey || apiKey === "your_brevo_api_key_here") {
    console.log(
      "[brevo] No valid BREVO_API_KEY — email not sent:",
      payload.subject,
      "→",
      payload.to,
    );
    return {
      ok: false,
      error: "Email service not configured (missing API key).",
    };
  }

  let html = payload.html;
  let unsubscribeUrl: string | undefined;
  if (payload.purpose === "marketing") {
    try {
      const preference = await adminDb
        .collection("marketing_preferences")
        .doc(marketingPreferenceId(payload.to))
        .get();
      if (preference.data()?.unsubscribed === true)
        return { ok: true, skipped: true };
      const footer = marketingFooter(payload.to);
      unsubscribeUrl = footer.url;
      html = /<\/body>/i.test(html)
        ? html.replace(/<\/body>/i, `${footer.html}</body>`)
        : html + footer.html;
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Marketing preference check failed.",
      };
    }
  }
  const body: Record<string, unknown> = {
    sender: SENDER,
    to: [{ email: payload.to, name: payload.toName ?? payload.to }],
    subject: payload.subject,
    htmlContent: html,
  };
  if (unsubscribeUrl)
    body.headers = {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    };

  if (payload.attachment) {
    body.attachment = [
      { name: payload.attachment.name, content: payload.attachment.content },
    ];
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
