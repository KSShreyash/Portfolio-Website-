import { cn } from "@/lib/cn";

const ROMAN = [
  "",
  "i",
  "ii",
  "iii",
  "iv",
  "v",
  "vi",
  "vii",
  "viii",
  "ix",
  "x",
];

/** Lowercase roman numeral, the way a folio is numbered. */
export function roman(n: number): string {
  return ROMAN[n] ?? String(n);
}

interface FolioProps {
  n: number;
  tone?: "dark" | "parchment";
  className?: string;
}

/**
 * A folio number.
 *
 * Only used on Projects and Experience, because those are the only two
 * sequences on this site. Numbering things that are not a sequence is
 * decoration pretending to be structure.
 */
export function Folio({ n, tone = "dark", className }: FolioProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex items-baseline gap-1.5 font-mono text-[0.7rem] tracking-[0.18em]",
        tone === "dark" ? "text-gold/75" : "text-ink-soft/70",
        className,
      )}
    >
      <span className="text-[0.8em] opacity-70">&#10087;</span>
      {roman(n)}.
    </span>
  );
}

interface CornerProps {
  className?: string;
  tone?: "dark" | "parchment";
}

/** A single engraved corner, used at the head of parchment documents. */
export function Corner({ className, tone = "dark" }: CornerProps) {
  const stroke =
    tone === "dark"
      ? "color-mix(in srgb, var(--color-gold) 55%, transparent)"
      : "color-mix(in srgb, var(--color-ink) 35%, transparent)";
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("h-10 w-10", className)}
      fill="none"
      aria-hidden
    >
      <path d="M2 46 L2 10 C2 5.6 5.6 2 10 2 L46 2" stroke={stroke} strokeWidth="1" />
      <path d="M8 46 L8 14 C8 10.7 10.7 8 14 8 L46 8" stroke={stroke} strokeWidth="0.6" opacity="0.6" />
      <circle cx="14" cy="14" r="1.8" fill={stroke} />
    </svg>
  );
}
