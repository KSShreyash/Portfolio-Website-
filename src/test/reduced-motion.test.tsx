import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ExperienceRoute } from "@/components/ui/ExperienceRoute";
import { AboutSection } from "@/components/sections/AboutSection";
import { experience } from "@/data/experience";
import { aboutSubsections } from "@/data/about";

/**
 * Review Focus #3.
 *
 * Skipping an animation is not the same as finishing it. A route that draws by
 * animating `stroke-dashoffset` stays invisible if the tween never runs, and a
 * panel that expands from `height: 0` stays collapsed. Under reduced motion
 * every one of these has to render in its completed state instead.
 */
function stubMatchMedia(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    (query: string): MediaQueryList =>
      ({
        matches: reduce && query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  );
}

beforeEach(() => {
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
  // jsdom implements no SVG geometry; the route reads this before animating.
  const SvgPath = (window as unknown as { SVGPathElement?: { prototype: SVGPathElement } })
    .SVGPathElement;
  if (SvgPath && !SvgPath.prototype.getTotalLength) {
    SvgPath.prototype.getTotalLength = () => 1000;
  }
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("reduced motion renders finished states, not starting states", () => {
  it("draws the experience route in full", () => {
    stubMatchMedia(true);
    const { container } = render(<ExperienceRoute entries={experience} />);

    const path = container.querySelector("[data-route-path]")!;
    expect(path).toBeTruthy();
    // No dash offset was ever applied, so the stroke is complete as authored.
    expect(path.getAttribute("stroke-dashoffset")).toBeNull();
    expect((path as SVGElement).style.strokeDashoffset).toBe("");

    const markers = container.querySelectorAll("[data-route-marker]");
    expect(markers).toHaveLength(experience.length);
    for (const marker of markers) {
      expect((marker as SVGElement).style.opacity).not.toBe("0");
    }
  });

  it("shows every About subsection without anyone clicking", () => {
    stubMatchMedia(true);
    render(<AboutSection />);

    for (const section of aboutSubsections) {
      expect(screen.getAllByText(section.title).length).toBeGreaterThan(0);
    }
    // And the fold control is not offered at all, since there is nothing folded.
    expect(screen.queryByRole("button", { name: /open my letter/i })).toBeNull();
  });

  it("still offers the fold when motion is allowed", () => {
    stubMatchMedia(false);
    render(<AboutSection />);
    expect(
      screen.getByRole("button", { name: /open my letter/i }),
    ).toHaveAttribute("aria-expanded", "false");
  });
});
