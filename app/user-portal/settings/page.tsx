"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { refreshCurrentUser } from "@/lib/hooks/useCurrentUser";
import { imageToWebp } from "@/lib/image-to-webp";

type Gender = "MALE" | "FEMALE" | "OTHER";
type Region = "YANGON" | "MANDALAY" | "THAILAND" | "OTHER";

const GENDER_LABEL: Record<Gender, string> = { MALE: "Male", FEMALE: "Female", OTHER: "Other" };
const REGION_LABEL: Record<Region, string> = {
  YANGON: "Yangon",
  MANDALAY: "Mandalay",
  THAILAND: "Thailand",
  OTHER: "Other",
};

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

type Membership = {
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  plan: string | null;
  planLabel: string | null;
  startAt: string | null;
  closeAt: string | null;
  isActive: boolean;
};

type Plan = {
  key: string;
  name: string;
  months: number;
  priceMmk: number;
  perks: string[];
  featured: boolean;
};

type RowKey = "name" | "password" | "age" | "gender" | "region";
type Msg = { kind: "ok" | "err"; text: string } | null;

const inputClass =
  "w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-white outline-none focus:border-coral [color-scheme:dark]";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ageFromBirthYear(year: number | null): string {
  if (!year) return "—";
  return String(new Date().getFullYear() - year);
}

/* ─────────────────────────── shared bits ─────────────────────────── */

function Avatar({ url, size = 40 }: { url: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/5"
      style={{ width: size, height: size }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2 text-white/30" aria-hidden>
          <path
            fillRule="evenodd"
            d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </span>
  );
}

function PhotoUploader({
  currentUrl,
  onChange,
}: {
  currentUrl: string;
  onChange: (url: string, key: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(original: File) {
    if (!original.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (original.size > 10 * 1024 * 1024) {
      setError("File too large (max 10 MB).");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      // Avatars render at most a few hundred px — 800px WebP is plenty.
      const file = await imageToWebp(original, { maxDim: 800 });
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
      const { putUrl, getUrl, key } = (await signRes.json()) as { putUrl: string; getUrl: string; key: string };
      const putRes = await fetch(putUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!putRes.ok) {
        setError("Upload failed. Please try again.");
        return;
      }
      onChange(getUrl, key);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="flex items-center gap-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) void handleFile(file);
      }}
    >
      <Avatar url={currentUrl} size={64} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-60"
          >
            {uploading ? "Uploading…" : "Change photo"}
          </button>
          {currentUrl && !uploading ? (
            <button type="button" onClick={() => onChange("", null)} className="text-sm text-white/50 hover:text-white/80">
              Remove
            </button>
          ) : null}
        </div>
        <p className="mt-1.5 text-xs text-white/40">JPG, PNG, WEBP · max 10 MB</p>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="block">
      <span className="text-xs font-medium text-white/60">{label}</span>
      <span className="relative mt-1 block">
        <input
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pr-11`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
        >
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5" aria-hidden>
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </>
            )}
          </svg>
        </button>
      </span>
    </label>
  );
}

/** One "label / value / Edit" row; when `editing`, the value is replaced by an inline editor. */
function Row({
  label,
  value,
  editing,
  onEdit,
  onCancel,
  onSave,
  saving,
  msg,
  children,
  last = false,
}: {
  label: string;
  value: React.ReactNode;
  editing?: boolean;
  onEdit?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  saving?: boolean;
  msg?: Msg;
  children?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`py-5 ${last ? "" : "border-b border-white/10"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-white">{label}</p>
          {!editing ? <div className="mt-1 text-base text-white/50">{value}</div> : null}
        </div>
        {onEdit && !editing ? (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 text-base font-medium text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
          >
            Edit
          </button>
        ) : null}
      </div>

      {editing ? (
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSave?.();
          }}
        >
          {children}
          {msg?.kind === "err" ? <p className="text-sm text-red-400">{msg.text}</p> : null}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-coral px-4 py-1.5 text-sm font-bold text-black transition-colors hover:bg-coral/90 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={onCancel}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : msg?.kind === "ok" ? (
        <p className="mt-2 text-sm text-emerald-400">{msg.text}</p>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── membership column ─────────────────────────── */

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0 text-coral" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5l3.5 3.5L16 6" />
    </svg>
  );
}

function MembershipSection({ membership, plans }: { membership: Membership | null; plans: Plan[] }) {
  const currentPlan = membership ? plans.find((p) => p.key === membership.plan) ?? null : null;
  const isCurrent = (p: Plan) => !!membership?.isActive && membership.plan === p.key;
  const expired = !!membership && membership.status === "APPROVED" && !membership.isActive;

  return (
    <section>
      <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Membership Plan</h2>

      <div className="mt-5 rounded-2xl bg-zinc-900 px-5 py-5">
        {membership && membership.status === "APPROVED" ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <p className="text-base font-semibold text-white">Subscription Plan</p>
              <p className="shrink-0 text-base font-semibold text-white">
                {currentPlan ? `${currentPlan.months} months` : membership.planLabel ?? "—"}
              </p>
            </div>
            <p className="mt-2 text-sm text-white/85">Start on {formatDate(membership.startAt)}</p>
            <p className="mt-1 text-sm text-white/85">
              {expired ? "Expired on" : "Close on"} {formatDate(membership.closeAt)}
            </p>
          </>
        ) : membership && membership.status === "PENDING" ? (
          <>
            <p className="text-base font-semibold text-white">Subscription Plan</p>
            <p className="mt-2 text-sm text-white/70">Your payment is being reviewed. We&apos;ll email you once it&apos;s approved.</p>
          </>
        ) : (
          <>
            <p className="text-base font-semibold text-white">No active plan</p>
            <p className="mt-2 text-sm text-white/70">Choose a plan below to unlock the full library.</p>
          </>
        )}
      </div>

      {plans.length > 0 ? (
        <>
          <h3 className="mt-8 text-lg font-bold text-white">All Plans</h3>
          <ul className="mt-4 space-y-4">
            {plans.map((p) => {
              const current = isCurrent(p);
              const body = (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold text-white">{p.name}</p>
                      {current ? (
                        <span className="mt-1 inline-block rounded-full bg-coral px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                          Current plan
                        </span>
                      ) : p.featured ? (
                        <span className="mt-1 inline-block rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/70">
                          Most popular
                        </span>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-bold text-white">{p.priceMmk.toLocaleString("en-US")} MMK</p>
                      <p className="text-xs text-white/55">/ {p.months} months</p>
                    </div>
                  </div>
                  {p.perks.length > 0 ? (
                    <ul className="mt-3 space-y-1.5">
                      {p.perks.map((perk) => (
                        <li key={perk} className="flex items-center gap-2.5 text-sm text-white/75">
                          <CheckIcon />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </>
              );
              return (
                <li key={p.key}>
                  {current ? (
                    <div className="rounded-2xl border-2 border-coral bg-zinc-900 px-5 py-5">{body}</div>
                  ) : (
                    <Link
                      href="/membership"
                      className="block rounded-2xl border-2 border-white/15 bg-zinc-900 px-5 py-5 transition-colors hover:border-white/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
                    >
                      {body}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </section>
  );
}

/* ─────────────────────────── page ─────────────────────────── */

export default function SettingsPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  const [editing, setEditing] = useState<RowKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ row: RowKey; msg: Msg } | null>(null);

  // Draft values for the row being edited.
  const [nameDraft, setNameDraft] = useState("");
  const [photoDraft, setPhotoDraft] = useState<{ url: string; key: string | null; changed: boolean }>({
    url: "",
    key: null,
    changed: false,
  });
  const [birthYearDraft, setBirthYearDraft] = useState("");
  const [genderDraft, setGenderDraft] = useState<"" | Gender>("");
  const [regionDraft, setRegionDraft] = useState<"" | Region>("");
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setMe(data.user as Me);
    })();
    // Membership + plan catalog are non-critical — the profile still works if either fails.
    fetch("/api/membership", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setMembership(d.membership ?? null))
      .catch(() => {});
    fetch("/api/public/plans")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setPlans(d.plans ?? []))
      .catch(() => {});
  }, [router]);

  function startEdit(row: RowKey) {
    if (!me) return;
    setMsg(null);
    setEditing(row);
    setNameDraft(me.displayName ?? "");
    setPhotoDraft({ url: me.photoUrl ?? "", key: null, changed: false });
    setBirthYearDraft(me.birthYear ? String(me.birthYear) : "");
    setGenderDraft(me.gender ?? "");
    setRegionDraft(me.region ?? "");
    setPwd({ current: "", next: "", confirm: "" });
  }

  function cancelEdit() {
    setEditing(null);
    setMsg(null);
  }

  async function patchProfile(row: RowKey, body: Record<string, unknown>, apply: (m: Me) => Me) {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ row, msg: { kind: "err", text: data.error ?? "Failed to save." } });
        return;
      }
      setMe((m) => (m ? apply(m) : m));
      setEditing(null);
      setMsg({ row, msg: { kind: "ok", text: "Saved." } });
      refreshCurrentUser();
      router.refresh();
    } catch {
      setMsg({ row, msg: { kind: "err", text: "Failed to save. Please try again." } });
    } finally {
      setSaving(false);
    }
  }

  function saveName() {
    const displayName = nameDraft.trim() || null;
    void patchProfile(
      "name",
      { displayName, ...(photoDraft.changed ? { photoKey: photoDraft.key } : {}) },
      (m) => ({ ...m, displayName, ...(photoDraft.changed ? { photoUrl: photoDraft.url || null } : {}) }),
    );
  }

  function saveAge() {
    const yr = birthYearDraft.trim();
    const birthYear = yr ? Number(yr) : null;
    const thisYear = new Date().getFullYear();
    if (birthYear !== null && (!Number.isInteger(birthYear) || birthYear < 1900 || birthYear > thisYear)) {
      setMsg({ row: "age", msg: { kind: "err", text: `Enter a birth year between 1900 and ${thisYear}.` } });
      return;
    }
    void patchProfile("age", { birthYear }, (m) => ({ ...m, birthYear }));
  }

  async function savePassword() {
    if (pwd.next.length < 8) {
      setMsg({ row: "password", msg: { kind: "err", text: "New password must be at least 8 characters." } });
      return;
    }
    if (pwd.next !== pwd.confirm) {
      setMsg({ row: "password", msg: { kind: "err", text: "Passwords do not match." } });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ row: "password", msg: { kind: "err", text: data.error ?? "Failed to change password." } });
        return;
      }
      setEditing(null);
      setPwd({ current: "", next: "", confirm: "" });
      setMsg({ row: "password", msg: { kind: "ok", text: "Password updated." } });
    } catch {
      setMsg({ row: "password", msg: { kind: "err", text: "Failed to change password. Please try again." } });
    } finally {
      setSaving(false);
    }
  }

  if (!me) {
    return (
      <div className="min-h-full flex-1 bg-black">
        <div className="mx-auto w-full max-w-6xl px-6 py-12 text-white/60">Loading…</div>
      </div>
    );
  }

  const rowMsg = (row: RowKey) => (msg?.row === row ? msg.msg : null);
  const rowProps = (row: RowKey) => ({
    editing: editing === row,
    onEdit: () => startEdit(row),
    onCancel: cancelEdit,
    saving,
    msg: rowMsg(row),
  });
  const thisYear = new Date().getFullYear();

  return (
    <div className="min-h-full flex-1 bg-black">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-4 py-10 text-white sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-14">
        {/* ── Personal Information ── */}
        <section>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-3xl">Personal Information</h2>
          <div className="mt-5 rounded-2xl bg-zinc-900 px-5 sm:px-6">
            <Row
              label="Name"
              value={
                <span className="flex items-center gap-3">
                  <Avatar url={me.photoUrl ?? ""} />
                  <span className="truncate">{me.displayName || "—"}</span>
                </span>
              }
              onSave={saveName}
              {...rowProps("name")}
            >
              <PhotoUploader
                currentUrl={photoDraft.url}
                onChange={(url, key) => setPhotoDraft({ url, key, changed: true })}
              />
              <label className="block">
                <span className="text-xs font-medium text-white/60">Display name</span>
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  autoComplete="name"
                  className={`${inputClass} mt-1`}
                  autoFocus
                />
              </label>
            </Row>

            <Row
              label="Email"
              value={<span className="break-all underline underline-offset-4">{me.email}</span>}
            />

            <Row
              label="Password"
              value={<span className="tracking-[0.3em]">••••••••</span>}
              onSave={() => void savePassword()}
              {...rowProps("password")}
            >
              <PasswordField
                label="Current password"
                autoComplete="current-password"
                value={pwd.current}
                onChange={(v) => setPwd((p) => ({ ...p, current: v }))}
              />
              <PasswordField
                label="New password (min 8 characters)"
                autoComplete="new-password"
                value={pwd.next}
                onChange={(v) => setPwd((p) => ({ ...p, next: v }))}
              />
              <PasswordField
                label="Confirm new password"
                autoComplete="new-password"
                value={pwd.confirm}
                onChange={(v) => setPwd((p) => ({ ...p, confirm: v }))}
              />
            </Row>

            <Row label="Age" value={ageFromBirthYear(me.birthYear)} onSave={saveAge} {...rowProps("age")}>
              <label className="block">
                <span className="text-xs font-medium text-white/60">Birth year — your age is calculated from it</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1900}
                  max={thisYear}
                  placeholder="e.g. 1995"
                  value={birthYearDraft}
                  onChange={(e) => setBirthYearDraft(e.target.value)}
                  className={`${inputClass} mt-1 sm:max-w-48`}
                  autoFocus
                />
              </label>
            </Row>

            <Row
              label="Gender"
              value={me.gender ? GENDER_LABEL[me.gender] : "—"}
              onSave={() =>
                void patchProfile("gender", { gender: genderDraft || null }, (m) => ({ ...m, gender: genderDraft || null }))
              }
              {...rowProps("gender")}
            >
              <select
                value={genderDraft}
                onChange={(e) => setGenderDraft(e.target.value as "" | Gender)}
                aria-label="Gender"
                className={`${inputClass} sm:max-w-64`}
              >
                <option value="">Prefer not to say</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </Row>

            <Row
              label="Region"
              value={me.region ? REGION_LABEL[me.region] : "—"}
              onSave={() =>
                void patchProfile("region", { region: regionDraft || null }, (m) => ({ ...m, region: regionDraft || null }))
              }
              last
              {...rowProps("region")}
            >
              <select
                value={regionDraft}
                onChange={(e) => setRegionDraft(e.target.value as "" | Region)}
                aria-label="Region"
                className={`${inputClass} sm:max-w-64`}
              >
                <option value="">—</option>
                <option value="YANGON">Yangon</option>
                <option value="MANDALAY">Mandalay</option>
                <option value="THAILAND">Thailand</option>
                <option value="OTHER">Other</option>
              </select>
            </Row>
          </div>
        </section>

        {/* ── Membership Plan ── */}
        <MembershipSection membership={membership} plans={plans} />
      </div>
    </div>
  );
}
