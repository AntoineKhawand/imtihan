"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !loading && !googleLoading) {
      console.log("[LoginForm] Auth state detected. Auto-redirecting to:", next);
      window.location.assign(next);
    }
  }, [user, loading, googleLoading, next]);

  console.log("[LoginForm] Rendering. Email:", email, "Next:", next);

  async function handleEmail() {
    console.log("[Email login] Button clicked. Email:", email);
    if (!email || !password) {
      console.warn("[Email login] Missing email or password");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log("[Email login] Calling signInWithEmailAndPassword with email:", email);
      await signInWithEmailAndPassword(auth, email, password);
      console.log("[Email login] Success. Redirecting to:", next);
      window.location.assign(next);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      const code = e.code ?? "unknown";
      console.error("[Email login] Error:", code, e.message);
      if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
        setError("Account not found or invalid password. Please create an account first if you haven't yet.");
      } else if (code === "auth/wrong-password") {
        setError("Invalid password. Please try again.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError(`Login failed: ${code}. Please check your details.`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    console.log("[Google login] Button clicked");
    setGoogleLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      console.log("[Google login] Starting signInWithPopup...");
      const credential = await signInWithPopup(auth, provider);
      console.log("[Google login] Success. User:", credential.user.email, "Redirecting to:", next);
      
      // Force a small delay to ensure session sync starts
      setTimeout(() => {
        console.log("[Google login] Executing window.location.assign(", next, ")");
        window.location.assign(next);
      }, 100);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string; stack?: string };
      const code = e.code ?? "";
      console.error("[Google login] Error detail:", { code, message: e.message, stack: e.stack });
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setError(null);
      } else if (code === "auth/popup-blocked") {
        setError("Popup blocked by your browser. Allow popups for this site and retry.");
      } else if (code === "auth/unauthorized-domain") {
        setError("This domain isn't authorized in Firebase. Add it under Auth → Settings → Authorized domains.");
      } else if (code === "auth/operation-not-allowed") {
        setError("Google sign-in is disabled. Enable it in Firebase Console → Authentication → Sign-in method.");
      } else if (code === "auth/invalid-api-key" || code === "auth/api-key-not-valid") {
        setError("Firebase API key is missing or invalid. Check NEXT_PUBLIC_FIREBASE_API_KEY in .env.local.");
      } else if (code === "auth/network-request-failed") {
        setError("Network error. Please check your internet, disable ad-blockers, and ensure your domain (e.g. localhost) is added to 'Authorized domains' in Firebase Console.");
      } else {
        setError(`Google login failed: ${code || e.message || "unknown error"}`);
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center">
          <span className="text-white font-serif">إ</span>
        </div>
        <span className="font-semibold text-lg text-[var(--text)] tracking-tight">Imtihan</span>
      </div>

      <h1 className="serif text-3xl text-[var(--text)] mb-1">Welcome back</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-8">Sign in to access your exam library.</p>

      {/* Google */}
      <Button
        variant="secondary"
        size="lg"
        className="w-full mb-4"
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

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 border-t border-[var(--border)]" />
        <span className="text-xs text-[var(--text-tertiary)]">or</span>
        <div className="flex-1 border-t border-[var(--border)]" />
      </div>

      <div className="space-y-4 mb-4">
        <Input 
          label="Email" 
          type="email" 
          value={email} 
          onChange={(e) => {
            console.log("[LoginForm] Email change:", e.target.value);
            setEmail(e.target.value);
          }} 
          placeholder="you@school.edu.lb" 
        />
        <Input 
          label="Password" 
          type="password" 
          value={password} 
          onChange={(e) => {
            console.log("[LoginForm] Password change");
            setPassword(e.target.value);
          }} 
          placeholder="••••••••" 
        />
      </div>

      {error && <p className="text-xs text-[var(--danger)] mb-4">{error}</p>}

      <Button onClick={handleEmail} loading={loading} size="lg" className="w-full mb-4">
        Sign in
      </Button>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        No account?{" "}
        <Link href="/auth/register" className="text-[var(--accent)] hover:underline">Create one free</Link>
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
