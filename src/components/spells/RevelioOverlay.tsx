"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { useSpells } from "@/components/spells/SpellProvider";
import { useReducedMotion } from "@/lib/motion";

// WebGL and two shader programs are a lot to ship for a spell nobody may
// cast, so the reveal is only fetched once Revelio is actually used.
const HalftoneReveal = dynamic(
  () => import("@/components/spells/HalftoneReveal"),
  { ssr: false },
);

/**
 * Revelio.
 *
 * The scroll already sits in the hero, one layer behind the castle, where it
 * is completely hidden. This overlay paints it back in wherever the cursor
 * has passed: transparent everywhere else, so the hero reads normally until
 * the reader goes looking.
 */
export function RevelioOverlay() {
  const { isActive } = useSpells();
  const reduced = useReducedMotion();
  const on = isActive("revelio");

  return (
    <AnimatePresence>
      {on && (
        <motion.div
          key="revelio"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.5 }}
          className="pointer-events-none absolute inset-0 z-[5]"
        >
          <HalftoneReveal
            src="/images/portfolio/wizard-scroll.webp"
            fit="cover"
            mode="duotone"
            shape="dot"
            cellSize={7}
            angle={32}
            dotScale={1.05}
            inkColor="#2A2118"
            accentColor="#C69A55"
            paperColor="#080B11"
            contrast={1.18}
            revealRadius={190}
            softness={0.72}
            // Seconds the uncovered trail takes to fade back to hidden.
            linger={4.8}
            clickBurst
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
