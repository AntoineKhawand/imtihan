"use client";

import { MessageCircle, X, AlertTriangle, Lock } from "lucide-react";
import {
  isProActive,
  isInGracePeriod,
  shouldShowRenewalWarning,
  daysUntilExpiry,
  getWhatsAppRenewalLink,
} from "@/lib/subscription";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export function RenewalBanner() {
  const { profile } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!profile || dismissed) return null;

  const warning = shouldShowRenewalWarning(profile);
  const grace = isInGracePeriod(profile);
  const expired = !isProActive(profile) && !grace && !!profile.proExpiresAt;

  if (!warning && !grace && !expired) return null;

  const days = daysUntilExpiry(profile);
  const link = getWhatsAppRenewalLink(profile.email);

  if (grace || expired) {
    return (
      <div className="w-full bg-red-600 text-white px-4 py-2.5 flex items-center gap-3">
        <Lock size={14} className="flex-shrink-0" />
        <p className="text-sm flex-1">
          {grace
            ? `Your Pro plan expired. You have a 3-day grace period — renew now to keep creating exams.`
            : `Your Pro plan has expired. Your previous exams are saved, but new exam creation is locked.`}
        </p>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-1.5 bg-white text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
        >
          <MessageCircle size={12} />
          Renew via WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 text-amber-800 px-4 py-2.5 flex items-center gap-3">
      <AlertTriangle size={14} className="flex-shrink-0 text-amber-500" />
      <p className="text-sm flex-1">
        Your Pro plan expires in{" "}
        <strong>{days} day{days !== 1 ? "s" : ""}</strong>. Renew to keep uninterrupted access.
      </p>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 flex items-center gap-1.5 bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors"
      >
        <MessageCircle size={12} />
        Renew via WhatsApp
      </a>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 p-1 rounded hover:bg-amber-100 transition-colors"
        aria-label="Dismiss"
      >
        <X size={13} />
      </button>
    </div>
  );
}
