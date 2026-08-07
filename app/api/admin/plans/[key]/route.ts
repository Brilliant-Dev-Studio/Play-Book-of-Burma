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

function isPlanKey(v: string): v is PlanKey {
  return (PLAN_KEYS as readonly string[]).includes(v);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const denied = await gate();
  if (denied) return denied;

  const { key } = await params;
  if (!isPlanKey(key)) {
    return NextResponse.json({ error: `key must be one of: ${PLAN_KEYS.join(", ")}` }, { status: 400 });
  }

  const plan = await prisma.plan.findUnique({ where: { key } });
  if (!plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });
  return NextResponse.json({ plan });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const denied = await gate();
  if (denied) return denied;

  const { key } = await params;
  if (!isPlanKey(key)) {
    return NextResponse.json({ error: `key must be one of: ${PLAN_KEYS.join(", ")}` }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { name, months, priceMmk, perks, featured, isActive, sortOrder } = body as {
    name?: unknown;
    months?: unknown;
    priceMmk?: unknown;
    perks?: unknown;
    featured?: unknown;
    isActive?: unknown;
    sortOrder?: unknown;
  };

  const data: {
    name?: string;
    months?: number;
    priceMmk?: number;
    perks?: string[];
    featured?: boolean;
    isActive?: boolean;
    sortOrder?: number;
  } = {};

  if ("name" in (body as object)) {
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Invalid name." }, { status: 400 });
    }
    data.name = name.trim();
  }
  if ("months" in (body as object)) {
    if (typeof months !== "number" || !Number.isInteger(months) || months <= 0) {
      return NextResponse.json({ error: "Invalid months." }, { status: 400 });
    }
    data.months = months;
  }
  if ("priceMmk" in (body as object)) {
    if (typeof priceMmk !== "number" || !Number.isInteger(priceMmk) || priceMmk < 0) {
      return NextResponse.json({ error: "Invalid priceMmk." }, { status: 400 });
    }
    data.priceMmk = priceMmk;
  }
  if ("perks" in (body as object)) {
    if (!Array.isArray(perks) || !perks.every((p) => typeof p === "string")) {
      return NextResponse.json({ error: "Invalid perks." }, { status: 400 });
    }
    data.perks = perks;
  }
  if ("featured" in (body as object)) {
    if (typeof featured !== "boolean") {
      return NextResponse.json({ error: "Invalid featured." }, { status: 400 });
    }
    data.featured = featured;
  }
  if ("isActive" in (body as object)) {
    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Invalid isActive." }, { status: 400 });
    }
    data.isActive = isActive;
  }
  if ("sortOrder" in (body as object)) {
    if (typeof sortOrder !== "number" || !Number.isInteger(sortOrder)) {
      return NextResponse.json({ error: "Invalid sortOrder." }, { status: 400 });
    }
    data.sortOrder = sortOrder;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  try {
    const plan = await prisma.plan.update({ where: { key }, data });
    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json({ error: "Plan not found." }, { status: 404 });
  }
}
