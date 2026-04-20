"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName.trim()) {
        await updateProfile(credential.user, { displayName: displayName.trim() });
      }
      router.push("/create");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Try signing in.");
      } else if (code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else if (code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/create");
    } catch {
      setError("Google sign-up failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="flex items-center px-6 md:px-10 h-16 border-b border-[var(--border)]">
        <Link
          href="/"
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back to home</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center">
              <span className="text-white font-serif">إ</span>
            </div>
            <span className="font-semibold text-lg text-[var(--text)] tracking-tight">Imtihan</span>
          </div>

          <h1 className="serif text-3xl text-[var(--text)] mb-1">Create your account</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-8">
            3 free exams — no credit card required.
          </p>

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
              label="Full name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Antoine Khoury"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu.lb"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          {error && <p className="text-xs text-[var(--danger)] mb-4">{error}</p>}

          <Button
            onClick={handleRegister}
            loading={loading}
            disabled={!email || !password}
            size="lg"
            className="w-full mb-4"
          >
            Create account
          </Button>

          <p className="text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[var(--accent)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
