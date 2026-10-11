"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Scrambled text that decrypts in place.
 *
 * Adapted from Kumar's DecryptedText for *controlled* use: the parent owns a
 * single `revealed` flag and every instance on the page animates from it, so
 * one oath can decrypt a whole section at once. The original drove itself
 * from hover/click/in-view on each instance, which cannot express that.
 *
 * Two other changes worth knowing about:
 *
 *  - The screen-reader copy is the *real* text, always. The original put the
 *    scrambled string in the sr-only span and then hid it with
 *    `visibility: hidden`, which both exposes gibberish and hides it from
 *    assistive technology — so the content was reaching nobody.
 *  - Progress is a count into a precomputed reveal order rather than a Set,
 *    and every state change happens inside the interval callback. Nothing is
 *    set synchronously from an effect, which is what React 19 warns about.
 */

export type RevealDirection = "start" | "end" | "center";

interface DecryptedTextProps {
  text: string;
  /** The parent owns this. Flipping it animates in the matching direction. */
  revealed: boolean;
  /** Milliseconds between ticks. */
  speed?: number;
  revealDirection?: RevealDirection;
  /** Alphabet used while scrambled. */
  characters?: string;
  className?: string;
  encryptedClassName?: string;
  as?: "span" | "p";
}

function computeOrder(length: number, direction: RevealDirection): number[] {
  if (length <= 0) return [];
  if (direction === "start") {
    return Array.from({ length }, (_, i) => i);
  }
  if (direction === "end") {
    return Array.from({ length }, (_, i) => length - 1 - i);
  }
  const middle = Math.floor(length / 2);
  const order: number[] = [];
  let offset = 0;
  while (order.length < length) {
    const index =
      offset % 2 === 0 ? middle + offset / 2 : middle - Math.ceil(offset / 2);
    if (index >= 0 && index < length) order.push(index);
    offset++;
  }
  return order;
}

export function DecryptedText({
  text,
  revealed,
  speed = 24,
  revealDirection = "start",
  characters = "01",
  className,
  encryptedClassName,
  as: Tag = "span",
}: DecryptedTextProps) {
  const order = useMemo(
    () => computeOrder(text.length, revealDirection),
    [text.length, revealDirection],
  );
  const alphabet = useMemo(() => characters.split(""), [characters]);

  const scramble = useCallback(
    (count: number) => {
      const shown = new Set(order.slice(0, count));
      return text
        .split("")
        .map((char, i) => {
          if (char === " " || char === "\n") return char;
          if (shown.has(i)) return char;
          return alphabet[Math.floor(Math.random() * alphabet.length)];
        })
        .join("");
    },
    [text, order, alphabet],
  );

  /*
   * The server renders the real text. It has to: `Math.random()` during a
   * prerender is both non-deterministic and rejected outright by Next's Cache
   * Components, and seeding state from it would mismatch on hydration. It also
   * means the content is there with JavaScript switched off. The first interval
   * tick scrambles it a few milliseconds later.
   */
  const [display, setDisplay] = useState(text);
  const countRef = useRef(revealed ? text.length : 0);

  useEffect(() => {
    const target = revealed ? text.length : 0;
    // Chunked, or a long paragraph would take a minute at one character a tick.
    const step = Math.max(1, Math.round(text.length / 42));

    const id = window.setInterval(() => {
      const current = countRef.current;
      if (current === target) {
        setDisplay(target >= text.length ? text : scramble(target));
        window.clearInterval(id);
        return;
      }
      const next =
        current < target
          ? Math.min(target, current + step)
          : Math.max(target, current - step);
      countRef.current = next;
      setDisplay(next >= text.length ? text : scramble(next));
    }, speed);

    return () => window.clearInterval(id);
  }, [revealed, text, speed, scramble]);

  const done = display === text;

  return (
    <Tag className="whitespace-pre-wrap">
      {/* The real text, for anyone not reading the scramble. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={cn(done ? className : encryptedClassName)}>
        {display}
      </span>
    </Tag>
  );
}
