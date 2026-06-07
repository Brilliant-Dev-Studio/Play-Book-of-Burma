import { prisma } from "@/lib/prisma";
import { VideoUploadForm } from "@/app/admin/components/video-upload-form";

export default async function NewVideoPage() {
  const [instructors, industries, skillsets] = await Promise.all([
    prisma.instructor.findMany({
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true, title: true },
    }),
    prisma.industry.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.skillset.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
          Upload Video
        </h1>
        <p className="mt-1 text-sm text-white/55">
          New content for the Client Portal.
        </p>
      </div>
      <VideoUploadForm
        mode="create"
        instructors={instructors}
        industries={industries}
        skillsets={skillsets}
      />
    </div>
  );
}
