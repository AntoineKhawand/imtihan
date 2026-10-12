import { createHash, createHmac, timingSafeEqual } from "node:crypto";

function signingSecret(): string {
  const secret =
    process.env.MARKETING_UNSUBSCRIBE_SECRET || process.env.CRON_SECRET;
  if (!secret || secret.length < 32)
    throw new Error(
      "Marketing unsubscribe signing secret must contain at least 32 characters.",
    );
  return secret;
}
export function marketingPreferenceId(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}
export function createUnsubscribeToken(email: string): string {
  const id = marketingPreferenceId(email);
  const signature = createHmac("sha256", signingSecret())
    .update(`marketing-unsubscribe:v1:${id}`)
    .digest("hex");
  return `${id}.${signature}`;
}
export function verifyUnsubscribeToken(token: string): string | null {
  if (!/^[a-f0-9]{64}\.[a-f0-9]{64}$/.test(token)) return null;
  const [id, signature] = token.split(".");
  const expected = createHmac("sha256", signingSecret())
    .update(`marketing-unsubscribe:v1:${id}`)
    .digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex")) ? id : null;
}
export function marketingFooter(email: string): { html: string; url: string } {
  const address = process.env.MARKETING_POSTAL_ADDRESS?.trim();
  if (!address)
    throw new Error(
      "Promotional email paused: configure a valid MARKETING_POSTAL_ADDRESS.",
    );
  const url = `https://imtihan.live/unsubscribe?token=${createUnsubscribeToken(email)}`;
  const escaped = address.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
  return {
    url,
    html: `<div style="padding:24px;text-align:center;font:12px/1.7 Arial,sans-serif;color:#64748b"><p>Promotional email from Imtihan</p><p style="white-space:pre-line">${escaped}</p><a href="${url}" style="color:#1a5e3f;text-decoration:underline">Unsubscribe from promotional emails</a><p>Requested exam deliveries and essential account messages are unaffected.</p></div>`,
  };
}
