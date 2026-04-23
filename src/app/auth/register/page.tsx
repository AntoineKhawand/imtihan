"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  getAdditionalUserInfo,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, getFirebaseConfig } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";
import { ArrowLeft, User } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { UserRole } from "@/types/user";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("teacher");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !loading && !googleLoading) {
      console.log("[RegisterPage] Auth state detected. Auto-redirecting to:", next);
      window.location.assign(next);
    }
  }, [user, loading, googleLoading, next]);

  async function handleRegister() {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      console.log("[Register] Creating user with email:", email);
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("[Register] User created. UID:", credential.user.uid);

      if (displayName.trim()) {
        await updateProfile(credential.user, { displayName: displayName.trim() });
        console.log("[Register] Profile updated with name:", displayName.trim());
      }
      
      // Save custom user profile immediately
      console.log("[Register] Saving profile to Firestore...");
      const userRef = doc(db, "users", credential.user.uid);
      await setDoc(userRef, {
        uid: credential.user.uid,
        email: credential.user.email || "",
        displayName: displayName.trim() || "",
        createdAt: serverTimestamp(),
        role: role,
        country: "LB",
        examsGenerated: 0,
        subscription: {
          status: "none",
          tier: "free",
        },
      });
      console.log("[Register] Firestore profile saved.");

      console.log("[Register] Redirecting to:", next);
      window.location.href = next;
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string; stack?: string };
      const code = e.code ?? "";
      console.error("[Register] Error detail:", { code, message: e.message, stack: e.stack });
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
      if (!auth) {
        console.error("[Google sign-up] Firebase auth not initialized");
        setError("Firebase not initialized. Reload the page and try again.");
        setGoogleLoading(false);
        return;
      }
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      console.log("[Google sign-up] Starting signInWithPopup...");
      const credential = await signInWithPopup(auth, provider);
      console.log("[Google sign-up] Success. User:", credential.user.email);
      
      const additionalInfo = getAdditionalUserInfo(credential);
      if (additionalInfo?.isNewUser) {
        const userRef = doc(db, "users", credential.user.uid);
        await setDoc(userRef, {
          uid: credential.user.uid,
          email: credential.user.email || "",
          displayName: credential.user.displayName || "",
          createdAt: serverTimestamp(),
          role: role,
          country: "LB",
          examsGenerated: 0,
          subscription: {
            status: "none",
            tier: "free",
          },
        });
      }

      console.log("[Google sign-up] Redirecting to:", next);
      window.location.href = next;
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string; stack?: string };
      const code = e.code ?? "";
      console.error("[Google sign-up] Error detail:", { code, message: e.message, stack: e.stack });
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setError(null);
      } else if (code === "auth/popup-blocked") {
        setError("Popup blocked by your browser. Allow popups for this site and retry.");
      } else if (code === "auth/unauthorized-domain") {
        setError("This domain isn't authorized in Firebase. Add it under Auth → Settings → Authorized domains.");
      } else if (code === "auth/operation-not-allowed") {
        setError("Google sign-in is disabled. Enable it in Firebase Console → Authentication → Sign-in method.");
      } else if (code === "auth/internal-error") {
        setError("Google sign-in is not configured. Enable Google in Firebase Console → Authentication → Sign-in method.");
      } else {
        setError(`Google sign-up failed: ${code || e.message || "unknown error"}`);
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center">
          <span className="text-white font-serif">إ</span>
        </div>
        <span className="font-semibold text-lg text-[var(--text)] tracking-tight">Imtihan</span>
      </div>

      <h1 className="serif text-3xl text-[var(--text)] mb-1">Create your account</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">
        2 free exams — no credit card required.
      </p>

      {/* Role Selection */}
      <div className="grid grid-cols-1 gap-3 mb-8">
        <button
          onClick={() => setRole("teacher")}
          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border ${
            role === "teacher"
              ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
          } transition-all duration-200`}
        >
          <User size={24} />
          <span className="text-sm font-medium">I'm a Teacher</span>
        </button>
      </div>

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
  );
}
