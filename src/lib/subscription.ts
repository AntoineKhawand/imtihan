import type { UserProfile } from "@/types/user";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const RENEWAL_WARNING_DAYS = 5;
const GRACE_PERIOD_DAYS = 3;

/** True when the teacher has an active Pro subscription (proExpiresAt is in the future). */
export function isProActive(user: UserProfile | null | undefined): boolean {
  if (!user?.proExpiresAt) return false;
  return user.proExpiresAt > Date.now();
}

/** True when Pro just expired but is still within the 3-day grace period. */
export function isInGracePeriod(user: UserProfile | null | undefined): boolean {
  if (!user?.proExpiresAt) return false;
  const now = Date.now();
  return user.proExpiresAt <= now && user.proExpiresAt > now - GRACE_PERIOD_DAYS * MS_PER_DAY;
}

/** Days remaining until expiry. Negative once expired. */
export function daysUntilExpiry(user: UserProfile | null | undefined): number {
  if (!user?.proExpiresAt) return 0;
  return Math.ceil((user.proExpiresAt - Date.now()) / MS_PER_DAY);
}

/** True when Pro is active but expires within 5 days — show the yellow renewal banner. */
export function shouldShowRenewalWarning(user: UserProfile | null | undefined): boolean {
  if (!isProActive(user)) return false;
  return daysUntilExpiry(user) <= RENEWAL_WARNING_DAYS;
}

/**
 * Returns a pre-filled WhatsApp link to the support number.
 * Set NEXT_PUBLIC_WHATSAPP_NUMBER in .env.local (digits only, e.g. 96171234567).
 */
export function getWhatsAppRenewalLink(email: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const message = encodeURIComponent(
    `Hello! I would like to renew my Imtihan Pro subscription for another month.\nMy account email is: ${email}`
  );
  return `https://wa.me/${number}?text=${message}`;
}

/** Returns a pre-filled WhatsApp link for a new upgrade (same as renewal but different wording). */
export function getWhatsAppUpgradeLink(email: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const message = encodeURIComponent(
    `Hello! I would like to upgrade to Imtihan Pro ($5.99/month).\nMy account email is: ${email}`
  );
  return `https://wa.me/${number}?text=${message}`;
}

/**
 * Calculates the new proExpiresAt timestamp after a +30-day extension.
 * Extends from the CURRENT expiry if still active, or from NOW if already expired.
 */
export function extendProByDays(currentExpiresAt: number | undefined, days = 30): number {
  const base =
    currentExpiresAt && currentExpiresAt > Date.now() ? currentExpiresAt : Date.now();
  return base + days * MS_PER_DAY;
}
