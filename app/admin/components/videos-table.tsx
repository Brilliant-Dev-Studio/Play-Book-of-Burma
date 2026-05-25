"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Status = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type VideoRow = {
  id: string;
  type: "VIDEO" | "PODCAST";
  industry: string;
  skillset: string;
  titleLine1: string;
  titleLine2: string | null;
  thumbnailUrl: string;
  durationLabel: string;
  status: Status;
  updatedAt: string;
};

const TABS: { label: string; value: Status | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Draft", value: "DRAFT" },
  { label: "Archived", value: "ARCHIVED" },
];

function StatusPill({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    DRAFT: "bg-white/10 text-white/80",
    PUBLISHED: "bg-emerald-500/20 text-emerald-300",
    ARCHIVED: "bg-zinc-500/20 text-zinc-300",
  };
  const label: Record<Status, string> = {
    DRAFT: "Draft",
    PUBLISHED: "Published",
    ARCHIVED: "Archived",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}>
      {label[status]}
    </span>
  );
}

export function VideosTable({ videos }: { videos: VideoRow[] }) {
  const [tab, setTab] = useState<Status | "ALL">("ALL");

  const counts = useMemo(
    () => ({
      ALL: videos.length,
      PUBLISHED: videos.filter((v) => v.status === "PUBLISHED").length,
      DRAFT: videos.filter((v) => v.status === "DRAFT").length,
      ARCHIVED: videos.filter((v) => v.status === "ARCHIVED").length,
    }),
    [videos],
  );

  const rows = useMemo(() => {
    if (tab === "ALL") return videos;
    return videos.filter((v) => v.status === tab);
  }, [tab, videos]);

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
        <table className="w-full min-w-[1000px] text-sm">
          <thead>
            <tr className="bg-coral text-black">
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Thumb</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Title</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Type</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Industry</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Duration</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Updated</th>
              <th className="px-4 py-3 text-right font-bold whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-white/50">
                  No videos yet. Click <span className="font-semibold text-coral">+ Upload Video</span> to add one.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/10 text-white/90">
                <td className="px-4 py-3">
                  <div className="h-12 w-9 overflow-hidden rounded bg-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                      }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{r.titleLine1}</p>
                  {r.titleLine2 && <p className="text-xs text-white/60">{r.titleLine2}</p>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{r.type}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.industry}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.durationLabel}</td>
                <td className="px-4 py-3">
                  <StatusPill status={r.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-white/65">
                  {new Date(r.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link
                    href={`/admin/videos/${r.id}`}
                    className="rounded-md border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/[0.08]"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
