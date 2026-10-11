"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { siteConfig } from "@/config/site";
import { aboutSubsections } from "@/data/about";
import { BLUR } from "@/lib/blur";
import { useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { Monogram } from "@/components/ui/Monogram";
import { Corner } from "@/components/ui/Ornament";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The Acceptance Letter.
 *
 * A parchment sheet tipped into a dark book: the section stays midnight, the
 * letter is the only lit thing on it. Body copy is sepia ink, because obsidian
 * on parchment reads cold and wrong for the material.
 *
 * "Open My Letter" is an enhancement, never a gate. Below 1024px, and whenever
 * motion is reduced, the subsections render expanded with no button at all —
 * nothing a reader needs is ever behind an interaction.
 */
export function AboutSection() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const reduced = useReducedMotion();

  return (
    <section id="about" className="relative isolate overflow-hidden">
      {/* Castle dark dissolving into warm paper: the Home → About transition. */}
      <div
        className="backdrop-layer -z-10"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-obsidian) 0%, var(--color-midnight) 38%, var(--color-midnight) 62%, var(--color-obsidian) 100%)",
        }}
      />

      <div className="folio section-pad relative z-10">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-16">
          {/* No invented portrait. A struck medallion instead. */}
          <Reveal className="mx-auto w-full max-w-xs lg:sticky lg:top-32 lg:mx-0">
            <div className="relative flex aspect-square items-center justify-center rounded-[var(--radius-panel)] border border-gold/20 bg-deep-blue/35">
              <div
                className="absolute inset-0 rounded-[var(--radius-panel)]"
                style={{
                  background:
                    "radial-gradient(70% 70% at 50% 35%, color-mix(in srgb, var(--color-gold) 13%, transparent) 0%, transparent 70%)",
                }}
              />
              <Monogram size={210} variant="full" decorative className="relative" />
              <span className="meta absolute bottom-6 text-muted/70">
                {siteConfig.location}
              </span>
            </div>
          </Reveal>

          <Reveal>
            <article className="sheet-parchment relative overflow-hidden px-7 py-10 sm:px-12 sm:py-14">
              {/* The letter's own artwork — owl, envelope and castle sketch —
                  sits inside the sheet at low strength as the paper's texture. */}
              <Image
                src="/images/portfolio/acceptance-letter.webp"
                alt=""
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                placeholder="blur"
                blurDataURL={BLUR.acceptanceLetter}
                className="pointer-events-none object-cover object-center"
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(104deg, color-mix(in srgb, var(--color-parchment) 58%, transparent) 0%, color-mix(in srgb, var(--color-parchment) 74%, transparent) 38%, color-mix(in srgb, var(--color-parchment) 78%, transparent) 100%)",
                }}
              />

              <Corner tone="parchment" className="absolute top-4 left-4 z-10" />

              <div className="relative z-10">
              <p className="meta text-ink-soft">A letter</p>

              <h2 className="mt-4 text-display-lg text-ink">
                The Story Behind the Code
              </h2>

              <hr className="mt-6 w-40 border-0 border-t border-ink/25" />

              <p className="mt-8 font-editorial text-[1.375rem] leading-snug text-ink">
                Hello, I&rsquo;m Kumar Shreyash.
              </p>

              {/* Drop cap: one piece of letterpress, used once. */}
              <p className="measure-serif mt-4 text-ink-soft">
                I&rsquo;m an engineering student and software developer
                interested in AI, intelligent agents, backend systems, and
                building useful digital products.
              </p>

              {/* Desktop keeps the fold; everything smaller is always open. */}
              <div className="mt-8 hidden lg:block">
                {!reduced && (
                  <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="inline-flex items-center gap-2 border-b border-ink/30 pb-1 font-mono text-[0.75rem] tracking-[0.08em] text-ink-soft uppercase transition-colors hover:border-ink/70 hover:text-ink"
                  >
                    {open ? "Fold the letter" : "Open My Letter"}
                    <ChevronDown
                      size={14}
                      aria-hidden
                      className={cn(
                        "transition-transform duration-300",
                        open && "rotate-180",
                      )}
                    />
                  </button>
                )}
              </div>

              <AnimatePresence initial={false}>
                {(open || reduced) && (
                  <motion.div
                    id={panelId}
                    key="letter-body"
                    initial={reduced ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
                    className="hidden overflow-hidden lg:block"
                  >
                    <Subsections />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Always-open copy for everything below the desktop breakpoint. */}
              <div className="lg:hidden">
                <Subsections />
              </div>

              <div className="mt-12 flex items-center gap-4">
                <span
                  aria-hidden
                  className="grid h-11 w-11 place-items-center rounded-full bg-seal font-display text-[0.8rem] text-parchment/90 shadow-[inset_0_2px_6px_rgb(0_0_0/0.35)]"
                >
                  KS
                </span>
                <span className="font-editorial text-[1.0625rem] text-ink-soft italic">
                  {siteConfig.name}
                </span>
              </div>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Subsections() {
  return (
    <dl className="mt-10 space-y-8 border-t border-ink/15 pt-8">
      {aboutSubsections.map((item) => (
        <div key={item.title}>
          <dt className="font-display text-[0.95rem] tracking-[0.14em] text-ink uppercase">
            {item.title}
          </dt>
          <dd className="measure-serif mt-2.5 text-ink-soft">{item.body}</dd>
        </div>
      ))}
    </dl>
  );
}
