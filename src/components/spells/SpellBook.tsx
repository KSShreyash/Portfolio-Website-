"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, X } from "lucide-react";
import { spells } from "@/data/spells";
import { useSpells, type CastResult } from "@/components/spells/SpellProvider";
import { cn } from "@/lib/cn";

/**
 * The wand.
 *
 * A round button in the bottom-right corner that opens a stacked list of
 * spells. Each one reports back whether it took hold here or fizzled, so a
 * spell that does nothing on the current section says so instead of leaving
 * the reader wondering whether they missed something.
 */
export function SpellBook() {
  const [open, setOpen] = useState(false);
  const { cast, lastCast, isActive, section } = useSpells();
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  /* The toast is derived from the most recent cast rather than copied into
     state; the only thing state tracks is which cast has already been
     dismissed, and that is set from a timer rather than during render. */
  const [dismissed, setDismissed] = useState<CastResult | null>(null);
  const toast = lastCast && lastCast !== dismissed ? lastCast : null;

  useEffect(() => {
    if (!lastCast) return;
    const timer = window.setTimeout(() => setDismissed(lastCast), 2600);
    return () => window.clearTimeout(timer);
  }, [lastCast]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const visible = spells.filter(
    (s) => !s.requiresActive || isActive(s.requiresActive),
  );

  return (
    <div className="pointer-events-none fixed right-5 bottom-5 z-50 flex flex-col items-end gap-3 sm:right-7 sm:bottom-7">
      {/* Cast result. Announced politely so it is not only a visual cue. */}
      <div role="status" aria-live="polite" className="pointer-events-none">
        <AnimatePresence>
          {toast && (
            <motion.p
              key={toast.message}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className={cn(
                "rounded-[var(--radius-panel)] border px-4 py-2 font-mono text-[0.72rem] tracking-[0.06em] backdrop-blur-md",
                toast.ok
                  ? "border-gold/45 bg-obsidian/90 text-gold-light"
                  : "border-muted/25 bg-obsidian/90 text-muted",
              )}
            >
              {toast.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={panelId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            className="pointer-events-auto flex max-h-[min(26rem,60vh)] w-60 flex-col gap-2 overflow-y-auto overscroll-contain scrollbar-none"
          >
            {visible.map((spell, i) => {
              const usable = spell.worksOn.includes(section);
              const on = isActive(spell.id);
              return (
                <motion.li
                  key={spell.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                >
                  <button
                    type="button"
                    onClick={() => cast(spell.id)}
                    aria-pressed={on}
                    className={cn(
                      "group w-full rounded-[var(--radius-panel)] border px-4 py-3 text-left backdrop-blur-md transition-colors duration-300",
                      on
                        ? "border-gold/70 bg-gold/15"
                        : "border-gold/25 bg-obsidian/88 hover:border-gold/60",
                    )}
                  >
                    <span className="flex items-baseline justify-between gap-2">
                      <span
                        className={cn(
                          "font-display text-[0.95rem] tracking-[0.1em]",
                          on ? "text-gold-light" : "text-parchment",
                        )}
                      >
                        {spell.name}
                      </span>
                      {/* Honest up front: this one will not do anything here. */}
                      {!usable && (
                        <span className="font-mono text-[0.6rem] tracking-[0.08em] text-muted/60 uppercase">
                          inert
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-[0.78rem] leading-snug text-muted">
                      {spell.effect}
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close spells" : "Open spells"}
        className={cn(
          "pointer-events-auto grid h-16 w-16 place-items-center rounded-full border text-center transition-all duration-300",
          "shadow-[0_10px_30px_-12px_rgb(0_0_0/0.9)] backdrop-blur-md",
          open
            ? "border-gold/70 bg-gold/20 text-gold-light"
            : "border-gold/40 bg-obsidian/88 text-parchment hover:border-gold/80 hover:text-gold-light",
        )}
      >
        {open ? (
          <X size={20} aria-hidden />
        ) : (
          <span className="flex flex-col items-center gap-0.5">
            <Sparkles size={16} aria-hidden className="text-gold" />
            <span className="font-display text-[0.6rem] tracking-[0.12em]">
              SPELLS
            </span>
          </span>
        )}
      </button>
    </div>
  );
}
