import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth-helpers";
import { getDashboardData } from "@/lib/server/dashboard-stats";

const ALLOWED_DAYS = new Set([7, 30, 90, 365]);

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const daysParam = Number(req.nextUrl.searchParams.get("days") ?? "30");
  const days = ALLOWED_DAYS.has(daysParam) ? daysParam : 30;

  try {
    const data = await getDashboardData(days);
    return NextResponse.json(data);
  } catch (err) {
    console.error("admin/dashboard GET error:", err);
    return NextResponse.json({ error: "Failed to load dashboard." }, { status: 500 });
  }
}
