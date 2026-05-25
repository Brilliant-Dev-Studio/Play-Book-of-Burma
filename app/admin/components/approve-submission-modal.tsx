"use client";

import { useEffect, useState } from "react";
import type { Submission } from "@/app/admin/components/submissions-table";
import { regenerateTempPassword } from "@/app/admin/users/actions";

function IconX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-coral disabled:opacity-60";
const labelClass = "block text-xs font-semibold uppercase tracking-[0.14em] text-white/55";

export function ApproveSubmissionModal({
  submission,
  onClose,
  onReviewed,
}: {
  submission: Submission;
  onClose: () => void;
  onReviewed?: () => void;
}) {
  const readOnly = submission.status !== "PENDING";

  const [email, setEmail] = useState(submission.email);
  const [displayName, setDisplayName] = useState(submission.fullName);
  const [plan, setPlan] = useState<Submission["plan"]>(submission.plan);
  const [amount, setAmount] = useState(submission.amount);
  const [adminNote, setAdminNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{
    email: string;
    displayName: string | null;
    tempPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [stashCopied, setStashCopied] = useState(false);
  const [regenerated, setRegenerated] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);

  const stashedTempPassword = regenerated ?? submission.tempPassword ?? null;

  async function copyStash() {
    if (!stashedTempPassword) return;
    const text = `Email: ${submission.email}\nTemporary password: ${stashedTempPassword}`;
    try {
      await navigator.clipboard.writeText(text);
      setStashCopied(true);
      setTimeout(() => setStashCopied(false), 1800);
    } catch {}
  }

  async function doRegenerate() {
    if (!submission.resultingUserId) return;
    if (!confirm("Generate a new one-time password? The user's current password will stop working.")) return;
    setRegenError(null);
    setRegenerating(true);
    try {
      const result = await regenerateTempPassword(submission.resultingUserId);
      if (!result.ok) {
        setRegenError(result.error);
        return;
      }
      setRegenerated(result.tempPassword);
    } catch (err) {
      setRegenError(err instanceof Error ? err.message : "Failed to regenerate.");
    } finally {
      setRegenerating(false);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) closeAndRefresh();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  async function doApprove() {
    setError(null);
    const amountMmk = Number(amount.replace(/[^\d]/g, ""));
    if (!Number.isFinite(amountMmk) || amountMmk < 0) {
      setError("Amount must be a positive number.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          displayName,
          plan: plan === "6 Months" ? "SIX_MONTHS" : "TWELVE_MONTHS",
          amountMmk,
          adminNote: adminNote || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Approval failed.");
      const data = (await res.json()) as {
        email: string;
        displayName: string | null;
        tempPassword: string;
      };
      setCreated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed.");
    } finally {
      setBusy(false);
    }
  }

  async function copyCreds() {
    if (!created) return;
    const text = `Email: ${created.email}\nTemporary password: ${created.tempPassword}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  function closeAndRefresh() {
    if (created) onReviewed?.();
    else onClose();
  }

  async function doReject() {
    setError(null);
    if (!confirm("Reject this submission? The user will not be notified automatically.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote: adminNote || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Reject failed.");
      onReviewed?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reject failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={busy ? undefined : closeAndRefresh}
        aria-hidden
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-4">
          <div>
            <p className="font-mono text-xs text-white/55">{submission.id}</p>
            <h2 className="font-[family-name:var(--font-rwst-stack)] text-xl font-bold tracking-tight text-white">
              {readOnly ? "Submission detail" : "Review submission"}
            </h2>
            <p className="text-xs text-white/55">Submitted {submission.submittedAt}</p>
          </div>
          <button
            type="button"
            onClick={closeAndRefresh}
            disabled={busy}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto px-6 py-6 lg:grid-cols-[260px_1fr]">
          <div>
            <p className={labelClass}>Payment screenshot</p>
            <div className="mt-2 aspect-[3/4] w-full overflow-hidden rounded-lg border border-white/10 bg-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={submission.screenshotUrl}
                alt="Payment screenshot"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <p className={labelClass}>Method</p>
                <p className="mt-1 text-sm font-semibold text-white">{submission.paymentMethod}</p>
              </div>
              <div>
                <p className={labelClass}>Phone</p>
                <p className="mt-1 text-sm text-white/90">{submission.phone}</p>
              </div>
              {submission.note && (
                <div>
                  <p className={labelClass}>Note from user</p>
                  <p className="mt-1 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/80">
                    {submission.note}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {created ? (
              <div className="space-y-3 rounded-lg border border-emerald-400/40 bg-emerald-400/10 p-4">
                <div>
                  <p className="text-sm font-bold text-emerald-200">
                    Account created
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-100/80">
                    The user will be prompted to change this password on first login.
                  </p>
                </div>
                <div className="space-y-2 rounded-md border border-white/10 bg-black/40 p-3">
                  <div>
                    <p className={labelClass}>Email (login)</p>
                    <p className="mt-1 break-all font-mono text-sm text-white">{created.email}</p>
                  </div>
                  <div>
                    <p className={labelClass}>Temporary password</p>
                    <p className="mt-1 font-mono text-sm text-white">{created.tempPassword}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyCreds}
                  className="w-full rounded-md border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/85 transition-colors hover:bg-white/[0.08]"
                >
                  {copied ? "Copied!" : "Copy credentials"}
                </button>
              </div>
            ) : readOnly && submission.status === "APPROVED" && stashedTempPassword ? (
              <div className="space-y-3 rounded-lg border border-butter/40 bg-butter/10 p-4">
                <div>
                  <p className="text-sm font-bold text-butter">
                    {regenerated ? "New one-time password issued" : "Temporary password still active"}
                  </p>
                  <p className="mt-0.5 text-xs text-butter/80">
                    {regenerated
                      ? "Share this with the user. Their previous password no longer works."
                      : "This user hasn’t changed their first-login password yet. Share it again if they lost it."}
                  </p>
                </div>
                <div className="space-y-2 rounded-md border border-white/10 bg-black/40 p-3">
                  <div>
                    <p className={labelClass}>Email (login)</p>
                    <p className="mt-1 break-all font-mono text-sm text-white">{submission.email}</p>
                  </div>
                  <div>
                    <p className={labelClass}>Temporary password</p>
                    <p className="mt-1 font-mono text-sm text-white">{stashedTempPassword}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyStash}
                  className="w-full rounded-md border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/85 transition-colors hover:bg-white/[0.08]"
                >
                  {stashCopied ? "Copied!" : "Copy credentials"}
                </button>
              </div>
            ) : readOnly &&
              submission.status === "APPROVED" &&
              submission.mustChangePassword &&
              submission.resultingUserId ? (
              <div className="space-y-3 rounded-lg border border-butter/40 bg-butter/10 p-4">
                <div>
                  <p className="text-sm font-bold text-butter">
                    One-time password not on file
                  </p>
                  <p className="mt-0.5 text-xs text-butter/80">
                    This account was created before passwords were stashed. The user still hasn’t logged in — issue a new one-time password to share with them.
                  </p>
                </div>
                {regenError && (
                  <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                    {regenError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={doRegenerate}
                  disabled={regenerating}
                  className="w-full rounded-md bg-butter px-3 py-2 text-xs font-bold text-black transition-colors hover:bg-butter/90 disabled:opacity-60"
                >
                  {regenerating ? "Generating…" : "Generate new one-time password"}
                </button>
              </div>
            ) : readOnly &&
              submission.status === "APPROVED" &&
              submission.mustChangePassword === false ? (
              <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                User has set their own password.
              </p>
            ) : (
              !readOnly && (
                <p className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-xs text-coral">
                  These fields are auto-filled from the submission. You can edit them before approving.
                </p>
              )
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Display name</label>
                <input
                  className={inputClass}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={readOnly || busy || created !== null}
                />
              </div>
              <div>
                <label className={labelClass}>Email (login)</label>
                <input
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={readOnly || busy || created !== null}
                />
              </div>
              <div>
                <label className={labelClass}>Plan</label>
                <select
                  className={inputClass}
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as Submission["plan"])}
                  disabled={readOnly || busy || created !== null}
                >
                  <option value="6 Months">6 Months</option>
                  <option value="12 Months">12 Months</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Amount (MMK)</label>
                <input
                  className={inputClass}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={readOnly || busy || created !== null}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Admin note (internal)</label>
              <textarea
                rows={2}
                className={inputClass}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Optional context for the approval / rejection."
                disabled={readOnly || busy || created !== null}
              />
            </div>

            {!readOnly && (
              <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-[11px] text-white/60">
                On approve, a user account is created with a generated temporary password
                (printed to the server console — wire SMTP in <code className="rounded bg-black px-1 py-0.5 font-mono text-white/80">lib/server/email.ts</code> for real delivery).
              </div>
            )}

            {error && (
              <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-black/40 px-6 py-4">
          <button
            type="button"
            onClick={closeAndRefresh}
            disabled={busy}
            className="rounded-md border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.08] disabled:opacity-60"
          >
            {created ? "Done" : "Close"}
          </button>
          {!readOnly && !created && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={doReject}
                disabled={busy}
                className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-60"
              >
                {busy ? "Working…" : "Reject"}
              </button>
              <button
                type="button"
                onClick={doApprove}
                disabled={busy}
                className="rounded-md bg-coral px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90 disabled:opacity-60"
              >
                {busy ? "Approving…" : "Approve & create account"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
