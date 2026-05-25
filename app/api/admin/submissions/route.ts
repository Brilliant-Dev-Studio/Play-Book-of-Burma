import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/prisma";
import { presignGetUrl } from "@/lib/server/s3";

async function gate() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  return null;
}

const VALID_STATUS = new Set(["PENDING", "APPROVED", "REJECTED", "ALL"]);

export async function GET(req: NextRequest) {
  const denied = await gate();
  if (denied) return denied;

  try {
    const statusParam = req.nextUrl.searchParams.get("status") ?? "ALL";
    const status = VALID_STATUS.has(statusParam) ? statusParam : "ALL";

    const rows = await prisma.membershipSubmission.findMany({
      where: status === "ALL" ? undefined : { status: status as "PENDING" | "APPROVED" | "REJECTED" },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const resultingUserIds = rows
      .map((r) => r.resultingUserId)
      .filter((id): id is string => !!id);
    const resultingUsers = resultingUserIds.length
      ? await prisma.user.findMany({
          where: { id: { in: resultingUserIds } },
          select: { id: true, mustChangePassword: true, tempPasswordPlain: true },
        })
      : [];
    const userById = new Map(resultingUsers.map((u) => [u.id, u]));

    const counts = await prisma.membershipSubmission.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    const countByStatus = { PENDING: 0, APPROVED: 0, REJECTED: 0 } as Record<string, number>;
    for (const c of counts) countByStatus[c.status] = c._count._all;

    const submissions = await Promise.all(
      rows.map(async (r) => {
        const u = r.resultingUserId ? userById.get(r.resultingUserId) : undefined;
        let screenshotUrl = "";
        try {
          screenshotUrl = await presignGetUrl(r.screenshotKey);
        } catch (err) {
          console.error("presignGetUrl failed for", r.screenshotKey, err);
        }
        return {
          id: r.id,
          fullName: r.fullName,
          email: r.email,
          phone: r.phone,
          plan: r.plan,
          paymentMethod: r.paymentMethod,
          amountMmk: r.amountMmk,
          screenshotKey: r.screenshotKey,
          screenshotUrl,
          note: r.note,
          status: r.status,
          adminNote: r.adminNote,
          reviewedAt: r.reviewedAt?.toISOString() ?? null,
          createdAt: r.createdAt.toISOString(),
          resultingUser: u
            ? {
                userId: r.resultingUserId,
                mustChangePassword: u.mustChangePassword,
                tempPassword:
                  u.mustChangePassword && u.tempPasswordPlain ? u.tempPasswordPlain : null,
              }
            : null,
        };
      }),
    );

    return NextResponse.json({
      counts: {
        pending: countByStatus.PENDING,
        approved: countByStatus.APPROVED,
        rejected: countByStatus.REJECTED,
        all: countByStatus.PENDING + countByStatus.APPROVED + countByStatus.REJECTED,
      },
      submissions,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("GET /api/admin/submissions failed:", err);
    return NextResponse.json(
      { error: `Submissions query failed: ${message}` },
      { status: 500 },
    );
  }
}
