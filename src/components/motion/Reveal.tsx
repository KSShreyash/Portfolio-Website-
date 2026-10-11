"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface RevealProps {
  children: ReactNode;
  /** Element to render. Defaults to a div. */
  as?: ElementType;
  className?: string;
  /** Milliseconds to hold before showing, for staggering siblings. */
  delay?: number;
}

/**
 * A scroll reveal that cannot swallow its own content.
 *
 * The element is always visible in server HTML. It is hidden only by the CSS
 * rule `.motion-ready [data-reveal]:not([data-revealed])`, and `.motion-ready`
 * is added by a pre-paint script in the document head that refuses to run when
 * the reader prefers reduced motion. So:
 *
 *   no JS          → class never added  → content visible
 *   reduced motion → class never added  → content visible
 *   normal         → class added before first paint → no flash, then reveals
 *
 * Uses IntersectionObserver rather than GSAP: this is one threshold crossing,
 * and the scroll library is reserved for the hero timeline and the map route.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If the pre-paint script did not run, nothing was ever hidden.
    if (!document.documentElement.classList.contains("motion-ready")) return;

    let timer: number | undefined;
    const show = () => {
      timer = window.setTimeout(
        () => el.setAttribute("data-revealed", ""),
        delay,
      );
    };

    if (!("IntersectionObserver" in window)) {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show();
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, [delay]);

  return (
    <Tag ref={ref} data-reveal className={cn(className)}>
      {children}
    </Tag>
  );
}
