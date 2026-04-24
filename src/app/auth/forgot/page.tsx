"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { Logo as BrandLogo } from "@/components/ui/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      console.error("Reset error:", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else {
        setError("Failed to send reset email. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-6 border border-emerald-100">
          <CheckCircle2 size={28} className="text-emerald-500" />
        </div>
        <h1 className="serif text-display-md text-[var(--text)] mb-3 tracking-tight">Check your email</h1>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-10 max-w-[320px] mx-auto">
          We&apos;ve sent a password reset link to <span className="font-bold text-[var(--text)]">{email}</span>. Please check your inbox and follow the instructions.
        </p>
        <div className="space-y-4">
          <Link href="/auth/login" className="block">
            <Button size="lg" className="w-full bg-[var(--accent)] h-12 rounded-xl shadow-lg shadow-[var(--accent)]/10">
              Return to login
            </Button>
          </Link>
          <button 
            onClick={() => setSuccess(false)}
            className="text-xs font-bold text-[var(--text-tertiary)] hover:text-[var(--text)] uppercase tracking-widest transition-colors"
          >
            Didn&apos;t get the email? Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-10 text-center flex flex-col items-center">
        <BrandLogo size={48} showText={false} className="mb-4 sm:mb-6" />
        <h1 className="serif text-xl sm:text-display-md text-[var(--text)] mb-2 sm:mb-3 tracking-tight">Reset password</h1>
        <p className="text-[13px] sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-[280px] sm:max-w-[320px]">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input 
          label="Email Address" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="you@school.edu.lb" 
          required
          className="bg-[var(--surface)]/50 backdrop-blur-sm border-[var(--border)]/60 focus:border-[var(--accent)]/50 transition-all duration-300 h-11"
        />

        {error && (
          <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 text-[11px] text-red-600 leading-relaxed animate-in fade-in slide-in-from-top-1">
            <span className="font-bold uppercase tracking-wider mr-2">Error:</span>
            {error}
          </div>
        )}

        <div className="space-y-6 pt-2">
          <Button 
            type="submit"
            loading={loading} 
            disabled={!email} 
            size="lg" 
            className="w-full h-12 rounded-xl bg-[var(--accent)] shadow-xl shadow-[var(--accent)]/10 hover:shadow-[var(--accent)]/20 transition-all duration-300 ring-1 ring-white/10"
            icon={<ArrowRight size={14} />}
          >
            Send reset link
          </Button>

          <p className="text-center text-xs text-[var(--text-secondary)] leading-relaxed">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-[var(--accent)] font-bold hover:underline decoration-2 underline-offset-4 transition-all">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
