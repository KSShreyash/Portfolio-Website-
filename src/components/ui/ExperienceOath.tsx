"use client";

import { useState } from "react";
import type { ExperienceEntry } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Folio } from "@/components/ui/Ornament";
import { Reveal } from "@/components/motion/Reveal";
import { DecryptedText } from "@/components/spells/DecryptedText";

/**
 * The oath.
 *
 * The map keeps its own counsel: the prose on every card starts as ones and
 * zeroes, and swearing the oath decrypts the lot. Saying "Mischief managed"
 * puts it back.
 *
 * NOTE: the section starts encrypted because that is the effect Kumar asked
 * for. The real text is always present for screen readers and crawlers, but a
 * recruiter skimming visually will see binary until they press the button. To
 * ship it decrypted by default and keep the button as a toy, change the
 * initial value below to `true`.
 */
const STARTS_SWORN = false;

const KIND_LABEL: Record<ExperienceEntry["kind"], string> = {
  work: "Work",
  education: "Education",
  leadership: "Leadership",
};

export function ExperienceOath({ entries }: { entries: ExperienceEntry[] }) {
  const [sworn, setSworn] = useState(STARTS_SWORN);

  return (
    <>
      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={() => setSworn((v) => !v)}
          aria-pressed={sworn}
          className={cn(
            "group rounded-[var(--radius-paper)] border px-6 py-3 text-center transition-colors duration-300",
            sworn
              ? "border-ink/45 bg-parchment-deep/50 text-ink"
              : "border-ink/25 bg-parchment/60 text-ink-soft hover:border-ink/55 hover:text-ink",
          )}
        >
          <span className="block font-editorial text-[1.0625rem] italic">
            {sworn
              ? "Mischief managed."
              : "I solemnly swear that I am up to no good."}
          </span>
          <span className="mt-0.5 block font-mono text-[0.62rem] tracking-[0.1em] text-ink-soft/70 uppercase">
            {sworn ? "seal the map" : "read the map"}
          </span>
        </button>
      </div>

      <ol className="mt-8 grid gap-5 lg:grid-cols-4 lg:gap-4">
        {entries.map((entry, i) => (
          <Reveal key={entry.id} as="li" delay={i * 90}>
            <article className="flex h-full flex-col rounded-[var(--radius-paper)] border border-ink/18 bg-parchment/80 p-6 shadow-[0_14px_34px_-26px_rgb(0_0_0/0.8)] backdrop-blur-[2px]">
              <div className="flex items-center justify-between gap-3">
                <Folio n={i + 1} tone="parchment" />
                <span className="font-mono text-[0.65rem] tracking-[0.1em] text-ink-soft/70 uppercase">
                  {KIND_LABEL[entry.kind]}
                </span>
              </div>

              <h3 className="mt-4 font-display text-[1.0625rem] leading-snug tracking-[0.05em] text-ink">
                {entry.organisation}
              </h3>

              <p className="mt-1.5 font-editorial text-[1.0625rem] text-ink-soft italic">
                {entry.role}
              </p>

              <p className="mt-3 font-mono text-[0.68rem] tracking-[0.06em] text-ink-soft/80">
                {entry.dateRange}
              </p>
              <p className="mt-1 text-[0.8125rem] text-ink-soft/80">
                {entry.location}
              </p>

              <hr className="my-4 border-0 border-t border-ink/15" />

              <DecryptedText
                as="p"
                text={entry.summary}
                revealed={sworn}
                revealDirection="start"
                className="text-[0.875rem] leading-relaxed text-ink-soft"
                encryptedClassName="font-mono text-[0.8125rem] leading-relaxed text-ink-soft/55"
              />

              <ul className="mt-4 space-y-2.5">
                {entry.responsibilities.map((item) => (
                  <li
                    key={item}
                    className="relative pl-4 before:absolute before:top-[0.62em] before:left-0 before:h-1 before:w-1 before:rounded-full before:bg-ink/45"
                  >
                    <DecryptedText
                      text={item}
                      revealed={sworn}
                      revealDirection="start"
                      className="text-[0.8125rem] leading-relaxed text-ink-soft/90"
                      encryptedClassName="font-mono text-[0.75rem] leading-relaxed text-ink-soft/45"
                    />
                  </li>
                ))}
              </ul>

              <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
                {entry.technologies.map((t) => (
                  <li
                    key={t}
                    className="rounded-[2px] border border-ink/20 px-2 py-0.5 font-mono text-[0.65rem] text-ink-soft"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </ol>
    </>
  );
}
