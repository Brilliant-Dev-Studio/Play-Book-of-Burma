import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/server/auth-helpers";
import { isAllowedKey } from "@/lib/server/s3";

const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;
const REGIONS = ["YANGON", "MANDALAY", "THAILAND", "OTHER"] as const;

type Gender = (typeof GENDERS)[number];
type Region = (typeof REGIONS)[number];

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
    }

    const body = await req.json();
    const data: {
      displayName?: string | null;
      photoKey?: string | null;
      gender?: Gender | null;
      birthYear?: number | null;
      region?: Region | null;
    } = {};

    if ("displayName" in body) {
      const v = body.displayName;
      if (v === null || v === "") data.displayName = null;
      else if (typeof v === "string") data.displayName = v;
      else return NextResponse.json({ error: "Invalid displayName." }, { status: 400 });
    }
    if ("photoKey" in body) {
      const v = body.photoKey;
      if (v === null || v === "") data.photoKey = null;
      else if (typeof v === "string" && isAllowedKey(v)) data.photoKey = v;
      else return NextResponse.json({ error: "Invalid photoKey." }, { status: 400 });
    }
    if ("gender" in body) {
      const v = body.gender;
      if (v === null || v === "") data.gender = null;
      else if (typeof v === "string" && (GENDERS as readonly string[]).includes(v))
        data.gender = v as Gender;
      else return NextResponse.json({ error: "Invalid gender." }, { status: 400 });
    }
    if ("birthYear" in body) {
      const v = body.birthYear;
      if (v === null || v === "") data.birthYear = null;
      else if (typeof v === "number" && Number.isInteger(v) && v >= 1900 && v <= new Date().getFullYear())
        data.birthYear = v;
      else return NextResponse.json({ error: "Invalid birthYear." }, { status: 400 });
    }
    if ("region" in body) {
      const v = body.region;
      if (v === null || v === "") data.region = null;
      else if (typeof v === "string" && (REGIONS as readonly string[]).includes(v))
        data.region = v as Region;
      else return NextResponse.json({ error: "Invalid region." }, { status: 400 });
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    await prisma.user.update({ where: { id: session.uid }, data });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("profile PATCH error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
