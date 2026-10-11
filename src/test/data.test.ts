import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { siteConfig } from "@/config/site";
import { projects } from "@/data/projects";
import { skills } from "@/data/skills";
import { experience } from "@/data/experience";
import { achievements } from "@/data/achievements";

/**
 * This file is the mechanical enforcement of the brief's hardest rule: nothing
 * on this site may be invented. Every URL, date and claim has to trace back to
 * the résumé, a local repository, or the GitHub profile README.
 */

const ALLOWED_HOSTS = [
  "github.com",
  "www.linkedin.com",
  "ai-relationship-manager.pages.dev",
];

const DATASETS = { siteConfig, projects, skills, experience, achievements };

const urlsIn = (value: unknown): string[] =>
  JSON.stringify(value).match(/https?:\/\/[^"'\s)]+/g) ?? [];

describe("site config", () => {
  it("uses the exact brand strings the brief fixes", () => {
    expect(siteConfig.name).toBe("Kumar Shreyash");
    expect(siteConfig.headline).toBe("Software Developer & AI Systems Builder");
  });

  it("points at a résumé that actually exists on disk", () => {
    expect(existsSync(`public${siteConfig.resumePath}`)).toBe(true);
  });

  it("navigates to exactly the brief's section ids", () => {
    expect(siteConfig.nav.map((n) => n.id)).toEqual([
      "about",
      "projects",
      "skills",
      "experience",
      "achievements",
      "contact",
    ]);
  });

  it("never publishes the phone number from the résumé", () => {
    expect(JSON.stringify(siteConfig)).not.toMatch(/7970406579/);
  });

  it("uses the email that appears on both the résumé and the GitHub profile", () => {
    expect(siteConfig.email).toBe("kumarshreyash2504@gmail.com");
  });
});

describe("no invented or placeholder content", () => {
  it.each(Object.entries(DATASETS))("%s has no placeholder markers", (_name, data) => {
    expect(JSON.stringify(data)).not.toMatch(
      /lorem|ipsum|example\.com|TODO|TBD|FIXME|your-|placeholder|coming soon/i,
    );
  });

  it("links only to verified hosts", () => {
    const found = Object.values(DATASETS).flatMap(urlsIn);
    expect(found.length).toBeGreaterThan(0);
    for (const url of found) {
      expect(ALLOWED_HOSTS).toContain(new URL(url).host);
    }
  });

  it("uses https for every external link", () => {
    for (const url of Object.values(DATASETS).flatMap(urlsIn)) {
      expect(url.startsWith("https://")).toBe(true);
    }
  });
});

describe("projects", () => {
  it("features exactly one project", () => {
    expect(projects.filter((p) => p.featured)).toHaveLength(1);
  });

  it("gives every project a unique slug", () => {
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
  });

  it("omits optional URLs rather than leaving them empty", () => {
    for (const p of projects) {
      if ("githubUrl" in p) expect(p.githubUrl).toMatch(/^https:\/\//);
      if ("liveUrl" in p) expect(p.liveUrl).toMatch(/^https:\/\//);
    }
  });

  it("describes every project in one or two sentences", () => {
    for (const p of projects) {
      expect(p.description.length).toBeGreaterThan(40);
      expect(p.description.length).toBeLessThan(320);
    }
  });

  it("lists at least one real technology per project", () => {
    for (const p of projects) expect(p.technologies.length).toBeGreaterThan(0);
  });

  it("only writes a case study for projects backed by a repository", () => {
    for (const p of projects) {
      if (p.caseStudy) expect(p.githubUrl).toBeDefined();
    }
  });
});

describe("experience", () => {
  it("is ordered most recent first", () => {
    const starts = experience.map((e) => e.start);
    expect([...starts].sort().reverse()).toEqual(starts);
  });

  it("uses sortable YYYY-MM dates alongside a human date range", () => {
    for (const e of experience) {
      expect(e.start).toMatch(/^\d{4}-\d{2}$/);
      expect(e.end).toMatch(/^\d{4}-\d{2}$/);
      expect(e.dateRange.length).toBeGreaterThan(8);
    }
  });

  it("covers the four verified entries from the résumé", () => {
    expect(experience.map((e) => e.organisation)).toEqual([
      "Yolex Labs",
      "Samsung PRISM",
      "Sangam Club, VIT Chennai",
      "Vellore Institute of Technology",
    ]);
  });
});

describe("skills", () => {
  it("has the four collections the brief names, in order", () => {
    expect(skills.map((s) => s.name)).toEqual([
      "The Forge",
      "The Thinkery",
      "The Observatory",
      "The Archives",
    ]);
  });

  it("only references projects that exist", () => {
    const slugs = new Set(projects.map((p) => p.slug));
    for (const c of skills) {
      for (const slug of c.relatedProjectSlugs) expect(slugs).toContain(slug);
    }
  });

  it("shows primary skills without requiring an interaction", () => {
    for (const c of skills) expect(c.primary.length).toBeGreaterThanOrEqual(4);
  });

  it("carries no percentages or proficiency ratings", () => {
    expect(JSON.stringify(skills)).not.toMatch(/\d{1,3}\s?%|proficien|expert|beginner/i);
  });
});

describe("achievements", () => {
  it("has entries, each with a year and a body", () => {
    expect(achievements.length).toBeGreaterThan(0);
    for (const a of achievements) {
      expect(a.year).toMatch(/\d{4}/);
      expect(a.body.length).toBeGreaterThan(30);
    }
  });

  it("claims no award, certificate or publication, because the résumé lists none", () => {
    expect(JSON.stringify(achievements)).not.toMatch(
      /\baward\b|\bcertificat|\bpublished\b|\bpublication\b|\bwinner\b|\b1st place\b/i,
    );
  });
});
