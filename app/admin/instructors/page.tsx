import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";
import { InstructorsTable } from "@/app/admin/components/instructors-table";

export default async function AdminInstructorsPage() {
  const instructors = await prisma.instructor.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      name: true,
      title: true,
      photoKey: true,
      updatedAt: true,
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
            Instructors
          </h1>
          <p className="mt-1 text-sm text-white/55">
            Hosts and experts featured across videos.
          </p>
        </div>
        <Link
          href="/admin/instructors/new"
          className="rounded-md bg-coral px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90"
        >
          + New Instructor
        </Link>
      </div>

      <InstructorsTable
        instructors={await Promise.all(
          instructors.map(async (i) => ({
            id: i.id,
            name: i.name,
            title: i.title,
            updatedAt: i.updatedAt.toISOString(),
            photoUrl: await presignGetUrl(i.photoKey, PRESIGN_TTL.image),
          })),
        )}
      />
    </div>
  );
}
