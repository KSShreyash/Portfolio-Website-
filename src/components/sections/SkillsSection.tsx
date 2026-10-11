import Image from "next/image";
import { skills } from "@/data/skills";
import { BLUR } from "@/lib/blur";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SkillBanner } from "@/components/ui/SkillBanner";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Houses of Knowledge.
 *
 * The gothic hall is shown at its own aspect as a band behind the heading, so
 * the vaulting and the candles read as architecture. The four pennants in
 * front are drawn in HTML with original emblems — the crests in the painting
 * belong to someone else's world, and these are Kumar's own categories.
 */
export function SkillsSection() {
  return (
    <section id="skills" className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-20 aspect-[16/9] max-h-[40rem] min-h-[20rem] w-full">
        <Image
          src="/images/portfolio/house-banners-skills.webp"
          alt=""
          fill
          sizes="100vw"
          quality={88}
          placeholder="blur"
          blurDataURL={BLUR.houseBannersSkills}
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, var(--color-obsidian) 0%, color-mix(in srgb, var(--color-obsidian) 72%, transparent) 14%, color-mix(in srgb, var(--color-obsidian) 86%, transparent) 34%, color-mix(in srgb, var(--color-obsidian) 94%, transparent) 62%, var(--color-obsidian) 100%)",
          }}
        />
      </div>

      <div
        className="backdrop-layer -z-10"
        style={{
          background:
            "radial-gradient(52% 26% at 50% 20%, color-mix(in srgb, var(--color-obsidian) 88%, transparent) 0%, transparent 100%)",
        }}
      />

      <div className="folio section-pad relative z-10">
        <SectionHeading
          eyebrow="WHAT I WORK WITH"
          title="Houses of Knowledge"
          subtitle="The tools, languages, and ideas I use to build software."
          align="center"
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {skills.map((collection, i) => (
            <Reveal key={collection.id} delay={i * 80}>
              <SkillBanner collection={collection} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
