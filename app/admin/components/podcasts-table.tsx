"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { deletePodcast } from "@/app/admin/podcasts/actions";

export type PodcastRow = {
  id: string;
  title: string;
  season: number;
  episodeOrder: number;
  durationLabel: string;
  popular: boolean;
  thumbnailUrl: string;
  updatedAt: string;
};

function IconTrash() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  );
}

export function PodcastsTable({ podcasts }: { podcasts: PodcastRow[] }) {
  const seasons = useMemo(() => {
    const set = new Set<number>();
    for (const p of podcasts) set.add(p.season);
    return Array.from(set).sort((a, b) => a - b);
  }, [podcasts]);
  const [tab, setTab] = useState<"ALL" | "POPULAR" | number>("ALL");

  const [deleteTarget, setDeleteTarget] = useState<PodcastRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const rows = useMemo(() => {
    if (tab === "ALL") return podcasts;
    if (tab === "POPULAR") return podcasts.filter((p) => p.popular);
    return podcasts.filter((p) => p.season === tab);
  }, [tab, podcasts]);

  function handleDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteError(null);
    startTransition(async () => {
      const res = await deletePodcast(id);
      if (res.ok) {
        setDeleteTarget(null);
      } else {
        setDeleteError(res.error ?? "An error occurred.");
      }
    });
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {(
          [
            { label: "All", value: "ALL" as const, count: podcasts.length },
            { label: "Popular", value: "POPULAR" as const, count: podcasts.filter((p) => p.popular).length },
            ...seasons.map((s) => ({ label: `Season ${s}`, value: s, count: podcasts.filter((p) => p.season === s).length })),
          ] as { label: string; value: "ALL" | "POPULAR" | number; count: number }[]
        ).map((t) => {
          const on = t.value === tab;
          return (
            <button key={String(t.value)} type="button" onClick={() => setTab(t.value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${on ? "border-coral bg-coral text-black" : "border-white/15 text-white/80 hover:bg-white/6"}`}
            >
              {t.label}
              <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${on ? "bg-black/15 text-black" : "bg-white/10 text-white/75"}`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black">
        <table className="w-full min-w-225 text-sm">
          <thead>
            <tr className="bg-coral text-black">
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Thumb</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Title</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Season</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Episode</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Duration</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Popular</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Updated</th>
              <th className="px-4 py-3 text-right font-bold whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-white/50">
                  No podcasts in this view. Click <span className="font-semibold text-coral">+ Upload Podcast</span> to add one.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/10 text-white/90">
                <td className="px-4 py-3">
                  <div className="h-12 w-9 overflow-hidden rounded bg-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.thumbnailUrl} alt="" className="h-full w-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }} />
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-white">{r.title}</td>
                <td className="px-4 py-3 whitespace-nowrap">Season {r.season}</td>
                <td className="px-4 py-3 whitespace-nowrap">#{r.episodeOrder}</td>
                <td className="px-4 py-3 whitespace-nowrap text-white/75">{r.durationLabel || "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {r.popular ? (
                    <span className="rounded-full bg-coral/20 px-2.5 py-1 text-xs font-bold text-coral">Yes</span>
                  ) : (
                    <span className="text-white/40">—</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-white/65">
                  {new Date(r.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/podcasts/${r.id}`}
                      className="rounded-md border border-white/15 bg-white/4 px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/8">
                      Edit
                    </Link>
                    <button type="button" title="Delete podcast"
                      onClick={() => { setDeleteError(null); setDeleteTarget(r); }}
                      className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400">
                      <IconTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => !pending && setDeleteTarget(null)}>
          <div className="mx-4 w-full max-w-md rounded-2xl border border-white/15 bg-zinc-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-3 text-lg font-bold text-white">Delete Podcast</h2>
            <p className="mb-5 text-sm text-white/75">
              This will permanently delete{" "}
              <span className="font-semibold text-white">"{deleteTarget.title}"</span> and all its data. This cannot be undone.
            </p>
            {deleteError && (
              <p className="mb-4 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-400">{deleteError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button type="button" disabled={pending} onClick={() => setDeleteTarget(null)}
                className="rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/6 disabled:opacity-50">
                Cancel
              </button>
              <button type="button" disabled={pending} onClick={handleDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-500 disabled:opacity-50">
                {pending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
