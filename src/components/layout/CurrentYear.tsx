"use client";

import { useSyncExternalStore } from "react";

/** The clock never changes during a page view, so there is nothing to subscribe to. */
const noop = () => () => {};

/**
 * The copyright year, read in the reader's browser.
 *
 * Next's Cache Components refuses `new Date()` during a prerender — correctly,
 * because a prerendered page would freeze whatever year it was built in. The
 * server snapshot is therefore `null` and the browser fills the year in, which
 * is the same external-store pattern used for media queries in src/lib/motion.
 */
export function CurrentYear() {
  const year = useSyncExternalStore(
    noop,
    () => new Date().getFullYear(),
    () => null,
  );

  return <span suppressHydrationWarning>{year ?? ""}</span>;
}
