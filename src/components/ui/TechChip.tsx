import { cn } from "@/lib/cn";

interface TechChipProps {
  label: string;
  tone?: "dark" | "parchment";
  className?: string;
}

/**
 * A stack entry. Mono is used here because a technology name is genuine
 * technical metadata — it is the one register where the monospace face earns
 * its place on this site.
 */
export function TechChip({ label, tone = "dark", className }: TechChipProps) {
  return (
    <li
      className={cn(
        "rounded-[2px] border px-2.5 py-1 font-mono text-[0.7rem] tracking-[0.06em] whitespace-nowrap",
        tone === "dark"
          ? "border-gold/22 bg-deep-blue/40 text-parchment/85"
          : "border-ink/20 bg-parchment-deep/40 text-ink-soft",
        className,
      )}
    >
      {label}
    </li>
  );
}

interface TechListProps {
  items: string[];
  tone?: "dark" | "parchment";
  className?: string;
  label?: string;
}

export function TechList({ items, tone, className, label }: TechListProps) {
  return (
    <ul
      aria-label={label ?? "Technologies used"}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {items.map((t) => (
        <TechChip key={t} label={t} tone={tone} />
      ))}
    </ul>
  );
}
