"use client";

import { useEffect, useRef } from "react";
import Uppy from "@uppy/core";
import AwsS3 from "@uppy/aws-s3";
import Dashboard from "@uppy/dashboard";

import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";

type Kind = "video" | "thumbnail" | "trailer" | "instructor";

type CompletePayload = { key: string; location: string };

function buildUppy(kind: Kind, maxFileSize: number) {
  const uppy = new Uppy({
    restrictions: {
      maxNumberOfFiles: 1,
      maxFileSize,
      allowedFileTypes:
        kind === "thumbnail" || kind === "instructor" ? ["image/*"] : ["video/*"],
    },
    autoProceed: false,
  });

  uppy.use(AwsS3, {
    shouldUseMultipart: () => kind === "video" || kind === "trailer",
    getChunkSize: () => 8 * 1024 * 1024,
    limit: 6,

    async getUploadParameters(file) {
      const res = await fetch("/api/admin/uploads/s3/sign-single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name ?? "file",
          contentType: file.type ?? "application/octet-stream",
          kind,
        }),
      });
      if (!res.ok) throw new Error(`sign-single failed: ${res.status}`);
      const data = (await res.json()) as {
        method: "PUT";
        url: string;
        fields: Record<string, string>;
        headers: Record<string, string>;
        key: string;
        location: string;
      };
      uppy.setFileMeta(file.id, { key: data.key, location: data.location });
      return {
        method: data.method,
        url: data.url,
        headers: data.headers,
      };
    },

    async createMultipartUpload(file) {
      const res = await fetch("/api/admin/uploads/s3/multipart/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name ?? "file",
          contentType: file.type ?? "application/octet-stream",
          kind,
        }),
      });
      if (!res.ok) throw new Error(`create failed: ${res.status}`);
      const data = (await res.json()) as { uploadId: string; key: string };
      uppy.setFileMeta(file.id, { key: data.key });
      return { uploadId: data.uploadId, key: data.key };
    },

    async signPart(_file, { uploadId, key, partNumber }) {
      const res = await fetch("/api/admin/uploads/s3/multipart/sign-part", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, key, partNumber }),
      });
      if (!res.ok) throw new Error(`sign-part ${partNumber} failed: ${res.status}`);
      const data = (await res.json()) as { url: string };
      return { url: data.url };
    },

    async listParts(_file, { uploadId, key }) {
      const res = await fetch("/api/admin/uploads/s3/multipart/list-parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, key }),
      });
      if (!res.ok) throw new Error(`list-parts failed: ${res.status}`);
      return (await res.json()) as { PartNumber: number; Size: number; ETag: string }[];
    },

    async completeMultipartUpload(file, { uploadId, key, parts }) {
      const res = await fetch("/api/admin/uploads/s3/multipart/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, key, parts }),
      });
      if (!res.ok) throw new Error(`complete failed: ${res.status}`);
      const data = (await res.json()) as { location: string; key: string };
      uppy.setFileMeta(file.id, { key: data.key, location: data.location });
      return { location: data.location };
    },

    async abortMultipartUpload(_file, { uploadId, key }) {
      await fetch("/api/admin/uploads/s3/multipart/abort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, key }),
      });
    },
  });

  return uppy;
}

export function S3Uploader({
  kind,
  height = 240,
  maxFileSize,
  onComplete,
  currentKey,
  currentUrl,
}: {
  kind: Kind;
  height?: number;
  maxFileSize?: number;
  onComplete: (payload: CompletePayload) => void;
  currentKey?: string | null;
  currentUrl?: string | null;
}) {
  const targetRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const isVideoKind = kind === "video" || kind === "trailer";

  useEffect(() => {
    if (!targetRef.current) return;

    const defaultMax =
      kind === "thumbnail" || kind === "instructor"
        ? 25 * 1024 * 1024
        : 5 * 1024 * 1024 * 1024;
    const uppy = buildUppy(kind, maxFileSize ?? defaultMax);

    uppy.use(Dashboard, {
      target: targetRef.current,
      inline: true,
      theme: "dark",
      height,
      proudlyDisplayPoweredByUppy: false,
      hideUploadButton: false,
    });

    const handler = (
      file: { meta?: Record<string, unknown>; response?: { uploadURL?: string; body?: Record<string, unknown> } } | undefined,
      response: { body?: Record<string, unknown>; uploadURL?: string } | undefined,
    ) => {
      const fromMeta = (file?.meta?.key as string | undefined) ?? undefined;
      const fromBody = (response?.body?.key as string | undefined) ?? undefined;
      const fromLocation =
        (file?.meta?.location as string | undefined) ??
        (response?.body?.location as string | undefined) ??
        response?.uploadURL ??
        "";
      const key = fromBody ?? fromMeta;
      if (!key) return;
      onCompleteRef.current({ key, location: fromLocation });
    };

    uppy.on("upload-success", handler as never);

    return () => {
      uppy.off("upload-success", handler as never);
      uppy.destroy();
    };
  }, [kind, height, maxFileSize]);

  return (
    <div className="rounded-lg border border-white/10 bg-black/40 p-2">
      {isVideoKind && currentUrl && (
        <div className="mb-2 overflow-hidden rounded-md border border-white/10 bg-black">
          <video
            src={currentUrl}
            controls
            preload="metadata"
            className="block w-full"
            style={{ maxHeight: height }}
          />
          <p className="border-t border-white/10 bg-black/50 px-3 py-1.5 text-[11px] text-white/55">
            Current video — drop a new file below to replace.
          </p>
        </div>
      )}
      <div ref={targetRef} />
      {currentKey && !currentUrl && (
        <p className="mt-2 break-all px-2 text-[11px] text-white/55">
          Uploaded: <span className="font-mono text-white/80">{currentKey}</span>
        </p>
      )}
    </div>
  );
}
