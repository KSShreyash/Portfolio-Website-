import { readFileSync, readdirSync, existsSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeAll } from "vitest";
import { Navigation } from "@/components/layout/Navigation";
import { siteConfig } from "@/config/site";

const css = readFileSync("src/app/globals.css", "utf8");

/** Every file that could declare a section landmark. */
function sectionSources(): string {
  const dir = "src/components/sections";
  const files = existsSync(dir)
    ? readdirSync(dir).map((f) => readFileSync(`${dir}/${f}`, "utf8"))
    : [];
  return [readFileSync("src/app/page.tsx", "utf8"), ...files].join("\n");
}

beforeAll(() => {
  // jsdom has no IntersectionObserver; Navigation uses one to track the
  // active section. A no-op stand-in is enough for these assertions.
  class Stub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
  }
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: Stub,
  });
});

describe("primary navigation", () => {
  it("links only to the brief's section anchors", () => {
    render(<Navigation />);
    const nav = screen.getByRole("navigation", { name: /primary/i });
    const hrefs = within(nav)
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"))
      .filter((h): h is string => !!h && h.startsWith("#"));

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href).toMatch(/^#(home|about|projects|skills|experience|achievements|contact)$/);
    }
  });

  it("renders a link for every configured nav item", () => {
    render(<Navigation />);
    const nav = screen.getByRole("navigation", { name: /primary/i });
    for (const item of siteConfig.nav) {
      expect(within(nav).getAllByRole("link", { name: item.label }).length).toBeGreaterThan(0);
    }
  });

  it("exposes the mobile menu state and points at a panel that exists", async () => {
    const user = userEvent.setup();
    const { container } = render(<Navigation />);
    const trigger = screen.getByRole("button", { name: /menu/i });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    const controls = trigger.getAttribute("aria-controls");
    expect(controls).toBeTruthy();

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(container.ownerDocument.getElementById(controls!)).not.toBeNull();
  });

  it("closes the mobile menu on Escape and gives focus back to the trigger", async () => {
    const user = userEvent.setup();
    render(<Navigation />);
    const trigger = screen.getByRole("button", { name: /menu/i });

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });
});

describe("deep links land below the fixed header", () => {
  it("reserves scroll margin on every section landmark", () => {
    expect(css).toMatch(/section\[id\][^{]*\{[^}]*scroll-margin-top/);
  });

  it("reserves scroll padding on the root so first-paint hash jumps clear it too", () => {
    expect(css).toMatch(/scroll-padding-top:\s*var\(--header-h\)/);
  });

  it("defines a non-zero header height", () => {
    const match = css.match(/--header-h:\s*([\d.]+)rem/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBeGreaterThan(2);
  });

  it("only smooth-scrolls when the reader has not asked for less motion", () => {
    const smooth = css.indexOf("scroll-behavior: smooth");
    const guard = css.indexOf("@media (prefers-reduced-motion: no-preference)");
    expect(smooth).toBeGreaterThan(-1);
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(smooth);
  });
});

describe("section landmarks", () => {
  it("declares every id the navigation targets", () => {
    const src = sectionSources();
    for (const id of ["home", ...siteConfig.nav.map((n) => n.id)]) {
      expect(src).toContain(`id="${id}"`);
    }
  });
});
