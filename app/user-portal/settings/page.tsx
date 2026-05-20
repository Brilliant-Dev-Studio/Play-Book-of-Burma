"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Me = {
  id: string;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  role: "USER" | "ADMIN";
  mustChangePassword: boolean;
};

export default function SettingsPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [profilePending, setProfilePending] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pwdPending, setPwdPending] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      const u: Me = data.user;
      setMe(u);
      setDisplayName(u.displayName ?? "");
      setPhotoUrl(u.photoUrl ?? "");
    })();
  }, [router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfilePending(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim() || null,
          photoUrl: photoUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileMsg({ kind: "err", text: data.error ?? "Failed to save profile." });
        return;
      }
      setProfileMsg({ kind: "ok", text: "Profile updated." });
      router.refresh();
    } finally {
      setProfilePending(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);
    if (newPassword.length < 8) {
      setPwdMsg({ kind: "err", text: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirm) {
      setPwdMsg({ kind: "err", text: "Passwords do not match." });
      return;
    }
    setPwdPending(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwdMsg({ kind: "err", text: data.error ?? "Failed to change password." });
        return;
      }
      setPwdMsg({ kind: "ok", text: "Password updated." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } finally {
      setPwdPending(false);
    }
  }

  if (!me) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12 text-white/60">Loading…</div>
    );
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-white outline-none focus:border-coral";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-10 px-6 py-12 text-white">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-white/60">{me.email}</p>
      </header>

      <form
        onSubmit={saveProfile}
        className="space-y-4 rounded-xl border border-white/10 bg-white/[0.04] p-6"
      >
        <h2 className="text-lg font-bold">Profile</h2>
        <div>
          <label className="block text-sm font-medium text-white/80">Display name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80">Photo URL</label>
          <input
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://…"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-white/50">
            Paste a public image URL. File upload will be available later.
          </p>
        </div>
        {profileMsg && (
          <p
            className={`text-sm ${profileMsg.kind === "ok" ? "text-emerald-400" : "text-red-400"}`}
          >
            {profileMsg.text}
          </p>
        )}
        <button
          type="submit"
          disabled={profilePending}
          className="rounded-md bg-coral px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90 disabled:opacity-60"
        >
          {profilePending ? "Saving…" : "Save profile"}
        </button>
      </form>

      <form
        onSubmit={changePassword}
        className="space-y-4 rounded-xl border border-white/10 bg-white/[0.04] p-6"
      >
        <h2 className="text-lg font-bold">Change password</h2>
        <div>
          <label className="block text-sm font-medium text-white/80">Current password</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80">New password</label>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80">Confirm new password</label>
          <input
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </div>
        {pwdMsg && (
          <p className={`text-sm ${pwdMsg.kind === "ok" ? "text-emerald-400" : "text-red-400"}`}>
            {pwdMsg.text}
          </p>
        )}
        <button
          type="submit"
          disabled={pwdPending}
          className="rounded-md bg-coral px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90 disabled:opacity-60"
        >
          {pwdPending ? "Saving…" : "Change password"}
        </button>
      </form>
    </div>
  );
}
