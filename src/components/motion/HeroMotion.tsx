"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ParticleField } from "@/components/motion/ParticleField";
import { useReducedMotion, usePrecisePointer } from "@/lib/motion";

/**
 * The one page-load timeline on this site.
 *
 * Nothing else animates on load — a single orchestrated moment reads as
 * intent, where a fade-and-rise on every section reads as a template.
 *
 * Two separate effects on purpose. The entrance has an empty dependency list
 * so it runs exactly once: media-query hooks report their server value during
 * hydration and their real value immediately after, and a dependency on either
 * one makes useGSAP revert and replay the whole entrance mid-flight. The
 * reduced-motion check is therefore read straight from matchMedia here rather
 * than through the hook.
 *
 * The hero markup is fully visible before any of this runs, and `gsap.from()`
 * supplies its own starting state, so if this component never mounts the hero
 * is simply there, finished, with no empty frames.
 */
export function HeroMotion() {
  const scope = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const precisePointer = usePrecisePointer();

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const hero = document.querySelector<HTMLElement>("[data-hero]");
      if (!hero) return;
      const q = gsap.utils.selector(hero);

      // Built paused: `from()` applies the start state straight away, so the
      // hero sits hidden behind the loading screen instead of playing its
      // entrance where nobody can see it.
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out", duration: 0.8 },
      });

      tl.from(q("[data-hero-bg]"), { scale: 1.07, duration: 2.1, ease: "power2.out" }, 0)
        .from(q("[data-hero-fog]"), { opacity: 0, duration: 1.3 }, 0.1)
        .from(q("[data-hero-particles]"), { opacity: 0, duration: 1.6 }, 0.35)
        .from(q("[data-hero-eyebrow]"), { opacity: 0, y: 14 }, 0.45)
        .from(
          q("[data-hero-title-inner]"),
          { yPercent: 112, duration: 1.1, ease: "power4.out" },
          0.55,
        )
        .from(q("[data-hero-rule]"), { scaleX: 0, duration: 0.9 }, 1.0)
        .from(q("[data-hero-support]"), { opacity: 0, y: 16 }, 1.1)
        .from(q("[data-hero-body]"), { opacity: 0, y: 16 }, 1.25)
        .from(q("[data-hero-actions]"), { opacity: 0, y: 16 }, 1.4)
        .from(q("[data-hero-cue]"), { opacity: 0, duration: 0.9 }, 1.7);

      if (document.documentElement.dataset.splash !== "running") {
        tl.play();
        return;
      }

      const start = () => tl.play();
      window.addEventListener("splash:done", start, { once: true });
      return () => window.removeEventListener("splash:done", start);
    },
    { scope, dependencies: [] },
  );

  /* Pointer parallax. A few pixels, on the painted layers only — the text
     never moves, because moving the text is the fastest way to make a hero
     unreadable. */
  useGSAP(
    () => {
      if (reduced || !precisePointer) return;

      const hero = document.querySelector<HTMLElement>("[data-hero]");
      const bg = hero?.querySelector<HTMLElement>("[data-hero-bg]");
      const fog = hero?.querySelector<HTMLElement>("[data-hero-fog]");
      if (!bg || !fog) return;

      const bgX = gsap.quickTo(bg, "x", { duration: 0.9, ease: "power2.out" });
      const bgY = gsap.quickTo(bg, "y", { duration: 0.9, ease: "power2.out" });
      const fogX = gsap.quickTo(fog, "x", { duration: 1.2, ease: "power2.out" });

      const onMove = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        bgX(nx * -12);
        bgY(ny * -8);
        fogX(nx * 4);
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope, dependencies: [reduced, precisePointer] },
  );

  return (
    <div ref={scope} className="pointer-events-none absolute inset-0 -z-10">
      <ParticleField />
    </div>
  );
}
