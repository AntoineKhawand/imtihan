"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";
import { Logo as BrandLogo } from "@/components/ui/Logo";

function getRedirectDestination(): string {
  if (typeof document === "undefined") return "/create";
  const match = document.cookie.match(/(?:^|;\s*)__redirect=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "/create";
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
  const [dest, setDest] = useState("/create");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="space-y-8">

      {/* Header */}
      <div className="space-y-2">
        <BrandLogo size={40} showText={false} className="mb-4" />
        <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Sign in to your account to continue.
        </p>
      </div>

      {/* Google button */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 h-11 px-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 text-[13px] font-semibold text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {googleLoading ? (
          <svg className="w-4 h-4 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-[11px] font-medium text-[var(--text-tertiary)]">or</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

      {/* Email + Password */}
      <div className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@school.edu.lb"
        />
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider ml-1">
              Password
            </label>
            <Link
              href="/auth/forgot"
              className="text-[11px] text-[var(--accent)] hover:underline underline-offset-2 font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-[12px] text-red-600 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 fill-red-500">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4zm0 8a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleEmail}
        loading={loading}
        disabled={!email || !password}
        size="lg"
        className="w-full h-11 rounded-xl font-semibold"
      >
        Sign in
      </Button>

      {/* Footer link */}
      <p className="text-center text-[13px] text-[var(--text-secondary)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="font-semibold text-[var(--accent)] hover:underline underline-offset-2"
        >
          Create one free
        </Link>
      </p>
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
