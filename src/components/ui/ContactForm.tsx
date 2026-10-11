"use client";

/**
 * ────────────────────────────────────────────────────────────────────────────
 * This form has no backend, and it does not pretend to have one.
 *
 * Submitting opens Gmail's web compose in a new tab with the message
 * prefilled. A `mailto:` link sits underneath for anyone who has a desktop
 * mail client — on its own it is not enough, because for a reader with no
 * client registered, `mailto:` does nothing at all and the button appears
 * broken. Nothing is stored here and nothing is sent by this site, which is
 * exactly what the copy under the button says.
 *
 * To deliver mail server-side instead:
 *   1. Add `RESEND_API_KEY` and `CONTACT_TO_EMAIL` to `.env.local`.
 *   2. Create `src/app/api/contact/route.ts` with a POST handler that
 *      validates with `validateContact` and calls your provider.
 *   3. In `handleSubmit` below, replace the `window.open(href, ...)` line
 *      with a `fetch("/api/contact", { method: "POST", ... })`, and change
 *      `SENT_COPY` to describe real delivery.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { useId, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import { buildGmailCompose, buildMailto } from "@/lib/mailto";
import {
  validateContact,
  type ContactErrors,
  type ContactValues,
} from "@/lib/validation";
import { cn } from "@/lib/cn";
import { MagicalButton } from "@/components/ui/MagicalButton";

const EMPTY: ContactValues = { name: "", email: "", subject: "", message: "" };

const SENT_COPY =
  "Gmail should have opened in a new tab with the message ready to send. If nothing happened, write to";

type Status = "idle" | "opening" | "opened" | "error";

const composeBody = (values: ContactValues) =>
  `${values.message}

— ${values.name}
${values.email}`;

const FIELDS = [
  { name: "name", label: "Name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "subject", label: "Subject", type: "text", autoComplete: "off" },
] as const;

export function ContactForm() {
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const baseId = useId();

  const set = (field: keyof ContactValues) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const found = validateContact(values);
    if (found) {
      setErrors(found);
      setStatus("idle");
      const first = Object.keys(found)[0];
      document.getElementById(`${baseId}-${first}`)?.focus();
      return;
    }

    const { href, tooLong } = buildGmailCompose({
      to: siteConfig.email,
      subject: values.subject,
      body: composeBody(values),
    });

    if (tooLong) {
      setStatus("error");
      setFormError(
        "That message is too long to carry in a link. Please shorten it, or email me directly — nothing you typed has been lost.",
      );
      return;
    }

    setStatus("opening");
    // `window.open` inside a submit handler still counts as a user gesture, so
    // it is not treated as a popup. If a blocker stops it anyway, say so
    // rather than claiming the message went somewhere.
    //
    // Note the missing "noopener": passing it makes `window.open` return null
    // *by specification*, which would make every successful open look blocked.
    // Detaching the opener afterwards gets the same protection and still
    // leaves a handle to test.
    const opened = window.open(href, "_blank");
    if (opened) {
      opened.opener = null;
      setStatus("opened");
      return;
    }

    setStatus("error");
    setFormError(
      "Your browser blocked the new tab. Use the mail-app link below, or write to the address at the bottom of this panel.",
    );
  }

  const busy = status === "opening";
  const mailtoHref = buildMailto({
    to: siteConfig.email,
    subject: values.subject || "Hello",
    body: composeBody(values),
  }).href;

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8">
      <div className="grid gap-5 sm:grid-cols-2">
        {FIELDS.map((field) => {
          const id = `${baseId}-${field.name}`;
          const error = errors[field.name];
          return (
            <div
              key={field.name}
              className={field.name === "subject" ? "sm:col-span-2" : undefined}
            >
              <label
                htmlFor={id}
                className="block font-mono text-[0.7rem] tracking-[0.1em] text-gold uppercase"
              >
                {field.label}
              </label>
              <input
                id={id}
                name={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                value={values[field.name]}
                onChange={(e) => set(field.name)(e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className={cn(
                  "mt-2 w-full rounded-[var(--radius-panel)] border bg-obsidian/55 px-4 py-3 text-[0.9375rem] text-warm-white",
                  "placeholder:text-muted/45 transition-colors",
                  error
                    ? "border-seal/80"
                    : "border-gold/22 hover:border-gold/45 focus:border-gold/70",
                )}
              />
              {error && (
                <p
                  id={`${id}-error`}
                  className="mt-1.5 text-[0.8125rem] text-seal-foreground"
                  style={{ color: "#E08A8A" }}
                >
                  {error}
                </p>
              )}
            </div>
          );
        })}

        <div className="sm:col-span-2">
          <label
            htmlFor={`${baseId}-message`}
            className="block font-mono text-[0.7rem] tracking-[0.1em] text-gold uppercase"
          >
            Message
          </label>
          <textarea
            id={`${baseId}-message`}
            name="message"
            rows={5}
            value={values.message}
            onChange={(e) => set("message")(e.target.value)}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={
              errors.message ? `${baseId}-message-error` : undefined
            }
            className={cn(
              "mt-2 w-full resize-y rounded-[var(--radius-panel)] border bg-obsidian/55 px-4 py-3 text-[0.9375rem] text-warm-white",
              "placeholder:text-muted/45 transition-colors",
              errors.message
                ? "border-seal/80"
                : "border-gold/22 hover:border-gold/45 focus:border-gold/70",
            )}
          />
          {errors.message && (
            <p
              id={`${baseId}-message-error`}
              className="mt-1.5 text-[0.8125rem]"
              style={{ color: "#E08A8A" }}
            >
              {errors.message}
            </p>
          )}
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-5">
        <MagicalButton type="submit" aria-disabled={busy}>
          {busy ? (
            <Loader2 size={16} aria-hidden className="animate-spin" />
          ) : (
            <Send size={16} aria-hidden />
          )}
          Send via Gmail
        </MagicalButton>

        <div className="max-w-[34ch] text-[0.8125rem] leading-relaxed text-muted/80">
          <p>
            This opens Gmail in a new tab with the message ready. Nothing is
            stored on this site.
          </p>
          <a
            href={mailtoHref}
            className="mt-1 inline-block text-muted underline underline-offset-2 transition-colors hover:text-gold-light"
          >
            Prefer your own mail app?
          </a>
        </div>
      </div>

      {/* Status is announced, and the confirmation only ever appears after the
          handover has been attempted — never optimistically. */}
      <div role="status" aria-live="polite" className="mt-6 empty:mt-0">
        {status === "opened" && (
          <p className="flex items-start gap-3 rounded-[var(--radius-panel)] border border-gold/30 bg-gold/8 px-4 py-3 text-[0.875rem] text-parchment">
            <span aria-hidden className="mt-0.5 text-gold-light">
              ✉
            </span>
            <span>
              {SENT_COPY}{" "}
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-gold-light underline underline-offset-2"
              >
                {siteConfig.email}
              </a>
              .
            </span>
          </p>
        )}
        {formError && (
          <p
            className="rounded-[var(--radius-panel)] border border-seal/60 bg-seal/15 px-4 py-3 text-[0.875rem]"
            style={{ color: "#F0BDBD" }}
          >
            {formError}
          </p>
        )}
      </div>
    </form>
  );
}
