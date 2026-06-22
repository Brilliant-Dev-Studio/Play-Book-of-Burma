"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { S3Uploader } from "@/app/admin/components/s3-uploader";
import {
  DeferredImageUpload,
  type DeferredImageUploadHandle,
} from "@/app/admin/components/deferred-image-upload";
import { inputClass, labelClass } from "@/app/admin/components/form-field-styles";
import { saveVideo, type VideoFormInput } from "@/app/admin/videos/actions";

type LessonRow = {
  title: string;
  videoKey: string;
  videoUrl?: string;
  durationSeconds: number;
  durationLabel: string;
  details: string;
};
type SkillsetRow = { title: string; description: string; imageKey: string };

export type VideoFormInitial = Partial<VideoFormInput> & {
  id?: string;
  thumbnailUrl?: string;
  trailerUrl?: string;
  trailerThumbnailUrl?: string;
  guidebookCoverUrl?: string;
  lessons?: LessonRow[];
};

export type InstructorOption = { id: string; name: string; title: string };

export type TaxonomyOption = { id: string; name: string };

function emptyLesson(): LessonRow {
  return { title: "", videoKey: "", durationSeconds: 0, durationLabel: "", details: "" };
}

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
function emptySkillset(): SkillsetRow {
  return { title: "", description: "", imageKey: "" };
}

export function VideoUploadForm({
  mode,
  initial,
  instructors,
  industries,
  skillsets,
}: {
  mode: "create" | "edit";
  initial?: VideoFormInitial;
  instructors: InstructorOption[];
  industries: TaxonomyOption[];
  skillsets: TaxonomyOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);

  const [titleLine1, setTitleLine1] = useState(initial?.titleLine1 ?? "");
  const [titleLine2, setTitleLine2] = useState(initial?.titleLine2 ?? "");
  const [instructorId, setInstructorId] = useState(initial?.instructorId ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  // All videos are type=VIDEO now — podcasts have their own admin section.
  const [industryId, setIndustryId] = useState<string>(
    initial?.industryId ?? industries[0]?.id ?? "",
  );
  const [skillsetId, setSkillsetId] = useState<string>(
    initial?.skillsetId ?? skillsets[0]?.id ?? "",
  );
  const [guidebookKey, setGuidebookKey] = useState<string>(initial?.guidebookKey ?? "");
  const [guidebookCoverKey, setGuidebookCoverKey] = useState<string>(initial?.guidebookCoverKey ?? "");
  const guidebookCoverRef = useRef<DeferredImageUploadHandle>(null);
  const [guidebookCoverStaged, setGuidebookCoverStaged] = useState(false);

  const existingThumbnailKey = initial?.thumbnailKey ?? "";
  const [thumbStaged, setThumbStaged] = useState(false);
  const thumbnailRef = useRef<DeferredImageUploadHandle>(null);
  const [trailerKey, setTrailerKey] = useState<string>(initial?.trailerKey ?? "");
  const [trailerThumbnailKey, setTrailerThumbnailKey] = useState<string>(initial?.trailerThumbnailKey ?? "");
  const trailerThumbnailRef = useRef<DeferredImageUploadHandle>(null);
  const [trailerThumbnailStaged, setTrailerThumbnailStaged] = useState(false);

  const [lessons, setLessons] = useState<LessonRow[]>(
    initial?.lessons && initial.lessons.length > 0 ? initial.lessons : [emptyLesson()],
  );
  const [skillsetItems, setSkillsetItems] = useState<SkillsetRow[]>(
    initial?.skillsetItems && initial.skillsetItems.length > 0
      ? initial.skillsetItems
      : [emptySkillset()],
  );

  const hasInstructors = instructors.length > 0;

  const totalDurationSeconds = useMemo(
    () => lessons.reduce((sum, l) => sum + (Number(l.durationSeconds) || 0), 0),
    [lessons],
  );
  const totalDurationLabel = useMemo(
    () => formatDuration(totalDurationSeconds),
    [totalDurationSeconds],
  );

  function buildPayload(
    thumbnailKey: string,
    resolvedTrailerThumbnailKey?: string,
    resolvedGuidebookCoverKey?: string,
  ): VideoFormInput {
    return {
      id: initial?.id,
      type: "VIDEO",
      playbook: "CEO_PLAYBOOK",
      industryId,
      skillsetId,
      titleLine1,
      titleLine2: titleLine2 || undefined,
      description,
      instructorId,
      thumbnailKey,
      trailerKey: trailerKey || undefined,
      trailerThumbnailKey: (resolvedTrailerThumbnailKey ?? trailerThumbnailKey) || undefined,
      guidebookKey: guidebookKey || undefined,
      guidebookCoverKey: (resolvedGuidebookCoverKey ?? guidebookCoverKey) || undefined,
      durationSeconds: totalDurationSeconds,
      durationLabel: totalDurationLabel,
      status: "PUBLISHED",
      lessons,
      skillsetItems,
    };
  }

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

      let resolvedTrailerThumbnailKey: string | undefined;
      try {
        const uploaded = await trailerThumbnailRef.current?.upload();
        if (uploaded) resolvedTrailerThumbnailKey = uploaded.key;
      } catch (err) {
        setErrors([err instanceof Error ? err.message : "Trailer thumbnail upload failed."]);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      let resolvedGuidebookCoverKey: string | undefined;
      try {
        const uploaded = await guidebookCoverRef.current?.upload();
        if (uploaded) resolvedGuidebookCoverKey = uploaded.key;
      } catch (err) {
        setErrors([err instanceof Error ? err.message : "Guidebook cover upload failed."]);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const result = await saveVideo(buildPayload(thumbnailKey, resolvedTrailerThumbnailKey, resolvedGuidebookCoverKey), true);
      if (!result.ok) {
        setErrors(result.errors);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      router.push("/admin/videos");
      router.refresh();
    });
  }

  const missing: string[] = [];
  if (!existingThumbnailKey && !thumbStaged) missing.push("Thumbnail");
  if (!titleLine1.trim()) missing.push("Title line 1");
  if (!instructorId) missing.push("Instructor");
  if (lessons.length === 0) {
    missing.push("At least one lesson");
  } else {
    lessons.forEach((l, i) => {
      const lacks: string[] = [];
      if (!l.videoKey) lacks.push("video");
      if (!l.title.trim()) lacks.push("title");
      if (lacks.length) missing.push(`Lesson ${i + 1} ${lacks.join(" + ")}`);
    });
  }
  const canPublish = missing.length === 0;

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

      {!hasInstructors && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          No instructors yet —{" "}
          <Link href="/admin/instructors/new" className="font-semibold underline">
            create one first
          </Link>
          .
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
            <p className={labelClass}>Trailer (optional)</p>
            <div className="mt-2">
              <S3Uploader
                kind="trailer"
                height={220}
                currentKey={trailerKey}
                currentUrl={trailerKey === (initial?.trailerKey ?? "") ? initial?.trailerUrl : undefined}
                onComplete={({ key }) => setTrailerKey(key)}
              />
            </div>
          </div>

          <div>
            <p className={labelClass}>Trailer Thumbnail (optional)</p>
            <div className="mt-2">
              <DeferredImageUpload
                ref={trailerThumbnailRef}
                kind="thumbnail"
                height={200}
                currentUrl={
                  trailerThumbnailKey === (initial?.trailerThumbnailKey ?? "")
                    ? initial?.trailerThumbnailUrl
                    : undefined
                }
                onStagedChange={setTrailerThumbnailStaged}
              />
            </div>
          </div>

          <div>
            <p className={labelClass}>Guidebook PDF (optional)</p>
            <div className="mt-2">
              <S3Uploader
                kind="guidebook"
                height={180}
                currentKey={guidebookKey}
                onComplete={({ key }) => setGuidebookKey(key)}
              />
            </div>
          </div>

          <div>
            <p className={labelClass}>Guidebook Cover Image (optional)</p>
            <div className="mt-2">
              <DeferredImageUpload
                ref={guidebookCoverRef}
                kind="thumbnail"
                height={200}
                currentUrl={
                  guidebookCoverKey === (initial?.guidebookCoverKey ?? "")
                    ? initial?.guidebookCoverUrl
                    : undefined
                }
                onStagedChange={setGuidebookCoverStaged}
              />
            </div>
          </div>
        </div>

        {/* RIGHT — metadata */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Title line 1</label>
              <input
                className={inputClass}
                value={titleLine1}
                onChange={(e) => setTitleLine1(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Title line 2</label>
              <input
                className={inputClass}
                value={titleLine2}
                onChange={(e) => setTitleLine2(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Instructor</label>
              <select
                className={inputClass}
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                disabled={!hasInstructors}
              >
                <option value="">Select an instructor…</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} — {i.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={4}
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Industry</label>
              <select
                className={inputClass}
                value={industryId}
                onChange={(e) => setIndustryId(e.target.value)}
                disabled={industries.length === 0}
              >
                {industries.length === 0 && <option value="">No industries</option>}
                {industries.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Skillset</label>
              <select
                className={inputClass}
                value={skillsetId}
                onChange={(e) => setSkillsetId(e.target.value)}
                disabled={skillsets.length === 0}
              >
                {skillsets.length === 0 && <option value="">No skillsets</option>}
                {skillsets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Total duration (auto-computed from lessons)</label>
            <input
              className={`${inputClass} cursor-not-allowed opacity-80`}
              value={totalDurationLabel || "Will be calculated once lesson videos are uploaded"}
              readOnly
              tabIndex={-1}
            />
          </div>
        </div>
      </div>

      {/* Lessons */}
      <Repeater
        title="Lessons Plan"
        items={lessons}
        onAdd={() => setLessons((xs) => [...xs, emptyLesson()])}
        onRemove={(i) => setLessons((xs) => xs.filter((_, idx) => idx !== i))}
        render={(l, i) => (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <p className={labelClass}>Lesson {i + 1} video</p>
              <div className="mt-2">
                <S3Uploader
                  kind="video"
                  height={180}
                  currentKey={l.videoKey}
                  currentUrl={l.videoUrl}
                  onComplete={({ key, durationSeconds }) =>
                    setLessons((xs) =>
                      xs.map((x, idx) => {
                        if (idx !== i) return x;
                        if (durationSeconds && durationSeconds > 0) {
                          const sec = Math.round(durationSeconds);
                          return {
                            ...x,
                            videoKey: key,
                            videoUrl: undefined,
                            durationSeconds: sec,
                            durationLabel: formatDuration(sec),
                          };
                        }
                        return { ...x, videoKey: key, videoUrl: undefined };
                      }),
                    )
                  }
                />
              </div>
              {!l.videoKey && (
                <p className="mt-1 text-xs text-red-300/80">Video upload required.</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Title</label>
              <input
                className={inputClass}
                value={l.title}
                onChange={(e) =>
                  setLessons((xs) =>
                    xs.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)),
                  )
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Duration (auto from video)</label>
              <input
                className={`${inputClass} cursor-not-allowed opacity-80`}
                value={l.durationLabel || (l.videoKey ? "Detecting…" : "Upload a video first")}
                readOnly
                tabIndex={-1}
              />
            </div>
            <div className="sm:col-span-3">
              <label className={labelClass}>Details</label>
              <textarea
                rows={2}
                className={inputClass}
                value={l.details}
                onChange={(e) =>
                  setLessons((xs) =>
                    xs.map((x, idx) => (idx === i ? { ...x, details: e.target.value } : x)),
                  )
                }
              />
            </div>
          </div>
        )}
      />

      {/* Skillsets */}
      <Repeater
        title="Skillset You Will Learn"
        items={skillsetItems}
        onAdd={() => setSkillsetItems((xs) => [...xs, emptySkillset()])}
        onRemove={(i) => setSkillsetItems((xs) => xs.filter((_, idx) => idx !== i))}
        render={(s, i) => (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Title</label>
              <input
                className={inputClass}
                value={s.title}
                onChange={(e) =>
                  setSkillsetItems((xs) =>
                    xs.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)),
                  )
                }
              />
            </div>
            <div>
              <p className={labelClass}>Image</p>
              <div className="mt-2">
                <S3Uploader
                  kind="thumbnail"
                  height={140}
                  currentKey={s.imageKey}
                  onComplete={({ key }) =>
                    setSkillsetItems((xs) =>
                      xs.map((x, idx) => (idx === i ? { ...x, imageKey: key } : x)),
                    )
                  }
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                rows={2}
                className={inputClass}
                value={s.description}
                onChange={(e) =>
                  setSkillsetItems((xs) =>
                    xs.map((x, idx) => (idx === i ? { ...x, description: e.target.value } : x)),
                  )
                }
              />
            </div>
          </div>
        )}
      />

      {/* Footer */}
      <div className="sticky bottom-0 -mx-8 flex flex-col gap-3 border-t border-white/10 bg-black/80 px-8 py-4 backdrop-blur">
        {!canPublish && missing.length > 0 && (
          <div className="rounded-md border border-butter/30 bg-butter/10 px-3 py-2 text-xs text-butter">
            <span className="font-semibold">Needed to publish:</span>{" "}
            {missing.join(", ")}
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/admin/videos"
            className="rounded-md border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.08]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending || !canPublish}
            className="rounded-md bg-coral px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90 disabled:opacity-50"
          >
            {pending ? "Publishing…" : mode === "edit" ? "Save changes" : "Publish"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Repeater<T>({
  title,
  items,
  onAdd,
  onRemove,
  render,
}: {
  title: string;
  items: T[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  render: (item: T, i: number) => React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight text-white">{title}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-md border border-coral/40 bg-coral/10 px-3 py-1.5 text-xs font-semibold text-coral transition-colors hover:bg-coral/20"
        >
          + Add
        </button>
      </div>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="relative rounded-lg border border-white/10 bg-black/40 p-4">
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label="Remove"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                ×
              </button>
            )}
            {render(item, i)}
          </div>
        ))}
      </div>
    </section>
  );
}
