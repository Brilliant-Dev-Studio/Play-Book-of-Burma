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
import { FullScreenLoader } from "@/app/components/full-screen-loader";
import { signInWithEmail } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Fields = { email: string; password: string };
type Errors = Partial<Record<keyof Fields, string>>;

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.email.trim()) {
    e.email = "Email is required.";
  } else if (!EMAIL_RE.test(f.email.trim())) {
    e.email = "Enter a valid email address.";
  }
  if (!f.password) {
    e.password = "Password is required.";
  } else if (f.password.length < 6) {
    e.password = "Password must be at least 6 characters.";
  }
  return e;
}

function firebaseError(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [fields, setFields] = useState<Fields>({ email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  function setField<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
    // Clear field error on change
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
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
      await signInWithEmail(fields.email.trim(), fields.password);
      setRedirecting(true);
      router.push("/user-portal");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      console.error("Login error code:", code, err);
      setSubmitError(firebaseError(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {redirecting && <FullScreenLoader />}
      <AuthPageShell heading="Log In">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div>
          <AuthFieldLabel htmlFor="login-email">
            Email<span className="text-coral">*</span>
          </AuthFieldLabel>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={fields.email}
            onChange={(e) => setField("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            className={errors.email ? authInputErrorClass : authInputClass}
          />
          {errors.email && (
            <p id="login-email-error" className="mt-1.5 text-xs text-red-400">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <AuthPasswordField
          id="login-password"
          name="password"
          autoComplete="current-password"
          placeholder="Your password"
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
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <AuthOrDivider />
      <GoogleSignInButton label="Log In with Google" />

      <div className="mt-5 flex flex-col items-center gap-2 text-center text-sm">
        <Link
          href="/forgot-password"
          className="font-medium text-zinc-300 underline decoration-white/25 underline-offset-4 hover:text-coral hover:decoration-coral/50"
        >
          Forgot your password?
        </Link>
        <Link
          href="#"
          className="font-medium text-zinc-300 underline decoration-white/25 underline-offset-4 hover:text-coral hover:decoration-coral/50"
        >
          Terms &amp; Condition
        </Link>
      </div>

      <p className="mt-5 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-zinc-200 underline decoration-white/20 underline-offset-2 hover:text-coral hover:decoration-coral/45"
        >
          Sign up
        </Link>
      </p>
    </AuthPageShell>
    </>
  );
}
