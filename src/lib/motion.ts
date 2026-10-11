"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribe to a media query.
 *
 * `useSyncExternalStore` is the right tool here: a media query is an external
 * store, and this gets the server snapshot right without a setState-in-effect
 * round trip. The server always reports `false`, so the first client render
 * matches the server and then corrects itself immediately.
 */
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * True when the reader has asked for less motion.
 *
 * Every animation in this project checks this before running and applies its
 * own finished state instead, so nothing is left half-drawn.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** True on devices with a precise pointer. Gates the hero's pointer parallax. */
export function usePrecisePointer(): boolean {
  return useMediaQuery("(pointer: fine)");
}
