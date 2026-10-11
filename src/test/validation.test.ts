import { describe, it, expect } from "vitest";
import { validateContact, type ContactValues } from "@/lib/validation";

const valid: ContactValues = {
  name: "Ada Lovelace",
  email: "a+b@sub.domain.co.in",
  subject: "An engine",
  message: "I have some notes on the analytical engine you might find useful.",
};

describe("validateContact", () => {
  it("accepts a complete, well-formed message", () => {
    expect(validateContact(valid)).toBeNull();
  });

  it("reports every empty required field", () => {
    const errors = validateContact({ name: "", email: "", subject: "", message: "" });
    expect(errors).not.toBeNull();
    expect(Object.keys(errors!).sort()).toEqual([
      "email",
      "message",
      "name",
      "subject",
    ]);
  });

  it("rejects whitespace-only input", () => {
    const errors = validateContact({ ...valid, name: "   ", message: "  \n " });
    expect(errors?.name).toBeTruthy();
    expect(errors?.message).toBeTruthy();
  });

  it("rejects a malformed address", () => {
    for (const email of ["nope", "a@b", "a b@c.com", "@b.com", "a@.com"]) {
      expect(validateContact({ ...valid, email })?.email).toBeTruthy();
    }
  });

  it("accepts subaddressed and multi-label addresses", () => {
    for (const email of ["a+b@sub.domain.co.in", "first.last@example.org"]) {
      expect(validateContact({ ...valid, email })).toBeNull();
    }
  });

  it("asks for a message with something in it", () => {
    expect(validateContact({ ...valid, message: "hi" })?.message).toBeTruthy();
  });
});
