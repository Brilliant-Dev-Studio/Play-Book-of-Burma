import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/server/auth-helpers";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
    }

    const body = await req.json();
    const data: { displayName?: string | null; photoUrl?: string | null } = {};

    if ("displayName" in body) {
      const v = body.displayName;
      if (v === null || v === "") data.displayName = null;
      else if (typeof v === "string") data.displayName = v;
      else return NextResponse.json({ error: "Invalid displayName." }, { status: 400 });
    }
    if ("photoUrl" in body) {
      const v = body.photoUrl;
      if (v === null || v === "") data.photoUrl = null;
      else if (typeof v === "string") data.photoUrl = v;
      else return NextResponse.json({ error: "Invalid photoUrl." }, { status: 400 });
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
