import { prisma } from "@/lib/prisma";
import { PodcastUploadForm } from "@/app/admin/components/podcast-upload-form";

export default async function NewPodcastPage() {
  const industries = await prisma.industry.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
          Upload Podcast
        </h1>
        <p className="mt-1 text-sm text-white/55">
          New audio episode for the Client Portal.
        </p>
      </div>
      <PodcastUploadForm mode="create" industries={industries} />
    </div>
  );
}
