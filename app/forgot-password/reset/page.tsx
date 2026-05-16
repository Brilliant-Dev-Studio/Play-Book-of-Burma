"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthPasswordField } from "@/app/components/auth-password-field";
import {
  AuthPageShell,
  authPrimaryButtonClass,
} from "@/app/components/auth-page-shell";
import { FullScreenLoader } from "@/app/components/full-screen-loader";

const PASSWORD_RE_LETTER = /[a-zA-Z]/;
const PASSWORD_RE_NUMBER = /[0-9]/;

type Fields = { password: string; confirmPassword: string };
type Errors = Partial<Record<keyof Fields, string>>;

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.password) {
    e.password = "Password is required.";
  } else if (f.password.length < 8) {
    e.password = "Password must be at least 8 characters.";
  } else if (!PASSWORD_RE_LETTER.test(f.password) || !PASSWORD_RE_NUMBER.test(f.password)) {
    e.password = "Password must contain at least one letter and one number.";
  }
  if (!f.confirmPassword) {
    e.confirmPassword = "Please confirm your password.";
  } else if (f.confirmPassword !== f.password) {
    e.confirmPassword = "Passwords do not match.";
  }
  return e;
}

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const uid = params.get("uid") ?? "";

  const [fields, setFields] = useState<Fields>({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function setField<K extends keyof Fields>(key: K, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
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
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, password: fields.password }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!uid) {
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

  if (success) {
    return (
      <AuthPageShell heading="Password updated">
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-coral/10 ring-1 ring-coral/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-8 w-8 text-coral"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-center text-sm text-zinc-300">
            Your password has been reset. Redirecting to login…
          </p>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell heading="New password">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <AuthPasswordField
          id="reset-password"
          name="password"
          autoComplete="new-password"
          placeholder="Min 8 chars + number"
          value={fields.password}
          onChange={(e) => setField("password", e.target.value)}
          onBlur={() => handleBlur("password")}
          error={errors.password}
          label={
            <>
              New password<span className="text-coral">*</span>
            </>
          }
        />

        <AuthPasswordField
          id="reset-password-confirm"
          name="password_confirm"
          autoComplete="new-password"
          placeholder="Re-enter new password"
          value={fields.confirmPassword}
          onChange={(e) => setField("confirmPassword", e.target.value)}
          onBlur={() => handleBlur("confirmPassword")}
          error={errors.confirmPassword}
          label={
            <>
              Confirm password<span className="text-coral">*</span>
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
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </AuthPageShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
