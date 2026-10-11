import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { Reveal } from "@/components/motion/Reveal";

const css = readFileSync("src/app/globals.css", "utf8");
const layout = readFileSync("src/app/layout.tsx", "utf8");

/**
 * Review Focus #2: a scroll-reveal that starts at `opacity: 0` in plain CSS
 * turns the whole page blank whenever the JavaScript does not run — JS
 * disabled, a chunk that fails to load, or a reader with reduced motion.
 *
 * The contract: server HTML is fully visible. Elements are hidden only once a
 * script has already proved it can run AND the reader has not asked for less
 * motion. These tests pin that contract.
 */
describe("Reveal", () => {
  it("renders children visible in server HTML", () => {
    const html = renderToStaticMarkup(
      <Reveal>
        <p>Ancient runes</p>
      </Reveal>,
    );
    expect(html).toContain("Ancient runes");
    expect(html).not.toMatch(/opacity:\s*0/);
    expect(html).not.toMatch(/hidden/);
  });

  it("marks itself for the observer without hiding itself", () => {
    const html = renderToStaticMarkup(
      <Reveal>
        <p>Ancient runes</p>
      </Reveal>,
    );
    expect(html).toContain("data-reveal");
    expect(html).not.toContain("data-revealed");
  });

  it("only hides revealable content when the document is marked motion-ready", () => {
    // The hiding rule must be scoped to the class the pre-paint script adds.
    expect(css).toMatch(/\.motion-ready\s+\[data-reveal\]/);
    // ...and must not hide anything unconditionally.
    expect(css).not.toMatch(/^\s*\[data-reveal\][^{]*\{[^}]*opacity:\s*0/m);
  });

  it("adds motion-ready before first paint, and never under reduced motion", () => {
    expect(layout).toContain("motion-ready");
    expect(layout).toContain("prefers-reduced-motion: reduce");
  });
});
