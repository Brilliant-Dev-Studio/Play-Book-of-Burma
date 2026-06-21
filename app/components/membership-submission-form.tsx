"use client";

import { useState } from "react";
import {
  membershipFormFieldClass,
  membershipFormFieldLabelClass,
  membershipFormFileClass,
  membershipFormTextareaClass,
} from "@/app/components/membership-form-field-styles";

const COUNTRY_CODES = [
  { code: "+95",  flag: "🇲🇲", label: "MM" },
  { code: "+66",  flag: "🇹🇭", label: "TH" },
  { code: "+65",  flag: "🇸🇬", label: "SG" },
  { code: "+60",  flag: "🇲🇾", label: "MY" },
  { code: "+62",  flag: "🇮🇩", label: "ID" },
  { code: "+63",  flag: "🇵🇭", label: "PH" },
  { code: "+84",  flag: "🇻🇳", label: "VN" },
  { code: "+86",  flag: "🇨🇳", label: "CN" },
  { code: "+1",   flag: "🇺🇸", label: "US" },
] as const;

async function compressImage(f: File): Promise<File> {
  if (!f.type.startsWith("image/")) return f;
  const bitmap = await createImageBitmap(f).catch(() => null);
  if (!bitmap) return f;
  const MAX_DIM = 1800;
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return f;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.82));
  if (!blob) return f;
  const base = f.name.replace(/\.[^.]+$/, "") || "screenshot";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}

async function uploadScreenshot(original: File): Promise<string> {
  const f = await compressImage(original);
  const presign = await fetch("/api/membership/sign-screenshot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: f.name, contentType: f.type, size: f.size }),
  });
  if (!presign.ok) throw new Error((await presign.json()).error ?? "Could not start upload.");
  const { url, key, headers } = (await presign.json()) as {
    url: string; key: string; headers: Record<string, string>;
  };
  const put = await fetch(url, { method: "PUT", headers, body: f });
  if (!put.ok) throw new Error("Upload failed. Please try again.");
  return key;
}

export function MembershipSubmissionForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dialCode, setDialCode] = useState("+95");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Name is required.");
    if (!email.trim()) return setError("Email is required.");
    if (!phone.trim()) return setError("Phone number is required.");
    if (!file) return setError("Please attach a payment screenshot.");

    setSubmitting(true);
    try {
      const screenshotKey = await uploadScreenshot(file);
      const res = await fetch("/api/membership/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name.trim(),
          email: email.trim(),
          phone: `${dialCode}${phone.trim()}`,
          plan: "SIX_MONTHS",
          paymentMethod: "KBZ_PAY",
          screenshotKey,
          note: note.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Could not submit.");
      setDone(true);
      setName("");
      setEmail("");
      setPhone("");
      setNote("");
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-sm text-emerald-200">
        <p className="font-bold">Submitted!</p>
        <p className="mt-1 text-emerald-100/80">
          We&apos;ll verify your payment and email your login details within 30 minutes.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition-colors hover:bg-white/6"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      {/* Name */}
      <div>
        <label className={membershipFormFieldLabelClass} htmlFor="pay-name">Name</label>
        <input
          id="pay-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          autoComplete="name"
          className={membershipFormFieldClass}
          disabled={submitting}
          required
        />
      </div>

      {/* Email */}
      <div>
        <label className={membershipFormFieldLabelClass} htmlFor="pay-email">Email</label>
        <input
          id="pay-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className={membershipFormFieldClass}
          disabled={submitting}
          required
        />
        <p className="mt-1.5 text-xs leading-relaxed text-white/45">
          This email will be your login — we&apos;ll send your password here.
        </p>
      </div>

      {/* Phone with country code */}
      <div>
        <label className={membershipFormFieldLabelClass} htmlFor="pay-phone">Ph Number</label>
        <div className="flex gap-2">
          <select
            value={dialCode}
            onChange={(e) => setDialCode(e.target.value)}
            disabled={submitting}
            aria-label="Country code"
            className="shrink-0 rounded-xl border border-white/[0.12] bg-zinc-950/55 px-3 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition-[border-color,background-color] hover:border-white/[0.2] hover:bg-zinc-950/70 focus:border-coral/50 focus:bg-zinc-950/80 focus:shadow-[0_0_0_3px_rgba(236,113,71,0.2)] disabled:opacity-60"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code} className="bg-zinc-900">
                {c.flag} {c.label} {c.code}
              </option>
            ))}
          </select>
          <input
            id="pay-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09xxxxxxxx"
            autoComplete="tel-national"
            className={`${membershipFormFieldClass} flex-1`}
            disabled={submitting}
            required
          />
        </div>
      </div>

      {/* Screenshot */}
      <div>
        <label className={membershipFormFieldLabelClass} htmlFor="pay-screenshot">Upload Payment Screenshot</label>
        <input
          id="pay-screenshot"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className={membershipFormFileClass}
          disabled={submitting}
          required
        />
      </div>

      {/* Note */}
      <div>
        <label className={membershipFormFieldLabelClass} htmlFor="pay-note">Note</label>
        <textarea
          id="pay-note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anything we should know?"
          className={membershipFormTextareaClass}
          disabled={submitting}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="flex justify-end border-t border-white/[0.08] pt-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-coral px-7 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-[0_8px_28px_rgba(236,113,71,0.35)] transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(236,113,71,0.42)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral motion-reduce:hover:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "SUBMITTING…" : "SUBMIT"}
        </button>
      </div>
    </form>
  );
}
