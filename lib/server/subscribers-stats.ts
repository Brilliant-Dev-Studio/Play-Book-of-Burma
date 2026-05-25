import "server-only";
import { prisma } from "@/lib/prisma";

export type DemographicsStats = {
  totalSubscribers: number;
  malePct: number;
  femalePct: number;
  ageBuckets: { label: string; pct: number }[];
  regionBuckets: { label: string; pct: number }[];
};

const AGE_LABELS = ["18-24", "25-34", "35-44", "> 45"] as const;
const REGION_LABELS: { key: "YANGON" | "MANDALAY" | "THAILAND" | "OTHER"; label: string }[] = [
  { key: "YANGON", label: "Yangon" },
  { key: "MANDALAY", label: "Mandalay" },
  { key: "THAILAND", label: "Thailand" },
  { key: "OTHER", label: "Others" },
];

function ageBucket(year: number, now: Date): (typeof AGE_LABELS)[number] | null {
  const age = now.getFullYear() - year;
  if (age < 18) return null;
  if (age <= 24) return "18-24";
  if (age <= 34) return "25-34";
  if (age <= 44) return "35-44";
  return "> 45";
}

function pct(n: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((n / total) * 100);
}

export async function getSubscriberDemographics(): Promise<DemographicsStats> {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: { gender: true, birthYear: true, region: true },
  });

  const total = users.length;
  const now = new Date();

  let male = 0;
  let female = 0;
  const ageCounts: Record<(typeof AGE_LABELS)[number], number> = {
    "18-24": 0,
    "25-34": 0,
    "35-44": 0,
    "> 45": 0,
  };
  const regionCounts: Record<"YANGON" | "MANDALAY" | "THAILAND" | "OTHER", number> = {
    YANGON: 0,
    MANDALAY: 0,
    THAILAND: 0,
    OTHER: 0,
  };

  for (const u of users) {
    if (u.gender === "MALE") male += 1;
    else if (u.gender === "FEMALE") female += 1;

    if (u.birthYear) {
      const b = ageBucket(u.birthYear, now);
      if (b) ageCounts[b] += 1;
    }

    if (u.region) regionCounts[u.region] += 1;
  }

  const ageTotal = Object.values(ageCounts).reduce((a, b) => a + b, 0);
  const regionTotal = Object.values(regionCounts).reduce((a, b) => a + b, 0);

  return {
    totalSubscribers: total,
    malePct: pct(male, total),
    femalePct: pct(female, total),
    ageBuckets: AGE_LABELS.map((label) => ({ label, pct: pct(ageCounts[label], ageTotal) })),
    regionBuckets: REGION_LABELS.map(({ key, label }) => ({
      label,
      pct: pct(regionCounts[key], regionTotal),
    })),
  };
}
