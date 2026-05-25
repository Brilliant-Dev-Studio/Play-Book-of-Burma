"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { inputClass, labelClass } from "@/app/admin/components/form-field-styles";
import { createAdmin } from "@/app/admin/admins/actions";

export function AdminForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");

  function submit() {
    setErrors([]);
    setTempPassword(null);
    startTransition(async () => {
      const result = await createAdmin({ email, displayName });
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setTempPassword(result.tempPassword);
    });
  }

  if (tempPassword) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6">
        <h2 className="text-lg font-bold text-emerald-200">Admin created</h2>
        <p className="mt-2 text-sm text-emerald-100/90">
          Share this temporary password with the new admin. They&apos;ll be required to change it on first login.
        </p>
        <div className="mt-4 rounded-lg border border-white/15 bg-black/40 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-white/55">Temporary password</p>
          <p className="mt-1 font-mono text-lg text-white">{tempPassword}</p>
        </div>
        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/admin/admins")}
            className="rounded-md bg-coral px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90"
          >
            Back to Admins
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
      className="max-w-xl space-y-6"
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

      <div className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-6">
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
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
      </div>

      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/admins"
          className="rounded-md border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.08]"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-coral px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90 disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create admin"}
        </button>
      </div>
    </form>
  );
}
