"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

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

export function PodcastsTable({ podcasts }: { podcasts: PodcastRow[] }) {
  const seasons = useMemo(() => {
    const set = new Set<number>();
    for (const p of podcasts) set.add(p.season);
    return Array.from(set).sort((a, b) => a - b);
  }, [podcasts]);
  const [tab, setTab] = useState<"ALL" | "POPULAR" | number>("ALL");

  const rows = useMemo(() => {
    if (tab === "ALL") return podcasts;
    if (tab === "POPULAR") return podcasts.filter((p) => p.popular);
    return podcasts.filter((p) => p.season === tab);
  }, [tab, podcasts]);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {(
          [
            { label: "All", value: "ALL" as const, count: podcasts.length },
            {
              label: "Popular",
              value: "POPULAR" as const,
              count: podcasts.filter((p) => p.popular).length,
            },
            ...seasons.map((s) => ({
              label: `Season ${s}`,
              value: s,
              count: podcasts.filter((p) => p.season === s).length,
            })),
          ] as { label: string; value: "ALL" | "POPULAR" | number; count: number }[]
        ).map((t) => {
          const on = t.value === tab;
          return (
            <button
              key={String(t.value)}
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
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black">
        <table className="w-full min-w-[900px] text-sm">
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
                <td className="px-4 py-3 font-semibold text-white">{r.title}</td>
                <td className="px-4 py-3 whitespace-nowrap">Season {r.season}</td>
                <td className="px-4 py-3 whitespace-nowrap">#{r.episodeOrder}</td>
                <td className="px-4 py-3 whitespace-nowrap text-white/75">
                  {r.durationLabel || "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {r.popular ? (
                    <span className="rounded-full bg-coral/20 px-2.5 py-1 text-xs font-bold text-coral">
                      Yes
                    </span>
                  ) : (
                    <span className="text-white/40">—</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-white/65">
                  {new Date(r.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link
                    href={`/admin/podcasts/${r.id}`}
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
