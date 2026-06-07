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
      _count: { select: { videos: true } },
    },
  });

  const items = rows.map((r) => ({
    id: r.id,
    name: r.name,
    order: r.order,
    videoCount: r._count.videos,
  }));

  return (
    <TaxonomyManager
      title="Industries"
      subtitle="Categories that videos can be filed under (shown in the Video form and the user portal filter)."
      items={items}
      save={saveIndustry}
      remove={deleteIndustry}
    />
  );
}
