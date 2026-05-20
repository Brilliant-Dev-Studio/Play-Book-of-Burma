import "server-only";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "__session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

export interface SessionPayload {
  uid: string;
  email: string;
  role: "USER" | "ADMIN";
}

function getSecret(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error(
      "AUTH_SECRET env var must be set to at least 32 characters. Generate with: openssl rand -base64 32",
    );
  }
  return new TextEncoder().encode(raw);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    const { uid, email, role } = payload as Record<string, unknown>;
    if (typeof uid !== "string" || typeof email !== "string") return null;
    if (role !== "USER" && role !== "ADMIN") return null;
    return { uid, email, role };
  } catch {
    return null;
  }
}
