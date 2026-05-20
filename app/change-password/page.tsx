"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthPageShell,
  authPrimaryButtonClass,
} from "@/app/components/auth-page-shell";
import { AuthPasswordField } from "@/app/components/auth-password-field";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [forced, setForced] = useState<boolean | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (!cancelled) setForced(Boolean(data.user?.mustChangePassword));
      } catch {
        router.push("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: forced ? undefined : currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to change password.");
        return;
      }
      router.push("/user-portal");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  }

  if (forced === null) {
    return (
      <AuthPageShell heading="Change password">
        <p className="text-center text-sm text-white/60">Loading…</p>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell heading={forced ? "Set a new password" : "Change password"}>
      {forced && (
        <p className="mb-4 rounded-lg border border-butter/30 bg-butter/10 px-3 py-2 text-xs text-butter">
          You signed in with a temporary password. Please set a new one to continue.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {!forced && (
          <AuthPasswordField
            id="current"
            name="currentPassword"
            autoComplete="current-password"
            placeholder="Your current password"
            label="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        )}
        <AuthPasswordField
          id="new"
          name="newPassword"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          label="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <AuthPasswordField
          id="confirm"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter new password"
          label="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={pending} className={authPrimaryButtonClass}>
          {pending ? "Saving…" : "Save password"}
        </button>
      </form>
    </AuthPageShell>
  );
}
