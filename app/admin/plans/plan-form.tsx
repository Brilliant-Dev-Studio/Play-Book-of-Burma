"use client";

import { useState, useTransition } from "react";
import { inputClass, labelClass } from "@/app/admin/components/form-field-styles";
import { savePlan, type PlanFormInput } from "./actions";

export function PlanForm({ plan }: { plan: PlanFormInput }) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(plan.name);
  const [months, setMonths] = useState(String(plan.months));
  const [priceMmk, setPriceMmk] = useState(String(plan.priceMmk));
  const [perksText, setPerksText] = useState(plan.perks.join("\n"));
  const [featured, setFeatured] = useState(plan.featured);
  const [isActive, setIsActive] = useState(plan.isActive);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setSaved(false);
    startTransition(async () => {
      const result = await savePlan({
        key: plan.key,
        name,
        months: Number(months),
        priceMmk: Number(priceMmk),
        perks: perksText.split("\n"),
        featured,
        isActive,
      });
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-coral">
          {plan.key === "SIX_MONTHS" ? "6-month tier" : "12-month tier"}
        </h2>
        <label className="flex items-center gap-2 text-xs font-medium text-white/70">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-white/25 bg-black/40 accent-coral"
          />
          Active
        </label>
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          <ul className="list-disc pl-4">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label className={labelClass}>Display name</label>
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Duration (months)</label>
          <input
            type="number"
            min={1}
            className={inputClass}
            value={months}
            onChange={(e) => setMonths(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Price (MMK)</label>
          <input
            type="number"
            min={0}
            step={1000}
            className={inputClass}
            value={priceMmk}
            onChange={(e) => setPriceMmk(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Perks (one per line)</label>
        <textarea
          rows={4}
          className={inputClass}
          value={perksText}
          onChange={(e) => setPerksText(e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-white/80">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="h-4 w-4 rounded border-white/25 bg-black/40 accent-coral"
        />
        Featured (highlighted card on /membership)
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-coral px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-sm font-medium text-emerald-400">Saved</span>}
      </div>
    </form>
  );
}
