import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PLAN_PRICE_MMK } from "@/lib/server/pricing";

const PLANS = new Set(["SIX_MONTHS", "TWELVE_MONTHS"] as const);
const METHODS = new Set(["KBZ_PAY", "WAVE_MONEY"] as const);

function isEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function trimStr(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t || t.length > max) return null;
  return t;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const fullName = trimStr(body.fullName, 120);
  const email = isEmail(body.email) ? (body.email as string).toLowerCase() : null;
  const phone = trimStr(body.phone, 30);
  const plan = body.plan as string;
  const paymentMethod = body.paymentMethod as string;
  const screenshotKey = trimStr(body.screenshotKey, 500);
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) || null : null;

  if (!fullName) return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  if (!email) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  if (!phone) return NextResponse.json({ error: "Phone is required." }, { status: 400 });
  if (!PLANS.has(plan as never)) return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  if (!METHODS.has(paymentMethod as never)) {
    return NextResponse.json({ error: "Invalid payment method." }, { status: 400 });
  }
  if (!screenshotKey || !screenshotKey.startsWith("playbookofburma/submissions/")) {
    return NextResponse.json({ error: "Payment screenshot is required." }, { status: 400 });
  }

  const amountMmk = PLAN_PRICE_MMK[plan as keyof typeof PLAN_PRICE_MMK];

  const submission = await prisma.membershipSubmission.create({
    data: {
      fullName,
      email,
      phone,
      plan: plan as "SIX_MONTHS" | "TWELVE_MONTHS",
      paymentMethod: paymentMethod as "KBZ_PAY" | "WAVE_MONEY",
      amountMmk,
      screenshotKey,
      note,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: submission.id });
}
