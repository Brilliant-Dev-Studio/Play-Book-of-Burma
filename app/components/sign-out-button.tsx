"use client";

import { useTransition } from "react";

export function SignOutButton({ className }: { className?: string }) {
  const [pending, startTransition] = useTransition();

  function handle() {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    });
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={pending}
      className={
        className ??
        "rounded-md border border-white/15 bg-white/[0.06] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12] disabled:opacity-50"
      }
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
