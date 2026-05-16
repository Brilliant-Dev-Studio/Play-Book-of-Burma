"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthPasswordField } from "@/app/components/auth-password-field";
import {
  AuthFieldLabel,
  AuthOrDivider,
  AuthPageShell,
  authInputClass,
  authInputErrorClass,
  authPrimaryButtonClass,
} from "@/app/components/auth-page-shell";
import { GoogleSignInButton } from "@/app/components/google-sign-in-button";
import { signUpWithEmail } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

type Fields = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};
type Errors = Partial<Record<keyof Fields, string>>;

function validate(f: Fields): Errors {
  const e: Errors = {};

  if (!f.username.trim()) {
    e.username = "Username is required.";
  } else if (f.username.trim().length < 3) {
    e.username = "Username must be at least 3 characters.";
  } else if (f.username.trim().length > 30) {
    e.username = "Username must be 30 characters or fewer.";
  } else if (!USERNAME_RE.test(f.username.trim())) {
    e.username = "Only letters, numbers, and underscores allowed.";
  }

  if (!f.email.trim()) {
    e.email = "Email is required.";
  } else if (!EMAIL_RE.test(f.email.trim())) {
    e.email = "Enter a valid email address.";
  }

  if (!f.password) {
    e.password = "Password is required.";
  } else if (f.password.length < 8) {
    e.password = "Password must be at least 8 characters.";
  } else if (!/[a-zA-Z]/.test(f.password) || !/[0-9]/.test(f.password)) {
    e.password = "Password must contain at least one letter and one number.";
  }

  if (!f.confirmPassword) {
    e.confirmPassword = "Please confirm your password.";
  } else if (f.confirmPassword !== f.password) {
    e.confirmPassword = "Passwords do not match.";
  }

  return e;
}

function firebaseError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 8 characters.";
    case "auth/operation-not-allowed":
      return "Email/password sign-up is not enabled. Please contact support.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function SignupPage() {
  const router = useRouter();
  const [fields, setFields] = useState<Fields>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function setField<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    // Re-validate confirmPassword live when password changes
    if (key === "password" && errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  }

  function handleBlur(key: keyof Fields) {
    const fieldErrors = validate(fields);
    if (fieldErrors[key]) setErrors((prev) => ({ ...prev, [key]: fieldErrors[key] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const fieldErrors = validate(fields);
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const credential = await signUpWithEmail(
        fields.email.trim(),
        fields.password,
        fields.username.trim(),
      );
      // Generate and store OTP in DB (mock — logged to server console)
      const verifyRes = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: credential.user.uid,
          email: fields.email.trim(),
          displayName: fields.username.trim(),
        }),
      });
      if (!verifyRes.ok) {
        const body = await verifyRes.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to send verification code.");
      }
      router.push(
        `/verify-email?uid=${credential.user.uid}&email=${encodeURIComponent(fields.email.trim())}`,
      );
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";

      if (code === "auth/email-already-in-use") {
        // Check if the existing account is unverified — if so, resend OTP and redirect
        try {
          const checkRes = await fetch(
            `/api/auth/check-email?email=${encodeURIComponent(fields.email.trim())}`,
          );
          const checkData = await checkRes.json();
          if (checkData.exists && !checkData.verified && checkData.uid) {
            await fetch("/api/auth/send-verification", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                uid: checkData.uid,
                email: fields.email.trim(),
              }),
            });
            router.push(
              `/verify-email?uid=${checkData.uid}&email=${encodeURIComponent(fields.email.trim())}`,
            );
            return;
          }
        } catch {
          // fall through to generic error
        }
        setSubmitError(firebaseError(code));
      } else if (code) {
        console.error("Signup error:", code, err);
        setSubmitError(firebaseError(code));
      } else {
        console.error("Signup error:", err);
        setSubmitError((err as Error).message ?? "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell heading="Sign up">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        {/* Username */}
        <div>
          <AuthFieldLabel htmlFor="signup-username">
            Username<span className="text-coral">*</span>
          </AuthFieldLabel>
          <input
            id="signup-username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="e.g. john_doe"
            value={fields.username}
            onChange={(e) => setField("username", e.target.value)}
            onBlur={() => handleBlur("username")}
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? "signup-username-error" : undefined}
            className={errors.username ? authInputErrorClass : authInputClass}
          />
          {errors.username && (
            <p id="signup-username-error" className="mt-1.5 text-xs text-red-400">
              {errors.username}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <AuthFieldLabel htmlFor="signup-email">
            Email<span className="text-coral">*</span>
          </AuthFieldLabel>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={fields.email}
            onChange={(e) => setField("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "signup-email-error" : undefined}
            className={errors.email ? authInputErrorClass : authInputClass}
          />
          {errors.email && (
            <p id="signup-email-error" className="mt-1.5 text-xs text-red-400">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password + Confirm */}
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-x-3">
          <AuthPasswordField
            id="signup-password"
            name="password"
            autoComplete="new-password"
            placeholder="Min 8 chars + number"
            value={fields.password}
            onChange={(e) => setField("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            error={errors.password}
            label={
              <>
                Password<span className="text-coral">*</span>
              </>
            }
          />
          <AuthPasswordField
            id="signup-password-confirm"
            name="password_confirm"
            autoComplete="new-password"
            placeholder="Re-enter password"
            value={fields.confirmPassword}
            onChange={(e) => setField("confirmPassword", e.target.value)}
            onBlur={() => handleBlur("confirmPassword")}
            error={errors.confirmPassword}
            label={
              <>
                Confirm<span className="text-coral">*</span>
              </>
            }
          />
        </div>

        {/* Firebase / server error */}
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
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <AuthOrDivider />
      <GoogleSignInButton label="Sign up with Google" />

      <div className="mt-5 flex flex-col items-center gap-2 text-center text-sm">
        <Link
          href="#"
          className="font-medium text-zinc-300 underline decoration-white/25 underline-offset-4 hover:text-coral hover:decoration-coral/50"
        >
          Terms &amp; Condition
        </Link>
      </div>

      <p className="mt-5 text-center text-sm text-zinc-500">
        Already have an account?{" "}
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
