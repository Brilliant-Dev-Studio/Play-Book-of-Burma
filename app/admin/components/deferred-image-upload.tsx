"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type Kind = "thumbnail" | "instructor";

type UploadResult = { key: string; location: string };

export type DeferredImageUploadHandle = {
  /**
   * Upload the staged file. Resolves to:
   *  - the new {key, location} if a file is staged
   *  - null if nothing changed (e.g. edit mode where the user kept the existing key)
   * Rejects on upload failure.
   */
  upload: () => Promise<UploadResult | null>;
  /** True when there's a staged file ready to upload. */
  hasStagedFile: () => boolean;
};

const MAX_BYTES = 25 * 1024 * 1024;

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export const DeferredImageUpload = forwardRef<
  DeferredImageUploadHandle,
  {
    kind: Kind;
    currentUrl?: string | null;
    height?: number;
    onStagedChange?: (hasFile: boolean) => void;
  }
>(function DeferredImageUpload({ kind, currentUrl, height = 240, onStagedChange }, ref) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    onStagedChange?.(!!file);
  }, [file, onStagedChange]);

  const accept = useCallback(
    (f: File | null) => {
      setError(null);
      if (!f) {
        setFile(null);
        return;
      }
      if (!f.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return;
      }
      if (f.size > MAX_BYTES) {
        setError(`File is larger than ${formatBytes(MAX_BYTES)}.`);
        return;
      }
      setFile(f);
    },
    [],
  );

  useImperativeHandle(
    ref,
    (): DeferredImageUploadHandle => ({
      hasStagedFile: () => !!file,
      upload: async () => {
        if (!file) return null;

        const signRes = await fetch("/api/admin/uploads/s3/sign-single", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type || "application/octet-stream",
            kind,
          }),
        });
        if (!signRes.ok) throw new Error(`Could not sign upload: ${signRes.status}`);
        const data = (await signRes.json()) as {
          url: string;
          key: string;
          location: string;
          headers: Record<string, string>;
        };

        setProgress(0);
        try {
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", data.url);
            for (const [k, v] of Object.entries(data.headers ?? {})) {
              xhr.setRequestHeader(k, v);
            }
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
            };
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) resolve();
              else reject(new Error(`Upload failed: ${xhr.status}`));
            };
            xhr.onerror = () => reject(new Error("Upload failed."));
            xhr.send(file);
          });
        } finally {
          setProgress(null);
        }

        return { key: data.key, location: data.location };
      },
    }),
    [file, kind],
  );

  const showPreview = previewUrl ?? currentUrl ?? null;

  function openPicker() {
    inputRef.current?.click();
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    accept(f);
  }

  return (
    <div className="rounded-lg border border-white/10 bg-black/40 p-2">
      <div
        className={`relative overflow-hidden rounded-md border-2 border-dashed transition-colors ${
          dragging ? "border-coral bg-coral/5" : "border-white/15 bg-black/30"
        }`}
        style={{ height }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => accept(e.target.files?.[0] ?? null)}
        />

        {showPreview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={showPreview}
              alt="Preview"
              className="h-full w-full object-contain"
            />
            {progress !== null && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-black/60">
                <div
                  className="h-full bg-coral transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="absolute right-2 top-2 rounded-md border border-white/20 bg-black/70 px-2 py-1 text-xs font-semibold text-white/85 backdrop-blur transition-colors hover:bg-black/90"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={openPicker}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-md border border-white/20 bg-black/70 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur transition-colors hover:bg-black/90"
            >
              {file ? "Replace file" : "Change photo"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={openPicker}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
          >
            <span>
              Drop file here or <span className="text-coral underline">browse</span>
            </span>
            <span className="text-[11px] text-white/45">
              PNG / JPG / WEBP — up to {formatBytes(MAX_BYTES)}
            </span>
          </button>
        )}
      </div>

      {file && (
        <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs">
          <div className="min-w-0">
            <p className="truncate text-white/85">{file.name}</p>
            <p className="text-white/50">{formatBytes(file.size)} · staged for upload</p>
          </div>
          {progress !== null && (
            <span className="font-mono text-coral">{progress}%</span>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 px-1 text-xs text-red-300">{error}</p>
      )}
    </div>
  );
});
