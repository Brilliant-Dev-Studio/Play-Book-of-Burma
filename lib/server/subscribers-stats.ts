import "server-only";
import { prisma } from "@/lib/prisma";

export type WatchHrStats = {
  subscribers: number;
  /** Playbook bucket = audio podcasts. No audio playback tracking yet, so 0 for now. */
  audioHours: number;
  /** SOB bucket = video courses, from WatchProgress (which only tracks video lessons). */
  videoHours: number;
};

export async function getWatchHrStats(): Promise<WatchHrStats> {
  const [subscribers, agg] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.watchProgress.aggregate({ _sum: { currentSeconds: true } }),
  ]);

  const videoSeconds = agg._sum.currentSeconds ?? 0;

  return {
    subscribers,
    audioHours: 0,
    videoHours: videoSeconds / 3600,
  };
}

function roundHr(hours: number): number {
  return Math.round(hours * 10) / 10;
}

export type WatchHrRow = {
  id: string;
  name: string; // industry name
  type: "Playbook" | "SOB";
  watchHours: number;
  pctOfTotal: number;
};

/**
 * Watch hours per industry, split by bucket.
 *  - SOB (video): real WatchProgress seconds, grouped by the lesson's video industry.
 *  - Playbook (audio): podcasts grouped by industry, but 0 hours until audio playback is tracked.
 * Sorted by watch hours desc; % of total is share of the grand total across both buckets.
 */
export async function getWatchHrByIndustry(): Promise<WatchHrRow[]> {
  const [progress, podcasts] = await Promise.all([
    prisma.watchProgress.findMany({
      select: {
        currentSeconds: true,
        lesson: {
          select: {
            video: {
              select: { industry: { select: { id: true, name: true } } },
            },
          },
        },
      },
    }),
    prisma.podcast.findMany({
      select: { industry: { select: { id: true, name: true } } },
    }),
  ]);

  // SOB (video): sum seconds per industry.
  const videoSeconds = new Map<string, { name: string; seconds: number }>();
  for (const p of progress) {
    const ind = p.lesson.video.industry;
    const entry = videoSeconds.get(ind.id) ?? { name: ind.name, seconds: 0 };
    entry.seconds += p.currentSeconds;
    videoSeconds.set(ind.id, entry);
  }

  // Playbook (audio): industries that have podcasts (0 hours for now).
  const audioIndustries = new Map<string, string>();
  for (const pod of podcasts) {
    audioIndustries.set(pod.industry.id, pod.industry.name);
  }

  const rows: Omit<WatchHrRow, "id" | "pctOfTotal">[] = [];
  for (const { name, seconds } of videoSeconds.values()) {
    rows.push({ name, type: "SOB", watchHours: roundHr(seconds / 3600) });
  }
  for (const name of audioIndustries.values()) {
    rows.push({ name, type: "Playbook", watchHours: 0 });
  }

  rows.sort((a, b) => b.watchHours - a.watchHours);

  const grandTotal = rows.reduce((sum, r) => sum + r.watchHours, 0);
  const counters = { Playbook: 0, SOB: 0 };

  return rows.map((r) => {
    counters[r.type] += 1;
    const prefix = r.type === "Playbook" ? "POB" : "SOB";
    return {
      ...r,
      id: `#${prefix}-${String(counters[r.type]).padStart(3, "0")}`,
      pctOfTotal: grandTotal > 0 ? Math.round((r.watchHours / grandTotal) * 100) : 0,
    };
  });
}

export type WatchHrMonthPoint = {
  month: string;
  total: number;
  playbook: number;
  sob: number;
};

/** Last 7 calendar months of watch hours, bucketed by lastWatchedAt. */
export async function getWatchHrMonthlySeries(): Promise<WatchHrMonthPoint[]> {
  const progress = await prisma.watchProgress.findMany({
    select: { currentSeconds: true, lastWatchedAt: true },
  });

  const now = new Date();
  const buckets: { key: string; label: string; seconds: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString("en-US", { month: "short" }),
      seconds: 0,
    });
  }
  const indexByKey = new Map(buckets.map((b, i) => [b.key, i]));

  for (const p of progress) {
    const d = p.lastWatchedAt;
    const i = indexByKey.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i !== undefined) buckets[i].seconds += p.currentSeconds;
  }

  return buckets.map((b) => {
    const sob = roundHr(b.seconds / 3600);
    const playbook = 0; // audio not tracked yet
    return { month: b.label, sob, playbook, total: roundHr(sob + playbook) };
  });
}

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
