import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Folio } from "@/components/ui/Ornament";
import { TechList } from "@/components/ui/TechChip";
import { ProjectPlate } from "@/components/ui/ProjectPlate";
import { GithubIcon } from "@/components/ui/BrandIcons";

const STATUS_LABEL: Record<Project["status"], string> = {
  live: "Live",
  active: "In progress",
  complete: "Complete",
};

function Links({ project }: { project: Project }) {
  const { githubUrl, liveUrl, caseStudy, slug, title } = project;
  if (!githubUrl && !liveUrl && !caseStudy) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.8125rem]">
      {caseStudy && (
        <Link
          href={`/projects/${slug}`}
          className="group/link inline-flex items-center gap-1.5 text-gold-light transition-colors hover:text-warm-white"
        >
          Read the case study
          <ArrowUpRight
            size={14}
            aria-hidden
            className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
          />
          <span className="sr-only">for {title}</span>
        </Link>
      )}

      {githubUrl && (
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-muted transition-colors hover:text-gold-light"
        >
          <GithubIcon size={15} />
          Source
          <span className="sr-only">for {title} on GitHub</span>
        </a>
      )}

      {liveUrl && (
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-muted transition-colors hover:text-gold-light"
        >
          <ExternalLink size={15} aria-hidden />
          Live app
          <span className="sr-only">{title}, opens in a new tab</span>
        </a>
      )}
    </div>
  );
}

/**
 * Hover is a candle moving closer: the card lifts a little and the gold edge
 * on the lit side brightens. No rotation, no scaling of the whole card, and
 * nothing that only appears on hover — every link is visible at rest.
 */
const hover =
  "transition-[transform,border-color,box-shadow] duration-500 " +
  "motion-safe:hover:-translate-y-0.5 hover:border-gold/45 " +
  "hover:shadow-[-1px_0_0_0_color-mix(in_srgb,var(--color-gold)_55%,transparent),0_22px_48px_-30px_rgb(0_0_0/0.9)]";

export function FeaturedProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <article
      className={cn(
        "surface-dark group grid overflow-hidden lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]",
        hover,
      )}
    >
      <div className="relative flex items-center justify-center border-b border-gold/12 bg-obsidian/45 p-8 lg:border-r lg:border-b-0">
        <ProjectPlate
          kind={project.glyph}
          className="w-full max-w-[22rem] motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.02]"
        />
        <span className="sr-only">{project.glyphAlt}</span>
      </div>

      <div className="p-8 lg:p-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <Folio n={index} />
          <span className="meta text-muted/70">
            {STATUS_LABEL[project.status]}
          </span>
        </div>

        <h3 className="text-display-md text-parchment">{project.title}</h3>
        <p className="meta mt-3 normal-case text-gold/85">{project.category}</p>

        <p className="measure mt-5 text-muted">{project.description}</p>

        <TechList
          items={project.technologies}
          className="mt-6"
          label={`Technologies used in ${project.title}`}
        />

        {project.liveNote && (
          <p className="mt-4 text-[0.8125rem] text-muted/70">
            {project.liveNote}
          </p>
        )}

        <Links project={project} />
      </div>
    </article>
  );
}

export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <article
      className={cn("surface-dark group flex flex-col overflow-hidden", hover)}
    >
      <div className="flex items-center justify-center border-b border-gold/12 bg-obsidian/45 px-6 py-7">
        <ProjectPlate
          kind={project.glyph}
          className="w-full max-w-[17rem] motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.02]"
        />
        <span className="sr-only">{project.glyphAlt}</span>
      </div>

      <div className="flex flex-1 flex-col p-7">
        <div className="mb-4 flex items-center justify-between gap-4">
          <Folio n={index} />
          <span className="meta text-muted/70">
            {STATUS_LABEL[project.status]}
          </span>
        </div>

        <h3 className="font-display text-[1.3125rem] leading-snug tracking-[0.04em] text-parchment">
          {project.title}
        </h3>
        <p className="meta mt-2.5 normal-case text-gold/85">
          {project.category}
        </p>

        <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">
          {project.description}
        </p>

        <TechList
          items={project.technologies}
          className="mt-5"
          label={`Technologies used in ${project.title}`}
        />

        <div className="mt-auto">
          <Links project={project} />
        </div>
      </div>
    </article>
  );
}
