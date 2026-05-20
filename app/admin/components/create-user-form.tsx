"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Created = {
  email: string;
  tempPassword: string;
};

export function CreateUserForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setCreated(null);
    setCopied(false);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayName: displayName || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create user.");
        return;
      }
      setCreated({ email: data.email, tempPassword: data.tempPassword });
      setEmail("");
      setDisplayName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  }

  async function copyPassword() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-white/10 bg-white/[0.04] p-6"
    >
      <h2 className="text-lg font-bold">Create user</h2>
      <div>
        <label className="block text-sm font-medium text-white/80">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-white outline-none focus:border-coral"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/80">Display name (optional)</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-white outline-none focus:border-coral"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {created && (
        <div className="space-y-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
          <p className="font-semibold text-emerald-300">User created — share these credentials:</p>
          <div>
            <p className="text-xs text-white/60">Email</p>
            <p className="font-mono text-white">{created.email}</p>
          </div>
          <div>
            <p className="text-xs text-white/60">Temporary password</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-black/40 px-2 py-1 font-mono text-white">
                {created.tempPassword}
              </code>
              <button
                type="button"
                onClick={copyPassword}
                className="rounded-md border border-white/15 bg-white/[0.06] px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/[0.12]"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <p className="text-xs text-white/60">
            User must change this on first login. This is the only time the password is shown.
          </p>
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-coral px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90 disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create user"}
      </button>
    </form>
  );
}
