"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  DeferredImageUpload,
  type DeferredImageUploadHandle,
} from "@/app/admin/components/deferred-image-upload";
import { inputClass, labelClass } from "@/app/admin/components/form-field-styles";
import {
  saveInstructor,
  type InstructorFormInput,
} from "@/app/admin/instructors/actions";

export type InstructorFormInitial = Partial<InstructorFormInput> & {
  id?: string;
  photoUrl?: string;
};

export function InstructorForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: InstructorFormInitial;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);

  const [name, setName] = useState(initial?.name ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const existingPhotoKey = initial?.photoKey ?? "";
  const [bios, setBios] = useState<string[]>(
    initial?.biographyParagraphs && initial.biographyParagraphs.length > 0
      ? initial.biographyParagraphs
      : [""],
  );
  const uploadRef = useRef<DeferredImageUploadHandle>(null);

  function submit() {
    setErrors([]);
    startTransition(async () => {
      let photoKey = existingPhotoKey;
      try {
        const uploaded = await uploadRef.current?.upload();
        if (uploaded) photoKey = uploaded.key;
      } catch (err) {
        setErrors([err instanceof Error ? err.message : "Photo upload failed."]);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const result = await saveInstructor({
        id: initial?.id,
        name,
        title,
        photoKey,
        biographyParagraphs: bios,
      });
      if (!result.ok) {
        setErrors(result.errors);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      router.push("/admin/instructors");
      router.refresh();
    });
  }

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
        <div className="space-y-5">
          <div>
            <p className={labelClass}>Photo (portrait)</p>
            <div className="mt-2">
              <DeferredImageUpload
                ref={uploadRef}
                kind="instructor"
                height={240}
                currentUrl={initial?.photoUrl}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ko Jason Myint"
            />
          </div>
          <div>
            <label className={labelClass}>Title</label>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="CEO of BYD By Essentials"
            />
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight text-white">Biography</h3>
          <button
            type="button"
            onClick={() => setBios((xs) => [...xs, ""])}
            className="rounded-md border border-coral/40 bg-coral/10 px-3 py-1.5 text-xs font-semibold text-coral transition-colors hover:bg-coral/20"
          >
            + Add
          </button>
        </div>
        <div className="space-y-4">
          {bios.map((b, i) => (
            <div key={i} className="relative rounded-lg border border-white/10 bg-black/40 p-4">
              {bios.length > 1 && (
                <button
                  type="button"
                  onClick={() => setBios((xs) => xs.filter((_, idx) => idx !== i))}
                  aria-label="Remove"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  ×
                </button>
              )}
              <label className={labelClass}>Paragraph {i + 1}</label>
              <textarea
                rows={3}
                className={inputClass}
                value={b}
                onChange={(e) =>
                  setBios((xs) => xs.map((x, idx) => (idx === i ? e.target.value : x)))
                }
              />
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 -mx-8 flex items-center justify-between gap-3 border-t border-white/10 bg-black/80 px-8 py-4 backdrop-blur">
        <Link
          href="/admin/instructors"
          className="rounded-md border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.08]"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-coral px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90 disabled:opacity-50"
        >
          {pending ? "Saving…" : mode === "edit" ? "Save changes" : "Create instructor"}
        </button>
      </div>
    </form>
  );
}
