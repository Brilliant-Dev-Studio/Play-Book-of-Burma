"use client";

import { useMemo, useState, useTransition } from "react";
import { deleteUser, setUserLock } from "@/app/admin/users/actions";

type DisplayStatus = "ACTIVE" | "PENDING" | "EXPIRED" | "NONE";

export type UserRow = {
  id: string;
  email: string;
  displayName: string | null;
  isActive: boolean;
  membership: {
    status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
    plan: "SIX_MONTHS" | "TWELVE_MONTHS" | null;
    expiresAt: string | null;
  } | null;
  createdAt: string;
};

type AnnotatedRow = UserRow & { _status: DisplayStatus };

const TABS: { label: string; value: DisplayStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Pending", value: "PENDING" },
  { label: "Expired", value: "EXPIRED" },
  { label: "No membership", value: "NONE" },
];

function deriveStatus(row: UserRow, now: number): DisplayStatus {
  if (!row.membership) return "NONE";
  const { status, expiresAt } = row.membership;
  if (status === "APPROVED") {
    if (expiresAt && new Date(expiresAt).getTime() <= now) return "EXPIRED";
    return "ACTIVE";
  }
  if (status === "EXPIRED") return "EXPIRED";
  if (status === "PENDING") return "PENDING";
  return "NONE";
}

function planLabel(plan: "SIX_MONTHS" | "TWELVE_MONTHS" | null): string {
  if (plan === "SIX_MONTHS") return "6 months";
  if (plan === "TWELVE_MONTHS") return "12 months";
  return "—";
}

function StatusPill({ status, isActive }: { status: DisplayStatus; isActive: boolean }) {
  if (!isActive) {
    return (
      <span className="rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-bold text-red-400">
        Locked
      </span>
    );
  }
  const styles: Record<DisplayStatus, string> = {
    ACTIVE: "bg-emerald-500/20 text-emerald-300",
    PENDING: "bg-butter/20 text-butter",
    EXPIRED: "bg-zinc-500/20 text-zinc-300",
    NONE: "bg-white/10 text-white/70",
  };
  const label: Record<DisplayStatus, string> = {
    ACTIVE: "Active",
    PENDING: "Pending",
    EXPIRED: "Expired",
    NONE: "No membership",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}>
      {label[status]}
    </span>
  );
}

function IconLock({ locked }: { locked: boolean }) {
  return locked ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function ConfirmModal({
  open,
  onClose,
  title,
  body,
  confirmLabel,
  confirmClass,
  onConfirm,
  error,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
  error: string | null;
  pending: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-md rounded-2xl border border-white/15 bg-zinc-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-lg font-bold text-white">{title}</h2>
        <div className="mb-5 text-sm text-white/75">{body}</div>
        {error && (
          <p className="mb-4 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-400">{error}</p>
        )}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            className="rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.06] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50 ${confirmClass}`}
          >
            {pending ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UsersTable({ users }: { users: UserRow[] }) {
  const [tab, setTab] = useState<DisplayStatus | "ALL">("ALL");
  const now = Date.now();

  const [deleteTarget, setDeleteTarget] = useState<AnnotatedRow | null>(null);
  const [lockTarget, setLockTarget] = useState<AnnotatedRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [lockError, setLockError] = useState<string | null>(null);
  const [deletePending, startDeleteTransition] = useTransition();
  const [lockPending, startLockTransition] = useTransition();

  const annotated = useMemo(
    () => users.map((u) => ({ ...u, _status: deriveStatus(u, now) })),
    [users, now],
  );

  const counts = useMemo(() => {
    const base = { ALL: annotated.length, ACTIVE: 0, PENDING: 0, EXPIRED: 0, NONE: 0 };
    for (const u of annotated) base[u._status] += 1;
    return base;
  }, [annotated]);

  const rows = useMemo(() => {
    if (tab === "ALL") return annotated;
    return annotated.filter((u) => u._status === tab);
  }, [tab, annotated]);

  function handleDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteError(null);
    startDeleteTransition(async () => {
      const res = await deleteUser(id);
      if (res.ok) {
        setDeleteTarget(null);
      } else {
        setDeleteError(res.error ?? "An error occurred.");
      }
    });
  }

  function handleLockToggle() {
    if (!lockTarget) return;
    const id = lockTarget.id;
    const newActive = !lockTarget.isActive;
    setLockError(null);
    startLockTransition(async () => {
      const res = await setUserLock(id, newActive);
      if (res.ok) {
        setLockTarget(null);
      } else {
        setLockError(res.error ?? "An error occurred.");
      }
    });
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const on = t.value === tab;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                on
                  ? "border-coral bg-coral text-black"
                  : "border-white/15 text-white/80 hover:bg-white/6"
              }`}
            >
              {t.label}
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  on ? "bg-black/15 text-black" : "bg-white/10 text-white/75"
                }`}
              >
                {counts[t.value]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black">
        <table className="w-full min-w-240 text-sm">
          <thead>
            <tr className="bg-coral text-black">
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Email</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Name</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Plan</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Expiry</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Created</th>
              <th className="px-4 py-3 text-right font-bold whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-white/50">
                  No users in this view.
                </td>
              </tr>
            )}
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-white/10 text-white/90">
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 text-white/80">{u.displayName ?? "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap">{planLabel(u.membership?.plan ?? null)}</td>
                <td className="px-4 py-3">
                  <StatusPill status={u._status} isActive={u.isActive} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-white/75">
                  {u.membership?.expiresAt
                    ? new Date(u.membership.expiresAt).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-white/65">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      title={u.isActive ? "Lock account" : "Unlock account"}
                      onClick={() => { setLockError(null); setLockTarget(u); }}
                      className={`rounded-md p-1.5 transition-colors ${
                        u.isActive
                          ? "text-white/40 hover:bg-white/6 hover:text-white/80"
                          : "text-coral hover:bg-coral/10"
                      }`}
                    >
                      <IconLock locked={!u.isActive} />
                    </button>
                    <button
                      type="button"
                      title="Delete user"
                      onClick={() => { setDeleteError(null); setDeleteTarget(u); }}
                      className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <IconTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete modal */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => !deletePending && setDeleteTarget(null)}
        title="Delete User"
        body={
          <>
            This will permanently delete{" "}
            <span className="font-semibold text-white">{deleteTarget?.email}</span> and all their
            data. This cannot be undone.
          </>
        }
        confirmLabel="Delete"
        confirmClass="bg-red-600 text-white hover:bg-red-500"
        onConfirm={handleDelete}
        error={deleteError}
        pending={deletePending}
      />

      {/* Lock / Unlock modal */}
      <ConfirmModal
        open={!!lockTarget}
        onClose={() => !lockPending && setLockTarget(null)}
        title={lockTarget?.isActive ? "Lock Account" : "Unlock Account"}
        body={
          lockTarget?.isActive ? (
            <>
              <span className="font-semibold text-white">{lockTarget?.email}</span> will no longer
              be able to log in.
            </>
          ) : (
            <>
              <span className="font-semibold text-white">{lockTarget?.email}</span> will be able to
              log in again.
            </>
          )
        }
        confirmLabel={lockTarget?.isActive ? "Lock" : "Unlock"}
        confirmClass={
          lockTarget?.isActive
            ? "bg-coral text-black hover:bg-coral/90"
            : "bg-emerald-600 text-white hover:bg-emerald-500"
        }
        onConfirm={handleLockToggle}
        error={lockError}
        pending={lockPending}
      />
    </>
  );
}
