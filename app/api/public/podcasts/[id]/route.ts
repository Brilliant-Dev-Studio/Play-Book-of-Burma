import { NextRequest, NextResponse } from "next/server";
import { getPodcastDetail } from "@/lib/server/podcasts";

function notFound() {
  return NextResponse.json({ error: "Podcast not found." }, { status: 404 });
}

// Public, unauthenticated equivalent of GET /api/podcasts/{id} — no session
// or membership required. Used for guest/pre-login preview screens, matching
// the same parity the podcast list routes already have. Mirrors the private
// route's shape in full, including the playable audioUrl. Separate file so
// the original route's auth is untouched.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const podcast = await getPodcastDetail(id);
  if (!podcast) return notFound();

  return NextResponse.json({ podcast });
}
