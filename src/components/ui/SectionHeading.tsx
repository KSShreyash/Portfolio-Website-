import { cn } from "@/lib/cn";
import { Reveal } from "@/components/motion/Reveal";

interface SectionHeadingProps {
  /** Small label above the title. Rendered verbatim — the brief fixes these. */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** `parchment` flips the type to sepia ink for sections set on paper. */
  tone?: "dark" | "parchment";
  align?: "left" | "center";
  className?: string;
  headingId?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  tone = "dark",
  align = "left",
  className,
  headingId,
}: SectionHeadingProps) {
  const onPaper = tone === "parchment";

  return (
    <Reveal
      className={cn(
        "flex flex-col",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "meta mb-4",
            onPaper && "text-ink-soft",
          )}
        >
          {eyebrow}
        </span>
      )}

      <h2
        id={headingId}
        className={cn(
          "text-display-lg",
          onPaper ? "text-ink" : "text-parchment",
        )}
      >
        {title}
      </h2>

      {/* The one hairline. Gold marks what is lit, so the heading gets a
          single rule beneath it rather than a box around it. */}
      <hr
        className={cn(
          "rule-gold mt-5 w-full max-w-[14rem]",
          align === "center" && "mx-auto",
        )}
      />

      {subtitle && (
        <p
          className={cn(
            "measure mt-6 text-[1.0625rem] leading-relaxed",
            onPaper ? "text-ink-soft" : "text-muted",
            align === "center" && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
