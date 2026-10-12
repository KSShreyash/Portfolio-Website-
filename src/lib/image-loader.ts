import { IMAGE_WIDTHS } from "@/lib/image-widths";

/**
 * Pick a pre-generated image variant.
 *
 * The site ships as a static export, so Next's image optimiser is not
 * available — it needs sharp, a native binary, which no plain static host
 * (and no Workers isolate) can run. Instead `scripts/extract_assets.py`
 * writes the handful of widths this site can ever ask for, and this loader
 * resolves a request to the nearest one at or above the requested width.
 *
 * Unknown paths fall through untouched, so anything added later still works —
 * it just won't be responsive until it gets variants.
 */
export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const available = IMAGE_WIDTHS[src];
  if (!available || available.length === 0) return src;

  const pick = available.find((w) => w >= width) ?? available[available.length - 1];
  return src.replace(/\.webp$/, `-${pick}.webp`);
}
