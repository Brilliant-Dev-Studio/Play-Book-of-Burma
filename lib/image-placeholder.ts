import type { StaticImageData } from "next/image";

import { HERO_PORTRAIT_BLUR, IMAGE_BLUR_FALLBACK } from "@/lib/image-blur-data";

type BlurPlaceholderProps =
  | { placeholder: "blur" }
  | { placeholder: "blur"; blurDataURL: string };

/** Props for next/image `placeholder="blur"` (static import or public path). */
export function imageBlurPlaceholder(
  src: string | StaticImageData,
): BlurPlaceholderProps {
  if (typeof src !== "string") {
    return { placeholder: "blur" };
  }

  return {
    placeholder: "blur",
    blurDataURL: HERO_PORTRAIT_BLUR[src] ?? IMAGE_BLUR_FALLBACK,
  };
}
