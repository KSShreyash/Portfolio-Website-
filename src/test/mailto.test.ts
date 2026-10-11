import { describe, it, expect } from "vitest";
import { buildMailto, MAILTO_LIMIT } from "@/lib/mailto";

/**
 * Review Focus #5. A mailto href is a URL, and the usual way to build one —
 * string concatenation, or URLSearchParams, which encodes a space as "+" —
 * mangles exactly the characters people put in real messages.
 */
describe("buildMailto", () => {
  it("percent-encodes newlines, ampersands, hashes and emoji", () => {
    const { href } = buildMailto({
      to: "a@b.com",
      subject: "Re: hooks & co #1",
      body: "line one\nline two ✨",
    });

    expect(href.startsWith("mailto:a@b.com?")).toBe(true);
    expect(href).toContain("%0A");
    expect(href).toContain("%26");
    expect(href).toContain("%23");
    expect(href).not.toMatch(/[\n\r]/);
    expect(new URL(href).searchParams.get("body")).toContain("✨");
  });

  it("encodes spaces as %20, never as +", () => {
    const { href } = buildMailto({
      to: "a@b.com",
      subject: "two words",
      body: "three more words",
    });
    expect(href).toContain("%20");
    expect(href).not.toContain("+");
    expect(new URL(href).searchParams.get("subject")).toBe("two words");
  });

  it("flags payloads past the practical ceiling instead of truncating them", () => {
    const body = "x".repeat(MAILTO_LIMIT + 1);
    const { tooLong, href } = buildMailto({ to: "a@b.com", subject: "s", body });

    expect(tooLong).toBe(true);
    expect(href).toContain("x".repeat(50));
  });

  it("leaves an ordinary message unflagged", () => {
    const { tooLong } = buildMailto({
      to: "a@b.com",
      subject: "Hello",
      body: "Short and ordinary.",
    });
    expect(tooLong).toBe(false);
  });
});

describe("buildGmailCompose", () => {
  it("targets Gmail's compose view with the message prefilled", async () => {
    const { buildGmailCompose } = await import("@/lib/mailto");
    const { href } = buildGmailCompose({
      to: "a@b.com",
      subject: "Re: hooks & co #1",
      body: "line one\nline two ✨",
    });

    const url = new URL(href);
    expect(url.origin).toBe("https://mail.google.com");
    expect(url.pathname).toBe("/mail/");
    expect(url.searchParams.get("view")).toBe("cm");
    expect(url.searchParams.get("to")).toBe("a@b.com");
    expect(url.searchParams.get("su")).toBe("Re: hooks & co #1");
    expect(url.searchParams.get("body")).toBe("line one\nline two ✨");
  });

  it("encodes spaces as %20, never as +", () => {
    // A "+" in a Gmail body renders literally, same as in a mailto.
    return import("@/lib/mailto").then(({ buildGmailCompose }) => {
      const { href } = buildGmailCompose({
        to: "a@b.com",
        subject: "two words",
        body: "three more words",
      });
      expect(href).toContain("%20");
      expect(href).not.toContain("+");
    });
  });

  it("flags a payload too long to survive a URL", async () => {
    const { buildGmailCompose, GMAIL_LIMIT } = await import("@/lib/mailto");
    const { tooLong } = buildGmailCompose({
      to: "a@b.com",
      subject: "s",
      body: "x".repeat(GMAIL_LIMIT + 1),
    });
    expect(tooLong).toBe(true);
  });
});
