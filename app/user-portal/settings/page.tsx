"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { refreshCurrentUser } from "@/lib/hooks/useCurrentUser";

type Gender = "MALE" | "FEMALE" | "OTHER";
type Region = "YANGON" | "MANDALAY" | "THAILAND" | "OTHER";

function PhotoUploader({
  currentUrl,
  onChange,
}: {
  currentUrl: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large (max 10 MB).");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const signRes = await fetch("/api/user/uploads/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
      });
      if (!signRes.ok) {
        const d = await signRes.json();
        setError(d.error ?? "Failed to prepare upload.");
        return;
      }
      const { putUrl, getUrl } = (await signRes.json()) as { putUrl: string; getUrl: string };
      const putRes = await fetch(putUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) {
        setError("Upload failed. Please try again.");
        return;
      }
      onChange(getUrl);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      {/* Avatar preview */}
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-white/5">
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUrl}
            alt="Profile photo"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-10 w-10 text-white/30"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      {/* Drop zone + controls */}
      <div
        className="flex-1"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-60"
          >
            {uploading ? "Uploading…" : "Upload photo"}
          </button>
          {currentUrl && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-sm text-white/50 hover:text-white/80"
            >
              Remove
            </button>
          )}
        </div>
        <p className="mt-1.5 text-xs text-white/40">
          JPG, PNG, WEBP · max 10 MB. Or drag and drop here.
        </p>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onInputChange}
        />
      </div>
    </div>
  );
}

type Me = {
  id: string;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  role: "USER" | "ADMIN";
  mustChangePassword: boolean;
  gender: Gender | null;
  birthYear: number | null;
  region: Region | null;
};

function PasswordField({
  label,
  value,
  onChange,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-white/80">{label}</label>
      <div className="relative mt-1">
        <input
          type={visible ? "text" : "password"}
          required
          minLength={minLength}
          value={value}
          onChange={onChange}
          className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 pr-11 text-white outline-none focus:border-coral"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral/60"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5"
            aria-hidden
          >
            {visible ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19 12 19c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 5c4.638 0 8.573 2.51 9.963 6.683a1.01 1.01 0 010 .758m-6.122 6.122a3 3 0 01-4.244-4.244M12 12h.01M17.364 17.364L4.636 4.636"
              />
            ) : (
              <>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 5 12 5c4.638 0 8.573 2.51 9.963 6.683a1.01 1.01 0 010 .636C20.577 16.49 16.64 19 12 19c-4.638 0-8.573-2.51-9.964-6.683z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </>
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [gender, setGender] = useState<"" | Gender>("");
  const [birthYear, setBirthYear] = useState<string>("");
  const [region, setRegion] = useState<"" | Region>("");
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
      setGender(u.gender ?? "");
      setBirthYear(u.birthYear ? String(u.birthYear) : "");
      setRegion(u.region ?? "");
    })();
  }, [router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfilePending(true);
    setProfileMsg(null);
    try {
      const yr = birthYear.trim();
      const yrNum = yr ? Number(yr) : null;
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim() || null,
          photoUrl: photoUrl.trim() || null,
          gender: gender || null,
          birthYear: yrNum,
          region: region || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileMsg({ kind: "err", text: data.error ?? "Failed to save profile." });
        return;
      }
      setProfileMsg({ kind: "ok", text: "Profile updated." });
      refreshCurrentUser();
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
          <label className="block text-sm font-medium text-white/80">Profile photo</label>
          <div className="mt-2">
            <PhotoUploader currentUrl={photoUrl} onChange={setPhotoUrl} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-white/80">
              Gender <span className="text-white/40">(optional)</span>
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as "" | Gender)}
              className={inputClass}
            >
              <option value="">Prefer not to say</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80">
              Birth year <span className="text-white/40">(optional)</span>
            </label>
            <input
              type="number"
              min={1900}
              max={new Date().getFullYear()}
              placeholder="e.g. 1995"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80">
              Region <span className="text-white/40">(optional)</span>
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as "" | Region)}
              className={inputClass}
            >
              <option value="">—</option>
              <option value="YANGON">Yangon</option>
              <option value="MANDALAY">Mandalay</option>
              <option value="THAILAND">Thailand</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
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
        <PasswordField
          label="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <PasswordField
          label="New password"
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <PasswordField
          label="Confirm new password"
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
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
