"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthPasswordField } from "@/app/components/auth-password-field";
import {
  AuthFieldLabel,
  AuthPageShell,
  authInputClass,
  authInputErrorClass,
  authPrimaryButtonClass,
} from "@/app/components/auth-page-shell";
import { FullScreenLoader } from "@/app/components/full-screen-loader";
import { loginWithEmail } from "@/lib/auth";

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
  }
  return e;
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
      const result = await loginWithEmail(fields.email.trim(), fields.password);
      setRedirecting(true);
      if (result.mustChangePassword) {
        router.push("/change-password");
      } else if (result.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/user-portal");
      }
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {redirecting && <FullScreenLoader />}
      <AuthPageShell heading="Log In">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
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

        <div className="mt-5 flex flex-col items-center gap-2 text-center text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-zinc-300 underline decoration-white/25 underline-offset-4 hover:text-coral hover:decoration-coral/50"
          >
            Forgot your password?
          </Link>
        </div>
      </AuthPageShell>
    </>
  );
}
