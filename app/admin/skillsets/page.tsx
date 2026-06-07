import { prisma } from "@/lib/prisma";
import { TaxonomyManager } from "@/app/admin/components/taxonomy-manager";
import { saveSkillset, deleteSkillset } from "./actions";

export default async function AdminSkillsetsPage() {
  const rows = await prisma.skillset.findMany({
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
      title="Skillsets"
      subtitle="Course skill categories that videos can be filed under."
      items={items}
      save={saveSkillset}
      remove={deleteSkillset}
    />
  );
}
