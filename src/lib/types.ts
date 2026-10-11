/** Section anchors. These ids are fixed by the brief and used for deep links. */
export type SectionId =
  | "home"
  | "about"
  | "projects"
  | "skills"
  | "experience"
  | "achievements"
  | "contact";

export interface NavItem {
  id: Exclude<SectionId, "home">;
  label: string;
}

export interface SiteConfig {
  name: string;
  headline: string;
  supportingHeadline: string;
  eyebrow: string;
  tagline: string;
  intro: string;
  location: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  resumePath: string;
  nav: NavItem[];
}

/** Which hand-drawn architecture diagram a project card shows. */
export type GlyphKind = "graph" | "agent" | "matrix" | "route";

/**
 * `live` — deployed and publicly reachable.
 * `active` — being built now; not publicly deployed.
 * `complete` — finished work that was never given a public URL.
 */
export type ProjectStatus = "live" | "active" | "complete";

export interface CaseStudySection {
  title: string;
  body: string;
}

export interface CaseStudy {
  overview: string;
  problem?: string;
  architecture?: string[];
  decisions?: CaseStudySection[];
  implementation?: string[];
  challenges?: string[];
  results?: string[];
  limitations?: string[];
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  /** Rendered verbatim as the card's category line. */
  category: string;
  description: string;
  technologies: string[];
  glyph: GlyphKind;
  /** Plain-language description of the glyph, for screen readers. */
  glyphAlt: string;
  featured: boolean;
  status: ProjectStatus;
  /** Omitted entirely when no verified URL exists — never an empty string. */
  githubUrl?: string;
  liveUrl?: string;
  liveNote?: string;
  caseStudy?: CaseStudy;
}

export type EmblemKind = "forge" | "thinkery" | "observatory" | "archives";

export interface SkillCollection {
  id: string;
  name: string;
  tagline: string;
  emblem: EmblemKind;
  /** A restrained tint used for the pennant's field. */
  accent: string;
  /** Always visible. Never gated behind an interaction. */
  primary: string[];
  /** Revealed by the expander on desktop; shown inline on mobile. */
  more: string[];
  relatedProjectSlugs: string[];
}

export interface ExperienceEntry {
  id: string;
  organisation: string;
  role: string;
  location: string;
  /** Sortable `YYYY-MM`. */
  start: string;
  end: string;
  /** What the visitor actually reads, e.g. "Jun 2026 – Oct 2026". */
  dateRange: string;
  summary: string;
  responsibilities: string[];
  technologies: string[];
  kind: "work" | "education" | "leadership";
}

export interface Achievement {
  id: string;
  headline: string;
  year: string;
  body: string;
  issuer?: string;
  evidenceUrl?: string;
}

export interface AboutSubsection {
  title: string;
  body: string;
}
