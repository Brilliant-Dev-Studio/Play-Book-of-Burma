import { prisma } from "@/lib/prisma";
import type { FilterGroup } from "@/app/components/user-portal-sidebar";

export async function getUserPortalFilterGroups(): Promise<FilterGroup[]> {
  const [industries, skillsets] = await Promise.all([
    prisma.industry.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { name: true },
    }),
    prisma.skillset.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { name: true },
    }),
  ]);

  return [
    { heading: "Playbook", options: ["CEO Playbook"] },
    { heading: "Industry", options: industries.map((i) => i.name) },
    { heading: "Skillsets", options: skillsets.map((s) => s.name) },
  ];
}
