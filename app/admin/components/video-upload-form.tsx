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
import { saveVideo, type VideoFormInput } from "@/app/admin/videos/actions";

type LessonRow = {
  title: string;
  videoKey: string;
  videoUrl?: string;
  durationSeconds: number;
  durationLabel: string;
  details: string;
};
type SkillsetRow = { title: string; description: string; imageUrl: string };

export type VideoFormInitial = Partial<VideoFormInput> & {
  id?: string;
  thumbnailUrl?: string;
  trailerUrl?: string;
  lessons?: LessonRow[];
};

export type InstructorOption = { id: string; name: string; title: string };

function emptyLesson(): LessonRow {
  return { title: "", videoKey: "", durationSeconds: 0, durationLabel: "", details: "" };
}
function emptySkillset(): SkillsetRow {
  return { title: "", description: "", imageUrl: "" };
}

export function VideoUploadForm({
  mode,
  initial,
  instructors,
}: {
  mode: "create" | "edit";
  initial?: VideoFormInitial;
  instructors: InstructorOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);

  const [titleLine1, setTitleLine1] = useState(initial?.titleLine1 ?? "");
  const [titleLine2, setTitleLine2] = useState(initial?.titleLine2 ?? "");
  const [instructorId, setInstructorId] = useState(initial?.instructorId ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [type, setType] = useState<VideoFormInput["type"]>(initial?.type ?? "VIDEO");
  const [industry, setIndustry] = useState<VideoFormInput["industry"]>(
    initial?.industry ?? "TECHNOLOGY",
  );
  const [skillset, setSkillset] = useState<VideoFormInput["skillset"]>(
    initial?.skillset ?? "BUSINESS_FINANCE_STRATEGY",
  );
  const [durationLabel, setDurationLabel] = useState(initial?.durationLabel ?? "");
  const [durationSeconds, setDurationSeconds] = useState<number>(
    initial?.durationSeconds ?? 0,
  );
  const [status, setStatus] = useState<VideoFormInput["status"]>(initial?.status ?? "DRAFT");
  const [guidebookUrl, setGuidebookUrl] = useState(initial?.guidebookUrl ?? "");

  const existingThumbnailKey = initial?.thumbnailKey ?? "";
  const [thumbStaged, setThumbStaged] = useState(false);
  const thumbnailRef = useRef<DeferredImageUploadHandle>(null);
  const [trailerKey, setTrailerKey] = useState<string>(initial?.trailerKey ?? "");

  const [lessons, setLessons] = useState<LessonRow[]>(
    initial?.lessons && initial.lessons.length > 0 ? initial.lessons : [emptyLesson()],
  );
  const [skillsetItems, setSkillsetItems] = useState<SkillsetRow[]>(
    initial?.skillsetItems && initial.skillsetItems.length > 0
      ? initial.skillsetItems
      : [emptySkillset()],
  );

  const hasInstructors = instructors.length > 0;

  function buildPayload(thumbnailKey: string): VideoFormInput {
    return {
      id: initial?.id,
      type,
      playbook: "CEO_PLAYBOOK",
      industry,
      skillset,
      titleLine1,
      titleLine2: titleLine2 || undefined,
      description,
      instructorId,
      thumbnailKey,
      trailerKey: trailerKey || undefined,
      guidebookUrl: guidebookUrl || undefined,
      durationSeconds: Number(durationSeconds) || 0,
      durationLabel,
      status,
      lessons,
      skillsetItems,
    };
  }

  function submit(publish: boolean) {
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

      const result = await saveVideo(buildPayload(thumbnailKey), publish);
      if (!result.ok) {
        setErrors(result.errors);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      router.push("/admin/videos");
      router.refresh();
    });
  }

  const canPublish =
    (!!existingThumbnailKey || thumbStaged) &&
    !!titleLine1 &&
    !!instructorId &&
    lessons.length > 0 &&
    lessons.every((l) => l.videoKey && l.title);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(false);
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
            <label className={labelClass}>Guidebook URL (optional)</label>
            <input
              className={inputClass}
              value={guidebookUrl}
              onChange={(e) => setGuidebookUrl(e.target.value)}
              placeholder="https://…"
            />
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Type</label>
              <select
                className={inputClass}
                value={type}
                onChange={(e) => setType(e.target.value as VideoFormInput["type"])}
              >
                <option value="VIDEO">Video</option>
                <option value="PODCAST">Podcast</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Industry</label>
              <select
                className={inputClass}
                value={industry}
                onChange={(e) => setIndustry(e.target.value as VideoFormInput["industry"])}
              >
                <option value="RETAILS">Retails</option>
                <option value="FMCG">FMCG</option>
                <option value="TECHNOLOGY">Technology</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Skillset</label>
              <select
                className={inputClass}
                value={skillset}
                onChange={(e) => setSkillset(e.target.value as VideoFormInput["skillset"])}
              >
                <option value="BUSINESS_FINANCE_STRATEGY">
                  Business, Finance & Strategy
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className={labelClass}>Duration label (subscriber-facing)</label>
              <input
                className={inputClass}
                value={durationLabel}
                onChange={(e) => setDurationLabel(e.target.value)}
                placeholder="1 hour 15 minutes"
              />
            </div>
            <div>
              <label className={labelClass}>Duration (seconds)</label>
              <input
                type="number"
                className={inputClass}
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Publish status</label>
            <select
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value as VideoFormInput["status"])}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px_140px]">
            <div className="sm:col-span-3">
              <p className={labelClass}>Lesson {i + 1} video</p>
              <div className="mt-2">
                <S3Uploader
                  kind="video"
                  height={180}
                  currentKey={l.videoKey}
                  currentUrl={l.videoUrl}
                  onComplete={({ key }) =>
                    setLessons((xs) =>
                      xs.map((x, idx) =>
                        idx === i ? { ...x, videoKey: key, videoUrl: undefined } : x,
                      ),
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
            <div>
              <label className={labelClass}>Duration label</label>
              <input
                className={inputClass}
                value={l.durationLabel}
                onChange={(e) =>
                  setLessons((xs) =>
                    xs.map((x, idx) => (idx === i ? { ...x, durationLabel: e.target.value } : x)),
                  )
                }
                placeholder="10 mins"
              />
            </div>
            <div>
              <label className={labelClass}>Seconds</label>
              <input
                type="number"
                className={inputClass}
                value={l.durationSeconds}
                onChange={(e) =>
                  setLessons((xs) =>
                    xs.map((x, idx) =>
                      idx === i ? { ...x, durationSeconds: Number(e.target.value) } : x,
                    ),
                  )
                }
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
              <label className={labelClass}>Image URL</label>
              <input
                className={inputClass}
                value={s.imageUrl}
                onChange={(e) =>
                  setSkillsetItems((xs) =>
                    xs.map((x, idx) => (idx === i ? { ...x, imageUrl: e.target.value } : x)),
                  )
                }
              />
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
      <div className="sticky bottom-0 -mx-8 flex items-center justify-between gap-3 border-t border-white/10 bg-black/80 px-8 py-4 backdrop-blur">
        <Link
          href="/admin/videos"
          className="rounded-md border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.08]"
        >
          Cancel
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12] disabled:opacity-50"
          >
            {pending ? "Saving…" : mode === "edit" ? "Save changes" : "Save as Draft"}
          </button>
          <button
            type="button"
            disabled={pending || !canPublish}
            onClick={() => submit(true)}
            className="rounded-md bg-coral px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90 disabled:opacity-50"
          >
            {pending ? "Publishing…" : "Publish"}
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
