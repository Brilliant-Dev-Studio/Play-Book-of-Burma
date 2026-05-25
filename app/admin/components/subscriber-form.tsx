"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  DeferredImageUpload,
  type DeferredImageUploadHandle,
} from "@/app/admin/components/deferred-image-upload";
import { inputClass, labelClass } from "@/app/admin/components/form-field-styles";
import {
  createSubscriber,
  type SubscriberFormInput,
} from "@/app/admin/users/actions";

const PLAN_DAYS = { SIX_MONTHS: 182, TWELVE_MONTHS: 365 } as const;

function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function SubscriberForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState<SubscriberFormInput["plan"]>("SIX_MONTHS");
  const [amountMmk, setAmountMmk] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"" | "KBZ_PAY" | "WAVE_MONEY">("");
  const screenshotRef = useRef<DeferredImageUploadHandle>(null);
  const [adminNote, setAdminNote] = useState("");

  const defaultExpiry = useMemo(() => {
    const d = new Date(Date.now() + PLAN_DAYS[plan] * 86_400_000);
    return toDateInputValue(d);
  }, [plan]);
  const [expiresAt, setExpiresAt] = useState<string>(defaultExpiry);
  const [expiryTouched, setExpiryTouched] = useState(false);

  const expiryValue = expiryTouched ? expiresAt : defaultExpiry;

  function submit() {
    setErrors([]);
    setTempPassword(null);
    startTransition(async () => {
      let paymentScreenshotKey: string | undefined;
      try {
        const uploaded = await screenshotRef.current?.upload();
        if (uploaded) paymentScreenshotKey = uploaded.key;
      } catch (err) {
        setErrors([err instanceof Error ? err.message : "Screenshot upload failed."]);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const result = await createSubscriber({
        email,
        displayName,
        phone: phone || undefined,
        plan,
        amountMmk: Number(amountMmk) || 0,
        paymentMethod: paymentMethod || undefined,
        paymentScreenshotKey,
        adminNote: adminNote || undefined,
        expiresAt: expiryValue ? new Date(expiryValue).toISOString() : undefined,
      });
      if (!result.ok) {
        setErrors(result.errors);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setTempPassword(result.tempPassword);
    });
  }

  if (tempPassword) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6">
        <h2 className="text-lg font-bold text-emerald-200">Subscriber created</h2>
        <p className="mt-2 text-sm text-emerald-100/90">
          Share this temporary password with the user. They&apos;ll be required to change it on first login.
        </p>
        <div className="mt-4 rounded-lg border border-white/15 bg-black/40 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-white/55">Temporary password</p>
          <p className="mt-1 font-mono text-lg text-white">{tempPassword}</p>
        </div>
        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/admin/users")}
            className="rounded-md bg-coral px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-6"
    >
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <p className="font-semibold">Please fix:</p>
          <ul className="mt-1 list-disc pl-5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-5">
          <div>
            <p className={labelClass}>Payment screenshot (optional)</p>
            <div className="mt-2">
              <DeferredImageUpload
                ref={screenshotRef}
                kind="thumbnail"
                height={240}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className={labelClass}>Display name</label>
              <input
                className={inputClass}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Phone (optional)</label>
              <input
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+95 …"
              />
            </div>
            <div>
              <label className={labelClass}>Plan</label>
              <select
                className={inputClass}
                value={plan}
                onChange={(e) => {
                  setPlan(e.target.value as SubscriberFormInput["plan"]);
                  setExpiryTouched(false);
                }}
              >
                <option value="SIX_MONTHS">6 months</option>
                <option value="TWELVE_MONTHS">12 months</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Amount (MMK)</label>
              <input
                type="number"
                className={inputClass}
                value={amountMmk}
                onChange={(e) => setAmountMmk(Number(e.target.value))}
              />
            </div>
            <div>
              <label className={labelClass}>Payment method (optional)</label>
              <select
                className={inputClass}
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as "" | "KBZ_PAY" | "WAVE_MONEY")
                }
              >
                <option value="">—</option>
                <option value="KBZ_PAY">KBZ Pay</option>
                <option value="WAVE_MONEY">Wave Money</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Expires at</label>
              <input
                type="date"
                className={inputClass}
                value={expiryValue}
                onChange={(e) => {
                  setExpiresAt(e.target.value);
                  setExpiryTouched(true);
                }}
              />
              <p className="mt-1 text-[11px] text-white/45">
                Defaults to today + {PLAN_DAYS[plan]} days based on plan.
              </p>
            </div>
          </div>

          <div>
            <label className={labelClass}>Admin note (optional)</label>
            <textarea
              rows={3}
              className={inputClass}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-8 flex items-center justify-between gap-3 border-t border-white/10 bg-black/80 px-8 py-4 backdrop-blur">
        <Link
          href="/admin/users"
          className="rounded-md border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.08]"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-coral px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90 disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create subscriber"}
        </button>
      </div>
    </form>
  );
}
