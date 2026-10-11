"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/cn";

interface Particle {
  x: number;
  y: number;
  r: number;
  drift: number;
  rise: number;
  phase: number;
  alpha: number;
  warm: boolean;
}

interface ParticleFieldProps {
  className?: string;
  /** Particle count on a wide screen. Halved below 768px. */
  density?: number;
}

/**
 * Drifting motes of light.
 *
 * One canvas, at most `density` particles, and no DOM nodes — a few hundred
 * absolutely positioned divs is the usual way this is done and it is the usual
 * reason these pages stutter.
 *
 * The loop stops entirely when the hero scrolls out of view or the tab is
 * hidden, and never starts at all under reduced motion.
 */
export function ParticleField({ className, density = 56 }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let running = false;
    let last = performance.now();

    const count = () =>
      window.innerWidth < 768 ? Math.round(density * 0.42) : density;

    const seed = () => {
      particles = Array.from({ length: count() }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.5 + Math.random() * 1.5,
        drift: (Math.random() - 0.5) * 5,
        rise: 5 + Math.random() * 13,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.18 + Math.random() * 0.45,
        warm: Math.random() > 0.38,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.y -= p.rise * dt;
        p.phase += dt * 0.5;
        p.x += Math.sin(p.phase) * p.drift * dt;

        if (p.y < -6) {
          p.y = height + 6;
          p.x = Math.random() * width;
        }

        const twinkle = 0.72 + Math.sin(p.phase * 1.7) * 0.28;
        ctx.globalAlpha = p.alpha * twinkle;
        ctx.fillStyle = p.warm ? "#E5C58B" : "#D7E3F2";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(draw);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    resize();

    const onResize = () => resize();
    const onVisibility = () => (document.hidden ? stop() : start());

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    // Stop drawing the moment the hero leaves the screen.
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    observer.observe(canvas);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced, density]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      data-hero-particles
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10", className)}
    />
  );
}
