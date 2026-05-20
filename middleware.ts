import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "__session";

function getSecret(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error("AUTH_SECRET env var must be set to at least 32 characters.");
  }
  return new TextEncoder().encode(raw);
}

type Payload = { uid: string; email: string; role: "USER" | "ADMIN" };

async function verify(token: string): Promise<Payload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    const { uid, email, role } = payload as Record<string, unknown>;
    if (typeof uid !== "string" || typeof email !== "string") return null;
    if (role !== "USER" && role !== "ADMIN") return null;
    return { uid, email, role };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verify(token) : null;

  const isLogin = pathname === "/login";
  const isAdmin = pathname.startsWith("/admin");
  const isProtected =
    pathname.startsWith("/user-portal") || isAdmin || pathname === "/change-password";

  if (token && !session) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAdmin && session && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isLogin && session) {
    return NextResponse.redirect(new URL("/user-portal", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user-portal/:path*", "/admin/:path*", "/change-password", "/login"],
};
