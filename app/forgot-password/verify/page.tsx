"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthPageShell, authPrimaryButtonClass } from "@/app/components/auth-page-shell";
import { OtpInput } from "@/app/components/otp-input";
import { FullScreenLoader } from "@/app/components/full-screen-loader";

const RESEND_SECONDS = 60;

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local.slice(0, 2)}${"*".repeat(Math.max(local.length - 3, 1))}${local.slice(-1)}@${domain}`;
}

function ForgotVerifyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const uid = params.get("uid") ?? "";
  const email = params.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  async function handleResend() {
    if (countdown > 0 || !email) return;
    setResending(true);
    setError(null);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setOtp("");
      setCountdown(RESEND_SECONDS);
      startTimer();
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  }

  async function handleVerify() {
    if (otp.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, code: otp }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Verification failed. Please try again.");
        return;
      }
      router.push(`/forgot-password/reset?uid=${uid}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!uid || !email) {
    return (
      <AuthPageShell heading="Reset password">
        <p className="text-center text-sm text-zinc-400">
          Invalid link. Please start over from{" "}
          <a href="/forgot-password" className="text-coral underline">
            Forgot password
          </a>
          .
        </p>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell heading="Check your email">
      <div className="flex flex-col items-center gap-6">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900/80 shadow-[0_0_32px_rgba(236,113,71,0.1)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-8 w-8 text-coral"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>

        <div className="space-y-1.5 text-center">
          <p className="text-sm text-zinc-300">We sent a reset code to</p>
          <p className="font-semibold text-white">{maskEmail(email)}</p>
          <p className="text-xs text-zinc-500">The code expires in 10 minutes.</p>
        </div>

        <div className="w-full">
          <OtpInput value={otp} onChange={setOtp} hasError={!!error} />
        </div>

        {error && (
          <p className="w-full rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleVerify}
          disabled={loading || otp.length < 6}
          className={`w-full ${authPrimaryButtonClass} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {loading ? "Verifying…" : "Verify code"}
        </button>

        <p className="text-sm text-zinc-500">
          Didn&apos;t receive the code?{" "}
          {countdown > 0 ? (
            <span className="font-medium text-zinc-400">Resend in {countdown}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-semibold text-zinc-200 underline decoration-white/20 underline-offset-2 hover:text-coral hover:decoration-coral/45 disabled:opacity-50"
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          )}
        </p>
      </div>
    </AuthPageShell>
  );
}

export default function ForgotPasswordVerifyPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <ForgotVerifyContent />
    </Suspense>
  );
}
