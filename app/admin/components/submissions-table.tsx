"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ApproveSubmissionModal } from "@/app/admin/components/approve-submission-modal";

export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Submission = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  plan: "6 Months" | "12 Months";
  amount: string;
  paymentMethod: "KBZ Pay" | "Wave Money";
  screenshotUrl: string;
  note?: string;
  submittedAt: string;
  status: SubmissionStatus;
  resultingUserId?: string;
  mustChangePassword?: boolean;
  tempPassword?: string;
};

type ApiRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  plan: "SIX_MONTHS" | "TWELVE_MONTHS";
  paymentMethod: "KBZ_PAY" | "WAVE_MONEY";
  amountMmk: number;
  screenshotUrl: string;
  note: string | null;
  status: SubmissionStatus;
  createdAt: string;
  resultingUser: {
    userId: string;
    tempPassword: string | null;
    mustChangePassword: boolean;
  } | null;
};

type ApiCounts = { pending: number; approved: number; rejected: number; all: number };

const TABS: { label: string; value: SubmissionStatus | "ALL" }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "All", value: "ALL" },
];

function StatusPill({ status }: { status: SubmissionStatus }) {
  const styles: Record<SubmissionStatus, string> = {
    PENDING: "bg-butter/20 text-butter",
    APPROVED: "bg-emerald-500/20 text-emerald-300",
    REJECTED: "bg-red-500/20 text-red-300",
  };
  const label: Record<SubmissionStatus, string> = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}>
      {label[status]}
    </span>
  );
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function shortId(id: string): string {
  return `#SUB-${id.slice(-6).toUpperCase()}`;
}

function toUi(row: ApiRow): Submission {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    plan: row.plan === "SIX_MONTHS" ? "6 Months" : "12 Months",
    amount: row.amountMmk.toLocaleString("en-US"),
    paymentMethod: row.paymentMethod === "KBZ_PAY" ? "KBZ Pay" : "Wave Money",
    screenshotUrl: row.screenshotUrl,
    note: row.note ?? undefined,
    submittedAt: formatDateTime(row.createdAt),
    status: row.status,
    resultingUserId: row.resultingUser?.userId,
    mustChangePassword: row.resultingUser?.mustChangePassword,
    tempPassword: row.resultingUser?.tempPassword ?? undefined,
  };
}

export function SubmissionsTable() {
  const [tab, setTab] = useState<SubmissionStatus | "ALL">("PENDING");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [counts, setCounts] = useState<ApiCounts>({ pending: 0, approved: 0, rejected: 0, all: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/submissions?status=${tab}`, { cache: "no-store" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Could not load.");
      const json = (await res.json()) as { submissions: ApiRow[]; counts: ApiCounts };
      setRows(json.submissions);
      setCounts(json.counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load.");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const uiRows = useMemo(() => rows.map(toUi), [rows]);
  const tabCount: Record<SubmissionStatus | "ALL", number> = {
    PENDING: counts.pending,
    APPROVED: counts.approved,
    REJECTED: counts.rejected,
    ALL: counts.all,
  };

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
                  : "border-white/15 text-white/80 hover:bg-white/[0.06]"
              }`}
            >
              {t.label}
              <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${on ? "bg-black/15 text-black" : "bg-white/10 text-white/75"}`}>
                {tabCount[t.value]}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className={`overflow-x-auto rounded-2xl border border-white/15 bg-black ${loading ? "opacity-60" : ""}`}>
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="bg-coral text-black">
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">ID</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Full Name</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Email</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Phone</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Plan</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Amount</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Method</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Submitted</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-right font-bold whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && uiRows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-white/50">
                  No submissions in this view.
                </td>
              </tr>
            )}
            {uiRows.map((r) => (
              <tr key={r.id} className="border-t border-white/10 text-white/90">
                <td className="px-4 py-4 whitespace-nowrap font-mono text-xs">{shortId(r.id)}</td>
                <td className="px-4 py-4 whitespace-nowrap">{r.fullName}</td>
                <td className="px-4 py-4">{r.email}</td>
                <td className="px-4 py-4 whitespace-nowrap">{r.phone}</td>
                <td className="px-4 py-4 whitespace-nowrap">{r.plan}</td>
                <td className="px-4 py-4 whitespace-nowrap">{r.amount}</td>
                <td className="px-4 py-4 whitespace-nowrap">{r.paymentMethod}</td>
                <td className="px-4 py-4 whitespace-nowrap text-white/70">{r.submittedAt}</td>
                <td className="px-4 py-4">
                  <StatusPill status={r.status} />
                </td>
                <td className="px-4 py-4 text-right whitespace-nowrap">
                  {r.status === "PENDING" ? (
                    <button
                      type="button"
                      onClick={() => setSelected(r)}
                      className="rounded-md bg-coral px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-coral/90"
                    >
                      Review
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelected(r)}
                      className="rounded-md border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/[0.08]"
                    >
                      View
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <ApproveSubmissionModal
          submission={selected}
          onClose={() => setSelected(null)}
          onReviewed={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </>
  );
}
