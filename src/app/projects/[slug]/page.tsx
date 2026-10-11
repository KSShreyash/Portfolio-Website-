import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { projects, getProject } from "@/data/projects";
import { siteConfig } from "@/config/site";
import { TechList } from "@/components/ui/TechChip";
import { ProjectPlate } from "@/components/ui/ProjectPlate";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { Corner } from "@/components/ui/Ornament";
import type { CaseStudy } from "@/lib/types";

/** Only projects with a written case study get a page. */
export function generateStaticParams() {
  return projects.filter((p) => p.caseStudy).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: `Not found | ${siteConfig.name}` };

  return {
    title: `${project.title} | ${siteConfig.name}`,
    description: project.description,
    openGraph: {
      title: `${project.title} — ${siteConfig.name}`,
      description: project.description,
      type: "article",
    },
  };
}

/** Section heading plus rule, used only on this route. */
function Heading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h2 className="mt-14 font-display text-[1.5rem] tracking-[0.06em] text-parchment">
        {children}
      </h2>
      <hr className="rule-gold mt-4 w-32" />
    </>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-4">
      {items.map((item) => (
        <li
          key={item}
          className="measure relative pl-5 text-muted before:absolute before:top-[0.72em] before:left-0 before:h-1.5 before:w-1.5 before:rotate-45 before:bg-gold/55"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * A case study renders only the parts that have been written. An absent field
 * produces nothing at all — never an empty heading waiting to be filled in.
 */
function Body({ study }: { study: CaseStudy }) {
  return (
    <>
      <p className="measure mt-8 text-[1.0625rem] text-muted">
        {study.overview}
      </p>

      {study.problem && (
        <>
          <Heading>The problem</Heading>
          <p className="measure mt-6 text-muted">{study.problem}</p>
        </>
      )}

      {study.architecture && (
        <>
          <Heading>Architecture</Heading>
          <Bullets items={study.architecture} />
        </>
      )}

      {study.decisions && (
        <>
          <Heading>Decisions and tradeoffs</Heading>
          <dl className="mt-6 space-y-7">
            {study.decisions.map((d) => (
              <div key={d.title}>
                <dt className="font-editorial text-[1.25rem] text-parchment">
                  {d.title}
                </dt>
                <dd className="measure mt-2 text-muted">{d.body}</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      {study.implementation && (
        <>
          <Heading>Implementation</Heading>
          <Bullets items={study.implementation} />
        </>
      )}

      {study.challenges && (
        <>
          <Heading>Challenges</Heading>
          <Bullets items={study.challenges} />
        </>
      )}

      {study.results && (
        <>
          <Heading>Results</Heading>
          <Bullets items={study.results} />
        </>
      )}

      {study.limitations && (
        <>
          <Heading>Known limitations</Heading>
          <p className="measure mt-5 text-[0.9375rem] text-muted/70 italic">
            Taken from the project&rsquo;s own documentation.
          </p>
          <Bullets items={study.limitations} />
        </>
      )}
    </>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project?.caseStudy) notFound();

  return (
    <main id="main" className="relative isolate min-h-screen">
      <div
        className="backdrop-layer -z-10 fixed"
        style={{
          background:
            "radial-gradient(90% 60% at 50% 0%, var(--color-midnight) 0%, var(--color-obsidian) 70%)",
        }}
      />

      <div className="folio-narrow pt-28 pb-24 sm:pt-36">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.1em] text-muted uppercase transition-colors hover:text-gold-light"
        >
          <ArrowLeft size={14} aria-hidden />
          Back to the Spellbook
        </Link>

        <article className="relative mt-10">
          <Corner className="absolute -top-4 -left-4 hidden sm:block" />

          <p className="meta normal-case">{project.category}</p>

          <h1 className="mt-4 text-display-lg text-parchment">
            {project.title}
          </h1>

          <hr className="rule-gold mt-6 w-48" />

          <div className="mt-10 flex justify-center rounded-[var(--radius-panel)] border border-gold/15 bg-midnight/50 px-6 py-10">
            <ProjectPlate kind={project.glyph} className="w-full max-w-[26rem]" />
            <span className="sr-only">{project.glyphAlt}</span>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.875rem]">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gold-light transition-colors hover:text-warm-white"
              >
                <GithubIcon size={16} />
                View source
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gold-light transition-colors hover:text-warm-white"
              >
                <ExternalLink size={16} aria-hidden />
                Open the live app
              </a>
            )}
            {project.liveNote && (
              <span className="text-muted/70">{project.liveNote}</span>
            )}
          </div>

          <Body study={project.caseStudy} />

          <Heading>Built with</Heading>
          <TechList
            items={project.technologies}
            className="mt-6"
            label={`Technologies used in ${project.title}`}
          />

          <hr className="rule-gold mt-16" />

          <Link
            href="/#projects"
            className="mt-8 inline-flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.1em] text-muted uppercase transition-colors hover:text-gold-light"
          >
            <ArrowLeft size={14} aria-hidden />
            Back to the Spellbook
          </Link>
        </article>
      </div>
    </main>
  );
}
