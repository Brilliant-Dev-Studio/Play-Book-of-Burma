"use client";

import { useState } from "react";
import {
  membershipFormFieldClass,
  membershipFormFieldLabelClass,
  membershipFormFileClass,
  membershipFormTextareaClass,
} from "@/app/components/membership-form-field-styles";

type Plan = "SIX_MONTHS" | "TWELVE_MONTHS";
type Method = "KBZ_PAY" | "WAVE_MONEY";

const PLAN_OPTIONS: { value: Plan; label: string; price: string }[] = [
  { value: "SIX_MONTHS", label: "6 Months", price: "180,000 MMK" },
  { value: "TWELVE_MONTHS", label: "12 Months", price: "360,000 MMK" },
];

const METHOD_OPTIONS: { value: Method; label: string }[] = [
  { value: "KBZ_PAY", label: "KBZ Pay" },
  { value: "WAVE_MONEY", label: "Wave Money" },
];

export function MembershipSubmissionForm() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState<Plan>("SIX_MONTHS");
  const [method, setMethod] = useState<Method>("KBZ_PAY");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function compressImage(f: File): Promise<File> {
    if (!f.type.startsWith("image/")) return f;
    const bitmap = await createImageBitmap(f).catch(() => null);
    if (!bitmap) return f;

    const MAX_DIM = 1800;
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return f;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82),
    );
    if (!blob) return f;

    const baseName = f.name.replace(/\.[^.]+$/, "") || "screenshot";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
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
      url: string;
      key: string;
      headers: Record<string, string>;
    };
    const put = await fetch(url, { method: "PUT", headers, body: f });
    if (!put.ok) throw new Error("Upload failed. Please try again.");
    return key;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) return setError("Email is required.");
    if (!phone.trim()) return setError("Phone is required.");
    if (!file) return setError("Please attach a payment screenshot.");

    setSubmitting(true);
    try {
      const screenshotKey = await uploadScreenshot(file);
      const res = await fetch("/api/membership/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // No name field on the form — derive a display name from the email
          // local-part so the backend (which requires fullName) still works.
          fullName: email.trim().split("@")[0] || email.trim(),
          email: email.trim(),
          phone: phone.trim(),
          plan,
          paymentMethod: method,
          screenshotKey,
          note: note.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Could not submit.");
      setDone(true);
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
          className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition-colors hover:bg-white/[0.06]"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
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
        <p className="mt-1.5 text-xs leading-relaxed text-white/55">
          This email will be your login — we&apos;ll send your password here.
        </p>
      </div>
      <div>
        <label className={membershipFormFieldLabelClass} htmlFor="pay-phone">Phone</label>
        <input
          id="pay-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="09xxxxxxxx"
          autoComplete="tel"
          className={membershipFormFieldClass}
          disabled={submitting}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={membershipFormFieldLabelClass} htmlFor="pay-plan">Plan</label>
          <select
            id="pay-plan"
            value={plan}
            onChange={(e) => setPlan(e.target.value as Plan)}
            className={membershipFormFieldClass}
            disabled={submitting}
          >
            {PLAN_OPTIONS.map((p) => (
              <option key={p.value} value={p.value} className="bg-zinc-900">
                {p.label} — {p.price}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={membershipFormFieldLabelClass} htmlFor="pay-method">Payment method</label>
          <select
            id="pay-method"
            value={method}
            onChange={(e) => setMethod(e.target.value as Method)}
            className={membershipFormFieldClass}
            disabled={submitting}
          >
            {METHOD_OPTIONS.map((m) => (
              <option key={m.value} value={m.value} className="bg-zinc-900">
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={membershipFormFieldLabelClass} htmlFor="pay-screenshot">Payment screenshot</label>
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

      <div className="flex justify-end border-t border-white/[0.08] pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-coral px-7 py-3 text-sm font-bold tracking-wide text-white shadow-[0_8px_28px_rgba(236,113,71,0.35)] transition-[transform,box-shadow,opacity] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(236,113,71,0.42)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral motion-reduce:hover:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "SUBMITTING…" : "SUBMIT"}
        </button>
      </div>
    </form>
  );
}
