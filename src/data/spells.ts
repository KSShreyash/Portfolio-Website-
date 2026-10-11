import type { SectionId } from "@/lib/types";

export interface Spell {
  id: string;
  name: string;
  /** What it does, in plain language. */
  effect: string;
  /** Sections this spell has an effect on. Everywhere else it fizzles. */
  worksOn: SectionId[];
  /** A spell that undoes another one is only offered while that one is up. */
  requiresActive?: string;
}

/**
 * The spellbook.
 *
 * `worksOn` is the whole gating mechanism: cast a spell on a section that is
 * not in its list and it fizzles with a message rather than doing nothing
 * silently. Adding an effect later means adding the section id here and
 * handling the spell in SpellProvider.
 */
export const spells: Spell[] = [
  {
    id: "revelio",
    name: "Revelio",
    effect: "Uncover what the page is hiding",
    worksOn: ["home"],
  },
  {
    id: "lumos",
    name: "Lumos",
    effect: "Raise the lights",
    worksOn: [
      "home",
      "about",
      "projects",
      "skills",
      "experience",
      "achievements",
      "contact",
    ],
  },
  {
    id: "nox",
    name: "Nox",
    effect: "Put them out again",
    worksOn: [
      "home",
      "about",
      "projects",
      "skills",
      "experience",
      "achievements",
      "contact",
    ],
    requiresActive: "lumos",
  },
  {
    id: "accio",
    name: "Accio",
    effect: "Summon the owlery — jump straight to contact",
    worksOn: [
      "home",
      "about",
      "projects",
      "skills",
      "experience",
      "achievements",
      "contact",
    ],
  },
  {
    id: "alohomora",
    name: "Alohomora",
    effect: "Open every collection at once",
    worksOn: ["skills"],
  },
];

export const getSpell = (id: string) => spells.find((s) => s.id === id);
