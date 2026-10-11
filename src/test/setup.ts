import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// vitest runs without `globals`, so Testing Library's automatic cleanup never
// registers itself. Without this, every render stacks up in the same document
// and queries start finding duplicates.
afterEach(cleanup);

// jsdom does not implement matchMedia, and GSAP calls it while being imported.
// Individual tests override this with vi.stubGlobal when they need a specific
// answer; this is just a baseline so importing a module cannot throw.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
