"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The portal.
 *
 * A four-second loading screen on every visit: parchment, drifting keywords,
 * one of three quotes at random, a glow as the spell takes, then a zoom
 * through the page into the site.
 *
 * Three things make this safe rather than a trap:
 *
 *  - The whole sequence is CSS, ending in `visibility: hidden` with
 *    `animation-fill-mode: forwards`. If JavaScript never runs the overlay
 *    still clears itself — a JS-driven dismissal would leave visitors
 *    staring at a parchment forever.
 *  - It is `aria-hidden`, and the real page is in the DOM underneath the
 *    whole time, so screen readers and crawlers never see a loading screen.
 *  - Any key, any click, dismisses it immediately.
 *
 * The quote is chosen after mount because the page is statically prerendered:
 * a server-side pick would bake one quote into the HTML at build time and
 * show the same one to everybody forever.
 */

const QUOTES = [
  "Say the right words in the right order, and the world obeys. Wizards call it a spell. We call it code.",
  "Code is the only magic that works in the Muggle world.",
  "Magic is just code you haven't read yet.",
];

export const SPLASH_MS = 4000;
const REDUCED_MS = 1200;

export function SplashScreen() {
  const [gone, setGone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? REDUCED_MS : SPLASH_MS;

    // The flag itself is set by the pre-paint script in the root layout.
    const root = document.documentElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      delete root.dataset.splash;
      document.body.style.overflow = previousOverflow;
      window.dispatchEvent(new Event("splash:done"));
      setGone(true);
    };

    // Skipping is a dismissal, not a fast-forward: drop it and move on.
    const skip = () => {
      rootRef.current?.classList.add("splash-skip");
      finish();
    };

    const timer = window.setTimeout(finish, duration + 150);
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      if (!done) {
        delete root.dataset.splash;
        document.body.style.overflow = previousOverflow;
      }
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={rootRef} className="splash" aria-hidden="true">
      <div className="splash-parchment" />
      <div className="splash-spells" />
      {/* The parchment dims as the spell charges, so the words can ignite
          against something — gold light on bright paper reads as washed out,
          not as a glow. It also hands over to the dark site cleanly. */}
      <div className="splash-dim" />
      <div className="splash-vignette" />

      <div className="splash-centre">
        <div className="splash-glow" />
          {/*
          All three are rendered and CSS shows the one the pre-paint script
          picked. Choosing in React instead would mean either a quote baked
          into the static HTML at build time, or a hydration mismatch — and
          `suppressHydrationWarning` does not help, because for text content
          it tells React to keep what the server sent rather than to patch it.
        */}
        {QUOTES.map((line, i) => (
          <p key={i} className="splash-quote" data-q={i}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
