import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  verifySession,
  type SessionPayload,
} from "@/lib/server/session";

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const cookieToken = store.get(SESSION_COOKIE_NAME)?.value;
  if (cookieToken) return verifySession(cookieToken);

  // Native clients (iOS/Android) send the token from /api/auth/login as a
  // bearer header instead of relying on the httpOnly cookie.
  const authHeader = (await headers()).get("authorization");
  const bearerToken = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!bearerToken) return null;
  return verifySession(bearerToken);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== "ADMIN") redirect("/");
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: {
      id: true,
      email: true,
      displayName: true,
      photoUrl: true,
      role: true,
      mustChangePassword: true,
      gender: true,
      birthYear: true,
      region: true,
      membership: { select: { plan: true, status: true, expiresAt: true } },
    },
  });
  return user;
}
