import { notFound } from "next/navigation";
import { requireSession } from "@/lib/server/auth-helpers";
import {
  getPodcastDetail,
  getPodcastResumeSeconds,
} from "@/lib/server/podcasts";
import { AudioDetailClient } from "./audio-detail-client";

export default async function UserPortalAudioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const [podcast, resumeSeconds] = await Promise.all([
    getPodcastDetail(id),
    getPodcastResumeSeconds(session.uid, id),
  ]);

  if (!podcast) notFound();

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-black font-sans text-white">
      <AudioDetailClient podcast={podcast} resumeSeconds={resumeSeconds} />
    </main>
  );
}
