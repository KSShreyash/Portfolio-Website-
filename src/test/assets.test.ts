import { readFileSync, existsSync } from "node:fs";
import { describe, it, expect } from "vitest";

/**
 * Master sizes produced by scripts/extract_assets.py. Heights are derived from
 * the native crop's aspect ratio, so a mismatch here means the artwork got
 * stretched — which the brief forbids.
 */
const EXPECTED: Record<string, [number, number]> = {
  // Full-resolution standalone artwork, used at native size.
  "hogwarts-hero": [1672, 941],
  "enchanted-lake-footer": [1672, 941],
  "spellbook-projects": [1672, 941],
  "house-banners-skills": [1672, 941],
  "owl-post-contact": [1672, 941],
  // Still lifted off the design board, so still upscaled.
  "acceptance-letter": [1400, 552],
  "marauders-map-experience": [1600, 639],
  "daily-prophet-achievements": [1500, 409],
};

/** Minimal VP8/VP8L/VP8X dimension reader — avoids an image dep for one test. */
function webpSize(buf: Buffer): [number, number] {
  expect(buf.subarray(0, 4).toString("ascii")).toBe("RIFF");
  expect(buf.subarray(8, 12).toString("ascii")).toBe("WEBP");
  const fourcc = buf.subarray(12, 16).toString("ascii");
  if (fourcc === "VP8X") {
    return [buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1];
  }
  if (fourcc === "VP8L") {
    const b = buf.readUInt32LE(21);
    return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1];
  }
  return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
}

describe("extracted portfolio artwork", () => {
  it.each(Object.entries(EXPECTED))(
    "%s exists at the expected master size",
    (name, [w, h]) => {
      const path = `public/images/portfolio/${name}.webp`;
      expect(existsSync(path)).toBe(true);
      const buf = readFileSync(path);
      expect(buf.byteLength).toBeGreaterThan(20_000);
      // A backdrop heavier than this is a mistake, not a quality decision.
      expect(buf.byteLength).toBeLessThan(600_000);
      expect(webpSize(buf)).toEqual([w, h]);
    },
  );

  it("preserves each crop's aspect ratio to within a rounding error", () => {
    // Native crop sizes, after the two franchise-mark sub-crops are applied.
    const NATIVE: Record<string, [number, number]> = {
      "hogwarts-hero": [1672, 941],
      "enchanted-lake-footer": [1672, 941],
      "spellbook-projects": [1672, 941],
      "house-banners-skills": [1672, 941],
      "owl-post-contact": [1672, 941],
      "acceptance-letter": [561, 221],
      "marauders-map-experience": [448, 179],
      "daily-prophet-achievements": [561, 153],
    };
    for (const [name, [nw, nh]] of Object.entries(NATIVE)) {
      const [mw, mh] = EXPECTED[name];
      expect(Math.abs(nw / nh - mw / mh)).toBeLessThan(0.005);
    }
  });

  it("ships a résumé PDF for the download buttons to point at", () => {
    expect(existsSync("public/resume/Kumar-Shreyash-Resume.pdf")).toBe(true);
  });

  it("keeps the source board out of public/ so it can never be served as a background", () => {
    expect(existsSync("public/images/portfolio/harry-potter-portfolio-board.png")).toBe(false);
    expect(existsSync("design-references/harry-potter-portfolio-board.png")).toBe(true);
  });
});

describe("responsive variants", () => {
  it("has every width the loader can hand back", async () => {
    const { IMAGE_WIDTHS } = await import("@/lib/image-widths");
    const entries = Object.entries(IMAGE_WIDTHS);
    expect(entries.length).toBeGreaterThan(5);

    for (const [src, widths] of entries) {
      expect(widths.length).toBeGreaterThan(1);
      for (const w of widths) {
        const variant = `public${src.replace(/\.webp$/, `-${w}.webp`)}`;
        expect(existsSync(variant), `missing ${variant}`).toBe(true);
      }
    }
  });

  it("only offers widths the source can actually fill", async () => {
    const { IMAGE_WIDTHS } = await import("@/lib/image-widths");
    for (const [src, widths] of Object.entries(IMAGE_WIDTHS)) {
      const native = readFileSync(`public${src}`);
      // The largest declared width is the master itself.
      expect(Math.max(...widths)).toBe(webpSize(native)[0]);
    }
  });

  it("resolves a request to the nearest width at or above it", async () => {
    const { default: loader } = await import("@/lib/image-loader");
    const src = "/images/portfolio/hogwarts-hero.webp";
    expect(loader({ src, width: 480 })).toBe(
      "/images/portfolio/hogwarts-hero-480.webp",
    );
    expect(loader({ src, width: 800 })).toBe(
      "/images/portfolio/hogwarts-hero-900.webp",
    );
    // Beyond the largest variant, fall back to the master.
    expect(loader({ src, width: 9999 })).toBe(
      "/images/portfolio/hogwarts-hero-1672.webp",
    );
    // Unknown paths pass through untouched.
    expect(loader({ src: "/images/nope.webp", width: 100 })).toBe(
      "/images/nope.webp",
    );
  });
});
