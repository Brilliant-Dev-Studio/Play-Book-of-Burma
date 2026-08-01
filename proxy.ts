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

// Native apps (URLSession, Alamofire, etc.) don't send an Origin header and
// aren't subject to CORS at all — this is only relevant for browser-based
// callers (Expo web dev server, a future web dashboard, WKWebView, Swagger's
// "Try it out"). Configure additional origins via CORS_ALLOWED_ORIGINS
// ("https://a.com,https://b.com") — no wildcards, must match exactly.
const DEV_ORIGINS = [
  "http://localhost:8081", // Expo web (`expo start --web`)
  "http://localhost:19006", // Expo web, older default port
];
const CORS_ALLOWED_ORIGINS = [
  ...DEV_ORIGINS,
  ...(process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
];

const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
};

function withCors(req: NextRequest, res: NextResponse): NextResponse {
  const origin = req.headers.get("origin") ?? "";
  if (CORS_ALLOWED_ORIGINS.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Vary", "Origin");
  }
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API routes handle their own session checks (getSession() -> 401/403 JSON)
  // and must never be redirected to /login — only attach CORS here.
  if (pathname.startsWith("/api/")) {
    if (req.method === "OPTIONS") {
      return withCors(req, NextResponse.json({}));
    }
    return withCors(req, NextResponse.next());
  }

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
  matcher: ["/user-portal/:path*", "/admin/:path*", "/change-password", "/login", "/api/:path*"],
};
