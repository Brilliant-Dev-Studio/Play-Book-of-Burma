"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { S3Uploader } from "@/app/admin/components/s3-uploader";
import {
  DeferredImageUpload,
  type DeferredImageUploadHandle,
} from "@/app/admin/components/deferred-image-upload";
import { inputClass, labelClass } from "@/app/admin/components/form-field-styles";
import { savePodcast, type PodcastFormInput } from "@/app/admin/podcasts/actions";

export type TaxonomyOption = { id: string; name: string };

export type PodcastFormInitial = Partial<PodcastFormInput> & {
  id?: string;
  thumbnailUrl?: string;
  audioUrl?: string;
};

function formatDuration(totalSeconds: number): string {
  const sec = Math.round(totalSeconds);
  if (sec <= 0) return "";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} ${h === 1 ? "hour" : "hours"}`);
  if (m > 0) parts.push(`${m} ${m === 1 ? "minute" : "minutes"}`);
  if (h === 0 && (m === 0 || s >= 5) && s > 0) {
    parts.push(`${s} ${s === 1 ? "second" : "seconds"}`);
  }
  return parts.join(" ") || `${sec} seconds`;
}

export function PodcastUploadForm({
  mode,
  initial,
  industries,
}: {
  mode: "create" | "edit";
  initial?: PodcastFormInitial;
  industries: TaxonomyOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [season, setSeason] = useState<number>(initial?.season ?? 1);
  const [episodeOrder, setEpisodeOrder] = useState<number>(initial?.episodeOrder ?? 0);
  const [popular, setPopular] = useState<boolean>(initial?.popular ?? false);
  const [durationSeconds, setDurationSeconds] = useState<number>(
    initial?.durationSeconds ?? 0,
  );
  const [durationLabel, setDurationLabel] = useState(initial?.durationLabel ?? "");
  const [audioKey, setAudioKey] = useState<string>(initial?.audioKey ?? "");
  const [industryId, setIndustryId] = useState<string>(initial?.industryId ?? "");

  const existingThumbnailKey = initial?.thumbnailKey ?? "";
  const [thumbStaged, setThumbStaged] = useState(false);
  const thumbnailRef = useRef<DeferredImageUploadHandle>(null);

  function submit() {
    setErrors([]);
    startTransition(async () => {
      let thumbnailKey = existingThumbnailKey;
      try {
        const uploaded = await thumbnailRef.current?.upload();
        if (uploaded) thumbnailKey = uploaded.key;
      } catch (err) {
        setErrors([err instanceof Error ? err.message : "Thumbnail upload failed."]);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const result = await savePodcast({
        id: initial?.id,
        title,
        description,
        audioKey,
        thumbnailKey,
        season,
        episodeOrder,
        durationSeconds,
        durationLabel,
        popular,
        industryId,
      });
      if (!result.ok) {
        setErrors(result.errors);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      router.push("/admin/podcasts");
      router.refresh();
    });
  }

  const canSubmit =
    !!title &&
    !!description &&
    !!audioKey &&
    !!industryId &&
    (!!existingThumbnailKey || thumbStaged);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-6"
    >
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <p className="font-semibold">Please fix:</p>
          <ul className="mt-1 list-disc pl-5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        {/* LEFT — media */}
        <div className="space-y-5">
          <div>
            <p className={labelClass}>Thumbnail (3:4 portrait)</p>
            <div className="mt-2">
              <DeferredImageUpload
                ref={thumbnailRef}
                kind="thumbnail"
                height={240}
                currentUrl={initial?.thumbnailUrl}
                onStagedChange={setThumbStaged}
              />
            </div>
          </div>

          <div>
            <p className={labelClass}>Audio file</p>
            <div className="mt-2">
              <S3Uploader
                kind="audio"
                height={220}
                currentKey={audioKey}
                currentUrl={
                  audioKey === (initial?.audioKey ?? "") ? initial?.audioUrl : undefined
                }
                onComplete={({ key, durationSeconds: sec }) => {
                  setAudioKey(key);
                  if (sec && sec > 0) {
                    const rounded = Math.round(sec);
                    setDurationSeconds(rounded);
                    setDurationLabel(formatDuration(rounded));
                  }
                }}
              />
            </div>
            {!audioKey && (
              <p className="mt-1 text-xs text-red-300/80">Audio upload required.</p>
            )}
          </div>
        </div>

        {/* RIGHT — metadata */}
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Title</label>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={6}
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Industry</label>
            <select
              className={inputClass}
              value={industryId}
              onChange={(e) => setIndustryId(e.target.value)}
            >
              <option value="">Select an industry…</option>
              {industries.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
            {industries.length === 0 && (
              <p className="mt-1 text-xs text-amber-300/90">
                No industries yet — add them under{" "}
                <Link href="/admin/industries" className="underline">
                  Industries
                </Link>
                .
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Season</label>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={season}
                onChange={(e) => setSeason(Number(e.target.value))}
              />
            </div>
            <div>
              <label className={labelClass}>Episode order</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={episodeOrder}
                onChange={(e) => setEpisodeOrder(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Duration (auto from audio)</label>
            <input
              className={`${inputClass} cursor-not-allowed opacity-80`}
              value={
                durationLabel ||
                (audioKey ? "Detecting…" : "Upload an audio file first")
              }
              readOnly
              tabIndex={-1}
            />
          </div>

          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-2.5">
            <input
              id="podcast-popular"
              type="checkbox"
              checked={popular}
              onChange={(e) => setPopular(e.target.checked)}
              className="h-4 w-4 accent-coral"
            />
            <label htmlFor="podcast-popular" className="text-sm text-white/90">
              Show under the <span className="font-semibold text-coral">Popular</span> tab
            </label>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 -mx-8 flex items-center justify-between gap-3 border-t border-white/10 bg-black/80 px-8 py-4 backdrop-blur">
        <Link
          href="/admin/podcasts"
          className="rounded-md border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.08]"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending || !canSubmit}
          className="rounded-md bg-coral px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90 disabled:opacity-50"
        >
          {pending ? "Publishing…" : mode === "edit" ? "Save changes" : "Publish"}
        </button>
      </div>
    </form>
  );
}
