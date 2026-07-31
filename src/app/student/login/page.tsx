"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";
import { useStudentAuth } from "@/lib/studentAuth";
import { BookOpen } from "lucide-react";

type Mode = "login" | "register";

export default function StudentLoginPage() {
  const { user, studentProfile, loading, signIn, register } = useStudentAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already signed in as a student
  useEffect(() => {
    if (!loading && user && studentProfile) {
      router.replace("/student/dashboard");
    }
  }, [loading, user, studentProfile, router]);

  function friendlyError(code: string): string {
    switch (code) {
      case "auth/user-not-found":
      case "auth/invalid-credential":
        return "No account found with those credentials.";
      case "auth/wrong-password":
        return "Incorrect password. Try again.";
      case "auth/email-already-in-use":
        return "An account with this email already exists. Sign in instead.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment.";
      case "auth/invalid-email":
        return "Enter a valid email address.";
      default:
        return `Something went wrong (${code}).`;
    }
  }

  async function handleSubmit() {
    setError(null);
    if (!email || !password) return;
    if (mode === "register" && !displayName.trim()) {
      setError("Enter your name.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        router.replace("/student/dashboard");
      } else {
        await register(email, password, displayName.trim(), schoolName.trim() || undefined);
        router.replace("/student/dashboard");
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "unknown";
      setError(friendlyError(code));
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-4 py-12">
      {/* Card */}
      <div className="w-full max-w-sm bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-xl p-8 space-y-7">

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center mb-1">
            <BookOpen size={22} className="text-[var(--accent)]" />
          </div>
          <Logo size={28} showText />
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {mode === "login" ? "Student portal — sign in to practice." : "Create your student account."}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-[var(--bg-subtle)] p-1 rounded-xl border border-[var(--border)]">
          <button
            onClick={() => { setMode("login"); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === "login"
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface)]"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => { setMode("register"); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === "register"
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface)]"
            }`}
          >
            Register
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {mode === "register" && (
            <Input
              label="Your name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Sara Khalil"
            />
          )}
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
            placeholder="••••••••"
          />
          {mode === "register" && (
            <Input
              label="School name (optional)"
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. Collège des Frères"
              hint="Match the name your teacher uses in the school bank."
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100 text-[12px] text-red-600 leading-relaxed">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 fill-red-500">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4zm0 8a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
            {error}
          </div>
        )}

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          loading={busy}
          disabled={!email || !password}
          size="lg"
          className="w-full rounded-xl font-semibold"
        >
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-[var(--text-tertiary)] text-center">
        Are you a teacher?{" "}
        <a href="/auth/login" className="text-[var(--accent)] hover:underline">
          Sign in here
        </a>
      </p>
    </div>
  );
}
