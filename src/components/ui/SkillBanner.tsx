"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { EmblemKind, SkillCollection } from "@/lib/types";
import { projects } from "@/data/projects";
import { cn } from "@/lib/cn";
import { useSpells } from "@/components/spells/SpellProvider";

/**
 * Original emblems, one per collection. Four marks drawn for this site — the
 * banners in the artwork behind them keep their own crests; these do not
 * borrow them.
 */
function Emblem({ kind }: { kind: EmblemKind }) {
  const s = "currentColor";
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9" fill="none" aria-hidden>
      {kind === "forge" && (
        <>
          <path d="M8 29 h24" stroke={s} strokeWidth="1.4" />
          <path d="M12 29 l4 -9 h8 l4 9" stroke={s} strokeWidth="1.2" />
          <path d="M14 15 h12 l-3 5 h-6 z" stroke={s} strokeWidth="1.2" />
          <path d="M20 8 v7" stroke={s} strokeWidth="1.2" />
        </>
      )}
      {kind === "thinkery" && (
        <>
          <circle cx="20" cy="20" r="4" stroke={s} strokeWidth="1.3" />
          <ellipse cx="20" cy="20" rx="13" ry="6.5" stroke={s} strokeWidth="1.1" />
          <ellipse
            cx="20"
            cy="20"
            rx="13"
            ry="6.5"
            stroke={s}
            strokeWidth="1.1"
            transform="rotate(60 20 20)"
          />
          <ellipse
            cx="20"
            cy="20"
            rx="13"
            ry="6.5"
            stroke={s}
            strokeWidth="1.1"
            transform="rotate(120 20 20)"
          />
        </>
      )}
      {kind === "observatory" && (
        <>
          <path d="M9 30 L28 12" stroke={s} strokeWidth="1.4" />
          <path d="M24 8 l8 8 -5 5 -8 -8 z" stroke={s} strokeWidth="1.2" />
          <path d="M7 32 l5 -3" stroke={s} strokeWidth="1.2" />
          <path d="M12 12 l1.4 3.2 3.2 1.4 -3.2 1.4 -1.4 3.2 -1.4 -3.2 -3.2 -1.4 3.2 -1.4 z" fill={s} />
        </>
      )}
      {kind === "archives" && (
        <>
          <rect x="9" y="10" width="7" height="21" rx="1" stroke={s} strokeWidth="1.2" />
          <rect x="18" y="10" width="7" height="21" rx="1" stroke={s} strokeWidth="1.2" />
          <path
            d="M27.5 12.5 l5.5 1.5 -4.5 17 -5.5 -1.5 z"
            stroke={s}
            strokeWidth="1.2"
          />
          <path d="M9 17 h7 M18 17 h7" stroke={s} strokeWidth="1" />
        </>
      )}
    </svg>
  );
}

function Chips({ items, muted }: { items: string[]; muted?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <li
          key={t}
          className={cn(
            "rounded-[2px] border px-2 py-0.5 font-mono text-[0.68rem] tracking-[0.04em]",
            muted
              ? "border-gold/14 bg-obsidian/40 text-muted"
              : "border-gold/22 bg-obsidian/55 text-parchment/90",
          )}
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

export function SkillBanner({ collection }: { collection: SkillCollection }) {
  const panelId = useId();
  const { unlockSignal } = useSpells();

  /* Alohomora opens every collection at once. The open state is derived from
     the spell signal rather than copied into state by an effect: the reader
     can still close a collection afterwards, which records the signal it was
     closed against so the next cast opens it again. */
  const [openedByHand, setOpenedByHand] = useState(false);
  const [closedAtSignal, setClosedAtSignal] = useState(0);
  const open = openedByHand || (unlockSignal > 0 && unlockSignal !== closedAtSignal);

  const toggle = () => {
    if (open) {
      setOpenedByHand(false);
      setClosedAtSignal(unlockSignal);
    } else {
      setOpenedByHand(true);
    }
  };

  const related = projects.filter((p) =>
    collection.relatedProjectSlugs.includes(p.slug),
  );

  return (
    <div
      className={cn(
        "group relative flex flex-col pb-10 text-center transition-transform duration-500",
        "motion-safe:hover:-translate-y-1",
      )}
      style={{
        // A hanging pennant, not a card: the field tapers to a point.
        clipPath: "polygon(0 0, 100% 0, 100% 88%, 50% 100%, 0 88%)",
        background: `linear-gradient(to bottom, color-mix(in srgb, ${collection.accent} 55%, var(--color-midnight)) 0%, color-mix(in srgb, ${collection.accent} 22%, var(--color-obsidian)) 62%, var(--color-obsidian) 100%)`,
      }}
    >
      {/* The cord the banner hangs from. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gold/45"
      />

      <div className="px-6 pt-8">
        <span className="inline-flex text-gold-light">
          <Emblem kind={collection.emblem} />
        </span>

        <h3 className="mt-4 font-display text-[1.1875rem] tracking-[0.1em] text-parchment">
          {collection.name}
        </h3>

        <p className="mx-auto mt-3 max-w-[22ch] text-[0.875rem] leading-relaxed text-muted">
          {collection.tagline}
        </p>

        <div className="mt-6 flex justify-center">
          <Chips items={collection.primary} />
        </div>

        {/* Desktop detail. On small screens everything is rendered below. */}
        <div className="hidden sm:block">
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls={panelId}
            className="mt-6 inline-flex items-center gap-1.5 font-mono text-[0.68rem] tracking-[0.08em] text-gold uppercase transition-colors hover:text-gold-light"
          >
            <Plus
              size={13}
              aria-hidden
              className={cn(
                "transition-transform duration-300",
                open && "rotate-45",
              )}
            />
            {open ? "Less" : "More"}
          </button>

          <div
            id={panelId}
            hidden={!open}
            className="mt-5 border-t border-gold/15 pt-5"
          >
            <Chips items={collection.more} muted />
            {related.length > 0 && (
              <p className="mt-4 text-[0.75rem] leading-relaxed text-muted">
                Used in{" "}
                {related.map((p, i) => (
                  <span key={p.slug}>
                    {i > 0 && ", "}
                    {p.caseStudy ? (
                      <Link
                        href={`/projects/${p.slug}`}
                        className="text-gold-light underline underline-offset-2 hover:text-warm-white"
                      >
                        {p.title}
                      </Link>
                    ) : (
                      <span className="text-parchment/80">{p.title}</span>
                    )}
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>

        {/* Mobile: no fold, no button, everything visible. */}
        <div className="mt-5 border-t border-gold/15 pt-5 sm:hidden">
          <Chips items={collection.more} muted />
        </div>
      </div>
    </div>
  );
}
