"use client";

import { useEffect, useState } from "react";
import type { Submission } from "@/app/admin/components/submissions-table";

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
}: {
  submission: Submission;
  onClose: () => void;
}) {
  const readOnly = submission.status !== "PENDING";

  // Prefilled, editable for admin
  const [email, setEmail] = useState(submission.email);
  const [displayName, setDisplayName] = useState(submission.fullName);
  const [plan, setPlan] = useState(submission.plan);
  const [amount, setAmount] = useState(submission.amount);
  const [adminNote, setAdminNote] = useState("");
  const [tempPassword] = useState("Tmp-9F2k-8wQz"); // mock — server will generate on real flow

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
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
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto px-6 py-6 lg:grid-cols-[260px_1fr]">
          {/* Left: payment context */}
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

          {/* Right: editable form */}
          <div className="space-y-4">
            <p className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-xs text-coral">
              These fields are auto-filled from the submission. You can edit them before approving.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Display name</label>
                <input
                  className={inputClass}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className={labelClass}>Email (login)</label>
                <input
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className={labelClass}>Plan</label>
                <select
                  className={inputClass}
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as Submission["plan"])}
                  disabled={readOnly}
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
                  disabled={readOnly}
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
                disabled={readOnly}
              />
            </div>

            {!readOnly && (
              <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={labelClass}>Temporary password (will be generated on approve)</p>
                    <code className="mt-1 inline-block rounded bg-black px-2 py-1 font-mono text-sm text-white">
                      {tempPassword}
                    </code>
                  </div>
                  <span className="rounded-full bg-butter/20 px-2 py-1 text-[10px] font-bold text-butter">
                    Preview
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-white/55">
                  On approve, an account is created with this password and the user must change it
                  on first login. Real password is generated server-side.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-black/40 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.08]"
          >
            Close
          </button>
          {!readOnly && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20"
              >
                Reject
              </button>
              <button
                type="button"
                className="rounded-md bg-coral px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90"
              >
                Approve & create account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
