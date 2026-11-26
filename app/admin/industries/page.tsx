import { prisma } from "@/lib/prisma";
import { TaxonomyManager } from "@/app/admin/components/taxonomy-manager";
import { saveIndustry, deleteIndustry } from "./actions";

export default async function AdminIndustriesPage() {
  const rows = await prisma.industry.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      order: true,
      _count: { select: { videos: true, podcasts: true } },
    },
  });

  const items = rows.map((r) => ({
    id: r.id,
    name: r.name,
    order: r.order,
    videoCount: r._count.videos,
    podcastCount: r._count.podcasts,
  }));

  return (
    <TaxonomyManager
      title="Industries"
      subtitle="Categories that videos and podcasts are filed under. An industry still used by any video or podcast can't be deleted — move that content to another industry first."
      items={items}
      save={saveIndustry}
      remove={deleteIndustry}
    />
  );
}
