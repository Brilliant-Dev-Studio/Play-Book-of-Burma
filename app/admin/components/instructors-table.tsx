"use client";

import Link from "next/link";

export type InstructorRow = {
  id: string;
  name: string;
  title: string;
  photoUrl: string;
  updatedAt: string;
};

export function InstructorsTable({ instructors }: { instructors: InstructorRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black">
      <table className="w-full min-w-[800px] text-sm">
        <thead>
          <tr className="bg-coral text-black">
            <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Photo</th>
            <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Name</th>
            <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Title</th>
            <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Updated</th>
            <th className="px-4 py-3 text-right font-bold whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {instructors.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-white/50">
                No instructors yet. Click <span className="font-semibold text-coral">+ New Instructor</span> to add one.
              </td>
            </tr>
          )}
          {instructors.map((r) => (
            <tr key={r.id} className="border-t border-white/10 text-white/90">
              <td className="px-4 py-3">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.photoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                    }}
                  />
                </div>
              </td>
              <td className="px-4 py-3 font-semibold text-white">{r.name}</td>
              <td className="px-4 py-3 text-white/80">{r.title}</td>
              <td className="px-4 py-3 whitespace-nowrap text-white/65">
                {new Date(r.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <Link
                  href={`/admin/instructors/${r.id}`}
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
  );
}
