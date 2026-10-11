import Image from "next/image";
import { experience } from "@/data/experience";
import { BLUR } from "@/lib/blur";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ExperienceRoute } from "@/components/ui/ExperienceRoute";
import { ExperienceOath } from "@/components/ui/ExperienceOath";

/**
 * The Marauder's Map.
 *
 * Parchment is the ground for the whole section, so every word here is sepia
 * ink on paper — and every word is real selectable HTML, never baked into the
 * image. The artwork's own dotted path is decoration; the route that matters
 * is drawn in SVG from the actual entries.
 */
export function ExperienceSection() {
  return (
    <section id="experience" className="relative isolate overflow-hidden">
      {/* Flat parchment is the ground. Stretching the map over a section this
          tall magnifies it about three times, which turns the footprints into
          blurry smears and advertises the upscale — so the artwork appears
          once, at its own aspect, as a band along the foot of the section. */}
      <div className="absolute inset-0 -z-20 bg-parchment" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-20 aspect-[1600/639] max-h-[36rem] w-full">
        <Image
          src="/images/portfolio/marauders-map-experience.webp"
          alt=""
          fill
          sizes="100vw"
          quality={88}
          placeholder="blur"
          blurDataURL={BLUR.maraudersMapExperience}
          className="object-cover object-bottom"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, var(--color-parchment) 0%, color-mix(in srgb, var(--color-parchment) 72%, transparent) 34%, color-mix(in srgb, var(--color-parchment) 40%, transparent) 72%, color-mix(in srgb, var(--color-obsidian) 70%, transparent) 97%, var(--color-obsidian) 100%)",
          }}
        />
      </div>

      {/* Warm the paper and bleed the top edge back into the book. */}
      <div
        className="backdrop-layer -z-10"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-obsidian) 0%, color-mix(in srgb, var(--color-parchment) 72%, transparent) 8%, transparent 22%, transparent 100%)",
        }}
      />

      <div className="folio section-pad relative z-10">
        <SectionHeading
          eyebrow="THE ROUTE"
          title="The Journey So Far"
          subtitle="Every milestone leads to a new challenge."
          tone="parchment"
        />

        <div className="mt-12 hidden lg:block">
          <ExperienceRoute entries={experience} />
        </div>

        <ExperienceOath entries={experience} />

      </div>
    </section>
  );
}
