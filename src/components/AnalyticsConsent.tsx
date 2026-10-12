"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { ANALYTICS_BOOTSTRAP } from "@/lib/analytics-bootstrap";
import { ANALYTICS_CONSENT_KEY } from "@/lib/analyticsConsent";

export function AnalyticsConsent() {
  const [choice, setChoice] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      const value = localStorage.getItem(ANALYTICS_CONSENT_KEY);
      if (value === "accepted" || value === "rejected") setChoice(value);
      else setOpen(true);
    } catch {
      setOpen(true);
    }
    setReady(true);
  }, []);
  function choose(value: "accepted" | "rejected") {
    try {
      localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
    } catch {
      if (value === "accepted") {
        setStorageError(true);
        return;
      }
      if (choice === "accepted") {
        window.location.reload();
        return;
      }
      setChoice("rejected");
      setOpen(false);
      return;
    }
    if (value === "rejected") {
      // Reload after withdrawal so already loaded analytics scripts stop executing.
      for (const cookie of document.cookie.split(";")) {
        const name = cookie.split("=")[0].trim();
        if (!/^_ga(?:_|$)/.test(name)) continue;
        for (const domain of [
          "",
          `; Domain=${location.hostname}`,
          "; Domain=.imtihan.live",
        ])
          document.cookie = `${name}=; Max-Age=0; Path=/${domain}`;
      }
      window.location.reload();
      return;
    }
    setChoice(value);
    setOpen(false);
  }
  return (
    <>
      {choice === "accepted" && (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-7DZ1T3P599"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {ANALYTICS_BOOTSTRAP}
          </Script>
          <Script
            async
            src="https://plausible.io/js/pa-h5uHdOrIPNH5TEW_uzfof.js"
            strategy="afterInteractive"
          />
          <Script
            id="plausible-init"
            strategy="afterInteractive"
          >{`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}</Script>
          <Analytics />
        </>
      )}
      {ready &&
        (open ? (
          <section
            aria-label="Analytics privacy choices"
            className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl"
          >
            <p className="font-semibold text-[var(--text)]">
              Your analytics choices
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              We use optional Google Analytics, Plausible and Vercel Analytics
              to understand visits and feature usage. You can use Imtihan
              without them. We do not record session replays.{" "}
              <Link href="/privacy" className="underline">
                Privacy policy
              </Link>
            </p>
            {storageError && (
              <p
                role="status"
                className="mt-2 text-sm text-[var(--text-secondary)]"
              >
                Your browser cannot save this choice. Analytics will remain off.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => choose("rejected")}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)]"
              >
                Reject analytics
              </button>
              <button
                onClick={() => choose("accepted")}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)]"
              >
                Accept analytics
              </button>
            </div>
          </section>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="fixed bottom-2 left-2 z-50 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text-secondary)]"
          >
            Privacy choices
          </button>
        ))}
    </>
  );
}
