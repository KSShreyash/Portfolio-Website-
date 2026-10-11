import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost";

interface Base {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

type AsLink = Base & { href: string } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "href" | "className"
  >;

type AsButton = Base & { href?: undefined } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "className"
  >;

/**
 * Links navigate, buttons act. Passing `href` gives you an anchor; omitting it
 * gives you a button. There is no third option, because there is no third kind
 * of thing a person can click.
 *
 * Gold here behaves as light, not as trim: the resting state is a hairline, and
 * hovering raises the glow rather than repainting the element.
 */
const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-panel)] " +
  "px-7 py-3 text-[0.9375rem] font-medium tracking-[0.02em] " +
  "transition-[color,background-color,border-color,box-shadow,transform] duration-300 " +
  "motion-safe:hover:-translate-y-px";

const variants: Record<Variant, string> = {
  primary: cn(
    "border border-gold/55 bg-gold/12 text-warm-white",
    "shadow-[0_0_0_0_transparent]",
    "hover:border-gold hover:bg-gold/20 hover:text-gold-light",
    "hover:shadow-[0_0_28px_-6px_color-mix(in_srgb,var(--color-gold)_55%,transparent)]",
  ),
  ghost: cn(
    "border border-parchment/25 text-parchment",
    "hover:border-gold/80 hover:text-gold-light",
    "hover:shadow-[0_0_22px_-10px_color-mix(in_srgb,var(--color-gold)_60%,transparent)]",
  ),
};

export function MagicalButton(props: AsLink | AsButton) {
  const { variant = "primary", className, children, ...rest } = props;
  const classes = cn(base, variants[variant], className);

  if (typeof rest.href === "string") {
    const { href, ...anchor } = rest as AsLink;
    return (
      <a href={href} className={classes} {...anchor}>
        {children}
      </a>
    );
  }

  const { ...button } = rest as AsButton;
  return (
    <button className={classes} {...button}>
      {children}
    </button>
  );
}
