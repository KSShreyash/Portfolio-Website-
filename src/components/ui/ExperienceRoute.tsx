"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { ExperienceEntry } from "@/lib/types";
import { roman } from "@/components/ui/Ornament";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The route.
 *
 * This is the section's layout, not an ornament: the path threads the real
 * entries and the markers sit on it in chronological order, which is why
 * numbering is appropriate here and nowhere else except the Spellbook.
 *
 * Horizontal above 1024px, vertical below. The drawing animation runs once;
 * when motion is reduced the path is simply rendered complete, which is the
 * state the CSS already describes.
 */
export function ExperienceRoute({
  entries,
  className,
}: {
  entries: ExperienceEntry[];
  className?: string;
}) {
  const scope = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const svg = scope.current;
      if (!svg) return;

      const path = svg.querySelector<SVGPathElement>("[data-route-path]");
      const markers = svg.querySelectorAll<SVGGElement>("[data-route-marker]");
      if (!path) return;

      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      gsap.set(markers, { opacity: 0, scale: 0.6, transformOrigin: "center" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: svg,
          start: "top 78%",
          once: true,
        },
      });

      tl.to(path, { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" })
        .to(
          markers,
          { opacity: 1, scale: 1, duration: 0.45, stagger: 0.14, ease: "back.out(2)" },
          "-=0.9",
        );
    },
    { scope },
  );

  const count = entries.length;
  const W = 1000;
  const H = 120;
  const pad = 70;
  const step = (W - pad * 2) / (count - 1);
  const xs = entries.map((_, i) => pad + i * step);
  // A hand-drawn route wanders. Alternate the control points so it reads as
  // ink on paper rather than a progress bar.
  const d = xs
    .map((x, i) =>
      i === 0
        ? `M ${x} ${H / 2}`
        : `Q ${(xs[i - 1] + x) / 2} ${H / 2 + (i % 2 === 0 ? 26 : -26)} ${x} ${H / 2}`,
    )
    .join(" ");

  return (
    <svg
      ref={scope}
      viewBox={`0 0 ${W} ${H}`}
      className={cn("w-full", className)}
      fill="none"
      role="img"
      aria-label={`Route through ${count} milestones, most recent first`}
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        data-route-path
        d={d}
        stroke="color-mix(in srgb, var(--color-ink) 55%, transparent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 7"
      />
      {xs.map((x, i) => (
        <g key={entries[i].id} data-route-marker>
          <circle
            cx={x}
            cy={H / 2}
            r="15"
            fill="var(--color-parchment)"
            stroke="color-mix(in srgb, var(--color-ink) 62%, transparent)"
            strokeWidth="1.6"
          />
          <text
            x={x}
            y={H / 2 + 4.5}
            textAnchor="middle"
            fill="var(--color-ink)"
            fontFamily="var(--font-mono), monospace"
            fontSize="11"
          >
            {roman(i + 1)}
          </text>
        </g>
      ))}
    </svg>
  );
}
