"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthFieldLabel,
  AuthPageShell,
  authInputClass,
  authInputErrorClass,
  authPrimaryButtonClass,
} from "@/app/components/auth-page-shell";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validateEmail(val: string): string | null {
    if (!val.trim()) return "Email is required.";
    if (!EMAIL_RE.test(val.trim())) return "Enter a valid email address.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push(
        `/forgot-password/verify?uid=${data.uid}&email=${encodeURIComponent(email.trim())}`,
      );
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell heading="Forgot password">
      <div className="mb-5 text-center text-sm text-zinc-400">
        Enter your account email and we&apos;ll send you a reset code.
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <div>
          <AuthFieldLabel htmlFor="forgot-email">
            Email<span className="text-coral">*</span>
          </AuthFieldLabel>
          <input
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
            onBlur={() => setEmailError(validateEmail(email))}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "forgot-email-error" : undefined}
            className={emailError ? authInputErrorClass : authInputClass}
          />
          {emailError && (
            <p id="forgot-email-error" className="mt-1.5 text-xs text-red-400">
              {emailError}
            </p>
          )}
        </div>

        {submitError && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`mt-0.5 ${authPrimaryButtonClass} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {loading ? "Sending…" : "Send reset code"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-zinc-200 underline decoration-white/20 underline-offset-2 hover:text-coral hover:decoration-coral/45"
        >
          Log in
        </Link>
      </p>
    </AuthPageShell>
  );
}
