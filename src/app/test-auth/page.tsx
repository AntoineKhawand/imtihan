"use client";

// DEVELOPMENT ONLY — used exclusively by Playwright e2e tests.
// Visits /test-auth?uid=xxx&redirect=/dashboard to sign in without Google OAuth.
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";

function TestAuthInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Signing in…");

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      router.replace("/");
      return;
    }

    const uid = searchParams.get("uid");
    const redirect = searchParams.get("redirect") || "/dashboard";

    if (!uid) {
      setStatus("Error: uid param missing");
      return;
    }

    (async () => {
      try {
        setStatus(`Fetching token for ${uid}…`);
        const res = await fetch("/api/test/custom-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid }),
        });
        if (!res.ok) {
          const err = await res.json();
          setStatus(`Error: ${err.error}`);
          return;
        }
        const { customToken } = await res.json();

        setStatus("Signing in with Firebase…");
        await signInWithCustomToken(auth, customToken);

        // Give AuthContext's syncSessionCookie a moment to fire and set __session
        await new Promise((r) => setTimeout(r, 1500));
        setStatus("Done — redirecting…");
        router.replace(redirect);
      } catch (err) {
        setStatus(`Error: ${(err as Error).message}`);
      }
    })();
  }, []);

  return (
    <div style={{ fontFamily: "monospace", padding: 32 }}>
      <p>🧪 Playwright test auth</p>
      <p>{status}</p>
    </div>
  );
}

export default function TestAuthPage() {
  return (
    <Suspense fallback={<div style={{ fontFamily: "monospace", padding: 32 }}>Loading…</div>}>
      <TestAuthInner />
    </Suspense>
  );
}
