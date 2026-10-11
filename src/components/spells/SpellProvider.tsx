"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { spells, getSpell } from "@/data/spells";
import type { SectionId } from "@/lib/types";

const SECTION_IDS: SectionId[] = [
  "home",
  "about",
  "projects",
  "skills",
  "experience",
  "achievements",
  "contact",
];

export interface CastResult {
  spellId: string;
  ok: boolean;
  message: string;
}

interface SpellContextValue {
  /** Section currently filling the viewport. */
  section: SectionId;
  /** Spells that are currently running. */
  active: string[];
  /** Increments whenever Alohomora lands, so collections can open. */
  unlockSignal: number;
  cast: (spellId: string) => void;
  lastCast: CastResult | null;
  isActive: (spellId: string) => boolean;
}

const SpellContext = createContext<SpellContextValue | null>(null);

export function useSpells() {
  const value = useContext(SpellContext);
  if (!value) throw new Error("useSpells must be used inside <SpellProvider>");
  return value;
}

const SECTION_LABEL: Record<SectionId, string> = {
  home: "the Great Hall",
  about: "the letter",
  projects: "the Spellbook",
  skills: "the hall of banners",
  experience: "the map",
  achievements: "the clippings",
  contact: "the owlery",
};

export function SpellProvider({ children }: { children: ReactNode }) {
  const [section, setSection] = useState<SectionId>("home");
  const [active, setActive] = useState<string[]>([]);
  const [unlockSignal, setUnlockSignal] = useState(0);
  const [lastCast, setLastCast] = useState<CastResult | null>(null);

  /* Which section is the reader looking at? Same middle-band observer the
     navigation uses — whichever section crosses the centre of the viewport. */
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setSection(entry.target.id as SectionId);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  /* Revelio only makes sense over the hero. Rather than clearing it in an
     effect when the reader scrolls away, its scope is derived: the spell
     stays cast, but it is only in force while the hero is on screen. */
  const effective = useMemo(
    () =>
      section === "home" ? active : active.filter((id) => id !== "revelio"),
    [section, active],
  );

  const cast = useCallback(
    (spellId: string) => {
      const spell = getSpell(spellId);
      if (!spell) return;

      if (!spell.worksOn.includes(section)) {
        setLastCast({
          spellId,
          ok: false,
          message: `${spell.name} has no effect on ${SECTION_LABEL[section]}`,
        });
        return;
      }

      // Accio is a one-shot: it moves the reader rather than staying lit.
      if (spell.id === "accio") {
        document.getElementById("contact")?.scrollIntoView({ block: "start" });
      }

      setActive((current) => {
        if (spell.id === "nox") return current.filter((id) => id !== "lumos");
        if (spell.id === "alohomora" || spell.id === "accio") return current;
        if (current.includes(spell.id)) {
          return current.filter((id) => id !== spell.id);
        }
        return [...current, spell.id];
      });

      if (spell.id === "alohomora") setUnlockSignal((n) => n + 1);

      const wasOn = active.includes(spell.id);
      setLastCast({
        spellId,
        ok: true,
        message:
          spell.id === "nox"
            ? "Nox — the lights go out"
            : spell.id === "accio"
              ? "Accio — summoning the owlery"
              : wasOn
              ? `${spell.name} lifted`
              : `${spell.name} cast`,
      });
    },
    [section, active],
  );

  const isActive = useCallback(
    (spellId: string) => effective.includes(spellId),
    [effective],
  );

  /* Lumos is a page-wide change, so it lives on the document element. */
  useEffect(() => {
    document.documentElement.classList.toggle(
      "spell-lumos",
      effective.includes("lumos"),
    );
  }, [effective]);

  const value = useMemo(
    () => ({ section, active: effective, unlockSignal, cast, lastCast, isActive }),
    [section, effective, unlockSignal, cast, lastCast, isActive],
  );

  return <SpellContext.Provider value={value}>{children}</SpellContext.Provider>;
}

export { spells };
