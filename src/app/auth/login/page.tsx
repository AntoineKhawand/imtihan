"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";

function getRedirectDestination(): string {
  if (typeof document === "undefined") return "/dashboard";
  const match = document.cookie.match(/(?:^|;\s*)__redirect=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "/dashboard";
}

function clearRedirectCookie() {
  document.cookie = "__redirect=; Max-Age=0; Path=/";
}

async function setSessionCookie(idToken: string): Promise<void> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: idToken }),
  });
  if (!res.ok) throw new Error(`session-failed:${res.status}`);
}

function LoginForm() {
  const [dest, setDest] = useState("/dashboard");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read + clear the redirect cookie once on mount
  useEffect(() => {
    setDest(getRedirectDestination());
    clearRedirectCookie();
  }, []);

  async function handleEmail() {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await setSessionCookie(await credential.user.getIdToken());
      window.location.assign(dest);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "unknown";
      if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
        setError("No account found with those credentials.");
      } else if (code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please wait a moment.");
      } else if ((err as Error).message?.startsWith("session-failed")) {
        setError("Sign-in succeeded but session could not be created. Check your server configuration.");
      } else {
        setError(`Sign-in failed (${code}).`);
      }
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const credential = await signInWithPopup(auth, provider);
      // Wait for the session cookie before navigating — proxy needs it
      await setSessionCookie(await credential.user.getIdToken());
      window.location.assign(dest);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        // dismissed — no error
      } else if (code === "auth/popup-blocked") {
        setError("Popup blocked. Allow popups for this site and try again.");
      } else if (code === "auth/unauthorized-domain") {
        setError("This domain isn't authorized. Add it under Firebase → Auth → Authorized domains.");
      } else if (code === "auth/network-request-failed") {
        setError("Network error. Check your connection.");
      } else if ((err as Error).message?.startsWith("session-failed")) {
        setError("Sign-in succeeded but session could not be created. Check your server configuration.");
      } else {
        setError(`Google sign-in failed: ${code || "unknown error"}`);
      }
      setGoogleLoading(false);
    }
  }

  return (
    <div className="card p-8 md:p-10 shadow-xl shadow-black/[0.03] ring-1 ring-black/[0.01]">
      <div className="mb-8 flex flex-col items-center text-center">
        <h1 className="serif text-display-md text-[var(--text)] mb-2">Welcome back</h1>
        <p className="text-sm text-[var(--text-secondary)]">Sign in to access your exam library.</p>
      </div>

      <div className="space-y-6">
        {/* Google Login */}
        <Button
          variant="secondary"
          size="lg"
          className="w-full bg-[var(--surface)] hover:bg-[var(--bg-subtle)] border-[var(--border-strong)]/50"
          loading={googleLoading}
          onClick={handleGoogle}
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          }
        >
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="relative flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-bold">or use email</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <Input 
            label="Email Address" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="you@school.edu.lb" 
            className="bg-[var(--bg-subtle)]/30"
          />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider ml-1">Password</label>
              <Link href="/auth/forgot" className="text-[11px] text-[var(--accent)] hover:underline font-medium">Forgot?</Link>
            </div>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              className="bg-[var(--bg-subtle)]/30"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-[11px] text-red-600 leading-relaxed animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}

        <div className="space-y-4 pt-2">
          <Button 
            onClick={handleEmail} 
            loading={loading} 
            disabled={!email || !password} 
            size="lg" 
            className="w-full shadow-lg shadow-[var(--accent)]/10 ring-1 ring-white/10"
          >
            Sign in
          </Button>

          <p className="text-center text-xs text-[var(--text-secondary)]">
            No account?{" "}
            <Link href="/auth/register" className="text-[var(--accent)] font-semibold hover:underline decoration-2 underline-offset-4">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm h-96 skeleton" />}>
      <LoginForm />
    </Suspense>
  );
}
