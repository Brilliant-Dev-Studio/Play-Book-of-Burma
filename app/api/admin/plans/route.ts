import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/prisma";

const PLAN_KEYS = ["SIX_MONTHS", "TWELVE_MONTHS"] as const;
type PlanKey = (typeof PLAN_KEYS)[number];

async function gate() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  return null;
}

export async function GET() {
  const denied = await gate();
  if (denied) return denied;

  const plans = await prisma.plan.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ plans });
}

// Plan tiers are a fixed pair (SIX_MONTHS / TWELVE_MONTHS) — POST upserts by
// `key` rather than minting new tiers, since Membership/MembershipSubmission
// still key off the MembershipPlan enum. Use this to seed a tier that
// doesn't exist yet; use PATCH /api/admin/plans/{key} to edit one.
export async function POST(req: NextRequest) {
  const denied = await gate();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { key, name, months, priceMmk, perks, featured, isActive, sortOrder } = body as {
    key?: unknown;
    name?: unknown;
    months?: unknown;
    priceMmk?: unknown;
    perks?: unknown;
    featured?: unknown;
    isActive?: unknown;
    sortOrder?: unknown;
  };

  if (typeof key !== "string" || !PLAN_KEYS.includes(key as PlanKey)) {
    return NextResponse.json(
      { error: `key must be one of: ${PLAN_KEYS.join(", ")}` },
      { status: 400 },
    );
  }
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required." }, { status: 400 });
  }
  if (typeof months !== "number" || !Number.isInteger(months) || months <= 0) {
    return NextResponse.json({ error: "months must be a positive integer." }, { status: 400 });
  }
  if (typeof priceMmk !== "number" || !Number.isInteger(priceMmk) || priceMmk < 0) {
    return NextResponse.json({ error: "priceMmk must be a non-negative integer." }, { status: 400 });
  }
  if (perks !== undefined && (!Array.isArray(perks) || !perks.every((p) => typeof p === "string"))) {
    return NextResponse.json({ error: "perks must be an array of strings." }, { status: 400 });
  }

  const existing = await prisma.plan.findUnique({ where: { key: key as PlanKey } });
  if (existing) {
    return NextResponse.json(
      { error: "Plan already exists for this key. Use PATCH /api/admin/plans/{key} to edit it." },
      { status: 409 },
    );
  }

  const plan = await prisma.plan.create({
    data: {
      key: key as PlanKey,
      name: name.trim(),
      months,
      priceMmk,
      perks: (perks as string[] | undefined) ?? [],
      featured: featured === true,
      isActive: isActive !== false,
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
    },
  });

  return NextResponse.json({ plan }, { status: 201 });
}
