"use client";

import { useMemo, useState } from "react";
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
};

const MOCK: Submission[] = [
  {
    id: "#SUB-2026-014",
    fullName: "Leon Aung",
    email: "leon@gmail.com",
    phone: "09763600983",
    plan: "6 Months",
    amount: "100,000",
    paymentMethod: "KBZ Pay",
    screenshotUrl: "https://i.pinimg.com/736x/00/00/00/placeholder.jpg",
    note: "Paid yesterday",
    submittedAt: "May 18, 2026, 9:14 a.m",
    status: "PENDING",
  },
  {
    id: "#SUB-2026-013",
    fullName: "Hnin Wai",
    email: "hnin@gmail.com",
    phone: "09784512300",
    plan: "12 Months",
    amount: "180,000",
    paymentMethod: "Wave Money",
    screenshotUrl: "https://i.pinimg.com/736x/00/00/00/placeholder.jpg",
    submittedAt: "May 18, 2026, 8:02 a.m",
    status: "PENDING",
  },
  {
    id: "#SUB-2026-012",
    fullName: "Kyaw Soe",
    email: "kyaw.soe@gmail.com",
    phone: "09422109887",
    plan: "6 Months",
    amount: "100,000",
    paymentMethod: "KBZ Pay",
    screenshotUrl: "https://i.pinimg.com/736x/00/00/00/placeholder.jpg",
    submittedAt: "May 17, 2026, 4:48 p.m",
    status: "APPROVED",
  },
  {
    id: "#SUB-2026-011",
    fullName: "Mya Thida",
    email: "myathida@gmail.com",
    phone: "09663211045",
    plan: "6 Months",
    amount: "100,000",
    paymentMethod: "Wave Money",
    screenshotUrl: "https://i.pinimg.com/736x/00/00/00/placeholder.jpg",
    note: "Screenshot unclear, asked to resend",
    submittedAt: "May 17, 2026, 2:15 p.m",
    status: "REJECTED",
  },
];

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

export function SubmissionsTable() {
  const [tab, setTab] = useState<SubmissionStatus | "ALL">("PENDING");
  const [selected, setSelected] = useState<Submission | null>(null);

  const counts = useMemo(() => {
    return {
      PENDING: MOCK.filter((s) => s.status === "PENDING").length,
      APPROVED: MOCK.filter((s) => s.status === "APPROVED").length,
      REJECTED: MOCK.filter((s) => s.status === "REJECTED").length,
      ALL: MOCK.length,
    };
  }, []);

  const rows = useMemo(() => {
    if (tab === "ALL") return MOCK;
    return MOCK.filter((s) => s.status === tab);
  }, [tab]);

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
                {counts[t.value]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black">
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
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-white/50">
                  No submissions in this view.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/10 text-white/90">
                <td className="px-4 py-4 whitespace-nowrap font-mono text-xs">{r.id}</td>
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
        />
      )}
    </>
  );
}
