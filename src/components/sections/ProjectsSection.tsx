import Image from "next/image";
import { featuredProject, otherProjects } from "@/data/projects";
import { BLUR } from "@/lib/blur";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { FeaturedProjectCard, ProjectCard } from "@/components/ui/ProjectCard";

/**
 * The Spellbook.
 *
 * The open-book artwork is the room, not the page: it sits well back under a
 * near-opaque wash so only its candlelight reaches the edges, and the entries
 * sit on dark panels in front of it. Putting text on the lit pages of the
 * photograph would be the obvious move and an unreadable one.
 */
export function ProjectsSection() {
  return (
    <section id="projects" className="relative isolate overflow-hidden">
      {/*
        The book is shown at its own aspect ratio as a band across the top of
        the section. Stretching it over the full section height crops away both
        candles and leaves only the blank middle of the page — the one part of
        the artwork with nothing in it.
      */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-20 aspect-[16/9] max-h-[38rem] min-h-[18rem] w-full">
        <Image
          src="/images/portfolio/spellbook-projects.webp"
          alt=""
          fill
          sizes="100vw"
          quality={88}
          placeholder="blur"
          blurDataURL={BLUR.spellbookProjects}
          className="object-cover object-center"
        />
        {/* Darken the lit pages in the middle; let the candles survive at the
            edges, which is the whole reason this image is here. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(72% 96% at 50% 48%, color-mix(in srgb, var(--color-obsidian) 90%, transparent) 30%, color-mix(in srgb, var(--color-obsidian) 72%, transparent) 70%, color-mix(in srgb, var(--color-obsidian) 46%, transparent) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, var(--color-obsidian) 0%, transparent 26%, color-mix(in srgb, var(--color-obsidian) 70%, transparent) 72%, var(--color-obsidian) 100%)",
          }}
        />
      </div>

      <div className="folio section-pad relative z-10">
        <SectionHeading
          eyebrow="SELECTED WORK"
          title="The Spellbook"
          subtitle="A collection of systems, experiments, and ideas brought to life through code."
        />

        <div className="mt-14 lg:mt-16">
          <Reveal>
            <FeaturedProjectCard project={featuredProject} index={1} />
          </Reveal>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {otherProjects.map((project, i) => (
              <Reveal key={project.id} delay={i * 90}>
                <ProjectCard project={project} index={i + 2} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
