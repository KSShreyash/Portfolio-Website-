import Image from "next/image";
import { cn } from "@/lib/cn";

interface MonogramProps {
  size?: number;
  className?: string;
  /** Set when the mark sits next to a text wordmark and would be redundant. */
  decorative?: boolean;
  /**
   * `mark` is the shield on its own — the outer flourishes and the name
   * banner are cropped off, because below about 64px the full crest shrinks
   * to an unreadable smudge. `full` keeps the banner for large display.
   */
  variant?: "mark" | "full";
}

/**
 * Kumar's crest: quartered shield with a binary border, four guardians, and
 * the KS cipher at the centre.
 *
 * Supplied as artwork with a painted-on checkerboard; `scripts/extract_assets.py`
 * keys it to real transparency and cuts both variants plus the favicon.
 */
export function Monogram({
  size = 44,
  className,
  decorative,
  variant = "mark",
}: MonogramProps) {
  const full = variant === "full";
  const src = full
    ? "/images/brand/crest.webp"
    : "/images/brand/crest-mark.webp";

  return (
    <Image
      src={src}
      alt={decorative ? "" : "Kumar Shreyash"}
      aria-hidden={decorative || undefined}
      width={size}
      height={full ? Math.round(size * (1240 / 1234)) : size}
      sizes={`${size}px`}
      quality={88}
      className={cn("h-auto w-auto select-none", className)}
      style={{ width: size, height: "auto" }}
    />
  );
}
