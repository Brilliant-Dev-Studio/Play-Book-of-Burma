import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";
import {
  InstructorForm,
  type InstructorFormInitial,
} from "@/app/admin/components/instructor-form";

export default async function EditInstructorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const instructor = await prisma.instructor.findUnique({ where: { id } });
  if (!instructor) notFound();

  const initial: InstructorFormInitial = {
    id: instructor.id,
    name: instructor.name,
    title: instructor.title,
    photoKey: instructor.photoKey,
    photoUrl: await presignGetUrl(instructor.photoKey, PRESIGN_TTL.image),
    biographyParagraphs: instructor.biographyParagraphs,
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
          Edit Instructor
        </h1>
        <p className="mt-1 text-sm text-white/55">Update profile and biography.</p>
      </div>
      <InstructorForm mode="edit" initial={initial} />
    </div>
  );
}
