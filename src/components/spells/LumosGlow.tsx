"use client";

import { useEffect, useRef } from "react";
import { useSpells } from "@/components/spells/SpellProvider";
import { useReducedMotion } from "@/lib/motion";

/**
 * Lumos.
 *
 * A wandlight that follows the cursor. Position is written straight to CSS
 * custom properties inside a rAF, so the pointer handler never triggers a
 * React render — a glow that re-rendered the page on every mouse move would
 * be the single most expensive thing on the site.
 */
export function LumosGlow() {
  const { isActive } = useSpells();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const on = isActive("lumos");

  useEffect(() => {
    if (!on) return;
    const el = ref.current;
    if (!el) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let frame = 0;
    let queued = false;

    const paint = () => {
      queued = false;
      el.style.setProperty("--lumos-x", `${x}px`);
      el.style.setProperty("--lumos-y", `${y}px`);
    };

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (queued) return;
      queued = true;
      frame = requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [on]);

  if (!on) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="lumos-glow pointer-events-none fixed inset-0 z-40"
      data-reduced={reduced ? "true" : undefined}
    />
  );
}
