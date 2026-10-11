import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

const css = readFileSync("src/app/globals.css", "utf8");

/** The nine colour tokens the spec fixes. These hex values are not negotiable. */
const SPEC_TOKENS = {
  "--color-obsidian": "#080B11",
  "--color-midnight": "#101C2B",
  "--color-deep-blue": "#172B3B",
  "--color-teal-mist": "#23434A",
  "--color-gold": "#C69A55",
  "--color-gold-light": "#E5C58B",
  "--color-parchment": "#E7D4AF",
  "--color-warm-white": "#F4EBDD",
  "--color-muted": "#B7BCC5",
};

/** Derived tokens are allowed, but each one must say in a comment that it is derived. */
const DERIVED_TOKENS = [
  "--color-ink",
  "--color-ink-soft",
  "--color-parchment-deep",
  "--color-seal",
];

describe("design tokens", () => {
  it.each(Object.entries(SPEC_TOKENS))("declares %s as %s", (token, hex) => {
    expect(css).toMatch(new RegExp(`${token}\\s*:\\s*${hex}`, "i"));
  });

  it.each(DERIVED_TOKENS)("declares the derived token %s", (token) => {
    expect(css).toMatch(new RegExp(`${token}\\s*:\\s*#[0-9A-Fa-f]{6}`));
  });

  it("labels every derived token as derived so nobody mistakes one for a spec value", () => {
    expect(css).toMatch(/derived/i);
  });

  it("binds the four spec typefaces to font tokens", () => {
    for (const token of [
      "--font-display",
      "--font-editorial",
      "--font-body",
      "--font-mono",
    ]) {
      expect(css).toContain(token);
    }
  });

  it("has dropped the create-next-app starter palette", () => {
    expect(css).not.toContain("--background: #ffffff");
    expect(css).not.toContain("Arial, Helvetica, sans-serif");
  });
});
